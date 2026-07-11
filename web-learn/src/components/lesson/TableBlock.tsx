interface TableBlockProps {
  headers: string[];
  rows: string[][];
}

export default function TableBlock({ headers, rows }: TableBlockProps) {
  return (
    <div
      style={{
        margin: '24px 0',
        overflowX: 'auto',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.8rem',
          lineHeight: 1.5,
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--ink)' }}>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  fontSize: '0.72rem',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid var(--rule-soft)',
                background: i % 2 === 0 ? 'transparent' : 'var(--blueprint-tint)',
              }}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '6px 12px', color: 'var(--ink)' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
