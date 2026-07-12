import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn-fade ${copied ? 'copy-success' : ''}`}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        padding: '3px 8px',
        background: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid var(--terminal-border)',
        color: copied ? 'var(--terminal-cyan)' : 'var(--terminal-mute)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
      onMouseEnter={e => {
        if (!copied) {
          (e.target as HTMLElement).style.color = 'var(--terminal-cyan)';
          (e.target as HTMLElement).style.borderColor = 'var(--terminal-cyan)';
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          (e.target as HTMLElement).style.color = 'var(--terminal-mute)';
          (e.target as HTMLElement).style.borderColor = 'var(--terminal-border)';
        }
      }}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Done
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
