import React, { useState } from 'react';
import { 
  Stethoscope, 
  Printer, 
  ShieldCheck, 
  AlertOctagon, 
  Pill, 
  Activity, 
  FileText, 
  Calendar, 
  Phone, 
  ArrowLeft, 
  Heart, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Download,
  Building2,
  Clock
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';

export const DoctorView: React.FC = () => {
  const { 
    patient, 
    entries, 
    shareSession, 
    stats, 
    setActiveTab 
  } = useMedical();

  const [activeSection, setActiveSection] = useState<'all' | 'meds' | 'labs' | 'timeline'>('all');

  // Filter clinical sets
  const allergies = entries.filter(e => e.category === 'allergy');
  const activeMedications = entries.filter(e => e.category === 'medication' && e.medication?.isActive);
  const activeDiagnoses = entries.filter(e => e.category === 'diagnosis');
  const labResults = entries.filter(e => e.category === 'lab');
  const imagingRecords = entries.filter(e => e.category === 'imaging');
  const dischargeSummaries = entries.filter(e => e.category === 'discharge');

  const isExpired = shareSession ? new Date(shareSession.expiresAt).getTime() < Date.now() : false;
  const isRevoked = shareSession?.status === 'revoked';

  const handlePrint = () => {
    window.print();
  };

  if (isRevoked || isExpired) {
    return (
      <div className="card" style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: 'var(--radius-xl)', 
          backgroundColor: 'var(--color-critical-light)', 
          color: 'var(--color-critical)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.25rem auto' 
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
          {isRevoked ? 'Access Revoked by Patient' : 'Access Link Expired'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          This QR access token has been {isRevoked ? 'revoked' : 'expired'} by the patient for security. Please request the patient to generate a new scan code.
        </p>
        <button className="btn btn-secondary" onClick={() => setActiveTab('share')}>
          <ArrowLeft size={16} /> Return to Sharing Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.25rem', marginBottom: '4rem' }}>
      {/* Clinician Access Navigation & Print Bar */}
      <div className="no-print" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: '#0f172a',
        borderRadius: 'var(--radius-lg)',
        color: '#ffffff',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--color-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Stethoscope size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              Physician Read-Only Consultation Portal
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
              Token: <code>{shareSession?.token || 'hm_token_direct'}</code> • Expires: {shareSession ? new Date(shareSession.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '24h'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint} style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
            <Printer size={15} /> Print / Save PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('dashboard')}>
            <ArrowLeft size={15} /> Back to Patient View
          </button>
        </div>
      </div>

      {/* Patient Header Summary Card (High Density Clinical Format) */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem', border: '2px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text-main)' }}>
                {patient.fullName}
              </h1>
              <span className="badge badge-teal" style={{ fontSize: '0.82rem' }}>
                Blood: {patient.bloodGroup}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.82rem' }}>
                MRN: {patient.mrn}
              </span>
              {stats.state === 'verified' ? (
                <span className="badge badge-green">
                  <CheckCircle2 size={13} /> Patient Attested & Verified
                </span>
              ) : (
                <span className="badge badge-amber">
                  <AlertTriangle size={13} /> Partial Patient Verification
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.65rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              <div><strong>DOB:</strong> {patient.dateOfBirth} (42 yo, {patient.gender})</div>
              <div><strong>Primary Care:</strong> {patient.primaryCarePhysician.name} ({patient.primaryCarePhysician.clinic})</div>
              <div><strong>Insurance:</strong> {patient.insurance?.provider}</div>
            </div>
          </div>

          {/* Emergency Contact Quick Card */}
          <div style={{ 
            backgroundColor: 'var(--color-surface-subtle)', 
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)',
            fontSize: '0.82rem'
          }}>
            <div style={{ fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={13} color="var(--color-teal)" /> Emergency Contact
            </div>
            <div style={{ marginTop: '0.2rem' }}>
              {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-teal)' }}>
              {patient.emergencyContact.phone}
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL EMERGENCY BANNER: ALLERGIES & SENSITIVITIES */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '1.5rem', 
          backgroundColor: 'var(--color-critical-light)', 
          borderColor: 'var(--color-critical-border)',
          borderWidth: '2px',
          padding: '1.25rem 1.5rem' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <AlertOctagon size={24} color="var(--color-critical)" />
          <h3 style={{ color: 'var(--color-critical-text)', fontSize: '1.15rem' }}>
            CRITICAL ALLERGIES & ADVERSE DRUG REACTIONS
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {allergies.map(alg => (
            <div 
              key={alg.id}
              style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1rem',
                border: '1.5px solid var(--color-critical-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.98rem', color: 'var(--color-critical-text)' }}>
                  {alg.allergy?.allergen || alg.title}
                </strong>
                <span className="badge badge-critical" style={{ fontSize: '0.72rem' }}>
                  {alg.allergy?.severity} SEVERITY
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                <strong>Reaction:</strong> {alg.allergy?.reaction}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-faint)', marginTop: '0.2rem' }}>
                Source: {alg.source.documentName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: ACTIVE MEDICATIONS TABLE */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Current Active Medications ({activeMedications.length})</h3>
          </div>
          <span className="badge badge-green">Ongoing Therapy</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Medication</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Dosage</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Frequency & Instructions</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Indication</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Prescriber</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {activeMedications.map((med, idx) => (
                <tr 
                  key={med.id} 
                  style={{ 
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--color-surface-subtle)' 
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {med.title}
                    {med.flagged && (
                      <span className="badge badge-amber" style={{ display: 'block', width: 'fit-content', marginTop: '0.2rem', fontSize: '0.7rem' }}>
                        Dosage Flagged
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primary-text)' }}>
                    {med.medication?.dosage}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {med.medication?.frequency}
                    {med.medication?.instructions && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                        {med.medication.instructions}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {med.medication?.indication || 'General'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                    {med.medication?.prescribedBy || 'Clinic'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.76rem', color: 'var(--color-text-faint)' }}>
                    {med.source.documentName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: ACTIVE DIAGNOSES & CHRONIC CONDITIONS */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Activity size={20} color="var(--color-teal)" />
          <h3 style={{ fontSize: '1.2rem' }}>Active Medical Diagnoses</h3>
        </div>

        <div className="grid-2">
          {activeDiagnoses.map(dx => (
            <div 
              key={dx.id} 
              style={{ 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>
                  {dx.title}
                </strong>
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                  ICD-10: {dx.diagnosis?.icdCode || 'Clinical'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                <span>Status: <strong>{dx.diagnosis?.status}</strong></span>
                <span>Diagnosed: {dx.date}</span>
              </div>
              {dx.diagnosis?.notes && (
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                  {dx.diagnosis.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: RECENT LAB PANEL WITH ABNORMAL HIGHLIGHTS */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Recent Diagnostic Blood & Metabolic Panels</h3>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Certified Lab Panel (Aug 2024)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {labResults.map(lab => {
            const isAbnormal = lab.labResult?.isAbnormal;
            return (
              <div 
                key={lab.id} 
                style={{ 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1.5px solid',
                  borderColor: isAbnormal ? 'var(--color-critical-border)' : 'var(--color-border)',
                  backgroundColor: isAbnormal ? 'var(--color-critical-light)' : 'var(--color-surface)'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                  {lab.labResult?.testName || lab.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.4rem 0' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: isAbnormal ? 'var(--color-critical)' : 'var(--color-text-main)' }}>
                    {lab.labResult?.value}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    {lab.labResult?.unit}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Reference: <strong>{lab.labResult?.referenceRange}</strong>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`badge ${isAbnormal ? 'badge-critical' : 'badge-green'}`} style={{ fontSize: '0.72rem' }}>
                    {lab.labResult?.interpretation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: HOSPITAL DISCHARGES & IMAGING */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Imaging */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <FileText size={18} color="var(--color-teal)" />
            <h4 style={{ fontSize: '1.05rem' }}>Radiology & Imaging Impressions</h4>
          </div>
          {imagingRecords.map(img => (
            <div key={img.id} style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{img.title} ({img.date})</div>
              <div style={{ fontSize: '0.84rem', marginTop: '0.25rem', color: 'var(--color-text-main)' }}>
                <strong>Impression:</strong> {img.imaging?.impression}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-faint)', marginTop: '0.2rem' }}>
                Facility: {img.imaging?.facility}
              </div>
            </div>
          ))}
        </div>

        {/* Discharge */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Building2 size={18} color="var(--color-primary)" />
            <h4 style={{ fontSize: '1.05rem' }}>Recent Hospital Discharge</h4>
          </div>
          {dischargeSummaries.map(dis => (
            <div key={dis.id} style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{dis.discharge?.hospitalName} ({dis.date})</div>
              <p style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: 'var(--color-text-main)' }}>
                {dis.discharge?.summary}
              </p>
              {dis.discharge?.followUpPlan && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  <strong>Follow-Up:</strong> {dis.discharge.followUpPlan.join('; ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Attestation & Signature */}
      <div className="card" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--color-success-text)', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem' }}>
          <ShieldCheck size={18} />
          Certified Patient-Controlled Medical Summary
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', maxWidth: '620px', margin: '0 auto' }}>
          This summary was extracted from original patient documents and verified via HealthMatters. For primary clinical decisions, consult the patient's licensed attending physician.
        </p>
      </div>
    </div>
  );
};
