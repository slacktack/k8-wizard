import type { Lesson } from '../types/curriculum';

export const LESSONS: Record<string, Lesson> = {
  // ================================================================
  // PHASE 01 — Docker Basics
  // ================================================================
  '01-01-core-concepts': {
    id: '01-01-core-concepts',
    phaseId: '01-docker-basics',
    number: 1,
    title: 'Core Concepts',
    type: 'learn',
    difficulty: 'beginner',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'Docker packages your application and its dependencies into a container image — a single portable artifact that runs identically on your laptop, your coworker\'s machine, a server, or the cloud.' },
      { type: 'heading', level: 2, text: 'Image vs Container' },
      { type: 'table', headers: ['Concept', 'What it is'], rows: [
        ['Image', 'A read-only template with instructions to create a container. Like a class in OOP.'],
        ['Container', 'A running instance of an image. Like an object — it has state, filesystem, network.'],
        ['Dockerfile', 'A recipe that defines how to build an image.'],
        ['Registry', 'Where images are stored (Docker Hub, GHCR, ECR, etc.)'],
        ['Docker daemon', 'The background process that builds, runs, and manages containers.'],
      ]},
      { type: 'heading', level: 3, text: 'Analogy' },
      { type: 'diagram', lines: [
        'Dockerfile  ----build-->  Image  ----run-->  Container(s)',
        '  (recipe)              (class)          (running instances)',
        '',
        'Image = frozen snapshot of your app + OS layer',
        'Container = that snapshot, running with its own filesystem/network',
      ]},
    ],
    commands: ['docker build -t', 'docker run -d -p', 'docker ps', 'docker logs', 'docker exec -it', 'docker stop', 'docker rm'],
  },

  '01-02-your-first-dockerfile': {
    id: '01-02-your-first-dockerfile',
    phaseId: '01-docker-basics',
    number: 2,
    title: 'Your First Dockerfile',
    type: 'build',
    difficulty: 'beginner',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Create a file called Dockerfile in an empty directory. This file describes how to build your container image.' },
      { type: 'yaml', filename: 'Dockerfile', code: `FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]` },
      { type: 'heading', level: 3, text: 'Build and Run' },
      { type: 'command', prompt: '$', cmd: 'docker build -t my-app:v1 .', output: '[+] Building 2.3s (9/9) FINISHED' },
      { type: 'command', prompt: '$', cmd: 'docker run -d -p 3000:3000 --name my-container my-app:v1', output: 'abc123def456...' },
      { type: 'command', prompt: '$', cmd: 'docker ps', output: 'CONTAINER ID   IMAGE        STATUS         PORTS                    NAMES\nabc123de       my-app:v1    Up 2 minutes   0.0.0.0:3000->3000/tcp   my-container' },
      { type: 'command', prompt: '$', cmd: 'docker logs my-container', output: 'Server running on port 3000' },
      { type: 'command', prompt: '$', cmd: 'docker exec -it my-container sh' },
      { type: 'command', prompt: '$', cmd: 'docker stop my-container && docker rm my-container' },
    ],
    commands: ['docker build -t', 'docker run -d -p', 'docker ps', 'docker logs', 'docker exec -it', 'docker stop', 'docker rm'],
  },

  '01-03-instruction-set': {
    id: '01-03-instruction-set',
    phaseId: '01-docker-basics',
    number: 3,
    title: 'The Dockerfile Instruction Set',
    type: 'learn',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Every Dockerfile instruction has a specific purpose. Here\'s the complete set you\'ll use day-to-day.' },
      { type: 'code', language: 'dockerfile', code: `FROM        # Base image to start from (alpine, ubuntu, node, python, etc.)
WORKDIR     # Set working directory for subsequent instructions
COPY        # Copy files from host into image
ADD         # Like COPY but supports URLs and auto-extract tar.gz
RUN         # Execute a command during build (e.g. apt-get install)
CMD         # Default command when container starts (can be overridden)
ENTRYPOINT  # Like CMD but harder to override (the main executable)
ENV         # Set environment variables
ARG         # Build-time variables
EXPOSE      # Document which port the app listens on
VOLUME      # Create a mount point for persistent data
LABEL       # Add metadata (maintainer, version, etc.)
HEALTHCHECK # Define how Docker checks if container is healthy` },
      { type: 'heading', level: 3, text: 'CMD vs ENTRYPOINT' },
      { type: 'yaml', filename: 'Dockerfile', code: `# CMD is the default — can be overridden with \`docker run my-app bash\`
CMD ["node", "server.js"]

# ENTRYPOINT + CMD = executable + default args
ENTRYPOINT ["node"]
CMD ["server.js"]   # \`docker run my-app\` runs "node server.js"
                    # \`docker run my-app app.js\` runs "node app.js"` },
    ],
    commands: [],
  },

  '01-04-multi-stage-builds': {
    id: '01-04-multi-stage-builds',
    phaseId: '01-docker-basics',
    number: 4,
    title: 'Multi-Stage Builds',
    type: 'build',
    difficulty: 'beginner',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'The golden pattern for production images: build in one stage, copy artifacts to a minimal runtime stage. This drops image size from ~1GB to ~15MB.' },
      { type: 'yaml', filename: 'Dockerfile', code: `# --- BUILD STAGE ---
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

# --- RUNTIME STAGE ---
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]` },
      { type: 'text', body: 'The final image is just alpine + the compiled binary — no Go compiler, no source code.' },
    ],
    commands: ['docker build -t', 'docker images'],
  },

  '01-05-networking': {
    id: '01-05-networking',
    phaseId: '01-docker-basics',
    number: 5,
    title: 'Docker Networking',
    type: 'learn',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Containers need to talk to each other and the outside world. Docker networking provides several driver options.' },
      { type: 'command', prompt: '$', cmd: 'docker network ls', output: 'NETWORK ID   NAME         DRIVER   SCOPE\nabc123       bridge       bridge   local\ndef456       host         host     local\n...' },
      { type: 'command', prompt: '$', cmd: 'docker network create my-network', output: 'xyz789' },
      { type: 'command', prompt: '$', cmd: 'docker run -d --network my-network --name api my-api:v1' },
      { type: 'command', prompt: '$', cmd: 'docker run -d -p 80:80 --network my-network --name web my-web:v1' },
      { type: 'text', body: 'Containers on the same network can resolve each other by DNS name.' },
      { type: 'table', headers: ['Driver', 'Use Case'], rows: [
        ['bridge', 'Default. Isolated network for containers on same host.'],
        ['host', 'No network isolation — container uses host\'s network stack.'],
        ['overlay', 'Multi-host networking (Swarm, K8s).'],
        ['none', 'No networking at all.'],
      ]},
    ],
    commands: ['docker network ls', 'docker network create', 'docker run --network'],
  },

  '01-06-volumes': {
    id: '01-06-volumes',
    phaseId: '01-docker-basics',
    number: 6,
    title: 'Volumes & Persistent Data',
    type: 'learn',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Containers are ephemeral — when you delete one, its filesystem is gone. Volumes persist data outside the container.' },
      { type: 'command', prompt: '$', cmd: 'docker volume create my-data' },
      { type: 'command', prompt: '$', cmd: 'docker run -d -v my-data:/app/data my-app' },
      { type: 'command', prompt: '$', cmd: 'docker run -d -v $(pwd)/data:/app/data my-app' },
      { type: 'command', prompt: '$', cmd: 'docker run -d --tmpfs /app/tmp my-app' },
      { type: 'heading', level: 3, text: 'Best Practices' },
      { type: 'table', headers: ['Use Case', 'Recommended Type'], rows: [
        ['Persistent data (DBs, uploads)', 'Named volumes'],
        ['Development (live code reload)', 'Bind mounts'],
        ['Secrets or cache', 'tmpfs (in-memory)'],
      ]},
    ],
    commands: ['docker volume create', 'docker run -v', 'docker run --tmpfs'],
  },

  '01-07-docker-compose': {
    id: '01-07-docker-compose',
    phaseId: '01-docker-basics',
    number: 7,
    title: 'Docker Compose',
    type: 'build',
    difficulty: 'beginner',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Docker Compose lets you define and run multi-service applications from a single YAML file.' },
      { type: 'yaml', filename: 'docker-compose.yml', code: `version: "3.9"

services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp

volumes:
  pgdata:` },
      { type: 'command', prompt: '$', cmd: 'docker compose up -d', output: '[+] Running 3/3\n ✔ Container api  Started\n ✔ Container db   Started' },
      { type: 'command', prompt: '$', cmd: 'docker compose logs -f', output: 'api  | Server running on port 3000\ndb   | LOG:  database system is ready to accept connections' },
      { type: 'command', prompt: '$', cmd: 'docker compose up -d --scale api=3' },
      { type: 'command', prompt: '$', cmd: 'docker compose down -v' },
    ],
    commands: ['docker compose up -d', 'docker compose logs', 'docker compose down'],
  },

  '01-08-best-practices': {
    id: '01-08-best-practices',
    phaseId: '01-docker-basics',
    number: 8,
    title: 'Docker Best Practices',
    type: 'learn',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'heading', level: 2, text: 'Image Optimization' },
      { type: 'yaml', filename: '.dockerignore', code: `node_modules
.git
*.md
.env` },
      { type: 'yaml', filename: 'Dockerfile', code: `# GOOD: Specific tags over 'latest'
FROM node:20-alpine

# GOOD: Layer ordering for cache (least-changed first)
COPY package*.json ./
RUN npm ci
COPY . .

# GOOD: Combine RUN commands to reduce layers
RUN apt-get update && \\
    apt-get install -y --no-install-recommends curl && \\
    rm -rf /var/lib/apt/lists/*

# GOOD: Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# GOOD: Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1` },
      { type: 'heading', level: 3, text: 'Running Containers' },
      { type: 'command', prompt: '$', cmd: 'docker run --rm -p 3000:3000 my-app' },
      { type: 'command', prompt: '$', cmd: 'docker run -d --memory="256m" --cpus="0.5" my-app' },
      { type: 'command', prompt: '$', cmd: 'docker run --user 1000:1000 my-app' },
    ],
    commands: ['docker run --rm', 'docker run --memory', 'docker run --user'],
  },

  '01-09-cheat-sheet': {
    id: '01-09-cheat-sheet',
    phaseId: '01-docker-basics',
    number: 9,
    title: 'Common Commands Cheat Sheet',
    type: 'learn',
    difficulty: 'beginner',
    duration: '5 min',
    sections: [
      { type: 'text', body: 'Quick reference for the most common Docker commands.' },
      { type: 'command', prompt: '$', cmd: 'docker build -t name:tag .', output: 'Build an image from a Dockerfile' },
      { type: 'command', prompt: '$', cmd: 'docker images', output: 'List all images' },
      { type: 'command', prompt: '$', cmd: 'docker rmi name:tag', output: 'Remove an image' },
      { type: 'command', prompt: '$', cmd: 'docker ps', output: 'List running containers' },
      { type: 'command', prompt: '$', cmd: 'docker ps -a', output: 'List all containers (including stopped)' },
      { type: 'command', prompt: '$', cmd: 'docker logs -f container-name', output: 'Follow container logs' },
      { type: 'command', prompt: '$', cmd: 'docker exec -it container sh', output: 'Shell into a running container' },
      { type: 'command', prompt: '$', cmd: 'docker cp file.txt container:/', output: 'Copy file to container' },
      { type: 'command', prompt: '$', cmd: 'docker stats', output: 'Live resource usage of containers' },
      { type: 'command', prompt: '$', cmd: 'docker system prune -a', output: 'Clean everything unused (images, containers, networks)' },
    ],
    commands: ['docker build', 'docker images', 'docker rmi', 'docker ps', 'docker logs', 'docker exec', 'docker cp', 'docker stats', 'docker system prune'],
  },

  // ================================================================
  // PHASE 02 — Kubernetes Basics
  // ================================================================
  '02-01-problem-k8s-solves': {
    id: '02-01-problem-k8s-solves',
    phaseId: '02-kubernetes-basics',
    number: 1,
    title: 'The Problem Kubernetes Solves',
    type: 'learn',
    difficulty: 'beginner',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'Without Kubernetes, running containers in production means manually SSH-ing into servers to restart crashed containers, figuring out which server has free capacity, copy-pasting environment variables everywhere, relying on bash scripts you don\'t trust for zero-downtime deploys, and accepting that one server going down takes your app down.' },
      { type: 'text', body: 'With Kubernetes, you declare what you want: "Run 3 replicas of my-api on port 3000, with 256MB RAM each, expose it on a stable IP, and if one crashes, create a replacement." Kubernetes makes that happen. It\'s an operating system for your cluster.' },
    ],
    commands: [],
  },

  '02-02-what-is-kind': {
    id: '02-02-what-is-kind',
    phaseId: '02-kubernetes-basics',
    number: 2,
    title: 'What is Kind?',
    type: 'learn',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Kind = Kubernetes in Docker. It creates a K8s cluster where every node (control-plane, worker) is a Docker container running kubelet, kube-apiserver, etcd, and containerd inside it.' },
      { type: 'table', headers: ['Problem', 'Kind\'s Solution'], rows: [
        ['Production clusters need multiple VMs/machines', 'Kind runs on a single machine using Docker'],
        ['Cloud clusters (EKS, AKS, GKE) cost money', 'Kind is free — runs locally'],
        ['Setting up a real cluster takes hours', 'Kind creates a cluster in ~60 seconds'],
        ['CI/CD needs ephemeral clusters', 'Kind starts/stops instantly in CI pipelines'],
        ['Minikube needs a VM', 'Kind uses Docker containers — no VM overhead'],
      ]},
      { type: 'table', headers: ['Tool', 'Boot Time', 'Best For'], rows: [
        ['Kind', '30-60s', 'CI/CD, local dev, learning'],
        ['Minikube', '2-5min', 'Local dev with VM isolation'],
        ['k3d', '20-40s', 'Lightweight, ARM'],
        ['MicroK8s', '10-20s', 'Ubuntu Linux, IoT'],
        ['kubeadm', '15-30min', 'Production, on-prem'],
      ]},
      { type: 'heading', level: 3, text: 'Architecture' },
      { type: 'diagram', lines: [
        '                    Docker Daemon',
        '',
        '  +---------------------------------------------+',
        '  |  Kind Node: control-plane (container)       |',
        '  |  [kube-apiserver] [kube-scheduler] [etcd]   |',
        '  |  [kubelet] [containerd]                     |',
        '  +---------------------------------------------+',
        '  |  Kind Node: worker (container)              |',
        '  |  [kubelet] [containerd]                     |',
        '  |  [Pod] [Pod] [Pod]                          |',
        '  +---------------------------------------------+',
        '  |  Kind Node: worker (container)              |',
        '  |  [kubelet] [containerd]                     |',
        '  |  [Pod] [Pod] [Pod]                          |',
        '  +---------------------------------------------+',
      ]},
    ],
    commands: ['brew install kind', 'kind create cluster', 'kind get clusters'],
  },

  '02-03-create-cluster': {
    id: '02-03-create-cluster',
    phaseId: '02-kubernetes-basics',
    number: 3,
    title: 'Install & Create a Cluster',
    type: 'build',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'command', prompt: '$', cmd: 'brew install kind', output: '... kind installed' },
      { type: 'command', prompt: '$', cmd: 'kind create cluster --name learn', output: 'Creating cluster "learn" ...\n ✓ Ensuring node image (kindest/node:v1.27.3) 🖼\n ✓ Preparing nodes 📦\n ✓ Writing configuration 📜\n ✓ Starting control-plane 🕹️\n ✓ Installing CNI 🔌\n ✓ Installing StorageClass 💾\nSet kubectl context to "kind-learn"\nYou can now use your cluster with:\n\nkubectl cluster-info' },
      { type: 'command', prompt: '$', cmd: 'kind get clusters', output: 'learn' },
      { type: 'command', prompt: '$', cmd: 'kubectl cluster-info', output: 'Kubernetes control plane is running at https://127.0.0.1:6443\nCoreDNS is running at ...' },
      { type: 'command', prompt: '$', cmd: 'kubectl get nodes', output: 'NAME                   STATUS   ROLES           AGE\nlearn-control-plane    Ready    control-plane   2m' },
      { type: 'heading', level: 3, text: 'Multi-Node Cluster' },
      { type: 'yaml', filename: 'kind-config.yaml', code: `kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
  - role: worker` },
      { type: 'command', prompt: '$', cmd: 'kind create cluster --name learn --config kind-config.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl get nodes', output: 'NAME                   STATUS   ROLES           AGE\nlearn-control-plane    Ready    control-plane   1m\nlearn-worker           Ready    <none>          1m\nlearn-worker2          Ready    <none>          1m\nlearn-worker3          Ready    <none>          1m' },
      { type: 'command', prompt: '$', cmd: 'kind delete cluster --name learn' },
    ],
    commands: ['brew install kind', 'kind create cluster', 'kind get clusters', 'kubectl cluster-info', 'kubectl get nodes', 'kind delete cluster'],
  },

  '02-04-pods-deployments-services': {
    id: '02-04-pods-deployments-services',
    phaseId: '02-kubernetes-basics',
    number: 4,
    title: 'Pods, Deployments & Services',
    type: 'learn',
    difficulty: 'beginner',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'The three core building blocks of Kubernetes applications.' },
      { type: 'heading', level: 2, text: 'Pod' },
      { type: 'text', body: 'The smallest deployable unit. A pod encapsulates one or more containers with shared storage/network.' },
      { type: 'yaml', filename: 'pod.yaml', code: `apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: my-app
spec:
  containers:
    - name: my-container
      image: nginx:alpine
      ports:
        - containerPort: 80` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f pod.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods' },
      { type: 'heading', level: 2, text: 'Deployment' },
      { type: 'text', body: 'A Deployment manages a ReplicaSet of Pods. It handles desired replicas, rolling updates, rollbacks, and self-healing.' },
      { type: 'yaml', filename: 'deployment.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: nginx:alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "200m"` },
      { type: 'heading', level: 2, text: 'Service' },
      { type: 'text', body: 'Pods are ephemeral with dynamic IPs. A Service provides a stable endpoint that load-balances across pods.' },
      { type: 'yaml', filename: 'service.yaml', code: `apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP` },
      { type: 'table', headers: ['Service Type', 'Accessible From', 'Use Case'], rows: [
        ['ClusterIP', 'Inside the cluster only', 'Internal APIs, databases'],
        ['NodePort', '<node-ip>:<port>', 'Dev/testing, direct access'],
        ['LoadBalancer', 'Public IP (cloud LB)', 'Production internet-facing'],
        ['ExternalName', 'DNS alias', 'Pointing to external services'],
      ]},
      { type: 'heading', level: 2, text: 'Namespaces' },
      { type: 'command', prompt: '$', cmd: 'kubectl get namespaces', output: 'NAME              STATUS   AGE\ndefault           Active   5m\nkube-system       Active   5m\nkube-public        Active   5m\nkube-node-lease   Active   5m' },
      { type: 'command', prompt: '$', cmd: 'kubectl create namespace my-app' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods -n my-app' },
    ],
    commands: ['kubectl apply -f', 'kubectl get pods', 'kubectl get deployments', 'kubectl get services', 'kubectl create namespace'],
  },

  '02-05-configmaps-secrets': {
    id: '02-05-configmaps-secrets',
    phaseId: '02-kubernetes-basics',
    number: 5,
    title: 'ConfigMaps & Secrets',
    type: 'learn',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'heading', level: 2, text: 'ConfigMap' },
      { type: 'text', body: 'Inject configuration as environment variables or files.' },
      { type: 'yaml', filename: 'configmap.yaml', code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: production
  API_URL: https://api.example.com` },
      { type: 'yaml', filename: 'deployment.yaml', code: `spec:
  template:
    spec:
      containers:
        - name: api
          envFrom:
            - configMapRef:
                name: app-config` },
      { type: 'heading', level: 2, text: 'Secret' },
      { type: 'text', body: 'Like ConfigMap but values are base64-encoded. Not secure by itself — use with encryption at rest and RBAC.' },
      { type: 'warning', body: 'For real secrets: use sops, sealed-secrets, or external-secrets (Vault, AWS Secrets Manager). Don\'t commit raw secrets to git.' },
      { type: 'yaml', filename: 'secret.yaml', code: `apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: cG9zdGdyZXM=
  password: cGFzc3dvcmQxMjM=` },
      { type: 'yaml', filename: 'deployment.yaml', code: `spec:
  template:
    spec:
      containers:
        - name: api
          env:
            - name: DB_USERNAME
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: username` },
    ],
    commands: ['kubectl apply -f', 'kubectl get configmaps', 'kubectl get secrets'],
  },

  '02-06-first-app': {
    id: '02-06-first-app',
    phaseId: '02-kubernetes-basics',
    number: 6,
    title: 'Your First App on Kubernetes',
    type: 'build',
    difficulty: 'beginner',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Let\'s deploy a real app end-to-end — a Deployment with a Service, then access it.' },
      { type: 'yaml', filename: 'deploy-app.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-world
  template:
    metadata:
      labels:
        app: hello-world
    spec:
      containers:
        - name: app
          image: hashicorp/http-echo:latest
          args:
            - "-text=Hello, Kubernetes!"
          ports:
            - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: hello-world
spec:
  selector:
    app: hello-world
  ports:
    - port: 80
      targetPort: 5678
  type: ClusterIP` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f deploy-app.yaml', output: 'deployment.apps/hello-world created\nservice/hello-world created' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods -w', output: 'NAME                           READY   STATUS    RESTARTS   AGE\nhello-world-7d8f9c-x3k2m      1/1     Running   0          10s\nhello-world-7d8f9c-x3k2n      1/1     Running   0          10s' },
      { type: 'command', prompt: '$', cmd: 'kubectl scale deployment hello-world --replicas=5', output: 'deployment.apps/hello-world scaled' },
      { type: 'command', prompt: '$', cmd: 'kubectl port-forward service/hello-world 8080:80' },
      { type: 'command', prompt: '$', cmd: 'curl http://localhost:8080', output: 'Hello, Kubernetes!' },
    ],
    commands: ['kubectl apply -f', 'kubectl get pods -w', 'kubectl scale', 'kubectl port-forward'],
  },

  '02-07-kubectl-cli': {
    id: '02-07-kubectl-cli',
    phaseId: '02-kubernetes-basics',
    number: 7,
    title: 'The kubectl CLI',
    type: 'learn',
    difficulty: 'beginner',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'kubectl is the command-line tool that controls your Kubernetes cluster.' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f file.yaml', output: 'Apply/Delete manifests' },
      { type: 'command', prompt: '$', cmd: 'kubectl delete -f file.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods -o wide', output: 'With node/IP info' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods --watch' },
      { type: 'command', prompt: '$', cmd: 'kubectl describe pod my-pod', output: 'Detailed info + events' },
      { type: 'command', prompt: '$', cmd: 'kubectl logs deployment/my-deployment', output: 'Show logs from deployment' },
      { type: 'command', prompt: '$', cmd: 'kubectl exec -it pod-name -- sh' },
      { type: 'command', prompt: '$', cmd: 'kubectl port-forward pod/my-pod 8080:80' },
      { type: 'command', prompt: '$', cmd: 'kubectl get events --sort-by=\'.lastTimestamp\'' },
      { type: 'command', prompt: '$', cmd: 'kubectl top pods' },
      { type: 'heading', level: 3, text: 'Shortcuts' },
      { type: 'text', body: 'kubectl get po (pods), deploy (deployments), svc (services), cm (configmaps), ns (namespaces), no (nodes).' },
    ],
    commands: ['kubectl apply', 'kubectl get', 'kubectl describe', 'kubectl logs', 'kubectl exec', 'kubectl port-forward', 'kubectl top'],
  },

  '02-08-resource-limits': {
    id: '02-08-resource-limits',
    phaseId: '02-kubernetes-basics',
    number: 8,
    title: 'Resource Requests & Limits',
    type: 'learn',
    difficulty: 'beginner',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'Requests tell K8s the minimum resources needed (scheduling guarantee). Limits prevent a pod from using more than allowed (throttle/OOM prevention).' },
      { type: 'yaml', filename: 'deployment.yaml', code: `resources:
  requests:
    memory: "256Mi"
    cpu: "250m"          # 1/4 of a CPU core
  limits:
    memory: "512Mi"
    cpu: "500m"          # 1/2 of a CPU core` },
      { type: 'text', body: 'Without these, a pod can consume all node resources, starving others. The scheduler also has no idea how much room you need.' },
      { type: 'command', prompt: '$', cmd: 'kubectl top pods', output: 'NAME                    CPU(cores)   MEMORY(bytes)\nmy-deployment-xxx-abc   5m           32Mi' },
      { type: 'command', prompt: '$', cmd: 'kubectl top nodes', output: 'NAME                   CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%\nlearn-control-plane    120m         6%     512Mi           13%' },
    ],
    commands: ['kubectl top pods', 'kubectl top nodes'],
  },

  '02-09-hands-on': {
    id: '02-09-hands-on',
    phaseId: '02-kubernetes-basics',
    number: 9,
    title: 'Hands-On: First App on K8s',
    type: 'capstone',
    difficulty: 'beginner',
    duration: '25 min',
    sections: [
      { type: 'text', body: 'Create a Kind cluster, deploy an app, watch it self-heal, port-forward, and clean up.' },
      { type: 'uml', preset: 'web-app', title: 'What you\'re building — a 3-tier web app' },
      { type: 'command', prompt: '$', cmd: 'kind create cluster --name learn', output: 'Creating cluster "learn" ...' },
      { type: 'text', body: 'Save this YAML and apply it:' },
      { type: 'yaml', filename: 'first-app.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
      - name: app
        image: hashicorp/http-echo:latest
        args: ["-text=Hello, K8s!"]
        ports:
        - containerPort: 5678
        resources:
          requests:
            memory: "32Mi"
            cpu: "50m"
          limits:
            memory: "64Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: hello
spec:
  selector:
    app: hello
  ports:
    - port: 80
      targetPort: 5678` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f first-app.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods -w' },
      { type: 'command', prompt: '$', cmd: 'kubectl port-forward svc/hello 9999:80 &' },
      { type: 'command', prompt: '$', cmd: 'curl http://localhost:9999', output: 'Hello, K8s!' },
      { type: 'text', body: 'Test self-healing by deleting a pod — K8s immediately creates a replacement.' },
      { type: 'command', prompt: '$', cmd: 'kubectl delete pod hello-xxxxx' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods -w' },
      { type: 'command', prompt: '$', cmd: 'kind delete cluster --name learn' },
    ],
    commands: ['kind create cluster', 'kubectl apply', 'kubectl get pods -w', 'kubectl port-forward', 'kind delete cluster'],
  },

  // ================================================================
  // PHASE 03 — Deploying Backends
  // ================================================================
  '03-01-deployment-strategies': {
    id: '03-01-deployment-strategies',
    phaseId: '03-deploying-backends',
    number: 1,
    title: 'Deployment Strategies',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '20 min',
    sections: [
      { type: 'heading', level: 2, text: 'RollingUpdate (Default)' },
      { type: 'text', body: 'The standard way to update without downtime. K8s replaces pods gradually.' },
      { type: 'yaml', filename: 'deployment.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1` },
      { type: 'diagram', lines: [
        'Rolling update flow:',
        'Before: [v1] [v1] [v1] [v1] [v1]',
        'Step 1: [v2] [v1] [v1] [v1] [v1]',
        'Step 2: [v2] [v2] [v1] [v1] [v1]',
        'Step 5: [v2] [v2] [v2] [v2] [v2]  -- All updated',
      ]},
      { type: 'heading', level: 2, text: 'Recreate' },
      { type: 'text', body: 'All old pods killed before new ones start. Has downtime — use only for dev or when you can\'t run two versions.' },
      { type: 'heading', level: 2, text: 'Blue/Green' },
      { type: 'text', body: 'Two full environments: deploy green, test it, then switch traffic atomically.' },
      { type: 'command', prompt: '$', cmd: "kubectl patch service api -p '{\"spec\":{\"selector\":{\"version\":\"green\"}}}'" },
      { type: 'heading', level: 2, text: 'Canary' },
      { type: 'text', body: 'Roll out to a small subset first, monitor, then roll out fully.' },
      { type: 'yaml', filename: 'canary.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-canary
spec:
  replicas: 1          # vs 9 in the main deployment
  selector:
    matchLabels:
      app: api
      track: canary
  template:
    metadata:
      labels:
        app: api
        track: canary
    spec:
      containers:
        - name: api
          image: my-api:v2
---
# Service selects both (1 canary + 9 stable = 10% traffic)
apiVersion: v1
kind: Service
spec:
  selector:
    app: api            # Matches both stable and canary` },
    ],
    commands: ['kubectl patch service', 'kubectl set image', 'kubectl rollout status'],
  },

  '03-02-health-probes': {
    id: '03-02-health-probes',
    phaseId: '03-deploying-backends',
    number: 2,
    title: 'Health Checks — The Three Probes',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'heading', level: 2, text: 'Liveness Probe' },
      { type: 'text', body: 'Does the app need to be restarted? If it fails, K8s kills and recreates the pod.' },
      { type: 'yaml', filename: 'deployment.yaml', code: `livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3` },
      { type: 'heading', level: 2, text: 'Readiness Probe' },
      { type: 'text', body: 'Is the app ready to serve traffic? If it fails, the pod is removed from the Service.' },
      { type: 'yaml', filename: 'deployment.yaml', code: `readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 2` },
      { type: 'heading', level: 2, text: 'Startup Probe (K8s 1.18+)' },
      { type: 'text', body: 'For slow-starting apps. Defers liveness checks until startup completes.' },
      { type: 'yaml', filename: 'deployment.yaml', code: `startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 30        # Give 5 minutes to start` },
      { type: 'text', body: 'Common pattern: readiness checks dependencies (DB, cache), liveness just checks if the process is responsive.' },
    ],
    commands: ['kubectl apply -f', 'kubectl describe pod'],
  },

  '03-03-graceful-shutdown': {
    id: '03-03-graceful-shutdown',
    phaseId: '03-deploying-backends',
    number: 3,
    title: 'Graceful Shutdown',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'When K8s sends a SIGTERM to your pod, the app needs to: stop accepting new requests, finish in-flight requests, close DB connections, and exit cleanly.' },
      { type: 'code', language: 'javascript', code: `// Node.js Express graceful shutdown
const server = app.listen(3000);

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('All connections closed');
    db.close();
    process.exit(0);
  });

  // Force shutdown after 30s
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 25000);
});` },
      { type: 'yaml', filename: 'deployment.yaml', code: `spec:
  terminationGracePeriodSeconds: 30   # Default is 30s` },
    ],
    commands: [],
  },

  '03-04-env-injection': {
    id: '03-04-env-injection',
    phaseId: '03-deploying-backends',
    number: 4,
    title: 'Environment Injection Patterns',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Three patterns for injecting configuration into pods.' },
      { type: 'yaml', filename: 'configmap-env.yaml', code: `# ConfigMap (non-sensitive)
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  NODE_ENV: production
  LOG_LEVEL: info
---
# Use in deployment
envFrom:
  - configMapRef:
      name: api-config` },
      { type: 'yaml', filename: 'secret-env.yaml', code: `# Secret (sensitive)
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
stringData:
  DB_PASSWORD: s3cret!
---
# Use in deployment
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: api-secrets
        key: DB_PASSWORD` },
      { type: 'yaml', filename: 'config-volume.yaml', code: `# Config file mounted as volume
spec:
  containers:
    - name: api
      volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: app-config-files` },
    ],
    commands: ['kubectl apply -f', 'kubectl get configmaps', 'kubectl get secrets'],
  },

  '03-05-zero-downtime': {
    id: '03-05-zero-downtime',
    phaseId: '03-deploying-backends',
    number: 5,
    title: 'Zero-Downtime Deployment',
    type: 'build',
    difficulty: 'intermediate',
    duration: '20 min',
    sections: [
      { type: 'table', headers: ['Requirement', 'How'], rows: [
        ['Readiness probe', 'K8s waits for new pods to be ready before killing old ones'],
        ['Graceful shutdown', 'Old pods finish in-flight requests before exiting'],
        ['At least 2 replicas', 'So there\'s always at least one pod serving traffic'],
      ]},
      { type: 'yaml', filename: 'zero-downtime.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  minReadySeconds: 5
  template:
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: my-api:v2
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10` },
      { type: 'command', prompt: '$', cmd: 'kubectl set image deployment/api api=my-api:v2' },
      { type: 'command', prompt: '$', cmd: 'kubectl rollout status deployment/api', output: 'Waiting for deployment "api" rollout to finish: 1 of 3 updated replicas are available...\nWaiting for deployment "api" rollout to finish: 2 of 3 updated replicas are available...\ndeployment "api" successfully rolled out' },
      { type: 'command', prompt: '$', cmd: 'kubectl rollout history deployment/api' },
      { type: 'command', prompt: '$', cmd: 'kubectl rollout undo deployment/api', output: 'deployment.apps/api rolled back' },
    ],
    commands: ['kubectl set image', 'kubectl rollout status', 'kubectl rollout history', 'kubectl rollout undo'],
  },

  '03-06-kustomize': {
    id: '03-06-kustomize',
    phaseId: '03-deploying-backends',
    number: 6,
    title: 'Kustomize for Environments',
    type: 'build',
    difficulty: 'intermediate',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Kustomize lets you define a base deployment and overlay environment-specific changes without repeating YAML.' },
      { type: 'diagram', lines: [
        'deploy/',
        '  base/',
        '    kustomization.yaml',
        '    deployment.yaml',
        '    service.yaml',
        '  dev/',
        '    kustomization.yaml',
        '    configmap-patch.yaml',
        '  prod/',
        '    kustomization.yaml',
        '    configmap-patch.yaml',
      ]},
      { type: 'yaml', filename: 'base/kustomization.yaml', code: `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml` },
      { type: 'yaml', filename: 'prod/kustomization.yaml', code: `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../base
patches:
  - path: configmap-patch.yaml
replicas:
  - name: api
    count: 5` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -k deploy/prod/', output: 'deployment.apps/api configured\nservice/api unchanged' },
      { type: 'command', prompt: '$', cmd: 'kubectl kustomize deploy/prod/', output: '# Rendered YAML output...' },
    ],
    commands: ['kubectl apply -k', 'kubectl kustomize'],
  },

  '03-07-debugging': {
    id: '03-07-debugging',
    phaseId: '03-deploying-backends',
    number: 7,
    title: 'Debugging Deployments',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'heading', level: 3, text: 'Pod stuck in Pending' },
      { type: 'command', prompt: '$', cmd: 'kubectl describe pod my-pod' },
      { type: 'text', body: 'Look for "0/3 nodes are available" — likely resource constraints. Solution: increase node resources or reduce pod requests.' },
      { type: 'heading', level: 3, text: 'Pod in CrashLoopBackOff' },
      { type: 'command', prompt: '$', cmd: 'kubectl logs pod-name' },
      { type: 'command', prompt: '$', cmd: 'kubectl logs pod-name --previous' },
      { type: 'heading', level: 3, text: 'Pod running but no response' },
      { type: 'command', prompt: '$', cmd: 'kubectl port-forward pod/my-pod 8080:3000' },
      { type: 'heading', level: 3, text: 'Service not routing traffic' },
      { type: 'command', prompt: '$', cmd: 'kubectl get endpoints' },
      { type: 'command', prompt: '$', cmd: 'kubectl describe service my-svc' },
      { type: 'heading', level: 3, text: 'Debug Pod (Temporary)' },
      { type: 'command', prompt: '$', cmd: 'kubectl debug pod/my-pod -it --image=nicolaka/netshoot' },
      { type: 'command', prompt: '$', cmd: 'kubectl run debug --rm -it --image=nicolaka/netshoot -- sh' },
    ],
    commands: ['kubectl describe pod', 'kubectl logs', 'kubectl port-forward', 'kubectl get endpoints', 'kubectl debug'],
  },

  '03-08-complete-backend': {
    id: '03-08-complete-backend',
    phaseId: '03-deploying-backends',
    number: 8,
    title: 'Complete Backend Deployment',
    type: 'capstone',
    difficulty: 'intermediate',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'A production-ready backend deployment with health probes, env injection, resource limits, and a service.' },
      { type: 'uml', preset: 'microservices', title: 'Scaling out — one Deployment + Service per concern' },
      { type: 'yaml', filename: 'backend.yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  labels:
    app: backend-api
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
          image: my-backend:v1
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: backend-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: backend-secrets
                  key: DB_PASSWORD
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
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
spec:
  selector:
    app: backend-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP` },
    ],
    commands: ['kubectl apply -f', 'kubectl get deployments', 'kubectl get services'],
  },

  // ================================================================
  // PHASE 04 — Services & Networking
  // ================================================================
  '04-01-coredns': {
    id: '04-01-coredns',
    phaseId: '04-services-networking',
    number: 1,
    title: 'CoreDNS — Service Discovery',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'Kubernetes runs CoreDNS as a cluster DNS service. Every service gets a DNS name following this pattern: <service>.<namespace>.svc.cluster.local' },
      { type: 'code', language: 'text', code: `From inside any pod:
  curl http://backend-api.default.svc.cluster.local:3000
  curl http://backend-api:3000          # Same namespace
  curl http://backend-api.other-ns:3000 # Cross-namespace` },
      { type: 'command', prompt: '$', cmd: 'kubectl run dns-test --rm -it --image=busybox:1.28 -- nslookup kubernetes.default', output: 'Server:    10.96.0.10\nAddress 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local\n\nName:      kubernetes.default\nAddress 1: 10.96.0.1 kubernetes.default.svc.cluster.local' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods -n kube-system -l k8s-app=kube-dns', output: 'NAME                       READY   STATUS    RESTARTS   AGE\ncoredns-787d4945fb-abc12   1/1     Running   0          24h\ncoredns-787d4945fb-xyz34   1/1     Running   0          24h' },
    ],
    commands: ['kubectl run dns-test', 'kubectl get pods -n kube-system'],
  },

  '04-02-service-types': {
    id: '04-02-service-types',
    phaseId: '04-services-networking',
    number: 2,
    title: 'Service Types in Depth',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'heading', level: 2, text: 'ClusterIP (Default)' },
      { type: 'text', body: 'Internal virtual IP that load-balances across pods.' },
      { type: 'yaml', filename: 'clusterip-service.yaml', code: `apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
    - port: 6379
      targetPort: 6379
  type: ClusterIP` },
      { type: 'heading', level: 2, text: 'NodePort' },
      { type: 'yaml', filename: 'nodeport-service.yaml', code: `apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30080` },
      { type: 'heading', level: 2, text: 'LoadBalancer' },
      { type: 'yaml', filename: 'loadbalancer-service.yaml', code: `apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000` },
      { type: 'heading', level: 2, text: 'ExternalName' },
      { type: 'yaml', filename: 'externalname-service.yaml', code: `apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: my-database.example.com` },
    ],
    commands: ['kubectl apply -f', 'kubectl get services'],
  },

  '04-03-headless-services': {
    id: '04-03-headless-services',
    phaseId: '04-services-networking',
    number: 3,
    title: 'Headless Services',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'When you don\'t want load-balancing and need direct pod IPs (for stateful apps, service mesh, discovery).' },
      { type: 'yaml', filename: 'headless-service.yaml', code: `apiVersion: v1
kind: Service
metadata:
  name: stateful-db
spec:
  clusterIP: None             # Makes it headless
  selector:
    app: stateful-db
  ports:
    - port: 5432` },
      { type: 'code', language: 'text', code: `Regular service:  nslookup redis        → 10.96.0.1 (virtual IP)
Headless service: nslookup stateful-db → 10.244.1.5, 10.244.2.8 (direct pod IPs)` },
    ],
    commands: ['kubectl apply -f', 'kubectl get services'],
  },

  '04-04-ingress': {
    id: '04-04-ingress',
    phaseId: '04-services-networking',
    number: 4,
    title: 'Ingress Controller',
    type: 'build',
    difficulty: 'intermediate',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'A Service gives you one IP. Ingress gives you smart routing for HTTP/HTTPS — host-based and path-based routing.' },
      { type: 'diagram', lines: [
        '                       +------------------+',
        '  api.example.com ────>|   Ingress        |',
        '                       |   Controller     |',
        '                       |                  |',
        '                       |  /api/*  ───> backend-api',
        '                       |  /app/*  ───> frontend',
        '                       |  /admin  ───> admin-dashboard',
        '                       +------------------+',
      ]},
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml' },
      { type: 'yaml', filename: 'ingress.yaml', code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: app.localhost
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-api
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80` },
      { type: 'yaml', filename: 'kind-config.yaml', code: `kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP` },
    ],
    commands: ['kubectl apply -f ingress', 'kubectl wait --for=condition=ready pod', 'kubectl get ingress'],
  },

  '04-05-gateway-api': {
    id: '04-05-gateway-api',
    phaseId: '04-services-networking',
    number: 5,
    title: 'Gateway API',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'The Gateway API is the next-generation replacement for Ingress with role-based personas and protocol flexibility.' },
      { type: 'yaml', filename: 'gateway-api.yaml', code: `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: my-gateway
spec:
  gatewayClassName: istio
  listeners:
    - name: http
      protocol: HTTP
      port: 80
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-route
spec:
  parentRefs:
    - name: my-gateway
  hostnames:
    - api.example.com
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api
      backendRefs:
        - name: backend-api
          port: 80` },
      { type: 'text', body: 'Why Gateway API over Ingress: more expressive routing (weighted, header-based, query-param), role separation (infra team owns Gateway, app team owns Routes), works with HTTP, gRPC, TCP, UDP, and is standardized across all vendors.' },
    ],
    commands: ['kubectl apply -f gateway-api'],
  },

  '04-06-tls-cert-manager': {
    id: '04-06-tls-cert-manager',
    phaseId: '04-services-networking',
    number: 6,
    title: 'TLS & cert-manager',
    type: 'build',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'yaml', filename: 'tls-ingress.yaml', code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: tls-secret
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 443` },
      { type: 'command', prompt: '$', cmd: 'openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=app.localhost/O=app.localhost"' },
      { type: 'command', prompt: '$', cmd: 'kubectl create secret tls tls-secret --key tls.key --cert tls.crt' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml' },
    ],
    commands: ['kubectl create secret tls', 'kubectl apply -f cert-manager', 'openssl req'],
  },

  '04-07-network-policies': {
    id: '04-07-network-policies',
    phaseId: '04-services-networking',
    number: 7,
    title: 'Network Policies',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'By default, all pods can talk to all pods. Network policies restrict traffic between pods based on labels, namespaces, and IP blocks.' },
      { type: 'yaml', filename: 'network-policy.yaml', code: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
        - namespaceSelector:
            matchLabels:
              name: monitoring
      ports:
        - port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - port: 5432
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
          except:
            - 10.0.0.0/8` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f https://docs.tigera.io/calico/latest/manifests/calico.yaml' },
    ],
    commands: ['kubectl apply -f network-policy', 'kubectl apply -f calico'],
  },

  '04-08-micro-segmentation': {
    id: '04-08-micro-segmentation',
    phaseId: '04-services-networking',
    number: 8,
    title: 'End-to-End Traffic Flow',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'The full path from a user\'s browser to a database pod.' },
      { type: 'diagram', lines: [
        'User browser',
        '   |',
        '   v  DNS resolves api.example.com to LoadBalancer IP',
        'Internet / Cloud LB',
        '   |',
        '   v  Ingress Controller receives the request',
        'Ingress Controller (nginx/istio)',
        '   |  Parses host/routing rules, terminates TLS',
        '   v',
        'Service (ClusterIP)',
        '   |  Load-balances across ready pods',
        '   v',
        'Pod (container)',
        '   |  App code runs here',
        '   v',
        'Database, Cache, External APIs',
      ]},
    ],
    commands: [],
  },

  // ================================================================
  // PHASE 05 — Scaling
  // ================================================================
  '05-01-metrics-server': {
    id: '05-01-metrics-server',
    phaseId: '05-scaling',
    number: 1,
    title: 'Metrics Server',
    type: 'build',
    difficulty: 'intermediate',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'The Metrics Server collects resource metrics (CPU/memory) from each node and pod. HPA and kubectl top depend on it.' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl patch deployment metrics-server -n kube-system --type=\'json\' -p=\'[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]\'' },
      { type: 'command', prompt: '$', cmd: 'kubectl top pods', output: 'NAME                    CPU(cores)   MEMORY(bytes)\napi-7d8f9c-x3k2m       5m           32Mi' },
      { type: 'command', prompt: '$', cmd: 'kubectl top nodes', output: 'NAME                   CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%\nlearn-control-plane    120m         6%     512Mi           13%' },
    ],
    commands: ['kubectl apply -f metrics-server', 'kubectl top pods', 'kubectl top nodes'],
  },

  '05-02-hpa-cpu': {
    id: '05-02-hpa-cpu',
    phaseId: '05-scaling',
    number: 2,
    title: 'HPA Based on CPU',
    type: 'build',
    difficulty: 'intermediate',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'The Horizontal Pod Autoscaler automatically adjusts pod replicas based on observed CPU utilization.' },
      { type: 'yaml', filename: 'hpa-cpu.yaml', code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70` },
      { type: 'text', body: 'HPA calculates desiredReplicas = ceil(currentReplicas × currentMetricValue / targetMetricValue). Every 15 seconds, it checks metrics, and updates the deployment.' },
      { type: 'command', prompt: '$', cmd: 'kubectl autoscale deployment api --min=2 --max=10 --cpu-percent=50' },
      { type: 'command', prompt: '$', cmd: 'kubectl get hpa -w', output: 'NAME     REFERENCE       TARGETS    MINPODS   MAXPODS   REPLICAS\napi-hpa  Deployment/api  20%/50%    2         10        2\napi-hpa  Deployment/api  120%/50%   2         10        4\napi-hpa  Deployment/api  150%/50%   2         10        8' },
      { type: 'command', prompt: '$', cmd: 'kubectl run load-generator --rm -it --image=busybox -- sh\nwhile true; do wget -q -O- http://api:5678; done' },
    ],
    commands: ['kubectl autoscale', 'kubectl get hpa -w', 'kubectl run load-generator'],
  },

  '05-03-hpa-custom-metrics': {
    id: '05-03-hpa-custom-metrics',
    phaseId: '05-scaling',
    number: 3,
    title: 'HPA Custom Metrics & Memory',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Custom metrics like HTTP requests per second are the most reliable scaling signal for web services.' },
      { type: 'yaml', filename: 'hpa-memory.yaml', code: `metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80` },
      { type: 'yaml', filename: 'hpa-custom.yaml', code: `metrics:
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: 100` },
      { type: 'yaml', filename: 'hpa-multi.yaml', code: `metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80` },
      { type: 'text', body: 'With multiple metrics, HPA scales to the highest desired replica count.' },
      { type: 'yaml', filename: 'hpa-behavior.yaml', code: `behavior:
  scaleDown:
    stabilizationWindowSeconds: 300
    policies:
      - type: Percent
        value: 10
        periodSeconds: 60
  scaleUp:
    stabilizationWindowSeconds: 0
    policies:
      - type: Pods
        value: 4
        periodSeconds: 60
      - type: Percent
        value: 100
        periodSeconds: 60
    selectPolicy: Max` },
    ],
    commands: ['kubectl get hpa', 'kubectl describe hpa'],
  },

  '05-04-vpa': {
    id: '05-04-vpa',
    phaseId: '05-scaling',
    number: 4,
    title: 'Vertical Pod Autoscaler',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'VPA sets resource requests automatically based on historical usage. Use when you don\'t know what resources your app needs.' },
      { type: 'yaml', filename: 'vpa.yaml', code: `apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  updatePolicy:
    updateMode: Auto
  resourcePolicy:
    containerPolicies:
      - containerName: '*'
        minAllowed:
          cpu: "50m"
          memory: "64Mi"
        maxAllowed:
          cpu: "2"
          memory: "4Gi"` },
      { type: 'table', headers: ['Mode', 'Behavior'], rows: [
        ['Off', 'Only recommend values — you apply manually'],
        ['Initial', 'Set values at pod creation only, never change running pods'],
        ['Auto', 'Evict and recreate pods with new recommendations'],
      ]},
      { type: 'table', headers: ['Use HPA When', 'Use VPA When'], rows: [
        ['App scales horizontally (stateless)', 'App is hard to horizontally scale'],
        ['Predictable load patterns', 'Unsure about resource requirements'],
        ['Custom metrics like RPS', 'Spiky resource usage'],
        ['Stateless microservices', 'Stateful workloads (databases)'],
      ]},
    ],
    commands: ['kubectl apply -f vpa.yaml', 'kubectl get vpa'],
  },

  '05-05-cluster-autoscaler': {
    id: '05-05-cluster-autoscaler',
    phaseId: '05-scaling',
    number: 5,
    title: 'Cluster Autoscaler',
    type: 'learn',
    difficulty: 'advanced',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'Adds nodes when pods can\'t be scheduled. Removes nodes when they\'re underutilized.' },
      { type: 'code', language: 'text', code: `1. Pod goes Pending (all nodes have insufficient resources)
2. Cluster Autoscaler sees the unschedulable pod
3. Requests a new node from the cloud provider
4. Node joins the cluster
5. K8s schedules the pod on the new node
6. When utilization drops, CA cordons and drains nodes` },
      { type: 'command', prompt: '$', cmd: 'eksctl create cluster --node-group-type=spot --nodes-min=2 --nodes-max=20' },
      { type: 'command', prompt: '$', cmd: 'az aks create --enable-cluster-autoscaler --min-count 2 --max-count 20' },
      { type: 'text', body: 'Cluster Autoscaler doesn\'t work with Kind (no cloud to provision nodes), but you can simulate adding a node manually.' },
      { type: 'command', prompt: '$', cmd: 'kind create node --name learn --image kindest/node:v1.27.3' },
    ],
    commands: ['kind create node'],
  },

  '05-06-load-testing': {
    id: '05-06-load-testing',
    phaseId: '05-scaling',
    number: 6,
    title: 'Load Testing',
    type: 'build',
    difficulty: 'advanced',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Test your cluster\'s scaling behavior with real load.' },
      { type: 'uml', preset: 'autoscale', title: 'How autoscaling reacts to load' },
      { type: 'heading', level: 3, text: 'k6 (Modern, Scriptable)' },
      { type: 'code', language: 'javascript', code: `kubectl run k6 --rm -it --image=grafana/k6 -- run - <<EOF
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  http.get('http://api:3000');
  sleep(1);
}
EOF` },
      { type: 'heading', level: 3, text: 'Hey (Simple)' },
      { type: 'command', prompt: '$', cmd: 'kubectl run hey --rm -it --image=ghcr.io/rakyll/hey -- -n 10000 -c 100 http://api:3000/health' },
      { type: 'heading', level: 3, text: 'Complete Scaling Demo' },
      { type: 'command', prompt: '$', cmd: 'kind create cluster --name scaling-demo --config - <<EOF\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnodes:\n  - role: control-plane\n  - role: worker\n  - role: worker\n  - role: worker\nEOF' },
      { type: 'command', prompt: '$', cmd: 'kubectl autoscale deployment cpu-loader --min=1 --max=10 --cpu-percent=50' },
      { type: 'command', prompt: '$', cmd: 'kubectl get hpa -w' },
    ],
    commands: ['kubectl run k6', 'kubectl run hey'],
  },

  // ================================================================
  // PHASE 06 — Storage
  // ================================================================
  '06-01-volumes-pvcs': {
    id: '06-01-volumes-pvcs',
    phaseId: '06-storage',
    number: 1,
    title: 'Volumes, PVCs & PVs',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'The Kubernetes storage stack: Pod → PVC → PV → StorageClass → Actual Storage.' },
      { type: 'diagram', lines: [
        'Pod',
        '  |  volumeMounts: /var/lib/data',
        '  v',
        'PersistentVolumeClaim (PVC)  <-- You request storage',
        '  |  storage: 5Gi, ReadWriteOnce',
        '  v',
        'PersistentVolume (PV)        <-- Cluster resource',
        '  |  Capacity: 10Gi, Reclaim Policy: Retain',
        '  v',
        'StorageClass                 <-- Defines HOW storage is provisioned',
        '  |  provisioner: rancher.io/local-path',
        '  v',
        'Actual Storage (host directory, EBS, GCE PD, NFS, etc.)',
      ]},
      { type: 'table', headers: ['Concept', 'Analogy', 'Who Creates It'], rows: [
        ['StorageClass', 'A storage tier (SSD, HDD, NFS)', 'Cluster admin'],
        ['PersistentVolume', 'A specific disk', 'Admin OR StorageClass (dynamic)'],
        ['PersistentVolumeClaim', 'A request for storage', 'Application developer'],
        ['VolumeMount', 'Where to mount the storage', 'Application developer'],
      ]},
      { type: 'yaml', filename: 'pvc.yaml', code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f pvc.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pvc', output: 'NAME       STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS\n           Bound    pvc-abc123-def456                          5Gi        RWO            standard' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pv', output: 'NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM\n           5Gi        RWO            Retain           Bound    default/data-pvc' },
      { type: 'table', headers: ['Access Mode', 'Description'], rows: [
        ['ReadWriteOnce (RWO)', 'One node can read/write. Default for block storage.'],
        ['ReadOnlyMany (ROX)', 'Many nodes can read.'],
        ['ReadWriteMany (RWX)', 'Many nodes can read/write. NFS, EFS, Longhorn.'],
        ['ReadWriteOncePod (RWOP)', 'One pod can read/write (K8s 1.22+).'],
      ]},
    ],
    commands: ['kubectl apply -f pvc', 'kubectl get pvc', 'kubectl get pv'],
  },

  '06-02-storageclasses': {
    id: '06-02-storageclasses',
    phaseId: '06-storage',
    number: 2,
    title: 'StorageClasses',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '10 min',
    sections: [
      { type: 'command', prompt: '$', cmd: 'kubectl get storageclass', output: 'NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE\nstandard (default)   rancher.io/local-path   Delete          WaitForFirstConsumer' },
      { type: 'yaml', filename: 'storageclass.yaml', code: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ssd
provisioner: rancher.io/local-path
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true` },
    ],
    commands: ['kubectl get storageclass'],
  },

  '06-03-statefulsets': {
    id: '06-03-statefulsets',
    phaseId: '06-storage',
    number: 3,
    title: 'StatefulSets',
    type: 'learn',
    difficulty: 'intermediate',
    duration: '15 min',
    sections: [
      { type: 'table', headers: ['Feature', 'Deployment', 'StatefulSet'], rows: [
        ['Pod names', 'Random (api-7d8f9c-x3k2m)', 'Ordered (db-0, db-1, db-2)'],
        ['Pod identity', 'Ephemeral', 'Stable (survives restart)'],
        ['Storage', 'Shared PVC for all pods', 'Dedicated per pod (pvc-db-0)'],
        ['Scaling', 'Any order', 'Ordered (0, 1, 2... up; 2, 1, 0... down)'],
        ['Use case', 'APIs, web servers', 'Databases, message queues, caches'],
      ]},
      { type: 'yaml', filename: 'statefulset.yaml', code: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: web
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          volumeMounts:
            - name: www
              mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
    - metadata:
        name: www
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
        storageClassName: standard
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  clusterIP: None
  selector:
    app: web
  ports:
    - port: 80` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f statefulset.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods -w', output: 'web-0   Pending   ContainerCreating   0  1s\nweb-0   Running   0   5s\nweb-1   Pending   0   0s\nweb-1   Running   0   5s\nweb-2   Pending   0   0s\nweb-2   Running   0   5s' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pvc', output: 'NAME        STATUS   VOLUME\nwww-web-0   Bound    pvc-xxx\nwww-web-1   Bound    pvc-yyy\nwww-web-2   Bound    pvc-zzz' },
    ],
    commands: ['kubectl apply -f statefulset', 'kubectl get pods -w', 'kubectl get pvc', 'kubectl run nslookup'],
  },

  '06-04-postgresql': {
    id: '06-04-postgresql',
    phaseId: '06-storage',
    number: 4,
    title: 'PostgreSQL on Kubernetes',
    type: 'capstone',
    difficulty: 'advanced',
    duration: '25 min',
    sections: [
      { type: 'text', body: 'Deploy a PostgreSQL database as a StatefulSet with persistent storage.' },
      { type: 'yaml', filename: 'postgres-statefulset.yaml', code: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
              name: pg
          env:
            - name: POSTGRES_USER
              value: app
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pg-secret
                  key: password
            - name: POSTGRES_DB
              value: myapp
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            exec:
              command: ["pg_isready", "-U", "app"]
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            exec:
              command: ["pg_isready", "-U", "app"]
            initialDelaySeconds: 5
            periodSeconds: 5
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - port: 5432` },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f postgres-statefulset.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl rollout status statefulset/postgres', output: 'Waiting for 1 pods to be ready...\nstatefulset rolling update complete 1 pods at revision postgres-...' },
      { type: 'command', prompt: '$', cmd: 'kubectl run pg-client --rm -it --image=postgres:16-alpine -- psql -h postgres-0.postgres -U app -d myapp', output: 'psql (16.1)\nType "help" for help.\n\nmyapp=>' },
      { type: 'warning', body: 'Running DB on K8s in production is non-trivial. Challenges include: data loss on node failure (use replication + backups), performance overhead (tune CSI driver), backup complexity (use Velero). For learning on Kind, this works great. For production, use a managed DB (RDS, Cloud SQL) or a DB operator.' },
    ],
    commands: ['kubectl apply -f postgres', 'kubectl rollout status statefulset', 'kubectl run pg-client'],
  },

  '06-05-csi-drivers': {
    id: '06-05-csi-drivers',
    phaseId: '06-storage',
    number: 5,
    title: 'CSI Drivers',
    type: 'learn',
    difficulty: 'advanced',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'CSI (Container Storage Interface) is the standard plugin interface for storage vendors. Each cloud provider has a CSI driver.' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.26"' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/master/deploy/kubernetes/overlays/external/stable/apply.html' },
    ],
    commands: ['kubectl apply -k aws-ebs-csi-driver'],
  },

  '06-06-backups': {
    id: '06-06-backups',
    phaseId: '06-storage',
    number: 6,
    title: 'Backup Strategies',
    type: 'build',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'heading', level: 2, text: 'Velero (Standard Approach)' },
      { type: 'command', prompt: '$', cmd: 'velero install --provider aws --bucket k8s-backups --backup-location-config region=us-east-1 --snapshot-location-config region=us-east-1' },
      { type: 'command', prompt: '$', cmd: 'velero backup create daily-backup --include-namespaces default' },
      { type: 'command', prompt: '$', cmd: 'velero schedule create daily --schedule="0 1 * * *" --include-namespaces myapp' },
      { type: 'command', prompt: '$', cmd: 'velero restore create --from-backup daily-backup' },
      { type: 'heading', level: 2, text: 'Simple Approach for Kind' },
      { type: 'command', prompt: '$', cmd: 'kubectl run backup --rm -it --image=busybox -- tar czf - -C /mnt/data . > backup-$(date +%Y%m%d).tar.gz' },
      { type: 'heading', level: 2, text: 'Storage Patterns' },
      { type: 'table', headers: ['Workload', 'Storage Pattern', 'Example'], rows: [
        ['Stateless API', 'No storage, or shared ConfigMap', 'Deployment + ConfigMap'],
        ['File uploads', 'PVC + Deployment (single writer)', 'One pod mounts PVC RW'],
        ['Shared files', 'RWX volume (NFS, EFS)', 'Multiple pods read/write'],
        ['Database', 'StatefulSet + PVC per replica', 'PostgreSQL, MySQL'],
        ['Cache', 'EmptyDir (ephemeral, in-memory)', 'Redis, Memcached'],
        ['ML Models', 'PVC with ReadOnlyMany', 'Multiple inference pods'],
      ]},
    ],
    commands: ['velero install', 'velero backup create', 'velero restore create'],
  },

  // ================================================================
  // PHASE 07 — Monitoring
  // ================================================================
  '07-01-prometheus-grafana': {
    id: '07-01-prometheus-grafana',
    phaseId: '07-monitoring',
    number: 1,
    title: 'Prometheus & Grafana',
    type: 'build',
    difficulty: 'advanced',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'The kube-prometheus-stack is the most popular monitoring setup, including Prometheus, Grafana, AlertManager, and node exporters.' },
      { type: 'command', prompt: '$', cmd: 'helm repo add prometheus-community https://prometheus-community.github.io/helm-charts' },
      { type: 'command', prompt: '$', cmd: 'helm repo update' },
      { type: 'command', prompt: '$', cmd: 'helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace' },
      { type: 'command', prompt: '$', cmd: 'kubectl -n monitoring get pods', output: 'NAME                                                     READY   STATUS\nmonitoring-grafana-7d8f9c-x3k2m                         2/2     Running\nmonitoring-kube-prometheus-operator-7d8f9c-x3k2m       1/1     Running\nmonitoring-kube-state-metrics-7d8f9c-x3k2m             1/1     Running\nprometheus-monitoring-kube-prometheus-prometheus-0      2/2     Running' },
      { type: 'command', prompt: '$', cmd: 'kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80' },
      { type: 'text', body: 'Open http://localhost:3000. Default credentials: admin / prom-operator. The stack ships with dashboards for Kubernetes compute resources, networking, API server health, and USE method.' },
    ],
    commands: ['helm install', 'kubectl port-forward'],
  },

  '07-02-loki-logging': {
    id: '07-02-loki-logging',
    phaseId: '07-monitoring',
    number: 2,
    title: 'Loki & Log Aggregation',
    type: 'build',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Loki stores logs, Promtail collects and pushes them. Query logs in Grafana using LogQL.' },
      { type: 'command', prompt: '$', cmd: 'helm repo add grafana https://grafana.github.io/helm-charts' },
      { type: 'command', prompt: '$', cmd: 'helm repo update' },
      { type: 'command', prompt: '$', cmd: 'helm install loki grafana/loki-stack --namespace monitoring --set grafana.enabled=false --set prometheus.enabled=false' },
      { type: 'diagram', lines: [
        'Pod ----> stdout/stderr ----> Promtail (daemonset) ----> Loki ----> Grafana',
        '                          (one per node)              (store)     (query)',
      ]},
      { type: 'heading', level: 3, text: 'LogQL Queries' },
      { type: 'code', language: 'logql', code: `# All logs from a namespace
{namespace="myapp"}

# Error logs in the last hour
{app="api"} |= "ERROR" |= "connection" | logfmt

# Rate of errors
rate({app="api"} |= "ERROR" [5m])` },
      { type: 'heading', level: 3, text: 'Structured Logging (Best Practice)' },
      { type: 'code', language: 'javascript', code: `// GOOD — structured JSON logs
console.log(JSON.stringify({
  level: 'info',
  message: 'request completed',
  method: 'GET',
  path: '/users',
  status: 200,
  duration: 45,
  requestId: 'abc-123',
}));` },
    ],
    commands: ['helm install loki'],
  },

  '07-03-opentelemetry': {
    id: '07-03-opentelemetry',
    phaseId: '07-monitoring',
    number: 3,
    title: 'OpenTelemetry & Tracing',
    type: 'build',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Distributed tracing shows the full path of a request across multiple services.' },
      { type: 'diagram', lines: [
        'Browser ----> API Gateway ----> Users Service ----> DB',
        '                   |                |',
        '                   v                v',
        '              Orders Service    Cache',
        '                   |',
        '                   v',
        '              Payment Service',
      ]},
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml' },
      { type: 'yaml', filename: 'otel-collector.yaml', code: `apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: collector
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    exporters:
      logging:
        loglevel: debug
    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [logging]` },
      { type: 'code', language: 'javascript', code: `const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
  instrumentations: [
    new ExpressInstrumentation(),
  ],
});` },
    ],
    commands: ['kubectl apply -f opentelemetry-operator'],
  },

  '07-04-alertmanager': {
    id: '07-04-alertmanager',
    phaseId: '07-monitoring',
    number: 4,
    title: 'Alerting with AlertManager',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'table', headers: ['Alert', 'Condition', 'Severity'], rows: [
        ['KubePodCrashLooping', 'Pod in CrashLoopBackOff > 15m', 'critical'],
        ['KubeCPUOvercommit', 'Overcommitted CPU > 150%', 'warning'],
        ['KubeMemoryOvercommit', 'Overcommitted memory > 150%', 'warning'],
        ['KubeNodeNotReady', 'Node not ready > 15m', 'critical'],
        ['KubePersistentVolumeFillingUp', 'PV filling > 3% in 24h', 'critical'],
      ]},
      { type: 'yaml', filename: 'custom-alert.yaml', code: `apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-alerts
  namespace: monitoring
spec:
  groups:
    - name: api.rules
      rules:
        - alert: HighErrorRate
          expr: |
            rate(http_requests_total{status=~"5.."}[5m])
            /
            rate(http_requests_total[5m])
            > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on {{ $labels.instance }}"
            description: "Error rate is {{ $value | humanizePercentage }} over 5m"

        - alert: HighLatency
          expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "P95 latency > 500ms on {{ $labels.instance }}"` },
    ],
    commands: ['kubectl apply -f custom-alert'],
  },

  '07-05-k8s-events': {
    id: '07-05-k8s-events',
    phaseId: '07-monitoring',
    number: 5,
    title: 'Kubernetes Events',
    type: 'learn',
    difficulty: 'advanced',
    duration: '10 min',
    sections: [
      { type: 'text', body: 'K8s events tell you what happened in the cluster — scheduling, scaling, probe failures.' },
      { type: 'command', prompt: '$', cmd: 'kubectl get events --sort-by=\'.lastTimestamp\'', output: 'LAST SEEN   TYPE      REASON              OBJECT\n5m          Warning   BackOff             pod/my-pod\n4m          Normal    Scheduled           pod/my-pod\n3m          Normal    Pulled              pod/my-pod\n2m          Normal    Created             pod/my-pod' },
      { type: 'command', prompt: '$', cmd: 'kubectl get events -w' },
      { type: 'command', prompt: '$', cmd: 'kubectl describe pod my-pod' },
    ],
    commands: ['kubectl get events', 'kubectl describe pod'],
  },

  '07-06-red-use-methods': {
    id: '07-06-red-use-methods',
    phaseId: '07-monitoring',
    number: 6,
    title: 'RED, USE & Golden Signals',
    type: 'learn',
    difficulty: 'advanced',
    duration: '10 min',
    sections: [
      { type: 'uml', preset: 'observability', title: 'The three pillars, all in-cluster' },
      { type: 'heading', level: 2, text: 'RED Method (For Services)' },
      { type: 'table', headers: ['Metric', 'What', 'Example'], rows: [
        ['Rate', 'Requests per second', '1500 req/s'],
        ['Errors', 'Failed requests', '0.5% error rate'],
        ['Duration', 'Latency distribution', 'P50: 20ms, P99: 500ms'],
      ]},
      { type: 'heading', level: 2, text: 'USE Method (For Infrastructure)' },
      { type: 'table', headers: ['Metric', 'What', 'Example'], rows: [
        ['Utilization', '% of resource being used', 'CPU: 70%, Memory: 80%'],
        ['Saturation', 'Queue depth or pressure', 'Load average, disk I/O wait'],
        ['Errors', 'Error count', 'Disk errors, OOM events'],
      ]},
      { type: 'heading', level: 2, text: 'Golden Signals' },
      { type: 'text', body: '1. Latency — Time to serve a request (distinguish success vs error latency). 2. Traffic — Demand on your system (RPS, active connections). 3. Errors — Rate of failed requests. 4. Saturation — How "full" your service is.' },
      { type: 'heading', level: 2, text: 'Health Check Cheat Sheet' },
      { type: 'command', prompt: '$', cmd: 'kubectl get componentstatuses' },
      { type: 'command', prompt: '$', cmd: 'kubectl top pods && kubectl top nodes' },
      { type: 'command', prompt: '$', cmd: 'kubectl get pods --field-selector=status.phase!=Running' },
      { type: 'command', prompt: '$', cmd: 'kubectl logs deployment/myapp --tail=50' },
    ],
    commands: ['kubectl top pods', 'kubectl top nodes', 'kubectl get events'],
  },

  // ================================================================
  // PHASE 08 — Production
  // ================================================================
  '08-01-rbac': {
    id: '08-01-rbac',
    phaseId: '08-production',
    number: 1,
    title: 'RBAC — Access Control',
    type: 'learn',
    difficulty: 'advanced',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'RBAC controls who can do what in the cluster. Never give cluster-admin to applications or CI/CD pipelines.' },
      { type: 'diagram', lines: [
        'User/ServiceAccount ----bound----> Role/ClusterRole ----grants----> Verbs on Resources',
      ]},
      { type: 'table', headers: ['Resource', 'Who', 'Example'], rows: [
        ['User', 'Human', 'alice@company.com'],
        ['ServiceAccount', 'Machine (app, CI/CD)', 'github-actions, prometheus'],
        ['Role', 'Permissions in a namespace', 'Can get, list pods in default'],
        ['ClusterRole', 'Permissions cluster-wide', 'Can get nodes, create PVs'],
        ['RoleBinding', 'Binds Role to User/SA in a namespace', 'alice → pod-reader role'],
        ['ClusterRoleBinding', 'Binds ClusterRole cluster-wide', 'prometheus → cluster-monitoring'],
      ]},
      { type: 'yaml', filename: 'rbac.yaml', code: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log", "services"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-app-binding
  namespace: default
subjects:
  - kind: ServiceAccount
    name: my-app-sa
    namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io` },
      { type: 'command', prompt: '$', cmd: 'kubectl create rolebinding bob-view --clusterrole=view --user=bob --namespace=myapp' },
    ],
    commands: ['kubectl create rolebinding', 'kubectl get clusterroles', 'kubectl get roles'],
  },

  '08-02-pod-security': {
    id: '08-02-pod-security',
    phaseId: '08-production',
    number: 2,
    title: 'Pod Security Standards',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'table', headers: ['Level', 'What it enforces', 'Example'], rows: [
        ['Privileged', 'Nothing — unrestricted', 'System pods, network plugins'],
        ['Baseline', 'Minimal restrictions', 'Most apps'],
        ['Restricted', 'Pod hardening best practices', 'PCI/HIPAA workloads'],
      ]},
      { type: 'command', prompt: '$', cmd: 'kubectl label ns default pod-security.kubernetes.io/enforce=baseline pod-security.kubernetes.io/warn=restricted' },
      { type: 'yaml', filename: 'restricted-pod.yaml', code: `apiVersion: v1
kind: Pod
metadata:
  name: restricted-pod
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: my-app
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop: ["ALL"]
        readOnlyRootFilesystem: true
      resources:
        requests:
          memory: "64Mi"
          cpu: "50m"` },
    ],
    commands: ['kubectl label ns', 'kubectl apply -f'],
  },

  '08-03-resource-quotas': {
    id: '08-03-resource-quotas',
    phaseId: '08-production',
    number: 3,
    title: 'Resource Quotas & LimitRanges',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Prevent one team/app from consuming all cluster resources.' },
      { type: 'yaml', filename: 'resource-quota.yaml', code: `apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "4"
    requests.memory: "8Gi"
    limits.cpu: "8"
    limits.memory: "16Gi"
    persistentvolumeclaims: "5"
    count/secrets: "10"
    count/configmaps: "10"` },
      { type: 'yaml', filename: 'limitrange.yaml', code: `apiVersion: v1
kind: LimitRange
metadata:
  name: container-limits
  namespace: team-a
spec:
  limits:
    - max:
        cpu: "2"
        memory: "2Gi"
      min:
        cpu: "50m"
        memory: "32Mi"
      default:
        cpu: "200m"
        memory: "256Mi"
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      type: Container` },
      { type: 'command', prompt: '$', cmd: 'kubectl create namespace team-a && kubectl apply -f resource-quota.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl describe quota -n team-a', output: 'Name:            team-quota\nNamespace:       team-a\nResource         Used  Hard\n--------         ---   ---\nrequests.cpu     0     4\nrequests.memory  0     8Gi\nlimits.cpu       0     8\nlimits.memory    0     16Gi' },
    ],
    commands: ['kubectl apply -f resource-quota', 'kubectl describe quota'],
  },

  '08-04-secrets-management': {
    id: '08-04-secrets-management',
    phaseId: '08-production',
    number: 4,
    title: 'Secrets Management',
    type: 'build',
    difficulty: 'expert',
    duration: '20 min',
    sections: [
      { type: 'warning', body: 'K8s Secrets are NOT encrypted by default — they\'re base64-encoded in etcd. Use External Secrets, Sealed Secrets, or Vault for real security.' },
      { type: 'heading', level: 2, text: 'External Secrets Operator' },
      { type: 'yaml', filename: 'external-secret.yaml', code: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-credentials
  data:
    - secretKey: password
      remoteRef:
        key: production/db/password` },
      { type: 'heading', level: 2, text: 'Sealed Secrets' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl create secret generic my-secret --dry-run=client --from-literal=password=s3cret -o json | kubeseal --controller-namespace=kube-system --format yaml > sealed-secret.yaml' },
      { type: 'text', body: 'The sealed-secret.yaml is safe to commit to Git. Only the Sealed Secrets controller in your cluster can decrypt it.' },
    ],
    commands: ['kubectl apply -f sealed-secrets', 'kubeseal', 'kubectl apply -f sealed-secret'],
  },

  '08-05-cicd-argocd': {
    id: '08-05-cicd-argocd',
    phaseId: '08-production',
    number: 5,
    title: 'CI/CD & GitOps with ArgoCD',
    type: 'capstone',
    difficulty: 'expert',
    duration: '25 min',
    sections: [
      { type: 'text', body: 'GitOps with ArgoCD is the modern standard: Git is the single source of truth, and ArgoCD syncs cluster state to match Git.' },
      { type: 'uml', preset: 'gitops', title: 'Push to Git — the cluster reconciles itself' },
      { type: 'heading', level: 2, text: 'GitHub Actions CI/CD' },
      { type: 'yaml', filename: '.github/workflows/deploy.yaml', code: `name: Deploy to K8s
on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
      - name: Update deployment YAML
        run: |
          sed -i "s|image: .*|image: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}|" k8s/deployment.yaml
      - name: Deploy to K8s
        uses: actions-hub/kubectl@master
        env:
          KUBE_CONFIG: \${{ secrets.KUBE_CONFIG }}
        with:
          args: apply -f k8s/` },
      { type: 'heading', level: 2, text: 'ArgoCD' },
      { type: 'command', prompt: '$', cmd: 'kubectl create namespace argocd' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml' },
      { type: 'command', prompt: '$', cmd: 'kubectl port-forward -n argocd svc/argocd-server 8080:443' },
      { type: 'yaml', filename: 'argocd-app.yaml', code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
spec:
  destination:
    namespace: production
    server: https://kubernetes.default.svc
  project: default
  source:
    repoURL: https://github.com/myorg/my-app-config
    targetRevision: main
    path: k8s/production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true` },
    ],
    commands: ['kubectl apply -f argocd', 'kubectl port-forward'],
  },

  '08-06-cost-optimization': {
    id: '08-06-cost-optimization',
    phaseId: '08-production',
    number: 6,
    title: 'Cost Optimization',
    type: 'learn',
    difficulty: 'expert',
    duration: '15 min',
    sections: [
      { type: 'heading', level: 2, text: 'Right-Sizing' },
      { type: 'command', prompt: '$', cmd: 'kubectl top pods -n myapp', output: 'NAME                    CPU(cores)   MEMORY(bytes)\napi-7d8f9c-x3k2m       5m           32Mi\napi-7d8f9c-x3k2n       8m           48Mi' },
      { type: 'table', headers: ['Signal', 'Action'], rows: [
        ['CPU request > actual usage', 'Lower CPU request'],
        ['Memory request > actual × 1.5', 'Lower memory request'],
        ['Pod using < 10% of CPU limit', 'Lower limit or reduce replicas'],
        ['No resource limits set', 'Add them (pods can DoS the node)'],
      ]},
      { type: 'heading', level: 2, text: 'Spot Instances (80-90% cheaper)' },
      { type: 'command', prompt: '$', cmd: 'eksctl create nodegroup --spot --instance-types=m5.large,m5.xlarge,m5.2xlarge' },
      { type: 'heading', level: 2, text: 'Production Checklist' },
      { type: 'text', body: 'Before going live: Resource limits on all containers, readiness + liveness probes, PDB for critical services, RBAC (no cluster-admin for apps), network policies (default deny), Pod Security Standards (at least baseline), resource quotas, secrets with External/Sealed Secrets, Velero backups, Prometheus + Grafana alerts, centralized logging, tested rollout undo, CI/CD, anti-affinity, Cluster Autoscaler.' },
    ],
    commands: ['kubectl top pods', 'eksctl create nodegroup --spot'],
  },

  '09-01-daemonsets': {
    id: '09-01-daemonsets',
    phaseId: '09-advanced-workloads',
    number: 1,
    title: 'DaemonSets',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'A DaemonSet ensures all (or some) nodes run a copy of a pod. As nodes are added or removed, the DaemonSet automatically adds or removes pods. Common use cases: kube-proxy, CNI plugins, log collectors, monitoring agents.' },
      { type: 'yaml', filename: 'daemonset.yaml', code: 'apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: fluentd\nspec:\n  selector:\n    matchLabels:\n      app: fluentd\n  template:\n    metadata:\n      labels:\n        app: fluentd\n    spec:\n      containers:\n      - name: fluentd\n        image: fluent/fluentd:v1.16-debian\n        volumeMounts:\n        - name: varlog\n          mountPath: /var/log\n      volumes:\n      - name: varlog\n        hostPath:\n          path: /var/log' },
      { type: 'command', prompt: '$', cmd: 'kubectl get daemonsets', output: 'NAME     DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   AGE\nfluentd  3         3         3       3            3           2m' },
    ],
    commands: ['kubectl get daemonsets'],
  },
  '09-02-jobs-cronjobs': {
    id: '09-02-jobs-cronjobs',
    phaseId: '09-advanced-workloads',
    number: 2,
    title: 'Jobs and CronJobs',
    type: 'build',
    difficulty: 'advanced',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'A Job creates pods that run to completion. A CronJob runs Jobs on a schedule. Jobs handle batch processing, data migration, and backups.' },
      { type: 'yaml', filename: 'job.yaml', code: 'apiVersion: batch/v1\nkind: Job\nmetadata:\n  name: pi\nspec:\n  template:\n    spec:\n      containers:\n      - name: pi\n        image: perl:5.34\n        command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]\n      restartPolicy: Never' },
      { type: 'command', prompt: '$', cmd: 'kubectl apply -f job.yaml', output: 'job.batch/pi created' },
      { type: 'yaml', filename: 'cronjob.yaml', code: 'apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: daily-backup\nspec:\n  schedule: "0 2 * * *"\n  concurrencyPolicy: Forbid\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n          - name: backup\n            image: alpine:3.19\n            command: ["sh", "-c", "tar czf /backup/data.tar.gz /data"]\n          restartPolicy: OnFailure' },
    ],
    commands: ['kubectl get jobs', 'kubectl create cronjob'],
  },
  '09-03-taints-tolerations': {
    id: '09-03-taints-tolerations',
    phaseId: '09-advanced-workloads',
    number: 3,
    title: 'Taints and Tolerations',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Taints repel pods from nodes. Tolerations allow pods onto tainted nodes. Effects: NoSchedule (block new), PreferNoSchedule (soft block), NoExecute (evict existing).' },
      { type: 'command', prompt: '$', cmd: 'kubectl taint nodes worker1 gpu=true:NoSchedule', output: 'node/worker1 tainted' },
      { type: 'command', prompt: '$', cmd: 'kubectl taint nodes worker1 gpu=true:NoSchedule-', output: 'node/worker1 untainted' },
    ],
    commands: ['kubectl taint nodes'],
  },
  '09-04-topology-spread': {
    id: '09-04-topology-spread',
    phaseId: '09-advanced-workloads',
    number: 4,
    title: 'Topology Spread Constraints',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Topology Spread Constraints control pod distribution across failure domains like zones and nodes. Essential for high availability across multiple availability zones.' },
      { type: 'yaml', filename: 'deployment.yaml', code: 'apiVersion: apps/v1\nkind: Deployment\nspec:\n  template:\n    spec:\n      topologySpreadConstraints:\n      - maxSkew: 1\n        topologyKey: topology.kubernetes.io/zone\n        whenUnsatisfiable: DoNotSchedule\n        labelSelector:\n          matchLabels:\n            app: web' },
    ],
    commands: ['kubectl get nodes --show-labels'],
  },
  '09-05-priority-preemption': {
    id: '09-05-priority-preemption',
    phaseId: '09-advanced-workloads',
    number: 5,
    title: 'Priority Classes',
    type: 'learn',
    difficulty: 'advanced',
    duration: '15 min',
    sections: [
      { type: 'text', body: 'Priority Classes define pod importance. When resources are scarce, the scheduler evicts lower-priority pods to make room for higher-priority ones.' },
      { type: 'yaml', filename: 'priorityclass.yaml', code: 'apiVersion: scheduling.k8s.io/v1\nkind: PriorityClass\nmetadata:\n  name: high-priority\nvalue: 1000000\nglobalDefault: false' },
      { type: 'command', prompt: '$', cmd: 'kubectl get priorityclasses', output: 'NAME                      VALUE        AGE\nhigh-priority             1000000      5m\nsystem-cluster-critical   2000000000   24h' },
    ],
    commands: ['kubectl get priorityclasses'],
  },
  '09-06-init-sidecar-ephemeral': {
    id: '09-06-init-sidecar-ephemeral',
    phaseId: '09-advanced-workloads',
    number: 6,
    title: 'Init, Sidecar and Ephemeral Containers',
    type: 'build',
    difficulty: 'expert',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Init containers run before app containers start. Sidecar containers run alongside for logging or proxying. Ephemeral containers are temporary debug containers injected into running pods.' },
      { type: 'yaml', filename: 'pod.yaml', code: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: with-init\nspec:\n  initContainers:\n  - name: wait-db\n    image: postgres:16-alpine\n    command: ["sh", "-c", "until pg_isready -h db; do sleep 2; done"]\n  containers:\n  - name: app\n    image: my-app' },
      { type: 'command', prompt: '$', cmd: 'kubectl debug pod/my-pod -it --image=nicolaka/netshoot --copy-to=my-pod-debug' },
    ],
    commands: ['kubectl debug'],
  },
  '10-01-crds-operators': {
    id: '10-01-crds-operators',
    phaseId: '10-extending-k8s',
    number: 1,
    title: 'CRDs and Operators',
    type: 'build',
    difficulty: 'expert',
    duration: '25 min',
    sections: [
      { type: 'text', body: 'CRDs extend the Kubernetes API with your own resource types. Operators automate operational knowledge into software.' },
      { type: 'yaml', filename: 'crd.yaml', code: 'apiVersion: apiextensions.k8s.io/v1\nkind: CustomResourceDefinition\nmetadata:\n  name: backups.example.com\nspec:\n  group: example.com\n  scope: Namespaced\n  names:\n    plural: backups\n    singular: backup\n    kind: Backup\n  versions:\n  - name: v1\n    served: true\n    storage: true\n    schema:\n      openAPIV3Schema:\n        type: object\n        properties:\n          spec:\n            type: object\n            properties:\n              source:\n                type: string\n              schedule:\n                type: string' },
    ],
    commands: ['kubectl get crds'],
  },
  '10-02-service-mesh': {
    id: '10-02-service-mesh',
    phaseId: '10-extending-k8s',
    number: 2,
    title: 'Service Mesh with Istio',
    type: 'learn',
    difficulty: 'expert',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'A service mesh adds transparent infrastructure for service-to-service communication. Istio provides traffic management, mTLS security, and observability.' },
      { type: 'command', prompt: '$', cmd: 'istioctl install --set profile=demo', output: 'Istio core installed\nIstiod installed' },
    ],
    commands: ['istioctl install'],
  },
  '10-03-cilium-ebpf': {
    id: '10-03-cilium-ebpf',
    phaseId: '10-extending-k8s',
    number: 3,
    title: 'Cilium and eBPF',
    type: 'learn',
    difficulty: 'expert',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Cilium is a CNI plugin powered by eBPF, providing networking, observability, and security without kernel modifications.' },
      { type: 'command', prompt: '$', cmd: 'kubectl -n kube-system exec daemonset/cilium -- cilium status' },
    ],
    commands: ['cilium status'],
  },
  '10-04-kyverno-opa': {
    id: '10-04-kyverno-opa',
    phaseId: '10-extending-k8s',
    number: 4,
    title: 'Policy as Code',
    type: 'learn',
    difficulty: 'expert',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Kyverno and OPA Gatekeeper enforce policies via admission controllers. Kyverno uses YAML; OPA uses Rego.' },
      { type: 'yaml', filename: 'kyverno.yaml', code: 'apiVersion: kyverno.io/v1\nkind: ClusterPolicy\nmetadata:\n  name: require-labels\nspec:\n  validationFailureAction: Enforce\n  rules:\n  - name: check-labels\n    match:\n      resources:\n        kinds:\n        - Pod\n    validate:\n      message: "Owner label required"\n      pattern:\n        metadata:\n          labels:\n            owner: "?*"' },
    ],
    commands: ['kubectl apply -f kyverno-policy.yaml'],
  },
  '10-05-multi-cluster': {
    id: '10-05-multi-cluster',
    phaseId: '10-extending-k8s',
    number: 5,
    title: 'Multi-Cluster Patterns',
    type: 'learn',
    difficulty: 'expert',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Organizations adopt multiple clusters for isolation, geography, and compliance. Tools include Cilium ClusterMesh, Karmada, and ArgoCD ApplicationSets.' },
      { type: 'table', headers: ['Pattern', 'Tool', 'Use Case'], rows: [
        ['Federation', 'Karmada', 'Unified control plane'],
        ['Multi-cluster networking', 'Cilium ClusterMesh', 'Pod-to-pod across clusters'],
        ['GitOps multi-cluster', 'ArgoCD AppSet', 'Deploy to many clusters'],
      ]},
    ],
    commands: ['kubectl config get-contexts'],
  },
  '10-06-k8s-api-deep-dive': {
    id: '10-06-k8s-api-deep-dive',
    phaseId: '10-extending-k8s',
    number: 6,
    title: 'Kubernetes API Deep Dive',
    type: 'learn',
    difficulty: 'expert',
    duration: '20 min',
    sections: [
      { type: 'text', body: 'Every kubectl command is an HTTP request to the API server. Understanding API versioning, deprecation policy, and watch semantics is essential.' },
      { type: 'command', prompt: '$', cmd: 'kubectl api-resources' },
      { type: 'command', prompt: '$', cmd: 'kubectl api-versions' },
    ],
    commands: ['kubectl api-resources', 'kubectl api-versions'],
  },

};