import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'How this works', href: '#how-it-works', id: 'how' },
  { label: 'Curriculum', href: '#curriculum', id: 'curriculum' },
  { label: 'Playground', href: '#playground', id: 'playground' },
];

export default function Header() {
  const { openPalette } = useSearch();
  const { theme, toggleTheme } = useTheme();
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
        background: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--rule)',
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
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: "'VT323', monospace",
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            color: 'var(--ink)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          <span
            className="logo-icon"
            style={{
              width: 12,
              height: 12,
              background: 'var(--blueprint)',
              flexShrink: 0,
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <span className="logo-text">K8 Wizard</span>
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
          className="header-nav"
        >
          {navItems.map(item => (
            <a
              key={item.id}
              href={isHome ? item.href : '/'}
              className="nav-link"
              style={{
                color: 'var(--ink-soft)',
                textDecoration: 'none',
                transition: 'color 0.15s',
                position: 'relative',
                paddingBottom: 2,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--blueprint)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-soft)'; }}
            >
              {item.label}
            </a>
          ))}

          <button
            onClick={openPalette}
            aria-label="Search (Cmd+K)"
            className="btn"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--rule)',
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
              e.currentTarget.style.borderColor = 'var(--rule)';
            }}
          >
            ⌘K
          </button>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="btn"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--rule)',
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
              e.currentTarget.style.borderColor = 'var(--rule)';
            }}
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </nav>
      </div>
    </header>
  );
}
