import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Camera, 
  FileText, 
  Image, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Cpu, 
  HelpCircle,
  FilePlus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { DocumentType } from '../types/medical';
import { CameraCaptureModal } from './CameraCaptureModal';

export const UploadView: React.FC = () => {
  const { 
    documents, 
    addDocuments, 
    removeDocument, 
    startAnalysis, 
    isAnalyzing, 
    analysisStep, 
    analysisProgress,
    loadSampleData
  } = useMedical();

  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('pdf');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processFiles(files);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    await processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const validFiles: { file: File; type: DocumentType }[] = [];

    for (const file of files) {
      // Validate file size (max 25MB per record)
      if (file.size > 25 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 25MB limit.`);
        continue;
      }

      let inferredType: DocumentType = 'pdf';
      const name = file.name.toLowerCase();

      if (file.type.includes('image') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
        inferredType = name.includes('rx') || name.includes('prescrip') ? 'prescription' : 'image';
      } else if (file.type.includes('pdf') || name.endsWith('.pdf')) {
        if (name.includes('lab') || name.includes('cbc') || name.includes('blood')) {
          inferredType = 'lab_report';
        } else if (name.includes('discharge')) {
          inferredType = 'discharge_summary';
        } else if (name.includes('scan') || name.includes('xray') || name.includes('mri')) {
          inferredType = 'scan_report';
        } else {
          inferredType = 'pdf';
        }
      } else if (file.type.includes('text') || name.endsWith('.txt')) {
        inferredType = 'text';
      }

      validFiles.push({ file, type: inferredType });
    }

    if (validFiles.length > 0) {
      await addDocuments(validFiles);
    }
  };

  const handleCameraCapture = async (file: File, type: DocumentType) => {
    await addDocuments([{ file, type, isCamera: true }]);
  };

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'lab_report': return <span className="badge badge-teal">Lab Work</span>;
      case 'prescription': return <span className="badge badge-green">Prescription</span>;
      case 'discharge_summary': return <span className="badge badge-amber">Discharge Summary</span>;
      case 'scan_report': return <span className="badge badge-neutral">Imaging Scan</span>;
      case 'pdf': return <span className="badge badge-neutral">PDF Document</span>;
      case 'image': return <span className="badge badge-neutral">Image / Photo</span>;
      default: return <span className="badge badge-neutral">Clinical Note</span>;
    }
  };

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <h2>Medical Record Intake & Upload</h2>
          <span className="section-subtitle">
            Upload hospital reports, blood panels, and prescriptions or use your phone camera
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={loadSampleData}
            title="Load synthetic documents to test instant extraction"
          >
            <FolderOpen size={15} /> Load Sample Records
          </button>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2.5px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          backgroundColor: isDragging ? 'var(--color-primary-light)' : 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          boxShadow: varCss('--shadow-sm')
        }}
      >
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: 'var(--radius-xl)', 
          backgroundColor: 'var(--color-primary-light)', 
          color: 'var(--color-primary)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.25rem auto' 
        }}>
          <UploadCloud size={32} />
        </div>

        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.45rem' }}>
          Drag & Drop Medical Documents
        </h3>
        <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
          Supports multi-page PDFs, clinical photos, prescription screenshots, lab blood panels, discharge summaries, and scan reports.
        </p>

        {uploadError && (
          <div style={{ 
            backgroundColor: 'var(--color-critical-light)', 
            border: '1px solid var(--color-critical-border)', 
            color: 'var(--color-critical-text)', 
            padding: '0.65rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            maxWidth: '520px', 
            margin: '0 auto 1.25rem auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} /> {uploadError}
          </div>
        )}

        {/* Primary Action Buttons: Browse and Camera */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInputChange} 
            multiple 
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt" 
            style={{ display: 'none' }} 
          />

          <button 
            type="button" 
            className="btn btn-primary btn-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <FilePlus size={18} /> Browse Files
          </button>

          <button 
            type="button" 
            className="btn btn-teal btn-lg"
            onClick={() => setIsCameraOpen(true)}
          >
            <Camera size={18} /> Capture with Camera
          </button>
        </div>

        <div style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
          HIPAA & Clinical Confidentiality Compliant • Client-Side Tokenization • Max 25 MB per file
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={20} color="var(--color-primary)" />
            <h3>Staged Medical Records ({documents.length})</h3>
          </div>

          {documents.length > 0 && (
            <button 
              className="btn btn-primary btn-lg" 
              onClick={startAnalysis}
              disabled={isAnalyzing}
              style={{ padding: '0.8rem 1.8rem' }}
            >
              <Sparkles size={18} /> Analyze Records with Gemini AI
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p>No documents staged yet. Upload a file above or load the sample patient records to test the AI analyzer.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="card"
                style={{ 
                  padding: '1rem 1.25rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: doc.type === 'prescription' ? 'var(--color-primary-light)' : doc.type === 'lab_report' ? 'var(--color-teal-light)' : 'var(--color-surface-subtle)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {doc.type.includes('image') || doc.type === 'prescription' ? (
                      <Image size={20} color="var(--color-primary)" />
                    ) : (
                      <FileText size={20} color="var(--color-teal)" />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--color-text-main)' }}>
                        {doc.name}
                      </span>
                      {getDocTypeBadge(doc.type)}
                      {doc.isCameraCapture && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Camera Scan</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {(doc.size / 1024).toFixed(1)} KB • Staged {new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {doc.status === 'analyzed' ? (
                    <span className="badge badge-green">
                      <CheckCircle2 size={13} /> Analyzed
                    </span>
                  ) : (
                    <span className="badge badge-neutral">Ready for AI</span>
                  )}

                  <button 
                    className="btn btn-secondary btn-icon-only" 
                    onClick={() => removeDocument(doc.id)}
                    title="Remove document"
                  >
                    <Trash2 size={16} color="var(--color-critical)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prominent Analyze Callout Box */}
      {documents.length > 0 && (
        <div 
          className="card" 
          style={{ 
            marginTop: '1.75rem', 
            backgroundColor: 'var(--color-primary-light)', 
            borderColor: 'var(--color-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.25rem 1.75rem'
          }}
        >
          <div>
            <h4 style={{ color: 'var(--color-primary-text)', marginBottom: '0.2rem' }}>
              Ready to consolidate {documents.length} medical document{documents.length > 1 ? 's' : ''}?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-text)' }}>
              Gemini Vision & Clinical NLP will extract medications, abnormal lab values, diagnoses, and dates with source citations.
            </p>
          </div>

          <button 
            className="btn btn-primary btn-lg" 
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            <Sparkles size={18} /> Analyze Records Now
          </button>
        </div>
      )}

      {/* Analysis In-Progress Modal */}
      {isAnalyzing && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-xl)', 
              backgroundColor: 'var(--color-primary-light)', 
              color: 'var(--color-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem auto' 
            }}>
              <Cpu size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.45rem' }}>Analyzing Medical Records</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', minHeight: '24px' }}>
              {analysisStep}
            </p>

            <div className="progress-track" style={{ height: '12px', marginBottom: '0.75rem' }}>
              <div className="progress-fill" style={{ width: `${analysisProgress}%` }} />
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {analysisProgress}% Complete
            </div>

            <div style={{ marginTop: '1.5rem', padding: '0.85rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'left' }}>
              • Gemini Medical Entity Extraction (RxNorm, ICD-10)<br />
              • Cross-document date reconciliation<br />
              • Flagging ambiguous dosages for patient review
            </div>
          </div>
        </div>
      )}

      {/* Device Camera Modal */}
      <CameraCaptureModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={handleCameraCapture} 
      />
    </div>
  );
};

function varCss(name: string): string {
  return '';
}
