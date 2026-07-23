"use client";

import { useState } from "react";
import { Stethoscope, Award, FileCheck, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const SPECIALTIES_OPTIONS = ['Gynecology', 'Fertility', 'Obstetrics', "Women's Health", 'Other'];

export function CompleteProfileForm({ doctor, submitAction }: { doctor: any, submitAction: (formData: FormData) => Promise<{ success: boolean; error?: string }> }) {
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    
    // Ensure at least one specialty is selected
    const specialties = formData.getAll("specialties");
    if (specialties.length === 0) {
      setErrorMsg("Please select at least one specialty.");
      setIsPending(false);
      return;
    }

    try {
      const result = await submitAction(formData);
      if (!result.success) {
        setErrorMsg(result.error || "Failed to submit profile.");
      }
      // If success, the server action will handle the redirect
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm font-medium border bg-red-500/10 text-red-600 border-red-500/20">
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Section 1: Basic Info */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
          <CheckCircle2 size={18} className="text-purple-600" />
          1. Clinical Identity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Display Name (Dr. First Last)</label>
            <input
              type="text"
              name="displayName"
              defaultValue={doctor.display_name || ""}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="+254712345678"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Profile Photo URL</label>
            <input
              type="url"
              name="profilePhoto"
              defaultValue={doctor.avatar_url || ""}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Specialties */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
          <Award size={18} className="text-purple-600" />
          2. Medical Specialties
        </h2>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Select Specialties (Choose one or more)</label>
          <div className="flex flex-wrap gap-3">
            {SPECIALTIES_OPTIONS.map((specialty) => (
              <label
                key={specialty}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium transition-all"
              >
                <input
                  type="checkbox"
                  name="specialties"
                  value={specialty}
                  className="accent-purple-600 rounded"
                />
                {specialty}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Credentials */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
          <FileCheck size={18} className="text-purple-600" />
          3. Verification & Credentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Medical License Number</label>
            <input
              type="text"
              name="licenseNumber"
              defaultValue={doctor.license_number || ""}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="e.g. LIC-98765"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Medical Council Number</label>
            <input
              type="text"
              name="medicalCouncilNumber"
              defaultValue={doctor.medical_council_number || ""}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="e.g. MC-12345"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Hospital / Clinic</label>
            <input
              type="text"
              name="hospitalName"
              defaultValue={doctor.hospital_name || ""}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="e.g. Nairobi Hospital"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Practicing Certificate URL</label>
            <input
              type="url"
              name="practicingCertificateUrl"
              defaultValue={doctor.practicing_certificate_url || ""}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="https://example.com/certificate.pdf"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Years of Experience</label>
            <input
              type="number"
              name="yearsExperience"
              defaultValue={doctor.years_of_experience || ""}
              required
              min="0"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="e.g. 8"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Hourly Rate (KES)</label>
            <input
              type="number"
              name="hourlyRate"
              defaultValue={doctor.hourly_rate || ""}
              required
              min="0"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              placeholder="e.g. 3000"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Biography */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
          <Award size={18} className="text-purple-600" />
          4. Clinical Biography
        </h2>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Bio (Optional)</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={doctor.bio || ""}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm resize-none"
            placeholder="Tell us about your medical background..."
          />
        </div>
      </div>

      {/* Submit Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <a
          href="/specialist/dashboard"
          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-colors text-sm flex items-center justify-center"
        >
          Cancel
        </a>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 h-11"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Submitting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save size={18} />
              Submit for Review
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
