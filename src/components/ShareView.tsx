import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  Clock, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Stethoscope,
  Lock,
  Calendar,
  Share2
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { animate } from 'animejs';

export const ShareView: React.FC = () => {
  const { 
    shareSession, 
    generateShareSession, 
    revokeShareSession, 
    stats, 
    setActiveTab, 
    patient 
  } = useMedical();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(24); // 24 hours
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  // Compute share link URL
  const shareUrl = shareSession 
    ? `${window.location.origin}${window.location.pathname}?view=doctor&token=${shareSession.token}&pid=${patient.id}`
    : '';

  // Generate QR code data URL whenever shareSession changes
  useEffect(() => {
    if (shareSession && shareSession.status === 'active') {
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
      .then(url => {
        setQrDataUrl(url);
        // Anime.js pop-in
        if (qrContainerRef.current) {
          animate(qrContainerRef.current, {
            scale: [0.94, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack',
          });
        }
      })
      .catch(err => console.error('Error generating QR code:', err));
    }
  }, [shareSession, shareUrl]);

  const handleCreateSession = async () => {
    setIsGenerating(true);
    await generateShareSession(selectedDuration);
    setIsGenerating(false);
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `HealthMatters_Doctor_QR_${patient.fullName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isExpired = shareSession ? new Date(shareSession.expiresAt).getTime() < Date.now() : false;
  const isActive = shareSession && shareSession.status === 'active' && !isExpired;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <h2>Secure Doctor QR Sharing</h2>
          <span className="section-subtitle">
            Generate a time-limited, revocable digital access link for your physician or emergency team
          </span>
        </div>

        <button 
          className="btn btn-teal btn-sm"
          onClick={() => setActiveTab('doctor')}
        >
          <Stethoscope size={15} /> Preview Doctor View
        </button>
      </div>

      {/* Verification Warning if Report Not Fully Verified */}
      {stats.state !== 'verified' && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1.5rem', 
            backgroundColor: 'var(--color-warning-light)', 
            borderColor: 'var(--color-warning-border)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ color: 'var(--color-warning-text)' }}>
                Medical History Incomplete: {stats.pending} Item(s) Unverified
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-warning-text)' }}>
                You have unverified records. The doctor will see an "Unverified Entries" warning badge next to pending items.
              </p>
            </div>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('review')}>
            Verify Before Sharing
          </button>
        </div>
      )}

      {/* Main Grid: QR Display & Configuration */}
      <div className="grid-2">
        {/* Left Card: QR Code & Status */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            {isActive ? (
              <span className="badge badge-green" style={{ fontSize: '0.86rem', padding: '0.35rem 0.9rem' }}>
                <Check size={14} /> Sharing Link Active & Live
              </span>
            ) : shareSession?.status === 'revoked' ? (
              <span className="badge badge-critical" style={{ fontSize: '0.86rem', padding: '0.35rem 0.9rem' }}>
                Access Revoked
              </span>
            ) : (
              <span className="badge badge-amber" style={{ fontSize: '0.86rem', padding: '0.35rem 0.9rem' }}>
                Sharing Expired / Inactive
              </span>
            )}
          </div>

          {/* QR Container */}
          <div 
            ref={qrContainerRef}
            style={{ 
              display: 'inline-block', 
              padding: '1.25rem', 
              backgroundColor: '#ffffff', 
              borderRadius: 'var(--radius-xl)', 
              border: '2px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '1.25rem'
            }}
          >
            {isActive && qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Doctor Access QR Code" 
                style={{ width: '220px', height: '220px', display: 'block' }} 
              />
            ) : (
              <div style={{ width: '220px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <QrCode size={48} color="var(--color-text-faint)" />
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                  QR code inactive
                </p>
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>
            Doctor Scan QR Code
          </h3>
          <p style={{ fontSize: '0.84rem', maxWidth: '320px', margin: '0 auto 1.25rem auto' }}>
            Point your doctor's iPad, smartphone, or clinic scanner directly at this code.
          </p>

          {/* Action buttons under QR */}
          {isActive ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
                {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadQr}>
                <Download size={14} /> Download PNG
              </button>
              <button className="btn btn-teal btn-sm" onClick={() => setActiveTab('doctor')}>
                <ExternalLink size={14} /> Open Doctor View
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleCreateSession} disabled={isGenerating}>
              <RefreshCw size={15} /> Generate Active QR Pass
            </button>
          )}
        </div>

        {/* Right Card: Expiry, Token & Revocation Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Expiration Settings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.1rem' }}>Access Duration & Expiration</h3>
            </div>

            <p style={{ fontSize: '0.86rem', marginBottom: '1rem' }}>
              Choose how long this secure QR link will remain accessible to doctors:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {[
                { hours: 1, label: '1 Hour', sub: 'Single consultation' },
                { hours: 24, label: '24 Hours', sub: 'Hospital admission / Day visit' },
                { hours: 168, label: '7 Days', sub: 'Post-op recovery period' },
                { hours: 720, label: '30 Days', sub: 'Ongoing specialist review' },
              ].map(opt => (
                <button 
                  key={opt.hours}
                  type="button"
                  onClick={() => setSelectedDuration(opt.hours)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid',
                    borderColor: selectedDuration === opt.hours ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: selectedDuration === opt.hours ? 'var(--color-primary-light)' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: selectedDuration === opt.hours ? 'var(--color-primary-text)' : 'var(--color-text-main)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {isActive && shareSession ? (
                  <>Expires: <strong>{new Date(shareSession.expiresAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</strong></>
                ) : (
                  <>Ready to activate with {selectedDuration >= 24 ? `${selectedDuration / 24} day(s)` : `${selectedDuration} hr`}</>
                )}
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleCreateSession} disabled={isGenerating}>
                {isActive ? 'Renew Access Token' : 'Create Access Token'}
              </button>
            </div>
          </div>

          {/* Revoke Access Button */}
          <div className="card" style={{ borderColor: 'var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Lock size={18} color="var(--color-critical)" />
              <h4 style={{ fontSize: '0.98rem' }}>Immediate Access Revocation</h4>
            </div>
            <p style={{ fontSize: '0.84rem', marginBottom: '1rem' }}>
              Need to revoke doctor access immediately? Terminate this link right now.
            </p>

            <button 
              className="btn btn-danger btn-sm"
              onClick={revokeShareSession}
              disabled={!isActive}
            >
              Revoke Doctor Access Immediately
            </button>
          </div>

          {/* Privacy Disclaimer Card */}
          <div className="card" style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <ShieldAlert size={16} color="var(--color-teal)" />
              <strong style={{ fontSize: '0.84rem' }}>Cryptographic Link Security</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              The QR code transmits a unique random token (e.g. <code>{shareSession?.token || 'hm_token_...'}</code>) rather than embedding raw unencrypted medical text in the image. Scanners query the access control endpoint which validates expiration and revocations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
