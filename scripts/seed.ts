import { db } from '../src/db';
import { walletProfiles, walletSessions, scans } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🌱 Starting dry-run database verification test...');

  try {
    const mockAddress = '0x7xKpA2q93oWpL4sKmZrT5eYpWqFvNuDoubleEVM';
    
    console.log('Inserting mock wallet profile...');
    await db.insert(walletProfiles).values({
      address: mockAddress,
      txCount: 150,
      funderType: 'cex',
      reputationFlags: ['known_trader'],
      trust: '0.95',
    }).onConflictDoNothing();

    console.log('Inserting mock session with nonce...');
    const sessionResponse = await db.insert(walletSessions).values({
      address: mockAddress,
      nonce: 'secure_verification_nonce_123456',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    }).returning();
    const sessionId = sessionResponse[0]?.id;

    console.log('Inserting mock scan cache...');
    const mockToken = '0x1111111111111111111111111111111111111111';
    await db.insert(scans).values({
      address: mockToken,
      name: 'Mock Test Token',
      symbol: 'MTT',
      trustScore: 85,
      riskLevel: 'SAFE',
      verdict: 'Verifikasi model lolos sandbox.',
      findings: ['Verified smart contract structure', 'Locked pool settings detected'],
      scanData: { mock: true, status: 'pass' },
    }).onConflictDoNothing();

    console.log('Testing selection queries...');
    const profile = await db.select().from(walletProfiles).where(eq(walletProfiles.address, mockAddress));
    console.log('↳ Profile retrieved successfully:', profile[0]?.address);

    const session = await db.select().from(walletSessions).where(eq(walletSessions.id, sessionId));
    console.log('↳ Session retrieved successfully with nonce:', session[0]?.nonce);

    const scan = await db.select().from(scans).where(eq(scans.address, mockToken));
    console.log('↳ Scan retrieved successfully for symbol:', scan[0]?.symbol);

    console.log('✅ Database schema and queries verified successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database verification test failed:', error);
    process.exit(1);
  }
}

main();
