"use client";

import { useState, useTransition } from "react";
import { 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Check, 
  Activity, 
  Moon, 
  Baby, 
  FileText, 
  Smile, 
  MessageSquare, 
  PlusCircle, 
  Copy, 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  Info,
  ChevronDown
} from "lucide-react";
import { 
  setOnboardingModeAction, 
  getOrCreatePartnerInvitationAction, 
  partnerConnectAction, 
  logCycleSymptomAction, 
  logNewCycleStartAction,
  logPregnancySymptomAction, 
  logBabyKickAction, 
  logFeedingSessionAction, 
  logBabySleepAction, 
  logBabyWeightAction, 
  logMoodRecordAction, 
  bookAppointmentAction, 
  cancelAppointmentAction,
  sendPartnerMessageAction
} from "@/lib/actions/user.actions";

interface Expert {
  id: string;
  display_name: string;
  specialties: string; // JSON string
  hospital_name: string;
  avatar_url?: string | null;
}

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  phone_number: string | null;
  current_cycle_mode: string | null;
  average_cycle_length?: number | null;
  average_period_length?: number | null;
}

interface Appointment {
  id: string;
  patient_id: string;
  specialist_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit?: string | null;
  status: string;
  specialist_name: string;
}

interface UserDashboardClientProps {
  profile: Profile;
  experts: Expert[];
  appointments: Appointment[];
  partnerCode: string | null;
  connectedPartner: {
    first_name: string;
    last_name: string;
    email: string;
    partner_mode: string;
    partner_user_id: string;
  } | null;
  // Dynamic history props passed from database
  cycleSymptoms?: any[];
  pregnancySymptoms?: any[];
  babyKicks?: any[];
  feedingSessions?: any[];
  babySleepLogs?: any[];
  babyWeightLogs?: any[];
  moodRecords?: any[];
  partnerInsights?: any[];
  pregnancyDetails?: any;
  postpartumDetails?: any;
  latestCycle?: any;
}

