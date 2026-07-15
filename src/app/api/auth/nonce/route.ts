import { NextResponse } from 'next/server';
import { db } from '@/db';
import { walletSessions } from '@/db/schema';
import * as crypto from 'crypto';

export async function GET() {
  try {
    // Generate secure cryptographically random 16-character hex nonce
    const nonce = crypto.randomBytes(8).toString('hex');
    
    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save session payload with active=false and null address (no FK violation)
    const newSession = await db.insert(walletSessions).values({
      nonce,
      expiresAt,
      active: false
    }).returning();

    const session = newSession[0];
    if (!session) {
      throw new Error('Failed to create login session record');
    }

    return NextResponse.json({
      sessionId: session.id,
      nonce: session.nonce
    });
  } catch (error: any) {
    console.error('Error generating auth nonce:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate cryptographic nonce' },
      { status: 500 }
    );
  }
}
