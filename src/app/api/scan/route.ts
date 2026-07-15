import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/db';
import { scans, walletProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { RobinhoodChainClient } from '@/lib/blockchain/client';
import { verifyFoodGating } from '@/lib/blockchain/gating';
import { redis } from '@/lib/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Upstash rate limiter if redis client is active
const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'fablehood:ratelimit',
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { contractAddress, walletAddress, forceScan } = body;

    // 1. Input Sanitization
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const rawWalletAddress = walletAddress.trim();
    const isSolana = !rawWalletAddress.startsWith('0x');
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

    const isValidWallet = isSolana ? solanaRegex.test(rawWalletAddress) : evmRegex.test(rawWalletAddress);
    if (!isValidWallet) {
      return NextResponse.json(
        { error: 'Invalid EVM or Solana wallet address format' },
        { status: 400 }
      );
    }

    const cleanWalletAddress = isSolana ? rawWalletAddress : rawWalletAddress.toLowerCase();

    // Profile query when contractAddress is omitted
    if (!contractAddress) {
      let profile = await db
        .select()
        .from(walletProfiles)
        .where(eq(walletProfiles.address, cleanWalletAddress))
        .then(res => res[0]);

      if (!profile) {
        const [newProfile] = await db
          .insert(walletProfiles)
          .values({
            address: cleanWalletAddress,
            freeScansUsed: 0
          })
          .returning();
        profile = newProfile;
      }
      
      const gating = await verifyFoodGating(cleanWalletAddress);
      const freeScansLeft = Math.max(0, 3 - profile.freeScansUsed);
      return NextResponse.json({
        walletAddress: cleanWalletAddress,
        freeScansLeft,
        freeSpins: profile.freeSpins,
        balanceEth: gating.balanceEth,
        hasAccess: gating.hasAccess
      });
    }

    const cleanContractAddress = contractAddress.trim().toLowerCase();
    if (!evmRegex.test(cleanContractAddress)) {
      return NextResponse.json(
        { error: 'Invalid EVM contract address format' },
        { status: 400 }
      );
    }

    // 2. Upstash Rate Limiting
    if (ratelimit || (global as any).MOCK_RATE_LIMITER) {
      let success = true;
      if ((global as any).MOCK_RATE_LIMITER) {
        success = (global as any).MOCK_RATE_LIMITER_CHECK();
      } else if (ratelimit) {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const identifier = `${cleanWalletAddress}:${ip}`;
        const limitRes = await ratelimit.limit(identifier);
        success = limitRes.success;
      }

      if (!success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Maximum 5 requests per minute allowed.' },
          { status: 429 }
        );
      }
    }

    // 3. Token Gating & Free Trial Checks
    let profile = await db
      .select()
      .from(walletProfiles)
      .where(eq(walletProfiles.address, cleanWalletAddress))
      .then(res => res[0]);

    if (!profile) {
      const [newProfile] = await db
        .insert(walletProfiles)
        .values({
          address: cleanWalletAddress,
          freeScansUsed: 0
        })
        .returning();
      profile = newProfile;
    }

    const freeScansLeft = Math.max(0, 3 - profile.freeScansUsed);
    const hasFreeScans = freeScansLeft > 0;

    const gating = await verifyFoodGating(cleanWalletAddress);
    const isAllowed = gating.hasAccess || hasFreeScans;

    if (!isAllowed) {
      return NextResponse.json(
        { 
          error: 'Access blocked: Insufficient balance and no free trials left. Gating requires at least 0.0005 ETH.',
          balance: gating.balanceEth,
          freeScansLeft: 0
        },
        { status: 402 } // Payment Required
      );
    }

    // 4. Cache Check (15 minutes TTL) - Skipped if forceScan is true
    if (!forceScan) {
      const cachedScan = await db
        .select()
        .from(scans)
        .where(eq(scans.address, cleanContractAddress));

      if (cachedScan.length > 0) {
        const scan = cachedScan[0];
        const scannedAtTime = scan.scannedAt ? new Date(scan.scannedAt).getTime() : Date.now();
        const ageMs = Date.now() - scannedAtTime;
        const fifteenMinutesMs = 15 * 60 * 1000;
        
        if (ageMs < fifteenMinutesMs) {
          console.log(`ℹ️ [Cache Hit] Returning cached scan for contract: ${cleanContractAddress}`);
          if (!gating.hasAccess) {
            await db
              .update(walletProfiles)
              .set({ freeScansUsed: profile.freeScansUsed + 1 })
              .where(eq(walletProfiles.address, cleanWalletAddress));
          }
          return NextResponse.json({
            ...scan,
            cached: true,
            freeScansLeft: Math.max(0, freeScansLeft - 1)
          });
        }
      }
    }

    // 4. Retrieve contract bytecode via L2 RPC Client
    const client = new RobinhoodChainClient();
    const bytecode = await client.getCode(cleanContractAddress);



    // 5. Invoke Anthropic Claude model via MIMO Proxy
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder_key',
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
      defaultHeaders: {
        'api-key': process.env.ANTHROPIC_API_KEY || 'placeholder_key',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || 'placeholder_key'}`,
      },
    });

    const modelName = process.env.ANTHROPIC_MODEL || 'mimo-v2.5-pro';
    let auditResult: any;

    console.log(`🧠 [Claude AI Audit] Invoking ${modelName} via proxy...`);
    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 800,
      system: `You are Fable Hood's elite smart contract security auditor. Analyze the contract bytecode and details, and return a strict, raw JSON output without backticks or markdown formatting.
