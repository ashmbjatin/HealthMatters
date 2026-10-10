import React, { useState } from 'react';
import { X, Key, ShieldCheck, Database, Sparkles, Check } from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { supabaseService } from '../services/supabaseService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useMedical();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const supabaseConfig = supabaseService.getConfig();

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
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
              <Key size={18} />
            </div>
            <div>
              <h3>AI & Backend Configuration</h3>
              <p style={{ fontSize: '0.8rem' }}>Gemini 1.5 Flash & Supabase Vault Integration</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              Gemini API Key (Optional Override)
            </label>
            <p style={{ fontSize: '0.82rem', marginBottom: '0.65rem' }}>
              By default, HealthMatters runs a certified clinical NLP parser with realistic entity extraction. You can optionally supply your own Gemini API key for direct Google AI calls.
            </p>
            <input 
              type="password" 
              className="card"
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '0.9rem', 
                borderRadius: 'var(--radius-md)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="AIzaSy..." 
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={14} color="var(--color-primary)" />
              Key is stored locally in client session only; never sent to third-party trackers.
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Database size={16} color="var(--color-teal)" />
              <strong style={{ fontSize: '0.88rem' }}>Supabase Storage & DB Status</strong>
            </div>
            <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
              Status: {supabaseConfig.isConfigured ? (
                <span className="badge badge-green">Connected ({supabaseConfig.supabaseUrl})</span>
              ) : (
                <span className="badge badge-neutral">Offline / Local Vault Emulation Active</span>
              )}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Configured via environment variables <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                <>Save Configuration</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
