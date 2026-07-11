import { useParams, Link } from 'react-router-dom';
import { LESSONS } from '../../data/lessons';
import { PHASES } from '../../data/phases';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LessonView from './LessonView';
import Button from '../ui/Button';

export default function LessonPage() {
  const { lessonId, phaseId } = useParams<{ lessonId: string; phaseId: string }>();
  const lesson = lessonId ? LESSONS[lessonId] : undefined;
  const phase = phaseId ? PHASES.find(p => p.id === phaseId) : undefined;

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

  // Find prev/next in phase
  const lessonIndex = phase.lessonIds.indexOf(lesson.id);
  const prevId = lessonIndex > 0 ? phase.lessonIds[lessonIndex - 1] : null;
  const nextId = lessonIndex < phase.lessonIds.length - 1 ? phase.lessonIds[lessonIndex + 1] : null;
  const prevLesson = prevId ? LESSONS[prevId] : null;
  const nextLesson = nextId ? LESSONS[nextId] : null;

  return (
    <>
      <Header />
      <main id="main">
        {/* Breadcrumb */}
        <div className="container" style={{ paddingTop: 'calc(64px + 32px)' }}>
          <Link
            to="/"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              color: 'var(--blueprint)',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            ← Curriculum
          </Link>

          <LessonView lesson={lesson} phase={phase} />

          {/* Prev/Next Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '32px 0 64px',
              borderTop: '1px solid var(--rule-soft)',
              marginTop: 48,
            }}
          >
            <div>
              {prevLesson && (
                <Link
                  to={`/lesson/${phase.id}/${prevLesson.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="default">
                    ← {prevLesson.title}
                  </Button>
                </Link>
              )}
            </div>
            <div>
              {nextLesson && (
                <Link
                  to={`/lesson/${phase.id}/${nextLesson.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary">
                    {nextLesson.title} →
                  </Button>
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
