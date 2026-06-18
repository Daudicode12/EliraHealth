import { executeAction } from './src/lib/db/client';

async function migrateAppointments() {
  console.log('Starting Appointments Module migration...');
  try {
    // Create appointments table
    // Note: We use profiles(id) for patient_id and booked_by, and experts(id) for specialist_id
    // to integrate seamlessly with the existing Elira Health architecture.
    const createAppointments = `
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        patient_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        specialist_id TEXT NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        reason_for_visit TEXT,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED')),
        booked_by TEXT NOT NULL REFERENCES profiles(id),
        created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `;
    await executeAction(createAppointments);
    console.log('Created appointments table successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateAppointments();
