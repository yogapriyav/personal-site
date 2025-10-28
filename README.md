# yogapriyaveturi.com

Personal website built as a portfolio project demonstrating production-grade infrastructure and modern SRE practices.

**Live Site:** https://yogapriyaveturi.com

---

## Project Overview

Full-stack web application with automated infrastructure provisioning, containerized deployment, and CI/CD pipelines. Built to showcase technical expertise while maintaining cost efficiency (~$0.51/month during AWS free tier).

### Tech Stack

- **Frontend:** Next.js 15.5.6 (React 18, TypeScript, Tailwind CSS)
- **Infrastructure:** Terraform (AWS: EC2, Route53, S3, DynamoDB)
- **Container Orchestration:** k3s (lightweight Kubernetes)
- **Ingress & TLS:** Traefik with Let's Encrypt certificates
- **CI/CD:** GitHub Actions
- **Container Registry:** Docker Hub

---

## Architecture

```
Internet
    ↓
Route53 DNS (yogapriyaveturi.com)
    ↓
Elastic IP (3.20.146.255)
    ↓
EC2 t2.micro (us-east-2)
├── k3s Cluster
│   ├── Traefik Ingress (NodePort 80/443)
│   ├── CoreDNS (external resolvers)
│   └── Next.js Pods
└── Amazon Linux 2023

Supporting Services:
├── S3 + DynamoDB (Terraform state)
├── Docker Hub (container images)
└── GitHub Actions (CI/CD)
```

### Data Flow

```
User Request
  → Route53 DNS resolution
    → Elastic IP routing
      → EC2 Security Group (ports 80/443)
        → Traefik Ingress
          → Next.js Service (ClusterIP)
            → Next.js Pod
              → Response
```

---

## Quick Start

### Prerequisites

- AWS CLI configured with credentials
- Terraform 1.5+
- kubectl installed
- Docker Desktop running
- Node.js 20+
- SSH key pair created

### Initial Deployment

```bash
# 1. Clone repository
git clone https://github.com/yogapriyav/yogapriya-site.git
cd yogapriya-site

# 2. Deploy infrastructure
cd infrastructure
terraform init
terraform apply

# 3. Wait for deployment (~10-15 minutes)
# Terraform will:
# - Create EC2 instance with k3s
# - Configure DNS
# - Deploy application
# - Request TLS certificate

# 4. Verify deployment
kubectl get pods -A
curl https://yogapriyaveturi.com
```

### Local Development

```bash
# Run app locally
cd app
npm install
npm run dev
# Visit http://localhost:3000

# Test Docker build
docker build -t yogapriya-site:test .
docker run -p 3000:3000 yogapriya-site:test
```

---

## Repository Structure

```
yogapriya-site/
├── app/                        # Next.js application
│   ├── src/                    # Source code
│   ├── Dockerfile              # Multi-stage build
│   └── README.md               # App documentation
│
├── infrastructure/             # Terraform IaC
│   ├── modules/
│   │   ├── compute/           # EC2, EIP, security groups
│   │   └── dns/               # Route53 hosted zone & records
│   ├── main.tf                # Root configuration
│   ├── backend.tf             # Remote state (S3 + DynamoDB)
│   ├── k3s-cert-update.tf     # Post-deployment automation
│   └── README.md              # Infrastructure documentation
│
├── kubernetes/                 # k8s manifests
│   └── base/
│       ├── deployment.yaml    # Application deployment
│       ├── service.yaml       # ClusterIP service
│       ├── ingress.yaml       # Traefik ingress with TLS
│       └── letsencrypt-issuer.yaml  # cert-manager config
│   └── README.md              # Kubernetes documentation
│
├── .github/workflows/          # CI/CD pipelines
│   ├── app-deploy.yml         # Docker build & k8s deployment
│   ├── infra-plan.yml         # Terraform validation
│   └── README.md              # CI/CD documentation
│
└── README.md                   # This file
```

---

## Documentation

### Component Documentation

Each component has detailed documentation covering design decisions, issues encountered, and operational procedures:

- **[app/README.md](app/README.md)** - Next.js application, Docker strategy, development workflow
- **[infrastructure/README.md](infrastructure/README.md)** - Terraform modules, AWS resources, state management
- **[kubernetes/README.md](kubernetes/README.md)** - k3s setup, manifests, certificate management
- **[.github/workflows/README.md](.github/workflows/README.md)** - CI/CD pipelines, secrets configuration, debugging

### Key Topics Covered

**Design Decisions:**
- Why Next.js vs alternatives
- Why k3s vs EKS/minikube/kind
- Why Terraform vs CloudFormation/Pulumi
- HTTP-01 vs DNS-01 ACME challenges
- NodePort vs LoadBalancer services

**Issues & Solutions:**
- Deep Learning AMI with CUDA bloat (10GB saved)
- Route53 hosted zone preservation
- cert-manager webhook timing
- ServiceLB port conflicts with Traefik
- CoreDNS resolution for ACME challenges
- k3s TLS certificate SAN configuration

