-- BPSC Registration & Profile Management - Initial Schema
-- Migration: 001_initial_schema.sql

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE marital_status_type AS ENUM ('single', 'married', 'divorced', 'widowed');
CREATE TYPE application_status_type AS ENUM (
  'draft',
  'submitted',
  'finalized',
  'payment_pending',
  'payment_completed',
  'cancelled',
  'suspended'
);
CREATE TYPE exam_type AS ENUM ('bcs_cadre', 'non_cadre', 'departmental', 'senior_scale');
CREATE TYPE notification_channel AS ENUM ('dashboard', 'email', 'sms');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');
CREATE TYPE otp_purpose AS ENUM ('registration', 'password_reset');

-- ============================================================
-- APPLICANTS (Lifelong Profile)
-- ============================================================

CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id VARCHAR(20) UNIQUE NOT NULL,  -- unique tracking number e.g. BPSC-2026-XXXXX
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_profile_id ON applicants(profile_id);

-- ============================================================
-- OTP MANAGEMENT
-- ============================================================

CREATE TABLE otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose otp_purpose NOT NULL DEFAULT 'registration',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires ON otps(expires_at);

-- ============================================================
-- PERSONAL INFORMATION
-- ============================================================

CREATE TABLE personal_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255),
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  date_of_birth DATE,
  gender gender_type,
  employment_status VARCHAR(100),
  quota VARCHAR(100),
  marital_status marital_status_type,
  nationality VARCHAR(100) DEFAULT 'Bangladeshi',
  nid_number VARCHAR(20),
  has_nid BOOLEAN DEFAULT FALSE,
  birth_registration_number VARCHAR(30),
  has_birth_registration BOOLEAN DEFAULT FALSE,
  passport_number VARCHAR(20),
  has_passport BOOLEAN DEFAULT FALSE,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  contact_mobile VARCHAR(15),
  photo_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(applicant_id)
);

CREATE INDEX idx_personal_info_applicant ON personal_info(applicant_id);

-- ============================================================
-- ADDRESSES
-- ============================================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('present', 'permanent')),
  care_of VARCHAR(255),
  village_town_road VARCHAR(500),
  district VARCHAR(100),
  upazilla VARCHAR(100),
  post_office VARCHAR(100),
  post_code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(applicant_id, address_type)
);

CREATE INDEX idx_addresses_applicant ON addresses(applicant_id);

-- ============================================================
-- EDUCATIONAL QUALIFICATIONS
-- ============================================================

CREATE TABLE education_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  level VARCHAR(50) NOT NULL CHECK (level IN ('ssc', 'hsc', 'graduation', 'masters', 'other')),
  examination VARCHAR(100),
  board VARCHAR(100),
  roll VARCHAR(50),
  result VARCHAR(50),
  "group" VARCHAR(100),
  subject_degree VARCHAR(200),
  passing_year VARCHAR(4),
  university_institute VARCHAR(300),
  course_duration VARCHAR(20),
  student_id VARCHAR(50),
  roll_no VARCHAR(50),
  session VARCHAR(50),
  qualification_type VARCHAR(100), -- for 'other' level: PhD, Post-Doc, M.Phil, etc.
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_education_applicant ON education_records(applicant_id);

-- ============================================================
-- CIRCULARS
-- ============================================================

CREATE TABLE circulars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  title_bn VARCHAR(500),
  description TEXT,
  description_bn TEXT,
  exam_type exam_type NOT NULL,
  application_start_date TIMESTAMPTZ NOT NULL,
  application_end_date TIMESTAMPTZ NOT NULL,
  exam_date TIMESTAMPTZ,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  eligibility_criteria JSONB DEFAULT '{}',
  required_documents JSONB DEFAULT '[]',
  posts JSONB DEFAULT '[]',  -- available posts for non-cadre
  cadre_options JSONB DEFAULT '[]',  -- cadre types for BCS
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_circulars_exam_type ON circulars(exam_type);
CREATE INDEX idx_circulars_dates ON circulars(application_start_date, application_end_date);

-- ============================================================
-- APPLICATIONS
-- ============================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  circular_id UUID NOT NULL REFERENCES circulars(id) ON DELETE CASCADE,
  status application_status_type DEFAULT 'draft',
  exam_specific_data JSONB DEFAULT '{}',  -- cadre preferences, post selection, etc.
  photo_url TEXT,
  signature_url TEXT,
  profile_snapshot JSONB,  -- immutable snapshot taken on submission
  submitted_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(applicant_id, circular_id)
);

CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_circular ON applications(circular_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  transaction_id VARCHAR(100),
  gateway_reference VARCHAR(200),
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_application ON payments(application_id);
CREATE INDEX idx_payments_applicant ON payments(applicant_id);

-- ============================================================
-- ADMIT CARDS
-- ============================================================

CREATE TABLE admit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  circular_id UUID NOT NULL REFERENCES circulars(id) ON DELETE CASCADE,
  exam_center VARCHAR(300),
  exam_schedule TIMESTAMPTZ,
  registration_number VARCHAR(50),
  instructions TEXT,
  qr_code_data TEXT,
  is_available BOOLEAN DEFAULT FALSE,
  download_count INT DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admit_cards_application ON admit_cards(application_id);
CREATE INDEX idx_admit_cards_applicant ON admit_cards(applicant_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  title_bn VARCHAR(500),
  message TEXT NOT NULL,
  message_bn TEXT,
  channel notification_channel DEFAULT 'dashboard',
  status notification_status DEFAULT 'pending',
  related_entity_type VARCHAR(50),  -- 'circular', 'application', 'payment'
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_applicant ON notifications(applicant_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_read ON notifications(applicant_id, is_read);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT TRUE,
  dashboard_enabled BOOLEAN DEFAULT TRUE,
  circular_alerts BOOLEAN DEFAULT TRUE,
  status_updates BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(applicant_id)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_applicant ON audit_logs(applicant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- LOOKUP TABLES
-- ============================================================

CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_bn VARCHAR(100),
  division VARCHAR(100),
  division_bn VARCHAR(100)
);

CREATE TABLE upazillas (
  id SERIAL PRIMARY KEY,
  district_id INT NOT NULL REFERENCES districts(id),
  name VARCHAR(100) NOT NULL,
  name_bn VARCHAR(100)
);

CREATE TABLE education_boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_bn VARCHAR(100)
);

CREATE TABLE universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  name_bn VARCHAR(300)
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  name_bn VARCHAR(200),
  level VARCHAR(50)  -- graduation, masters, etc.
);

-- ============================================================
-- SESSION / REFRESH TOKENS
-- ============================================================

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_applicant ON refresh_tokens(applicant_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

COMMIT;
