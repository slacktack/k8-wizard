import AsciiRule from '../ui/AsciiRule';

export default function Preface() {
  return (
    <section className="section-padding" id="how-it-works">
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: 48,
          }}
          className="preface-grid"
        >
          {/* Eyebrow */}
          <div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.74rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--blueprint)',
              }}
            >
              How this works
            </p>
          </div>

          {/* Body */}
          <div
            style={{
              columnCount: 2,
              columnGap: 48,
              columnRule: '1px solid var(--rule-soft)',
              textAlign: 'justify',
              hyphens: 'auto',
            }}
            className="preface-body"
          >
            <p style={{ marginBottom: '1em' }}>
              <span
                style={{
                  float: 'left',
                  fontFamily: "'VT323', monospace",
                  fontSize: '4.2rem',
                  lineHeight: 0.9,
                  color: 'var(--blueprint)',
                  marginRight: 8,
                }}
              >
                T
              </span>
              his curriculum transforms you from a complete beginner into a
              mad-mad-K8-wizard — someone who not only understands containers
              and orchestration but can deploy, scale, monitor, and secure
              production-grade systems with confidence.
            </p>
            <p style={{ marginBottom: '1em' }}>
              We start with Docker fundamentals — building images, networking
              containers, composing multi-service stacks. Then we introduce
              Kubernetes via Kind (Kubernetes in Docker) and work through
              every major concept: Pods, Deployments, Services, ConfigMaps,
              Ingress, auto-scaling, persistent storage, monitoring, and
              production security.
            </p>
            <p style={{ marginBottom: '1em' }}>
              Each module is divided into bite-sized lessons with real
              commands you can run, YAML you can deploy, and architecture
              you can visualize. The K8 Playground lets you simulate
              kubectl commands in a terminal UI, and every lesson tracks
              your progress locally.
            </p>
            <p style={{ marginBottom: 0 }}>
              No fluff. No abstractions. Just the manual, the terminal, and
              your drive to learn. Let's ship.
            </p>
          </div>
        </div>

        <AsciiRule />
      </div>
    </section>
  );
}
