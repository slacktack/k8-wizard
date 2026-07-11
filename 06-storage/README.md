# 06 — Storage & Stateful Workloads

> Containers are ephemeral, but your data isn't. This module covers how Kubernetes handles persistent storage — from simple volumes to production databases running as StatefulSets.

## What You'll Learn

- Volumes vs PersistentVolumeClaims vs PersistentVolumes
- StorageClasses and dynamic provisioning
- StatefulSets: stable network IDs, ordered deployment, persistent storage per pod
- Running PostgreSQL on Kubernetes (for learning — not production)
- CSI drivers and backup strategies

---

## 1. The Storage Stack

```
Pod
  │  volumeMounts: /var/lib/data
  ▼
PersistentVolumeClaim (PVC)  ←─ User requests storage
  │  Requests: 10Gi, ReadWriteOnce
  │  storageClassName: fast
  ▼
PersistentVolume (PV)         ←─ Cluster resource (like a node)
  │  Capacity: 10Gi
  │  Access Modes: RWO
  │  Reclaim Policy: Retain
  ▼
StorageClass                  ←─ Defines HOW storage is provisioned
  │  provisioner: kubernetes.io/gce-pd / ebs.csi.aws.com / rancher.io/local-path
  ▼
Actual Storage (GCE PD, EBS volume, host directory, NFS share, etc.)
```

| Concept | Analogy | Who Creates It |
|---------|---------|----------------|
| **StorageClass** | A storage "tier" (SSD-fast, HDD-cheap, network-NFS) | Cluster admin |
| **PersistentVolume** | A specific storage unit (a disk) | Cluster admin OR StorageClass (dynamic) |
| **PersistentVolumeClaim** | A request for storage ("I need 10GB fast SSD") | Application developer |
| **VolumeMount** | Where to mount the storage in the pod | Application developer |

---

## 2. StorageClasses

In Kind, use the `standard` StorageClass that uses `rancher.io/local-path` (provisions host directories).

```bash
kubectl get storageclass
# NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE
# standard (default)   rancher.io/local-path   Delete          WaitForFirstConsumer
```

### Create a Custom StorageClass

```yaml
# storageclass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ssd
provisioner: rancher.io/local-path     # Uses host path (Kind)
  # For GKE:  pd.csi.storage.gke.io
  # For EKS:  ebs.csi.aws.com
  # For AKS:  disk.csi.azure.com
reclaimPolicy: Delete                   # Or Retain
volumeBindingMode: WaitForFirstConsumer  # Or Immediate
allowVolumeExpansion: true
```

---

## 3. PersistentVolumeClaim (PVC)

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce              # Single node read/write
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard     # Use default StorageClass
```

```bash
kubectl apply -f pvc.yaml
kubectl get pvc
kubectl get pv           # PV created automatically by the StorageClass
```

### Access Modes

| Mode | Description |
|------|-------------|
| `ReadWriteOnce` (RWO) | One node can read/write. Default for block storage. |
| `ReadOnlyMany` (ROX) | Many nodes can read. |
| `ReadWriteMany` (RWX) | Many nodes can read/write. NFS, EFS, Longhorn. |
| `ReadWriteOncePod` (RWOP) | One pod can read/write (K8s 1.22+). |

### Use PVC in a Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: data-pod
spec:
  containers:
    - name: app
      image: nginx:alpine
      volumeMounts:
        - name: data
          mountPath: /usr/share/nginx/html
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: data-pvc
```

---

## 4. StatefulSet — Stateful Workloads

A Deployment is for stateless apps. A **StatefulSet** is for apps that need:

- **Stable, unique network identities** (pod-0, pod-1, pod-2)
- **Stable persistent storage** (each pod gets its own PVC)
- **Ordered, graceful deployment and scaling**

### StatefulSet vs Deployment

| Feature | Deployment | StatefulSet |
|---------|-----------|-------------|
| Pod names | Random (api-7d8f9c-x3k2m) | Ordered (db-0, db-1, db-2) |
| Pod identity | Ephemeral | Stable (survives restart) |
| Storage | Shared (same PVC for all pods) | Dedicated per pod (db-0 → pvc-db-0) |
| Scaling | Any order | Ordered (0, 1, 2... up; 2, 1, 0... down) |
| Use case | APIs, web servers | Databases, message queues, caches |

### StatefulSet Example

