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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        padding: '4px 10px',
        background: 'rgba(13, 17, 23, 0.8)',
        border: '1px solid var(--terminal-border)',
        color: copied ? 'var(--terminal-cyan)' : 'var(--terminal-mute)',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
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
      {copied ? 'Copied' : label}
    </button>
  );
}
