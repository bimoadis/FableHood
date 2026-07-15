import './preload-env';

// Set up the global mock rate limiter variables for clean testing
let mockRequestCount = 0;
(global as any).MOCK_RATE_LIMITER = true;
(global as any).MOCK_RATE_LIMITER_CHECK = () => {
  mockRequestCount++;
  return mockRequestCount <= 5;
};

console.log('✅ [Mock Rate Limiter] Enabled global rate limit simulation (max 5 requests).');

// Now import route handler and NextRequest
import { POST } from '../src/app/api/scan/route';
import { NextRequest } from 'next/server';

// Load environment variables for other integrations
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
  console.log('🏁 Starting Caching & Rate-Limiting Security Layer verification test...');

  try {
    const richWalletAddress = '0x8888888888888888888888888888888888888FFF';
    const auditContractAddress = `0xabcdef${Date.now().toString(16).padEnd(34, 'e')}`;

    // 1. Spam the endpoint 7 times in a row (limit is 5 requests per minute)
    console.log('↳ Spamming scan request 7 times to verify rate limiting...');

    for (let i = 1; i <= 7; i++) {
      const req = new NextRequest('http://localhost/api/scan', {
        method: 'POST',
        body: JSON.stringify({
          contractAddress: auditContractAddress,
          walletAddress: richWalletAddress
        })
      });

      const res = await POST(req);
      const data = await res.json();
      console.log(`   [Scan Request ${i}]: Status: ${res.status}, Msg: "${data.error || 'SUCCESS'}"`);

      if (i <= 5) {
        if (res.status !== 200) {
          throw new Error(`Request ${i} failed unexpectedly with status ${res.status}`);
        }
      } else {
        if (res.status !== 429) {
          throw new Error(`Rate limiting failed on request ${i}: expected status 429, got ${res.status}`);
        }
      }
    }
    console.log('✅ Rate limiting correctly blocked requests after the 5th scan (HTTP 429).');

    // 2. Test Force Re-scan Cache Bypass
    // Reset request count to bypass rate limiter for this check
    mockRequestCount = 0; 
    console.log('↳ Triggering scan with forceScan: true to verify cache bypass...');
    
    // First, scan normally to cache the contract
    const freshAddress = `0xbcde${Date.now().toString(16).padEnd(36, 'e')}`;
    const scanReq1 = new NextRequest('http://localhost/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: freshAddress,
        walletAddress: richWalletAddress
      })
    });
    const scanRes1 = await POST(scanReq1);
    const scanData1 = await scanRes1.json();
    console.log(`   [Normal Scan (Fresh)]: Cached: ${scanData1.cached}`);

    if (scanData1.cached) {
      throw new Error('Initial scan was unexpectedly returned from cache!');
    }

    // Now, scan with forceScan: true (should execute live scan, thus returning cached: false)
    const scanReq2 = new NextRequest('http://localhost/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: freshAddress,
        walletAddress: richWalletAddress,
        forceScan: true
      })
    });
    const scanRes2 = await POST(scanReq2);
    const scanData2 = await scanRes2.json();
    console.log(`   [Force Scan (Bypass)]: Cached: ${scanData2.cached}`);

    if (scanData2.cached) {
      throw new Error('CACHE BYPASS FAILURE: forceScan was ignored and returned cached scan!');
    }

    console.log('✅ Cache bypass verified successfully! (forceScan ignored cache).');
    console.log('🎉 Phase 7 Caching & Rate-Limiting Security Layer verified 100% successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Caching & Rate Limiting Verification test failed:', error);
    process.exit(1);
  }
}

runTest();
