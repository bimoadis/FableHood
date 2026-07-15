import { db } from '../src/db/index';
import { scans, walletSessions, walletProfiles } from '../src/db/schema';

async function main() {
  console.log('🧹 Clearing all tables in the database...');
  try {
    await db.delete(scans);
    console.log('✅ Cleared scans table.');
    await db.delete(walletSessions);
    console.log('✅ Cleared walletSessions table.');
    await db.delete(walletProfiles);
    console.log('✅ Cleared walletProfiles table.');
    console.log('🎉 Database successfully cleared of all data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
}

main();
