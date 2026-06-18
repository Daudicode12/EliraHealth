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
}

export interface Expert {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  specialties: string; // JSON string
  credentials: string | null;
  years_of_experience: number;
  hourly_rate: number;
  currency?: string;
  is_verified: number; // 0 or 1
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
  client_id: string;
  expert_id: string;
  scheduled_at: string | null;
  duration_minutes?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  issue_description: string | null;
  issue_category: string | null;
  is_ai_matched?: number;
  ai_match_request_id?: string | null;
  meeting_url?: string | null;
  notes?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
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