```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: web               # Headless service for stable DNS
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
  volumeClaimTemplates:           # Creates PVC per replica
    - metadata:
        name: www
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
        storageClassName: standard
---
# Headless service — required for StatefulSet DNS
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  clusterIP: None
  selector:
    app: web
  ports:
    - port: 80
```

```bash
kubectl apply -f statefulset.yaml

# Pods are created in order: web-0, web-1, web-2
kubectl get pods -w

# Each pod gets its own PVC
kubectl get pvc
# NAME        STATUS   VOLUME
# www-web-0   Bound    pvc-xxx
# www-web-1   Bound    pvc-yyy
# www-web-2   Bound    pvc-zzz

# Stable DNS names
kubectl run test --rm -it --image=busybox -- nslookup web-0.web
# web-0.web.default.svc.cluster.local
```

---

## 5. Running PostgreSQL on Kubernetes (Learning Example)

```yaml
# postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1                     # Production would use 3+ with replication
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
  clusterIP: None                  # Headless — for direct pod DNS
  selector:
    app: postgres
  ports:
    - port: 5432
---
apiVersion: v1
kind: Secret
metadata:
  name: pg-secret
type: Opaque
stringData:
  password: changeme123
```

```bash
# Deploy
kubectl apply -f postgres-statefulset.yaml

# Wait for it to be ready
kubectl rollout status statefulset/postgres

# Connect from another pod
kubectl run pg-client --rm -it --image=postgres:16-alpine -- psql \
  -h postgres-0.postgres \
  -U app \
  -d myapp
```

### ⚠️ Database on K8s — The Reality

Running stateful workloads on K8s is production-viable but non-trivial:

| Challenge | Solution |
|-----------|----------|
| Data loss on node failure | Replication, backups, PV reclaim policy = Retain |
| Performance overhead | Tune CSI driver, use local SSDs with local-ssd-provisioner |
| Backup complexity | Tools: Velero, pg_dump cronjobs, cloud-native snapshots |
| Operational complexity | Operators: CloudNative PG, Zalando Postgres Operator, KubeDB |

**For learning on Kind**, the above example works great. **For production**, use a managed database (RDS, Cloud SQL) or a DB operator.

---

## 6. CSI Drivers (Container Storage Interface)

CSI is the standard plugin interface for storage vendors. Each cloud provider has one:

```bash
# EBS (AWS)
kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.26"

# PersistentDisk (GCP)
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gcp-compute-persistent-disk-csi-driver/master/deploy/kubernetes/overlays/external/stable/apply.html

# Azure Disk
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/main/deploy/install-driver.sh
```

---

## 7. Backup Strategies

### Velero (Standard Approach)

```bash
# Install Velero
velero install \
  --provider aws \
  --bucket k8s-backups \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1

# Backup everything
velero backup create daily-backup --include-namespaces default

# Schedule backups
velero schedule create daily --schedule="0 1 * * *" --include-namespaces myapp

# Restore
velero restore create --from-backup daily-backup
```

### Simple Approach for Kind

```bash
# Backup PVC data
kubectl run backup --rm -it --image=busybox -- \
  tar czf - -C /mnt/data . > backup-$(date +%Y%m%d).tar.gz
# Restore:
kubectl run restore --rm -it --image=busybox -- \
  tar xzf - -C /mnt/data < backup-20240101.tar.gz
```

---

## 8. Storage Patterns by Workload

| Workload | Storage Pattern | Example |
|----------|----------------|---------|
| **Stateless API** | No storage, or shared ConfigMap | Deployment + ConfigMap |
| **File uploads** | PVC + Deployment (single writer) | One pod mounts PVC RW |
| **Shared files** | RWX volume (NFS, EFS, JuiceFS) | Multiple pods read/write |
| **Database** | StatefulSet + PVC per replica | PostgreSQL, MySQL, MongoDB |
| **Cache** | EmptyDir (ephemeral, in-memory) | Redis, Memcached |
| **ML Models** | PVC with ReadOnlyMany | Multiple inference pods read |
| **Logs** | HostPath or DaemonSet + sidecar | Fluentd, Filebeat |

---

**Next:** [Module 07 — Monitoring & Observability](../07-monitoring/README.md)

**Reference:** [K8s Storage](https://kubernetes.io/docs/concepts/storage/) | [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) | [Velero](https://velero.io/docs/)
