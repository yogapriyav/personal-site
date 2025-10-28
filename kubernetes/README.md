# Kubernetes

k3s cluster configuration and application deployment for yogapriyaveturi.com

## Design

### Technology Stack

- **Kubernetes Distribution**: k3s (lightweight Kubernetes)
- **Ingress Controller**: Traefik (built-in with k3s)
- **Certificate Management**: cert-manager (Let's Encrypt)
- **DNS**: CoreDNS (modified to use external resolvers)
- **Application**: Next.js containerized app

### Architecture

```
Internet
    ↓
Port 80/443
    ↓
EC2 Security Group
    ↓
Traefik Ingress (NodePort 80)
    ├─→ HTTP Challenge (.well-known/acme-challenge)
    └─→ Next.js Service (ClusterIP :80)
           ↓
        Next.js Pod(s)
```

### Manifest Structure

```
kubernetes/
├── base/
│   ├── deployment.yaml           # Next.js application deployment
│   ├── service.yaml              # ClusterIP service for app
│   ├── ingress.yaml              # Traefik ingress with TLS
│   ├── letsencrypt-issuer.yaml   # ClusterIssuer for cert-manager
│   └── certificate.yaml          # Certificate resource (optional)
└── overlays/                     # Future: dev/staging/prod
```

### Why k3s?

**Chosen for:**
- Lightweight (40MB binary vs 1GB+ for full k8s)
- Single-node capable (perfect for t2.micro)
- Production-grade (CNCF certified Kubernetes)
- Built-in Traefik ingress
- Low memory footprint (~300MB vs 1GB+)
- Full kubectl compatibility

**Compared to alternatives:**
- **vs EKS**: $72/month cheaper (no control plane cost)
- **vs Docker Compose**: Kubernetes API, better scaling, industry standard
- **vs Minikube**: Production-capable (CNCF certified), not just for development
- **vs kind**: Production-capable; kind is for local testing (runs in Docker containers)
- **vs microk8s**: Lighter weight, simpler setup

### Component Design

#### **1. Deployment** (`deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yogapriya-site
spec:
  replicas: 1                    # Single replica (resource-constrained)
  selector:
    matchLabels:
      app: yogapriya-site
  template:
    spec:
      containers:
      - name: nextjs
        image: yogapriyav/yogapriya-site:latest
        imagePullPolicy: Always  # Always pull latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"      # Prevent OOM on t2.micro
            cpu: "500m"
```

**Key decisions:**
- **Single replica**: t2.micro has limited memory (904MB total)
- **ImagePullPolicy: Always**: Ensures latest code deploys
- **Resource limits**: Prevents pod from consuming all node memory
- **No health checks yet**: TODO - add liveness/readiness probes

#### **2. Service** (`service.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: yogapriya-site
spec:
  type: ClusterIP              # Internal only
  selector:
    app: yogapriya-site
  ports:
  - port: 80
    targetPort: 3000
```

**Why ClusterIP:**
- Only Traefik needs to reach the app
- No need for external access to pods
- Keeps network surface minimal

#### **3. Ingress** (`ingress.yaml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: yogapriya-site-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
spec:
  rules:
  - host: yogapriyaveturi.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: yogapriya-site
            port:
              number: 80
  - host: www.yogapriyaveturi.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: yogapriya-site
            port:
              number: 80
  tls:
  - hosts:
    - yogapriyaveturi.com
    - www.yogapriyaveturi.com
    secretName: yogapriya-tls
```

**Key decisions:**
- **Both root and www**: Explicit handling of both domains
- **TLS secret reference**: cert-manager populates this automatically
- **Traefik annotations**: Routes through both HTTP (80) and HTTPS (443)

#### **4. ClusterIssuer** (`letsencrypt-issuer.yaml`)

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
```

**Why HTTP-01 challenge as against DNS-01 challenge:**
- HTTP-01 validates domain ownership by serving a token via HTTP on port 80, requiring no DNS API credentials. 
- This is simpler than DNS-01 (which requires DNS provider API access) and sufficient for our needs since we don't need wildcard certificates. 
- Traefik handles the challenge automatically.
- Sufficient for single domain validation

**Certificate lifecycle:**
- cert-manager watches Ingress resources
- Sees `cert-manager.io/cluster-issuer` annotation
- Creates Certificate resource automatically
- Initiates ACME challenge via Let's Encrypt
- Stores certificate in `yogapriya-tls` secret
- Traefik uses secret for TLS termination

#### **5. Traefik Configuration**

**Default k3s Traefik:** LoadBalancer type (doesn't work on EC2 without ELB)

**Our modification** (applied via Terraform):
```yaml
# traefik-nodeport-config.yaml
spec:
  type: NodePort
  ports:
  - name: web
    port: 80
    targetPort: 8000
    nodePort: 80        # Direct port 80 access
  - name: websecure
    port: 443
    targetPort: 8443
    nodePort: 443
```

**Why NodePort 80/443:**
- Direct external access without load balancer
- No additional AWS cost
- k3s installed with `--kube-apiserver-arg service-node-port-range=80-32767`
- Allows privileged ports 80/443 as NodePorts

#### **6. CoreDNS Configuration**

**Default CoreDNS:** Uses `/etc/resolv.conf` → AWS VPC DNS (10.0.0.2)

**Problem:** AWS VPC DNS couldn't resolve our domain during ACME challenges

**Our modification** (applied via Terraform):
```bash
kubectl get configmap coredns -n kube-system -o yaml | \
  sed 's|forward . /etc/resolv.conf|forward . 8.8.8.8 1.1.1.1|' | \
  kubectl apply -f -
```

**Why external DNS:**
- Google DNS (8.8.8.8) and Cloudflare (1.1.1.1) can resolve our domain
- Fixes ACME HTTP-01 challenge failures
- Applied automatically during terraform apply

---

## Issues & Remedies

### Issue 1: k3s TLS Certificate Missing Public IP

**Problem:**
kubectl commands failed with TLS verification error:
```
x509: certificate is valid for 10.0.1.208, 10.43.0.1, 127.0.0.1, ::1, 
not 3.18.40.123
```

**Root cause:**
k3s generates API server certificates for internal IPs only. Public IP not included in Subject Alternative Names (SAN).

**Symptom:**
- `kubectl get nodes` fails
- Cannot manage cluster from local machine
- kubeconfig uses public IP but cert doesn't include it

**Remedy:**
Reinstall k3s with `--tls-san` flag:
```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='--tls-san 3.18.40.123' sh -
```

Now automated in Terraform (`k3s-cert-update.tf`):
```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='--kube-apiserver-arg service-node-port-range=80-32767 --tls-san ${PUBLIC_IP}' sh -
```

**Why:** The `--tls-san` flag adds the public IP to the API server certificate's SAN list, allowing kubectl to verify the TLS connection.

---

### Issue 2: ServiceLB Port Conflict with Traefik

**Problem:**
ServiceLB pod stuck in pending state:
```bash
$ kubectl get pods -n kube-system
svclb-traefik-xxx   0/1   Pending
```

Error: `FailedScheduling: node(s) didn't have free ports`

**Root cause:**
k3s includes ServiceLB to handle LoadBalancer services on bare metal. ServiceLB tried to bind port 80 on the host, but Traefik (k3s's built-in ingress) was already using it.

**Remedy:**
Bypassed ServiceLB by patching Traefik to use NodePort directly:
```bash
kubectl patch svc traefik -n kube-system --patch-file traefik-nodeport-config.yaml
```

**traefik-nodeport-config.yaml:**
```yaml
spec:
  type: NodePort
  ports:
  - name: web
    port: 80
    targetPort: 8000
    nodePort: 80
```

**Why this works:**
- k3s installed with custom port range: `--kube-apiserver-arg service-node-port-range=80-32767`
- Allows NodePort to use privileged port 80
- Direct external access without ServiceLB
- No port conflict

**Why:** ServiceLB and Traefik both needed port 80. We chose Traefik (needed for ingress) and switched it to NodePort to avoid the conflict.

---

### Issue 3: cert-manager Webhook Initialization Timing

**Problem:**
ClusterIssuer creation failed immediately after cert-manager installation:
```
Error: failed calling webhook "webhook.cert-manager.io": 
x509: certificate signed by unknown authority
```

**Root cause:**
cert-manager's webhook needs time to generate and trust its own internal certificates after pod startup.

**Remedy:**
Added delays in Terraform provisioner:
```bash
kubectl apply -f cert-manager.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager --timeout=300s

# Additional buffer for webhook certificate generation
sleep 30

# NOW apply ClusterIssuer
kubectl apply -f letsencrypt-issuer.yaml
```

**Why:** The `kubectl wait` ensures pods are running, but the webhook needs additional time to generate and trust its certificates. 30 seconds provides sufficient buffer.

---

### Issue 4: ACME Challenge DNS Resolution Failure

**Problem:**
Certificate requests failing with:
```
Waiting for HTTP-01 challenge propagation: 
failed to perform self check: Get "http://yogapriyaveturi.com/.well-known/acme-challenge/...": 
dial tcp: lookup yogapriyaveturi.com: no such host
```

**Root cause:**
CoreDNS configured to use AWS VPC DNS (10.0.0.2 via `/etc/resolv.conf`), which couldn't resolve our external domain.

**Why AWS VPC DNS failed:**
- VPC DNS is for internal AWS resources
- Our domain hosted in Route53 in different account/zone
- VPC DNS has no route to public DNS

**Remedy:**
Configure CoreDNS to use external DNS resolvers:
```bash
kubectl get configmap coredns -n kube-system -o yaml | \
  sed 's|forward . /etc/resolv.conf|forward . 8.8.8.8 1.1.1.1|' | \
  kubectl apply -f -

kubectl rollout restart deployment coredns -n kube-system
```

**Verification:**
```bash
# Test DNS from pod
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup yogapriyaveturi.com
```

**Why:** Google DNS (8.8.8.8) and Cloudflare (1.1.1.1) are public resolvers that can look up any domain. This allows cert-manager's self-check to resolve our domain during ACME challenges.

---

### Issue 5: Certificate Stuck in Pending State

**Problem:**
After applying Ingress and ClusterIssuer, certificate never reached Ready state:
```bash
$ kubectl get certificate
NAME             READY   SECRET           AGE
yogapriya-tls    False   yogapriya-tls    10m
```

**Root cause:**
Multiple issues compounding:
1. CoreDNS couldn't resolve domain (Issue #4)
2. Traefik not accessible from internet (Issue #2)
3. Let's Encrypt couldn't reach `.well-known/acme-challenge/` endpoint

**Debugging process:**
```bash
# Check certificate status
kubectl describe certificate yogapriya-tls

# Check order status
kubectl get orders

# Check challenge status
kubectl get challenges

# View cert-manager logs
kubectl logs -n cert-manager deploy/cert-manager -f
```

**Remedy:**
Fixed in order:
1. Patch Traefik to NodePort (Issue #2 fix)
2. Fix CoreDNS resolution (Issue #4 fix)
3. Wait for challenge to complete (5-10 minutes)

**Verification:**
```bash
# Watch certificate become ready
watch kubectl get certificate

# Check secret was created
kubectl get secret yogapriya-tls

# Test HTTPS
curl https://yogapriyaveturi.com
```

**Why:** ACME HTTP-01 challenge requires Let's Encrypt to reach `http://yourdomain/.well-known/acme-challenge/<token>`. All components (DNS, ingress, network) must work for this to succeed.

---

## Known Open Issues

### 1. No Liveness/Readiness Probes

**Status:** Missing Feature

**Issue:** Deployment has no health checks configured.

**Impact:**
- Kubernetes can't detect unhealthy pods
- Failed pods remain in service rotation
- No automatic restart on application hang

**TODO:**
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```

**Effort:** ~1 hour

---

### 2. Manual cert-manager Cleanup

**Status:** Operational Burden

**Issue:** After initial certificate issuance, cert-manager must be manually deleted to free memory:
```bash
kubectl delete namespace cert-manager
```

**Why:**
- cert-manager uses ~150MB of 904MB total
- Only needed during certificate renewal (every 60-90 days)
- Manual reinstall required for renewals

**Impact:**
- Requires remembering to reinstall cert-manager before expiry
- Manual process prone to forgetting
- No automated renewal

**Better approach:**
- Add calendar reminder for renewal
- Or upgrade to t3.small (2GB RAM) to keep cert-manager running
- Or create cronjob that reinstalls cert-manager weekly

**Effort:** ~2 hours for automated solution

---

### 3. Single Replica (No High Availability)

**Status:** Acceptable for Current Scale

**Issue:** Only one pod running at a time.

**Impact:**
- Pod restart = brief downtime
- No rolling updates
- No traffic distribution

**Why single replica:**
- t2.micro memory constraints (904MB)
- Personal website traffic doesn't require HA
- Cost vs. benefit doesn't justify larger instance

**To enable HA:**
```yaml
replicas: 2

# Add pod anti-affinity (requires multi-node cluster)
# Add HPA for auto-scaling
```

**Requirements:**
- Multi-node cluster OR
- Larger instance type (t3.small: 2GB RAM)

---

### 4. No Persistent Storage

**Status:** Acceptable for Stateless App

**Issue:** No PersistentVolumes configured. Any pod data is ephemeral.

**Impact:**
- Pod restart = data loss
- Cannot store uploads/logs persistently

**Current state:** Acceptable because Next.js app is stateless.

**Future needs:**
- If adding user uploads → EBS PersistentVolume
- If adding database → StatefulSet with PV
- If adding logging → EFK stack with PV

---

### 5. No Resource Requests/Limits Enforcement

**Status:** Configured but Not Enforced

**Issue:** Resource limits defined in deployment but no cluster-level quotas/limits.

**Current config:**
```yaml
resources:
  requests:
    memory: "128Mi"
  limits:
    memory: "256Mi"
```

**Missing:**
- LimitRange for default limits
- ResourceQuota for namespace limits
- Pod Priority Classes

**Impact:** Single misbehaving pod could consume all node resources.

**TODO:**
```yaml
# Create LimitRange
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
spec:
  limits:
  - max:
      memory: 512Mi
    type: Container
```

**Effort:** ~3 hours

---

## Certificate Management

### Initial Setup (Automated)

Certificate automatically requested during `terraform apply`:
1. cert-manager installed
2. ClusterIssuer created
3. Ingress triggers Certificate resource creation
4. ACME challenge completed
5. Certificate stored in `yogapriya-tls` secret
6. Traefik uses secret for TLS

**Timeline:** 5-10 minutes

### Manual Renewal Process

Certificates expire after 90 days. Renew at 60 days:

```bash
# 1. Reinstall cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# 2. Wait for ready
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager --timeout=300s
sleep 30

# 3. Apply ClusterIssuer
kubectl apply -f kubernetes/base/letsencrypt-issuer.yaml

# 4. Delete old certificate to trigger renewal
kubectl delete secret yogapriya-tls -n default

# 5. Wait for new certificate (watch for READY=True)
watch kubectl get certificate

# 6. Verify
curl https://yogapriyaveturi.com

# 7. Backup certificate
kubectl get secret yogapriya-tls -n default -o yaml > yogapriya-tls-backup.yaml

# 8. Cleanup cert-manager to free memory
kubectl delete namespace cert-manager
```

**TODO:** Automate this process with a cronjob or external monitoring.

---

## Operations

### Viewing Logs

```bash
# Application logs
kubectl logs -l app=yogapriya-site -f

# Traefik logs
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik -f

# cert-manager logs (when installed)
kubectl logs -n cert-manager deploy/cert-manager -f
```

### Checking Status

```bash
# Pods
kubectl get pods -A

# Services
kubectl get svc -A

# Ingress
kubectl get ingress

# Certificates
kubectl get certificate
kubectl describe certificate yogapriya-tls
```

### Deploying Updates

Updates are handled by GitHub Actions (see `.github/workflows/app-deploy.yml`):
1. Code pushed to main
2. Docker image built and pushed
3. Kubernetes deployment restarted
4. New pods pull latest image

Manual deployment:
```bash
kubectl rollout restart deployment/yogapriya-site
kubectl rollout status deployment/yogapriya-site
```

### Debugging

**Pod won't start:**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Ingress not routing:**
```bash
kubectl describe ingress yogapriya-site-ingress
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik
```

**Certificate issues:**
```bash
kubectl describe certificate yogapriya-tls
kubectl get orders
kubectl get challenges
kubectl describe challenge <challenge-name>
```

---

## Resources

- [k3s Documentation](https://docs.k3s.io/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Let's Encrypt ACME](https://letsencrypt.org/docs/)