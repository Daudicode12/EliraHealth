"use client";

import React, { useState } from "react";
import { 
  Stethoscope, 
  Award, 
  FileCheck, 
  CheckCircle2, 
  LogOut, 
  ArrowLeft, 
  ArrowRight,
  User,
  Heart,
  Briefcase,
  FileText
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";
import { completeSpecialistOnboarding } from "@/lib/actions/consultant";
import { useRouter } from "next/navigation";

import { Expert } from "@/lib/db/types";

interface OnboardingWizardProps {
  doctor: Expert;
}

const SPECIALTIES_OPTIONS = ['Gynecology', 'Fertility', 'Obstetrics', "Women's Health", 'Other'];
const SUB_SPECIALTIES_OPTIONS = [
  'PCOS Management', 
  'High-Risk Pregnancy', 
  'Lactation Support', 
  'Postpartum Mental Health', 
  'IVF & Fertility Care', 
  'Menopause Management', 
  'Adolescent Gynecology', 
  'Family Planning'
];
const LANGUAGES_OPTIONS = ['English', 'Swahili', 'Luganda', 'French', 'Arabic', 'Other'];

export default function OnboardingWizard({ doctor }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Parse initial specialties
  let initialSpecialties: string[] = [];
  try {
    if (doctor.specialties) {
      initialSpecialties = JSON.parse(doctor.specialties);
    }
  } catch (e) {
    if (typeof doctor.specialties === "string") {
      initialSpecialties = [doctor.specialties];
    }
  }

  // Parse initial subSpecialties
  let initialSubSpecialties: string[] = [];
  try {
    if (doctor.sub_specialties) {
      initialSubSpecialties = JSON.parse(doctor.sub_specialties);
    }
  } catch (e) {}

  // Parse initial languages
  let initialLanguages: string[] = [];
  try {
    if (doctor.languages) {
      initialLanguages = JSON.parse(doctor.languages);
    }
  } catch (e) {}

  // Form states
  const [displayName, setDisplayName] = useState(doctor.display_name || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(doctor.avatar_url || "");
  const [specialties, setSpecialties] = useState<string[]>(initialSpecialties);
  const [subSpecialties, setSubSpecialties] = useState<string[]>(initialSubSpecialties);
  const [languages, setLanguages] = useState<string[]>(initialLanguages);
  const [hospitalName, setHospitalName] = useState(doctor.hospital_name || "");
  const [yearsExperience, setYearsExperience] = useState<number>(doctor.years_of_experience || 0);
  const [bio, setBio] = useState(doctor.bio || "");
  const [licenseNumber, setLicenseNumber] = useState(doctor.license_number || "");
  const [medicalCouncilNumber, setMedicalCouncilNumber] = useState(doctor.medical_council_number || "");
  const [hourlyRate, setHourlyRate] = useState<number>(doctor.hourly_rate || 0);
  const [practicingCertificateUrl, setPracticingCertificateUrl] = useState(doctor.practicing_certificate_url || "");

  // Step validation
  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!displayName.trim()) {
        setError("Display Name is required.");
        return false;
      }
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        setError("Please enter a valid Phone Number (minimum 10 characters).");
        return false;
      }
    } else if (currentStep === 2) {
      if (specialties.length === 0) {
        setError("Please select at least one medical specialty.");
        return false;
      }
      if (subSpecialties.length === 0) {
        setError("Please select at least one focus area / sub-specialty.");
        return false;
      }
      if (languages.length === 0) {
        setError("Please select at least one language you consult in.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!hospitalName.trim()) {
        setError("Hospital / Clinic name is required.");
        return false;
      }
      if (yearsExperience < 0) {
        setError("Years of experience must be 0 or greater.");
        return false;
      }
      if (!licenseNumber.trim()) {
        setError("License number is required.");
        return false;
      }
      if (!medicalCouncilNumber.trim()) {
        setError("Medical Council Registration number is required.");
        return false;
      }
      if (hourlyRate <= 0) {
        setError("Please set a valid consultation hourly rate.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSpecialtyToggle = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  const handleSubSpecialtyToggle = (subSpec: string) => {
    if (subSpecialties.includes(subSpec)) {
      setSubSpecialties(subSpecialties.filter((s) => s !== subSpec));
    } else {
      setSubSpecialties([...subSpecialties, subSpec]);
    }
  };

  const handleLanguageToggle = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setError(null);

    const payload = {
      displayName,
      phoneNumber,
      profilePhoto: profilePhoto || undefined,
      specialties,
      subSpecialties,
      languages,
      hospitalName,
      yearsExperience,
      bio: bio || undefined,
      licenseNumber,
      medicalCouncilNumber,
      hourlyRate,
      practicingCertificateUrl: practicingCertificateUrl || undefined,
    };

    try {
      const response = await completeSpecialistOnboarding(payload);
      if (response.success) {
        router.refresh();
        router.push("/specialist/dashboard");
      } else {
        setError(response.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6 md:px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-gradient-to-br from-brand to-brand-blue text-white p-1.5 rounded-lg shadow-lg">
            <Stethoscope size={20} />
          </div>
          Elira Specialist Onboarding
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl w-full mx-auto space-y-6 py-10 px-4 md:px-0">
        
        {/* Progress Tracker Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 text-brand rounded-xl">
              <Stethoscope size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Step {step} of 4</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {step === 1 && "Clinical Identity & Profile details"}
                {step === 2 && "Configure your medical specialties"}
                {step === 3 && "Verification credentials & pricing"}
                {step === 4 && "Clinical Biography & review"}
              </p>
            </div>
          </div>
          
          {/* Progress Indicator Dots / Connectors */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                    i === step
                      ? "bg-brand border-brand text-white shadow-md shadow-brand/20"
                      : i < step
                      ? "bg-brand/10 border-brand/20 text-brand"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {i < step ? <CheckCircle2 size={14} className="text-brand" /> : i}
                </div>
                {i < 4 && (
                  <div
                    className={`h-0.5 w-6 transition-all ${
                      i < step ? "bg-brand" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Warning reason banner for info request redirection */}
        {doctor.profile_status === 'profile_incomplete' && doctor.rejection_reason && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm px-6 py-4 rounded-2xl shadow-sm space-y-1">
            <h4 className="font-bold text-amber-800 flex items-center gap-2">
              ⚠️ Attention: Information Requested
            </h4>
            <p className="text-amber-700 leading-relaxed font-medium">
              An administrator reviewed your profile and requested the following details before approval:
            </p>
            <div className="bg-white border border-amber-100 p-3 rounded-xl font-mono text-xs text-amber-900 mt-2">
              "{doctor.rejection_reason}"
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2 shadow-sm animate-in fade-in duration-300">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          
          {/* STEP 1: Clinical Identity */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <User size={18} className="text-brand" />
                1. Clinical Identity
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Display Name (Dr. First Last)</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="+254712345678"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Profile Photo URL</label>
                  <input
                    type="url"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Specialties & Expertise */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Award size={18} className="text-brand" />
                2. Professional Expertise & Languages
              </h2>
              
              {/* Primary Specialties */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 block">Primary Specialties (Select one or more)</label>
                <div className="flex flex-wrap gap-2.5">
                  {SPECIALTIES_OPTIONS.map((specialty) => {
                    const isChecked = specialties.includes(specialty);
                    return (
                      <label
                        key={specialty}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-semibold transition-all ${
                          isChecked 
                            ? "border-brand bg-brand/10 text-brand font-semibold"
                            : "border-slate-200 text-slate-700 bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSpecialtyToggle(specialty)}
                          className="accent-brand rounded cursor-pointer w-4 h-4"
                        />
                        {specialty}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Specialties */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 block">Focus Areas & Sub-Specialties (Select one or more)</label>
                <div className="flex flex-wrap gap-2.5">
                  {SUB_SPECIALTIES_OPTIONS.map((subSpec) => {
                    const isChecked = subSpecialties.includes(subSpec);
                    return (
                      <label
                        key={subSpec}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-semibold transition-all ${
                          isChecked 
                            ? "border-brand bg-brand/10 text-brand font-semibold"
                            : "border-slate-200 text-slate-700 bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSubSpecialtyToggle(subSpec)}
                          className="accent-brand rounded cursor-pointer w-4 h-4"
                        />
                        {subSpec}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Languages Spoken */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 block">Languages Spoken (Select one or more)</label>
                <div className="flex flex-wrap gap-2.5">
                  {LANGUAGES_OPTIONS.map((lang) => {
                    const isChecked = languages.includes(lang);
                    return (
                      <label
                        key={lang}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-semibold transition-all ${
                          isChecked 
                            ? "border-brand bg-brand/10 text-brand font-semibold"
                            : "border-slate-200 text-slate-700 bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleLanguageToggle(lang)}
                          className="accent-brand rounded cursor-pointer w-4 h-4"
                        />
                        {lang}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Verification & Credentials */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Briefcase size={18} className="text-brand" />
                3. Clinical Practice & Credentials
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Hospital / Clinic</label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="e.g. Nairobi Hospital"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Years of Experience</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={yearsExperience === 0 ? "" : yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="e.g. 8"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">License Number</label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="e.g. LIC-12345"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Medical Council Registration</label>
                  <input
                    type="text"
                    required
                    value={medicalCouncilNumber}
                    onChange={(e) => setMedicalCouncilNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="e.g. MDC-6789"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Hourly Rate (KES)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={hourlyRate === 0 ? "" : hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="e.g. 3000"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Practicing Certificate Document URL</label>
                  <input
                    type="url"
                    value={practicingCertificateUrl}
                    onChange={(e) => setPracticingCertificateUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    placeholder="https://example.com/certificate.pdf"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Biography & Review */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <FileText size={18} className="text-brand" />
                4. Biography & Application Review
              </h2>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Bio (Optional)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm resize-none"
                  placeholder="Tell us about your medical background..."
                />
              </div>

              {/* Review card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Summary of Information</h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 block font-medium">Display Name</span>
                    <span className="text-slate-800 font-semibold">{displayName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Phone Number</span>
                    <span className="text-slate-800 font-semibold">{phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Primary Specialties</span>
                    <span className="text-slate-800 font-semibold">{specialties.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Focus Areas</span>
                    <span className="text-slate-800 font-semibold">{subSpecialties.join(", ")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block font-medium">Languages Spoken</span>
                    <span className="text-slate-800 font-semibold">{languages.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Affiliated Hospital</span>
                    <span className="text-slate-800 font-semibold">{hospitalName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Experience</span>
                    <span className="text-slate-800 font-semibold">{yearsExperience} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">License Number</span>
                    <span className="text-slate-800 font-semibold">{licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Medical Council Reg.</span>
                    <span className="text-slate-800 font-semibold">{medicalCouncilNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Hourly Rate</span>
                    <span className="text-slate-800 font-semibold">{hourlyRate} KES/hr</span>
                  </div>
                  {practicingCertificateUrl && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-medium">Certificate Document</span>
                      <a href={practicingCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline truncate block">
                        {practicingCertificateUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-600 text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand hover:bg-brand-deep text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-brand hover:bg-brand-deep disabled:bg-brand/50 text-white font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer min-w-[140px]"
              >
                {loading ? (
                  <span className="border-2 border-white border-t-transparent w-4 h-4 rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Profile
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
