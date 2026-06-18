# Doctor Verification & Approval Workflow

This document outlines the complete workflow for specialist (doctor) verification and approval within the Elira Health platform. This system ensures that only verified medical professionals can access the specialist dashboards and patient functionality.

## 1. Database Schema Changes

The system was migrated from a simple boolean flag (`is_verified`) to a comprehensive status-based workflow.

### The `experts` Table Updates
The `experts` table in Turso SQLite now uses the following key fields for verification:

*   **`verification_status`** (`TEXT`): The core state machine. Allowed values:
    *   `'pending'`: Default state upon registration.
    *   `'approved'`: Grants full access to the specialist dashboard.
    *   `'rejected'`: Denies access, records a reason.
    *   `'suspended'`: Temporarily revokes access for previously approved accounts.
*   **`license_number`** (`TEXT`): Replaced the generic `credentials` field.
*   **`medical_council_number`** (`TEXT`): Additional verification identifier.
*   **`practicing_certificate_url`** (`TEXT`): Link to uploaded documents.
*   **`hospital_name`** (`TEXT`): Primary practice location.
*   **`verified_at`** (`TEXT`): ISO Timestamp of when the approval occurred.
*   **`verified_by`** (`TEXT`): The ID of the admin who approved the account.
*   **`rejection_reason`** (`TEXT`): The specific reason provided by the admin if rejected.
*   **`admin_notes`** (`TEXT`): Internal notes for administrators.

## 2. Specialist Access & Protection

Access control is enforced at the **Middleware** layer (`src/middleware.ts`) using the `auth-token` cookie payload.

### Routing Logic
When a user with the role of `expert` attempts to access any route under `/doctor/*`:

1.  **Pending (`verification_status === 'pending'`)**
    *   Redirected to: `/verification-pending`
    *   Experience: Standard waiting screen.
2.  **Rejected (`verification_status === 'rejected'`)**
    *   Redirected to: `/application-rejected`
    *   Experience: Sees a red alert screen displaying the exact `rejection_reason` pulled from the database and a prompt to contact support.
3.  **Suspended (`verification_status === 'suspended'`)**
    *   Redirected to: `/account-suspended`
    *   Experience: Sees a warning screen instructing them to contact the platform administrator.
4.  **Approved (`verification_status === 'approved'`)**
    *   Allowed through to the requested `/doctor/*` route.

## 3. Admin Management Interface

Administrators manage applications via the `/admin/doctors` route.

### Tabbed Dashboard
The page organizes doctors into four dynamic tabs, displaying real-time counts:
*   Pending (x)
*   Approved (y)
*   Rejected (z)
*   Suspended (w)

### `ExpandableDoctorCard` Component
This custom UI component (`src/components/admin/ExpandableDoctorCard.tsx`) provides a streamlined review process:

*   **Collapsed State:** Shows the doctor's avatar, name, email, and current status badge.
*   **Expanded State:** Reveals a comprehensive profile including:
    *   **Professional Information:** Phone, Hospital, Experience, Hourly Rate.
    *   **Medical Credentials:** License, Council Number, Certificate Links.
    *   **Specialties:** Displayed as visual badges.
    *   **Bio:** Full biography text.
    *   **Audit Trail:** Applied Date and Last Updated Date.
*   **Action Workflow:**
    *   **Approve:** Standard confirmation dialog (`window.confirm`). Triggers the `approveExpert` action.
    *   **Reject:** Opens an inline form requiring the admin to type a `rejectionReason`. The button remains disabled until a reason is provided. Triggers the `rejectExpert` action.
    *   **Suspend:** Available for approved doctors to temporarily revoke access. Triggers the `suspendExpert` action.
    *   **Reactivate:** Available for rejected/suspended doctors to move them back to the `approved` state.

## 4. Notifications Integration

System notifications are integrated directly into the database query layer (`src/lib/db/queries.ts`). 

Whenever a status change occurs (`approveExpert`, `rejectExpert`, `suspendExpert`), a call is made to the `createNotification` placeholder function. 

*   **Approved:** `"Congratulations! Your specialist account has been approved."` (Type: `success`)
*   **Rejected:** `"Your specialist application was not approved."` (Type: `error`)
*   **Suspended:** `"Your specialist account has been suspended."` (Type: `warning`)

*Note: Currently, `createNotification` logs to the server console. It is designed to be easily wired up to the final `notifications` table.*

## 5. End-to-End Workflow Summary

1.  **Signup:** Doctor submits the form at `/signup`.
2.  **Database Insert:** `profiles` and `experts` records are created. `verification_status` is explicitly set to `pending`.
3.  **Redirect:** Doctor is routed to `/verification-pending`.
4.  **Admin Review:** Admin navigates to `/admin/doctors`, expands the new pending card.
5.  **Decision:** 
    *   If **Approved**, `verification_status` becomes `approved`. Next login, doctor accesses `/doctor/dashboard`.
    *   If **Rejected**, admin types a reason. `verification_status` becomes `rejected`. Next login, doctor accesses `/application-rejected` and sees the reason.
