interface TextSectionProps {
  body: string;
}

export default function TextSection({ body }: TextSectionProps) {
  return (
    <p
      style={{
        marginBottom: '1em',
        lineHeight: 1.62,
        color: 'var(--ink)',
        fontSize: '1rem',
      }}
    >
      {body}
    </p>
  );
}
