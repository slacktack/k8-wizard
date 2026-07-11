import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function TypewriterText({ text, speed = 30, onComplete }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayed}
      {!done && (
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: '1.2em',
            background: 'var(--terminal-cyan)',
            verticalAlign: 'text-bottom',
            animation: 'cursor-blink 1s step-end infinite',
          }}
        />
      )}
    </span>
  );
}
