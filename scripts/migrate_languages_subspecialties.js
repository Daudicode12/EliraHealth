const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if any
      value = value.replace(/^["']|["']$/g, '').trim();
      process.env[key] = value;
    }
  });
}

async function run() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('Error: TURSO_DATABASE_URL not found in env.');
    process.exit(1);
  }

  console.log('Connecting to Turso...');
  const client = createClient({ url, authToken });

  try {
    console.log('Adding column "languages" to experts table...');
    await client.execute("ALTER TABLE experts ADD COLUMN languages TEXT DEFAULT '[]'");
    console.log('Successfully added "languages" column.');
  } catch (e) {
    if (e.message.includes('duplicate column') || e.message.includes('already exists') || e.message.includes('duplicate')) {
      console.log('"languages" column already exists.');
    } else {
      console.error('Error adding languages:', e.message);
    }
  }

  try {
    console.log('Adding column "sub_specialties" to experts table...');
    await client.execute("ALTER TABLE experts ADD COLUMN sub_specialties TEXT DEFAULT '[]'");
    console.log('Successfully added "sub_specialties" column.');
  } catch (e) {
    if (e.message.includes('duplicate column') || e.message.includes('already exists') || e.message.includes('duplicate')) {
      console.log('"sub_specialties" column already exists.');
    } else {
      console.error('Error adding sub_specialties:', e.message);
    }
  }

  await client.close();
  console.log('Migration finished.');
}

run();
