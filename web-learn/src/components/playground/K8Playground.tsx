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
  { id: 1, title: 'Create Cluster', cmd: 'kind create cluster --name learn', output: ['Creating cluster "learn" ...', ' ✓ Ensuring node image', ' ✓ Preparing nodes', ' ✓ Starting control-plane', ' ✓ Installing CNI', ' ✓ Installing StorageClass', 'Set kubectl context to "kind-learn"'] },
  { id: 2, title: 'Check Nodes', cmd: 'kubectl get nodes', output: ['NAME                   STATUS   ROLES           AGE', 'learn-control-plane    Ready    control-plane   2m', 'learn-worker          Ready    <none>          2m', 'learn-worker2         Ready    <none>          2m', 'learn-worker3         Ready    <none>          2m'] },
  { id: 3, title: 'Check Cluster Info', cmd: 'kubectl cluster-info', output: ['Kubernetes control plane is running at https://127.0.0.1:6443', 'CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy'] },
  { id: 4, title: 'Create Namespace', cmd: 'kubectl create namespace demo', output: ['namespace/demo created'] },
  { id: 5, title: 'Deploy App', cmd: 'kubectl create deployment web --image=nginx:alpine --replicas=3 -n demo', output: ['deployment.apps/web created'] },
  { id: 6, title: 'Check Pods', cmd: 'kubectl get pods -n demo', output: ['NAME                   READY   STATUS    RESTARTS   AGE', 'web-7d8f9c-x3k2m      1/1     Running   0          10s', 'web-7d8f9c-x3k2n      1/1     Running   0          10s', 'web-7d8f9c-x3k2o      1/1     Running   0          10s'] },
  { id: 7, title: 'Expose Service', cmd: 'kubectl expose deployment web --port=80 --target-port=80 --type=ClusterIP -n demo', output: ['service/web exposed'] },
  { id: 8, title: 'Check All Resources', cmd: 'kubectl get all -n demo', output: ['NAME                       READY   STATUS    RESTARTS   AGE', 'pod/web-7d8f9c-x3k2m      1/1     Running   0          30s', 'pod/web-7d8f9c-x3k2n      1/1     Running   0          30s', 'pod/web-7d8f9c-x3k2o      1/1     Running   0          30s', '', 'NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)', 'service/web               ClusterIP   10.96.123.45    <none>        80/TCP', '', 'NAME                       READY   UP-TO-DATE   AVAILABLE   AGE', 'deployment.apps/web       3/3     3            3           45s'] },
  { id: 9, title: 'Port-Forward', cmd: 'kubectl port-forward svc/web 8080:80 -n demo', output: ['Forwarding from 127.0.0.1:8080 -> 80', 'Forwarding from [::1]:8080 -> 80', 'Handling connection for 80'] },
  { id: 10, title: 'Scale Up', cmd: 'kubectl scale deployment web --replicas=5 -n demo', output: ['deployment.apps/web scaled'] },
  { id: 11, title: 'Verify Scale', cmd: 'kubectl get pods -n demo', output: ['NAME                   READY   STATUS    RESTARTS   AGE', 'web-7d8f9c-x3k2m      1/1     Running   0          2m', 'web-7d8f9c-x3k2n      1/1     Running   0          2m', 'web-7d8f9c-x3k2o      1/1     Running   0          2m', 'web-7d8f9c-x3k2p      1/1     Running   0          15s', 'web-7d8f9c-x3k2q      1/1     Running   0          15s'] },
  { id: 12, title: 'Rolling Update', cmd: 'kubectl set image deployment/web web=nginx:1.25-alpine -n demo', output: ['deployment.apps/web image updated'] },
  { id: 13, title: 'Check Rollout', cmd: 'kubectl rollout status deployment/web -n demo', output: ['Waiting for deployment "web" rollout to finish: 2 of 5 updated replicas are available...', 'Waiting for deployment "web" rollout to finish: 3 of 5 updated replicas are available...', 'Waiting for deployment "web" rollout to finish: 4 of 5 updated replicas are available...', 'deployment "web" successfully rolled out'] },
  { id: 14, title: 'Rollback', cmd: 'kubectl rollout undo deployment/web -n demo', output: ['deployment.apps/web rolled back'] },
  { id: 15, title: 'Clean Up', cmd: 'kubectl delete namespace demo', output: ['namespace "demo" deleted'] },
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
          Terminal UI · TUI Panels · 15-Step K8 Lifecycle
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 24,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule)',
            padding: 24,
          }}
          className="playground-grid"
        >
          {/* Terminal Area */}
          <div style={{ minHeight: 400 }}>
            <TerminalArea lines={terminalLines} currentStep={PLAYGROUND_STEPS[Math.min(currentStep, PLAYGROUND_STEPS.length - 1)]} />
          </div>

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
