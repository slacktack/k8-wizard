import { useParams, Link } from 'react-router-dom';
import { CASE_STUDIES } from '../../data/case-studies';
import ArchitectureDiagram from '../diagram/ArchitectureDiagram';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Button from '../ui/Button';

const diffColors: Record<string, string> = {
  intermediate: 'var(--blueprint)',
  advanced: 'var(--terminal-yellow)',
  expert: 'var(--terminal-red)',
};

export default function CaseStudyDetailPage() {
  const { caseStudyId } = useParams<{ caseStudyId: string }>();
  const cs = CASE_STUDIES.find(c => c.id === caseStudyId);

  if (!cs) {
    return (
      <>
        <Header />
        <main id="main" style={{ paddingTop: 64 }}>
          <div style={{ padding: '120px 32px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: '3rem', marginBottom: 16, color: 'var(--blueprint)' }}>
              Case Study Not Found
            </h1>
            <Link to="/case-studies"><Button variant="primary">Back to Case Studies</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main" style={{ paddingTop: 64 }}>
        <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 900 }}>
          {/* Breadcrumb */}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>
            <Link to="/case-studies" style={{ color: 'var(--blueprint)', textDecoration: 'none' }}>← Case Studies</Link>
            <span style={{ color: 'var(--ink-mute)', margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--ink)' }}>{cs.title}</span>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 8 }}>
            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--ink)', lineHeight: 1.1 }}>
              {cs.title}
            </h1>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: diffColors[cs.difficulty], border: `1px solid ${diffColors[cs.difficulty]}`, padding: '2px 6px' }}>
                {cs.difficulty}
              </span>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--ink-mute)', marginTop: 4 }}>{cs.estimatedTime}</div>
            </div>
          </div>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '1rem', color: 'var(--ink-soft)', marginBottom: 4 }}>{cs.subtitle}</p>

          {/* Problem */}
          <div style={{ marginTop: 28, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 10 }}>Problem Statement</h2>
            <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--ink)' }}>{cs.problem}</p>
          </div>

          {/* Requirements */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 10 }}>Requirements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cs.requirements.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', padding: '6px 12px', borderLeft: '2px solid var(--blueprint-tint-strong)' }}>
                  <span style={{ color: 'var(--blueprint)', flexShrink: 0 }}>#{i + 1}</span>
                  <span style={{ color: 'var(--ink)' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Diagram */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 10 }}>Architecture</h2>
            <ArchitectureDiagram architecture={cs.architecture} />
          </div>

          {/* Deep Dive */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 14 }}>Deep Dive</h2>
            {cs.deepDive.map(d => (
              <div key={d.title} style={{ marginBottom: 20, padding: '16px 20px', border: '1px solid var(--rule-soft)', borderLeft: '3px solid var(--blueprint)' }}>
                <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 600, marginBottom: 8 }}>{d.title}</h3>
                <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--ink-soft)' }}>{d.body}</p>
              </div>
            ))}
          </div>

          {/* Trade-offs */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 14 }}>Design Trade-offs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cs.tradeOffs.map(t => (
                <div key={t.approach} style={{ border: '1px solid var(--rule)', padding: '14px 18px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{t.approach}</div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--terminal-green)', marginBottom: 4 }}>Pros</div>
                      {t.pros.map(p => <div key={p} style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.5, paddingLeft: 12 }}>✓ {p}</div>)}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--terminal-red)', marginBottom: 4 }}>Cons</div>
                      {t.cons.map(c => <div key={c} style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.5, paddingLeft: 12 }}>✗ {c}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* K8s Mapping */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 10 }}>Kubernetes Deployment</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cs.k8sMapping.map((m, i) => (
                <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', padding: '6px 12px', borderLeft: '2px solid var(--terminal-green)', color: 'var(--ink)' }}>{m}</div>
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          <div style={{ marginBottom: 32, padding: '20px 24px', border: '2px solid var(--terminal-green)', background: 'rgba(57, 185, 80, 0.04)' }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--terminal-green)', marginBottom: 10 }}>Key Takeaways</h2>
            {cs.keyTakeaways.map((t, i) => (
              <div key={i} style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--ink)', marginBottom: 6, paddingLeft: 16 }}>→ {t}</div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 32, borderTop: '1px solid var(--rule)', paddingTop: 24 }}>
            <Link to="/case-studies"><Button variant="default">← All Case Studies</Button></Link>
            <Link to="/whiteboard"><Button variant="primary">Try in Whiteboard →</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
