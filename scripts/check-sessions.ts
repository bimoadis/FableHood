import { db } from '../src/db/index';
import { walletSessions } from '../src/db/schema';

async function main() {
  console.log('🔍 Checking wallet_sessions in database...');
  try {
    const sessions = await db.select().from(walletSessions);
    console.log(`Total sessions found: ${sessions.length}`);
    sessions.forEach(s => {
      console.log(`- ID: ${s.id}, Address: ${s.address}, Active: ${s.active}, Nonce: ${s.nonce}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    process.exit(1);
  }
}

main();
