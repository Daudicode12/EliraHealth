"use client";

import { useState, useTransition } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { signupAction } from "@/lib/actions/signup.actions";
import Link from "next/link";

const SPECIALIZATIONS = [
  { value: "Gynecologist", label: "Gynecologist" },
  { value: "Obstetrician", label: "Obstetrician" },
  { value: "Reproductive Endocrinologist", label: "Reproductive Endocrinologist" },
  { value: "Maternal-Fetal Medicine", label: "Maternal-Fetal Medicine" },
  { value: "Gynecologic Oncologist", label: "Gynecologic Oncologist" },
  { value: "Urogynecologist", label: "Urogynecologist" },
];

export function SignupForm() {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signupAction(formData);

      if (!result.success && result.errors) {
        setErrors(result.errors);
        // If email error, show as general error
        if (result.errors.email) {
          setGeneralError(result.errors.email);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      <FormInput
        label="Full Name"
        name="fullName"
        type="text"
        required
        placeholder="Dr. Jane Smith"
        error={errors.fullName}
        disabled={pending}
      />

      <FormInput
        label="Email Address"
        name="email"
        type="email"
        required
        placeholder="jane.smith@hospital.com"
        error={errors.email}
        disabled={pending}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Min. 8 characters"
          error={errors.password}
          disabled={pending}
        />

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          required
          placeholder="Re-enter password"
          error={errors.confirmPassword}
          disabled={pending}
        />
      </div>

      <FormInput
        label="Medical License Number"
        name="licenseNumber"
        type="text"
        required
        placeholder="e.g., LIC-12345"
        error={errors.licenseNumber}
        disabled={pending}
      />

      <FormSelect
        label="Specialization"
        name="specialization"
        required
        options={SPECIALIZATIONS}
        error={errors.specialization}
        disabled={pending}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Hospital / Clinic"
          name="hospital"
          type="text"
          required
          placeholder="City General Hospital"
          error={errors.hospital}
          disabled={pending}
        />

        <FormInput
          label="Years of Experience"
          name="yearsExperience"
          type="number"
          required
          min="0"
          max="70"
          placeholder="e.g., 5"
          error={errors.yearsExperience}
          disabled={pending}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {pending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating Account...
          </>
        ) : (
          "Create Doctor Account"
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
          Sign in
        </Link>
      </p>

      <p className="text-xs text-gray-500 text-center leading-relaxed">
        By signing up, you agree that your account will be reviewed by our admin team.
        You'll be notified once your account is verified.
      </p>
    </form>
  );
}
