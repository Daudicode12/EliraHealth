import { SignupForm } from "@/components/forms/SignupForm";
import Link from "next/link";

export const metadata = {
  title: "Doctor Signup - Elira Health",
  description: "Register as a medical professional on Elira Health platform",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Elira Health</h1>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join Our Medical Network
          </h2>
          <p className="text-gray-600">
            Register as a healthcare provider to connect with patients
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 mb-4">
              <svg
                className="w-5 h-5 text-purple-600 flex-shrink-0"
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
              <p className="text-sm text-purple-800">
                Your account will be reviewed by our team before activation
              </p>
            </div>
          </div>

          <SignupForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a
              href="mailto:support@elirahealth.com"
              className="text-purple-600 hover:text-purple-700"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
