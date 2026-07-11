interface ProgressBarProps {
  pct: number;
  height?: number;
  animated?: boolean;
}

export default function ProgressBar({ pct, height = 4, animated = true }: ProgressBarProps) {
  return (
    <div
      style={{
        height,
        background: 'var(--rule-soft)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: 'var(--blueprint)',
          transition: animated ? 'width 0.4s ease' : 'none',
        }}
      />
    </div>
  );
}
