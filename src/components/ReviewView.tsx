import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Sparkles, 
  UploadCloud, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  Check, 
  FileText,
  HelpCircle,
  QrCode,
  RotateCcw
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { MedicalEntry } from '../types/medical';

export const ReviewView: React.FC = () => {
  const { 
    entries, 
    stats, 
    updateEntry, 
    verifyEntry, 
    removeEntry, 
    verifyAllEntries, 
    startAnalysis, 
    setActiveTab 
  } = useMedical();

  const [filterMode, setFilterMode] = useState<'all' | 'attention' | 'pending' | 'verified'>('attention');
  const [editingItem, setEditingItem] = useState<MedicalEntry | null>(null);
  const [showAttestationModal, setShowAttestationModal] = useState(false);
  const [patientAgreed, setPatientAgreed] = useState(false);

  // Filter items
  const displayItems = entries.filter(e => {
    if (filterMode === 'attention') return e.flagged && !e.verified;
    if (filterMode === 'pending') return !e.verified;
    if (filterMode === 'verified') return e.verified;
    return true;
  });

  const attentionItems = entries.filter(e => e.flagged && !e.verified);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateEntry(editingItem.id, editingItem);
    // Mark as verified when patient explicitly corrects and saves
    verifyEntry(editingItem.id);
    setEditingItem(null);
  };

  const handleAttestationConfirm = () => {
    if (!patientAgreed) return;
    verifyAllEntries();
    setShowAttestationModal(false);
    setActiveTab('share');
  };

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h2>Review & Verify Health Records</h2>
          <span className="section-subtitle">
            Inspect AI-extracted data, correct any handwritten ambiguities, and certify accuracy before sharing
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('upload')}>
            <UploadCloud size={14} /> Add More Records
          </button>
          <button className="btn btn-secondary btn-sm" onClick={startAnalysis}>
            <RotateCcw size={14} /> Analyze Again
          </button>
        </div>
      </div>

      {/* Verification Summary Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className={`badge ${stats.state === 'verified' ? 'badge-green' : stats.state === 'partially_verified' ? 'badge-teal' : 'badge-amber'}`}>
                {stats.state === 'verified' ? '100% Patient Verified' : stats.state === 'partially_verified' ? 'Partially Verified' : 'Unverified (Review Needed)'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {stats.verified} of {stats.total} items approved
              </span>
            </div>

            <h3 style={{ marginTop: '0.45rem', fontSize: '1.2rem' }}>
              {stats.state === 'verified' 
                ? 'Your Medical History is fully certified and ready for doctors.'
                : `${stats.pending} item(s) pending your review. Ensure dosage and allergy details are accurate.`}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {stats.pending > 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowAttestationModal(true)}
              >
                <CheckCircle2 size={16} /> Complete & Attest Verification
              </button>
            )}

            {stats.state === 'verified' && (
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => setActiveTab('share')}
              >
                <QrCode size={18} /> Open Doctor QR Code
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '1rem' }}>
          <div className="progress-track" style={{ height: '10px' }}>
            <div 
              className={`progress-fill ${stats.state === 'verified' ? 'success' : ''}`} 
              style={{ width: `${stats.percentVerified}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flagged Items Attention Box */}
      {attentionItems.length > 0 && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1.5rem', 
            backgroundColor: 'var(--color-warning-light)', 
            borderColor: 'var(--color-warning-border)',
            padding: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={18} color="var(--color-warning)" />
            <h4 style={{ color: 'var(--color-warning-text)' }}>
              Items Requiring Immediate Patient Attention ({attentionItems.length})
            </h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-warning-text)', marginBottom: '0.85rem' }}>
            The AI detected ambiguous handwriting or missing dates in your original documents. Please verify them below:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {attentionItems.map(item => (
              <div 
                key={item.id}
                style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--color-warning-border)',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-warning-text)', marginTop: '0.15rem' }}>
                    Reason: {item.flagReason}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingItem({ ...item })}
                  >
                    <Edit3 size={13} /> Edit / Correct
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => verifyEntry(item.id)}
                  >
                    <Check size={13} /> Confirm As Is
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterMode('all')}
        >
          All Items ({entries.length})
        </button>
        <button 
          className={`btn btn-sm ${filterMode === 'attention' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterMode('attention')}
        >
          Needs Attention ({attentionItems.length})
        </button>
        <button 
          className={`btn btn-sm ${filterMode === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterMode('pending')}
        >
          Pending Verification ({stats.pending})
        </button>
        <button 
          className={`btn btn-sm ${filterMode === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterMode('verified')}
        >
          Verified ({stats.verified})
        </button>
      </div>

      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No records match this review filter.</p>
          </div>
        ) : (
          displayItems.map((item) => (
            <div 
              key={item.id} 
              className="card"
              style={{ 
                padding: '1.15rem', 
                borderLeft: item.verified ? '4px solid var(--color-success)' : '4px solid var(--color-warning)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: '1', minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>{item.date}</span>
                  {item.verified ? (
                    <span className="badge badge-green">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="badge badge-amber">
                      <AlertTriangle size={12} /> Pending Review
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.05rem', marginTop: '0.35rem', color: 'var(--color-text-main)' }}>
                  {item.title}
                </h4>

                {/* Details snippet */}
                {item.category === 'medication' && item.medication && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Dosage: <strong>{item.medication.dosage}</strong> • Frequency: {item.medication.frequency}
                  </div>
                )}

                {item.category === 'lab' && item.labResult && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Value: <strong>{item.labResult.value} {item.labResult.unit}</strong> (Ref: {item.labResult.referenceRange})
                  </div>
                )}

                {item.category === 'allergy' && item.allergy && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-critical-text)', marginTop: '0.2rem' }}>
                    Allergen: <strong>{item.allergy.allergen}</strong> • Reaction: {item.allergy.reaction}
                  </div>
                )}

                {/* Source attribution */}
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-faint)', marginTop: '0.35rem' }}>
                  Extracted from: {item.source.documentName}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                {!item.verified && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => verifyEntry(item.id)}
                    title="Confirm this record as clinically correct"
                  >
                    <Check size={14} /> Confirm
                  </button>
                )}

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditingItem({ ...item })}
                  title="Edit values, dosage, or date"
                >
                  <Edit3 size={14} /> Edit
                </button>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => removeEntry(item.id)}
                  title="Remove incorrect or duplicate entry"
                >
                  <Trash2 size={14} color="var(--color-critical)" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Entry Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Medical Entry</h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Title / Clinical Name
                </label>
                <input 
                  type="text" 
                  className="card"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Date of Event
                </label>
                <input 
                  type="date" 
                  className="card"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                  value={editingItem.date}
                  onChange={e => setEditingItem({ ...editingItem, date: e.target.value, isDateEstimated: false })}
                  required
                />
              </div>

              {/* Specific fields depending on category */}
              {editingItem.category === 'medication' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      Dosage (e.g., 10 mg, 500 mg)
                    </label>
                    <input 
                      type="text" 
                      className="card"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                      value={editingItem.medication?.dosage || ''}
                      onChange={e => setEditingItem({ 
                        ...editingItem, 
                        medication: { ...editingItem.medication!, dosage: e.target.value } 
                      })}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      Frequency / Instructions
                    </label>
                    <input 
                      type="text" 
                      className="card"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                      value={editingItem.medication?.frequency || ''}
                      onChange={e => setEditingItem({ 
                        ...editingItem, 
                        medication: { ...editingItem.medication!, frequency: e.target.value } 
                      })}
                    />
                  </div>
                </>
              )}

              {editingItem.category === 'lab' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      Observed Value
                    </label>
                    <input 
                      type="text" 
                      className="card"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                      value={editingItem.labResult?.value || ''}
                      onChange={e => setEditingItem({ 
                        ...editingItem, 
                        labResult: { ...editingItem.labResult!, value: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      Reference Range
                    </label>
                    <input 
                      type="text" 
                      className="card"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                      value={editingItem.labResult?.referenceRange || ''}
                      onChange={e => setEditingItem({ 
                        ...editingItem, 
                        labResult: { ...editingItem.labResult!, referenceRange: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Verify Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Attestation Dialog Modal */}
      {showAttestationModal && (
        <div className="modal-overlay" onClick={() => setShowAttestationModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={24} color="var(--color-primary)" />
                <h3>Patient Accuracy Attestation</h3>
              </div>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setShowAttestationModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Healthcare regulations require that patients inspect and confirm the accuracy of AI-extracted summaries before generating a doctor-accessible QR code.
            </p>

            <div className="card" style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                Verification Summary:
              </div>
              <ul style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                <li>{entries.length} clinical records to be approved.</li>
                <li>Allergies: {entries.filter(e => e.category === 'allergy').length} documented.</li>
                <li>Active Medications: {entries.filter(e => e.category === 'medication').length} checked.</li>
              </ul>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                checked={patientAgreed}
                onChange={e => setPatientAgreed(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                I confirm that I have reviewed these extracted health records for clinical accuracy. I certify this report for physician consultation.
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowAttestationModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                disabled={!patientAgreed}
                onClick={handleAttestationConfirm}
              >
                Certify & Generate QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
