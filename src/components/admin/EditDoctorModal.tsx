// src/components/admin/EditDoctorModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Save, ShieldAlert } from 'lucide-react';
import { updateDoctorDetailsAction } from '@/lib/actions/admin';

interface EditDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
  onDoctorUpdated?: () => void;
}

export function EditDoctorModal({ isOpen, onClose, doctor, onDoctorUpdated }: EditDoctorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Specialties / languages format conversion
  const parseJsonField = (field: any) => {
    if (!field) return '';
    try {
      const arr = typeof field === 'string' ? JSON.parse(field) : field;
      return Array.isArray(arr) ? arr.join(', ') : '';
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    display_name: doctor.display_name || '',
    email: doctor.email || '',
    phone_number: doctor.phone_number || '',
    bio: doctor.bio || '',
    hospital_name: doctor.hospital_name || '',
    years_of_experience: doctor.years_of_experience || 0,
    hourly_rate: doctor.hourly_rate || 0,
    license_number: doctor.license_number || '',
    medical_council_number: doctor.medical_council_number || '',
    specialties: parseJsonField(doctor.specialties),
    sub_specialties: parseJsonField(doctor.sub_specialties),
    languages: parseJsonField(doctor.languages),
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Parse comma separated strings back to JSON lists
    const cleanList = (val: string) => {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const submitData = {
      ...formData,
      specialties: cleanList(formData.specialties),
      sub_specialties: cleanList(formData.sub_specialties),
      languages: cleanList(formData.languages),
      years_of_experience: Number(formData.years_of_experience),
      hourly_rate: Number(formData.hourly_rate),
    };

    try {
      const res = await updateDoctorDetailsAction(doctor.id, submitData);
      if (res.success) {
        onClose();
        if (onDoctorUpdated) onDoctorUpdated();
      } else {
        setError('Failed to update details. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-purple-600" size={20} />
              Edit Specialist Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Modify clinical details and credentials for {doctor.display_name}.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Display Name</label>
              <input
                type="text"
                name="display_name"
                required
                value={formData.display_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Hospital / Clinic</label>
              <input
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                min="0"
                value={formData.years_of_experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Hourly Consultation Rate (KES)</label>
              <input
                type="number"
                name="hourly_rate"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">License Number</label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Medical Council Number</label>
              <input
                type="text"
                name="medical_council_number"
                value={formData.medical_council_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          {/* Full-width fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Bio</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Doctor's brief bio and details..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50 resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Specialties (comma-separated)</label>
              <input
                type="text"
                name="specialties"
                value={formData.specialties}
                onChange={handleChange}
                placeholder="e.g. Gynecology, Obstetrics, Reproductive Health"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Sub Specialties (comma-separated)</label>
              <input
                type="text"
                name="sub_specialties"
                value={formData.sub_specialties}
                onChange={handleChange}
                placeholder="e.g. Fertility Treatments, IVF"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Languages (comma-separated)</label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g. English, Swahili"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-400 text-white font-semibold rounded-xl shadow-sm transition-all text-sm"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
