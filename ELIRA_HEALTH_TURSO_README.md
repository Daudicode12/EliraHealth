# 🏥 Elira Health - Healthcare Platform (Turso Edition)

Elira Health is a modern healthcare platform built with Next.js and Turso, designed to connect patients with healthcare specialists (gynecologists, experts), manage consultations, and provide secure messaging with admin oversight.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Turso (libSQL/SQLite)](https://turso.tech/)
- **ORM/Query Builder:** Raw SQL with parameterized queries (no ORM)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide-react.dev/), [Phosphor Icons](https://phosphoricons.com/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Authentication:** Custom JWT-based (stored in Turso `profiles` table with `role` field)

---

## 📂 Project Structure

```text
src/
├── app/                           # Next.js App Router
│   ├── api/                       # API endpoints (Turso queries)
│   │   ├── experts/               # Expert management (GET, POST, PATCH)
│   │   ├── consultations/         # Consultation CRUD
│   │   ├── messages/              # Consultation messaging
│   │   └── admin/                 # Admin-only endpoints
│   ├── admin/                     # Admin dashboard (verify experts, approve consultations)
│   ├── expert/                    # Expert dashboard (availability, consultations)
│   ├── patient/                   # Patient dashboard (book experts, view consultations)
│   ├── login/                     # Authentication
│   ├── signup/                    # Expert registration
│   └── verification-pending/      # Post-signup: waiting for admin approval
├── components/                    # Reusable UI components
├── lib/                           # Core logic
│   ├── db/                        # Turso database utilities
│   │   ├── client.ts              # Turso client initialization
│   │   ├── queries.ts             # SQL query builders
│   │   └── utils.ts               # Helper functions
│   ├── services/                  # Business logic
│   │   ├── auth.ts                # Authentication service
│   │   ├── expert.ts              # Expert service (signup, verification)
│   │   ├── consultation.ts        # Consultation service
│   │   └── admin.ts               # Admin service (approvals)
│   └── types.ts                   # TypeScript interfaces
└── middleware.ts                  # Route protection & role-based redirects
```

---

## 🔄 Application Flow

### 1. Authentication & Role-Based Access
The application uses **Middleware-based protection** (`src/middleware.ts`) with `profiles.role`:

**User Roles:**
- `user` (PATIENT) → Redirected to `/patient/dashboard`
- `expert` (SPECIALIST/GYNECOLOGIST) → Redirected to `/expert/dashboard` (if `is_verified = true`)
- `admin` (ADMINISTRATOR) → Redirected to `/admin/dashboard`

**Access Rules:**
- **Public Routes:** `/login`, `/signup`, `/verification-pending`
- **Protected Routes:** `/admin/*`, `/expert/*`, `/patient/*`
- **Root Redirect:** `/` → `/login` if unauthenticated

---

### 2. Expert Onboarding & Admin Verification Flow

#### Step 1: Expert Registration (`/signup`)
Expert fills signup form with:
- Email, first/last name, phone number
- **Professional Details:**
  - Specialties (gynecology, fertility, etc.)
  - Years of experience
  - Credentials/certifications
  - Hospital/clinic information
  - Avatar URL
  - Bio
  - Hourly rate

**Database Actions:**
```sql
-- Turso inserts
INSERT INTO profiles (id, email, first_name, last_name, phone_number, role)
VALUES (?, ?, ?, ?, ?, 'expert');

INSERT INTO experts (user_id, display_name, specialties, credentials, years_of_experience, hourly_rate, is_verified)
VALUES (?, ?, ?, ?, ?, ?, 0);  -- is_verified = 0 (pending)
```

#### Step 2: Pending Verification (`/verification-pending`)
- Expert cannot access `/expert/dashboard` yet
- Expert sees message: "Your credentials are under review. Admin will notify you once approved."
- Record exists in `experts` table with `is_verified = 0`

#### Step 3: Admin Review & Approval (`/admin/experts`)
Admin dashboard displays pending experts with:
- ✅ Display name
- ✅ Years of experience
- ✅ Credentials
- ✅ Specialties
- ✅ Hospital information
- ✅ Average rating (if any reviews exist)
- ✅ Buttons: **Approve** | **Reject** | **Request More Info**

**Admin Action - Approve:**
```sql
-- Turso update
UPDATE experts
SET is_verified = 1,
    updated_at = datetime('now')
WHERE user_id = ?;
```

**Result:** Expert can now log in and access `/expert/dashboard`

#### Step 4: Expert Full Access
Once `is_verified = 1`, expert:
- ✅ Access `/expert/dashboard`
- ✅ Set availability (`expert_availability` table)
- ✅ View assigned consultations
- ✅ Message patients
- ✅ Update profile & rates

---

### 3. Patient-Expert Consultation Flow

#### Patient Books Consultation
```sql
INSERT INTO consultations (client_id, expert_id, scheduled_at, issue_category, issue_description, status)
VALUES (?, ?, ?, ?, ?, 'pending');
```

#### Admin Approves Appointment
Admin sees pending consultations and can:
- ✅ Approve (status → 'confirmed')
- ✅ Reschedule
- ✅ Cancel

```sql
UPDATE consultations
SET status = 'confirmed'
WHERE id = ?;
```

#### Expert-Patient Messaging
Messages stored in `consultation_messages`:
```sql
INSERT INTO consultation_messages (consultation_id, sender_id, content, message_type)
VALUES (?, ?, ?, 'text');
```

#### Consultation Completion
Admin or expert marks complete:
```sql
UPDATE consultations
SET status = 'completed'
WHERE id = ?;

-- Trigger automatically increments expert.total_consultations
```

---

## 🗄️ Turso Schema Reference

### Core Tables for Elira Health

**profiles** (users)
```
id (TEXT, PRIMARY KEY) - Auth user ID
email (TEXT)
first_name, last_name (TEXT)
role (TEXT) - 'user' | 'expert' | 'admin'
phone_number (TEXT)
avatar_url (TEXT)
created_at, updated_at (TEXT)
```

**experts** (specialists - requires admin verification)
```
id (TEXT, PRIMARY KEY)
user_id (TEXT, UNIQUE) - References profiles(id)
display_name (TEXT)
bio (TEXT)
specialties (TEXT) - JSON array: '["gynecology", "fertility"]'
credentials (TEXT)
years_of_experience (INTEGER)
hourly_rate (REAL)
currency (TEXT) - Default: 'KES'
is_verified (BOOLEAN) - 0 = pending, 1 = approved
is_available (BOOLEAN)
average_rating (REAL)
total_reviews (INTEGER)
total_consultations (INTEGER)
created_at, updated_at (TEXT)
```

**expert_availability** (expert schedules)
```
id (TEXT, PRIMARY KEY)
expert_id (TEXT) - References experts(id)
day_of_week (INTEGER) - 0 = Sunday, 6 = Saturday
start_time, end_time (TEXT) - HH:MM format
is_available (BOOLEAN)
```

**consultations** (appointments between patient & expert)
```
id (TEXT, PRIMARY KEY)
client_id (TEXT) - References profiles(id)
expert_id (TEXT) - References experts(id)
scheduled_at (TEXT) - ISO Timestamp
duration_minutes (INTEGER) - Default: 30
status (TEXT) - 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
issue_category (TEXT) - 'menstrual_health' | 'pregnancy' | 'fertility' | 'postpartum' | 'general'
issue_description (TEXT)
meeting_url (TEXT)
cancellation_reason (TEXT)
created_at, updated_at (TEXT)
```

**consultation_messages** (in-consultation chat)
```
id (TEXT, PRIMARY KEY)
consultation_id (TEXT) - References consultations(id)
sender_id (TEXT) - References profiles(id)
content (TEXT)
message_type (TEXT) - 'text' | 'image' | 'file'
is_read (BOOLEAN)
read_at (TEXT)
created_at (TEXT)
```

**expert_reviews** (patient feedback after consultation)
```
id (TEXT, PRIMARY KEY)
consultation_id (TEXT, UNIQUE) - References consultations(id)
client_id (TEXT) - References profiles(id)
expert_id (TEXT) - References experts(id)
rating (INTEGER) - 1-5
comment (TEXT)
is_anonymous (BOOLEAN)
created_at (TEXT)
```

---

## 🔌 Turso Database Setup

### 1. Initialize Turso Client

**File: `src/lib/db/client.ts`**
```typescript
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export default turso;
```

**Environment Variables (`.env.local`)**
```bash
TURSO_CONNECTION_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 2. Query Helpers

**File: `src/lib/db/queries.ts`**
```typescript
import turso from "./client";

// Parameterized query executor
export async function executeQuery<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  try {
    const result = await turso.execute({
      sql,
      args: params || [],
    });
    return result.rows as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error(`Query failed: ${(error as Error).message}`);
  }
}

