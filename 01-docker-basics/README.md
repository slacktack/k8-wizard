# 01 — Docker Basics

> Docker packages your application and its dependencies into a **container image** — a single portable artifact that runs identically on your laptop, your coworker's machine, a server, or the cloud.

## What You'll Learn

- What containers and images are
- Writing Dockerfiles
- Building, running, and publishing images
- Docker networking and volumes
- Multi-stage builds for smaller images
- Docker Compose for multi-service apps

---

## 1. Core Concepts

### Image vs Container

| Concept | What it is |
|---------|------------|
| **Image** | A read-only template with instructions to create a container. Like a class in OOP. |
| **Container** | A running instance of an image. Like an object — it has state, filesystem, network. |
| **Dockerfile** | A recipe that defines how to build an image. |
| **Registry** | Where images are stored (Docker Hub, GHCR, ECR, etc.) |
| **Docker daemon** | The background process that builds, runs, and manages containers. |

### Analogy

```
Dockerfile  ──build──►  Image  ──run──►  Container(s)
  (recipe)              (class)          (running instances)

Image = frozen snapshot of your app + OS layer
Container = that snapshot, running with its own filesystem/network
```

---

## 2. Your First Dockerfile

Create a file `Dockerfile` in an empty directory:

```dockerfile
# Start from a base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (layer caching optimization)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Expose a port (documentation — doesn't actually publish it)
EXPOSE 3000

# Command to run when container starts
CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build the image
docker build -t my-app:v1 .

# Run a container from it
docker run -d -p 3000:3000 --name my-container my-app:v1

# See it running
docker ps

# See logs
docker logs my-container

# Exec into the running container
docker exec -it my-container sh

# Stop and remove
docker stop my-container
docker rm my-container
```

---

## 3. The Dockerfile Instruction Set

```dockerfile
FROM        # Base image to start from (alpine, ubuntu, node, python, etc.)
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
HEALTHCHECK # Define how Docker checks if container is healthy
```

### CMD vs ENTRYPOINT

```dockerfile
# CMD is the default — can be overridden with `docker run my-app bash`
CMD ["node", "server.js"]

# ENTRYPOINT + CMD = executable + default args
ENTRYPOINT ["node"]
CMD ["server.js"]   # `docker run my-app` runs "node server.js"
                    # `docker run my-app app.js` runs "node app.js"
```

---

## 4. Multi-Stage Builds

The golden pattern for production images: **build in one stage, copy artifacts to a minimal runtime stage**.

```dockerfile
# ─── BUILD STAGE ───
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

# ─── RUNTIME STAGE ───
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

The final image is just **alpine + the compiled binary** — no Go compiler, no source code. Image size drops from ~1GB to ~15MB.

---

## 5. Docker Networking

```bash
# List networks
docker network ls

# Create a network
docker network create my-network

# Run containers on a specific network
docker run -d --network my-network --name api my-api:v1
docker run -d --network my-network --name web -p 80:80 my-web:v1

# Containers on the same network can resolve each other by name
# From 'web' container: curl http://api:3000
```

### Network Drivers

| Driver | Use Case |
|--------|----------|
| `bridge` | Default. Isolated network for containers on same host. |
| `host` | No network isolation — container uses host's network stack. |
| `overlay` | Multi-host networking (Swarm, K8s). |
| `none` | No networking at all. |

---

## 6. Volumes & Persistent Data

Containers are ephemeral — when you delete one, its filesystem is gone. Volumes persist data outside the container.

```bash
# Named volume (managed by Docker)
docker volume create my-data
docker run -d -v my-data:/app/data my-app

# Bind mount (your host directory)
docker run -d -v $(pwd)/data:/app/data my-app

# tmpfs mount (in-memory, for sensitive data)
docker run -d --tmpfs /app/tmp my-app
```

### Best Practices

- Use **named volumes** for persistent data (DBs, uploads)
- Use **bind mounts** for development (live code reload)
- Use **tmpfs** for secrets or cache that shouldn't touch disk

---

## 7. Docker Compose

Define multi-service applications in a single YAML file.

```yaml
# docker-compose.yml
version: "3.9"

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
  pgdata:
```

```bash
# Start everything
docker compose up -d

# See logs
docker compose logs -f

# Scale a service
docker compose up -d --scale api=3

# Stop and remove
docker compose down -v   # -v removes volumes too
```

---

## 8. Docker Best Practices

### Image Optimization

```dockerfile
# ✅ GOOD: Use .dockerignore (like .gitignore)
# .dockerignore
node_modules
.git
*.md
.env

# ✅ GOOD: Specific tags over 'latest'
FROM node:20-alpine       # explicit version
# FROM node:latest        # ❌ unpredictable

# ✅ GOOD: Layer ordering for cache (least-changed first)
COPY package*.json ./
RUN npm ci
COPY . .

# ✅ GOOD: Combine RUN commands to reduce layers
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# ✅ GOOD: Multi-stage builds for tiny production images
# ✅ GOOD: Use distroless or scratch for Go/Rust binaries
FROM gcr.io/distroless/base
COPY --from=builder /app/server .
```

### Running Containers

```bash
# Use --rm to auto-cleanup after stop
docker run --rm -p 3000:3000 my-app

# Resource limits — ALWAYS set these in production
docker run -d --memory="256m" --cpus="0.5" my-app

# Non-root user inside container
docker run --user 1000:1000 my-app
```

### Security

```dockerfile
# ✅ Create and use a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

---

## 9. Common Commands Cheat Sheet

```bash
docker build -t name:tag .        # Build image
docker images                     # List images
docker rmi name:tag              # Remove image
docker ps                        # List running containers
docker ps -a                     # List all containers
docker logs -f container-name    # Follow logs
docker exec -it container sh     # Shell into running container
docker cp file.txt container:/   # Copy file to container
docker stats                     # Live resource usage
docker system prune -a           # Clean everything unused
```

---

## Hands-On Exercises

### Exercise 1: Write a Dockerfile for a Node.js API

Create a `Dockerfile` for the sample app in `./apps/simple-api/`.

```bash
cd apps/simple-api
docker build -t simple-api .
docker run -d -p 3000:3000 simple-api
curl http://localhost:3000/health
```

### Exercise 2: Multi-stage build

Build an optimized Go app from `./apps/go-api/`. Run `docker images` and compare the image size before and after multi-stage.

### Exercise 3: Compose a full stack

```bash
cd apps/fullstack
docker compose up -d
curl http://localhost:3000
curl http://localhost:8080   # frontend
```

---

**Next:** [Module 02 — Kubernetes Basics + Kind](../02-kubernetes-basics/README.md)

**Reference:** [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) | [Docker Compose reference](https://docs.docker.com/compose/compose-file/)
