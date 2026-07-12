import React from 'react';

/* ============================================================
   Lightweight, on-brand syntax highlighter
   ------------------------------------------------------------
   Maps YAML / shell / Dockerfile tokens onto the existing
   --terminal-* palette so highlighted code reads as part of the
   blueprint design system rather than a generic editor theme.

   Design goals:
   - Never throw. Any parse failure falls back to plain text.
   - Line-based tokenisers (predictable, cheap, good enough for
     the small snippets used across the curriculum).
   ============================================================ */

// Semantic token colors — all resolve to CSS vars defined in tokens.css
const C = {
  key: 'var(--terminal-cyan)',
  string: 'var(--terminal-green)',
  number: 'var(--terminal-orange)',
  literal: 'var(--terminal-magenta)', // booleans / null
  kind: 'var(--terminal-yellow)', // K8s kinds, capitalised values
  comment: 'var(--terminal-mute)',
  punct: 'var(--terminal-mute)',
  flag: 'var(--terminal-yellow)',
  command: 'var(--terminal-blue)',
  instruction: 'var(--terminal-magenta)',
  text: 'var(--terminal-text)',
} as const;

function span(color: string, text: string, key: number, bold = false): React.ReactNode {
  return (
    <span key={key} style={{ color, fontWeight: bold ? 600 : undefined }}>
      {text}
    </span>
  );
}

// --- YAML ---------------------------------------------------
const YAML_LITERALS = new Set(['true', 'false', 'null', 'yes', 'no', '~']);

function highlightYamlValue(raw: string, keyStart: number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let k = keyStart;

  // Split off an inline comment ( ' #...' ) that isn't inside quotes
  let value = raw;
  let comment = '';
  const hashIdx = raw.search(/\s#/);
  if (hashIdx !== -1 && !/["'].*#.*["']/.test(raw)) {
    value = raw.slice(0, hashIdx);
    comment = raw.slice(hashIdx);
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    if (comment) out.push(span(C.comment, comment, k++));
    return out;
  }

  const leading = value.slice(0, value.length - value.trimStart().length);
  if (leading) out.push(<React.Fragment key={k++}>{leading}</React.Fragment>);

  if (/^["'].*["']$/.test(trimmed)) {
    out.push(span(C.string, trimmed, k++));
  } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    out.push(span(C.number, trimmed, k++));
  } else if (YAML_LITERALS.has(trimmed.toLowerCase())) {
    out.push(span(C.literal, trimmed, k++));
  } else if (/^[A-Z][A-Za-z0-9]+$/.test(trimmed)) {
    // Capitalised scalar → likely a K8s kind (Deployment, ClusterIP…)
    out.push(span(C.kind, trimmed, k++));
  } else {
    // paths, image refs, plain strings
    out.push(span(C.string, trimmed, k++));
  }

  const trailing = value.slice(value.trimEnd().length);
  if (trailing) out.push(<React.Fragment key={k++}>{trailing}</React.Fragment>);
  if (comment) out.push(span(C.comment, comment, k++));
  return out;
}

function highlightYamlLine(line: string, lineKey: number): React.ReactNode {
  // Full-line comment
  if (/^\s*#/.test(line)) return span(C.comment, line, lineKey);

  const parts: React.ReactNode[] = [];
  let k = lineKey * 100;

  // Leading indent + optional list marker "- "
  const m = line.match(/^(\s*)((?:-\s+)*)(.*)$/);
  const indent = m ? m[1] : '';
  const marker = m ? m[2] : '';
  let rest = m ? m[3] : line;

  if (indent) parts.push(<React.Fragment key={k++}>{indent}</React.Fragment>);
  if (marker) parts.push(span(C.punct, marker, k++));

  // key: value
  const kv = rest.match(/^([\w.\-/]+)(:)(\s*)(.*)$/);
  if (kv) {
    parts.push(span(C.key, kv[1], k++));
    parts.push(span(C.punct, kv[2], k++));
    parts.push(<React.Fragment key={k++}>{kv[3]}</React.Fragment>);
    if (kv[4]) parts.push(...highlightYamlValue(kv[4], k));
  } else if (rest) {
    // bare scalar (list of values, block scalar content…)
    parts.push(...highlightYamlValue(rest, k));
  }

  return <React.Fragment key={lineKey}>{parts}</React.Fragment>;
}

// --- Shell / Bash -------------------------------------------
function highlightBashLine(line: string, lineKey: number): React.ReactNode {
  if (/^\s*#/.test(line)) return span(C.comment, line, lineKey);

  const parts: React.ReactNode[] = [];
  let k = lineKey * 100;
  // Tokenise on whitespace but keep the whitespace
  const tokens = line.split(/(\s+)/);
  let seenCommand = false;

  tokens.forEach(tok => {
    if (tok.trim() === '') {
      parts.push(<React.Fragment key={k++}>{tok}</React.Fragment>);
      return;
    }
    if (tok.startsWith('#')) {
      parts.push(span(C.comment, tok, k++));
    } else if (/^["'].*["']$/.test(tok)) {
      parts.push(span(C.string, tok, k++));
    } else if (tok.startsWith('-')) {
      parts.push(span(C.flag, tok, k++));
    } else if (/^[A-Z_][A-Z0-9_]*=/.test(tok)) {
      const eq = tok.indexOf('=');
      parts.push(span(C.key, tok.slice(0, eq), k++));
      parts.push(span(C.punct, '=', k++));
      parts.push(span(C.string, tok.slice(eq + 1), k++));
    } else if (tok === '|' || tok === '&&' || tok === '>' || tok === '\\') {
      parts.push(span(C.literal, tok, k++));
    } else if (!seenCommand) {
      parts.push(span(C.command, tok, k++, true));
      seenCommand = true;
    } else {
      parts.push(<React.Fragment key={k++}>{tok}</React.Fragment>);
    }
  });

  return <React.Fragment key={lineKey}>{parts}</React.Fragment>;
}

// --- Dockerfile ---------------------------------------------
const DOCKERFILE_INSTRUCTIONS = new Set([
  'FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT',
  'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL',
]);

function highlightDockerfileLine(line: string, lineKey: number): React.ReactNode {
  if (/^\s*#/.test(line)) return span(C.comment, line, lineKey);
  const m = line.match(/^(\s*)(\w+)(\s+)(.*)$/);
  if (m && DOCKERFILE_INSTRUCTIONS.has(m[2].toUpperCase())) {
    let k = lineKey * 100;
    return (
      <React.Fragment key={lineKey}>
        {m[1]}
        {span(C.instruction, m[2], k++, true)}
        {m[3]}
        {span(m[2].toUpperCase() === 'FROM' ? C.string : C.text, m[4], k++)}
      </React.Fragment>
    );
  }
  return <React.Fragment key={lineKey}>{line}</React.Fragment>;
}

// --- Generic C-family / structured code ---------------------
const JS_KW = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'import', 'from', 'export', 'default', 'class', 'extends', 'new', 'await', 'async', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'this', 'super', 'yield', 'delete', 'void']);
const GO_KW = new Set(['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'return', 'if', 'else', 'for', 'range', 'map', 'chan', 'go', 'defer', 'select', 'switch', 'case', 'break', 'continue', 'fallthrough', 'default', 'nil']);
const PY_KW = new Set(['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'lambda', 'yield', 'pass', 'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'self', 'async', 'await']);
const LITERALS = new Set(['true', 'false', 'null', 'nil', 'undefined', 'None', 'True', 'False']);

function keywordsFor(lang: string): Set<string> {
  if (['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript', 'json'].includes(lang)) return JS_KW;
  if (['go', 'golang'].includes(lang)) return GO_KW;
  if (['py', 'python'].includes(lang)) return PY_KW;
  return new Set();
}

function highlightCodeLine(line: string, lineKey: number, keywords: Set<string>): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let k = lineKey * 1000;
  const n = line.length;
  let i = 0;
  const isWord = (c: string) => /[A-Za-z0-9_$]/.test(c);

  while (i < n) {
    const ch = line[i];
    // line comments
    if ((ch === '/' && line[i + 1] === '/') || ch === '#') {
      parts.push(span(C.comment, line.slice(i), k++));
      break;
    }
    // block comment fragment on this line
    if (ch === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2);
      const e = end === -1 ? n : end + 2;
      parts.push(span(C.comment, line.slice(i, e), k++));
      i = e;
      continue;
    }
    // strings
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < n && line[j] !== ch) { if (line[j] === '\\') j++; j++; }
      j = Math.min(j + 1, n);
      parts.push(span(C.string, line.slice(i, j), k++));
      i = j;
      continue;
    }
    // numbers (with optional unit suffix: 5m, 200ms, 5%)
    if (/[0-9]/.test(ch) && (i === 0 || !isWord(line[i - 1]))) {
      let j = i;
      while (j < n && /[0-9._]/.test(line[j])) j++;
      while (j < n && /[a-z%]/.test(line[j])) j++;
      parts.push(span(C.number, line.slice(i, j), k++));
      i = j;
      continue;
    }
    // identifiers
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < n && isWord(line[j])) j++;
      const word = line.slice(i, j);
      const next = line[j];
      if (keywords.has(word)) parts.push(span(C.instruction, word, k++, true));
      else if (LITERALS.has(word)) parts.push(span(C.literal, word, k++));
      else if (next === '(') parts.push(span(C.command, word, k++));
      else if (next === ':') parts.push(span(C.key, word, k++));
      else parts.push(<React.Fragment key={k++}>{word}</React.Fragment>);
      i = j;
      continue;
    }
    parts.push(<React.Fragment key={k++}>{ch}</React.Fragment>);
    i++;
  }
  return <React.Fragment key={lineKey}>{parts}</React.Fragment>;
}