// Get single row
export async function getOne<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T | null> {
  const results = await executeQuery<T>(sql, params);
  return results[0] || null;
}

// Get multiple rows
export async function getMany<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  return executeQuery<T>(sql, params);
}

// Execute action (INSERT, UPDATE, DELETE)
export async function execute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<{ success: boolean; changes?: number }> {
  try {
    const result = await turso.execute({
      sql,
      args: params || [],
    });
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error("Database execution error:", error);
    throw new Error(`Execution failed: ${(error as Error).message}`);
  }
}
```

---

## 🚀 API Reference

All APIs located in `/src/app/api`.

### Authentication
- `POST /api/auth/signup` - Expert registration (creates profile + expert record)
- `POST /api/auth/login` - Login (returns JWT with role)
- `POST /api/auth/logout` - Logout

### Experts (List & Details)
- `GET /api/experts` - List verified, available experts
- `GET /api/experts?specialty=gynecology` - Filter by specialty
- `GET /api/experts/[id]` - Get expert details + availability + reviews
- `PATCH /api/experts/[id]` - Update expert profile (self-service)
- `GET /api/experts/[id]/availability` - Get availability schedule

### Admin Only
- `GET /api/admin/experts?status=pending` - List pending expert verifications
- `PATCH /api/admin/experts/[id]/verify` - Approve expert (is_verified → 1)
- `PATCH /api/admin/experts/[id]/reject` - Reject expert (delete record)
- `GET /api/admin/consultations` - List all consultations
- `PATCH /api/admin/consultations/[id]` - Approve/cancel consultation

### Consultations
- `POST /api/consultations` - Book consultation with expert
  - **Body:** `{ expert_id, client_id, scheduled_at, issue_category, issue_description }`
- `GET /api/consultations?clientId=[id]` - Get patient's consultations
- `GET /api/consultations?expertId=[id]` - Get expert's consultations
- `PATCH /api/consultations/[id]` - Update status (expert can change to in_progress/completed)
- `DELETE /api/consultations/[id]` - Cancel consultation

### Consultation Messages
- `GET /api/consultations/[id]/messages` - Get message history
- `POST /api/consultations/[id]/messages` - Send message
  - **Body:** `{ sender_id, content, message_type }`
- `PATCH /api/messages/[id]/read` - Mark message as read

### Expert Reviews
- `POST /api/consultations/[id]/review` - Submit review after consultation
  - **Body:** `{ rating, comment, is_anonymous }`
- `GET /api/experts/[id]/reviews` - Get expert's reviews

---

## 📋 Service Layer Examples

### Expert Service

**File: `src/lib/services/expert.ts`**
```typescript
import { getOne, getMany, execute } from "@/lib/db/queries";

