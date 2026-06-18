# ✅ Setup Checklist

## Database Setup
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy `supabase_migration_existing.sql`
- [ ] Paste and click RUN
- [ ] Wait for "Success" message

## Create Doctor Account
- [ ] Dashboard → Authentication → Users → Add user
- [ ] Email: `doctor@test.com`
- [ ] Password: `test123`
- [ ] ☑ Auto Confirm User
- [ ] User Meta Data:
  ```json
  {
    "role": "DOCTOR",
    "full_name": "Dr. Test"
  }
  ```
- [ ] Click "Create user"
- [ ] Copy the user ID (looks like: `abc-123-def-456`)

## Create Doctor Profile
- [ ] Go to SQL Editor
- [ ] Paste this (replace USER_ID):
  ```sql
  INSERT INTO public.doctors (user_id, license_number, specialization, verification_status)
  VALUES ('USER_ID_HERE', 'LIC-001', 'Gynecologist', 'APPROVED');
  ```
- [ ] Click RUN

## Test Login
- [ ] Visit: http://localhost:3001
- [ ] Login: `doctor@test.com` / `test123`
- [ ] Should see: Doctor Dashboard

## ✅ Done!

---

## Need More Help?

| Question | Read This File |
|----------|----------------|
| How do I set user metadata? | `HOW_TO_SET_USER_METADATA.md` |
| Step-by-step with pictures | `QUICK_START.md` |
| Database setup details | `SETUP_GUIDE.md` |
| Quick reference | `README_FINAL.md` |
| SQL snippets | `test_users.sql` |

---

## Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard  
**Local Web App:** http://localhost:3001  
**API Base:** http://localhost:3001/api  

**Files to use:**
- ✅ `supabase_migration_existing.sql` (run once)
- ✅ `test_users.sql` (optional helper)

**Don't use:**
- ❌ `supabase_schema.sql` (only if no mobile app)
