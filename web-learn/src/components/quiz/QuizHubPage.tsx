import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PHASES } from '../../data/phases';
import { LESSONS } from '../../data/lessons';
import { useQuiz } from '../../context/QuizContext';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

const profColors: Record<string, string> = {
  start: 'var(--terminal-green)',
  intermediate: 'var(--blueprint)',
  advanced: 'var(--terminal-yellow)',
  expert: 'var(--terminal-red)',
};

const profLabels: Record<string, string> = {
  start: 'Start',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

const STANDALONE_QUIZZES = [
  { id: 'standalone-docker', label: 'Docker', topic: 'docker', icon: '🐳', desc: '50 questions · beginner to expert · containers, Dockerfiles, networking, Compose, production', color: 'var(--terminal-cyan)' },
  { id: 'standalone-kubernetes', label: 'Kubernetes', topic: 'kubernetes', icon: '☸', desc: '55 questions · beginner to expert · Pods, networking, security, GitOps, service mesh', color: 'var(--blueprint)' },
] as const;

export default function QuizHubPage() {
  const { results, overallStats, proficiency } = useQuiz();

  // Build lesson list with quiz status
  const lessonsWithQuizzes = useMemo(() => {
    const list: { lessonId: string; title: string; phaseTitle: string; phaseId: string; result: { correct: number; total: number } | null }[] = [];
    for (const phase of PHASES) {
      for (const lessonId of phase.lessonIds) {
        const lesson = LESSONS[lessonId];
        if (!lesson) continue;
        const hasQuiz = lesson.sections.some((s: { type: string }) => s.type === 'quiz');
        if (!hasQuiz) continue;
        const r = results[lessonId];
        list.push({
          lessonId,
          title: lesson.title,
          phaseTitle: phase.title,
          phaseId: phase.id,
          result: r ? { correct: r.correct, total: r.total } : null,
        });
      }
    }
    return list;
  }, [results]);

  const attempted = lessonsWithQuizzes.filter(l => l.result !== null).length;
  const total = lessonsWithQuizzes.length;
  const pct = total > 0 ? Math.round((attempted / total) * 100) : 0;

  return (
    <>
      <Header />
      <main id="main" style={{ paddingTop: 64 }}>
        <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 820 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link to="/" style={{ color: 'var(--blueprint)', textDecoration: 'none' }}>← Home</Link>
          </div>

          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--ink)', marginBottom: 8, lineHeight: 1.05 }}>
            Quiz Hub
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 24 }}>
            Test your knowledge · Track your proficiency
          </p>

          {/* Specialized Quizzes section */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 14 }}>
              Specialized Assessments
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STANDALONE_QUIZZES.map(q => {
                const r = results[q.id];
                const score = r ? { correct: r.correct, total: r.total } : null;
                const scoreColor = score
                  ? (score.correct >= Math.ceil(score.total * 0.9) ? 'var(--terminal-green)'
                    : score.correct >= Math.ceil(score.total * 0.7) ? 'var(--terminal-yellow)'
                    : score.correct >= Math.ceil(score.total * 0.4) ? 'var(--blueprint)'
                    : 'var(--terminal-red)')
                  : 'var(--ink-mute)';
                return (
                  <Link
                    key={q.id}
                    to={`/quiz/${q.topic}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      border: '1px solid var(--rule)',
                      background: 'var(--bg-elevated)',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{q.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{q.label}</div>
                      <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{q.desc}</div>
                    </div>
                    {score ? (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: scoreColor, fontVariantNumeric: 'tabular-nums' }}>
                        {score.correct}/{score.total}
                      </div>
                    ) : (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Start
                      </div>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mute)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Proficiency card */}
          <div className="quiz-proficiency-row" style={{
            border: '2px solid var(--rule)',
            background: 'var(--bg-elevated)',
            padding: '24px 28px',
            marginBottom: 36,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-mute)', marginBottom: 6 }}>
                Overall Proficiency
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: "'VT323', monospace", fontSize: '2.4rem', color: profColors[proficiency], lineHeight: 1 }}>
                  {profLabels[proficiency]}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                  {overallStats.correct}/{overallStats.total} quiz questions correct ({overallStats.percent}%)
                </span>
              </div>
            </div>
            <div className="quiz-proficiency-stats" style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-mute)', marginBottom: 4 }}>
                Quizzes Completed
              </div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: '1.8rem', color: 'var(--ink)' }}>
                {attempted}/{total}
              </div>
              <div className="quiz-proficiency-bar" style={{ height: 4, width: 120, marginLeft: 'auto', background: 'var(--rule-soft)', marginTop: 4 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blueprint)', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* Per-Lesson Quizzes */}
          <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 14 }}>
            Per-Lesson Quizzes
          </h2>

          {lessonsWithQuizzes.length === 0 && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: 'var(--ink-mute)', textAlign: 'center', padding: 48 }}>
              No quizzes available yet. Quizzes are being added to lessons.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lessonsWithQuizzes.map(l => {
              const score = l.result;
              const scoreColor = score
                ? (score.correct >= Math.ceil(score.total * 0.9) ? 'var(--terminal-green)'
                  : score.correct >= Math.ceil(score.total * 0.7) ? 'var(--terminal-yellow)'
                  : score.correct >= Math.ceil(score.total * 0.4) ? 'var(--blueprint)'
                  : 'var(--terminal-red)')
                : 'var(--ink-mute)';

              return (
                <Link
                  key={l.lessonId}
                  to={`/lesson/${l.phaseId}/${l.lessonId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--rule-soft)',
                    textDecoration: 'none',
                    transition: 'background 0.12s',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Score dot */}
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: score ? scoreColor : 'var(--rule-soft)',
                    border: score ? 'none' : '1px dashed var(--ink-mute)',
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 500 }}>{l.title}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--ink-mute)', marginTop: 2 }}>{l.phaseTitle}</div>
                  </div>

                  {/* Score */}
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: scoreColor,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {score ? `${score.correct}/${score.total}` : 'Not attempted'}
                  </div>

                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mute)" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
