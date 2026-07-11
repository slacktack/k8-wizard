import { useEffect, useState } from 'react';
import Button from '../ui/Button';

export default function Masthead() {
  const [flickerDone, setFlickerDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFlickerDone(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="section-padding"
      style={{ paddingTop: 'calc(64px + 80px)', textAlign: 'center' }}
    >
      <div className="container">
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--blueprint)',
            marginBottom: 24,
          }}
        >
          Interactive Learning Platform v1.0
        </p>

        {/* Title */}
        <h1
          className="manual-title"
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 'clamp(3.2rem, 11vw, 8rem)',
            lineHeight: 0.86,
            textTransform: 'uppercase',
            color: 'var(--ink)',
            marginBottom: 32,
            animation: flickerDone ? 'none' : 'title-flicker 2.4s ease-out 0.1s',
          }}
        >
          K8{' '}
          <span style={{ color: 'var(--blueprint)' }}>Wizard</span>
          <br />
          from Scratch
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(0.85rem, 2vw, 1rem)',
            color: 'var(--ink-soft)',
            maxWidth: 640,
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Docker ↗ Kubernetes ↝ Production
          <br />
          A hands-on curriculum from zero to mad-mad-K8-wizard.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#curriculum">
            <Button variant="primary">Start Curriculum</Button>
          </a>
          <a href="#playground">
            <Button variant="default">Try Playground</Button>
          </a>
          <a href="https://github.com/tushargautam/K8-docker-learn" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              Star on GitHub
            </Button>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes title-flicker {
          0%, 100% { opacity: 1; }
          18%  { opacity: 0.4; }
          20%  { opacity: 1; }
          62%  { opacity: 0.7; }
          64%  { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
