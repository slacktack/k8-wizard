import { useState, useEffect } from 'react';

interface OnboardingModalProps {
  onStartCurriculum: () => void;
  onTryPlayground: () => void;
}

export default function OnboardingModal({ onStartCurriculum, onTryPlayground }: OnboardingModalProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // sessionStorage — shows once per browser session, not once ever
    const seen = sessionStorage.getItem('k8wizard-onboarding');
    if (!seen) {
      const scrollHandler = () => {
        if (window.scrollY > 300) {
          setDismissed(false);
          sessionStorage.setItem('k8wizard-onboarding', 'shown');
          window.removeEventListener('scroll', scrollHandler);
        }
      };
      window.addEventListener('scroll', scrollHandler, { once: true });
      return () => window.removeEventListener('scroll', scrollHandler);
    }
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => setDismissed(true);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--overlay-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) handleDismiss(); }}
    >
      <div
        style={{
          maxWidth: 560,
          width: '100%',
          margin: '0 24px',
          background: 'var(--bg-elevated)',
          border: '2px solid var(--rule)',
          boxShadow: 'var(--shadow-panel)',
          padding: 36,
        }}
      >
        <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.6rem', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 24, letterSpacing: '0.04em' }}>
          Welcome to K8 Wizard
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => { handleDismiss(); onStartCurriculum(); }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px', background: 'var(--blueprint)', color: 'var(--bg)', border: 'none', cursor: 'pointer', textAlign: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-bright)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--blueprint)'; }}
          >
            Start Curriculum
          </button>
          <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)', padding: '4px 0' }}>
            Learn Docker → K8s step by step
          </div>

          <button
            onClick={() => { handleDismiss(); onTryPlayground(); }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)', cursor: 'pointer', textAlign: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.color = 'var(--blueprint)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink)'; }}
          >
            Try Playground
          </button>

          <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)' }}>
            ── or practice for real ──
          </div>

          <a href="https://killercoda.com/playgrounds/scenario/kubernetes" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px', background: 'transparent', color: 'var(--terminal-green)', border: '1px solid var(--terminal-green)', cursor: 'pointer', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
            Open Killercoda ↗
          </a>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <button
            onClick={handleDismiss}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--ink-mute)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-mute)'; }}
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}
