-- ─────────────────────────────────────────────────────────────────────────────
-- Elira Supabase to Turso Schema Migration File
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add missing columns to the experts table (wrapped in individual statements,
-- ignore errors if they already exist in your database instance)

ALTER TABLE experts ADD COLUMN license_number TEXT;
ALTER TABLE experts ADD COLUMN medical_council_number TEXT;
ALTER TABLE experts ADD COLUMN practicing_certificate_url TEXT;
ALTER TABLE experts ADD COLUMN hospital_name TEXT;
ALTER TABLE experts ADD COLUMN verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended'));
ALTER TABLE experts ADD COLUMN profile_status TEXT DEFAULT 'profile_incomplete' CHECK (profile_status IN ('profile_incomplete', 'pending_review', 'approved', 'rejected', 'suspended'));
ALTER TABLE experts ADD COLUMN submitted_for_review_at TEXT;
ALTER TABLE experts ADD COLUMN verified_at TEXT;
ALTER TABLE experts ADD COLUMN verified_by TEXT REFERENCES profiles(id);
ALTER TABLE experts ADD COLUMN rejection_reason TEXT;
ALTER TABLE experts ADD COLUMN admin_notes TEXT;

-- 2. Add missing columns to the consultations table
ALTER TABLE consultations ADD COLUMN diagnosis TEXT;

-- 3. Create the Appointments table
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
);

-- 4. Create the Medical Records table
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
);

-- 5. Create the Patient-Specialist Assignments table
CREATE TABLE IF NOT EXISTS patient_specialist_assignments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  patient_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialist_id TEXT NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  assigned_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(patient_id, specialist_id)
);

-- 6. Create Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_specialist_id ON appointments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_specialist_id ON medical_records(specialist_id);
CREATE INDEX IF NOT EXISTS idx_patient_specialist_assignments_patient_id ON patient_specialist_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_specialist_assignments_specialist_id ON patient_specialist_assignments(specialist_id);

-- 7. Triggers for automated updated_at fields
CREATE TRIGGER IF NOT EXISTS trg_appointments_updated_at AFTER UPDATE ON appointments
BEGIN
  UPDATE appointments SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_medical_records_updated_at AFTER UPDATE ON medical_records
BEGIN
  UPDATE medical_records SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
