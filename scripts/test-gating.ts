import { verifyFoodGating, executeMicroPayment } from '../src/lib/blockchain/gating';
import { generatePrivateKey } from 'viem/accounts';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
  console.log('🏁 Starting x402 Token Gating & Payment SLA verification test...');

  try {
    // 1. Verify Gating Check on a fresh address (should have 0 ETH, thus failed access)
    const freshAddress = '0x1516d9400E0fFc1A0b9517B726e251177d4C1d8b';
    console.log(`↳ Checking gating for fresh address: ${freshAddress}...`);
    
    const gatingResult = await verifyFoodGating(freshAddress);
    console.log('↳ Gating Result:', gatingResult);

    if (gatingResult.hasAccess) {
      throw new Error('GATING FAILURE: Fresh address with 0 balance was granted access!');
    }
    console.log('✅ Balance gating check correctly rejected the insufficient address.');

    // 2. Simulate Micro-Payment Execution
    const pkey = generatePrivateKey();
    console.log('↳ Generating mock private key for micro-payment test...');
    
    const paymentResult = await executeMicroPayment(pkey, (msg) => {
      console.log(`   [Payment Progress]: ${msg}`);
    });

    console.log('↳ Payment Result:', paymentResult);

    if (!paymentResult.success || !paymentResult.txHash) {
      throw new Error('PAYMENT FAILURE: Micro-payment processing failed!');
    }

    console.log('✅ Micro-payment process completed successfully!');
    console.log('🎉 Phase 5 gating and micro-payments verified 100% successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gating Verification test failed:', error);
    process.exit(1);
  }
}

runTest();
