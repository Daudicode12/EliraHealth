// src/app/signup/specialist/page.tsx
import { SpecialistSignupForm } from "@/components/forms/SpecialistSignupForm";
import Link from "next/link";

export const metadata = {
  title: "Specialist Signup - Elira Health",
  description: "Register as a medical professional on Elira Health platform",
};

export default function SpecialistSignupPage() {
  return (
    <div className="w-full max-w-lg rounded-2xl bg-card border p-8 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Join Our Medical Network</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register as a healthcare provider to connect with clients
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs text-brand-deep font-medium">
          Your account will be reviewed by our team before activation
        </p>
      </div>

      <SpecialistSignupForm />

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Looking for the user portal?{" "}
          <Link href="/signup/user" className="text-brand hover:underline font-medium">
            Register as a user here
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
