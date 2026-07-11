export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
  phone_number: string | null;
  height?: number | null;
  weight?: number | null;
  created_at: string;
  updated_at: string;
  current_cycle_mode?: string;
  average_cycle_length?: number;
  average_period_length?: number;
  role: 'user' | 'admin' | 'expert';
  password_hash?: string | null;
  status?: string;
}

export interface Expert {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  specialties: string; // JSON string
  sub_specialties?: string | null; // JSON string
  languages?: string | null; // JSON string
  license_number: string | null;
  medical_council_number?: string | null;
  practicing_certificate_url?: string | null;
  hospital_name?: string | null;
  years_of_experience: number;
  hourly_rate: number;
  currency?: string;
  verification_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  profile_status: 'profile_incomplete' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
  submitted_for_review_at?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  is_available: number; // 0 or 1
  average_rating: number;
  total_reviews: number;
  total_consultations: number;
  created_at: string;
  updated_at: string;
}

export interface ExpertAvailability {
  id: string;
  expert_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: number;
  created_at: string;
}

export interface Consultation {
  id: string;
  appointment_id: string;
  patient_id: string;
  specialist_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Backwards compatibility properties (deprecated)
  assessment?: string | null;
  chief_complaint?: string | null;
  client_id?: string;
  expert_id?: string;
  scheduled_at?: string | null;
  duration_minutes?: number;
  issue_description?: string | null;
  issue_category?: string | null;
  is_ai_matched?: number;
  ai_match_request_id?: string | null;
  meeting_url?: string | null;
  notes?: string | null;
  cancellation_reason?: string | null;
}

export interface ConsultationMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_read: number;
  read_at: string | null;
  created_at: string;
}

export interface ExpertReview {
  id: string;
  consultation_id: string;
  client_id: string;
  expert_id: string;
  rating: number;
  comment: string | null;
  is_anonymous: number;
  created_at: string;
}
