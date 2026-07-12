import { useState } from 'react';
import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'How this works', href: '#how-it-works', id: 'how' },
  { label: 'Curriculum', href: '#curriculum', id: 'curriculum' },
  { label: 'Playground', href: '#playground', id: 'playground' },
];

function mobileLink(color: string, weight = 400): React.CSSProperties {
  return {
    display: 'block',
    padding: '12px 24px',
    color,
    fontWeight: weight,
    textDecoration: 'none',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.82rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '1px solid var(--rule-soft)',
  };
}

export default function Header() {
  const { openPalette } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);

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

          <Link
            to="/whiteboard"
            className="nav-link"
            style={{
              color: 'var(--blueprint)',
              fontWeight: 800,
              textDecoration: 'none',
              transition: 'color 0.15s, text-shadow 0.15s',
              position: 'relative',
              paddingBottom: 2,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--blueprint-bright)'; e.currentTarget.style.textShadow = '0 0 12px var(--blueprint-tint-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--blueprint)'; e.currentTarget.style.textShadow = 'none'; }}
          >
            System Design Draw
          </Link>

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

          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="mobile-menu-btn"
            style={{
              width: 36,
              height: 36,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--rule)',
              background: 'transparent',
              color: 'var(--ink-soft)',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6">
              {mobileOpen
                ? <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                : <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />}
            </svg>
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <div
          className="mobile-menu"
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-header)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--rule)',
            padding: '8px 0',
          }}
        >
          {navItems.map(item => (
            <a
              key={item.id}
              href={isHome ? item.href : '/'}
              onClick={() => setMobileOpen(false)}
              style={mobileLink('var(--ink-soft)')}
            >
              {item.label}
            </a>
          ))}
          <Link to="/whiteboard" onClick={() => setMobileOpen(false)} style={mobileLink('var(--blueprint)', 700)}>
            System Design Draw
          </Link>
        </div>
      )}
    </header>
  );
}
