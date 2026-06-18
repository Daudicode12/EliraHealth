# ✅ Signup Complete Setup Checklist

## Two Fixes Required

Your signup needs TWO fixes to work:

---

## Fix #1: Add Service Role Key

### ☐ Step 1: Get the Key
1. Go to: https://supabase.com/dashboard
2. Your project → Settings → API
3. Copy **service_role** key (not anon key!)

### ☐ Step 2: Add to .env.local
```bash
SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here
```

### ☐ Step 3: Restart Server
```bash
# Press Ctrl+C then:
npm run dev
```

✅ **Done!** Fix #1 complete.

---

## Fix #2: Update Role Constraint

### ☐ Step 1: Open SQL Editor
1. Supabase Dashboard → SQL Editor

### ☐ Step 2: Run This SQL
```sql
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN', 'GYNECOLOGIST'));
```

### ☐ Step 3: Click RUN
Should see: ✅ Success

✅ **Done!** Fix #2 complete.

---

## Test Your Signup

### ☐ Visit Signup Page
```
http://localhost:3001/signup
```

### ☐ Fill Test Data
```
Full Name: Dr. Test Doctor
Email: test@hospital.com
Password: test1234
Confirm: test1234
License: LIC-001
Specialization: Gynecologist
Hospital: Test Hospital
Years: 5
```

### ☐ Submit Form
Should:
- Show loading spinner ✅
- Redirect to /verification-pending ✅
- Show success page ✅

### ☐ Verify in Database
Run in SQL Editor:
```sql
SELECT * FROM profiles WHERE email = 'test@hospital.com';
SELECT * FROM doctors WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'test@hospital.com'
);
```

Should return 1 row each ✅

---

## Troubleshooting

### ❌ Still see RLS error?
- Check: Did you add service role key?
- Check: Did you restart server?
- Solution: See `FIX_RLS_ERROR.md`

### ❌ Still see role constraint error?
- Check: Did you run the SQL?
- Check: Did you click RUN?
- Solution: See `FIX_ROLE_CONSTRAINT.md`

### ❌ Form doesn't submit?
- Check: Browser console for errors
- Check: Network tab for failed requests
- Check: All required fields filled

---

## Quick Visual Check

### Environment Variables (.env.local)
```bash
✅ NEXT_PUBLIC_SUPABASE_URL=...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=...
✅ SUPABASE_SERVICE_ROLE_KEY=...  ← Must have this!
```

### Database Constraint (run in SQL Editor)
```sql
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'profiles_role_check';
```

Should show:
```
✅ CHECK ((role = ANY (ARRAY['PATIENT'::text, 'DOCTOR'::text, 'ADMIN'::text, 'GYNECOLOGIST'::text])))
```

---

## Success Criteria

When everything works, you should see:

```
1. ✅ Visit /signup
2. ✅ Fill form
3. ✅ Submit
4. ✅ See "Creating Account..." loading state
5. ✅ Redirect to /verification-pending
6. ✅ See success message
7. ✅ Click "Go to Login"
8. ✅ Can attempt login (will fail until approved)
9. ✅ Admin can see in /admin/doctors
10. ✅ Admin can approve
11. ✅ Doctor can login after approval
```

---

## Files You Need

| Issue | Fix Guide |
|-------|-----------|
| RLS error | `FIX_RLS_ERROR.md` or `QUICK_FIX_ROLE.md` |
| Role constraint | `FIX_ROLE_CONSTRAINT.md` or `QUICK_FIX_ROLE.md` |
| Testing | `TEST_SIGNUP.md` |
| Complete docs | `SIGNUP_FEATURE.md` |

---

## Final Checklist

- [ ] Service role key in .env.local
- [ ] Server restarted
- [ ] Role constraint SQL ran
- [ ] Visit /signup works
- [ ] Form submits without errors
- [ ] Redirects to success page
- [ ] Database has profile + doctor records
- [ ] verification_status = 'PENDING'
- [ ] is_available = false

---

## 🎉 When All Checked

Your signup is **fully functional**! 

Doctors can now:
1. Sign up at /signup
2. Wait for admin approval
3. Login after approved
4. Access /doctor/dashboard

Admins can:
1. View pending doctors at /admin/doctors
2. Approve or reject
3. Monitor registrations

**Next:** Test the complete end-to-end flow!

---

## Need Help?

Run these diagnostics:

```sql
-- Check tables exist
\dt profiles doctors

-- Check role constraint
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'profiles_role_check';

-- Check recent signups
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
SELECT * FROM doctors ORDER BY created_at DESC LIMIT 5;
```

```bash
# Check env vars
cat .env.local | grep SUPABASE

# Check server is running
curl http://localhost:3001/signup
```

Good luck! 🚀
