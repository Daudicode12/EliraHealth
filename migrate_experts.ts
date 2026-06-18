import { executeAction, executeBatch } from './src/lib/db/client';

async function migrate() {
  console.log('Starting migration...');
  try {
    // 1. Add new columns if they don't exist
    // license_number is essentially credentials, but we'll add it and copy data if needed
    // SQLite doesn't have "ADD COLUMN IF NOT EXISTS" in older versions, 
    // but we can try and catch.
    
    const columnsToAdd = [
      "ALTER TABLE experts ADD COLUMN license_number TEXT",
      "ALTER TABLE experts ADD COLUMN medical_council_number TEXT",
      "ALTER TABLE experts ADD COLUMN practicing_certificate_url TEXT",
      "ALTER TABLE experts ADD COLUMN hospital_name TEXT",
      "ALTER TABLE experts ADD COLUMN verification_status TEXT DEFAULT 'pending'",
      "ALTER TABLE experts ADD COLUMN verified_at TEXT",
      "ALTER TABLE experts ADD COLUMN verified_by TEXT",
      "ALTER TABLE experts ADD COLUMN rejection_reason TEXT",
      "ALTER TABLE experts ADD COLUMN admin_notes TEXT"
    ];

    for (const sql of columnsToAdd) {
      try {
        await executeAction(sql);
        console.log(`Executed: ${sql}`);
      } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
          console.log(`Column already exists, skipping: ${sql.split('ADD COLUMN ')[1]}`);
        } else {
          console.warn(`Error executing ${sql}:`, e.message);
        }
      }
    }

    // 2. Migrate data from is_verified to verification_status if verification_status is still default
    // and is_verified exists
    try {
      await executeAction("UPDATE experts SET verification_status = 'approved' WHERE is_verified = 1 AND verification_status = 'pending'");
      await executeAction("UPDATE experts SET verification_status = 'pending' WHERE is_verified = 0 AND verification_status = 'pending'");
      console.log('Migrated is_verified data to verification_status');
    } catch (e: any) {
      console.log('is_verified column might not exist or already migrated');
    }

    // 3. Migrate credentials to license_number if license_number is null
    try {
      await executeAction("UPDATE experts SET license_number = credentials WHERE license_number IS NULL AND credentials IS NOT NULL");
      console.log('Migrated credentials to license_number');
    } catch (e: any) {
      console.log('credentials column might not exist');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
