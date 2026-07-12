import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PHASES } from '../../data/phases';
import { LESSONS } from '../../data/lessons';
import { useProgress } from '../../context/ProgressContext';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LessonRow from '../modal/LessonRow';
import Button from '../ui/Button';

export default function PhaseLessonsPage() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const { isCompleted, toggleLesson } = useProgress();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phaseId]);

  const phase = PHASES.find(p => p.id === phaseId);

  if (!phase) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'VT323', monospace", fontSize: '3rem', marginBottom: 16, color: 'var(--blueprint)' }}>
          Phase Not Found
        </h1>
        <Link to="/#curriculum">
          <Button>Back to Curriculum</Button>
        </Link>
      </div>
    );
  }

  const phaseIndex = PHASES.findIndex(p => p.id === phase.id);
  const nextPhase = PHASES[phaseIndex + 1] ?? null;
  const prevPhase = PHASES[phaseIndex - 1] ?? null;

  const lessons = phase.lessonIds.map(id => LESSONS[id]).filter(Boolean);
  const completed = lessons.filter(l => isCompleted(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <>
      <Header />
      <main id="main">
        <div className="container" style={{ paddingTop: 96, paddingBottom: 64, maxWidth: 820 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link to="/#curriculum" style={{ color: 'var(--blueprint)', textDecoration: 'none' }}>← Curriculum</Link>
            <span style={{ color: 'var(--ink-mute)' }}>/</span>
            <span style={{ color: 'var(--ink-mute)' }}>Phase {String(phase.number).padStart(2, '0')}</span>
          </div>

          {/* Phase header */}
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--blueprint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            {phase.subtitle}
          </p>
          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2rem, 5vw, 3rem)', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 16, lineHeight: 1.05 }}>
            {phase.title}
          </h1>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '1.02rem', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 28, maxWidth: 640 }}>
            {phase.description}
          </p>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.74rem', color: 'var(--ink-mute)', textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ color: 'var(--blueprint)' }}>{completed}/{lessons.length} complete</span>
            <span>·</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--rule-soft)', marginBottom: 36 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blueprint)', transition: 'width 0.4s ease' }} />
          </div>

          {/* Lesson list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lessons.map(lesson => (
              <LessonRow key={lesson.id} lesson={lesson} isCompleted={isCompleted(lesson.id)} onToggle={() => toggleLesson(lesson.id)} />
            ))}
          </div>

          {/* Phase-to-phase navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
            <div>
              {prevPhase && (
                <button onClick={() => navigate(`/phase/${prevPhase.id}`)} style={ghostBtn}>
                  ← {prevPhase.title}
                </button>
              )}
            </div>
            <div>
              {nextPhase && (
                <button onClick={() => navigate(`/phase/${nextPhase.id}`)} style={ghostBtn}>
                  {nextPhase.title} →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const ghostBtn: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.74rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '10px 16px',
  border: '1px solid var(--rule)',
  background: 'transparent',
  color: 'var(--ink-soft)',
  cursor: 'pointer',
};
