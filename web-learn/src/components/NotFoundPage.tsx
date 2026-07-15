import { Link } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Button from './ui/Button';

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main id="main" style={{ paddingTop: 64 }}>
        <div style={{ padding: '120px 32px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(4rem, 10vw, 8rem)', color: 'var(--blueprint)', marginBottom: 8, lineHeight: 1 }}>
            404
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 24 }}>
            Page not found
          </p>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '1rem', color: 'var(--ink-soft)', marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
            This route doesn't exist in the K8 Wizard curriculum. Let's get you back on track.
          </p>
          <Link to="/">
            <Button variant="primary">Back to Curriculum</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
