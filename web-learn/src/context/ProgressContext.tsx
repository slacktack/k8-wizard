import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ProgressContextType {
  completed: Record<string, boolean>;
  toggleLesson: (lessonId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  totalCompleted: number;
  totalLessons: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children, totalLessons }: { children: ReactNode; totalLessons: number }) {
  const [completed, setCompleted] = useLocalStorage<Record<string, boolean>>('lesson-progress', {});

  const toggleLesson = useCallback((lessonId: string) => {
    setCompleted(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  }, [setCompleted]);

  const isCompleted = useCallback((lessonId: string) => !!completed[lessonId], [completed]);

  const totalCompleted = Object.keys(completed).filter(k => completed[k]).length;

  return (
    <ProgressContext.Provider value={{ completed, toggleLesson, isCompleted, totalCompleted, totalLessons }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