export function UserDashboardClient({
  profile,
  experts,
  appointments,
  partnerCode: initialPartnerCode,
  connectedPartner,
  cycleSymptoms = [],
  pregnancySymptoms = [],
  babyKicks = [],
  feedingSessions = [],
  babySleepLogs = [],
  babyWeightLogs = [],
  moodRecords = [],
  partnerInsights = [],
  pregnancyDetails,
  postpartumDetails,
  latestCycle,
}: UserDashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<string | null>(profile.current_cycle_mode);
  const [selectedOnboardingMode, setSelectedOnboardingMode] = useState<"tracking" | "pregnant" | "postpartum" | "partner" | null>(null);
  
  // Onboarding states
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [conceptionDate, setConceptionDate] = useState(new Date().toISOString().split("T")[0]);
  const [babyNickname, setBabyNickname] = useState("");
  const [babyGender, setBabyGender] = useState<"unknown" | "boy" | "girl">("unknown");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [babyName, setBabyName] = useState("");
  const [babyBirthWeight, setBabyBirthWeight] = useState("");
  const [babyBirthLength, setBabyBirthLength] = useState("");
  const [partnerInviteInput, setPartnerInviteInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tracking modal sub-tab
  const [trackingModalTab, setTrackingModalTab] = useState<"symptom" | "new_cycle">("symptom");
  const [newCycleDate, setNewCycleDate] = useState(new Date().toISOString().split("T")[0]);

  // Sharing states
  const [myPartnerCode, setMyPartnerCode] = useState<string | null>(initialPartnerCode);
  const [copied, setCopied] = useState(false);

  // Logging states
  const [activeLoggingModal, setActiveLoggingModal] = useState<string | null>(null);
  
  // Symptoms states
  const [symptomType, setSymptomType] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState(3);
  const [symptomNotes, setSymptomNotes] = useState("");
  
  // Kick state
  const [kickCount, setKickCount] = useState(10);
  
  // Feeding state
  const [feedingMethod, setFeedingMethod] = useState<"breast" | "bottle" | "combination" | "solid">("breast");
  const [feedingSide, setFeedingSide] = useState<"left" | "right" | "both">("both");
  const [feedingAmount, setFeedingAmount] = useState("");
  const [feedingNotes, setFeedingNotes] = useState("");
  
  // Sleep state
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");
  
  // Weight state
  const [babyWeight, setBabyWeight] = useState("");
  
  // Mood state
  const [maternalMood, setMaternalMood] = useState<"great" | "good" | "okay" | "low" | "struggling">("good");
  const [moodNotes, setMoodNotes] = useState("");

  // Booking states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentStartTime, setAppointmentStartTime] = useState("");
  const [appointmentEndTime, setAppointmentEndTime] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");

  // Partner messaging state
  const [partnerMessage, setPartnerMessage] = useState("");

  // Dynamic calculations for menstrual cycle
  let currentCycleDay = "No Data";
  let currentCycleDaySubtitle = "Log period to start tracking";
  let nextPeriodStarts = "No Data";
  let nextPeriodStartsSubtitle = "Cycle not started";
  let fertilityStatus = "Unknown";
  let fertilityStatusSubtitle = "Log last period start date";
  
  if (latestCycle) {
    const cycleLengthVal = latestCycle.cycle_length || profile.average_cycle_length || 28;
    const periodLengthVal = latestCycle.period_length || profile.average_period_length || 5;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(latestCycle.start_date);
    start.setHours(0, 0, 0, 0);
    
    // Difference in days
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // We add 1 because Day 1 is the start_date itself
    const day = diffDays + 1;
    
    if (day > 0) {
      if (day <= cycleLengthVal) {
        currentCycleDay = `Day ${day}`;
        if (day <= periodLengthVal) {
          currentCycleDaySubtitle = "Bleeding phase / Period";
        } else {
          currentCycleDaySubtitle = "Follicular phase";
        }
      } else {
        const lateDays = day - cycleLengthVal;
        currentCycleDay = `Day ${day}`;
        currentCycleDaySubtitle = `Cycle late by ${lateDays} day${lateDays > 1 ? 's' : ''}`;
      }
    } else {
      currentCycleDay = "Future Start";
      currentCycleDaySubtitle = `Starts in ${Math.abs(day)} day${Math.abs(day) > 1 ? 's' : ''}`;
    }
    
    // Next period starts calculation
    const predictedNext = latestCycle.predicted_next_cycle 
      ? new Date(latestCycle.predicted_next_cycle)
      : new Date(start.getTime() + cycleLengthVal * 24 * 60 * 60 * 1000);
    predictedNext.setHours(0, 0, 0, 0);
    
    const diffToNext = Math.ceil((predictedNext.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffToNext > 0) {
      nextPeriodStarts = `${diffToNext} Day${diffToNext > 1 ? 's' : ''}`;
      nextPeriodStartsSubtitle = `Expected on ${predictedNext.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    } else if (diffToNext === 0) {
      nextPeriodStarts = "Today";
      nextPeriodStartsSubtitle = "Period expected today";
    } else {
      nextPeriodStarts = "Overdue";
      nextPeriodStartsSubtitle = `${Math.abs(diffToNext)} day${Math.abs(diffToNext) > 1 ? 's' : ''} overdue`;
    }
    
    // Fertility window calculation (typically 5 days before ovulation until day after ovulation)
    const ovulationDay = cycleLengthVal - 14;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;
    
    if (day > 0 && day <= cycleLengthVal) {
      if (day === ovulationDay) {
        fertilityStatus = "Ovulation Day";
        fertilityStatusSubtitle = "Peak fertility today! 🌟";
      } else if (day >= fertileStart && day <= fertileEnd) {
        fertilityStatus = "High Fertility";
        fertilityStatusSubtitle = "Fertile window is open";
      } else {
        fertilityStatus = "Low Fertility";
        fertilityStatusSubtitle = "Low chance of conception";
      }
    } else if (day > cycleLengthVal) {
      fertilityStatus = "Low Fertility";
      fertilityStatusSubtitle = "Cycle is currently late";
    }
  }

  // Sleep duration calculator
  const lastSleepDuration = (() => {
    if (!babySleepLogs || babySleepLogs.length === 0) return "No sleep logged";
    const lastLog = babySleepLogs[0];
    if (!lastLog.start_time || !lastLog.end_time) return "Logged (ongoing)";
    const start = new Date(lastLog.start_time);
    const end = new Date(lastLog.end_time);
    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs <= 0) return "Logged (ongoing)";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  })();

  // Copy code helper
  const handleCopyCode = async () => {
    if (!myPartnerCode) {
      const newCode = await getOrCreatePartnerInvitationAction();
      setMyPartnerCode(newCode);
      navigator.clipboard.writeText(newCode);
    } else {
      navigator.clipboard.writeText(myPartnerCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate code on demand
  const handleGenerateCode = async () => {
    setErrorMsg("");
    try {
      const newCode = await getOrCreatePartnerInvitationAction();
      setMyPartnerCode(newCode);
    } catch (e: any) {
      setErrorMsg("Failed to generate partner sharing code.");
    }
  };

  // Submit onboarding selections
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!selectedOnboardingMode) return;

    startTransition(async () => {
      let res;
      if (selectedOnboardingMode === "partner") {
        if (!partnerInviteInput.trim()) {
          setErrorMsg("Please enter a valid partner code.");
          return;
        }
        res = await partnerConnectAction(partnerInviteInput);
      } else {
        res = await setOnboardingModeAction({
          mode: selectedOnboardingMode,
          averageCycleLength: selectedOnboardingMode === "tracking" ? cycleLength : undefined,
          averagePeriodLength: selectedOnboardingMode === "tracking" ? periodLength : undefined,
          lastPeriodStartDate: selectedOnboardingMode === "tracking" ? lastPeriodStartDate : undefined,
          conceptionDate: selectedOnboardingMode === "pregnant" ? conceptionDate : undefined,
          expectedDueDate: undefined, // calculated server side
          babyNickname: selectedOnboardingMode === "pregnant" ? babyNickname : undefined,
          babyGender: selectedOnboardingMode === "pregnant" ? babyGender : undefined,
          deliveryDate: selectedOnboardingMode === "postpartum" ? deliveryDate : undefined,
          babyName: selectedOnboardingMode === "postpartum" ? babyName : undefined,
          babyBirthWeight: selectedOnboardingMode === "postpartum" && babyBirthWeight ? parseFloat(babyBirthWeight) : undefined,
          babyBirthLength: selectedOnboardingMode === "postpartum" && babyBirthLength ? parseFloat(babyBirthLength) : undefined,
        });
      }

      if (res?.success) {
        setMode(selectedOnboardingMode);
        window.location.reload();
      } else {
        setErrorMsg(res?.error || "An error occurred. Please try again.");
      }
    });
  };

  // Generic logging submission
  const handleLogSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomType) return;
    setErrorMsg("");
    
    startTransition(async () => {
      let res;
      const todayStr = new Date().toISOString().split("T")[0];
      
      if (mode === "tracking") {
        res = await logCycleSymptomAction({
          date: todayStr,
          type: symptomType,
          severity: symptomSeverity,
          notes: symptomNotes
        });
      } else if (mode === "pregnant") {
        const pregnancyId = pregnancyDetails?.id;
        const conception = pregnancyDetails?.conception_date;
        let currentWeek = 1;
        if (conception) {
          const diffDays = Math.floor((Date.now() - new Date(conception).getTime()) / (1000 * 60 * 60 * 24));
          currentWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
        }
        res = await logPregnancySymptomAction({
          date: todayStr,
          pregnancyId,
          week: currentWeek,
          type: symptomType,
          severity: symptomSeverity,
          notes: symptomNotes
        });
      }
      
      if (res?.success) {
        setSuccessMsg("Symptom logged successfully!");
        setSymptomType("");
        setSymptomNotes("");
        setActiveLoggingModal(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res?.error || "Failed to log symptom.");
      }
    });
  };

  // Submit new cycle start date
  const handleLogNewCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleDate) return;
    setErrorMsg("");
    
    startTransition(async () => {
      try {
        const res = await logNewCycleStartAction(newCycleDate);
        if (res?.success) {
          setSuccessMsg("New cycle started successfully!");
          setActiveLoggingModal(null);
          window.location.reload();
        } else {
          setErrorMsg(res?.error || "Failed to start a new cycle.");
        }
      } catch (err: any) {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    });
  };

  const handleLogBabyKicks = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    startTransition(async () => {
      const res = await logBabyKickAction({
        pregnancyId: pregnancyDetails?.id || "",
        sessionCount: kickCount,
        notes: "Logged via dashboard kick counter"
      });
      if (res.success) {
        setSuccessMsg("Kicks logged successfully!");
        setActiveLoggingModal(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to log baby kicks.");
      }
    });
  };

  const handleLogFeeding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    startTransition(async () => {
      const res = await logFeedingSessionAction({
        journeyId: postpartumDetails?.id || "",
        method: feedingMethod,
        side: feedingMethod === "breast" ? feedingSide : undefined,
        amountMl: feedingAmount ? parseInt(feedingAmount) : undefined,
        notes: feedingNotes
      });
      if (res.success) {
        setSuccessMsg("Feeding session logged!");
        setFeedingAmount("");
        setFeedingNotes("");
        setActiveLoggingModal(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to log feeding session.");
      }
    });
  };

  const handleLogSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepStart || !sleepEnd) return;
    setErrorMsg("");
    startTransition(async () => {
      const today = new Date().toISOString().split("T")[0];
      const startDateTime = `${today}T${sleepStart}:00Z`;
      const endDateTime = `${today}T${sleepEnd}:00Z`;
      const res = await logBabySleepAction({
        journeyId: postpartumDetails?.id || "",
        startTime: startDateTime,
        endTime: endDateTime,
        notes: sleepNotes
      });
      if (res.success) {
        setSuccessMsg("Sleep logged successfully!");
        setSleepStart("");
        setSleepEnd("");
        setSleepNotes("");
        setActiveLoggingModal(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to log sleep.");
      }
    });
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyWeight) return;
    setErrorMsg("");
    startTransition(async () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await logBabyWeightAction({
        journeyId: postpartumDetails?.id || "",
        date: todayStr,
        weightKg: parseFloat(babyWeight),
        notes: "Regular growth check"
      });
      if (res.success) {
        setSuccessMsg("Weight log saved!");
        setBabyWeight("");
        setActiveLoggingModal(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to log baby weight.");
      }
    });
  };

  const handleLogMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    startTransition(async () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await logMoodRecordAction({
        journeyId: postpartumDetails?.id || "",
        date: todayStr,
        mood: maternalMood,
        notes: moodNotes
      });
      if (res.success) {
        setSuccessMsg("Mood log saved!");
        setMoodNotes("");
        setActiveLoggingModal(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to log mood.");
      }
    });
  };

  // Schedule appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialist || !appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      setErrorMsg("Please fill out all appointment details.");
      return;
    }
    setErrorMsg("");
    startTransition(async () => {
      // Determine patientId: if partner is booking, patient is the connected pregnant partner.
      const patientId = mode === "partner" ? (connectedPartner?.partner_user_id || "") : profile.id;
      
      const res = await bookAppointmentAction({
        patientId,
        specialistId: selectedSpecialist,
        appointmentDate,
        startTime: appointmentStartTime,
        endTime: appointmentEndTime,
        reasonForVisit
      });

      if (res.success) {
        setSuccessMsg("Appointment booked successfully!");
        setSelectedSpecialist("");
        setAppointmentDate("");
        setAppointmentStartTime("");
        setAppointmentEndTime("");
        setReasonForVisit("");
        setShowBookingForm(false);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to book appointment.");
      }
    });
  };

  // Cancel appointment
  const handleCancelAppointment = async (apptId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await cancelAppointmentAction(apptId);
      if (res.success) {
        setSuccessMsg("Appointment cancelled successfully.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to cancel appointment.");
      }
    });
  };

  // Send partner message
  const handleSendPartnerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerMessage.trim()) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await sendPartnerMessageAction(partnerMessage);
      if (res.success) {
        setPartnerMessage("");
        setSuccessMsg("Message sent to partner!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Failed to send message.");
      }
    });
  };

  // Calculated stats helpers
  const calculatePregnancyWeek = () => {
    if (!pregnancyDetails?.conception_date) return null;
    const diff = Date.now() - new Date(pregnancyDetails.conception_date).getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    // gestational age is approximately conception age + 14 days, so add 2 weeks
    const weeks = Math.max(1, Math.floor(diffDays / 7) + 2);
    const remainingDays = diffDays % 7;
    return { weeks, remainingDays };
  };

  const getBabySizeInfo = (weeks: number) => {
    const sizeMap: Record<number, { size: string; name: string; icon: string }> = {
      4: { size: "Poppy Seed", name: "Tiny seed", icon: "🌱" },
      8: { size: "Raspberry", name: "Sweet berry", icon: "🍓" },
      12: { size: "Lime", name: "Zesty lime", icon: "🍋" },
      16: { size: "Avocado", name: "Creamy avocado", icon: "🥑" },
      20: { size: "Banana", name: "Long banana", icon: "🍌" },
      24: { size: "Cantaloupe", name: "Sweet melon", icon: "🍈" },
      28: { size: "Eggplant", name: "Deep purple eggplant", icon: "🍆" },
      32: { size: "Squash", name: "Butternut squash", icon: "🍠" },
      36: { size: "Honeydew", name: "Honeydew melon", icon: "🍉" },
      40: { size: "Pumpkin", name: "Harvest pumpkin", icon: "🎃" }
    };
    
    // Find closest lower week definition
    let matchWeek = 4;
    for (const w of Object.keys(sizeMap).map(Number)) {
      if (weeks >= w) matchWeek = w;
    }
    return sizeMap[matchWeek];
  };

  // Render ONBOARDING MODE SELECTOR
  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="gradient-text">Elira Mama Care</span>
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto text-base">
            Please select who you are to customize your dashboard experience and access specialized tracking utilities.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 rounded-xl mb-6 border border-rose-100 shadow-sm flex items-center gap-2">
            <span className="text-lg">⚠️</span> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {/* Card 1: Cycle Tracking */}
          <div 
            onClick={() => setSelectedOnboardingMode("tracking")}
            className={`cursor-pointer rounded-2xl border p-6 space-y-4 transition-all duration-300 ${
              selectedOnboardingMode === "tracking"
                ? "border-brand bg-brand/5 shadow-md shadow-brand/10 scale-[1.02]"
                : "border-slate-200 bg-white hover:border-slate-350 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-450 to-pink-500 flex items-center justify-center text-white shadow-sm text-xl font-bold">
              🌺
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Menstrual Cycle Tracking</h3>
              <p className="text-sm text-slate-600 mt-2">
                Log period dates, log PMS symptoms, and predict fertile windows.
              </p>
            </div>
          </div>

          {/* Card 2: Pregnant */}
          <div 
            onClick={() => setSelectedOnboardingMode("pregnant")}
            className={`cursor-pointer rounded-2xl border p-6 space-y-4 transition-all duration-300 ${
              selectedOnboardingMode === "pregnant"
                ? "border-brand bg-brand/5 shadow-md shadow-brand/10 scale-[1.02]"
                : "border-slate-200 bg-white hover:border-slate-350 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm text-xl font-bold">
              🤰
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Pregnancy Support</h3>
              <p className="text-sm text-slate-600 mt-2">
                Track week-by-week fetal growth, log kicks, and schedule prenatal exams.
              </p>
            </div>
          </div>

          {/* Card 3: Postpartum */}
          <div 
            onClick={() => setSelectedOnboardingMode("postpartum")}
            className={`cursor-pointer rounded-2xl border p-6 space-y-4 transition-all duration-300 ${
              selectedOnboardingMode === "postpartum"
                ? "border-brand bg-brand/5 shadow-md shadow-brand/10 scale-[1.02]"
                : "border-slate-200 bg-white hover:border-slate-350 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-sm text-xl font-bold">
              👶
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Postpartum Care</h3>
              <p className="text-sm text-slate-600 mt-2">
                Log baby feeding (breast/bottle), sleeping patterns, weight growth, and track your mood.
              </p>
            </div>
          </div>

          {/* Card 4: Partner */}
          <div 
            onClick={() => setSelectedOnboardingMode("partner")}
            className={`cursor-pointer rounded-2xl border p-6 space-y-4 transition-all duration-300 ${
              selectedOnboardingMode === "partner"
                ? "border-brand bg-brand/5 shadow-md shadow-brand/10 scale-[1.02]"
                : "border-slate-200 bg-white hover:border-slate-350 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-450 to-teal-500 flex items-center justify-center text-white shadow-sm text-xl font-bold">
              🤝
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Partner Mode</h3>
              <p className="text-sm text-slate-600 mt-2">
                Link with your partner's profile to view logs, coordinate medical visits, and get partner insights.
              </p>
            </div>
          </div>
        </div>

        {/* Customized inputs based on selection */}
        {selectedOnboardingMode && (
          <form onSubmit={handleOnboardingSubmit} className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" /> Complete Setup for {selectedOnboardingMode === "tracking" ? "Menstrual Tracking" : selectedOnboardingMode === "pregnant" ? "Pregnancy Mode" : selectedOnboardingMode === "postpartum" ? "Postpartum Care" : "Partner Linkage"}
            </h3>

            {selectedOnboardingMode === "tracking" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Average Cycle Length (Days)</label>
                    <input 
                      type="number" 
                      min={21} 
                      max={35} 
                      value={cycleLength} 
                      onChange={(e) => setCycleLength(parseInt(e.target.value))} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                    <p className="text-xs text-muted-foreground">Standard average is 28 days.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Average Period Duration (Days)</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={10} 
                      value={periodLength} 
                      onChange={(e) => setPeriodLength(parseInt(e.target.value))} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Last Period Start Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={lastPeriodStartDate} 
                    onChange={(e) => setLastPeriodStartDate(e.target.value)} 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  />
                  <p className="text-xs text-muted-foreground">This helps us calculate your current cycle day and fertile window.</p>
                </div>
              </div>
            )}

            {selectedOnboardingMode === "pregnant" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Estimated Conception Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={conceptionDate} 
                      onChange={(e) => setConceptionDate(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Baby's Nickname (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Peanut"
                      value={babyNickname} 
                      onChange={(e) => setBabyNickname(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Baby's Gender (If known)</label>
                  <select 
                    value={babyGender} 
                    onChange={(e) => setBabyGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  >
                    <option value="unknown">Prefer not to say / Don't know yet</option>
                    <option value="boy">Boy 💙</option>
                    <option value="girl">Girl 💗</option>
                  </select>
                </div>
              </div>
            )}

            {selectedOnboardingMode === "postpartum" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Baby's Birth / Delivery Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Baby's Name / Nickname</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Leo"
                      value={babyName} 
                      onChange={(e) => setBabyName(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Birth Weight (kg, optional)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 3.2"
                      value={babyBirthWeight} 
                      onChange={(e) => setBabyBirthWeight(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Birth Length (cm, optional)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g. 50"
                      value={babyBirthLength} 
                      onChange={(e) => setBabyBirthLength(e.target.value)} 
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedOnboardingMode === "partner" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">Enter Partner Code</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. ELIRA-X4B2D7"
                  value={partnerInviteInput} 
                  onChange={(e) => setPartnerInviteInput(e.target.value)} 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none font-mono tracking-wider"
                />
                <p className="text-xs text-muted-foreground">
                  Your pregnant or tracking partner can generate this code on their dashboard settings.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-brand hover:bg-brand-deep text-white text-sm font-bold py-3.5 rounded-xl shadow-md shadow-brand/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? "Configuring Dashboard..." : "Confirm & Setup My Dashboard"} <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    );
  }

  // Active status messages
  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="fixed top-20 right-6 z-55 bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 px-5 py-4 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 text-emerald-600" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold p-4 rounded-xl flex items-center gap-2 shadow-sm">
          <Info className="w-5 h-5 text-rose-500" /> {errorMsg}
        </div>
      )}

      {/* Main Mode Dashboard layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Specific metrics and telemetry per mode */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* WELCOME BANNER */}
          <div className="bg-gradient-to-r from-brand/10 via-brand-pink/5 to-white border border-brand/10 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-brand/10 text-brand inline-block">
                Mode: {mode === "tracking" ? "Cycle Tracking" : mode === "pregnant" ? "Pregnancy Support" : mode === "postpartum" ? "Postpartum Care" : "Partner Mode"}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {profile.first_name}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg">
                {mode === "tracking" && "Log symptoms, predict cycle starts, and keep your fertile window in check."}
                {mode === "pregnant" && `Your pregnancy logs are synchronized. Baby is progressing nicely.`}
                {mode === "postpartum" && "Log baby sleep patterns, feeding logs, weight gains, and track your wellness."}
                {mode === "partner" && `Synchronized with ${connectedPartner ? `${connectedPartner.first_name}'s journey.` : "your partner."}`}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {mode !== "partner" && (
                <button 
                  onClick={() => setActiveLoggingModal(mode)}
                  className="bg-brand hover:bg-brand-deep text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md shadow-brand/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Log Today's Status
                </button>
              )}
              <button 
                onClick={() => setShowBookingForm(true)}
                className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-5 py-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-brand" /> Book Consultation
              </button>
            </div>
          </div>

          {/* MODE-SPECIFIC VISUALIZATION PANEL */}
          {mode === "tracking" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500" /> Cycle Overview
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">Predicted based on average ({profile.average_cycle_length || 28} days)</span>
              </div>
              
              {!latestCycle ? (
                <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-6 text-center space-y-4">
                  <p className="text-sm font-semibold text-slate-700">No active cycle period has been logged yet.</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    To start tracking your fertile window, current cycle day, and predicting your next period, please log the start date of your last period.
                  </p>
                  <button
                    onClick={() => {
                      setTrackingModalTab("new_cycle");
                      setActiveLoggingModal("tracking");
                    }}
                    className="bg-rose-650 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
                  >
                    Log Period Start Date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/50">
                    <p className="text-xs text-rose-700 font-bold uppercase tracking-wider">Current Cycle Day</p>
                    <p className="text-3xl font-black text-rose-600 mt-2">{currentCycleDay}</p>
                    <p className="text-xs text-rose-500 mt-1">{currentCycleDaySubtitle}</p>
                  </div>
                  <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100/50">
                    <p className="text-xs text-pink-700 font-bold uppercase tracking-wider">Next Period Starts</p>
                    <p className="text-3xl font-black text-pink-600 mt-2">{nextPeriodStarts}</p>
                    <p className="text-xs text-pink-500 mt-1">{nextPeriodStartsSubtitle}</p>
                  </div>
                  <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100/50">
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Fertility Status</p>
                    <p className="text-xl font-extrabold text-amber-600 mt-3.5 uppercase tracking-wide">{fertilityStatus}</p>
                    <p className="text-xs text-amber-500 mt-1">{fertilityStatusSubtitle}</p>
                  </div>
                </div>
              )}
              
              {/* List cycle symptoms logged */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-700">Recent Symptom Logs</h4>
                {cycleSymptoms.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-xl border border-slate-100">No symptoms logged in this cycle yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cycleSymptoms.map((s: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800 capitalize">{s.symptom_type.replace("_", " ")}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{s.date}</p>
                          {s.notes && <p className="text-[10px] text-slate-500 italic mt-1 font-medium">"{s.notes}"</p>}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-brand/10 text-brand rounded-full">
                          Severity: {s.severity}/5
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "pregnant" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-orange-500" /> Pregnancy Progression
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">Due: {pregnancyDetails?.expected_due_date || "Not set"}</span>
              </div>
              
              {calculatePregnancyWeek() ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="text-center md:text-left space-y-2">
                    <p className="text-sm font-bold text-slate-500">Gestational Age</p>
                    <p className="text-4xl font-black text-slate-900">
                      {calculatePregnancyWeek()?.weeks} Weeks
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      and {calculatePregnancyWeek()?.remainingDays} Days since conception
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-orange-50 border border-orange-100 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-3xl">{getBabySizeInfo(calculatePregnancyWeek()?.weeks || 0)?.icon || "👶"}</span>
                      <span className="text-[10px] font-bold text-orange-700 mt-1">{getBabySizeInfo(calculatePregnancyWeek()?.weeks || 0)?.size || "Baby"}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-700">Size Comparison</p>
                    <p className="text-sm font-semibold text-slate-800">
                      Baby is the size of a <span className="text-brand font-bold">{getBabySizeInfo(calculatePregnancyWeek()?.weeks || 0)?.size}</span>.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Weight gain log: <span className="font-bold text-slate-700">{pregnancyDetails?.weight_gain_kg || "0"} kg</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Pregnancy details are loading...</p>
              )}

              {/* Baby kicks telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">Recent Kick Sessions</h4>
                  {babyKicks.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-xl border border-slate-100">No baby movements recorded yet today.</p>
                  ) : (
                    <div className="space-y-2">
                      {babyKicks.map((k: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-extrabold text-slate-800">👣 {k.session_count} Kicks</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(k.logged_at).toLocaleTimeString()}</p>
                          </div>
                          {k.notes && <span className="text-[10px] text-slate-500 italic">"{k.notes}"</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">Pregnancy Symptoms Logs</h4>
                  {pregnancySymptoms.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">No symptoms logged.</p>
                  ) : (
                    <div className="space-y-2">
                      {pregnancySymptoms.map((s: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800 capitalize">{s.symptom_type}</p>
                            <p className="text-[9px] text-muted-foreground">Week {s.week_of_pregnancy}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                            Severity: {s.severity}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === "postpartum" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Baby className="w-5 h-5 text-sky-500" /> Postpartum Journeys Tracker
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">Baby: {postpartumDetails?.baby_name || "Newborn"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold text-sky-700">Last Feeding</p>
                  <p className="text-base font-extrabold text-slate-800 mt-2">
                    {feedingSessions[0] ? `${feedingSessions[0].method} (${feedingSessions[0].amount_ml || "Breast"}ml)` : "No feed logged"}
                  </p>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold text-indigo-700">Last Sleep Duration</p>
                  <p className="text-base font-extrabold text-slate-800 mt-2">
                    {lastSleepDuration}
                  </p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold text-emerald-700">Weight Metric</p>
                  <p className="text-base font-extrabold text-slate-800 mt-2">
                    {babyWeightLogs[0] ? `${babyWeightLogs[0].weight_kg} kg` : `${postpartumDetails?.baby_birth_weight_kg || "3.5"} kg`}
                  </p>
                </div>
                <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold text-pink-700">Mother's Mood</p>
                  <p className="text-base font-extrabold text-slate-800 mt-2 capitalize">
                    {moodRecords[0]?.mood || "Okay"}
                  </p>
                </div>
              </div>

              {/* Feedings and Sleep logs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">Infant Feedings</h4>
                  {feedingSessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-xl border border-slate-100">No feedings recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {feedingSessions.slice(0, 5).map((f: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800 capitalize">🍼 {f.method} feed</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(f.start_time).toLocaleTimeString()}</p>
                          </div>
                          {f.amount_ml && <span className="text-[11px] font-bold text-slate-700 bg-sky-100 text-sky-850 px-2 py-0.5 rounded-full">{f.amount_ml}ml</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">Growth Weight History</h4>
                  {babyWeightLogs.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-xl border border-slate-100">No weight records logged.</p>
                  ) : (
                    <div className="space-y-2">
                      {babyWeightLogs.slice(0, 5).map((w: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800">⚖️ {w.weight_kg} kg</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{w.record_date}</p>
                          </div>
                          {w.notes && <span className="text-[10px] text-slate-500 italic">"{w.notes}"</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === "partner" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" /> Matched Partner Status
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">Active Syncing</span>
              </div>

              {connectedPartner ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{connectedPartner.first_name} {connectedPartner.last_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{connectedPartner.email}</p>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full inline-block mt-2 capitalize">
                        Mode: {connectedPartner.partner_mode}
                      </span>
                    </div>

                    <div className="text-center sm:text-right">
                      {connectedPartner.partner_mode === "pregnant" && (
                        <div>
                          <p className="text-xs font-bold text-slate-500">Pregnancy Stage</p>
                          <p className="text-xl font-extrabold text-slate-800 mt-1">
                            {calculatePregnancyWeek() ? `Week ${calculatePregnancyWeek()?.weeks}` : "Not logged"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {calculatePregnancyWeek() 
                              ? `Baby size of a ${getBabySizeInfo(calculatePregnancyWeek()?.weeks || 0)?.size} ${getBabySizeInfo(calculatePregnancyWeek()?.weeks || 0)?.icon || "👶"}`
                              : "Log pregnancy details to start"}
                          </p>
                        </div>
                      )}
                      {connectedPartner.partner_mode === "postpartum" && (
                        <div>
                          <p className="text-xs font-bold text-slate-500">Postpartum Care</p>
                          <p className="text-xl font-extrabold text-slate-800 mt-1">
                            {postpartumDetails?.baby_name ? `${postpartumDetails.baby_name}'s logs active` : "Newborn logs active"}
                          </p>
                          {postpartumDetails?.delivery_date && (
                            <p className="text-[10px] text-muted-foreground">
                              Born on {new Date(postpartumDetails.delivery_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Partner Insights */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      💡 Mama Support Insights
                    </h4>
                    {partnerInsights.length === 0 ? (
                      <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-xl border border-slate-100">
                        Analyzing logs to generate partner suggestions. Check back shortly.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {partnerInsights.map((ins: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-2xl border ${
                              ins.severity === 'high' 
                                ? 'bg-rose-50 border-rose-100 text-rose-950' 
                                : 'bg-emerald-50 border-emerald-100 text-emerald-950'
                            }`}
                          >
                            <div className="flex gap-2.5 items-start">
                              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold capitalize">{ins.insight_type.replace(/_/g, " ")}</p>
                                <p className="text-xs mt-1 leading-relaxed font-medium">{ins.message}</p>
                                <p className="text-[9px] text-slate-400 mt-2">{ins.insight_date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Send Quick Note */}
                  <form onSubmit={handleSendPartnerMessage} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">Send Support message or Reminder</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Remember to take your iron supplement! Love you." 
                        value={partnerMessage}
                        onChange={(e) => setPartnerMessage(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                      <button 
                        type="submit"
                        disabled={isPending}
                        className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-deep cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </form>

                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-xl">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">No partner matched yet</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Enter your partner's code to establish a link. Once linked, their details and logs will show up here.
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <input 
                      type="text" 
                      placeholder="e.g. ELIRA-XXXXXX" 
                      value={partnerInviteInput}
                      onChange={(e) => setPartnerInviteInput(e.target.value)}
                      className="w-full text-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-mono font-bold tracking-widest outline-none uppercase mb-2 focus:border-brand"
                    />
                    <button 
                      onClick={async () => {
                        setErrorMsg("");
                        if (!partnerInviteInput.trim()) return;
                        const res = await partnerConnectAction(partnerInviteInput);
                        if (res.success) {
                          window.location.reload();
                        } else {
                          setErrorMsg(res.error);
                        }
                      }}
                      className="w-full bg-brand text-white text-xs font-bold py-2 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      Connect Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CLINICAL APPOINTMENTS LIST */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" /> Upcoming Scheduled Appointments
              </h3>
              <button 
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="text-xs font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
              >
                {showBookingForm ? "Close Form" : "+ Schedule New Visit"}
              </button>
            </div>

            {/* Form to book appointment */}
            {showBookingForm && (
              <form onSubmit={handleBookAppointment} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Book New Medical Consultation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Select Specialist *</label>
                    <select 
                      required
                      value={selectedSpecialist} 
                      onChange={(e) => setSelectedSpecialist(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    >
                      <option value="">-- Choose specialist --</option>
                      {experts.map(exp => (
                        <option key={exp.id} value={exp.id}>
                          {exp.display_name} ({JSON.parse(exp.specialties || "[]").join(", ")}) - {exp.hospital_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Date *</label>
                    <input 
                      type="date" 
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Start Time *</label>
                    <input 
                      type="time" 
                      required
                      value={appointmentStartTime}
                      onChange={(e) => setAppointmentStartTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">End Time *</label>
                    <input 
                      type="time" 
                      required
                      value={appointmentEndTime}
                      onChange={(e) => setAppointmentEndTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Reason for Visit (Symptoms, Checkup, etc.)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Routine 2nd trimester ultrasound / Baby feeding issue"
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-brand text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-deep cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowBookingForm(false)}
                    className="border border-slate-200 bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {appointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-650">No upcoming meetings scheduled</p>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-[240px] mx-auto">
                  Coordinate with Obstetricians, Pediatricians, and wellness helpers easily.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {appointments.map(appt => (
                  <div key={appt.id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        👩‍⚕️ Specialist: {appt.specialist_name}
                      </p>
                      <div className="flex items-center gap-3.5 text-[10px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand" /> {appt.appointment_date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand" /> {appt.start_time} - {appt.end_time}</span>
                      </div>
                      {appt.reason_for_visit && (
                        <p className="text-[10px] text-slate-550 italic font-medium">"{appt.reason_for_visit}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                        appt.status === 'CONFIRMED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {appt.status}
                      </span>
                      <button 
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 px-2 py-1 rounded-lg cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sharing & general resources */}
        <div className="space-y-8">
          
          {/* PARTNER MATCH CODE CARD */}
          {mode !== "partner" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-7 space-y-4 shadow-sm">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                🤝 Sync with Partner
              </h4>
              <p className="text-xs text-slate-655 leading-relaxed">
                Connect your husband, wife, or family caregiver to your health feed. They can schedule doctor appointments and check logs from their view.
              </p>
              
              {myPartnerCode ? (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between font-mono text-sm tracking-wider font-extrabold">
                  <span className="text-slate-800 select-all">{myPartnerCode}</span>
                  <button 
                    onClick={handleCopyCode}
                    className="text-xs font-bold text-brand hover:text-brand-deep cursor-pointer flex items-center gap-1 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGenerateCode}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Generate Invitation Code
                </button>
              )}

              {/* Show linked partner list */}
              {connectedPartner && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Connected Partner</p>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{connectedPartner.first_name} {connectedPartner.last_name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{connectedPartner.email}</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HELP CENTER & SUPPORT BANNER */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-7 space-y-4 shadow-sm">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              🏥 Elira Mama Care Support
            </h4>
            <p className="text-xs text-slate-655 leading-relaxed">
              If you have medical questions or need urgent assistance, get in touch with our certified GP network.
            </p>
            <div className="space-y-2 text-xs">
              <a 
                href="mailto:emergency@elirahealth.com" 
                className="flex items-center justify-between p-3 bg-rose-50/50 hover:bg-rose-55/60 border border-rose-100/50 rounded-xl font-bold text-rose-700 transition-colors"
              >
                <span>🚨 Emergency Medical Line</span>
                <span>Call &rarr;</span>
              </a>
              <a 
                href="mailto:support@elirahealth.com" 
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl font-bold text-slate-700 transition-colors"
              >
                <span>💬 Standard Support Helpdesk</span>
                <span>Contact &rarr;</span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* SYMPTOM LOGGING MODALS (CLEAN POPUPS) */}
      {activeLoggingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-150 max-w-md w-full p-6 md:p-7 space-y-5 shadow-2xl animate-fade-in-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                📝 Log Daily Health Status
              </h3>
              <button 
                onClick={() => setActiveLoggingModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {mode === "tracking" && (
              <div className="space-y-4">
                <div className="flex border-b border-slate-100 pb-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTrackingModalTab("symptom")}
                    className={`text-xs font-bold pb-2 transition-all cursor-pointer ${
                      trackingModalTab === "symptom" 
                        ? "text-rose-600 border-b-2 border-rose-600" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Log Symptom
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingModalTab("new_cycle")}
                    className={`text-xs font-bold pb-2 transition-all cursor-pointer ${
                      trackingModalTab === "new_cycle" 
                        ? "text-rose-600 border-b-2 border-rose-600" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Start New Cycle
                  </button>
                </div>

                {trackingModalTab === "symptom" ? (
                  <form onSubmit={handleLogSymptom} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Choose Symptom *</label>
                      <select 
                        required
                        value={symptomType} 
                        onChange={(e) => setSymptomType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      >
                        <option value="">-- Choose one --</option>
                        <option value="cramps">Severe Cramps ⚡</option>
                        <option value="headache">Headache 💆‍♀️</option>
                        <option value="bloating">Bloating 🎈</option>
                        <option value="fatigue">Extreme Fatigue 🥱</option>
                        <option value="acne">Acne breakouts 🌟</option>
                        <option value="mood_swings">Mood Swings 🎭</option>
                        <option value="normal">Normal / Healthy Day ✨</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Severity (1-5)</label>
                      <input 
                        type="range" 
                        min={1} 
                        max={5} 
                        value={symptomSeverity} 
                        onChange={(e) => setSymptomSeverity(parseInt(e.target.value))}
                        className="w-full accent-brand"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. cramps mostly in morning" 
                        value={symptomNotes}
                        onChange={(e) => setSymptomNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-brand text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      {isPending ? "Logging..." : "Save Log"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogNewCycle} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Last Period Start Date *</label>
                      <input 
                        type="date" 
                        required
                        value={newCycleDate} 
                        onChange={(e) => setNewCycleDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Starting a new cycle automatically closes your ongoing cycle and begins predicting your next window.
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-rose-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-rose-700 cursor-pointer"
                    >
                      {isPending ? "Starting Cycle..." : "Start New Cycle"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {mode === "pregnant" && (
              <div className="space-y-4">
                {/* Switch between baby kicks and symptoms */}
                <div className="grid grid-cols-2 gap-2 border border-slate-100 rounded-xl p-1 bg-slate-50 text-xs">
                  <button 
                    onClick={() => setSymptomType("")}
                    className={`py-2 rounded-lg font-bold text-center cursor-pointer ${!symptomType ? "bg-white text-slate-800 shadow-sm" : "text-muted-foreground"}`}
                  >
                    Baby Kicks Counter
                  </button>
                  <button 
                    onClick={() => setSymptomType("nausea")}
                    className={`py-2 rounded-lg font-bold text-center cursor-pointer ${symptomType ? "bg-white text-slate-800 shadow-sm" : "text-muted-foreground"}`}
                  >
                    Pregnancy Symptom
                  </button>
                </div>

                {!symptomType ? (
                  <form onSubmit={handleLogBabyKicks} className="space-y-4">
                    <div className="space-y-2 text-center py-2">
                      <p className="text-xs font-bold text-slate-500">Record kicks in this session</p>
                      <p className="text-4xl font-black text-slate-800 mt-2">{kickCount}</p>
                      <div className="flex justify-center gap-2 mt-4">
                        <button 
                          type="button" 
                          onClick={() => setKickCount(Math.max(1, kickCount - 1))}
                          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-slate-800"
                        >
                          -1
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setKickCount(kickCount + 1)}
                          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-slate-800"
                        >
                          +1
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setKickCount(kickCount + 5)}
                          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-slate-800"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-brand text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      Save Kicks Session
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogSymptom} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Choose Symptom *</label>
                      <select 
                        required
                        value={symptomType} 
                        onChange={(e) => setSymptomType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      >
                        <option value="nausea">Morning Sickness / Nausea 🤢</option>
                        <option value="fatigue">Extreme Fatigue 🥱</option>
                        <option value="back_pain">Lower Back Pain ⚡</option>
                        <option value="heartburn">Heartburn 🌶️</option>
                        <option value="swelling">Swelling (Feet/Hands) 🎈</option>
                        <option value="contraction">Braxton Hicks / Contraction 🤰</option>
                        <option value="vaginal_bleeding">Vaginal Bleeding 🚨</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Severity (1-5)</label>
                      <input 
                        type="range" 
                        min={1} 
                        max={5} 
                        value={symptomSeverity} 
                        onChange={(e) => setSymptomSeverity(parseInt(e.target.value))}
                        className="w-full accent-brand"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. worse after eating dinner" 
                        value={symptomNotes}
                        onChange={(e) => setSymptomNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-brand text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      Save Symptom
                    </button>
                  </form>
                )}

              </div>
            )}

            {mode === "postpartum" && (
              <div className="space-y-4">
                {/* Tabs to log feeding, sleep, weight, or mood */}
                <div className="grid grid-cols-4 gap-1 border border-slate-100 rounded-xl p-1 bg-slate-50 text-[10px] font-bold">
                  <button 
                    onClick={() => setSymptomType("feed")}
                    className={`py-1.5 rounded-lg text-center cursor-pointer ${symptomType === "feed" || !symptomType ? "bg-white text-slate-800 shadow-sm" : "text-muted-foreground"}`}
                  >
                    Feeding
                  </button>
                  <button 
                    onClick={() => setSymptomType("sleep")}
                    className={`py-1.5 rounded-lg text-center cursor-pointer ${symptomType === "sleep" ? "bg-white text-slate-800 shadow-sm" : "text-muted-foreground"}`}
                  >
                    Sleep
                  </button>
                  <button 
                    onClick={() => setSymptomType("weight")}
                    className={`py-1.5 rounded-lg text-center cursor-pointer ${symptomType === "weight" ? "bg-white text-slate-800 shadow-sm" : "text-muted-foreground"}`}
                  >
                    Weight
                  </button>
                  <button 
                    onClick={() => setSymptomType("mood")}
                    className={`py-1.5 rounded-lg text-center cursor-pointer ${symptomType === "mood" ? "bg-white text-slate-800 shadow-sm" : "text-muted-foreground"}`}
                  >
                    Mood
                  </button>
                </div>

                {(symptomType === "feed" || !symptomType) && (
                  <form onSubmit={handleLogFeeding} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Feeding Method *</label>
                      <select 
                        required
                        value={feedingMethod} 
                        onChange={(e) => setFeedingMethod(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      >
                        <option value="breast">Breast feeding 🤱</option>
                        <option value="bottle">Bottle (expressed / formula) 🍼</option>
                        <option value="combination">Combination feed 🥛</option>
                        <option value="solid">Solid Foods 🍌</option>
                      </select>
                    </div>

                    {feedingMethod === "breast" && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Breast Side *</label>
                        <select 
                          required
                          value={feedingSide} 
                          onChange={(e) => setFeedingSide(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                        >
                          <option value="both">Both sides</option>
                          <option value="left">Left Side</option>
                          <option value="right">Right Side</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Amount (ml, optional for bottle)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 120"
                        value={feedingAmount} 
                        onChange={(e) => setFeedingAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. fed well, burped twice" 
                        value={feedingNotes}
                        onChange={(e) => setFeedingNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-brand text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      Save Feeding session
                    </button>
                  </form>
                )}

                {symptomType === "sleep" && (
                  <form onSubmit={handleLogSleep} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Start Time *</label>
                        <input 
                          type="time" 
                          required
                          value={sleepStart}
                          onChange={(e) => setSleepStart(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">End Time *</label>
                        <input 
                          type="time" 
                          required
                          value={sleepEnd}
                          onChange={(e) => setSleepEnd(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. slept soundly" 
                        value={sleepNotes}
                        onChange={(e) => setSleepNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-brand text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      Save Sleep Duration
                    </button>
                  </form>
                )}

                {symptomType === "weight" && (
                  <form onSubmit={handleLogWeight} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Baby Weight (kg) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required
                        placeholder="e.g. 3.85" 
                        value={babyWeight}
                        onChange={(e) => setBabyWeight(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-brand text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      Save Weight Log
                    </button>
                  </form>
                )}

                {symptomType === "mood" && (
                  <form onSubmit={handleLogMood} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Mother's Mood *</label>
                      <select 
                        required
                        value={maternalMood} 
                        onChange={(e) => setMaternalMood(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      >
                        <option value="great">Great! Feeling wonderful ✨</option>
                        <option value="good">Good / Stable 😊</option>
                        <option value="okay">Okay / Tolerable 🙂</option>
                        <option value="low">Low energy / Sad 😕</option>
                        <option value="struggling">Struggling / Need help 🚨</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Mood Notes (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. slept less last night, feeling tired" 
                        value={moodNotes}
                        onChange={(e) => setMoodNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-brand text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-deep cursor-pointer"
                    >
                      Save Mood Record
                    </button>
                  </form>
                )}

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
