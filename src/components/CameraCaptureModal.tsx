import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DocumentType } from '../types/medical';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, type: DocumentType) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocumentType>('prescription');

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API not supported in this browser environment.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Unable to access device camera:', err);
      setCameraError(err.message || 'Camera permission denied or camera hardware not detected.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const flipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const captureSimulatedPrescription = () => {
    // Generates a clean synthetic camera capture image when hardware camera is not available
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Solid medical pad background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 800, 600);

      // Prescription header
      ctx.fillStyle = '#059669';
      ctx.fillRect(0, 0, 800, 90);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Nunito, sans-serif';
      ctx.fillText('ST. JUDE HEALTH CLINIC - RX PRESCRIPTION', 40, 55);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px Nunito, sans-serif';
      ctx.fillText('PATIENT: Sarah Jenkins (DOB: 1982-06-14)', 40, 150);
      ctx.fillText('DATE: ' + new Date().toLocaleDateString(), 40, 190);

      ctx.fillStyle = '#475569';
      ctx.font = '18px Nunito, sans-serif';
      ctx.fillText('Rx 1: Metformin HCl 500mg - 1 tab PO BID with meals', 60, 260);
      ctx.fillText('Rx 2: Lisinopril 10mg - 1 tab PO Daily in AM', 60, 310);
      ctx.fillText('Rx 3: Albuterol Sulfate Inhaler 90mcg - 2 puffs PRN', 60, 360);

      // Doctor signature line
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(450, 480);
      ctx.lineTo(720, 480);
      ctx.stroke();

      ctx.fillStyle = '#0284c7';
      ctx.font = 'italic 20px cursive';
      ctx.fillText('Dr. Rebecca Miller, MD #90122', 460, 465);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    // Convert dataUrl to File
    const arr = capturedImage.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const filename = `Camera_Scan_${Date.now()}.jpg`;
    const file = new File([u8arr], filename, { type: mime });

    onCapture(file, docType);
    handleClose();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              backgroundColor: 'var(--color-primary-light)', 
              color: 'var(--color-primary)', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Camera size={18} />
            </div>
            <div>
              <h3>Capture Medical Document</h3>
              <p style={{ fontSize: '0.8rem' }}>Take a clear snapshot of prescription, lab sheet, or scan</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon-only" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Document type selector */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Record Type:</span>
          <select 
            value={docType}
            onChange={e => setDocType(e.target.value as DocumentType)}
            className="card"
            style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', fontWeight: 700 }}
          >
            <option value="prescription">Prescription / Medication Sheet</option>
            <option value="lab_report">Lab Blood Work / Diagnostic Test</option>
            <option value="discharge_summary">Discharge Summary / Clinical Note</option>
            <option value="scan_report">Radiology / Ultrasound Scan</option>
          </select>
        </div>

        {/* Viewfinder or Preview */}
        <div style={{ 
          position: 'relative', 
          backgroundColor: '#0f172a', 
          borderRadius: 'var(--radius-lg)', 
          overflow: 'hidden',
          minHeight: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--color-border)'
        }}>
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured Medical Document" 
              style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'contain' }} 
            />
          ) : cameraError ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ffffff' }}>
              <AlertTriangle size={42} color="var(--color-warning)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Camera Stream Inactive</h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem', maxWidth: '380px' }}>
                {cameraError}
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={captureSimulatedPrescription}
              >
                Capture Simulated Rx Sample
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              {/* Document Alignment Overlay Box */}
              <div style={{
                position: 'absolute',
                border: '2px dashed #10b981',
                borderRadius: '12px',
                width: '82%',
                height: '75%',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '10px',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                textShadow: '0 1px 3px rgba(0,0,0,0.8)'
              }}>
                Align document inside frame
              </div>
            </>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Bottom Actions */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {capturedImage ? (
            <>
              <button className="btn btn-secondary" onClick={handleRetake}>
                <RefreshCw size={15} /> Retake
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={handleConfirm}>
                  <Check size={16} /> Use Document
                </button>
              </div>
            </>
          ) : (
            <>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={flipCamera}
                disabled={Boolean(cameraError)}
              >
                <RefreshCw size={14} /> Flip Camera
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!cameraError && (
                  <button className="btn btn-primary btn-lg" onClick={takeSnapshot}>
                    <Camera size={18} /> Snap Photo
                  </button>
                )}
                {cameraError && (
                  <button className="btn btn-primary" onClick={captureSimulatedPrescription}>
                    Capture Sample Rx
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
