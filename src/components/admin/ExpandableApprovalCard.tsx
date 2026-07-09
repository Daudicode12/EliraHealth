// src/components/admin/ExpandableApprovalCard.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Activity, 
  User, 
  Video, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface ExpandableApprovalCardProps {
  type: 'appointment' | 'consultation';
  item: any;
  onApprove: (id: string) => Promise<any>;
  onReject: (id: string, reason: string) => Promise<any>;
}

export function ExpandableApprovalCard({ type, item, onApprove, onReject }: ExpandableApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Status mapping
  const status = item.status?.toUpperCase() || 'PENDING';
  
  const getStatusBadge = () => {
    switch (status) {
      case 'CONFIRMED':
      case 'IN_PROGRESS':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200/50 px-2 py-0.5 rounded-full text-xs font-semibold">Confirmed</span>;
      case 'COMPLETED':
        return <span className="bg-green-50 text-green-700 border border-green-200/50 px-2 py-0.5 rounded-full text-xs font-semibold">Completed</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-700 border border-red-200/50 px-2 py-0.5 rounded-full text-xs font-semibold">Cancelled</span>;
      case 'PENDING':
      default:
        return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200/50 px-2 py-0.5 rounded-full text-xs font-semibold">Pending Review</span>;
    }
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to approve this ${type}?`)) {
      setLoading(true);
      try {
        await onApprove(item.id);
      } catch (err) {
        console.error(err);
        alert('Failed to approve.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'consultation' && !rejectionReason) {
      alert('Please enter a cancellation reason.');
      return;
    }
    setLoading(true);
    try {
      await onReject(item.id, rejectionReason);
      setIsRejecting(false);
    } catch (err) {
      console.error(err);
      alert('Failed to cancel.');
    } finally {
      setLoading(false);
    }
  };

  const patientName = `${item.patient_first_name || ''} ${item.patient_last_name || ''}`.trim() || 'Unknown Patient';
  const specialistName = item.specialist_name ? `Dr. ${item.specialist_name}` : 'Pending Match';

  // Format date/time
  const formattedDate = type === 'appointment'
    ? new Date(item.appointment_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : item.scheduled_at 
      ? new Date(item.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
      : 'Not Scheduled';

  const formattedTime = type === 'appointment'
    ? `${item.start_time} - ${item.end_time}`
    : item.scheduled_at
      ? new Date(item.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      : 'TBD';

  return (
    <Card className="mb-4 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
      <CardHeader 
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
            type === 'appointment' 
              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
              : 'bg-purple-50 text-purple-700 border border-purple-100'
          }`}>
            {type === 'appointment' ? <Calendar size={20} /> : <Activity size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-950 text-base">{patientName}</h3>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs text-slate-500 font-semibold uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                {type}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              with <span className="font-semibold text-slate-700">{specialistName}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0" onClick={(e) => e.stopPropagation()}>
          {getStatusBadge()}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors rounded-full w-8 h-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Booking & Timing Details */}
            <div className="p-6 md:border-r border-slate-100 bg-slate-50/30 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                Schedule & Details
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{formattedTime}</p>
                </div>
                {item.duration_minutes && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.duration_minutes} minutes</p>
                  </div>
                )}
                {item.issue_category && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{item.issue_category.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Extra Clinical/Reason Details */}
            <div className="p-6 bg-white space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={14} className="text-slate-400" />
                Patient Notes & Reason
              </h4>
              
              <div>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {type === 'appointment' 
                    ? (item.reason_for_visit || 'No reason for visit provided.') 
                    : (item.issue_description || 'No clinical description provided.')
                  }
                </p>
              </div>

              {item.meeting_url && (
                <div className="pt-2">
                  <a 
                    href={item.meeting_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100/80 px-3 py-1.5 rounded-lg border border-purple-100 transition-all"
                  >
                    <Video size={14} />
                    Launch Telehealth Meeting
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {status === 'PENDING' && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xl font-semibold transition-all"
                onClick={() => setIsRejecting(true)}
                disabled={loading}
              >
                <X size={15} className="mr-1.5" />
                Reject & Cancel
              </Button>
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-md border-0 transition-all"
                onClick={handleApprove}
                disabled={loading}
              >
                <Check size={15} className="mr-1.5" />
                Approve {type === 'appointment' ? 'Appointment' : 'Consultation'}
              </Button>
            </div>
          )}

          {status === 'CANCELLED' && item.cancellation_reason && (
            <div className="p-5 border-t border-slate-100 bg-red-50/10 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Cancellation Reason</p>
                <p className="text-sm text-red-800 mt-1 italic font-medium">"{item.cancellation_reason}"</p>
              </div>
            </div>
          )}

          {/* Rejecting Form Overlay-like Panel */}
          {isRejecting && (
            <div className="m-6 p-6 border border-red-100 bg-red-50/30 rounded-2xl animate-in zoom-in-95 duration-200">
              <h5 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle size={16} /> Provide Cancellation/Rejection Details
              </h5>
              <p className="text-xs font-medium text-red-600/80 mb-4">Please input a short explanation. This will be recorded for reference and shared with the patient.</p>
              <form onSubmit={handleReject}>
                <textarea 
                  className="w-full border border-red-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none min-h-[90px] shadow-sm bg-white"
                  placeholder={type === 'consultation' ? "e.g., Doctor is unavailable. Re-scheduling required." : "e.g., Appointment slot no longer available."}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required={type === 'consultation'}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsRejecting(false)} className="rounded-lg text-slate-600 hover:bg-slate-200">Cancel</Button>
                  <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm" disabled={loading}>
                    Confirm Cancellation
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
