import { pgTable, text, integer, timestamp, numeric, boolean, uuid, jsonb } from 'drizzle-orm/pg-core';

export const walletProfiles = pgTable('wallet_profiles', {
  address: text('address').primaryKey(),
  firstTxTimestamp: timestamp('first_tx_timestamp'),
  txCount: integer('tx_count').default(0),
  funderType: text('funder_type').default('unknown'),
  reputationFlags: text('reputation_flags').array().default([]),
  launches: integer('launches').default(0),
  deadUnder10m: integer('dead_under_10m').default(0),
  avgExtractionSol: numeric('avg_extraction_sol').default('0'),
  fundedSnipers: integer('funded_snipers').default(0),
  trust: numeric('trust').default('1.0'),
  freeScansUsed: integer('free_scans_used').default(0).notNull(),
  freeSpins: integer('free_spins').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const walletSessions = pgTable('wallet_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  address: text('address').references(() => walletProfiles.address),
  nonce: text('nonce').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  tgChatId: text('tg_chat_id'),
  active: boolean('active').default(true)
});

export const scans = pgTable('scans', {
  address: text('address').primaryKey(), // EIP-55 Checksummed EVM contract address
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  trustScore: integer('trust_score').notNull(),
  riskLevel: text('risk_level').notNull(), // SAFE, LOW, MEDIUM, HIGH, CRITICAL
  verdict: text('verdict').notNull(),
  findings: text('findings').array().default([]),
  scanData: jsonb('scan_data'), // UAIM raw metadata JSON document
  scannedAt: timestamp('scanned_at').defaultNow()
});
