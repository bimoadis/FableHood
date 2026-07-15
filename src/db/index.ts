import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fablehood';

// Disable prefetch to support Supabase connection pooling (pgbouncer/direct)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
