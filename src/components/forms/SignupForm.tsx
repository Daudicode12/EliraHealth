"use client";

import { useActionState } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { signupAction, SignupState } from "@/lib/actions/signup.actions";
import Link from "next/link";

const SPECIALIZATIONS = [
  { value: "Gynecologist", label: "Gynecologist" },
  { value: "Obstetrician", label: "Obstetrician" },
  { value: "Reproductive Endocrinologist", label: "Reproductive Endocrinologist" },
  { value: "Maternal-Fetal Medicine", label: "Maternal-Fetal Medicine" },
  { value: "Gynecologic Oncologist", label: "Gynecologic Oncologist" },
  { value: "Urogynecologist", label: "Urogynecologist" },
];

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.message}
        </div>
      )}

      <FormInput
        label="Full Name"
        name="fullName"
        type="text"
        required
        placeholder="Dr. Jane Smith"
        error={state?.errors?.fullName}
        disabled={isPending}
      />

      <FormInput
        label="Email Address"
        name="email"
        type="email"
        required
        placeholder="jane.smith@hospital.com"
        error={state?.errors?.email}
        disabled={isPending}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Min. 8 characters"
          error={state?.errors?.password}
          disabled={isPending}
        />

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          required
          placeholder="Re-enter password"
          error={state?.errors?.confirmPassword}
          disabled={isPending}
        />
      </div>

      <FormInput
        label="Medical License Number"
        name="licenseNumber"
        type="text"
        required
        placeholder="e.g., LIC-12345"
        error={state?.errors?.licenseNumber}
        disabled={isPending}
      />

      <FormSelect
        label="Specialization"
        name="specialization"
        required
        options={SPECIALIZATIONS}
        error={state?.errors?.specialization}
        disabled={isPending}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Hospital / Clinic"
          name="hospital"
          type="text"
          required
          placeholder="City General Hospital"
          error={state?.errors?.hospital}
          disabled={isPending}
        />

        <FormInput
          label="Years of Experience"
          name="yearsExperience"
          type="number"
          required
          min="0"
          max="70"
          placeholder="e.g., 5"
          error={state?.errors?.yearsExperience}
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isPending ? "Creating Account..." : "Create Doctor Account"}
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
