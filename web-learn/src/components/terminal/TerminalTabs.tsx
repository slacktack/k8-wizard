import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TerminalTabsProps {
  tabs: Tab[];
}

export default function TerminalTabs({ tabs }: TerminalTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  return (
    <div style={{ border: '1px solid var(--terminal-border)', background: 'var(--terminal-bg)', overflow: 'hidden' }}>
      {/* Tab Bar */}
      <div style={{ height: 32, background: 'var(--terminal-chrome-bg)', display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid var(--terminal-border)', gap: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              padding: '6px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--terminal-cyan)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--terminal-text)' : 'var(--terminal-mute)',
              cursor: 'pointer',
              transition: 'color 0.1s, border-color 0.1s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--terminal-text)' }}>
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
