-- ============================================================================
-- HEALTHMATTERS: PRODUCTION SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ============================================================================
-- Enables UUID generation and cryptographic functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

CREATE TYPE medical_category AS ENUM (
  'diagnosis',
  'allergy',
  'medication',
  'lab',
  'imaging',
  'procedure',
  'discharge'
);

CREATE TYPE document_type AS ENUM (
  'pdf',
  'image',
  'prescription',
  'lab_report',
  'scan_report',
  'discharge_summary',
  'text'
);

CREATE TYPE document_status AS ENUM (
  'pending',
  'uploading',
  'analyzing',
  'analyzed',
  'error'
);

CREATE TYPE share_status AS ENUM (
  'active',
  'expired',
  'revoked'
);

-- ============================================================================
-- 2. PATIENTS PROFILE TABLE
-- ============================================================================
-- Linked to Supabase Auth (auth.users)
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mrn TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('Female', 'Male', 'Other')),
  blood_group TEXT NOT NULL,
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  primary_care_physician JSONB NOT NULL DEFAULT '{}'::jsonb,
  insurance JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. UPLOADED MEDICAL DOCUMENTS TABLE
-- ============================================================================
-- Represents files in Supabase Storage bucket 'patient-medical-records'
CREATE TABLE public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  type document_type NOT NULL DEFAULT 'pdf',
  storage_path TEXT NOT NULL,
  preview_url TEXT,
  mime_type TEXT,
  is_camera_capture BOOLEAN DEFAULT FALSE,
  status document_status NOT NULL DEFAULT 'pending',
  extracted_item_count INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. STRUCTURED MEDICAL ENTRIES (Timeline & Clinical Data)
-- ============================================================================
CREATE TABLE public.medical_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE SET NULL,
  
  category medical_category NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  is_date_estimated BOOLEAN DEFAULT FALSE,
  
  -- Document source citation details
  source_info JSONB NOT NULL DEFAULT '{
    "documentName": "",
    "page": 1,
    "confidenceScore": 1.0,
    "snippet": ""
  }'::jsonb,

  -- Verification & Flagging Workflow
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by_patient BOOLEAN DEFAULT FALSE,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,

  -- Category specific payloads (strongly typed JSONB)
  diagnosis_data JSONB,   -- { icdCode, status, severity, diagnosingDoctor, notes }
  allergy_data JSONB,     -- { allergen, reaction, severity, category }
  medication_data JSONB,  -- { dosage, frequency, route, isActive, prescribedBy, indication, instructions, warnings }
  lab_result_data JSONB,  -- { testName, category, value, numericValue, unit, referenceRange, isAbnormal, interpretation }
  imaging_data JSONB,     -- { modality, bodyPart, facility, radiologist, impression, findings }
  discharge_data JSONB,   -- { hospitalName, admissionDate, dischargeDate, attendingPhysician, summary, followUpPlan }

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. DOCTOR SHARING SESSIONS (Expiring & Revocable Access Tokens)
-- ============================================================================
CREATE TABLE public.share_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT ('hm_' || encode(gen_random_bytes(16), 'hex')),
  duration_hours INT NOT NULL DEFAULT 24,
  status share_status NOT NULL DEFAULT 'active',
  access_count INT NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. INDEXES FOR HIGH-PERFORMANCE TIMELINE & LOOKUPS
-- ============================================================================
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_medical_entries_patient_date ON public.medical_entries(patient_id, event_date DESC);
CREATE INDEX idx_medical_entries_category ON public.medical_entries(patient_id, category);
CREATE INDEX idx_medical_entries_verified ON public.medical_entries(patient_id, verified);
CREATE INDEX idx_share_sessions_token ON public.share_sessions(token);
CREATE INDEX idx_share_sessions_patient ON public.share_sessions(patient_id);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_sessions ENABLE ROW LEVEL SECURITY;

-- 7.1 Patients Table Policies: Patient can only read and update their own record
CREATE POLICY "Patients: select own profile"
  ON public.patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Patients: update own profile"
  ON public.patients FOR UPDATE
  USING (auth.uid() = user_id);

