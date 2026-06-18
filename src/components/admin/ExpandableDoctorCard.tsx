"use client";

import { useState } from "react";
import { Expert } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface ExpandableDoctorCardProps {
  doctor: Expert & { email: string; phone_number: string };
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onSuspend: (id: string) => Promise<void>;
}

export function ExpandableDoctorCard({ doctor, onApprove, onReject, onSuspend }: ExpandableDoctorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRejecting, setIsReRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const specialties = JSON.parse(doctor.specialties || "[]");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
      case "suspended":
        return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle size={12} /> Suspended</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pending</span>;
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

  return (
    <Card className="mb-4 overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
            {doctor.display_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{doctor.display_name}</h3>
            <p className="text-sm text-gray-500">{doctor.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(doctor.verification_status)}
          <Button variant="ghost" size="sm" className="text-purple-600 font-medium">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 border-t bg-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Professional Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium">{doctor.display_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{doctor.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium">{doctor.phone_number || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hospital / Clinic</p>
                  <p className="text-sm font-medium">{doctor.hospital_name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Years of Experience</p>
                  <p className="text-sm font-medium">{doctor.years_of_experience} years</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hourly Rate</p>
                  <p className="text-sm font-medium">{doctor.currency} {doctor.hourly_rate}</p>
                </div>
              </div>
            </div>

            {/* Medical Credentials */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medical Credentials</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">License Number</p>
                  <p className="text-sm font-medium">{doctor.license_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Medical Council Number</p>
                  <p className="text-sm font-medium">{doctor.medical_council_number || "N/A"}</p>
                </div>
                {doctor.practicing_certificate_url && (
                  <div>
                    <p className="text-xs text-gray-500">Practicing Certificate</p>
                    <a href={doctor.practicing_certificate_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline font-medium">View Document</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s: string) => (
                <span key={s} className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{doctor.bio || "No biography provided."}</p>
          </div>

          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Applied Date</p>
                <p className="text-xs text-gray-600">{new Date(doctor.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Last Updated</p>
                <p className="text-xs text-gray-600">{new Date(doctor.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {doctor.verification_status === "pending" && (
                <>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setIsReRejecting(true)}
                    disabled={isProcessing}
                  >
                    Reject Doctor
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    Approve Doctor
                  </Button>
                </>
              )}
              {doctor.verification_status === "approved" && (
                <Button 
                  variant="outline" 
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  onClick={() => onSuspend(doctor.id)}
                  disabled={isProcessing}
                >
                  Suspend Account
                </Button>
              )}
              {(doctor.verification_status === "suspended" || doctor.verification_status === "rejected") && (
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  Reactivate Account
                </Button>
              )}
            </div>
          </div>

          {isRejecting && (
            <div className="mt-6 p-6 border-2 border-red-100 bg-white rounded-xl shadow-inner animate-in zoom-in-95 duration-200">
              <h5 className="font-bold text-red-700 mb-2">Rejection Reason</h5>
              <p className="text-xs text-gray-500 mb-4">Please provide a detailed reason for rejecting this application. This will be shared with the doctor.</p>
              <textarea 
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]"
                placeholder="e.g., Missing medical license documentation. Please re-upload your valid certificate."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" size="sm" onClick={() => setIsReRejecting(false)}>Cancel</Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject} disabled={isProcessing}>
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
