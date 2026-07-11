import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ProgressProvider } from './context/ProgressContext'
import { SearchProvider } from './context/SearchContext'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/animations.css'

const TOTAL_LESSONS = 70;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ProgressProvider totalLessons={TOTAL_LESSONS}>
          <SearchProvider>
            <App />
          </SearchProvider>
        </ProgressProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
