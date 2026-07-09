// src/components/forms/UserSignupForm.tsx
"use client";

import { useActionState } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { signupUserAction, SignupState } from "@/lib/actions/signup-user.actions";
import Link from "next/link";

const initialState: SignupState = {};

export function UserSignupForm() {
  const [state, formAction, isPending] = useActionState(signupUserAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="firstName"
          type="text"
          required
          placeholder="Jane"
          error={state?.errors?.firstName}
          disabled={isPending}
        />

        <FormInput
          label="Last Name"
          name="lastName"
          type="text"
          required
          placeholder="Smith"
          error={state?.errors?.lastName}
          disabled={isPending}
        />
      </div>

      <FormInput
        label="Email Address"
        name="email"
        type="email"
        required
        placeholder="jane.smith@example.com"
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

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-brand to-brand-deep hover:shadow-lg hover:shadow-brand/25 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
      >
        {isPending ? "Creating Account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline font-medium">
          Sign in
        </Link>
      </p>

      <p className="text-xs text-gray-500 text-center leading-relaxed">
        By signing up, you agree to our Terms of Service and Privacy Policy. You can start tracking your health immediately.
      </p>
    </form>
  );
}
