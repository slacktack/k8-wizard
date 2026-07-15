import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: '120px 32px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: '3rem', marginBottom: 16, color: 'var(--blueprint)' }}>
            Something went wrong
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Link
            to="/"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '10px 20px',
              border: '1px solid var(--blueprint)',
              background: 'var(--blueprint)',
              color: 'var(--bg)',
              textDecoration: 'none',
            }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Back to Home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
