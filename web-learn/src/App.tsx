import { Routes, Route } from 'react-router-dom';
import { useKeyboard } from './hooks/useKeyboard';
import LandingPage from './components/landing/LandingPage';
import LessonPage from './components/lesson/LessonPage';
import CommandPalette from './components/command-palette/CommandPalette';

export default function App() {
  useKeyboard();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lesson/:phaseId/:lessonId" element={<LessonPage />} />
      </Routes>
      <CommandPalette />
    </>
  );
}