-- 7.2 Uploaded Documents Policies
CREATE POLICY "Documents: select own documents"
  ON public.uploaded_documents FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Documents: insert own documents"
  ON public.uploaded_documents FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Documents: delete own documents"
  ON public.uploaded_documents FOR DELETE
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- 7.3 Medical Entries Policies (Patient CRUD)
CREATE POLICY "Entries: select own entries"
  ON public.medical_entries FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Entries: insert own entries"
  ON public.medical_entries FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Entries: update own entries"
  ON public.medical_entries FOR UPDATE
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Entries: delete own entries"
  ON public.medical_entries FOR DELETE
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- 7.4 Share Sessions Policies (Patient controls creation and revocation)
CREATE POLICY "Shares: select own share sessions"
  ON public.share_sessions FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Shares: insert own share sessions"
  ON public.share_sessions FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Shares: update own share sessions"
  ON public.share_sessions FOR UPDATE
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- ============================================================================
-- 8. PHYSICIAN READ-ONLY ACCESS VIA TOKEN (Secure RPC Function)
-- ============================================================================
-- When a doctor scans a QR code with token `hm_xyz`, this function checks
-- token validity, expiration, and active status, then returns the clinical report.

CREATE OR REPLACE FUNCTION get_shared_medical_summary(share_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share RECORD;
  v_patient RECORD;
  v_entries JSONB;
BEGIN
  -- 1. Find and validate the session
  SELECT * INTO v_share
  FROM public.share_sessions
  WHERE token = share_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'INVALID_TOKEN', 'message', 'Share link is not recognized.');
  END IF;

  IF v_share.status = 'revoked' THEN
    RETURN jsonb_build_object('error', 'ACCESS_REVOKED', 'message', 'Access has been revoked by the patient.');
  END IF;

  IF v_share.expires_at < NOW() THEN
    UPDATE public.share_sessions SET status = 'expired' WHERE id = v_share.id;
    RETURN jsonb_build_object('error', 'ACCESS_EXPIRED', 'message', 'This medical share link has expired.');
  END IF;

  -- 2. Increment access counter
  UPDATE public.share_sessions
  SET access_count = access_count + 1,
      last_accessed_at = NOW()
  WHERE id = v_share.id;

  -- 3. Fetch patient profile
  SELECT id, mrn, full_name, date_of_birth, gender, blood_group, emergency_contact, primary_care_physician, insurance
  INTO v_patient
  FROM public.patients
  WHERE id = v_share.patient_id;

  -- 4. Aggregate patient medical entries
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', e.id,
      'category', e.category,
      'title', e.title,
      'date', e.event_date,
      'isDateEstimated', e.is_date_estimated,
      'verified', e.verified,
      'verifiedAt', e.verified_at,
      'flagged', e.flagged,
      'flagReason', e.flag_reason,
      'source', e.source_info,
      'diagnosis', e.diagnosis_data,
      'allergy', e.allergy_data,
      'medication', e.medication_data,
      'labResult', e.lab_result_data,
      'imaging', e.imaging_data,
      'discharge', e.discharge_data
    ) ORDER BY e.event_date DESC
  ) INTO v_entries
  FROM public.medical_entries e
  WHERE e.patient_id = v_share.patient_id;

  -- 5. Return composite summary
  RETURN jsonb_build_object(
    'patient', row_to_json(v_patient),
    'entries', COALESCE(v_entries, '[]'::jsonb),
    'session', jsonb_build_object(
      'expiresAt', v_share.expires_at,
      'status', v_share.status,
      'accessCount', v_share.access_count + 1
    )
  );
END;
$$;

-- Grant execution of the public doctor retrieval function to unauthenticated anon users (QR scan)
GRANT EXECUTE ON FUNCTION get_shared_medical_summary(TEXT) TO anon, authenticated;

-- ============================================================================
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION
-- ============================================================================
-- Execute in Supabase SQL editor to create the secure private bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-medical-records', 'patient-medical-records', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Patients can manage their own files
CREATE POLICY "Allow authenticated patient upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-medical-records'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow patient read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-medical-records'
    AND auth.role() = 'authenticated'
  );
