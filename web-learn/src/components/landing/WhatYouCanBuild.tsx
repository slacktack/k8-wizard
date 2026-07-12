import { useState } from 'react';
import { ARCHITECTURES } from '../../data/architectures';
import ArchitectureDiagram from '../diagram/ArchitectureDiagram';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function WhatYouCanBuild() {
  const { ref, isVisible } = useScrollReveal(0.05);
  const [active, setActive] = useState(0);
  const arch = ARCHITECTURES[active];

  return (
    <section className="section-padding" id="build">
      <div
        className="container"
        ref={ref}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s ease, transform 0.6s var(--ease-smooth)',
        }}
      >
        <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--blueprint)', marginBottom: 8 }}>
          What You Can Build
        </h2>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 28 }}>
          Real architectures · the same primitives, composed
        </p>

        {/* Architecture selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {ARCHITECTURES.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setActive(i)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.74rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '8px 14px',
                cursor: 'pointer',
                border: `1px solid ${i === active ? 'var(--blueprint)' : 'var(--rule)'}`,
                background: i === active ? 'var(--blueprint)' : 'transparent',
                color: i === active ? 'var(--bg)' : 'var(--ink-soft)',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { if (i !== active) { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.color = 'var(--blueprint)'; } }}
              onMouseLeave={e => { if (i !== active) { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink-soft)'; } }}
            >
              {a.name}
            </button>
          ))}
        </div>

        {/* Two-column: blurb + diagram */}
        <div className="build-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 260px) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
          <div>
            <h3 style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', color: 'var(--ink)', marginBottom: 12, textTransform: 'uppercase' }}>
              {arch.name}
            </h3>
            <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.98rem', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              {arch.blurb}
            </p>
          </div>
          <ArchitectureDiagram architecture={arch} />
        </div>
      </div>
    </section>
  );
}
