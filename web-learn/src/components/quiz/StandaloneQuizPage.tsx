import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { DOCKER_QUESTIONS, KUBERNETES_QUESTIONS } from '../../data/quiz-questions';
import QuizBlock from './QuizBlock';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

const QUIZ_TOPICS = [
  { id: 'docker', label: 'Docker', icon: '🐳', count: DOCKER_QUESTIONS.length, color: 'var(--terminal-cyan)', desc: 'Containers, Dockerfiles, networking, volumes, Compose, production patterns' },
  { id: 'kubernetes', label: 'Kubernetes', icon: '☸', count: KUBERNETES_QUESTIONS.length, color: 'var(--blueprint)', desc: 'Pods, Deployments, Services, networking, security, GitOps, production-grade' },
] as const;

export default function StandaloneQuizPage() {
  const { topic: topicParam } = useParams<{ topic: string }>();
  const { overallStats, proficiency, recordResult } = useQuiz();
  const [topic, setTopic] = useState<string | null>(topicParam || null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (topicParam && topicParam !== topic) {
      setTopic(topicParam);
      setKey(k => k + 1);
    }
  }, [topicParam]);

  const profColors: Record<string, string> = {
    start: 'var(--terminal-green)',
    intermediate: 'var(--blueprint)',
    advanced: 'var(--terminal-yellow)',
    expert: 'var(--terminal-red)',
  };

  const questions = useMemo(() => {
    if (topic === 'docker') return DOCKER_QUESTIONS;
    if (topic === 'kubernetes') return KUBERNETES_QUESTIONS;
    return [];
  }, [topic]);

  // Topic selection
  if (!topic) {
    return (
      <>
        <Header />
        <main id="main" style={{ paddingTop: 64 }}>
          <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 820 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Link to="/" style={{ color: 'var(--blueprint)', textDecoration: 'none' }}>← Home</Link>
              <span style={{ color: 'var(--ink-mute)' }}>/</span>
              <span style={{ color: 'var(--ink-mute)' }}>Quiz</span>
            </div>

            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--ink)', marginBottom: 8, lineHeight: 1.05 }}>
              Knowledge Quiz
            </h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 8 }}>
              Test your Docker & Kubernetes knowledge from beginner to expert
            </p>

            {overallStats.total > 0 && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)', marginBottom: 32 }}>
                Overall proficiency:{' '}
                <span style={{ fontWeight: 600, color: profColors[proficiency] }}>
                  {proficiency.charAt(0).toUpperCase() + proficiency.slice(1)}
                </span>
                {' '}· {overallStats.correct}/{overallStats.total} across all quizzes
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              {QUIZ_TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTopic(t.id); setKey(k => k + 1); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '20px 24px',
                    border: '1px solid var(--rule)',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, transform 0.15s',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <span style={{ fontSize: '2rem' }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>{t.desc}</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: t.color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {t.count} questions
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mute)" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Link to lesson-based quizzes */}
            <div style={{ marginTop: 32, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}>
              <Link to="/quiz" style={{ color: 'var(--blueprint)', textDecoration: 'underline' }}>
                → View per-lesson quizzes
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Active quiz
  const topicInfo = QUIZ_TOPICS.find(t => t.id === topic)!;
  return (
    <>
      <Header />
      <main id="main" style={{ paddingTop: 64 }}>
        <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 820 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <button onClick={() => setTopic(null)} style={{ color: 'var(--blueprint)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase' }}>
              ← All Quizzes
            </button>
            <span style={{ color: 'var(--ink-mute)' }}>/</span>
            <span style={{ color: topicInfo.color }}>{topicInfo.label}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem' }}>{topicInfo.icon}</span>
            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: 'var(--ink)', lineHeight: 1.05 }}>
              {topicInfo.label} Quiz
            </h1>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--ink-mute)', marginBottom: 24 }}>
            {topicInfo.count} questions · beginner → expert · takes ~15 min
          </p>

          <QuizBlock
            key={key}
            questions={questions}
            title={`${topicInfo.label} Assessment`}
            onComplete={(correct, total) => {
              recordResult(`standalone-${topic}`, correct, total);
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
