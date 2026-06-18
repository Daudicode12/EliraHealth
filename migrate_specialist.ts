import { executeAction } from './src/lib/db/client';

async function migrateSpecialist() {
  console.log('Starting Specialist Module migration...');
  try {
    // 1. Create Medical Records Table
    const createMedicalRecords = `
      CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        patient_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        specialist_id TEXT NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
        consultation_id TEXT REFERENCES consultations(id) ON DELETE SET NULL,
        diagnosis TEXT NOT NULL,
        treatment_plan TEXT,
        prescription TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `;
    await executeAction(createMedicalRecords);
    console.log('Created medical_records table');

    // 2. Add diagnosis to consultations if it doesn't exist
    try {
      await executeAction("ALTER TABLE consultations ADD COLUMN diagnosis TEXT");
      console.log("Added diagnosis column to consultations");
    } catch (e: any) {
      if (e.message.includes('duplicate column name')) {
        console.log("diagnosis column already exists in consultations");
      } else {
        console.warn("Error adding diagnosis column:", e.message);
      }
    }

    // 3. Create Patient-Specialist Assignments Table (Implicitly needed for "assigned patients" requirement)
    // In many healthcare apps, a consultation implies an assignment, but an explicit table is cleaner.
    const createAssignments = `
      CREATE TABLE IF NOT EXISTS patient_specialist_assignments (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        patient_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        specialist_id TEXT NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        assigned_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        UNIQUE(patient_id, specialist_id)
      )
    `;
    await executeAction(createAssignments);
    console.log('Created patient_specialist_assignments table');

    console.log('Specialist Module migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateSpecialist();
