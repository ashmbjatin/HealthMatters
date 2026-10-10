import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Pill, 
  AlertOctagon, 
  Activity, 
  Heart, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Calendar, 
  ExternalLink,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { MedicalCategory, MedicalEntry } from '../types/medical';
import { animate, stagger } from 'animejs';

export const TimelineView: React.FC = () => {
  const { entries, documents, setActiveTab } = useMedical();

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<MedicalCategory | 'all'>('all');
  const [selectedDocSource, setSelectedDocSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const listRef = useRef<HTMLDivElement | null>(null);

  // Trigger Anime.js animation on filter change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches && listRef.current) {
      animate(listRef.current.querySelectorAll('.timeline-node'), {
        translateY: [15, 0],
        opacity: [0, 1],
        delay: stagger(45),
        duration: 380,
      });
    }
  }, [selectedCategory, selectedDocSource, sortOrder]);

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    entries.forEach(e => { allExpanded[e.id] = true; });
    setExpandedEntries(allExpanded);
  };

  const collapseAll = () => {
    setExpandedEntries({});
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Source filter
      if (selectedDocSource !== 'all' && item.source.documentId !== selectedDocSource) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDoc = item.source.documentName.toLowerCase().includes(q);
        const matchesSnippet = item.source.snippet?.toLowerCase().includes(q) || false;
        const matchesReason = item.flagReason?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesDoc && !matchesSnippet && !matchesReason) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [entries, selectedCategory, selectedDocSource, searchQuery, sortOrder]);

  const getCategoryTheme = (category: MedicalCategory) => {
    switch (category) {
      case 'allergy':
        return {
          bg: 'var(--color-critical-light)',
          border: 'var(--color-critical-border)',
          color: 'var(--color-critical)',
          icon: <AlertOctagon size={18} color="var(--color-critical)" />,
          label: 'Allergy / Sensitivity',
        };
      case 'medication':
        return {
          bg: 'var(--color-primary-light)',
          border: 'var(--color-primary-border)',
          color: 'var(--color-primary)',
          icon: <Pill size={18} color="var(--color-primary)" />,
          label: 'Medication',
        };
      case 'lab':
        return {
          bg: 'var(--color-teal-light)',
          border: 'var(--color-teal-border)',
          color: 'var(--color-teal)',
          icon: <Activity size={18} color="var(--color-teal)" />,
          label: 'Laboratory Test',
        };
      case 'diagnosis':
        return {
          bg: 'var(--color-surface-subtle)',
          border: 'var(--color-border)',
          color: 'var(--color-text-main)',
          icon: <FileCheck size={18} color="var(--color-primary)" />,
          label: 'Diagnosis',
        };
      case 'imaging':
        return {
          bg: 'var(--color-teal-light)',
          border: 'var(--color-teal-border)',
          color: 'var(--color-teal)',
          icon: <FileText size={18} color="var(--color-teal)" />,
          label: 'Imaging Scan',
        };
      case 'discharge':
        return {
          bg: 'var(--color-warning-light)',
          border: 'var(--color-warning-border)',
          color: 'var(--color-warning-text)',
          icon: <Heart size={18} color="var(--color-warning)" />,
          label: 'Hospital Discharge',
        };
      default:
        return {
          bg: 'var(--color-surface-subtle)',
          border: 'var(--color-border)',
          color: 'var(--color-text-main)',
          icon: <Clock size={18} color="var(--color-text-muted)" />,
          label: 'Clinical Event',
        };
    }
  };

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Clock size={36} />
        </div>
        <h2 className="empty-state-title">No Medical Timeline Generated Yet</h2>
        <p className="empty-state-desc">
          Upload medical records or prescriptions to let Gemini AI extract your chronological health timeline.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('upload')}>
          Upload Medical Records
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Title & Quick Controls */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h2>Structured Medical Timeline</h2>
          <span className="section-subtitle">
            Chronological consolidation of {entries.length} extracted clinical events with source references
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={expandAll}>
            Expand All
          </button>
          <button className="btn btn-secondary btn-sm" onClick={collapseAll}>
            Collapse All
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
          >
            Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-text-faint)' }} />
            <input 
              type="text" 
              placeholder="Search medications, tests, diagnoses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="card"
              style={{ 
                width: '100%', 
                padding: '0.55rem 0.75rem 0.55rem 2.25rem', 
                fontSize: '0.88rem', 
                borderRadius: 'var(--radius-md)' 
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="var(--color-text-muted)" />
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="card"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.86rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
            >
              <option value="all">All Categories ({entries.length})</option>
              <option value="allergy">Allergies & Sensitivities</option>
              <option value="medication">Medications</option>
              <option value="diagnosis">Diagnoses</option>
              <option value="lab">Lab Results</option>
              <option value="imaging">Imaging & Radiology</option>
              <option value="discharge">Discharge Summaries</option>
            </select>
          </div>

          {/* Source Document Dropdown */}
          {documents.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={15} color="var(--color-text-muted)" />
              <select 
                value={selectedDocSource}
                onChange={e => setSelectedDocSource(e.target.value)}
                className="card"
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.86rem', fontWeight: 700, borderRadius: 'var(--radius-md)', maxWidth: '200px' }}
              >
                <option value="all">All Source Records</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Quick Category Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
          {(['all', 'allergy', 'medication', 'diagnosis', 'lab', 'imaging', 'discharge'] as const).map(cat => {
            const count = cat === 'all' ? entries.length : entries.filter(e => e.category === cat).length;
            if (count === 0 && cat !== 'all') return null;
            return (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: selectedCategory === cat ? 'var(--color-primary-light)' : '#ffffff',
                  color: selectedCategory === cat ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span style={{ opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Timeline Container */}
      <div ref={listRef} style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Continuous Solid Vertical Spine */}
        <div style={{
          position: 'absolute',
          left: '18px',
          top: '10px',
          bottom: '20px',
          width: '3px',
          backgroundColor: 'var(--color-border)',
          borderRadius: '2px',
        }} />

        {filteredEntries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No medical events match your current filter or search criteria.</p>
          </div>
        ) : (
          filteredEntries.map((item) => {
            const theme = getCategoryTheme(item.category);
            const isExpanded = Boolean(expandedEntries[item.id]);

            return (
              <div 
                key={item.id} 
                className="timeline-node" 
                style={{ position: 'relative', marginBottom: '1.25rem', paddingLeft: '2rem' }}
              >
                {/* Node Bullet Anchor on the line */}
                <div style={{
                  position: 'absolute',
                  left: '6px',
                  top: '16px',
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ffffff',
                  border: `3px solid ${theme.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: theme.color }} />
                </div>

                {/* Entry Card */}
                <div 
                  className="card card-hover" 
                  style={{ 
                    padding: '1.25rem',
                    borderLeft: `4px solid ${theme.color}`,
                    borderColor: item.flagged ? 'var(--color-warning-border)' : undefined,
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ backgroundColor: theme.bg, color: theme.color, borderColor: theme.border }}>
                        {theme.icon} {theme.label}
                      </span>

                      {/* Date Badge */}
                      <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} />
                        {item.date}
                        {item.isDateEstimated && (
                          <span style={{ color: 'var(--color-warning-text)', fontWeight: 800 }}>
                            (Estimated)
                          </span>
                        )}
                      </span>

                      {/* Verification status pill */}
                      {item.verified ? (
                        <span className="badge badge-green" title={`Verified by patient at ${item.verifiedAt || 'recent'}`}>
                          <CheckCircle2 size={13} /> Patient Verified
                        </span>
                      ) : (
                        <span className="badge badge-amber" title="Requires patient confirmation">
                          <AlertTriangle size={13} /> Unverified
                        </span>
                      )}
                    </div>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleExpand(item.id)}
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Less' : 'Details'}
                    </button>
                  </div>

                  {/* Title & Primary Clinical Value */}
                  <div style={{ marginTop: '0.65rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-main)' }}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Flag Alert if present */}
                  {item.flagged && (
                    <div style={{ 
                      marginTop: '0.65rem', 
                      backgroundColor: 'var(--color-warning-light)', 
                      border: '1px solid var(--color-warning-border)', 
                      color: 'var(--color-warning-text)', 
                      padding: '0.5rem 0.75rem', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                      <span>{item.flagReason}</span>
                    </div>
                  )}

                  {/* Category Specific Highlights */}
                  {/* LAB RESULT */}
                  {item.category === 'lab' && item.labResult && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      flexWrap: 'wrap',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: item.labResult.isAbnormal ? 'var(--color-critical)' : 'var(--color-success)' }}>
                          {item.labResult.value}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                          {item.labResult.unit}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Normal Reference: <strong>{item.labResult.referenceRange}</strong>
                      </div>

                      <span className={`badge ${item.labResult.isAbnormal ? 'badge-critical' : 'badge-green'}`}>
                        {item.labResult.interpretation}
                      </span>
                    </div>
                  )}

                  {/* MEDICATION */}
                  {item.category === 'medication' && item.medication && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
                      <div className="card" style={{ padding: '0.4rem 0.75rem', backgroundColor: 'var(--color-surface-subtle)' }}>
                        <strong>Dosage:</strong> {item.medication.dosage}
                      </div>
                      <div className="card" style={{ padding: '0.4rem 0.75rem', backgroundColor: 'var(--color-surface-subtle)' }}>
                        <strong>Frequency:</strong> {item.medication.frequency}
                      </div>
                      {item.medication.prescribedBy && (
                        <div className="card" style={{ padding: '0.4rem 0.75rem', backgroundColor: 'var(--color-surface-subtle)' }}>
                          <strong>Prescriber:</strong> {item.medication.prescribedBy}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ALLERGY */}
                  {item.category === 'allergy' && item.allergy && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.86rem' }}>
                      <strong>Documented Reaction:</strong> {item.allergy.reaction}
                    </div>
                  )}

                  {/* DIAGNOSIS */}
                  {item.category === 'diagnosis' && item.diagnosis && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Status: <strong style={{ color: 'var(--color-text-main)' }}>{item.diagnosis.status}</strong>
                      {item.diagnosis.notes && ` • ${item.diagnosis.notes}`}
                    </div>
                  )}

                  {/* DISCHARGE */}
                  {item.category === 'discharge' && item.discharge && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <p style={{ color: 'var(--color-text-main)' }}>{item.discharge.summary}</p>
                    </div>
                  )}

                  {/* IMAGING */}
                  {item.category === 'imaging' && item.imaging && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <strong>Impression:</strong> {item.imaging.impression}
                    </div>
                  )}

                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <div style={{ 
                      marginTop: '1rem', 
                      paddingTop: '0.85rem', 
                      borderTop: '1px solid var(--color-border)', 
                      fontSize: '0.84rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {item.source.snippet && (
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
                            Extracted Text Snippet:
                          </strong>
                          <div style={{ 
                            padding: '0.5rem 0.75rem', 
                            backgroundColor: 'var(--color-surface-subtle)', 
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-main)'
                          }}>
                            "{item.source.snippet}"
                          </div>
                        </div>
                      )}

                      {/* Source Document Reference */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        <FileText size={14} color="var(--color-teal)" />
                        <span>Source: <strong>{item.source.documentName}</strong></span>
                        {item.source.page && <span>(Page {item.source.page})</span>}
                        <span>• AI Confidence: {Math.round(item.source.confidenceScore * 100)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Compact Source Footnote (Always Visible) */}
                  {!isExpanded && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
                      <FileText size={13} />
                      <span>From: {item.source.documentName}</span>
                      {item.source.page && <span>(p. {item.source.page})</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
