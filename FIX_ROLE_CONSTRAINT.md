# 🔧 Fix: Role Constraint Error

## ❌ Error
```
Profile creation failed: new row for relation "profiles" violates check constraint "profiles_role_check"
```

## 🔍 What This Means

Your `profiles` table has a **check constraint** that only allows specific role values.

The constraint probably looks like:
```sql
CHECK (role IN ('PATIENT', 'USER'))  -- ❌ DOCTOR not allowed!
```

But we're trying to insert:
```sql
INSERT INTO profiles (role) VALUES ('DOCTOR');  -- ❌ Rejected!
```

## ✅ Solution (1 minute)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Your project → **SQL Editor**

### Step 2: Run This SQL

Copy and paste:

```sql
-- Remove old constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with DOCTOR and ADMIN
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN', 'GYNECOLOGIST'));
```

### Step 3: Click **RUN**

You should see: ✅ Success

### Step 4: Test Signup Again

Visit: http://localhost:3001/signup

Fill the form and submit. Should work now! ✅

---

## 🔍 Why This Happened

Your `profiles` table was created by the mobile app with a limited role constraint:

```sql
-- Mobile app constraint (only allows PATIENT)
CHECK (role IN ('PATIENT'))
```

When we try to insert `role = 'DOCTOR'`, the database rejects it because "DOCTOR" is not in the allowed list.

---

## 🎯 What the Fix Does

**Before:**
```sql
profiles_role_check: CHECK (role IN ('PATIENT'))
                                      ^^^^^^^^^^
                                      Only this
```

**After:**
```sql
profiles_role_check: CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN', 'GYNECOLOGIST'))
                                      ^^^^^^^^^^  ^^^^^^^^  ^^^^^^^  ^^^^^^^^^^^^^^
                                      All roles now allowed
```

---

## 🧪 Verify It Worked

Run this in SQL Editor:

```sql
SELECT 
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'profiles' 
AND con.conname = 'profiles_role_check';
```

Should return:
```
constraint_name      | profiles_role_check
definition           | CHECK ((role = ANY (ARRAY['PATIENT'::text, 'DOCTOR'::text, 'ADMIN'::text, 'GYNECOLOGIST'::text])))
```

---

## 🔄 Alternative: If You Get Permission Error

If you get a permission error running the ALTER TABLE command, you might need to use the Supabase Dashboard UI:

1. **Table Editor** → **profiles** table
2. Click on the **role** column
3. Click **Edit Column**
4. Under **Constraints**, update the check constraint
5. Add: `DOCTOR`, `ADMIN`, `GYNECOLOGIST`

---

## ✅ Complete Checklist

- [ ] Open Supabase SQL Editor
- [ ] Copy the ALTER TABLE commands
- [ ] Click RUN
- [ ] See "Success" message
- [ ] Visit /signup
- [ ] Fill form
- [ ] Submit
- [ ] ✅ No constraint error
- [ ] ✅ Redirects to /verification-pending
- [ ] ✅ Check profiles table has new row

---

## 📊 Expected Result

After the fix:

```sql
-- This INSERT now works:
INSERT INTO profiles (id, full_name, email, role)
VALUES (
  'uuid-here',
  'Dr. Test',
  'test@example.com',
  'DOCTOR'  -- ✅ Allowed now!
);
```

---

## 🎉 Done!

Your signup should work now. The constraint has been updated to allow all necessary roles for both the mobile app (PATIENT) and web app (DOCTOR, ADMIN).

---

## 🔗 Related

This is the **second fix** needed for signup:

1. ✅ Added service role key (FIX_RLS_ERROR.md)
2. ✅ Updated role constraint (this fix)
3. 🎉 Signup now works!

---

## 🆘 Still Not Working?

Check:
- [ ] Service role key added to .env.local
- [ ] Server restarted after adding key
- [ ] Role constraint updated (this fix)
- [ ] profiles table exists
- [ ] doctors table exists

Run this diagnostic:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'doctors');

-- Check role constraint
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'profiles_role_check';
```
