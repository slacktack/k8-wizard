interface KeyHint {
  key: string;
  description: string;
}

interface TUIKeyHintsProps {
  hints: KeyHint[];
}

export default function TUIKeyHints({ hints }: TUIKeyHintsProps) {
  return (
    <div
      style={{
        background: 'var(--tui-bg)',
        borderTop: '1px solid var(--tui-border)',
        padding: '8px 16px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      {hints.map((hint, i) => (
        <span key={i}>
          <span style={{ color: 'var(--tui-magenta)' }}>[{hint.key}→{hint.description}]</span>
        </span>
      ))}
    </div>
  );
}
