import React, { useEffect, useRef } from 'react';
import { 
  FileText, 
  Pill, 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  UploadCloud, 
  QrCode, 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  Heart, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { animate, stagger } from 'animejs';

export const DashboardView: React.FC = () => {
  const { 
    patient, 
    documents, 
    entries, 
    stats, 
    setActiveTab, 
    loadSampleData,
    shareSession 
  } = useMedical();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Subtle Anime.js entrance animation (respecting prefers-reduced-motion)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches && containerRef.current) {
      animate(containerRef.current.querySelectorAll('.animate-card'), {
        translateY: [12, 0],
        opacity: [0, 1],
        delay: stagger(65),
        duration: 450,
      });
    }
  }, [entries.length]);

  // Derived dashboard metrics
  const allergies = entries.filter(e => e.category === 'allergy');
  const activeMedications = entries.filter(e => e.category === 'medication' && e.medication?.isActive);
  const activeDiagnoses = entries.filter(e => e.category === 'diagnosis');
  const recentLabs = entries.filter(e => e.category === 'lab');
  const latestRecords = [...entries].slice(0, 5); // entries has newly extracted items at the beginning

  // If no documents exist, present the helpful empty state
  if (documents.length === 0 && entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Heart size={36} />
        </div>
        <h2 className="empty-state-title">Welcome to HealthMatters</h2>
        <p className="empty-state-desc">
          Your personal, patient-controlled medical history consolidator. Upload your hospital discharge papers, laboratory tests, or prescription photos to automatically generate a structured health timeline and secure doctor QR code.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('upload')}>
            <UploadCloud size={20} /> Upload Medical Documents
          </button>
          <button className="btn btn-secondary btn-lg" onClick={loadSampleData}>
            Load Demo Patient Profile
          </button>
        </div>

        <div style={{ marginTop: '2.5rem', maxWidth: '680px', margin: '2.5rem auto 0 auto', textAlign: 'left' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>How HealthMatters Works:</h4>
          <div className="grid-3" style={{ gap: '0.85rem' }}>
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>1. Upload</div>
              <p style={{ fontSize: '0.82rem' }}>Drop multi-page PDFs, lab sheets, or capture prescriptions via phone camera.</p>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--color-teal)', marginBottom: '0.25rem' }}>2. AI Analysis</div>
              <p style={{ fontSize: '0.82rem' }}>Gemini clinical parser extracts medications, abnormal labs, and dates with references.</p>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.25rem' }}>3. QR Sharing</div>
              <p style={{ fontSize: '0.82rem' }}>Verify records, set an expiry timer, and let your physician scan your summary.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {/* Patient Welcome Banner */}
      <div className="card animate-card" style={{ marginTop: '1.25rem', padding: '1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-xl)', 
              backgroundColor: 'var(--color-primary-light)', 
              color: 'var(--color-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.35rem',
              border: '2px solid var(--color-primary-border)'
            }}>
              {patient.fullName
                .split(' ')
                .map(n => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'PT'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.4rem' }}>{patient.fullName}</h2>
                <span className="badge badge-neutral">MRN: {patient.mrn}</span>
                <span className="badge badge-teal">Blood: {patient.bloodGroup}</span>
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>
                DOB: {patient.dateOfBirth} (42 yrs) • Primary Clinic: {patient.primaryCarePhysician.clinic}
              </p>
            </div>
          </div>

          {/* Quick primary actions */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('upload')}>
              <UploadCloud size={15} /> Upload More
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('share')}>
              <QrCode size={15} /> Share with Doctor
            </button>
          </div>
        </div>

        {/* Verification Status Alert Banner */}
        <div className={`verification-banner ${stats.state}`} style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {stats.state === 'verified' ? (
              <CheckCircle size={28} color="var(--color-success)" />
            ) : stats.state === 'partially_verified' ? (
              <Activity size={28} color="var(--color-teal)" />
            ) : (
              <AlertTriangle size={28} color="var(--color-warning)" />
            )}
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                {stats.state === 'verified' && 'Medical History 100% Patient-Verified'}
                {stats.state === 'partially_verified' && `Verification In Progress (${stats.percentVerified}% Complete)`}
                {stats.state === 'unverified' && 'Verification Required Before Physician Sharing'}
              </h4>
              <p style={{ fontSize: '0.84rem' }}>
                {stats.verified} of {stats.total} clinical items approved.
                {stats.flagged > 0 && ` ${stats.flagged} item(s) have dosage or date ambiguities requiring your confirmation.`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ minWidth: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                <span>Verification</span>
                <span>{stats.percentVerified}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className={`progress-fill ${stats.state === 'verified' ? 'success' : stats.state === 'partially_verified' ? '' : 'warning'}`} 
                  style={{ width: `${stats.percentVerified}%` }}
                />
              </div>
            </div>

            <button 
              className={`btn btn-sm ${stats.state === 'verified' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setActiveTab('review')}
            >
              Review Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4" style={{ marginTop: '1.25rem' }}>
        {/* Total Documents */}
        <div className="card card-hover animate-card" onClick={() => setActiveTab('upload')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>Uploaded Records</span>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <FileText size={18} color="var(--color-teal)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--color-text-main)' }}>
            {documents.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-teal)', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            PDFs, Scans & Prescriptions <ChevronRight size={13} />
          </div>
        </div>

        {/* Current Medications */}
        <div className="card card-hover animate-card" onClick={() => setActiveTab('timeline')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>Active Medications</span>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)' }}>
              <Pill size={18} color="var(--color-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--color-primary)' }}>
            {activeMedications.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-text)', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Ongoing Prescriptions <ChevronRight size={13} />
          </div>
        </div>

        {/* Known Allergies */}
        <div className="card card-hover animate-card" onClick={() => setActiveTab('timeline')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>Documented Allergies</span>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-critical-light)', borderRadius: 'var(--radius-md)' }}>
              <AlertOctagon size={18} color="var(--color-critical)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--color-critical)' }}>
            {allergies.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-critical-text)', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {allergies.length > 0 
              ? `${allergies.filter(a => a.allergy?.severity === 'High').length} High Severity Alert${allergies.filter(a => a.allergy?.severity === 'High').length === 1 ? '' : 's'}`
              : 'No Known Allergies'} <ChevronRight size={13} />
          </div>
        </div>

        {/* Doctor Sharing Session */}
        <div className="card card-hover animate-card" onClick={() => setActiveTab('share')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>Doctor QR Access</span>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-teal-light)', borderRadius: 'var(--radius-md)' }}>
              <QrCode size={18} color="var(--color-teal)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--color-teal)' }}>
            {shareSession && shareSession.status === 'active' ? 'Active' : 'Ready'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-teal-text)', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {shareSession?.accessCount ? `${shareSession.accessCount} scan(s) recorded` : 'Generate 24h pass'} <ChevronRight size={13} />
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout: 2 Columns */}
      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Column 1: Critical Medical Alerts & Active Medications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Critical Allergies Box */}
          <div className="card animate-card" style={{ borderColor: 'var(--color-critical-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color="var(--color-critical)" />
                <h3 style={{ fontSize: '1.1rem' }}>Allergies & Drug Sensitivities</h3>
              </div>
              <span className="badge badge-critical">{allergies.length} Critical Alerts</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {allergies.map(alg => (
                <div 
                  key={alg.id}
                  style={{ 
                    padding: '0.85rem', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'var(--color-critical-light)', 
                    border: '1px solid var(--color-critical-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--color-critical-text)', fontSize: '0.92rem' }}>
                      {alg.allergy?.allergen || alg.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                      Reaction: {alg.allergy?.reaction}
                    </div>
                  </div>
                  <span className="badge badge-critical" style={{ fontSize: '0.72rem' }}>
                    {alg.allergy?.severity} Severity
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Medications List */}
          <div className="card animate-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.1rem' }}>Current Medications</h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('timeline')}>
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeMedications.map(med => (
                <div 
                  key={med.id} 
                  style={{ 
                    padding: '0.85rem', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--color-surface)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text-main)' }}>
                      {med.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {med.medication?.dosage} • {med.medication?.frequency}
                    </div>
                    {med.medication?.indication && (
                      <span className="badge badge-neutral" style={{ marginTop: '0.4rem', fontSize: '0.72rem' }}>
                        Indication: {med.medication.indication}
                      </span>
                    )}
                  </div>
                  {med.flagged && (
                    <span className="badge badge-amber" title={med.flagReason}>
                      Needs Review
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Recent Timeline Events & Active Diagnoses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Diagnoses */}
          <div className="card animate-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--color-teal)" />
                <h3 style={{ fontSize: '1.1rem' }}>Diagnoses & Medical Conditions</h3>
              </div>
              <span className="badge badge-teal">{activeDiagnoses.length} Documented</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activeDiagnoses.map(dx => (
                <div 
                  key={dx.id} 
                  style={{ 
                    padding: '0.85rem', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'var(--color-surface-subtle)', 
                    border: '1px solid var(--color-border)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      {dx.title}
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      ICD-10: {dx.diagnosis?.icdCode || 'Clinical'}
                    </span>
                  </div>
                  {dx.diagnosis?.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                      {dx.diagnosis.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Latest Records Timeline Snippet */}
          <div className="card animate-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.1rem' }}>Latest Health Records</h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('timeline')}>
                Explore Timeline <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {latestRecords.map(item => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    paddingBottom: '0.75rem', 
                    borderBottom: '1px solid var(--color-border)' 
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: item.category === 'lab' ? 'var(--color-teal-light)' : item.category === 'medication' ? 'var(--color-primary-light)' : 'var(--color-surface-subtle)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0 
                  }}>
                    {item.category === 'lab' && <Activity size={16} color="var(--color-teal)" />}
                    {item.category === 'medication' && <Pill size={16} color="var(--color-primary)" />}
                    {item.category === 'allergy' && <AlertOctagon size={16} color="var(--color-critical)" />}
                    {item.category === 'imaging' && <FileText size={16} color="var(--color-teal)" />}
                    {item.category === 'discharge' && <Heart size={16} color="var(--color-primary)" />}
                    {item.category === 'diagnosis' && <Activity size={16} color="var(--color-primary)" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-text-main)' }}>
                          {item.title}
                        </span>
                        {!item.verified && (
                          <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                            New / Unverified
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-faint)' }}>
                        {item.date}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                      Source: {item.source.documentName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
