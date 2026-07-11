interface BadgeProps {
  variant: 'learn' | 'build' | 'capstone' | 'blueprint' | 'muted';
  children: string;
}

export default function Badge({ variant, children }: BadgeProps) {
  const colors: Record<string, string> = {
    learn: 'border-[var(--ink)] text-[var(--ink)]',
    build: 'border-[var(--blueprint)] text-[var(--blueprint)]',
    capstone: 'border-[var(--warn)] text-[var(--warn)]',
    blueprint: 'border-[var(--blueprint)] text-[var(--blueprint)] bg-[var(--blueprint-tint)]',
    muted: 'border-[var(--ink-mute)] text-[var(--ink-mute)]',
  };

  return (
    <span className={`font-mono text-[0.62rem] uppercase tracking-wider border px-[6px] py-[2px] ${colors[variant] || colors.muted}`}>
      {children}
    </span>
  );
}