// Expert signup - creates profile + expert record
export async function signupExpert(data: {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  specialties: string[]; // JSON array
  credentials: string;
  yearsOfExperience: number;
  hourlyRate: number;
  bio: string;
  avatarUrl?: string;
}) {
  const userId = crypto.randomUUID();

  // 1. Create profile
  await execute(
    `INSERT INTO profiles (id, email, first_name, last_name, phone_number, role)
     VALUES (?, ?, ?, ?, ?, 'expert')`,
    [userId, data.email, data.firstName, data.lastName, data.phoneNumber]
  );

  // 2. Create expert record (is_verified = 0 = pending)
  await execute(
    `INSERT INTO experts (user_id, display_name, specialties, credentials, years_of_experience, hourly_rate, bio, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      userId,
      `${data.firstName} ${data.lastName}`,
      JSON.stringify(data.specialties),
      data.credentials,
      data.yearsOfExperience,
      data.hourlyRate,
      data.bio,
    ]
  );

  return { userId, status: "pending_verification" };
}

// Get pending expert verifications (admin only)
export async function getPendingExperts() {
  return getMany(
    `SELECT e.*, p.email, p.phone_number
     FROM experts e
     JOIN profiles p ON e.user_id = p.id
     WHERE e.is_verified = 0
     ORDER BY e.created_at DESC`
  );
}

// Approve expert (admin)
export async function approveExpert(expertId: string) {
  await execute(
    `UPDATE experts SET is_verified = 1, updated_at = datetime('now') WHERE id = ?`,
    [expertId]
  );
}

// Get verified experts (patient view)
export async function getVerifiedExperts(specialty?: string) {
  let sql = `SELECT e.*, p.email
             FROM experts e
             JOIN profiles p ON e.user_id = p.id
             WHERE e.is_verified = 1 AND e.is_available = 1`;

  const params: any[] = [];

  if (specialty) {
    sql += ` AND e.specialties LIKE ?`;
    params.push(`%${specialty}%`);
  }

  sql += ` ORDER BY e.average_rating DESC`;

  return getMany(sql, params);
}
```

### Admin Service

**File: `src/lib/services/admin.ts`**
```typescript
import { getMany, execute } from "@/lib/db/queries";

// Get all pending consultations
export async function getPendingConsultations() {
  return getMany(
    `SELECT c.*, p.first_name AS patient_name, e.display_name AS expert_name
     FROM consultations c
     JOIN profiles p ON c.client_id = p.id
     JOIN experts e ON c.expert_id = e.id
     WHERE c.status = 'pending'
     ORDER BY c.created_at ASC`
  );
}

// Approve consultation (admin confirms appointment)
export async function approveConsultation(consultationId: string) {
  await execute(
    `UPDATE consultations SET status = 'confirmed', updated_at = datetime('now') WHERE id = ?`,
    [consultationId]
  );
}

// Reject/cancel consultation (admin)
export async function rejectConsultation(
  consultationId: string,
  reason?: string
) {
  await execute(
    `UPDATE consultations
     SET status = 'cancelled', cancellation_reason = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [reason || null, consultationId]
  );
}

