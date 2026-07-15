import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import CodeBlock from '../lesson/CodeBlock';
import YamlBlock from '../lesson/YamlBlock';
import CommandBlock from '../lesson/CommandBlock';

interface AppEntry {
  id: string;
  name: string;
  language: string;
  description: string;
  port: string;
  dockerfile: string;
  source: { filename: string; code: string; language: string }[];
  k8s: { filename: string; code: string }[];
  commands: { cmd: string; output?: string }[];
}

const APPS: AppEntry[] = [
  {
    id: 'simple-api',
    name: 'Simple API (Node.js/Express)',
    language: 'Node.js',
    description: 'A REST API with health checks (/health, /ready), graceful shutdown on SIGTERM, CPU stress endpoint for HPA demos, and env var injection. The perfect first app to containerize and deploy on K8s.',
    port: '3000',
    dockerfile: `# ─── BUILD ───
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# ─── RUNTIME ───
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app /app
USER appuser
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]`,
    source: [
      { filename: 'server.js', language: 'javascript', code: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || 'v1';

let requestCount = 0;
let ready = false;

// Health & Readiness probes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: VERSION });
});
app.get('/ready', (req, res) => {
  if (ready) return res.json({ status: 'ready' });
  res.status(503).json({ status: 'not ready' });
});

// API routes
app.get('/', (req, res) => {
  requestCount++;
  res.json({ message: \`Hello from \${VERSION}!\`, requestCount });
});
app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] });
});
app.get('/api/cpu-stress', (req, res) => {
  const end = Date.now() + parseInt(req.query.ms || '1000');
  while (Date.now() < end) Math.sqrt(Math.random() * 100000);
  res.json({ stressed: true });
});

// Graceful shutdown
const server = app.listen(PORT, () => {
  ready = true;
  console.log(\`API \${VERSION} on port \${PORT}\`);
});
process.on('SIGTERM', () => {
  ready = false;
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 25000);
});` },
    ],
    k8s: [
      { filename: 'k8s/deployment.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: demo
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: simple-api:v1
          ports:
            - containerPort: 3000
          env:
            - name: VERSION
              value: "v1"
            - name: NODE_ENV
              value: "production"
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "200m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-api
  namespace: demo
spec:
  selector:
    app: backend-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP` },
    ],
    commands: [
      { cmd: 'docker build -t simple-api:v1 apps/simple-api', output: '[+] Building 3.2s (12/12) FINISHED' },
      { cmd: 'kind load docker-image simple-api:v1 --name learn', output: 'Image: "simple-api:v1" loaded onto nodes: [learn-control-plane]' },
      { cmd: 'kubectl apply -f apps/simple-api/k8s/', output: 'namespace/demo created\\ndeployment.apps/backend-api created\\nservice/backend-api created' },
      { cmd: 'kubectl port-forward -n demo svc/backend-api 3000:80', output: 'Forwarding from 127.0.0.1:3000 -> 3000' },
      { cmd: 'curl http://localhost:3000/', output: '{"message":"Hello from v1!","requestCount":1,"hostname":"backend-api-7d8f9c-x3k2m"}' },
    ],
  },
  {
    id: 'go-api',
    name: 'Go API (Multi-stage, 15MB)',
    language: 'Go',
    description: 'The same API rewritten in Go with a multi-stage Dockerfile that produces a ~15MB image. Demonstrates cross-compilation, distroless runtime images, and Go\'s built-in HTTP server with graceful shutdown.',
    port: '3000',
    dockerfile: `# ─── BUILD ───
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /api

# ─── RUNTIME ───
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /api /api
EXPOSE 3000
ENTRYPOINT ["/api"]`,
    source: [
      { filename: 'main.go', language: 'go', code: `package main

import (
  "encoding/json"
  "fmt"
  "log"
  "net/http"
  "os"
  "os/signal"
  "syscall"
)

var ready bool

func main() {
  port := os.Getenv("PORT")
  if port == "" { port = "3000" }

  mux := http.NewServeMux()
  mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
  })
  mux.HandleFunc("GET /ready", func(w http.ResponseWriter, r *http.Request) {
    if ready { json.NewEncoder(w).Encode(map[string]string{"status": "ready"})
    } else { w.WriteHeader(503); json.NewEncoder(w).Encode(map[string]string{"status": "not ready"}) }
  })
  mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"message": "Hello from Go!"})
  })

  server := &http.Server{Addr: fmt.Sprintf(":%s", port), Handler: mux}
  go func() {
    sig := make(chan os.Signal, 1)
    signal.Notify(sig, syscall.SIGTERM)
    <-sig
    ready = false
    server.Close()
  }()
  ready = true
  log.Fatal(server.ListenAndServe())
}` },
    ],
    k8s: [
      { filename: 'k8s/deployment.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-api
  namespace: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: go-api
  template:
    metadata:
      labels:
        app: go-api
    spec:
      containers:
        - name: api
          image: go-api:v1
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "32Mi"
              cpu: "25m"
            limits:
              memory: "64Mi"
              cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: go-api
  namespace: demo
spec:
  selector:
    app: go-api
  ports:
    - port: 80
      targetPort: 3000` },
    ],
    commands: [
      { cmd: 'docker build -t go-api:v1 apps/go-api', output: '[+] Building 15.8s (10/10) FINISHED' },
      { cmd: 'docker images go-api:v1', output: 'go-api:v1   latest    a1b2c3d4e5f6   2 minutes ago   15.2MB' },
      { cmd: 'kind load docker-image go-api:v1 --name learn', output: 'Image loaded onto all nodes.' },
      { cmd: 'kubectl apply -f apps/go-api/k8s/', output: 'deployment.apps/go-api created\\nservice/go-api created' },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend (Node.js Web UI)',
    language: 'Node.js',
    description: 'A minimal web UI that serves a landing page and proxies API calls. Shows how frontend+backend communicate via K8s DNS (service discovery). Includes Nginx-style architecture but implemented in plain Node.js.',
    port: '8080',
    dockerfile: `FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]`,
    source: [
      { filename: 'server.js', language: 'javascript', code: `const express = require('express');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 8080;
const API_HOST = process.env.API_HOST || 'backend-api.demo.svc.cluster.local';

app.use(express.static(__dirname + '/'));

app.get('/api/proxy/health', (req, res) => {
  const reqHttp = http.get(\`http://\${API_HOST}/health\`, apiRes => {
    let data = '';
    apiRes.on('data', c => data += c);
    apiRes.on('end', () => res.json(JSON.parse(data)));
  });
  reqHttp.on('error', () => res.status(502).json({ error: 'API unreachable' }));
});

app.listen(PORT, () => console.log(\`Frontend on :\${PORT}\`));` },
    ],
    k8s: [
      { filename: 'k8s/deployment.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: frontend:v1
          ports:
            - containerPort: 8080
          env:
            - name: API_HOST
              value: "backend-api.demo.svc.cluster.local"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: demo
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP` },
    ],
    commands: [
      { cmd: 'docker build -t frontend:v1 apps/frontend', output: '[+] Building 2.1s (7/7) FINISHED' },
      { cmd: 'kind load docker-image frontend:v1 --name learn', output: 'Image loaded onto all nodes.' },
      { cmd: 'kubectl apply -f apps/frontend/k8s/', output: 'deployment.apps/frontend created\\nservice/frontend created' },
      { cmd: 'kubectl port-forward -n demo svc/frontend 8080:80', output: 'Forwarding from 127.0.0.1:8080 -> 8080' },
    ],
  },
];

export default function AppsPage() {
  const [activeApp, setActiveApp] = useState(APPS[0].id);

  const app = APPS.find(a => a.id === activeApp) || APPS[0];

  return (
    <>
      <Header />
      <main id="main" style={{ paddingTop: 64 }}>
        <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link to="/" style={{ color: 'var(--blueprint)', textDecoration: 'none' }}>← Home</Link>
            <span style={{ color: 'var(--ink-mute)' }}>/</span>
            <span style={{ color: 'var(--ink-mute)' }}>Apps</span>
          </div>

          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--ink)', marginBottom: 8, lineHeight: 1.05 }}>
            Example Applications
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 32 }}>
            Production-grade apps to build, containerize, and deploy on your Kind cluster
          </p>

          {/* App selector tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--rule)' }}>
            {APPS.map(a => (
              <button
                key={a.id}
                onClick={() => setActiveApp(a.id)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: `2px solid ${activeApp === a.id ? 'var(--blueprint)' : 'transparent'}`,
                  background: 'transparent',
                  color: activeApp === a.id ? 'var(--blueprint)' : 'var(--ink-mute)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: activeApp === a.id ? 600 : 400,
                  transition: 'color 0.12s, border-color 0.12s',
                }}
              >
                {a.name.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* App metadata */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)' }}>
            <span>Language: <strong style={{ color: 'var(--ink)' }}>{app.language}</strong></span>
            <span>Port: <strong style={{ color: 'var(--ink)' }}>{app.port}</strong></span>
            <span>Image size: <strong style={{ color: 'var(--ink)' }}>{app.id === 'go-api' ? '~15MB' : '~180MB'}</strong></span>
          </div>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 32 }}>
            {app.description}
          </p>

          {/* Dockerfile */}
          <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginBottom: 12 }}>Dockerfile</h2>
          <CodeBlock code={app.dockerfile} language="dockerfile" />

          {/* Source code */}
          {app.source.map(s => (
            <div key={s.filename}>
              <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginTop: 28, marginBottom: 12 }}>Source: {s.filename}</h2>
              <CodeBlock code={s.code} language={s.language} />
            </div>
          ))}

          {/* K8s manifests */}
          <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginTop: 28, marginBottom: 12 }}>Kubernetes Deployment</h2>
          {app.k8s.map(k => (
            <YamlBlock key={k.filename} filename={k.filename} code={k.code} />
          ))}

          {/* Commands */}
          <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.3rem', color: 'var(--blueprint)', marginTop: 28, marginBottom: 12 }}>Build & Deploy</h2>
          {app.commands.map((c, i) => (
            <CommandBlock key={i} prompt="$" cmd={c.cmd} output={c.output} />
          ))}

          {/* Phase link */}
          <div style={{ marginTop: 32, padding: '16px 20px', border: '1px solid var(--blueprint-tint-strong)', background: 'var(--blueprint-tint)' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--ink)' }}>
              📖 This app is part of the <Link to="/phase/03-deploying-backends" style={{ color: 'var(--blueprint)', textDecoration: 'underline' }}>Deploying Backends</Link> module.
              Learn about deployment strategies, health probes, and graceful shutdown.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
