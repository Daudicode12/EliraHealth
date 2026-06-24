import { config } from 'dotenv';
config({ path: '.env.local' });
import { getTursoClient } from './src/lib/db/client';

async function createNotificationsTable() {
  const client = getTursoClient();
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Notifications table created successfully.');
  } catch (error) {
    console.error('Error creating notifications table:', error);
  }
}

createNotificationsTable();
