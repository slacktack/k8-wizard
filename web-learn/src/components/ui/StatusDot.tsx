interface StatusDotProps {
  status: 'complete' | 'in-progress' | 'planned';
  size?: number;
}

export default function StatusDot({ status, size = 12 }: StatusDotProps) {
  const styles: Record<string, React.CSSProperties> = {
    complete: {
      background: 'var(--blueprint)',
      border: '1px solid var(--blueprint)',
    },
    'in-progress': {
      background: 'linear-gradient(135deg, var(--blueprint) 50%, transparent 50%)',
      border: '1px solid var(--blueprint)',
    },
    planned: {
      background: 'transparent',
      border: '1px dashed var(--ink-mute)',
    },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        ...styles[status],
      }}
      aria-label={`Status: ${status}`}
    />
  );
}
