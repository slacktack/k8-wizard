import { Routes, Route } from 'react-router-dom';
import { useKeyboard } from './hooks/useKeyboard';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/landing/LandingPage';
import LessonPage from './components/lesson/LessonPage';
import PhaseLessonsPage from './components/lesson/PhaseLessonsPage';
import WhiteboardPage from './whiteboard/WhiteboardPage';
import NotFoundPage from './components/NotFoundPage';
import ProgressToast from './components/ui/ProgressToast';
import CommandPalette from './components/command-palette/CommandPalette';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

export default function App() {
  useKeyboard();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/phase/:phaseId" element={<PageWrapper><PhaseLessonsPage /></PageWrapper>} />
        <Route path="/lesson/:phaseId/:lessonId" element={<PageWrapper><LessonPage /></PageWrapper>} />
        <Route path="/whiteboard" element={<WhiteboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CommandPalette />
      <ProgressToast />
    </ErrorBoundary>
  );
}
