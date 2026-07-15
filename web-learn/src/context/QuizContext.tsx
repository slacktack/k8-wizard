import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface QuizResult {
  correct: number;
  total: number;
  timestamp: number;
}

interface QuizContextType {
  results: Record<string, QuizResult>;
  recordResult: (lessonId: string, correct: number, total: number) => void;
  getLessonScore: (lessonId: string) => { correct: number; total: number } | null;
  overallStats: { correct: number; total: number; percent: number };
  proficiency: 'start' | 'intermediate' | 'advanced' | 'expert';
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useLocalStorage<Record<string, QuizResult>>('quiz-results', {});

  const recordResult = useCallback((lessonId: string, correct: number, total: number) => {
    setResults(prev => ({
      ...prev,
      [lessonId]: { correct, total, timestamp: Date.now() },
    }));
  }, [setResults]);

  const getLessonScore = useCallback((lessonId: string) => {
    const r = results[lessonId];
    if (!r) return null;
    return { correct: r.correct, total: r.total };
  }, [results]);

  const overallStats = useMemo(() => {
    const vals = Object.values(results);
    const correct = vals.reduce((s, r) => s + r.correct, 0);
    const total = vals.reduce((s, r) => s + r.total, 0);
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percent };
  }, [results]);

  const proficiency: QuizContextType['proficiency'] = useMemo(() => {
    if (overallStats.total === 0) return 'start';
    if (overallStats.percent >= 90) return 'expert';
    if (overallStats.percent >= 70) return 'advanced';
    if (overallStats.percent >= 40) return 'intermediate';
    return 'start';
  }, [overallStats]);

  return (
    <QuizContext.Provider value={{ results, recordResult, getLessonScore, overallStats, proficiency }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
