import { useState, useEffect } from 'react';

interface Toast {
  lessonTitle: string;
  lessonLink: string;
  id: number;
}

let toastCounter = 0;
let showToastFn: ((t: Omit<Toast, 'id'>) => void) | null = null;

export function showProgressToast(title: string, link: string) {
  showToastFn?.({ lessonTitle: title, lessonLink: link });
}

export default function ProgressToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    showToastFn = (t) => {
      const id = ++toastCounter;
      setToasts(prev => [...prev, { ...t, id }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== id));
      }, 4000);
    };
    return () => { showToastFn = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}

function ToastItem({ lessonTitle, lessonLink }: { lessonTitle: string; lessonLink: string }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--terminal-green)',
        padding: '12px 16px',
        maxWidth: 380,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.78rem',
        color: 'var(--terminal-green)',
        boxShadow: 'var(--shadow-elevated)',
        pointerEvents: 'auto',
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
