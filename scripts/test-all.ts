import { execSync } from 'child_process';

console.log('🛡️  Fable Hood Security Audit & Forensic Hardening Suite  🛡️');
console.log('===========================================================');
console.log('Running all programmatic integration tests sequentially...\n');

const testScripts = [
  { name: 'Phase 3: SIWE Replay-Resistance Auth', command: 'npx tsx scripts/test-siwe.ts' },
  { name: 'Phase 4: L2 Sandbox RPC Node Fallbacks', command: 'npx tsx scripts/test-rpc.ts' },
  { name: 'Phase 5: x402 Token Gating & Payment SLA', command: 'npx tsx scripts/test-gating.ts' },
  { name: 'Phase 6: Anthropic Claude Cognitive Audit API', command: 'npx tsx scripts/test-scan.ts' },
  { name: 'Phase 7: Caching & Upstash Rate Limiting', command: 'npx tsx scripts/test-rate-limit.ts' }
];

let failed = false;

testScripts.forEach((suite) => {
  console.log(`\n-----------------------------------------------------------`);
  console.log(`🚀 Executing: ${suite.name}`);
  console.log(`-----------------------------------------------------------`);
  try {
    const stdout = execSync(suite.command, { encoding: 'utf-8', stdio: 'inherit' });
    console.log(`\n✅ ${suite.name} PASSED.`);
  } catch (error: any) {
    console.error(`\n❌ ${suite.name} FAILED.`);
    failed = true;
  }
});

console.log('\n===========================================================');
if (failed) {
  console.error('❌ Forensic hardening test run completed with errors.');
  process.exit(1);
} else {
  console.log('🎉 All 5 integration test suites PASSED successfully!');
  console.log('🛡️  Fable Hood codebase is hardened and certified for deployment.');
  process.exit(0);
}
