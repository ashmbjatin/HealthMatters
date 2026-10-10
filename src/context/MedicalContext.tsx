import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  MedicalEntry, 
  UploadedDocument, 
  PatientProfile, 
  ShareSession, 
  VerificationStats, 
  DocumentType,
  MedicalCategory
} from '../types/medical';
import { SAMPLE_PATIENT, SAMPLE_DOCUMENTS, SAMPLE_ENTRIES, INITIAL_SHARE_SESSION } from '../data/mockData';
import { geminiAnalyzer } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';

interface MedicalContextType {
  patient: PatientProfile;
  documents: UploadedDocument[];
  entries: MedicalEntry[];
  shareSession: ShareSession | null;
  activeTab: 'dashboard' | 'upload' | 'timeline' | 'review' | 'share' | 'doctor';
  isAnalyzing: boolean;
  analysisStep: string;
  analysisProgress: number;
  stats: VerificationStats;
  apiKey: string;
  setApiKey: (key: string) => void;
  setActiveTab: (tab: 'dashboard' | 'upload' | 'timeline' | 'review' | 'share' | 'doctor') => void;
  addDocuments: (files: { file: File; type: DocumentType; isCamera?: boolean }[]) => Promise<void>;
  removeDocument: (docId: string) => void;
  startAnalysis: () => Promise<void>;
  updateEntry: (id: string, updated: Partial<MedicalEntry>) => void;
  verifyEntry: (id: string) => void;
  removeEntry: (id: string) => void;
  addCustomEntry: (entry: Omit<MedicalEntry, 'id'>) => void;
  verifyAllEntries: () => void;
  generateShareSession: (durationHours: number) => Promise<ShareSession>;
  revokeShareSession: () => Promise<void>;
  resetToEmptyState: () => void;
  loadSampleData: () => void;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

const STORAGE_KEY_DOCS = 'hm_documents';
const STORAGE_KEY_ENTRIES = 'hm_entries';
const STORAGE_KEY_SHARE = 'hm_share_session';
const STORAGE_KEY_API_KEY = 'hm_gemini_api_key';
const STORAGE_KEY_PATIENT = 'hm_patient_profile';

export const MedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PATIENT);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SAMPLE_PATIENT;
  });
  
  // Local state initialized with sample data or localStorage
  const [documents, setDocuments] = useState<UploadedDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DOCS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SAMPLE_DOCUMENTS;
  });

  const [entries, setEntries] = useState<MedicalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SAMPLE_ENTRIES;
  });

  const [shareSession, setShareSession] = useState<ShareSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHARE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SHARE_SESSION;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'timeline' | 'review' | 'share' | 'doctor'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(STORAGE_KEY_API_KEY, key);
    geminiAnalyzer.setApiKey(key);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(patient));
  }, [patient]);

  useEffect(() => {
    if (shareSession) {
      localStorage.setItem(STORAGE_KEY_SHARE, JSON.stringify(shareSession));
    } else {
      localStorage.removeItem(STORAGE_KEY_SHARE);
    }
  }, [shareSession]);

  // Check URL params for direct doctor access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'doctor' || urlParams.get('shareToken')) {
      setActiveTab('doctor');
    }
  }, []);

  // Compute Verification Stats
  const stats: VerificationStats = useMemo(() => {
    const total = entries.length;
    if (total === 0) {
      return { total: 0, verified: 0, pending: 0, flagged: 0, state: 'unverified', percentVerified: 0 };
    }
    const verified = entries.filter(e => e.verified).length;
    const flagged = entries.filter(e => e.flagged && !e.verified).length;
    const pending = total - verified;
    const percentVerified = Math.round((verified / total) * 100);

    let state: VerificationStats['state'] = 'unverified';
    if (verified === total) {
      state = 'verified';
    } else if (verified > 0) {
      state = 'partially_verified';
    }

    return { total, verified, pending, flagged, state, percentVerified };
  }, [entries]);

  // Add uploaded documents
  const addDocuments = async (files: { file: File; type: DocumentType; isCamera?: boolean }[]) => {
    const newDocs: UploadedDocument[] = [];

    for (const item of files) {
      let fileText = '';
      if (item.file.type.includes('text') || item.file.name.endsWith('.txt') || item.file.name.endsWith('.json')) {
        try {
          fileText = await item.file.text();
        } catch (e) {
          console.warn('Could not read text from file:', item.file.name);
        }
      }

      const storageResult = await supabaseService.uploadRecordToStorage(item.file, patient.id);
      const doc: UploadedDocument = {
        id: 'doc_' + Math.random().toString(36).substring(2, 9),
        name: item.file.name,
        size: item.file.size,
        type: item.type,
        uploadedAt: new Date().toISOString(),
        previewUrl: storageResult.publicUrl,
        status: 'pending',
        progress: 100,
        mimeType: item.file.type,
        isCameraCapture: item.isCamera,
        textContent: fileText || undefined,
      };
      newDocs.push(doc);
    }

    setDocuments(prev => [...newDocs, ...prev]);
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Run AI analysis
  const startAnalysis = async () => {
    if (documents.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(5);
    setAnalysisStep('Starting clinical processing pipeline...');

    try {
      const result = await geminiAnalyzer.analyzeDocuments(documents, (step, pct) => {
        setAnalysisStep(step);
        setAnalysisProgress(pct);
      });

      // Place newly extracted entries prominently at the top so dashboard and timeline reflect recent analysis
      setEntries(prev => {
        // Create map of existing entries
        const existingEntries = prev.filter(p => !result.entries.some(r => r.id === p.id));
        // Avoid duplicate clinical titles if extracted from same category
        const newKeys = new Set(result.entries.map(e => `${e.category}:${e.title.toLowerCase()}`));
        const nonDuplicateExisting = existingEntries.filter(e => !newKeys.has(`${e.category}:${e.title.toLowerCase()}`));
        return [...result.entries, ...nonDuplicateExisting];
      });

      // Update patient profile if detected from records (e.g. Anish Patel)
      if (result.patientProfile && result.patientProfile.fullName) {
        setPatient(prev => ({
          ...prev,
          fullName: result.patientProfile?.fullName || prev.fullName,
          mrn: result.patientProfile?.mrn || prev.mrn,
          dateOfBirth: result.patientProfile?.dob || prev.dateOfBirth,
          gender: result.patientProfile?.gender || prev.gender,
          bloodGroup: result.patientProfile?.bloodGroup || prev.bloodGroup,
        }));
      }

      // Mark documents as analyzed
      setDocuments(prev => prev.map(d => ({ ...d, status: 'analyzed' })));

      // Direct to Review & Verification screen
      setTimeout(() => {
        setIsAnalyzing(false);
        setActiveTab('dashboard'); // Redirect to dashboard to immediately view updated clinical history
      }, 600);
    } catch (err) {
      console.error('Analysis failed:', err);
      setIsAnalyzing(false);
      setAnalysisStep('Analysis encountered an error. Please try again.');
    }
  };

  const updateEntry = (id: string, updated: Partial<MedicalEntry>) => {
    setEntries(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          ...updated,
          // If user modified a flagged item, we can clear the flag or update verified status
        };
      }
      return e;
    }));
  };

  const verifyEntry = (id: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          verified: true,
          verifiedAt: new Date().toISOString(),
          verifiedByPatient: true,
          flagged: false, // Patient resolved flag
        };
      }
      return e;
    }));
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const addCustomEntry = (entry: Omit<MedicalEntry, 'id'>) => {
    const newEntry: MedicalEntry = {
      ...entry,
      id: 'manual_' + Math.random().toString(36).substring(2, 9),
      verified: true,
      verifiedAt: new Date().toISOString(),
      verifiedByPatient: true,
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const verifyAllEntries = () => {
    const now = new Date().toISOString();
    setEntries(prev => prev.map(e => ({
      ...e,
      verified: true,
      verifiedAt: now,
      verifiedByPatient: true,
      flagged: false,
    })));
  };

  const generateShareSession = async (durationHours: number): Promise<ShareSession> => {
    const session = await supabaseService.createSharingSession(patient.id, durationHours);
    setShareSession(session);
    return session;
  };

  const revokeShareSession = async () => {
    if (shareSession) {
      await supabaseService.revokeSharingSession(shareSession.shareId);
      setShareSession(prev => prev ? { ...prev, status: 'revoked', revokedAt: new Date().toISOString() } : null);
    }
  };

  const resetToEmptyState = () => {
    setDocuments([]);
    setEntries([]);
    setShareSession(null);
    localStorage.removeItem(STORAGE_KEY_DOCS);
    localStorage.removeItem(STORAGE_KEY_ENTRIES);
    localStorage.removeItem(STORAGE_KEY_SHARE);
    setActiveTab('upload');
  };

  const loadSampleData = () => {
    setPatient(SAMPLE_PATIENT);
    setDocuments(SAMPLE_DOCUMENTS);
    setEntries(SAMPLE_ENTRIES);
    setShareSession(INITIAL_SHARE_SESSION);
    setActiveTab('dashboard');
  };

  return (
    <MedicalContext.Provider
      value={{
        patient,
        documents,
        entries,
        shareSession,
        activeTab,
        isAnalyzing,
        analysisStep,
        analysisProgress,
        stats,
        apiKey,
        setApiKey,
        setActiveTab,
        addDocuments,
        removeDocument,
        startAnalysis,
        updateEntry,
        verifyEntry,
        removeEntry,
        addCustomEntry,
        verifyAllEntries,
        generateShareSession,
        revokeShareSession,
        resetToEmptyState,
        loadSampleData,
      }}
    >
      {children}
    </MedicalContext.Provider>
  );
};

export const useMedical = () => {
  const context = useContext(MedicalContext);
  if (!context) {
    throw new Error('useMedical must be used within a MedicalProvider');
  }
  return context;
};
