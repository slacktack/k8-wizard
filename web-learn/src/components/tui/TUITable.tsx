interface TUITableProps {
  headers: string[];
  rows: string[][];
  headerColor?: string;
}

export default function TUITable({ headers, rows, headerColor }: TUITableProps) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: 'var(--tui-text)', overflowX: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--tui-border)', paddingBottom: 4, marginBottom: 4, textTransform: 'uppercase' }}>
        {headers.map((h, i) => (
          <div key={i} style={{ flex: 1, minWidth: 80, color: headerColor || 'var(--tui-cyan)', padding: '4px 8px' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
            padding: '2px 0',
          }}
          className="tui-table-row"
        >
          {row.map((cell, j) => (
            <div key={j} style={{ flex: 1, minWidth: 80, padding: '4px 8px', whiteSpace: 'nowrap' }}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
