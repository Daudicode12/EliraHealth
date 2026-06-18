-- ============================================================================
-- Femora App - Comprehensive SQLite / Turso Schema (Audited & Verified)
-- ============================================================================
-- Designed for Turso (libSQL/SQLite).
-- Fully compatible with local Drift/SQLite models and remote schemas.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Profiles & Core User Data
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Maps to User ID from Auth system
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  date_of_birth TEXT, -- ISO Date: YYYY-MM-DD
  avatar_url TEXT,
  phone_number TEXT,  -- Aligned with local DB
  height REAL,        -- Aligned with local DB
  weight REAL,        -- Aligned with local DB
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  current_cycle_mode TEXT DEFAULT 'tracking' CHECK (current_cycle_mode IN ('tracking', 'pregnant', 'postpartum')),
  average_cycle_length INTEGER DEFAULT 28 CHECK (average_cycle_length >= 21 AND average_cycle_length <= 35),
  average_period_length INTEGER DEFAULT 5 CHECK (average_period_length >= 1 AND average_period_length <= 10),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'expert'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Menstrual Cycle Tracking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS menstrual_cycles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL, -- ISO Date: YYYY-MM-DD
  end_date TEXT, -- ISO Date: YYYY-MM-DD
  cycle_length INTEGER,
  period_length INTEGER,
  period_days TEXT DEFAULT '[]', -- JSON String representation of dates
  predicted_next_cycle TEXT, -- ISO Date: YYYY-MM-DD
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Index to emulate partial unique index: only one ongoing period per user (end_date IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_ongoing_period
ON menstrual_cycles (user_id)
WHERE end_date IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Symptoms Logging
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS symptoms (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- ISO Date: YYYY-MM-DD
  symptom_type TEXT NOT NULL, -- Check constraint removed to allow dynamic client-side types like 'mood_happy', 'cramps_severe', etc.
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  value TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(user_id, date, symptom_type)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Pregnancy Features
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pregnancies (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  conception_date TEXT NOT NULL, -- ISO Date
  expected_due_date TEXT NOT NULL, -- ISO Date
  pregnancy_start_date TEXT NOT NULL, -- ISO Date
  delivery_date TEXT, -- ISO Date
  pregnancy_status TEXT DEFAULT 'ongoing' CHECK (pregnancy_status IN ('ongoing', 'delivered', 'miscarried')),
  baby_nickname TEXT,
  baby_gender TEXT DEFAULT 'unknown' CHECK (baby_gender IN ('unknown', 'boy', 'girl')),
  baby_weight_kg REAL,
  baby_length_cm REAL,
  notes TEXT,
  weight_gain_kg REAL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS pregnancy_symptoms (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  pregnancy_id TEXT REFERENCES pregnancies(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- ISO Date
  week_of_pregnancy INTEGER NOT NULL,
  symptom_type TEXT CHECK (symptom_type IN (
    'nausea', 'fatigue', 'back_pain', 'heartburn', 'swelling',
    'mood_changes', 'sleep_issues', 'breast_changes', 'baby_movements',
    'cravings', 'headaches', 'constipation', 'shortness_of_breath',
    'contraction', 'vaginal_bleeding', 'water_breaking', 'notes'
  )),
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS baby_kicks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  pregnancy_id TEXT REFERENCES pregnancies(id) ON DELETE CASCADE,
  kick_time TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  session_count INTEGER DEFAULT 1,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS pregnancy_appointments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  pregnancy_id TEXT REFERENCES pregnancies(id) ON DELETE CASCADE,
  appointment_date TEXT NOT NULL, -- ISO Date
  appointment_time TEXT, -- HH:MM
  appointment_type TEXT CHECK (appointment_type IN ('prenatal', 'ultrasound', 'blood_test', 'checkup', 'other')),
  provider_name TEXT,
  location TEXT,
  notes TEXT,
  is_completed BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Postpartum Journey
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS postpartum_journeys (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  delivery_date TEXT NOT NULL, -- ISO Date
  baby_name TEXT,
  baby_birth_weight_kg REAL,
  baby_birth_length_cm REAL,
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS feeding_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  postpartum_journey_id TEXT REFERENCES postpartum_journeys(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL, -- ISO Timestamp
  end_time TEXT, -- ISO Timestamp
  method TEXT CHECK (method IN ('breast', 'bottle', 'combination', 'solid')),
  breast_side TEXT CHECK (breast_side IN ('left', 'right', 'both')),
  amount_ml REAL,
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS baby_sleep (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  postpartum_journey_id TEXT REFERENCES postpartum_journeys(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL, -- ISO Timestamp
  end_time TEXT, -- ISO Timestamp
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS baby_weights (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  postpartum_journey_id TEXT REFERENCES postpartum_journeys(id) ON DELETE CASCADE,
  record_date TEXT NOT NULL, -- ISO Date
  weight_kg REAL NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS mood_records (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  postpartum_journey_id TEXT REFERENCES postpartum_journeys(id) ON DELETE CASCADE,
  record_date TEXT NOT NULL, -- ISO Date
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'low', 'struggling')),
  notes TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Partner Sharing & Communication
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS partner_invitations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  invited_by_user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  invited_email TEXT,
  invitation_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled')),
  expires_at TEXT NOT NULL, -- ISO Timestamp
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_status TEXT DEFAULT 'active' CHECK (relationship_status IN ('active', 'blocked', 'ended')),
  share_cycle_data BOOLEAN DEFAULT 1,
  share_pregnancy_status BOOLEAN DEFAULT 1,
  share_symptoms BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(user_id, partner_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  sender_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'care_tip', 'period_alert')),
  is_read BOOLEAN DEFAULT 0,
  read_at TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS partner_insights (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  insight_date TEXT NOT NULL, -- ISO Date
  insight_type TEXT CHECK (insight_type IN (
    'period_coming', 'period_now', 'fertile_window', 'pms_expected',
    'ovulation_day', 'pregnancy_week', 'she_might_be_moody', 'offer_extra_support'
  )),
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'mild', 'moderate', 'high')),
  metadata TEXT, -- Aligned with local DB's metadata field (JSON string)
  is_read BOOLEAN DEFAULT 0,
  read_at TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Educational Content
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  featured BOOLEAN DEFAULT 0,
  image_url TEXT,
  author_id TEXT NOT NULL, -- References Admin/Author profile ID
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Expert Consultation Directory
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS experts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  specialties TEXT DEFAULT '[]', -- JSON list of strings
  license_number TEXT,
  medical_council_number TEXT,
  practicing_certificate_url TEXT,
  hospital_name TEXT,
  years_of_experience INTEGER DEFAULT 0,
  hourly_rate REAL DEFAULT 0.0,
  currency TEXT DEFAULT 'KES',
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified_at TEXT,
  verified_by TEXT REFERENCES profiles(id),
  rejection_reason TEXT,
  admin_notes TEXT,
  is_available BOOLEAN DEFAULT 1,
  average_rating REAL DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS expert_availability (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  expert_id TEXT REFERENCES experts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL, -- HH:MM
  end_time TEXT NOT NULL, -- HH:MM
  is_available BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  expert_id TEXT REFERENCES experts(id) ON DELETE CASCADE,
  scheduled_at TEXT, -- ISO Timestamp
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  issue_description TEXT,
  issue_category TEXT CHECK (issue_category IN ('menstrual_health', 'pregnancy', 'fertility', 'postpartum', 'nutrition', 'mental_health', 'sexual_health', 'general')),
  is_ai_matched BOOLEAN DEFAULT 0,
  ai_match_request_id TEXT,
  meeting_url TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS consultation_messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  consultation_id TEXT REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  is_read BOOLEAN DEFAULT 0,
  read_at TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS expert_reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  consultation_id TEXT UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  expert_id TEXT REFERENCES experts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_match_requests (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  issue_description TEXT NOT NULL,
  preferred_specialties TEXT, -- JSON String Array
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('immediate', 'today', 'this_week', 'flexible')),
  budget_max REAL,
  preferences TEXT DEFAULT '{}', -- JSON String Object
  matched_expert_ids TEXT, -- JSON list of UUIDs
  ai_reasoning TEXT,
  confidence_score REAL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Journaling Features
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood_emoji TEXT,
  date TEXT NOT NULL, -- ISO Date
  tags TEXT, -- Comma-separated strings or JSON Array
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Performance Indexes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_id ON menstrual_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_start_date ON menstrual_cycles(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_id_date ON symptoms(user_id, date);
CREATE INDEX IF NOT EXISTS idx_symptoms_date ON symptoms(date);
CREATE INDEX IF NOT EXISTS idx_symptoms_type ON symptoms(symptom_type);
CREATE INDEX IF NOT EXISTS idx_pregnancy_symptoms_user_date ON pregnancy_symptoms(user_id, date);
CREATE INDEX IF NOT EXISTS idx_pregnancy_symptoms_week ON pregnancy_symptoms(week_of_pregnancy);
CREATE INDEX IF NOT EXISTS idx_baby_kicks_user_time ON baby_kicks(user_id, kick_time);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_code ON partner_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_user ON partner_invitations(invited_by_user_id);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_partner_id ON partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_partner_insights_user_partner ON partner_insights(user_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_insights_date ON partner_insights(insight_date);
CREATE INDEX IF NOT EXISTS idx_articles_featured_created_at ON articles (featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_verified_available ON experts(is_verified, is_available);
CREATE INDEX IF NOT EXISTS idx_expert_availability_expert ON expert_availability(expert_id);
CREATE INDEX IF NOT EXISTS idx_consultations_client ON consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_expert ON consultations(expert_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled ON consultations(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_consultation ON consultation_messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_sender ON consultation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert ON expert_reviews(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_client ON expert_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_requests_user ON ai_match_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_requests_status ON ai_match_requests(status);
CREATE INDEX IF NOT EXISTS idx_postpartum_journeys_user_id ON postpartum_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_feeding_sessions_journey ON feeding_sessions(postpartum_journey_id);
CREATE INDEX IF NOT EXISTS idx_baby_sleep_journey ON baby_sleep(postpartum_journey_id);
CREATE INDEX IF NOT EXISTS idx_baby_weights_journey ON baby_weights(postpartum_journey_id);
CREATE INDEX IF NOT EXISTS idx_mood_records_journey ON mood_records(postpartum_journey_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_appointments_pregnancy ON pregnancy_appointments(pregnancy_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id_date ON journal_entries(user_id, date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. SQLite Triggers for Auto-Updated At Timestamps
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER IF NOT EXISTS trg_profiles_updated_at AFTER UPDATE ON profiles
BEGIN
  UPDATE profiles SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_menstrual_cycles_updated_at AFTER UPDATE ON menstrual_cycles
BEGIN
  UPDATE menstrual_cycles SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_symptoms_updated_at AFTER UPDATE ON symptoms
BEGIN
  UPDATE symptoms SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_pregnancies_updated_at AFTER UPDATE ON pregnancies
BEGIN
  UPDATE pregnancies SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_pregnancy_symptoms_updated_at AFTER UPDATE ON pregnancy_symptoms
BEGIN
  UPDATE pregnancy_symptoms SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_pregnancy_appointments_updated_at AFTER UPDATE ON pregnancy_appointments
BEGIN
  UPDATE pregnancy_appointments SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_postpartum_journeys_updated_at AFTER UPDATE ON postpartum_journeys
BEGIN
  UPDATE postpartum_journeys SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_partners_updated_at AFTER UPDATE ON partners
BEGIN
  UPDATE partners SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_articles_updated_at AFTER UPDATE ON articles
BEGIN
  UPDATE articles SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_experts_updated_at AFTER UPDATE ON experts
BEGIN
  UPDATE experts SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_consultations_updated_at AFTER UPDATE ON consultations
BEGIN
  UPDATE consultations SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_journal_entries_updated_at AFTER UPDATE ON journal_entries
BEGIN
  UPDATE journal_entries SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. SQLite Triggers for Expert Stats & Consultations
-- ─────────────────────────────────────────────────────────────────────────────

-- Update average rating and review counts on insert
CREATE TRIGGER IF NOT EXISTS trg_update_expert_stats_on_review_insert
AFTER INSERT ON expert_reviews
BEGIN
  UPDATE experts
  SET average_rating = (SELECT IFNULL(avg(rating), 0.0) FROM expert_reviews WHERE expert_id = NEW.expert_id),
      total_reviews = (SELECT count(*) FROM expert_reviews WHERE expert_id = NEW.expert_id)
  WHERE id = NEW.expert_id;
END;

-- Update average rating and review counts on update
CREATE TRIGGER IF NOT EXISTS trg_update_expert_stats_on_review_update
AFTER UPDATE ON expert_reviews
BEGIN
  UPDATE experts
  SET average_rating = (SELECT IFNULL(avg(rating), 0.0) FROM expert_reviews WHERE expert_id = NEW.expert_id),
      total_reviews = (SELECT count(*) FROM expert_reviews WHERE expert_id = NEW.expert_id)
  WHERE id = NEW.expert_id;
END;

-- Update average rating and review counts on delete
CREATE TRIGGER IF NOT EXISTS trg_update_expert_stats_on_review_delete
AFTER DELETE ON expert_reviews
BEGIN
  UPDATE experts
  SET average_rating = (SELECT IFNULL(avg(rating), 0.0) FROM expert_reviews WHERE expert_id = OLD.expert_id),
      total_reviews = (SELECT count(*) FROM expert_reviews WHERE expert_id = OLD.expert_id)
  WHERE id = OLD.expert_id;
END;

-- Increment total consultations when status is marked completed
CREATE TRIGGER IF NOT EXISTS trg_increment_expert_consultations
AFTER UPDATE ON consultations
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
  UPDATE experts
  SET total_consultations = total_consultations + 1
  WHERE id = NEW.expert_id;
END;