// View patient's complete record (admin)
export async function getPatientRecord(patientId: string) {
  return getMany(
    `SELECT c.*, e.display_name AS expert_name, c.status, c.created_at
     FROM consultations c
     LEFT JOIN experts e ON c.expert_id = e.id
     WHERE c.client_id = ?
     ORDER BY c.created_at DESC`,
    [patientId]
  );
}
```

---

## 🧪 Testing Procedures

### 1. Prerequisites

**Setup `.env.local`:**
```bash
TURSO_CONNECTION_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

**Ensure Turso schema is initialized:**
```bash
turso db shell my-database < schema.sql
```

### 2. Expert Signup Test

1. Visit `http://localhost:3000/signup`
2. Fill form with expert data:
   ```
   Email: dr.jane@example.com
   Name: Jane Doe
   Specialties: Gynecology, Fertility
   Years of Experience: 8
   Credentials: OBGYN License #12345
   Hourly Rate: 2500 KES
   ```
3. Submit → Redirected to `/verification-pending`
4. Verify in Turso:
   ```sql
   SELECT * FROM profiles WHERE email = 'dr.jane@example.com';
   SELECT * FROM experts WHERE user_id = (SELECT id FROM profiles WHERE email = 'dr.jane@example.com');
   -- Should show: is_verified = 0
   ```

### 3. Admin Approval Test

1. Log in as Admin (role = 'admin' in profiles)
2. Navigate to `/admin/experts`
3. See pending expert "Jane Doe" with credentials
4. Click **Approve**
5. Verify in Turso:
   ```sql
   SELECT * FROM experts WHERE user_id = (SELECT id FROM profiles WHERE email = 'dr.jane@example.com');
   -- Should show: is_verified = 1
   ```
6. Dr. Jane logs in → Can access `/expert/dashboard`

### 4. Consultation Booking Test

1. Log in as Patient
2. Navigate to `/patient/dashboard`
3. Click "Book Consultation" → Select expert "Jane Doe"
4. Fill: Date, Time, Issue Category, Description
5. Submit → Consultation created with status = 'pending'
6. Admin sees it at `/admin/consultations`
7. Admin clicks **Approve** → status = 'confirmed'
8. Expert sees confirmed appointment in `/expert/dashboard`

### 5. Database Diagnostics

Check constraints:
```sql
-- Verify role constraint
PRAGMA table_info(profiles);
-- Should show role CHECK constraint

-- Verify expert verification pending
SELECT COUNT(*) FROM experts WHERE is_verified = 0;

-- Verify consultations
SELECT COUNT(*) FROM consultations WHERE status = 'pending';
```

---

## 🛠 Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm run lint         # ESLint check
npm run db:push     # Push schema to Turso (if using migrations)
```

---

## 📊 Key Differences: Supabase → Turso

| Feature | Supabase | Turso |
|---------|----------|-------|
| **Database** | PostgreSQL | SQLite (libSQL) |
| **Auth** | Built-in Supabase Auth | Custom JWT in `profiles.role` |
| **Queries** | Parameterized / ORM | Raw SQL (libSQL client) |
| **Scalability** | Full ACID + RLS | Lightweight, edge-ready |
| **Cost** | Usage-based | Fixed + edge replication |
| **Expert Verification** | `doctors.verification_status` | `experts.is_verified` (BOOLEAN) |

---

## 🔐 Security Checklist

- ✅ All queries use parameterized statements (SQL injection prevention)
- ✅ Role-based middleware protects routes
- ✅ Admin-only endpoints check `role = 'admin'` server-side
- ✅ Expert must be `is_verified = 1` to access dashboard
- ✅ Consultation data filtered by `client_id` or `expert_id`
- ✅ Timestamps use ISO format for consistency

---

## 📚 Next Steps

1. **Push Turso schema** to your production database
2. **Implement API endpoints** using query helpers (queries.ts)
3. **Build admin dashboard** for expert verification & consultation approval
4. **Set up expert availability** calendar UI
5. **Implement consultation messaging** with real-time updates
6. **Add expert review system** after consultation completion

---

For detailed API implementation examples, see individual API route files in `/src/app/api`.
