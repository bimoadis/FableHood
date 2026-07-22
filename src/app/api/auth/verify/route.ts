import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletProfiles, walletSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyMessage as verifyEvmMessage } from 'viem';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, signature, sessionId } = body;

    if (!message || !signature || !sessionId) {
      return NextResponse.json(
        { error: 'Message, signature, and sessionId are required' },
        { status: 400 }
      );
    }

    // 1. Retrieve the cached session record
    const sessionRecords = await db
      .select()
      .from(walletSessions)
      .where(eq(walletSessions.id, sessionId));
    const session = sessionRecords[0];

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 400 });
    }

    if (session.active) {
      return NextResponse.json({ error: 'Session already activated (Replay blocked)' }, { status: 400 });
    }

    if (new Date() > new Date(session.expiresAt)) {
      return NextResponse.json({ error: 'Session/nonce expired' }, { status: 400 });
    }

    const evmMatch = message.match(/(?:Address:\s*)?(0x[a-fA-F0-9]{40})/i);
    const solanaMatch = message.match(/(?:Address:\s*)?([1-9A-HJ-NP-Za-km-z]{32,44})/i);

    const address = evmMatch?.[1] || solanaMatch?.[1];
    const nonceMatch = message.match(/Nonce:\s*([a-zA-Z0-9]+)/i);
    const nonce = nonceMatch?.[1];

    if (!address || !nonce) {
      return NextResponse.json({ error: 'Invalid SIWE message structure' }, { status: 400 });
    }

    // Verify nonce matches database
    if (nonce !== session.nonce) {
      return NextResponse.json({ error: 'Cryptographic nonce mismatch' }, { status: 400 });
    }

    const isSolana = !address.startsWith('0x');
    let isValid = false;

    // 3. Verify signature
    if (isSolana) {
      try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(address);
        isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      } catch (err) {
        console.error('Solana verification error:', err);
      }
    } else {
      isValid = await verifyEvmMessage({
        address: address as `0x${string}`,
        message,
        signature,
      });
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    const cleanAddress = isSolana ? address : address.toLowerCase();

    // 4. Provision wallet profile (upsert on conflict do nothing)
    await db
      .insert(walletProfiles)
      .values({
        address: cleanAddress,
        trust: '1.0',
        txCount: 0,
      })
      .onConflictDoNothing();

    // 5. Activate session & bind it to the authenticated address
    await db
      .update(walletSessions)
      .set({
        address: cleanAddress,
        active: true,
      })
      .where(eq(walletSessions.id, sessionId));

    // Fetch balance on server side to avoid client CORS restrictions
    let balanceSol = '0.0000';
    if (isSolana) {
      try {
        const rpcUrl = process.env.HELIUS_API_KEY || 'https://api.mainnet-beta.solana.com';
        const balRes = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [cleanAddress]
          })
        });
        const balData = await balRes.json();
        const balanceLamports = BigInt(balData.result?.value || 0);
        balanceSol = (Number(balanceLamports) / 1e9).toFixed(4);
      } catch (err) {
        console.error('Error fetching Solana balance on server verify:', err);
      }
    }

    return NextResponse.json({
      success: true,
      address: cleanAddress,
      sessionId: session.id,
      balance: balanceSol
    });
  } catch (error: any) {
    console.error('Error verifying auth signature:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