The JSON must adhere EXACTLY to this schema:
{
  "name": "Token Name",
  "symbol": "TOKEN_SYMBOL",
  "trustScore": number, // integer between 0 and 100
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "verdict": "A concise overview of the security state of the token",
  "findings": [
    "[Category] Description of finding (Risk status)"
  ]
}

The 'findings' array MUST include exactly four items, each representing one of these mandatory categories:
- [Liquidity Pool]: Analysis of the liquidity pool lock status, depth, or burning.
- [Authority Control]: Analysis of ownership renouncement, administrator permissions, and key control.
- [Tax & Honeypot]: Analysis of transaction taxes (buy/sell fee percentage) and blacklisting capabilities.
- [Bytecode Integrity]: Evaluation of proxy contracts, known code exploits, and structural layout.

Example response:
{"name":"Fable Gold","symbol":"GOLD","trustScore":95,"riskLevel":"SAFE","verdict":"Clean footprint with standard verification","findings":["[Liquidity Pool] 99% of LP tokens burned or locked permanently (Safe)","[Authority Control] Contract ownership is renounced, no administrative backdoors (Safe)","[Tax & Honeypot] Buy tax is 0% and sell tax is 0% with no blacklist methods found (Safe)","[Bytecode Integrity] Standard ERC-20 implementation, no proxy pattern or vulnerabilities detected (Safe)"]}`,
      messages: [
        {
          role: 'user',
          content: `Contract Address: ${cleanContractAddress}\nBytecode Context: ${bytecode.substring(0, 1000)}`
        }
      ]
    });

    const rawText = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('');

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON response format returned by AI proxy');
    }
    auditResult = JSON.parse(jsonMatch[0]);

    // 6. Cache the audit result back in the scans table
    await db.insert(scans).values({
      address: cleanContractAddress,
      name: auditResult.name,
      symbol: auditResult.symbol,
      trustScore: auditResult.trustScore,
      riskLevel: auditResult.riskLevel,
      verdict: auditResult.verdict,
      findings: auditResult.findings,
      scanData: { bytecode }
    }).onConflictDoUpdate({
      target: scans.address,
      set: {
        name: auditResult.name,
        symbol: auditResult.symbol,
        trustScore: auditResult.trustScore,
        riskLevel: auditResult.riskLevel,
        verdict: auditResult.verdict,
        findings: auditResult.findings,
        scanData: { bytecode },
        scannedAt: new Date()
      }
    });

    if (!gating.hasAccess) {
      await db
        .update(walletProfiles)
        .set({ freeScansUsed: profile.freeScansUsed + 1 })
        .where(eq(walletProfiles.address, cleanWalletAddress));
    }

    return NextResponse.json({
      address: cleanContractAddress,
      ...auditResult,
      cached: false,
      freeScansLeft: Math.max(0, freeScansLeft - 1)
    });
  } catch (error: any) {
    console.error('Scan audit processing error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during contract scan' },
      { status: 500 }
    );
  }
}
