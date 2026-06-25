"use client";

import { useState } from "react";
import { Expert } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Clock, Edit } from "lucide-react";
import { EditDoctorModal } from "./EditDoctorModal";

interface ExpandableDoctorCardProps {
  doctor: Expert & { email: string; phone_number: string };
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onSuspend: (id: string) => Promise<void>;
  onRequestInfo: (id: string, reason: string) => Promise<void>;
}

export function ExpandableDoctorCard({ doctor, onApprove, onReject, onSuspend, onRequestInfo }: ExpandableDoctorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRejecting, setIsReRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRequestingInfo, setIsRequestingInfo] = useState(false);
  const [infoRequestReason, setInfoRequestReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const specialties = JSON.parse(doctor.specialties || "[]");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
      case "suspended":
        return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle size={12} /> Suspended</span>;
      case "profile_incomplete":
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle size={12} /> Info Requested</span>;
      case "pending_review":
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pending Review</span>;
    }
  };

  const handleApprove = async () => {
    if (confirm(`Approve Dr. ${doctor.display_name}? This doctor will gain access to the specialist dashboard.`)) {
      setIsProcessing(true);
      await onApprove(doctor.id);
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }
    setIsProcessing(true);
    await onReject(doctor.id, rejectionReason);
    setIsProcessing(false);
    setIsReRejecting(false);
  };

  const handleRequestInfo = async () => {
    if (!infoRequestReason) {
      alert("Please provide a message specifying the required details.");
      return;
    }
    setIsProcessing(true);
    await onRequestInfo(doctor.id, infoRequestReason);
    setIsProcessing(false);
    setIsRequestingInfo(false);
  };

  return (
    <>
      <Card className="mb-4 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
        <CardHeader className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xl shadow-sm">
              {doctor.display_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{doctor.display_name}</h3>
              <p className="text-sm text-slate-500 font-medium">{doctor.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {getStatusBadge(doctor.profile_status)}
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors rounded-full w-8 h-8 p-0">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-0 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Professional Information */}
              <div className="p-6 md:border-r border-slate-100 bg-slate-50/50">
                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Professional Details
                </h4>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-medium text-slate-900">{doctor.display_name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900">{doctor.phone_number || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Hospital / Clinic</p>
                    <p className="text-sm font-medium text-slate-900">{doctor.hospital_name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm font-medium text-slate-900">{doctor.years_of_experience} years</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Hourly Rate</p>
                    <p className="text-sm font-bold text-slate-900">{doctor.hourly_rate} KES/hr</p>
                  </div>
                </div>
              </div>

              {/* Medical Credentials */}
              <div className="p-6 bg-white">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Medical Credentials
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">License Number</p>
                    <p className="text-sm font-medium text-slate-900 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 inline-block">
                      {doctor.license_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Medical Council Number</p>
                    <p className="text-sm font-medium text-slate-900 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 inline-block">
                      {doctor.medical_council_number || "N/A"}
                    </p>
                  </div>
                  {doctor.practicing_certificate_url && (
                    <div>
                      <a href={doctor.practicing_certificate_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium inline-flex items-center gap-1">
                        View Practicing Certificate &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Specialties
              </h4>
              <div className="flex flex-wrap gap-2">
                {specialties.length === 0 ? (
                  <span className="text-slate-400 text-xs italic">No specialties listed</span>
                ) : (
                  specialties.map((s: string) => (
                    <span key={s} className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">{s}</span>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Biography
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-w-4xl">{doctor.bio || "No biography provided."}</p>
            </div>

            {doctor.rejection_reason && (
              <div className="p-6 border-t border-slate-100 bg-amber-50/20">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  Latest Feedback/Instructions
                </h4>
                <p className="text-sm text-amber-800 leading-relaxed italic">"{doctor.rejection_reason}"</p>
              </div>
            )}

            <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-6 w-full sm:w-auto bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Applied Date</p>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{new Date(doctor.created_at).toLocaleDateString()}</p>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Last Updated</p>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{new Date(doctor.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex w-full sm:w-auto gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl font-semibold shadow-sm flex items-center gap-1.5"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit size={14} />
                  Edit Details
                </Button>

                {doctor.profile_status === "pending_review" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 rounded-xl font-semibold transition-colors shadow-sm"
                      onClick={() => setIsRequestingInfo(true)}
                      disabled={isProcessing}
                    >
                      Request Info
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xl font-semibold transition-colors shadow-sm"
                      onClick={() => setIsReRejecting(true)}
                      disabled={isProcessing}
                    >
                      Reject
                    </Button>
                    <Button 
                      className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-md border-0"
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      Approve
                    </Button>
                  </>
                )}
                {doctor.profile_status === "approved" && (
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none text-slate-600 border-slate-200 hover:bg-slate-50 rounded-xl font-semibold shadow-sm"
                    onClick={() => onSuspend(doctor.id)}
                    disabled={isProcessing}
                  >
                    Suspend Account
                  </Button>
                )}
                {(doctor.profile_status === "suspended" || doctor.profile_status === "rejected" || doctor.profile_status === "profile_incomplete") && (
                  <Button 
                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md border-0"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    Reactivate Account
                  </Button>
                )}
              </div>
            </div>

            {isRejecting && (
              <div className="m-6 p-6 border border-red-100 bg-red-50/30 rounded-2xl animate-in zoom-in-95 duration-200 shadow-inner">
                <h5 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} /> Provide Rejection Reason
                </h5>
                <p className="text-xs font-medium text-red-600/80 mb-4">This reason will be shared with the doctor via their portal.</p>
                <textarea 
                  className="w-full border border-red-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none min-h-[100px] shadow-sm bg-white"
                  placeholder="e.g., Missing medical license documentation. Please re-upload your valid certificate."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setIsReRejecting(false)} className="rounded-lg text-slate-600 hover:bg-slate-200">Cancel</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm" onClick={handleReject} disabled={isProcessing}>
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}

            {isRequestingInfo && (
              <div className="m-6 p-6 border border-amber-100 bg-amber-50/30 rounded-2xl animate-in zoom-in-95 duration-200 shadow-inner">
                <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} /> Request Additional Information
                </h5>
                <p className="text-xs font-medium text-amber-600/80 mb-4">Please specify exactly what details are required. The doctor will see this warning banner upon logging in.</p>
                <textarea 
                  className="w-full border border-amber-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none min-h-[100px] shadow-sm bg-white"
                  placeholder="e.g., Please upload a clearer PDF copy of your clinical license."
                  value={infoRequestReason}
                  onChange={(e) => setInfoRequestReason(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setIsRequestingInfo(false)} className="rounded-lg text-slate-600 hover:bg-slate-200">Cancel</Button>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-sm" onClick={handleRequestInfo} disabled={isProcessing}>
                    Submit Request
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <EditDoctorModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        doctor={doctor}
        onDoctorUpdated={() => window.location.reload()}
      />
    </>
  );
}
