"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ConsultationData {
  id: string;
  appointment_id: string;
  patient_id: string;
  specialist_id: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  patient_date_of_birth: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit: string | null;
  specialist_name: string;
}

interface NotesData {
  id: string;
  consultation_id: string;
  chief_complaint: string | null;
  symptoms: string | null;
  assessment: string | null;
  recommendations: string | null;
  follow_up_required: number;
  follow_up_date: string | null;
}

interface Props {
  consultation: ConsultationData;
  notes: NotesData | null;
  patientAge: number | null;
  specialistId: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ConsultationDetailClient({ consultation, notes, patientAge, specialistId }: Props) {
  const router = useRouter();
  const isCompleted = consultation.status === 'completed';
  const isCancelled = consultation.status === 'cancelled';
  const isReadOnly = isCompleted || isCancelled;

  const [form, setForm] = useState({
    chief_complaint: notes?.chief_complaint || '',
    symptoms: notes?.symptoms || '',
    assessment: notes?.assessment || '',
    recommendations: notes?.recommendations || '',
    follow_up_required: notes?.follow_up_required === 1,
    follow_up_date: notes?.follow_up_date || '',
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [completing, setCompleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce
  const autoSave = useCallback(async (data: typeof form) => {
    if (isReadOnly) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/specialist/consultations/${consultation.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          follow_up_required: data.follow_up_required ? 1 : 0,
        }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  }, [consultation.id, isReadOnly]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    setErrors((prev) => ({ ...prev, [field]: '' }));

    // Debounced auto-save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => autoSave(newForm), 1500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handleComplete = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    if (!form.chief_complaint.trim()) newErrors.chief_complaint = 'Chief complaint is required';
    if (!form.assessment.trim()) newErrors.assessment = 'Assessment is required';
    if (form.follow_up_required && !form.follow_up_date) newErrors.follow_up_date = 'Follow-up date is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowCompleteConfirm(false);
      return;
    }

    setCompleting(true);
    try {
      const res = await fetch(`/api/specialist/consultations/${consultation.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          follow_up_required: form.follow_up_required ? 1 : 0,
        }),
      });
      
      if (res.ok) {
        router.push('/specialist/consultations?tab=completed');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to complete consultation');
      }
    } catch {
      alert('Failed to complete consultation');
    } finally {
      setCompleting(false);
      setShowCompleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/specialist/consultations" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Consultations
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Consultation Details
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[consultation.status] || 'bg-gray-100 text-gray-700'}`}>
            {STATUS_LABELS[consultation.status] || consultation.status}
          </span>
          {/* Auto-save indicator */}
          {saveStatus === 'saving' && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <span className="animate-pulse-dot">●</span> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600">✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-600">⚠ Save failed</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Appointment Info */}
        <div className="space-y-4">
          {/* Patient Card */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span> Patient Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {(consultation.patient_first_name?.[0] || '').toUpperCase()}{(consultation.patient_last_name?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {consultation.patient_first_name} {consultation.patient_last_name}
                  </p>
                  {patientAge !== null && (
                    <p className="text-xs text-gray-500">{patientAge} years old</p>
                  )}
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                {consultation.patient_email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>📧</span>
                    <span>{consultation.patient_email}</span>
                  </div>
                )}
                {consultation.patient_phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>📞</span>
                    <span>{consultation.patient_phone}</span>
                  </div>
                )}
                {consultation.patient_date_of_birth && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>🎂</span>
                    <span>{formatDate(consultation.patient_date_of_birth)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Card */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📅</span> Appointment Information
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{formatDate(consultation.appointment_date)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{formatTime(consultation.start_time)} – {formatTime(consultation.end_time)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Specialist</span>
                <span className="font-medium text-gray-900">Dr. {consultation.specialist_name}</span>
              </div>
              {consultation.started_at && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Started</span>
                  <span className="font-medium text-gray-900">{formatDateTime(consultation.started_at)}</span>
                </div>
              )}
              {consultation.ended_at && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Ended</span>
                  <span className="font-medium text-gray-900">{formatDateTime(consultation.ended_at)}</span>
                </div>
              )}
              {consultation.reason_for_visit && (
                <div className="border-t pt-2.5 mt-2.5">
                  <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                  <p className="text-xs text-gray-700 italic">"{consultation.reason_for_visit}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Consultation Notes */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span>📝</span> Consultation Notes
              {isCompleted && <span className="text-xs font-normal text-gray-400 ml-2">(Read-only)</span>}
            </h3>

            <div className="space-y-5">
              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Chief Complaint <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.chief_complaint}
                  onChange={(e) => handleFieldChange('chief_complaint', e.target.value)}
                  placeholder="What is the patient's main concern?"
                  rows={3}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600 ${
                    errors.chief_complaint ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'
                  }`}
                />
                {errors.chief_complaint && (
                  <p className="text-xs text-red-500 mt-1">{errors.chief_complaint}</p>
                )}
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Symptoms
                </label>
                <textarea
                  value={form.symptoms}
                  onChange={(e) => handleFieldChange('symptoms', e.target.value)}
                  placeholder="Describe the symptoms observed..."
                  rows={3}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Assessment */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Assessment <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.assessment}
                  onChange={(e) => handleFieldChange('assessment', e.target.value)}
                  placeholder="Your professional assessment..."
                  rows={4}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600 ${
                    errors.assessment ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'
                  }`}
                />
                {errors.assessment && (
                  <p className="text-xs text-red-500 mt-1">{errors.assessment}</p>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Recommendations
                </label>
                <textarea
                  value={form.recommendations}
                  onChange={(e) => handleFieldChange('recommendations', e.target.value)}
                  placeholder="Treatment plan, medications, lifestyle changes..."
                  rows={4}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Follow-up */}
              <div className="border-t pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.follow_up_required}
                      onChange={(e) => handleFieldChange('follow_up_required', e.target.checked)}
                      disabled={isReadOnly}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Follow-up Required</span>
                  </label>
                </div>

                {form.follow_up_required && (
                  <div className="animate-slide-down">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Follow-up Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.follow_up_date}
                      onChange={(e) => handleFieldChange('follow_up_date', e.target.value)}
                      disabled={isReadOnly}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full max-w-xs px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600 ${
                        errors.follow_up_date ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'
                      }`}
                    />
                    {errors.follow_up_date && (
                      <p className="text-xs text-red-500 mt-1">{errors.follow_up_date}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isReadOnly && (
                <div className="border-t pt-5 flex items-center justify-between">
                  <button
                    onClick={() => autoSave(form)}
                    disabled={saving}
                    className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-colors"
                  >
                    💾 Save Notes
                  </button>

                  {!showCompleteConfirm ? (
                    <button
                      onClick={() => setShowCompleteConfirm(true)}
                      className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                      ✅ Complete Consultation
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-slide-down">
                      <span className="text-xs text-gray-500">Are you sure?</span>
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        {completing ? 'Completing...' : 'Yes, Complete'}
                      </button>
                      <button
                        onClick={() => setShowCompleteConfirm(false)}
                        className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
