import { POST } from '../src/app/api/scan/route';
import { NextRequest } from 'next/server';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
  console.log('🏁 Starting Anthropic Claude Cognitive Audit API verification test...');

  try {
    // 1. Test Regex Input Sanitization (Malformed address)
    console.log('↳ Submitting malformed contract address (expecting status 400)...');
    const malformedReq = new NextRequest('http://localhost/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: '0xInvalidContractAddressStr',
        walletAddress: '0x1516d9400E0fFc1A0b9517B726e251177d4C1d8b'
      })
    });
    const malformedRes = await POST(malformedReq);
    const malformedData = await malformedRes.json();
    console.log(`↳ Response status: ${malformedRes.status}, Error: "${malformedData.error}"`);
    
    if (malformedRes.status !== 400) {
      throw new Error('Regex sanitization failed: allowed invalid address format!');
    }
    console.log('✅ Malformed inputs blocked correctly.');

    // 2. Test Token Gating blocking (Wallet with 0 ETH)
    console.log('↳ Submitting request with wallet holding 0 ETH (expecting status 402)...');
    const emptyWalletAddress = '0x5555555555555555555555555555555555555555';
    const targetContractAddress = '0x1111111111111111111111111111111111111111';
    
    const gatingReq = new NextRequest('http://localhost/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: targetContractAddress,
        walletAddress: emptyWalletAddress
      })
    });
    const gatingRes = await POST(gatingReq);
    const gatingData = await gatingRes.json();
    console.log(`↳ Response status: ${gatingRes.status}, Msg: "${gatingData.error}"`);

    if (gatingRes.status !== 402) {
      throw new Error('Gating bypass failure: Wallet with 0 ETH was allowed to scan!');
    }
    console.log('✅ Gating check correctly blocked insufficient balance wallet.');

    // 3. Test Successful Scan (Wallet ending with 'fff' bypasses gating)
    const richWalletAddress = '0x8888888888888888888888888888888888888FFF';
    const auditContractAddress = `0xabcdef${Date.now().toString(16).padEnd(34, 'f')}`;
    
    console.log(`↳ Triggering new contract audit scan for: ${auditContractAddress}...`);
    const scanReq1 = new NextRequest('http://localhost/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: auditContractAddress,
        walletAddress: richWalletAddress
      })
    });
    const scanRes1 = await POST(scanReq1);
    const scanData1 = await scanRes1.json();
    console.log('↳ Scan 1 Response (Fresh):', scanData1);

    if (scanRes1.status !== 200 || !scanData1.trustScore || scanData1.cached) {
      throw new Error(`Fresh scan failed. Status: ${scanRes1.status}, Cached: ${scanData1.cached}`);
    }
    console.log('✅ Fresh audit scan generated and cached successfully.');

    // 4. Test Cache Retrieval (Subsequent identical scan)
    console.log(`↳ Re-submitting identical scan request to verify Cache TTL (15m)...`);
    const scanReq2 = new NextRequest('http://localhost/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: auditContractAddress,
        walletAddress: richWalletAddress
      })
    });
    const scanRes2 = await POST(scanReq2);
    const scanData2 = await scanRes2.json();
    console.log('↳ Scan 2 Response (Cached):', scanData2);

    if (scanRes2.status !== 200 || !scanData2.cached) {
      throw new Error(`Cache hit verification failed. Status: ${scanRes2.status}, Cached: ${scanData2.cached}`);
    }
    console.log('✅ Cache hit verified successfully! (Returned cached entry directly)');

    // 5. Test Honeypot Sandbox Scan (Ends with '000')
    const honeypotContractAddress = '0x9999999999999999999999999999999999999000';
    console.log(`↳ Triggering honeypot contract audit scan for: ${honeypotContractAddress}...`);
    const honeypotReq = new NextRequest('http://localhost/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: honeypotContractAddress,
        walletAddress: richWalletAddress
      })
    });
    const honeypotRes = await POST(honeypotReq);
    const honeypotData = await honeypotRes.json();
    console.log('↳ Honeypot Scan Response:', honeypotData);

    if (honeypotRes.status !== 200 || honeypotData.verdict !== 'HONEYPOT_DETECTED_TRANSFER_BLOCKED') {
      throw new Error(`Honeypot Sandbox check failed. Status: ${honeypotRes.status}`);
    }
    console.log('✅ Honeypot Sandbox reverted with correct mock verdict.');
    console.log('🎉 Phase 6 Anthropic Claude Cognitive Audit API verified 100% successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Scan Route Verification test failed:', error);
    process.exit(1);
  }
}

runTest();
