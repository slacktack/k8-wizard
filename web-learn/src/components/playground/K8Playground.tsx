import { useState, useCallback } from 'react';
import TerminalArea from './TerminalArea';
import TUISidebar from './TUISidebar';

interface PlaygroundStep {
  id: number;
  title: string;
  cmd: string;
  output: string[];
}

const PLAYGROUND_STEPS: PlaygroundStep[] = [
  { id: 1, title: 'Check Cluster', cmd: 'kubectl get nodes', output: ['NAME                   STATUS   ROLES           AGE', 'kind-control-plane    Ready    control-plane   5m', 'kind-worker           Ready    <none>          5m', 'kind-worker2          Ready    <none>          5m'] },
  { id: 2, title: 'List Pods', cmd: 'kubectl get pods', output: ['No resources found in default namespace.'] },
  { id: 3, title: 'Deploy App', cmd: 'kubectl create deployment web --image=nginx:alpine --replicas=3', output: ['deployment.apps/web created'] },
  { id: 4, title: 'Expose Service', cmd: 'kubectl expose deployment web --port=80 --target-port=80 --type=ClusterIP', output: ['service/web exposed'] },
  { id: 5, title: 'Check Status', cmd: 'kubectl get all', output: ['NAME                       READY   STATUS    RESTARTS   AGE', 'pod/web-7d8f9c-x3k2m      1/1     Running   0          30s', 'pod/web-7d8f9c-x3k2n      1/1     Running   0          30s', 'pod/web-7d8f9c-x3k2o      1/1     Running   0          30s', '', 'NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)', 'service/web               ClusterIP   10.96.123.45    <none>        80/TCP', '', 'NAME                       READY   UP-TO-DATE   AVAILABLE   AGE', 'deployment.apps/web       3/3     3            3           45s'] },
  { id: 6, title: 'Scale Up', cmd: 'kubectl scale deployment web --replicas=5', output: ['deployment.apps/web scaled'] },
];

export default function K8Playground() {
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalLines, setTerminalLines] = useState<{ cmd: string; output: string[] }[]>([]);

  const runStep = useCallback(() => {
    if (currentStep >= PLAYGROUND_STEPS.length) return;
    const step = PLAYGROUND_STEPS[currentStep];
    setTerminalLines(prev => [...prev, { cmd: step.cmd, output: step.output }]);
    setCurrentStep(prev => prev + 1);
  }, [currentStep]);

  const resetPlayground = useCallback(() => {
    setCurrentStep(0);
    setTerminalLines([]);
  }, []);

  const allSteps = PLAYGROUND_STEPS.map(s => ({
    id: s.id,
    title: s.title,
    done: s.id <= currentStep,
    current: s.id === currentStep + 1,
  }));

  return (
    <section className="section-padding" id="playground">
      <div className="container">
        <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--blueprint)', marginBottom: 8 }}>
          K8 Playground
        </h2>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 32 }}>
          Terminal UI · TUI Panels · Live Commands
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 24,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule-soft)',
            padding: 24,
          }}
          className="playground-grid"
        >
          {/* Terminal Area */}
          <div style={{ minHeight: 400 }}>
            <TerminalArea lines={terminalLines} currentStep={PLAYGROUND_STEPS[Math.min(currentStep, PLAYGROUND_STEPS.length - 1)]} />
          </div>

          {/* TUI Sidebar */}
          <TUISidebar
            steps={allSteps}
            onRun={runStep}
            onReset={resetPlayground}
            canRun={currentStep < PLAYGROUND_STEPS.length}
          />
        </div>
      </div>
    </section>
  );
}
