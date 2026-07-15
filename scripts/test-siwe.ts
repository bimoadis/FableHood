import { GET } from '../src/app/api/auth/nonce/route';
import { POST } from '../src/app/api/auth/verify/route';
import { NextRequest } from 'next/server';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

// Load environment variables for Drizzle connection in test script
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
  console.log('🏁 Starting SIWE authentication verification test...');

  try {
    // 1. Generate a mock local EVM wallet account
    const pkey = generatePrivateKey();
    const account = privateKeyToAccount(pkey);
    const mockAddress = account.address;
    console.log('↳ Mock Account generated:', mockAddress);

    // 2. Simulate GET /api/auth/nonce call
    console.log('↳ Fetching nonce from GET /api/auth/nonce...');
    const nonceRes = await GET();
    const nonceData = await nonceRes.json();
    const { sessionId, nonce } = nonceData;
    console.log(`↳ Received Nonce: "${nonce}", Session ID: "${sessionId}"`);

    if (!nonce || !sessionId) {
      throw new Error('Failed to retrieve nonce or sessionId from nonce route');
    }

    // 3. Construct SIWE message
    const domain = 'fablehood.html';
    const message = `${domain} wants you to sign in with your Ethereum account:
Address: ${mockAddress}

URI: http://localhost:3000
Version: 1
Chain ID: 4663
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

    // 4. Sign the SIWE message using mock account private key
    console.log('↳ Signing SIWE message with mock private key...');
    const signature = await account.signMessage({ message });
    console.log('↳ Signature generated:', signature);

    // 5. Simulate POST /api/auth/verify call (First Attempt - Expect Success)
    console.log('↳ Sending verify request to POST /api/auth/verify...');
    const verifyReq = new NextRequest('http://localhost/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        signature,
        sessionId
      })
    });

    const verifyRes = await POST(verifyReq);
    const verifyData = await verifyRes.json();
    console.log('↳ Verify Response:', verifyData);

    if (verifyRes.status !== 200 || !verifyData.success) {
      throw new Error(`Verification failed. Status: ${verifyRes.status}, Error: ${verifyData.error}`);
    }
    console.log('✅ First SIWE verification passed successfully!');

    // 6. Simulate Replay Attack (Second Attempt - Expect Failure)
    console.log('↳ Testing Replay Attack protection (attempting verification reuse)...');
    const replayReq = new NextRequest('http://localhost/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        signature,
        sessionId
      })
    });

    const replayRes = await POST(replayReq);
    const replayData = await replayRes.json();
    console.log(`↳ Replay Response (Expected Error): Status: ${replayRes.status}, Msg: "${replayData.error}"`);

    if (replayRes.status === 200) {
      throw new Error('REPLAY ATTACK FAILURE: Server allowed reusing the same signature/session!');
    }
    
    console.log('✅ Replay attack rejected successfully! (Anti-replay working)');
    console.log('🎉 Phase 3 SIWE Authentication logic verified 100% successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Authentication verification test failed:', error);
    process.exit(1);
  }
}

runTest();
