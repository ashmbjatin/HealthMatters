// Medical Data Types for HealthMatters

export type MedicalCategory = 
  | 'diagnosis'
  | 'allergy'
  | 'medication'
  | 'lab'
  | 'imaging'
  | 'procedure'
  | 'discharge';

export type DocumentType = 
  | 'pdf'
  | 'image'
  | 'prescription'
  | 'lab_report'
  | 'scan_report'
  | 'discharge_summary'
  | 'text';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number; // in bytes
  type: DocumentType;
  uploadedAt: string;
  previewUrl?: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'analyzed' | 'error';
  progress?: number;
  extractedItemCount?: number;
  mimeType?: string;
  isCameraCapture?: boolean;
  textContent?: string;
}

export interface SourceReference {
  documentId: string;
  documentName: string;
  page?: number;
  confidenceScore: number; // 0 to 1
  snippet?: string;
}

export interface DiagnosisDetails {
  icdCode?: string;
  status: 'Active' | 'Resolved' | 'Chronic' | 'Monitoring';
  severity?: 'Mild' | 'Moderate' | 'Severe';
  diagnosingDoctor?: string;
  notes?: string;
}

export interface AllergyDetails {
  allergen: string;
  reaction: string;
  severity: 'High' | 'Moderate' | 'Low';
  category: 'Drug' | 'Food' | 'Environmental' | 'Other';
}

export interface MedicationDetails {
  dosage: string;
  frequency: string;
  route: string; // e.g. Oral, Topical, IV
  isActive: boolean;
  prescribedBy?: string;
  indication?: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  warnings?: string[];
}

export interface LabResultDetails {
  testName: string;
  category?: 'Hematology' | 'Metabolic' | 'Lipid' | 'Urinalysis' | 'Endocrine' | 'Other';
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  minNormal?: number;
  maxNormal?: number;
  isAbnormal: boolean;
  interpretation: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface ImagingProcedureDetails {
  modality?: string; // MRI, CT, X-Ray, Ultrasound
  bodyPart?: string;
  facility?: string;
  radiologist?: string;
  findings?: string;
  impression?: string;
}

export interface DischargeDetails {
  hospitalName: string;
  admissionDate?: string;
  dischargeDate?: string;
  attendingPhysician?: string;
  summary: string;
  dischargeMedications?: string[];
  followUpPlan?: string[];
}

export interface MedicalEntry {
  id: string;
  category: MedicalCategory;
  title: string;
  date: string;
  isDateEstimated?: boolean;
  source: SourceReference;
  verified: boolean;
  verifiedAt?: string;
  verifiedByPatient?: boolean;
  flagged?: boolean;
  flagReason?: string;
  
  // Category specific details
  diagnosis?: DiagnosisDetails;
  allergy?: AllergyDetails;
  medication?: MedicationDetails;
  labResult?: LabResultDetails;
  imaging?: ImagingProcedureDetails;
  discharge?: DischargeDetails;
}

export interface PatientProfile {
  id: string;
  mrn: string; // Medical Record Number
  fullName: string;
  dateOfBirth: string;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryCarePhysician: {
    name: string;
    clinic: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
  };
}

export interface ShareSession {
  shareId: string;
  token: string;
  patientId: string;
  createdAt: string;
  expiresAt: string;
  durationHours: number;
  status: 'active' | 'expired' | 'revoked';
  accessCount: number;
  lastAccessedAt?: string;
  revokedAt?: string;
}

export type VerificationState = 'unverified' | 'partially_verified' | 'verified';

export interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  flagged: number;
  state: VerificationState;
  percentVerified: number;
}
