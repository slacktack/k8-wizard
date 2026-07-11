import { Link } from 'react-router-dom';
import type { Lesson } from '../../types/curriculum';
import StatusDot from '../ui/StatusDot';
import Badge from '../ui/Badge';

interface LessonRowProps {
  lesson: Lesson;
  isCompleted: boolean;
  onToggle: () => void;
}

export default function LessonRow({ lesson, isCompleted, onToggle }: LessonRowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '14px 1fr auto auto auto',
        gap: 12,
        alignItems: 'center',
        padding: '8px 4px',
        borderBottom: '1px solid var(--rule-soft)',
        fontSize: '0.85rem',
      }}
    >
      {/* Status Dot */}
      <StatusDot status={isCompleted ? 'complete' : 'planned'} size={12} />

      {/* Title */}
      <span
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontWeight: 600,
          color: 'var(--ink)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {lesson.title}
      </span>

      {/* Language/Type Badge */}
      <Badge variant={lesson.type as 'learn' | 'build' | 'capstone'}>
        {lesson.type}
      </Badge>

      {/* Read Button */}
      <Link
        to={`/lesson/${lesson.phaseId}/${lesson.id}`}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          padding: '4px 10px',
          border: '1px solid var(--ink)',
          color: 'var(--ink)',
          textDecoration: 'none',
          transition: 'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--blueprint)';
          e.currentTarget.style.borderColor = 'var(--blueprint)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--ink)';
          e.currentTarget.style.borderColor = 'var(--ink)';
        }}
      >
        Read
      </Link>

      {/* Toggle Button */}
      <button
        onClick={e => {
          e.preventDefault();
          onToggle();
        }}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        style={{
          width: 22,
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--rule-soft)',
          background: 'transparent',
          color: isCompleted ? 'var(--blueprint)' : 'var(--ink-mute)',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'color 0.15s, border-color 0.15s',
        }}
      >
        {isCompleted ? '✓' : '+'}
      </button>
    </div>
  );
}
