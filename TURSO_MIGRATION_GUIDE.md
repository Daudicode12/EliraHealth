# 🔄 Supabase → Turso Migration Guide for Elira Health

Complete step-by-step guide to set up Turso and migrate from Supabase.

---

## 📋 Prerequisites

- Node.js 16+ installed
- Turso CLI installed (or you can use web dashboard)
- Your Supabase database schema (we have it: `schema.sql`)

---

## ⚙️ Step 1: Set Up Turso Account & Database

### Option A: Using Turso CLI (Recommended)

```bash
# 1. Install Turso CLI (if not already installed)
# macOS:
brew install tursodatabase/tap/turso

# Linux:
curl -sSfL https://get.turso.io | bash

# Windows (PowerShell):
irm https://releases.turso.io/turso/install/windows.ps1 | iex

# 2. Sign up / Log in to Turso
turso auth signup
# or
turso auth login

# 3. Create a new database
turso db create elira-health
# Output will show:
# ✓ Database 'elira-health' created.
# Connection URL: libsql://elira-health-<random>.turso.io
# Auth token: eJy...

# 4. Get connection details
turso db show elira-health
turso db tokens create elira-health

# Save the connection URL and auth token!
```

### Option B: Using Turso Web Dashboard

1. Go to https://app.turso.io
2. Sign up or log in
3. Click **"Create Database"**
4. Name it `elira-health`
5. Select your preferred region
6. Click **"Create"**
7. Copy the **Connection URL** and **Auth Token**

---

## 🔑 Step 2: Get Turso Credentials

After creating database, you'll get:

```
Connection URL: libsql://elira-health-<random>.turso.io
Auth Token: eJy...your-token-here...
```

**These are what you need for `.env.local`**

---

## 📝 Step 3: Set Up Environment Variables

**File: `.env.local`** (in your Elira Health project root)

```bash
# Turso Database
TURSO_CONNECTION_URL=libsql://elira-health-<random>.turso.io
TURSO_AUTH_TOKEN=eJy...your-token-here...

# Optional: For local Turso development
# TURSO_CONNECTION_URL=file:local.db  # Uses local SQLite file instead
```

### To use local SQLite while developing:

```bash
# .env.local
TURSO_CONNECTION_URL=file:local.db
TURSO_AUTH_TOKEN=ignore_for_local
```

This creates a `local.db` file in your project root for testing.

---

## 🗄️ Step 4: Push Schema to Turso

### Option A: Using Turso CLI

```bash
# 1. Create schema.sql file with your entire database schema
# (You already have this in the document)

# 2. Push schema to Turso
turso db shell elira-health < schema.sql

# 3. Verify tables were created
turso db shell elira-health
# Then run:
# .tables
# .schema profiles
```

### Option B: Using Web Dashboard

1. Log in to https://app.turso.io
2. Click on your `elira-health` database
3. Click **"Shell"** tab
4. Paste your entire `schema.sql` content
5. Click **"Execute"**

### Option C: Using Node.js Script

**File: `scripts/init-db.ts`**

```typescript
import { createClient } from "@libsql/client";
import fs from "fs";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function initDatabase() {
  try {
    console.log("📦 Initializing Turso database...");

    // Read schema file
    const schema = fs.readFileSync("./schema.sql", "utf-8");

    // Execute schema
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await client.execute(statement);
    }

    console.log("✅ Database initialized successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

initDatabase();
```

Run it:
```bash
npx ts-node scripts/init-db.ts
```

### Incremental Schema Migration (New Modules)

