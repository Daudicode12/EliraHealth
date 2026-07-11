import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const url = (process.env.TURSO_CONNECTION_URL || process.env.TURSO_DATABASE_URL).split('?')[0];
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('Missing TURSO URL');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  try {
    console.log('Adding password_hash column...');
    await client.execute(`ALTER TABLE profiles ADD COLUMN password_hash TEXT`);
    console.log('password_hash column added.');
  } catch (e) {
    console.log('password_hash might already exist:', e.message);
  }

  try {
    console.log('Adding status column...');
    await client.execute(`ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active'`);
    console.log('status column added.');
  } catch (e) {
    console.log('status might already exist:', e.message);
  }

  console.log('Schema update complete.');
}

main();
