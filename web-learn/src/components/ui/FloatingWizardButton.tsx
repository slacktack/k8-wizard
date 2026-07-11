import { useState, useEffect } from 'react';

export default function FloatingWizardButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="#curriculum"
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--blueprint)',
        boxShadow: 'var(--shadow-glow)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.78rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--blueprint)',
        textDecoration: 'none',
        writingMode: 'vertical-lr',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(var(--blueprint-rgb), 0.5)'; e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(90deg)' }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      Launch K8 Wizard
    </a>
  );
}
