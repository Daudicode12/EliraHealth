-- =====================================================
-- FIX: Update profiles role constraint to allow DOCTOR and ADMIN
-- =====================================================

-- Step 1: Drop the old constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add new constraint that allows all needed roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN', 'GYNECOLOGIST'));

-- Step 3: Verify it worked
SELECT 
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'profiles' 
AND con.contype = 'c'
AND con.conname = 'profiles_role_check';

-- Expected result:
-- profiles_role_check | CHECK ((role = ANY (ARRAY['PATIENT'::text, 'DOCTOR'::text, 'ADMIN'::text, 'GYNECOLOGIST'::text])))
