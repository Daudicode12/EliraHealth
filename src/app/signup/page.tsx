// src/app/signup/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Join Elira Health",
  description: "Create an account on Elira Health to begin your health tracking or join our medical network",
};

export default function SignupGatewayPage() {
  return (
    <div className="w-full max-w-xl rounded-2xl bg-card border p-8 shadow-sm space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand to-brand-deep bg-clip-text text-transparent">
          Join Elira Health
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choose the account type that matches your needs
        </p>
      </div>

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Card */}
        <Link
          href="/signup/user"
          className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border/80 bg-background/50 hover:bg-gradient-to-b hover:from-white hover:to-brand/5 hover:border-brand/35 hover:-translate-y-1 transition-all duration-300 shadow-sm"
        >
          <div className="space-y-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold group-hover:text-brand transition-colors">
                User Account
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Log cycles, log symptoms, record pregnancy indicators, and schedule virtual medical appointments.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center text-xs font-semibold text-brand gap-1 group-hover:translate-x-1 transition-transform duration-200">
            <span>Register as User</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        {/* Specialist Card */}
        <Link
          href="/signup/specialist"
          className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border/80 bg-background/50 hover:bg-gradient-to-b hover:from-white hover:to-brand-pink/5 hover:border-brand-pink/35 hover:-translate-y-1 transition-all duration-300 shadow-sm"
        >
          <div className="space-y-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-6 h-6"
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
            </div>

            <div>
              <h2 className="text-lg font-bold group-hover:text-brand-pink/90 transition-colors">
                Medical Specialist
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Offer expert advice, list in our practitioner registry, manage appointments, and log consultation records.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center text-xs font-semibold text-brand-pink gap-1 group-hover:translate-x-1 transition-transform duration-200">
            <span>Register as Specialist</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Already have an account?</span>
        <Link href="/login" className="text-brand font-semibold hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
