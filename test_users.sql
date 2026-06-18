-- =====================================================
-- QUICK TEST USERS FOR ELIRA HEALTH WEB
-- =====================================================
-- Run these in Supabase SQL Editor after migration
-- =====================================================

-- NOTE: Create users via Supabase Dashboard first, then run this
-- 1. Go to: Authentication → Users → Add User
-- 2. Create with user_metadata: { "role": "DOCTOR", "full_name": "Dr. Test" }
-- 3. Copy the user ID
-- 4. Run this SQL with that ID

-- =====================================================
-- STEP 1: Check if profiles table has data
-- =====================================================
SELECT id, email, full_name, role FROM public.profiles LIMIT 5;

-- =====================================================
-- STEP 2: Create a test doctor profile
-- =====================================================
-- Replace 'USER_UUID_HERE' with actual UUID from auth.users

INSERT INTO public.doctors (
  user_id,
  license_number,
  specialization,
  hospital,
  years_experience,
  bio,
  consultation_fee,
  verification_status,
  is_available
) VALUES (
  'USER_UUID_HERE', -- ⚠️ REPLACE THIS
  'LIC-TEST-001',
  'Gynecologist',
  'Test Hospital',
  5,
  'Experienced gynecologist specializing in prenatal care',
  50.00,
  'APPROVED',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  verification_status = 'APPROVED',
  is_available = true;

-- =====================================================
-- STEP 3: Verify doctor was created
-- =====================================================
SELECT 
  d.id,
  d.license_number,
  d.specialization,
  d.verification_status,
  p.full_name,
  p.email,
  p.role
FROM doctors d
JOIN profiles p ON d.user_id = p.id
WHERE d.verification_status = 'APPROVED';

-- =====================================================
-- ALTERNATIVE: Auto-create doctors for all gynecologists
-- =====================================================
-- If you have existing users with role 'GYNECOLOGIST' or 'DOCTOR'
-- but no entries in doctors table, run this:

INSERT INTO public.doctors (
  user_id,
  license_number,
  specialization,
  verification_status,
  is_available
)
SELECT 
  id,
  'AUTO-' || id::text,
  'Gynecologist',
  'PENDING', -- Admins will need to approve
  false
FROM public.profiles
WHERE role IN ('DOCTOR', 'GYNECOLOGIST')
  AND id NOT IN (SELECT user_id FROM public.doctors)
ON CONFLICT (user_id) DO NOTHING;

-- Then check pending doctors
SELECT 
  d.*,
  p.full_name,
  p.email
FROM doctors d
JOIN profiles p ON d.user_id = p.id
WHERE d.verification_status = 'PENDING';

-- =====================================================
-- HELPER: Find user ID by email
-- =====================================================
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.raw_user_meta_data->>'full_name' as full_name
FROM auth.users u
WHERE u.email = 'doctor@test.com'; -- Change email here

-- =====================================================
-- HELPER: Check if doctor profile exists
-- =====================================================
SELECT 
  d.*,
  p.full_name,
  p.email,
  p.role
FROM public.doctors d
JOIN public.profiles p ON d.user_id = p.id
WHERE p.email = 'doctor@test.com'; -- Change email here

-- =====================================================
-- COMPLETED
-- =====================================================
-- Your test doctor should now be able to login at:
-- http://localhost:3001/login
-- =====================================================
