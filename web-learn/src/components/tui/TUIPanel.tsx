import type { ReactNode } from 'react';

interface TUIPanelProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function TUIPanel({ title, subtitle, children, className = '' }: TUIPanelProps) {
  return (
    <div
      className={`tui-panel ${className}`}
      style={{
        background: 'var(--tui-bg)',
        border: '1px solid var(--tui-border)',
        padding: '12px 16px',
        fontFamily: "'VT323', 'Courier New', monospace",
        fontSize: '0.9rem',
        color: 'var(--tui-text)',
        boxShadow: 'var(--shadow-tui)',
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--tui-text)',
            marginBottom: subtitle ? 4 : 12,
            textAlign: 'center',
          }}
        >
          ─── {title} ───
        </div>
      )}
      {subtitle && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            fontStyle: 'italic',
            color: 'var(--tui-gold)',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}

interface LabelValueProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function TUILabelValue({ label, value, valueColor }: LabelValueProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 8,
        marginBottom: 4,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.82rem',
      }}
    >
      <span style={{ color: 'var(--tui-cyan)', textAlign: 'right' }}>{label}:</span>
      <span style={{ color: valueColor || 'var(--tui-text)' }}>{value}</span>
    </div>
  );
}
