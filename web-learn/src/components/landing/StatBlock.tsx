import { useEffect, useRef, useState, useMemo } from 'react';
import { PHASES } from '../../data/phases';

export default function StatBlock() {
  const statsConfig = useMemo(() => [
    { label: 'Modules', value: String(PHASES.length) },
    { label: 'Lessons', value: String(PHASES.reduce((sum, p) => sum + p.lessonIds.length, 0)) },
    { label: 'Commands', value: '120+' },
    { label: 'Projects', value: '5' },
  ], []);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section-padding" ref={containerRef}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 32,
          }}
        >
          {statsConfig.map((stat, i) => (
            <div key={stat.label}>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-soft)',
                  marginBottom: 8,
                }}
              >
                {stat.label}
              </p>
              <div
                style={{
                  height: 14,
                  background: 'var(--rule-soft)',
                  marginBottom: 6,
                  position: 'relative',
                }}
              >
                <div
                  ref={el => { barRefs.current[i] = el; }}
                  style={{
                    height: '100%',
                    width: visible ? `${Math.random() * 40 + 60}%` : '0%',
                    background: 'var(--blueprint)',
                    transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: `${i * 0.15}s`,
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
