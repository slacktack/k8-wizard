interface TextSectionProps {
  body: string;
}

export default function TextSection({ body }: TextSectionProps) {
  return (
    <p
      style={{
        marginBottom: '1.25em',
        lineHeight: 1.75,
        color: 'var(--ink)',
        fontSize: '1.05rem',
        letterSpacing: '0.01em',
      }}
    >
      {body}
    </p>
  );
}
