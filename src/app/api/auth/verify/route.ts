import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletProfiles, walletSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyMessage } from 'viem';

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

    // 2. Parse address and nonce from SIWE message
    // A standard SIWE message format contains lines like:
    // Address: 0x...
    // Nonce: abc...
    const addressMatch = message.match(/Address:\s*(0x[a-fA-F0-9]{40})/i);
    const nonceMatch = message.match(/Nonce:\s*([a-zA-Z0-9]+)/i);

    const address = addressMatch?.[1];
    const nonce = nonceMatch?.[1];

    if (!address || !nonce) {
      return NextResponse.json({ error: 'Invalid SIWE message structure' }, { status: 400 });
    }

    // Verify nonce matches database
    if (nonce !== session.nonce) {
      return NextResponse.json({ error: 'Cryptographic nonce mismatch' }, { status: 400 });
    }

    // 3. Verify signature using Viem (checks if address signed the exact message)
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    // 4. Provision wallet profile (upsert on conflict do nothing)
    await db
      .insert(walletProfiles)
      .values({
        address: address.toLowerCase(),
        trust: '1.0',
        txCount: 0,
      })
      .onConflictDoNothing();

    // 5. Activate session & bind it to the authenticated address
    await db
      .update(walletSessions)
      .set({
        address: address.toLowerCase(),
        active: true,
      })
      .where(eq(walletSessions.id, sessionId));

    return NextResponse.json({
      success: true,
      address: address.toLowerCase(),
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error verifying auth signature:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
