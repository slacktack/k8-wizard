import type { Element } from './types';

/* ============================================================
   Guided Tutorials — step-by-step system design walkthroughs
   that auto-populate the canvas with components and connections.
   ============================================================ */

export interface TutorialStep {
  title: string;
  description: string;
  elements: Element[];
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  steps: TutorialStep[];
}

let idCounter = 0;
function uid(): string {
  idCounter += 1;
  return `t_${Date.now().toString(36)}_${idCounter}`;
}

const STROKE_BLUEPRINT = '#3553ff';
const STROKE_CYAN = '#00d4aa';
const STROKE_GREEN = '#3fb950';
const STROKE_ORANGE = '#d29922';
const STROKE_MAGENTA = '#c678dd';

export const TUTORIALS: Tutorial[] = [
  {
    id: 'three-tier',
    name: '3-Tier Web Application',
    description: 'Build a classic three-tier architecture: browser → API → database. This is the foundation of most web applications.',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Client Tier',
        description: 'Place a Browser component that represents the user-facing client.',
        elements: [
          { id: uid(), type: 'rectangle', x: 320, y: 40, width: 140, height: 56, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Browser' },
        ],
      },
      {
        title: 'Edge Tier',
        description: 'Add a CDN and Load Balancer to handle traffic at the edge. The CDN caches static assets; the LB distributes requests.',
        elements: [
          { id: uid(), type: 'rectangle', x: 320, y: 40, width: 140, height: 56, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Browser' },
          { id: uid(), type: 'rectangle', x: 120, y: 160, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'CDN' },
          { id: uid(), type: 'rectangle', x: 480, y: 160, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Load Balancer' },
          { id: uid(), type: 'arrow', x: 390, y: 96, width: -160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 390, y: 96, width: 160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        ],
      },
      {
        title: 'Application Tier',
        description: 'Deploy the frontend and API services. Each runs as a stateless workload behind its own ClusterIP Service.',
        elements: [
          { id: uid(), type: 'rectangle', x: 320, y: 40, width: 140, height: 56, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Browser' },
          { id: uid(), type: 'rectangle', x: 120, y: 160, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'CDN' },
          { id: uid(), type: 'rectangle', x: 480, y: 160, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Load Balancer' },
          { id: uid(), type: 'rectangle', x: 100, y: 300, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Frontend' },
          { id: uid(), type: 'rectangle', x: 500, y: 300, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'API Service' },
          { id: uid(), type: 'arrow', x: 190, y: 216, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 550, y: 216, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 330, y: 96, width: -160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 330, y: 96, width: 200, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        ],
      },
      {
        title: 'Data Tier',
        description: 'Add the database layer. The API talks to PostgreSQL. In Kubernetes, this would be a StatefulSet with a PVC.',
        elements: [
          { id: uid(), type: 'rectangle', x: 320, y: 40, width: 140, height: 56, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Browser' },
          { id: uid(), type: 'rectangle', x: 120, y: 160, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'CDN' },
          { id: uid(), type: 'rectangle', x: 480, y: 160, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Load Balancer' },
          { id: uid(), type: 'rectangle', x: 100, y: 300, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Frontend' },
          { id: uid(), type: 'rectangle', x: 500, y: 300, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'API Service' },
          { id: uid(), type: 'rectangle', x: 280, y: 440, width: 180, height: 56, stroke: STROKE_ORANGE, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'PostgreSQL' },
          { id: uid(), type: 'arrow', x: 570, y: 356, width: -230, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 190, y: 216, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 550, y: 216, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 330, y: 96, width: -160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 330, y: 96, width: 200, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        ],
      },
    ],
  },
  {
    id: 'microservices',
    name: 'Microservices with Gateway',
    description: 'Design a microservices architecture with an API Gateway, multiple services, and per-service databases.',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Edge & Gateway',
        description: 'Start with an API Gateway that handles auth, rate limiting, and routing to backend services.',
        elements: [
          { id: uid(), type: 'rectangle', x: 280, y: 20, width: 140, height: 50, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Client' },
          { id: uid(), type: 'rectangle', x: 280, y: 120, width: 160, height: 56, stroke: STROKE_MAGENTA, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'API Gateway' },
          { id: uid(), type: 'arrow', x: 350, y: 70, width: 0, height: 50, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        ],
      },
      {
        title: 'Core Services',
        description: 'Add Order, Payment, and Catalog services. Each is a separate Deployment with its own Service.',
        elements: [
          { id: uid(), type: 'rectangle', x: 280, y: 20, width: 140, height: 50, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Client' },
          { id: uid(), type: 'rectangle', x: 280, y: 120, width: 160, height: 56, stroke: STROKE_MAGENTA, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'API Gateway' },
          { id: uid(), type: 'rectangle', x: 60, y: 260, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Catalog Svc' },
          { id: uid(), type: 'rectangle', x: 260, y: 260, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Order Svc' },
          { id: uid(), type: 'rectangle', x: 460, y: 260, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Payment Svc' },
          { id: uid(), type: 'line', x: 360, y: 176, width: -210, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
          { id: uid(), type: 'line', x: 360, y: 176, width: -60, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
          { id: uid(), type: 'line', x: 360, y: 176, width: 140, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
        ],
      },
      {
        title: 'Data Stores',
        description: 'Each service owns its own data store. This is a key microservices pattern — no shared databases.',
        elements: [
          { id: uid(), type: 'rectangle', x: 280, y: 20, width: 140, height: 50, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Client' },
          { id: uid(), type: 'rectangle', x: 280, y: 120, width: 160, height: 56, stroke: STROKE_MAGENTA, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'API Gateway' },
          { id: uid(), type: 'rectangle', x: 60, y: 260, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Catalog Svc' },
          { id: uid(), type: 'rectangle', x: 260, y: 260, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Order Svc' },
          { id: uid(), type: 'rectangle', x: 460, y: 260, width: 140, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Payment Svc' },
          { id: uid(), type: 'rectangle', x: 60, y: 400, width: 140, height: 56, stroke: STROKE_ORANGE, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'PostgreSQL' },
          { id: uid(), type: 'rectangle', x: 260, y: 400, width: 140, height: 56, stroke: STROKE_ORANGE, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'PostgreSQL' },
          { id: uid(), type: 'rectangle', x: 460, y: 400, width: 140, height: 56, stroke: STROKE_ORANGE, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Redis' },
          { id: uid(), type: 'line', x: 360, y: 176, width: -210, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
          { id: uid(), type: 'line', x: 360, y: 176, width: -60, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
          { id: uid(), type: 'line', x: 360, y: 176, width: 140, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
          { id: uid(), type: 'arrow', x: 130, y: 316, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
          { id: uid(), type: 'arrow', x: 330, y: 316, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
          { id: uid(), type: 'arrow', x: 530, y: 316, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.5 },
        ],
      },
    ],
  },
  {
    id: 'k8-deployment',
    name: 'Kubernetes Production Deployment',
    description: 'Map a real production K8s deployment: Ingress → Service → Deployment → HPA → PersistentVolume → Monitoring.',
    difficulty: 'advanced',
    steps: [
      {
        title: 'Networking Layer',
        description: 'Start with the Ingress controller routing traffic to a Service.',
        elements: [
          { id: uid(), type: 'rectangle', x: 120, y: 20, width: 140, height: 50, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Internet' },
          { id: uid(), type: 'rectangle', x: 120, y: 120, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Ingress' },
          { id: uid(), type: 'rectangle', x: 120, y: 240, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Service' },
          { id: uid(), type: 'arrow', x: 190, y: 70, width: 0, height: 50, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 190, y: 176, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        ],
      },
      {
        title: 'Workload Layer',
        description: 'Add the Deployment: 3 replicas, resource limits, health probes, and a ConfigMap.',
        elements: [
          { id: uid(), type: 'rectangle', x: 120, y: 20, width: 140, height: 50, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Internet' },
          { id: uid(), type: 'rectangle', x: 120, y: 120, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Ingress' },
          { id: uid(), type: 'rectangle', x: 120, y: 240, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Service (ClusterIP)' },
          { id: uid(), type: 'rectangle', x: 120, y: 360, width: 160, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Deployment ×3' },
          { id: uid(), type: 'rectangle', x: 380, y: 360, width: 120, height: 50, stroke: STROKE_MAGENTA, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'ConfigMap' },
          { id: uid(), type: 'arrow', x: 190, y: 70, width: 0, height: 50, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 190, y: 176, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 190, y: 296, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'line', x: 280, y: 388, width: 100, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4, strokeDasharray: '4 3' },
        ],
      },
      {
        title: 'Autoscaling & Monitoring',
        description: 'Complete the architecture with HPA for autoscaling, Prometheus for monitoring, and a PVC for persistent storage.',
        elements: [
          { id: uid(), type: 'rectangle', x: 120, y: 20, width: 140, height: 50, stroke: STROKE_BLUEPRINT, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Internet' },
          { id: uid(), type: 'rectangle', x: 120, y: 120, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Ingress' },
          { id: uid(), type: 'rectangle', x: 120, y: 240, width: 140, height: 56, stroke: STROKE_CYAN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Service' },
          { id: uid(), type: 'rectangle', x: 120, y: 360, width: 160, height: 56, stroke: STROKE_GREEN, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Deployment ×5' },
          { id: uid(), type: 'rectangle', x: 380, y: 360, width: 120, height: 50, stroke: STROKE_MAGENTA, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'ConfigMap' },
          { id: uid(), type: 'rectangle', x: 400, y: 240, width: 100, height: 50, stroke: STROKE_ORANGE, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'HPA' },
          { id: uid(), type: 'rectangle', x: 120, y: 480, width: 140, height: 56, stroke: STROKE_ORANGE, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'PVC → PV' },
          { id: uid(), type: 'rectangle', x: 400, y: 480, width: 100, height: 50, stroke: STROKE_MAGENTA, fill: 'transparent', strokeWidth: 2, opacity: 0.8, label: 'Prometheus' },
          { id: uid(), type: 'arrow', x: 190, y: 70, width: 0, height: 50, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 190, y: 176, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 190, y: 296, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'arrow', x: 190, y: 416, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
          { id: uid(), type: 'line', x: 280, y: 388, width: 100, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
          { id: uid(), type: 'line', x: 450, y: 290, width: 0, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
          { id: uid(), type: 'line', x: 450, y: 480, width: -220, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
        ],
      },
    ],
  },
];
