import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ProgressProvider } from './context/ProgressContext'
import { QuizProvider } from './context/QuizContext'
import { SearchProvider } from './context/SearchContext'
import { PHASES } from './data/phases'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/animations.css'

const TOTAL_LESSONS = PHASES.reduce((sum, p) => sum + p.lessonIds.length, 0);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ProgressProvider totalLessons={TOTAL_LESSONS}>
          <QuizProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
          </QuizProvider>
        </ProgressProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
