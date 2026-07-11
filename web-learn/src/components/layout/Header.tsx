import { useTheme } from '../../context/ThemeContext';
import { useSearch } from '../../context/SearchContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { openPalette } = useSearch();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--rule-soft)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: "'VT323', monospace",
            fontSize: 'clamp(1rem, 3vw, 1.6rem)',
            color: 'var(--ink)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--blueprint)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
        >
          <span
            style={{
              width: 12,
              height: 12,
              background: 'var(--blueprint)',
              flexShrink: 0,
            }}
          />
          <span style={{ display: 'inline' }}>K8 Wizard</span>
        </Link>

        {/* Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
          className="header-nav"
        >
          <a
            href={isHome ? '#how-it-works' : '/'}
            style={{ color: 'var(--ink-soft)', transition: 'color 0.15s', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blueprint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
          >
            How this works
          </a>
          <a
            href={isHome ? '#curriculum' : '/'}
            style={{ color: 'var(--ink-soft)', transition: 'color 0.15s', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blueprint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
          >
            Curriculum
          </a>
          <a
            href={isHome ? '#playground' : '/'}
            style={{ color: 'var(--ink-soft)', transition: 'color 0.15s', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blueprint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
          >
            Playground
          </a>

          {/* Search */}
          <button
            onClick={openPalette}
            aria-label="Search (Cmd+K)"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--rule-soft)',
              background: 'transparent',
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--blueprint)';
              e.currentTarget.style.borderColor = 'var(--blueprint)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--ink-soft)';
              e.currentTarget.style.borderColor = 'var(--rule-soft)';
            }}
          >
            ⌘K
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--rule-soft)',
              background: 'transparent',
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--blueprint)';
              e.currentTarget.style.borderColor = 'var(--blueprint)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--ink-soft)';
              e.currentTarget.style.borderColor = 'var(--rule-soft)';
            }}
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </nav>
      </div>
    </header>
  );
}