---

## Cost Breakdown

### Current (AWS Free Tier)

| Resource | Monthly Cost |
|----------|--------------|
| EC2 t2.micro (750 hrs free tier) | $0 |
| Elastic IP (attached) | $0 |
| Route53 hosted zone | $0.50 |
| Route53 queries | ~$0.01 |
| S3 + DynamoDB (state) | <$0.01 |
| **Total** | **~$0.51** |

### After Free Tier (12 months)

| Resource | Monthly Cost |
|----------|--------------|
| EC2 t2.micro (730 hrs) | $8.47 |
| Route53 hosted zone | $0.50 |
| S3 + DynamoDB | <$0.10 |
| **Total** | **~$9/month** |

### Cost vs Alternatives

| Solution | Monthly Cost | Notes |
|----------|--------------|-------|
| **This setup** | $0.51 - $9 | Self-managed k3s |
| EKS | $72+ | Managed control plane alone |
| Vercel/Netlify | $0 - $20 | Limited infrastructure control |
| DigitalOcean | $6+ | Simpler but less learning |

**Savings:** ~$900/year vs EKS while maintaining full Kubernetes capabilities

---

## Key Features

### Infrastructure as Code
- 100% Terraform-managed infrastructure
- Modular design (compute, DNS, state management)
- Remote state with locking (S3 + DynamoDB)
- Automated post-deployment configuration

### Container Orchestration
- Production-grade k3s (CNCF certified)
- Lightweight (~300MB RAM footprint)
- Full kubectl compatibility
- Automated certificate management

### CI/CD Pipeline
- Automatic deployments on code changes
- Docker image versioning with commit SHA
- Zero-downtime rolling updates
- Terraform plan validation on PRs

### Security & Reliability
- TLS certificates via Let's Encrypt
- Automated renewal (90-day expiry)
- Security group restrictions
- SSH key-based access only

---

## Operational Tasks

### Deploying Code Changes

```bash
# Automated via GitHub Actions
git add app/
git commit -m "Update homepage"
git push origin main
# CI/CD builds Docker image and deploys automatically
```

### Infrastructure Changes

```bash
cd infrastructure
terraform plan    # Review changes
terraform apply   # Apply changes
```

### Certificate Renewal

Certificates auto-renew via cert-manager. Manual process documented in [kubernetes/README.md](kubernetes/README.md) for troubleshooting.

### Monitoring

```bash
# Check pod status
kubectl get pods -A

# View application logs
kubectl logs -l app=yogapriya-site -f

# Check certificate expiry
kubectl get certificate
```

---

## Learning Journey

### Technical Challenges Solved

1. **AMI Selection** - Avoided Deep Learning AMI, saved 10GB disk space
2. **DNS Preservation** - Used Terraform data source to prevent hosted zone recreation
3. **ServiceLB Conflicts** - Resolved Traefik/ServiceLB port 80 conflict with NodePort
4. **ACME Challenges** - Fixed CoreDNS to use external resolvers for domain validation
5. **cert-manager Timing** - Added webhook initialization buffer to prevent failures
6. **k3s Certificates** - Configured TLS SAN for remote kubectl access

### Skills Demonstrated

**Infrastructure:**
- AWS resource provisioning and networking
- Terraform module design and state management
- Cost optimization strategies

**Container Orchestration:**
- Kubernetes architecture and manifest design
- Service mesh and ingress configuration
- Resource management on constrained environments

**CI/CD:**
- GitHub Actions workflow design
- Docker multi-stage builds
- Automated deployment strategies

**Problem Solving:**
- Systematic debugging approach
- Root cause analysis
- Documentation of solutions

---

## Future Enhancements

### Short Term
- [ ] Add health checks (liveness/readiness probes)
- [ ] Implement proper error boundaries
- [ ] Fix ESLint issues (re-enable linting)
- [ ] Add unit and integration tests

### Medium Term
- [ ] Contact form with API backend
- [ ] Dynamic content via API routes
- [ ] CloudFront CDN for improved performance
- [ ] Automated certificate renewal (cronjob)

### Long Term
- [ ] Multi-region deployment (HA)
- [ ] Monitoring stack (Prometheus/Grafana)
- [ ] Log aggregation (Loki/ELK)
- [ ] Upgrade to t3.small for better performance

---

## Contributing

This is a personal portfolio project, but feedback and suggestions are welcome via issues or pull requests.

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Contact

- **Website:** https://yogapriyaveturi.com
- **LinkedIn:** [yogapriya-veturi](https://www.linkedin.com/in/yogapriya-veturi)
- **GitHub:** [@yogapriyav](https://github.com/yogapriyav)

---

Built with passion for learning and demonstrating modern SRE practices. Total infrastructure cost: ~$0.51/month during AWS free tier.