// --- Public API ---------------------------------------------
export function highlight(code: string, lang?: string): React.ReactNode {
  try {
    const l = (lang || '').toLowerCase();
    let fn: (line: string, i: number) => React.ReactNode;
    if (l === 'yaml' || l === 'yml') fn = highlightYamlLine;
    else if (['bash', 'sh', 'shell', 'console', 'zsh'].includes(l)) fn = highlightBashLine;
    else if (['dockerfile', 'docker'].includes(l)) fn = highlightDockerfileLine;
    else {
      const kw = keywordsFor(l);
      fn = (line, i) => highlightCodeLine(line, i, kw);
    }

    const lines = code.replace(/\n$/, '').split('\n');
    const rendered = lines.map((line, i) => fn(line, i));
    return rendered.map((node, i) => (
      <React.Fragment key={i}>
        {node}
        {i < rendered.length - 1 ? '\n' : ''}
      </React.Fragment>
    ));
  } catch {
    // Defensive: never break rendering over a highlight failure
    return code;
  }
}

/** Best-effort language label/id from a code string when metadata is absent. */
export function detectLang(code: string, hint?: string): string {
  if (hint) return hint.toLowerCase();
  if (/^\s*(FROM|RUN|COPY|ENTRYPOINT)\s/m.test(code)) return 'dockerfile';
  if (/^\s*(apiVersion|kind|metadata|spec):/m.test(code)) return 'yaml';
  if (/\b(func|package)\s/.test(code)) return 'go';
  if (/\b(const|let|console|=>|function)\b/.test(code)) return 'javascript';
  if (/^\s*(kubectl|docker|helm|kind|cd|ls|cat|echo|curl)\b/m.test(code)) return 'bash';
  return 'code';
}
