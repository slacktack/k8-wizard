import { Link } from 'react-router-dom';
import { CASE_STUDIES } from '../../data/case-studies';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const diffColors: Record<string, string> = {
  intermediate: 'var(--blueprint)',
  advanced: 'var(--terminal-yellow)',
  expert: 'var(--terminal-red)',
};

export default function CaseStudiesHubPage() {
  return (
    <>
      <Header />
      <main id="main" style={{ paddingTop: 64 }}>
        <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link to="/" style={{ color: 'var(--blueprint)', textDecoration: 'none' }}>← Home</Link>
            <span style={{ color: 'var(--ink-mute)' }}>/</span>
            <span style={{ color: 'var(--ink-mute)' }}>Case Studies</span>
          </div>

          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--ink)', marginBottom: 8, lineHeight: 1.05 }}>
            System Design Case Studies
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 32 }}>
            From SDE-1 to SDE-2 — real architectures, trade-offs, and Kubernetes deployment patterns
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CASE_STUDIES.map(cs => (
              <Link
                key={cs.id}
                to={`/case-studies/${cs.id}`}
                style={{
                  display: 'block',
                  border: '1px solid var(--rule)',
                  background: 'var(--bg-elevated)',
                  padding: '24px 28px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
                  <div>
                    <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.4rem', color: 'var(--ink)', marginBottom: 4 }}>{cs.title}</h2>
                    <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{cs.subtitle}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: diffColors[cs.difficulty],
                      border: `1px solid ${diffColors[cs.difficulty]}`,
                      padding: '2px 6px',
                    }}>{cs.difficulty}</span>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--ink-mute)', marginTop: 6 }}>{cs.estimatedTime}</div>
                  </div>
                </div>
                <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                  {cs.problem.slice(0, 200)}...
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cs.requirements.slice(0, 3).map(r => (
                    <span key={r} style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem',
                      padding: '2px 8px',
                      border: '1px solid var(--rule-soft)',
                      color: 'var(--ink-mute)',
                    }}>{r}</span>
                  ))}
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    padding: '2px 8px',
                    color: 'var(--blueprint)',
                  }}>+{cs.requirements.length - 3} more</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
