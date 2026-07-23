const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  try {
    const res = await client.execute("PRAGMA table_info(notifications)");
    console.log(res.rows);
    
    // Add action_url column if missing
    const hasActionUrl = res.rows.some(r => r.name === 'action_url');
    const hasActionLink = res.rows.some(r => r.name === 'action_link');
    
    console.log({ hasActionUrl, hasActionLink });
    
    if (!hasActionUrl) {
      if (hasActionLink) {
         console.log("Renaming column or adding action_url...");
         await client.execute("ALTER TABLE notifications ADD COLUMN action_url TEXT");
      } else {
         console.log("Adding action_url column...");
         await client.execute("ALTER TABLE notifications ADD COLUMN action_url TEXT");
      }
      console.log("Column added successfully!");
    }
  } catch (e) {
    console.error(e);
  }
}
run();
