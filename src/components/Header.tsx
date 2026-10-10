import React from 'react';
import { 
  Heart, 
  UploadCloud, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Stethoscope, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';

export const Header: React.FC = () => {
  const { 
    patient, 
    documents, 
    entries, 
    stats, 
    activeTab, 
    setActiveTab, 
    resetToEmptyState, 
    loadSampleData,
    shareSession
  } = useMedical();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-badge" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon-box">
            <Heart size={26} strokeWidth={2.6} />
          </div>
          <div>
            <div className="brand-text-title">
              HealthMatters
              <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                Secure Vault
              </span>
            </div>
            <div className="brand-tagline">
              Patient Medical Consolidator & QR Sharing
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={16} />
            Upload Records
            {documents.length > 0 && (
              <span className="nav-tab-count">{documents.length}</span>
            )}
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Clock size={16} />
            Health Timeline
            {entries.length > 0 && (
              <span className="nav-tab-count">{entries.length}</span>
            )}
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            <CheckCircle2 size={16} />
            Review & Verify
            {stats.flagged > 0 && (
              <span className="nav-tab-count" style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning-text)' }}>
                {stats.flagged} review
              </span>
            )}
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <QrCode size={16} />
            Doctor QR Share
            {shareSession && shareSession.status === 'active' && (
              <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                Active
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions: Doctor View preview, Demo data reset */}
        <div className="header-right-actions">
          <button 
            className={`btn btn-sm ${activeTab === 'doctor' ? 'btn-teal' : 'btn-secondary'}`}
            onClick={() => setActiveTab('doctor')}
            title="Preview the exact screen scanned doctors will see"
          >
            <Stethoscope size={15} />
            Doctor View
          </button>

          {documents.length === 0 ? (
            <button 
              className="btn btn-primary btn-sm"
              onClick={loadSampleData}
              title="Load realistic sample clinical records"
            >
              Load Demo Patient
            </button>
          ) : (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={resetToEmptyState}
              title="Reset records to test empty state"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
