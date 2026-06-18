# ⚡ Quick Fix: Add Service Role Key

## Problem
```
Error: new row violates row-level security policy for table "profiles"
```

## Solution (2 minutes)

### Step 1: Get the Key

1. Open: https://supabase.com/dashboard
2. Click your **Elira Health** project
3. Left sidebar → Click **⚙️ Settings**
4. Click **API** (under Project Settings)
5. Scroll to **Project API keys** section
6. Find the row that says **service_role**
7. Click the **👁️ Reveal** button
8. Click **📋 Copy** button

### Step 2: Add to .env.local

Open `.env.local` and add this line:

```bash
SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here
```

Your file should look like:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://nddwczvegewcjmketyvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_NEW_KEY
```

### Step 3: Restart Server

```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

### Step 4: Test Signup

Visit: http://localhost:3001/signup

Fill the form and submit. Should work now! ✅

---

## Visual Guide

```
Supabase Dashboard
├── Your Projects
│   └── Elira Health (click here)
│       ├── Table Editor
│       ├── Authentication
│       └── ⚙️ Settings (click here)
│           ├── General
│           ├── API (click here) ← YOU ARE HERE
│           │   └── Project API keys
│           │       ├── anon public (don't use this)
│           │       └── service_role secret (use this!) 👈
│           ├── Database
│           └── Auth
```

---

## What Changed in Code?

**Before:**
```typescript
// Used regular Supabase client
const supabase = await createSupabaseServerClient();
await supabase.auth.signUp(...); // ❌ RLS blocks this
```

**After:**
```typescript
// Uses service role client (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 👈 New key
);
await supabase.auth.admin.createUser(...); // ✅ Works!
```

---

## Why This Fixes It

1. **During signup, user is NOT logged in**
2. **RLS blocks unauthenticated inserts**
3. **Service role key = admin access**
4. **Bypasses RLS for signup flow**
5. **User profile created successfully**

---

## Security ✅

- Service role key is **server-side only**
- Never sent to browser
- Only used in `authService.ts`
- Safe for production

---

## Done! 🎉

Your signup should work now without RLS errors.
