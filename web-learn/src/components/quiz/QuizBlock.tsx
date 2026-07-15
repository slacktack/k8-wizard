import { useState, useCallback, useMemo } from 'react';
import type { QuizQuestion } from '../../types/curriculum';

interface QuizBlockProps {
  questions: QuizQuestion[];
  title?: string;
  onComplete?: (correct: number, total: number) => void;
}

type AnswerState = Record<number, { selected: string | boolean | number | null; submitted: boolean; correct: boolean }>;

function getDifficultyLabel(percent: number): { label: string; color: string } {
  if (percent >= 90) return { label: 'Expert', color: 'var(--terminal-red)' };
  if (percent >= 70) return { label: 'Advanced', color: 'var(--terminal-yellow)' };
  if (percent >= 40) return { label: 'Intermediate', color: 'var(--blueprint)' };
  return { label: 'Start', color: 'var(--terminal-green)' };
}

export default function QuizBlock({ questions, title = 'Quiz', onComplete }: QuizBlockProps) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = useCallback((qIdx: number, value: string | boolean | number | null) => {
    if (answers[qIdx]?.submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: { selected: value, submitted: false, correct: false } }));
  }, [answers]);

  const submitAll = useCallback(() => {
    const next: AnswerState = {};
    questions.forEach((q, i) => {
      const a = answers[i];
      if (!a || a.selected === null || a.selected === undefined || a.selected === '') {
        next[i] = { selected: null, submitted: true, correct: false };
        return;
      }
      let correct = false;
      if (q.type === 'multiple-choice') correct = a.selected === q.correctIndex;
      else if (q.type === 'true-false') correct = a.selected === q.correctAnswer;
      else if (q.type === 'fill-blank') correct = String(a.selected).trim().toLowerCase() === q.answer.trim().toLowerCase();
      next[i] = { selected: a.selected, submitted: true, correct };
    });
    setAnswers(next);
    setShowResults(true);
    const c = Object.values(next).filter(a => a.correct).length;
    onComplete?.(c, questions.length);
  }, [questions, answers]);

  const reset = useCallback(() => {
    setAnswers({});
    setShowResults(false);
  }, []);

  const stats = useMemo(() => {
    const attempted = Object.values(answers).filter(a => a.submitted);
    const correct = attempted.filter(a => a.correct).length;
    const total = questions.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const band = getDifficultyLabel(pct);
    return { correct, total, pct, band, attempted: attempted.length };
  }, [answers, questions.length]);

  return (
    <div
      style={{
        margin: '32px 0',
        border: '2px solid var(--blueprint)',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--blueprint)',
          color: 'var(--bg)',
          padding: '14px 20px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{questions.length} questions</span>
      </div>

      {/* Questions */}
      <div style={{ padding: '20px 24px' }}>
        {questions.map((q, i) => (
          <QuestionRow
            key={i}
            q={q}
            index={i}
            answer={answers[i]}
            onAnswer={handleAnswer}
          />
        ))}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
          {!showResults ? (
            <button
              onClick={submitAll}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '10px 24px',
                border: '1px solid var(--blueprint)',
                background: 'var(--blueprint)',
                color: 'var(--bg)',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Submit Answers
            </button>
          ) : (
            <>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem',
                  padding: '10px 20px',
                  border: '1px solid var(--rule)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span style={{ color: 'var(--ink)' }}>
                  <strong style={{ color: stats.correct === stats.total ? 'var(--terminal-green)' : stats.correct >= Math.ceil(stats.total * 0.7) ? 'var(--terminal-yellow)' : 'var(--ink)' }}>
                    {stats.correct}
                  </strong>
                  <span style={{ color: 'var(--ink-mute)' }}>/{stats.total}</span>
                </span>
                <span style={{ color: 'var(--ink-mute)' }}>·</span>
                <span style={{ fontWeight: 600, color: stats.band.color }}>{stats.pct}%</span>
                <span style={{ color: 'var(--ink-mute)' }}>·</span>
                <span style={{ fontWeight: 600, color: stats.band.color }}>{stats.band.label}</span>
              </div>
              <button
                onClick={reset}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '8px 16px',
                  border: '1px solid var(--rule)',
                  background: 'transparent',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.color = 'var(--blueprint)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink-soft)'; }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionRow({ q, index, answer, onAnswer }: {
  q: QuizQuestion;
  index: number;
  answer: { selected: string | boolean | number | null; submitted: boolean; correct: boolean } | undefined;
  onAnswer: (qIdx: number, value: string | boolean | number | null) => void;
}) {
  const submitted = answer?.submitted ?? false;
  const correct = answer?.correct ?? false;

  return (
    <div
      style={{
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom: '1px solid var(--rule-soft)',
        opacity: submitted ? (correct ? 1 : 0.8) : 1,
      }}
    >
      {/* Question */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: submitted ? (correct ? 'var(--terminal-green)' : 'var(--terminal-red)') : 'var(--blueprint)',
            fontWeight: 600,
            flexShrink: 0,
            minWidth: 24,
          }}
        >
          {submitted ? (correct ? '✓' : '✗') : `${index + 1}.`}
        </span>
        <div>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.5, margin: 0 }}>
            {q.question}
          </p>
          {q.type === 'fill-blank' && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)', marginTop: 4 }}>
              Enter the command or value:
            </p>
          )}
        </div>
      </div>

      {/* Answer input */}
      <div style={{ marginLeft: 34 }}>
        {q.type === 'multiple-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {q.options.map((opt, oi) => {
              const isSelected = answer?.selected === oi;
              const isCorrect = submitted && q.correctIndex === oi;
              const isWrong = submitted && isSelected && !correct;
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => onAnswer(index, oi)}
                  style={{
                    textAlign: 'left',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.82rem',
                    padding: '8px 12px',
                    border: `1px solid ${isCorrect ? 'var(--terminal-green)' : isWrong ? 'var(--terminal-red)' : isSelected ? 'var(--blueprint)' : 'var(--rule-soft)'}`,
                    background: isCorrect ? 'rgba(57, 185, 80, 0.08)' : isWrong ? 'rgba(255, 95, 86, 0.08)' : isSelected ? 'var(--blueprint-tint)' : 'transparent',
                    color: 'var(--ink)',
                    cursor: submitted ? 'default' : 'pointer',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                  onMouseEnter={e => { if (!submitted && !isSelected) { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.background = 'var(--blueprint-tint)'; } }}
                  onMouseLeave={e => { if (!submitted && !isSelected) { e.currentTarget.style.borderColor = 'var(--rule-soft)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  <span style={{ color: isCorrect ? 'var(--terminal-green)' : isWrong ? 'var(--terminal-red)' : 'var(--ink-mute)', marginRight: 8 }}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'true-false' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[true, false].map(val => {
              const isSelected = answer?.selected === val;
              const isCorrect = submitted && q.correctAnswer === val;
              const isWrong = submitted && isSelected && !correct;
              return (
                <button
                  key={String(val)}
                  disabled={submitted}
                  onClick={() => onAnswer(index, val)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.82rem',
                    padding: '8px 20px',
                    border: `1px solid ${isCorrect ? 'var(--terminal-green)' : isWrong ? 'var(--terminal-red)' : isSelected ? 'var(--blueprint)' : 'var(--rule-soft)'}`,
                    background: isCorrect ? 'rgba(57, 185, 80, 0.08)' : isWrong ? 'rgba(255, 95, 86, 0.08)' : isSelected ? 'var(--blueprint-tint)' : 'transparent',
                    color: 'var(--ink)',
                    cursor: submitted ? 'default' : 'pointer',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                  onMouseEnter={e => { if (!submitted && !isSelected) { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.background = 'var(--blueprint-tint)'; } }}
                  onMouseLeave={e => { if (!submitted && !isSelected) { e.currentTarget.style.borderColor = 'var(--rule-soft)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  {String(val)}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'fill-blank' && (
          <div>
            <input
              value={submitted && answer?.selected !== null && answer?.selected !== undefined && answer?.selected !== '' ? String(answer.selected) : (answer?.selected as string) ?? ''}
              onChange={e => onAnswer(index, e.target.value)}
              disabled={submitted}
              placeholder="Type your answer..."
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.85rem',
                padding: '8px 12px',
                border: `1px solid ${submitted ? (correct ? 'var(--terminal-green)' : 'var(--terminal-red)') : 'var(--rule)'}`,
                background: submitted ? (correct ? 'rgba(57, 185, 80, 0.05)' : 'rgba(255, 95, 86, 0.05)') : 'var(--bg)',
                color: 'var(--ink)',
                width: '100%',
                maxWidth: 400,
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Explanation */}
        {submitted && q.explanation && (
          <div
            style={{
              marginTop: 8,
              padding: '8px 12px',
              borderLeft: '3px solid var(--blueprint)',
              background: 'var(--blueprint-tint)',
              fontFamily: "'Source Serif 4', serif",
              fontSize: '0.82rem',
              color: 'var(--ink-soft)',
              lineHeight: 1.5,
            }}
          >
            {q.explanation}
          </div>
        )}
      </div>
    </div>
  );
}

export { getDifficultyLabel };
