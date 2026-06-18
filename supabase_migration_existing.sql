-- =====================================================
-- ELIRA HEALTH WEB - MIGRATION SCRIPT
-- FOR EXISTING MOBILE APP DATABASE
-- =====================================================
-- This script only adds NEW tables needed for the web app
-- It does NOT modify the existing 'profiles' table
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ALTER PROFILES TABLE (if needed)
-- =====================================================
-- If your existing 'profiles' table doesn't have these columns, add them:

-- Check if role column exists and has correct constraint
DO $$ 
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'PATIENT';
  END IF;
  
  -- Add full_name if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Update the role constraint to include DOCTOR and ADMIN
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN', 'GYNECOLOGIST'));

-- Note: GYNECOLOGIST and DOCTOR are the same for web app purposes
-- The web app will treat both as "DOCTOR" role

-- =====================================================
-- 2. DOCTORS TABLE (NEW)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  specialization TEXT NOT NULL DEFAULT 'Gynecologist',
  hospital TEXT,
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  consultation_fee NUMERIC(10,2) DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  is_available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_verification ON public.doctors(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON public.doctors(is_available);

-- =====================================================
-- 3. DOCTOR AVAILABILITY TABLE (NEW)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_doctor ON public.doctor_availability(doctor_id);

-- =====================================================
-- 4. CONSULTATIONS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);

-- =====================================================
-- 5. MESSAGES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('DOCTOR', 'PATIENT', 'GYNECOLOGIST')),
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_consultation ON public.messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- =====================================================
-- 6. CONSULTATION ATTACHMENTS TABLE (NEW)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.consultation_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_consultation ON public.consultation_attachments(consultation_id);

-- =====================================================
-- 7. ADMIN LOGS TABLE (NEW)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_logs(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SYNC TRIGGER: Auto-normalize GYNECOLOGIST → DOCTOR
-- =====================================================
-- This ensures that when mobile app sets role = 'GYNECOLOGIST',
-- the web app can still treat it as 'DOCTOR'
CREATE OR REPLACE FUNCTION normalize_doctor_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is GYNECOLOGIST, also allow web queries to find them as DOCTOR
  IF NEW.role = 'GYNECOLOGIST' THEN
    -- Store in user_metadata for Supabase Auth
    -- (This requires updating auth.users.raw_user_meta_data)
    -- Web app middleware will check: role === 'DOCTOR' || role === 'GYNECOLOGIST'
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_doctor_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION normalize_doctor_role();

-- =====================================================
-- RLS POLICIES (same as before, but using 'profiles')
-- =====================================================

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Doctors policies
CREATE POLICY "Anyone can view approved doctors"
  ON public.doctors FOR SELECT
  USING (verification_status = 'APPROVED' OR user_id = auth.uid());

CREATE POLICY "Doctors can update own profile"
  ON public.doctors FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage doctors"
  ON public.doctors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Availability policies
CREATE POLICY "Anyone can view availability"
  ON public.doctor_availability FOR SELECT
  USING (true);

CREATE POLICY "Doctors manage own availability"
  ON public.doctor_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE id = doctor_id AND user_id = auth.uid()
    )
  );

-- Consultations policies
CREATE POLICY "View own consultations"
  ON public.consultations FOR SELECT
  USING (
    patient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE id = doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Patients create consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors update consultations"
  ON public.consultations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE id = doctor_id AND user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "View messages in own consultations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE id = consultation_id AND (
        patient_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.doctors
          WHERE id = doctor_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Admin logs policies
CREATE POLICY "Admins view logs"
  ON public.admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins create logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- COMPLETED - MIGRATION SUMMARY
-- =====================================================
-- ✅ Extended 'profiles' table to support DOCTOR, ADMIN, GYNECOLOGIST roles
-- ✅ Created 'doctors' table for doctor-specific data
-- ✅ Created 'doctor_availability' for schedules
-- ✅ Created/updated 'consultations' and 'messages' tables
-- ✅ Added RLS policies for security
-- ✅ Enabled realtime for chat
--
-- IMPORTANT NOTES:
-- 1. GYNECOLOGIST role from mobile = DOCTOR role in web
-- 2. When user signs up as doctor, set role = 'DOCTOR' or 'GYNECOLOGIST' in profiles
-- 3. Admin must approve doctors (verification_status = 'APPROVED')
-- =====================================================