If you have already initialized your database schema and want to migrate the new module tables/columns (such as `appointments`, `medical_records`, and columns on `experts` and `consultations`), we have created a dedicated **[migration.sql](file:///home/ogega/Projects/Eliraweb/migration.sql)** file.

Run it against your remote Turso database using:
```bash
turso db shell elira-health < migration.sql
```
*Note: If some of the columns already exist in your database, you can run the `CREATE TABLE` and `CREATE INDEX` queries individually or ignore duplicate column errors.*

---

## 🔌 Step 5: Replace Supabase Client with Turso Client

### Remove Supabase Packages

```bash
npm uninstall @supabase/supabase-js
npm install @libsql/client
```

### Old Supabase Code (REMOVE THIS)

```typescript
// ❌ OLD: src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;
```

### New Turso Code (USE THIS)

```typescript
// ✅ NEW: src/lib/db/client.ts
import { createClient, Client } from "@libsql/client";

let tursoClient: Client | null = null;

export function getTursoClient(): Client {
  if (!tursoClient) {
    const url = process.env.TURSO_CONNECTION_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing Turso credentials. Set TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN in .env.local"
      );
    }

    tursoClient = createClient({
      url,
      authToken: token,
    });
  }

  return tursoClient;
}

export async function executeQuery<T>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql,
    args: params,
  });

  return (result.rows as T[]) || [];
}
```

---

## 🔄 Step 6: Migrate Supabase Queries to Raw SQL

### Old Supabase Code (REMOVE THIS)

```typescript
// ❌ OLD: Supabase-specific
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("email", email);
```

### New Turso Code (USE THIS)

```typescript
// ✅ NEW: Raw SQL with parameterized queries
import { getOne } from "@/lib/db/queries";

const profile = await getOne(
  "SELECT * FROM profiles WHERE email = ?",
  [email]
);
```

**Key differences:**
- Supabase uses `.select()`, `.eq()`, `.insert()` chainable methods
- Turso uses raw SQL with `?` placeholders for parameters
- All queries are parameterized to prevent SQL injection
- Results are plain JS objects (no `.data` property)

---

## 📊 Step 7: Update All API Routes

### Example: Update Signup API

**Old Supabase Code:**
```typescript
// ❌ OLD: src/app/api/auth/signup/route.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Insert into profiles
  const { data: profile, error } = await supabase
    .from("profiles")
    .insert([
      {
        id: userId,
        email: body.email,
        first_name: body.firstName,
        role: "expert",
      },
    ]);

  if (error) throw error;

  return NextResponse.json({ success: true });
}
```

**New Turso Code:**
```typescript
// ✅ NEW: src/app/api/auth/signup/route.ts
import { createProfile, createExpert } from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Insert into profiles
  await createProfile({
    id: userId,
    email: body.email,
    firstName: body.firstName,
    role: "expert",
  });

  // Insert into experts
  await createExpert({
    userId,
    displayName: `${body.firstName} ${body.lastName}`,
    specialties: body.specialties,
    yearsOfExperience: body.yearsOfExperience,
    hourlyRate: body.hourlyRate,
  });

  return NextResponse.json({ success: true });
}
```

---

## 🧪 Step 8: Test Turso Connection

### Quick Test Script

**File: `scripts/test-turso.ts`**

```typescript
import { getTursoClient } from "@/lib/db/client";

async function testConnection() {
  try {
    console.log("🔌 Testing Turso connection...");

    const client = getTursoClient();
    const result = await client.execute("SELECT 1 AS test");

    if (result.rows.length > 0) {
      console.log("✅ Turso connection successful!");
      console.log("Result:", result.rows[0]);
    }
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
}

testConnection();
```

Run it:
```bash
npx ts-node scripts/test-turso.ts
```

### Verify Tables Exist

```bash
# Using Turso CLI
turso db shell elira-health

# Then in the shell:
.tables
.schema profiles
.schema experts
SELECT COUNT(*) FROM profiles;
```

---

## 📋 Step 9: Checklist Before Going Live

- [ ] Turso account created
- [ ] Database `elira-health` created
- [ ] Connection URL copied to `.env.local`
- [ ] Auth token copied to `.env.local`
- [ ] Schema pushed to Turso
- [ ] `@libsql/client` installed
- [ ] Old Supabase client removed/replaced
- [ ] All API routes use new Turso queries
- [ ] Database queries tested
- [ ] Admin approval flow working
- [ ] Expert signup flow working
- [ ] Consultations creating/updating in Turso
- [ ] Messages saving to Turso

---

## 🚀 Step 10: Deploy to Production

### Environment Variables for Production

Set these on your hosting platform (Vercel, Netlify, etc.):

```
TURSO_CONNECTION_URL=libsql://elira-health-<random>.turso.io
TURSO_AUTH_TOKEN=eJy...your-token-here...
```

**Do NOT commit these to GitHub!**

### Update .gitignore

```bash
# .gitignore
.env.local
.env.production.local
local.db
local.db-shm
local.db-wal
```

---

## 🔍 Troubleshooting

### Error: "Missing Turso credentials"

**Solution:**
```bash
# Verify .env.local has:
TURSO_CONNECTION_URL=libsql://...
TURSO_AUTH_TOKEN=eJy...

# Restart dev server:
npm run dev
```

### Error: "Cannot find module '@libsql/client'"

**Solution:**
```bash
npm install @libsql/client
npm install --save-dev @types/node
```

### Error: "Table 'profiles' does not exist"

**Solution:**
```bash
# Push schema again:
turso db shell elira-health < schema.sql

# Or verify tables:
turso db shell elira-health
.tables
```

### Error: "UNIQUE constraint failed: profiles.email"

**Solution:**
```bash
# This is expected - just means email already exists
# Handle in your code:
try {
  await createProfile({ ... });
} catch (error) {
  if (error.message.includes("UNIQUE constraint")) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }
}
```

### Slow Queries

**Solution:**
Make sure indexes are created. Check Turso docs for query optimization:
```bash
turso db shell elira-health
.indices
```

---

## 📚 Useful Commands

```bash
# Turso CLI commands
turso auth signup              # Create account
turso auth login               # Log in
turso db create [name]         # Create database
turso db list                  # List all databases
turso db show [name]           # Show database details
turso db delete [name]         # Delete database
turso db shell [name]          # Open interactive shell
turso db tokens list [name]    # List auth tokens
turso db tokens create [name]  # Create new token
turso db tokens revoke [token] # Revoke token
turso db metrics [name]        # View usage metrics
```

---

## 🔐 Security Notes

1. **Never commit `.env.local` to GitHub**
   - Add to `.gitignore`
   - Use environment variables on production

2. **Rotate tokens regularly**
   ```bash
   turso db tokens revoke <old-token>
   turso db tokens create elira-health
   ```

3. **Use parameterized queries always**
   ```typescript
   // ❌ NEVER do this:
   const result = await execute(`SELECT * FROM profiles WHERE email = '${email}'`);

   // ✅ ALWAYS do this:
   const result = await executeQuery("SELECT * FROM profiles WHERE email = ?", [email]);
   ```

4. **Verify user roles in API routes**
   ```typescript
   if (userRole !== "admin") {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
   }
   ```

---

## 📖 Useful Resources

- **Turso Docs:** https://docs.turso.tech/
- **LibSQL Client:** https://github.com/tursodatabase/libsql-client-js
- **SQLite Docs:** https://www.sqlite.org/docs.html
- **Your Project Files:**
  - `lib/db/client.ts` - Turso connection
  - `lib/db/queries.ts` - Query helpers
  - `api_routes_examples.ts` - API implementation examples

---

## ✅ Migration Complete!

Once you've completed all steps:

1. ✅ Turso database set up
2. ✅ Schema pushed
3. ✅ Connection configured
4. ✅ Queries updated
5. ✅ API routes working
6. ✅ Tests passing
7. ✅ Ready for production!

Your Elira Health platform is now running on **Turso** with:
- Expert signup & admin approval ✅
- Consultation booking & approval ✅
- In-app messaging ✅
- Patient record management ✅

All powered by **Turso (SQLite)** instead of Supabase!

---

**Questions? Issues?**
- Check Turso error logs: `turso db shell elira-health`
- Review query syntax in `lib/db/queries.ts`
- Ensure parameterized queries are used everywhere
