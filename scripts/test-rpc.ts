import { RobinhoodChainClient } from '../src/lib/blockchain/client';

async function runTest() {
  console.log('🏁 Starting Robinhood L2 RPC Sandbox & Fallback verification test...');

  try {
    // 1. Set environment overrides to test Fallback rotation programmatically
    // We insert a dead host first, and place the correct RPC as fallback
    const correctRpc = 'https://rpc.robinhoodchain.com';
    process.env.NEXT_PUBLIC_L2_RPC_URL = 'https://dead-rpc-node-test-12345.invalid';
    process.env.NEXT_PUBLIC_L2_FALLBACK_RPC_URLS = `https://another-dead-node.invalid, ${correctRpc}`;

    console.log('Instantiating RobinhoodChainClient...');
    const client = new RobinhoodChainClient();

    // 2. Test Fallback Rotation during Bytecode retrieval
    console.log('↳ Fetching bytecode for a target address (should trigger fallback rotation)...');
    const mockAddress = '0x1234567890123456789012345678901234567890';
    const bytecode = await client.getCode(mockAddress);
    
    console.log('↳ Bytecode retrieved length:', bytecode.length);
    console.log('✅ Fallback rotation successfully recovered connection!');

    // 3. Test Honeypot Sandbox exception (mock check for addresses ending in '000')
    const honeypotAddress = '0x1234567890123456789012345678901234567000';
    console.log(`↳ Scanning honeypot simulator address: ${honeypotAddress}...`);
    
    const scanResult = await client.simulateCall(honeypotAddress, '0x0902f1ac');
    console.log('↳ Simulation Response:', scanResult);

    if (scanResult.success) {
      throw new Error('SANDBOX EXCEPTION FAILURE: Honeypot address did not revert!');
    }

    if (scanResult.revertReason !== 'HONEYPOT_DETECTED_TRANSFER_BLOCKED') {
      throw new Error(`Unexpected revert reason: ${scanResult.revertReason}`);
    }

    console.log('✅ Honeypot Sandbox reverted with correct reason:', scanResult.revertReason);
    console.log('🎉 Phase 4 L2 RPC Client and Sandbox logic verified 100% successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ RPC Verification test failed:', error);
    process.exit(1);
  }
}

runTest();
