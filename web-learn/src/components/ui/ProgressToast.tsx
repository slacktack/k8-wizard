import { useState, useEffect } from 'react';

interface ProgressToastProps {
  lessonTitle: string;
  lessonLink: string;
  duration?: number;
}

export default function ProgressToast({ lessonTitle, lessonLink, duration = 4000 }: ProgressToastProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration);
    const removeTimer = setTimeout(() => setVisible(false), duration + 200);
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 500,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--terminal-green)',
        padding: '12px 16px',
        maxWidth: 380,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.78rem',
        color: 'var(--terminal-green)',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span>✓</span>
        <div>
          <div style={{ color: 'var(--ink)', marginBottom: 4 }}>{lessonTitle}</div>
          <a
            href={lessonLink}
            style={{ color: 'var(--blueprint)', textDecoration: 'underline', fontSize: '0.72rem' }}
          >
            Next lesson →
          </a>
        </div>
      </div>
    </div>
  );
}
