import type { Lesson, Phase } from '../../types/curriculum';
import TextSection from './TextSection';
import CommandBlock from './CommandBlock';
import YamlBlock from './YamlBlock';
import CodeBlock from './CodeBlock';
import TableBlock from './TableBlock';
import DiagramBlock from './DiagramBlock';

interface LessonViewProps {
  lesson: Lesson;
  phase: Phase;
}

export default function LessonView({ lesson, phase }: LessonViewProps) {
  return (
    <article style={{ paddingTop: 32 }}>
      {/* Header */}
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          color: 'var(--blueprint)',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Phase {phase.number} · Lesson {lesson.number}
      </p>
      <h1
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          color: 'var(--ink)',
          marginBottom: 8,
        }}
      >
        {lesson.title}
      </h1>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          color: 'var(--ink-mute)',
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        {phase.title} · {lesson.duration} · {lesson.type}
      </p>

      {/* Sections */}
      <div style={{ maxWidth: 760 }}>
        {lesson.sections.map((section, i) => {
          switch (section.type) {
            case 'text':
              return <TextSection key={i} body={section.body} />;
            case 'heading':
              return (
                <h2
                  key={i}
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: section.level === 2 ? 'clamp(1.4rem, 3vw, 1.8rem)' : '1.2rem',
                    color: 'var(--ink)',
                    marginTop: section.level === 2 ? 40 : 24,
                    marginBottom: 12,
                  }}
                >
                  {section.text}
                </h2>
              );
            case 'command':
              return <CommandBlock key={i} prompt={section.prompt} cmd={section.cmd} output={section.output} />;
            case 'yaml':
              return <YamlBlock key={i} filename={section.filename} code={section.code} />;
            case 'code':
              return <CodeBlock key={i} language={section.language} code={section.code} />;
            case 'table':
              return <TableBlock key={i} headers={section.headers} rows={section.rows} />;
            case 'diagram':
              return <DiagramBlock key={i} lines={section.lines} />;
            case 'note':
              return (
                <div
                  key={i}
                  style={{
                    padding: '12px 16px',
                    borderLeft: '3px solid var(--blueprint)',
                    background: 'var(--blueprint-tint)',
                    margin: '16px 0',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'var(--ink-soft)',
                  }}
                >
                  {section.body}
                </div>
              );
            case 'warning':
              return (
                <div
                  key={i}
                  style={{
                    padding: '12px 16px',
                    borderLeft: '3px solid var(--warn)',
                    background: 'rgba(184, 135, 15, 0.06)',
                    margin: '16px 0',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'var(--warn)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 500,
                  }}
                >
                  ⚠ {section.body}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </article>
  );
}
