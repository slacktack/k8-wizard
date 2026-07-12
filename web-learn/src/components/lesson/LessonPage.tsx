import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LESSONS } from '../../data/lessons';
import { PHASES } from '../../data/phases';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LessonView from './LessonView';
import LessonSidebar from './LessonSidebar';
import Button from '../ui/Button';

export default function LessonPage() {
  const { lessonId, phaseId } = useParams<{ lessonId: string; phaseId: string }>();
  const lesson = lessonId ? LESSONS[lessonId] : undefined;
  const phase = phaseId ? PHASES.find(p => p.id === phaseId) : undefined;

  // Start each lesson at the top rather than inheriting the previous scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (!lesson || !phase) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'VT323', monospace", fontSize: '3rem', marginBottom: 16, color: 'var(--blueprint)' }}>
          Lesson Not Found
        </h1>
        <Link to="/">
          <Button>Back to Curriculum</Button>
        </Link>
      </div>
    );
  }

  const lessonIndex = phase.lessonIds.indexOf(lesson.id);
  const totalInPhase = phase.lessonIds.length;
  const pct = Math.round(((lessonIndex + 1) / totalInPhase) * 100);
  const prevId = lessonIndex > 0 ? phase.lessonIds[lessonIndex - 1] : null;
  const nextId = lessonIndex < phase.lessonIds.length - 1 ? phase.lessonIds[lessonIndex + 1] : null;
  const prevLesson = prevId ? LESSONS[prevId] : null;
  const nextLesson = nextId ? LESSONS[nextId] : null;

  return (
    <>
      <Header />
      <main id="main">
        {/* Mini sticky progress bar */}
        <div
          className="mini-progress-bar"
          style={{
            position: 'sticky',
            top: 64,
            zIndex: 50,
            background: 'var(--bg-header)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--rule)',
            padding: '10px 0',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link
                to={`/phase/${phase.id}`}
                aria-label={`Back to ${phase.title}`}
                style={{ color: 'var(--blueprint)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                ←
              </Link>
              <Link
                to={`/phase/${phase.id}`}
                className="progress-crumb"
                style={{ color: 'var(--ink-mute)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                {phase.title}
              </Link>
              <span style={{ color: 'var(--ink-mute)' }}>/</span>
              <span style={{ color: 'var(--ink)' }} className="progress-title">
                {lesson.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontVariantNumeric: 'tabular-nums' }} className="progress-text">
              <span className="progress-count" style={{ color: 'var(--ink-soft)' }}>
                {lessonIndex + 1} of {totalInPhase}
              </span>
              <div style={{ width: 80, height: 4, background: 'var(--rule-soft)' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--blueprint)', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ color: 'var(--ink-mute)', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
            </div>
          </div>
        </div>

        <div className="container lesson-body" style={{ paddingTop: 40 }}>
          {/* Two-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 340px',
              gap: 48,
              alignItems: 'start',
            }}
            className="lesson-grid"
          >
            {/* Main content */}
            <LessonView lesson={lesson} />

            {/* Sticky right sidebar */}
            <LessonSidebar lesson={lesson} phase={phase} lessonIndex={lessonIndex} />
          </div>

          {/* Prev/Next Navigation */}
          <div
            className="lesson-nav"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              padding: '32px 0 64px',
              borderTop: '1px solid var(--rule)',
              marginTop: 48,
            }}
          >
            <div>
              {prevLesson && (
                <Link to={`/lesson/${phase.id}/${prevLesson.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="default">← {prevLesson.title}</Button>
                </Link>
              )}
            </div>
            <div>
              {nextLesson && (
                <Link to={`/lesson/${phase.id}/${nextLesson.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="primary">{nextLesson.title} →</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
