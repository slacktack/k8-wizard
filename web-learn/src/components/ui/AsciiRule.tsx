import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function AsciiRule() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      style={{
        height: 6,
        margin: '40px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            90deg,
            var(--blueprint) 0px,
            var(--blueprint) 4px,
            transparent 4px,
            transparent 8px
          )`,
          clipPath: isVisible ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: 'clip-path 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 3,
          inset: 0,
          background: `repeating-linear-gradient(
            90deg,
            var(--blueprint-tint-strong) 0px,
            var(--blueprint-tint-strong) 8px,
            transparent 8px,
            transparent 14px
          )`,
          clipPath: isVisible ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: 'clip-path 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
        }}
      />
    </div>
  );
}
