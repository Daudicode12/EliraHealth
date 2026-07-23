"use client";

import { useState } from "react";
import { UserCog, Building, Clock, DollarSign, Save, CheckCircle2, AlertCircle, Phone, Mail, Award, FileCheck, Send, ShieldAlert, BadgeCheck, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SPECIALTIES_OPTIONS = ['Gynecology', 'Fertility', 'Obstetrics', "Women's Health", 'Other'];

export function ProfileForm({ doctor, userProfile, updateAction }: any) {
  const [isPending, setIsPending] = useState(false);
  const [actionType, setActionType] = useState<'save' | 'submit' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const status = doctor.profile_status || 'profile_incomplete';
  let displayStatus = status;
  if (status === 'pending' || status === 'pending_review') displayStatus = 'pending_approval';

  const isReadOnly = displayStatus === 'pending_approval' || displayStatus === 'approved';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!actionType) return;
    
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append("action", actionType);

    if (actionType === 'submit') {
      const specialties = formData.getAll("specialties");
      if (specialties.length === 0) {
        setMessage({ type: 'error', text: 'Please select at least one specialty before submitting for review.' });
        setIsPending(false);
        return;
      }
      
      const requiredFields = ["display_name", "phone_number", "license_number", "medical_council_number", "hospital_name", "practicing_certificate_url"];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          setMessage({ type: 'error', text: 'Please complete all required fields before submitting.' });
          setIsPending(false);
          return;
        }
      }
    }

    try {
      const result = await updateAction(formData);
      if (result.success) {
        if (result.submitted) {
          setMessage({ type: 'success', text: 'Profile submitted for review successfully!' });
        } else {
          setMessage({ type: 'success', text: 'Profile saved successfully!' });
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsPending(false);
      setActionType(null);
    }
  }

  let existingSpecialties: string[] = [];
  try {
    if (doctor.specialties && doctor.specialties !== '[]') {
      existingSpecialties = JSON.parse(doctor.specialties);
    }
  } catch(e) {}

  return (
    <form key={doctor.updated_at || 'initial'} onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border shadow-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
          {message.text}
        </div>
      )}

      {/* Verification Status Section */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <BadgeCheck className="text-indigo-500" size={20} />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {displayStatus === 'profile_incomplete' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-sm font-semibold shadow-sm">
                <ShieldAlert size={16} /> Profile Incomplete
              </div>
            )}
            {displayStatus === 'pending_approval' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 text-sm font-semibold shadow-sm">
                <Clock size={16} /> Pending Review
              </div>
            )}
            {displayStatus === 'approved' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-semibold shadow-sm">
                <ShieldCheck size={16} /> Verified Specialist
              </div>
            )}
            {displayStatus === 'rejected' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 border border-red-200 text-sm font-semibold shadow-sm">
                <AlertCircle size={16} /> Review Required
              </div>
            )}
          </div>
          {displayStatus === 'profile_incomplete' && (
            <p className="text-sm text-slate-500 mt-3">Please fill out all the information below and click &quot;Submit For Review&quot;.</p>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <UserCog className="text-indigo-500" size={20} />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Display Name</label>
            <Input name="display_name" defaultValue={doctor.display_name || ""} placeholder="Dr. John Doe" disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Mail size={14}/> Email</label>
            <Input defaultValue={userProfile?.email || ""} disabled className="bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Phone size={14}/> Phone Number</label>
            <Input name="phone_number" defaultValue={userProfile?.phone_number || ""} placeholder="+254700000000" disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Profile Photo URL</label>
            <Input name="avatar_url" type="url" defaultValue={doctor.avatar_url || ""} placeholder="https://example.com/photo.jpg" disabled={isReadOnly} />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Award className="text-indigo-500" size={20} />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Specialties</label>
            <div className="flex flex-wrap gap-3">
              {SPECIALTIES_OPTIONS.map((spec) => (
                <label key={spec} className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer text-sm font-medium transition-all ${isReadOnly ? 'opacity-70 border-slate-200 bg-slate-50' : 'hover:bg-slate-50 border-slate-200'}`}>
                  <input type="checkbox" name="specialties" value={spec} defaultChecked={existingSpecialties.includes(spec)} className="accent-indigo-600 rounded" disabled={isReadOnly} />
                  {spec}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FileCheck size={14}/> License Number</label>
              <Input name="license_number" defaultValue={doctor.license_number || ""} placeholder="e.g. LIC-98765" disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FileCheck size={14}/> Medical Council No.</label>
              <Input name="medical_council_number" defaultValue={doctor.medical_council_number || ""} placeholder="e.g. MC-12345" disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Building size={14}/> Hospital / Clinic</label>
              <Input name="hospital_name" defaultValue={doctor.hospital_name || ""} placeholder="e.g. Nairobi Hospital" disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FileCheck size={14}/> Practicing Cert URL</label>
              <Input type="url" name="practicing_certificate_url" defaultValue={doctor.practicing_certificate_url || ""} placeholder="https://example.com/certificate.pdf" disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Clock size={14}/> Years Experience</label>
              <Input type="number" name="years_of_experience" min="0" defaultValue={doctor.years_of_experience || ""} placeholder="e.g. 5" disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><DollarSign size={14}/> Hourly Rate (KES)</label>
              <Input type="number" name="hourly_rate" min="0" defaultValue={doctor.hourly_rate || ""} placeholder="e.g. 2500" disabled={isReadOnly} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <UserCog className="text-indigo-500" size={20} />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Professional Bio</label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={doctor.bio || ""}
              disabled={isReadOnly}
              placeholder="Tell patients about your background and expertise..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 resize-none transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end pt-4 pb-12">
        {displayStatus === 'profile_incomplete' || displayStatus === 'rejected' ? (
          <>
            <button
              type="submit"
              disabled={isPending}
              onClick={() => setActionType('save')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 h-11 px-6 rounded-xl font-semibold shadow-sm transition-all"
            >
              <div className="flex items-center gap-2">
                <Save size={18} />
                Save Profile
              </div>
            </button>
            <button
              type="submit"
              disabled={isPending}
              onClick={() => setActionType('submit')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-xl font-semibold shadow-sm transition-all"
            >
              {isPending && actionType === 'submit' ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send size={18} />
                  Submit For Review
                </div>
              )}
            </button>
          </>
        ) : displayStatus === 'pending_approval' ? (
          <div className="bg-slate-100 text-slate-500 border border-slate-200 h-11 px-6 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed shadow-sm">
            <Clock size={18} /> View Submitted Information
          </div>
        ) : (
          <div className="bg-emerald-100 text-emerald-700 border border-emerald-200 h-11 px-6 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed shadow-sm">
            <ShieldCheck size={18} /> Verified Specialist
          </div>
        )}
      </div>
    </form>
  );
}
