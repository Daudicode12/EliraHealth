// src/app/signup/user/page.tsx
import { UserSignupForm } from "@/components/forms/UserSignupForm";
import Link from "next/link";

export const metadata = {
  title: "Create Account - Elira Health",
  description: "Register on Elira Health to connect with medical experts and track your health.",
};

export default function UserSignupPage() {
  return (
    <div className="w-full max-w-lg rounded-2xl bg-card border p-8 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Your Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access specialized care, cycle tracking, and expert medical consultation
        </p>
      </div>

      {/* Info message */}
      <div className="flex items-center gap-2.5 bg-brand/5 border border-brand/10 rounded-lg px-4 py-3">
        <svg
          className="w-5 h-5 text-brand flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <p className="text-xs text-brand-deep font-medium">
          Your personal data and health logs are fully encrypted and private.
        </p>
      </div>

      <UserSignupForm />

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Are you a medical professional?{" "}
          <Link href="/signup/specialist" className="text-brand hover:underline font-medium">
            Register as a specialist here
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Need help?{" "}
        <a href="mailto:support@elirahealth.com" className="text-brand hover:underline font-medium">
          Contact Support
        </a>
      </p>
    </div>
  );
}
