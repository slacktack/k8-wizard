import type { Lesson } from '../../types/curriculum';
import TextSection from './TextSection';
import CommandBlock from './CommandBlock';
import YamlBlock from './YamlBlock';
import CodeBlock from './CodeBlock';
import TableBlock from './TableBlock';
import DiagramBlock from './DiagramBlock';
import UMLDiagram, { DOCKER_BUILD_UML, K8_ARCHITECTURE_UML } from '../tui/UMLDiagram';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface LessonViewProps {
  lesson: Lesson;
}

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function LessonView({ lesson }: LessonViewProps) {
  return (
    <article style={{ paddingTop: 28, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
      {/* Sections */}
      {lesson.sections.map((section, i) => {
        const delay = Math.min(i * 0.04, 0.4);
        switch (section.type) {
          case 'text':
            return (
              <RevealSection key={i} delay={delay}>
                <TextSection body={section.body} />
              </RevealSection>
            );
          case 'heading':
            return (
              <RevealSection key={i} delay={delay}>
                <h2
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: section.level === 2 ? 'clamp(1.5rem, 3.5vw, 2rem)' : '1.25rem',
                    color: 'var(--ink)',
                    marginTop: section.level === 2 ? 48 : 32,
                    marginBottom: 16,
                    scrollMarginTop: 120,
                    lineHeight: 1.2,
                  }}
                >
                  {section.text}
                </h2>
              </RevealSection>
            );
          case 'command':
            return (
              <RevealSection key={i} delay={delay}>
                <CommandBlock prompt={section.prompt} cmd={section.cmd} output={section.output} />
              </RevealSection>
            );
          case 'yaml':
            return (
              <RevealSection key={i} delay={delay}>
                <YamlBlock filename={section.filename} code={section.code} />
              </RevealSection>
            );
          case 'code':
            return (
              <RevealSection key={i} delay={delay}>
                <CodeBlock code={section.code} />
              </RevealSection>
            );
          case 'table':
            return (
              <RevealSection key={i} delay={delay}>
                <TableBlock headers={section.headers} rows={section.rows} />
              </RevealSection>
            );
          case 'diagram':
            return (
              <RevealSection key={i} delay={delay}>
                <DiagramBlock lines={section.lines} />
              </RevealSection>
            );
          case 'uml':
            return (
              <RevealSection key={i} delay={delay}>
                <UMLDiagram title={section.title} nodes={section.preset === 'docker-build' ? DOCKER_BUILD_UML : K8_ARCHITECTURE_UML} />
              </RevealSection>
            );
          case 'note':
            return (
              <RevealSection key={i} delay={delay}>
                <div
                  style={{
                    padding: '16px 20px',
                    borderLeft: '4px solid var(--blueprint)',
                    background: 'var(--blueprint-tint)',
                    margin: '20px 0',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    color: 'var(--ink-soft)',
                    fontFamily: "'Source Serif 4', serif",
                    borderRadius: 0,
                  }}
                >
                  {section.body}
                </div>
              </RevealSection>
            );
          case 'warning':
            return (
              <RevealSection key={i} delay={delay}>
                <div
                  style={{
                    padding: '16px 20px',
                    borderLeft: '4px solid var(--warn)',
                    background: 'rgba(184, 135, 15, 0.06)',
                    margin: '20px 0',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    color: 'var(--warn)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 500,
                  }}
                >
                  {section.body}
                </div>
              </RevealSection>
            );
          default:
            return null;
        }
      })}
    </article>
  );
}
