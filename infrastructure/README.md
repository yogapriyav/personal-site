# Infrastructure

Terraform-managed AWS infrastructure for yogapriyaveturi.com

### Tech Stack

- **Infrastructure as Code**: Terraform 1.5+
- **Cloud Provider**: AWS
- **State Management**: S3 + DynamoDB (remote backend)
- **Compute**: EC2 t2.micro (Amazon Linux 2023)
- **Networking**: Default VPC, Security Groups, Elastic IP
- **DNS**: Route53 (hosted zone with A records)
- **Region**: us-east-2 (Ohio)

## Architecture

```
┌───────────────────────────────────────┐
│              Internet                 │
└─────────────────┬─────────────────────┘
                  │
         ┌────────▼─────────┐
         │   Route53 DNS    │
         │   Hosted Zone    │
         │   (us-east-1)    │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │  Elastic IP      │
         │  3.20.146.255    │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │   EC2 t2.micro   │
         │   (us-east-2)    │
         │   (904MB RAM)    │
         ├──────────────────┤
         │AMI: 2023 Standard│
         │  k3s cluster     │
         │  ├─ Traefik      │
         │  ├─ CoreDNS      │
         │  └─ Next.js app  │
         └──────────────────┘

State Storage (us-east-1):
├── S3: yogapriya-terraform-state
└── DynamoDB: yogapriya-terraform-locks
```

---

### Module Structure

Terraform code organized into reusable modules:

```
infrastructure/
├── main.tf                    # Root configuration, calls modules
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── data.tf                    # Data source lookups
├── terraform.tfvars           # Variable values (gitignored)
├── backend.tf                 # Remote state configuration
├── k3s-cert-update.tf         # Post-deployment k8s setup
├── traefik-nodeport-config.yaml
└── modules/
    ├── dns/                   # Route53 hosted zone & records
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── compute/               # EC2, EIP, security groups
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        └── data.tf            # AMI lookup
```

### Why Terraform?

**Chosen for:**
- Infrastructure as Code (version controlled, reviewable)
- Declarative syntax (describe desired state, not steps)
- State management (tracks actual vs desired infrastructure)
- Module reusability across projects
- Wide industry adoption and strong AWS support

**Compared to alternatives:**
- **vs CloudFormation**: Multi-cloud support, better syntax, larger community
- **vs Pulumi**: More mature, larger ecosystem, declarative approach
- **vs Manual Console**: Reproducible, automated, documented

### Component Design

#### **1. Compute Module** (`modules/compute/`)

**Resources:**
- EC2 t2.micro instance (1 vCPU, 904MB RAM)
- Elastic IP (static public addressing)
- Security Group (ports 22, 80, 443, 30080)
- SSH key pair for access

**Key decisions:**
- **t2.micro**: Free tier eligible, sufficient for k3s + small app
- **Amazon Linux 2023 Standard**: Clean, lightweight, AWS-optimized
- **Elastic IP**: Persistent address across restarts
- **user_data**: Automated k3s installation on boot

**AMI Selection:**
```hcl
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-kernel-*-x86_64"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}
```

Filters ensure:
- Standard AL2023 (not Deep Learning, ECS, GPU variants)
- Latest kernel version
- x86_64 architecture
- HVM virtualization

#### **2. DNS Module** (`modules/dns/`)

**Resources:**
- Route53 hosted zone (read via data source)
- A record for root domain → EIP
- A record for www subdomain → EIP

**Key decisions:**
- **Hosted zone as data source**: Prevents recreation (preserves nameservers) - but resource needs to be created first time!
- **TTL 300s**: Balance between propagation speed and caching
- **Separate A records**: Explicit control over root and www

**Flow:**
```
Porkbun (registrar) → Route53 Nameservers → Hosted Zone → A Records → EIP → EC2
```

#### **3. State Management**

**Backend configuration** (`backend.tf`):
```hcl
terraform {
  backend "s3" {
    bucket         = "yogapriya-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "yogapriya-terraform-locks"
    encrypt        = true
  }
}
```

**Why remote state:**
- Enables GitActions possibility (shared state with local terraform apply)
- State locking via DynamoDB (prevents concurrent modifications)
- Encryption at rest
- Version history in S3

**Why us-east-1 for state:**
- Standard region for global services
- Lower cost, higher reliability
- Kept separate from workload region (us-east-2)

#### **4. Post-Deployment Automation** (`k3s-cert-update.tf`)

**Null resource provisioner** that runs after EC2 creation with three-stage setup:

**Stage 1 - Remote exec (on EC2):**
```bash
# Wait for cloud-init to complete
# Reinstall k3s with custom port range (80-32767) and TLS SAN
# Configure for public IP access
```

**Stage 2 - Local exec (kubeconfig):**
```bash
# Download kubeconfig from EC2
# Replace 127.0.0.1 with public IP
# Save to ~/.kube/config
# Test connection
```

**Stage 3 - Local exec (k8s resources):**
```bash
# Patch Traefik to use NodePort 80
# Deploy application (deployment + service)
# Install cert-manager
# Wait for cert-manager readiness (with 30s webhook buffer)
# Configure CoreDNS to use external DNS (8.8.8.8, 1.1.1.1)
# Apply ClusterIssuer and Ingress
```

**Triggers:**
- Runs when EC2 instance ID changes
- Runs when EIP changes

**Why this approach:**
- Automates entire k8s setup in one terraform apply
- No manual kubectl commands needed
- Downloads kubeconfig automatically
- Idempotent (can re-run safely)
- All configuration in Terraform (single source of truth)

### Local Development

**Prerequisites:**
- Terraform 1.5+
- AWS CLI configured
- kubectl installed
- SSH key pair created

**Initial Setup:**

```bash
cd infrastructure

# Create terraform.tfvars
cat > terraform.tfvars << EOF
domain_name  = "yogapriyaveturi.com"
project_name = "yogapriya-site"
EOF

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply infrastructure
terraform apply
```

**What happens:**
1. S3 bucket + DynamoDB table (if first run)
2. EC2 instance with k3s via user_data
3. Elastic IP associated
4. Route53 DNS records updated
5. Kubeconfig downloaded to `~/.kube/yogapriya-config`
6. Application deployed to Kubernetes
7. cert-manager installed, TLS certificate requested

**Typical apply time:** ~10-15 minutes (waiting for cert-manager)

---

## Issues & Remedies

### Issue 1: Deep Learning AMI with CUDA Bloat

**Problem:**
Initial AMI selection captured a Deep Learning AMI with GPU drivers, consuming:
- 10GB disk space (CUDA libraries)
- Significant memory overhead
- Unnecessary complexity

**Root cause:**
AMI filter was too broad:
```hcl
filter {
  name   = "name"
  values = ["al2023-ami-*-x86_64"]  # Caught Deep Learning variant
}
```

**Symptom:**
- System sluggish
- k3s frequently crashing and in an unhealthy state
- Significant resource crunch on the t2.micro node
- App down and site would not load

```bash
$ du -h /usr/local/cuda-12.6
9.9G    /usr/local/cuda-12.6

$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p1   30G   16G   14G  91% /
```

**Remedy:**
More specific AMI filter:
```hcl
filter {
  name   = "name"
  values = ["al2023-ami-2023.*-kernel-*-x86_64"]  # Standard only
}
```

**Result after fix:**
- Disk usage: 91% → 21% (freed 10GB)
- Cleaner system without GPU drivers
- Better performance (no unnecessary services)

**Why:** The broad filter matched specialty AMIs. Adding "2023.*-kernel-*" pattern ensures standard AL2023 AMIs only.

---

### Issue 2: Route53 Hosted Zone Recreation

**Problem:**
Running `terraform destroy` followed by `terraform apply` would:
1. Destroy hosted zone
2. Create new hosted zone with different nameservers
3. Require updating Porkbun with new nameservers
4. DNS downtime during propagation

**Root cause:**
Hosted zone defined as `resource`, making it Terraform-managed and subject to destroy.

**Remedy:**
Changed to `data` source:
```hcl
# Before (managed resource)
resource "aws_route53_zone" "main" {
  name = var.domain_name
}

# After (read-only reference)
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}
```

**Workflow:**
1. Before first destroy: `terraform state rm module.dns.aws_route53_zone.main`
2. Update code to use `data` source
3. Hosted zone preserved across destroy/apply cycles

**Trade-off:**
- A records still get removed from state on destroy
- Must manually import them after apply:
  ```bash
  ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='yogapriyaveturi.com.'].Id" --output text | cut -d'/' -f3)
  terraform import module.dns.aws_route53_record.root ${ZONE_ID}_yogapriyaveturi.com_A
  terraform import module.dns.aws_route53_record.www ${ZONE_ID}_www.yogapriyaveturi.com_A
  ```

**Why:** Nameserver preservation is more critical than A record automation. Manual import is acceptable for rare destroy/recreate scenarios.

---

### Issue 3: cert-manager ClusterIssuer Timing

**Problem:**
ClusterIssuer application failed during terraform apply:
```
Error: failed calling webhook "webhook.cert-manager.io": 
x509: certificate signed by unknown authority
```

**Root cause:**
Terraform applied ClusterIssuer immediately after cert-manager installation, but webhook hadn't generated its internal certificates yet.

**Remedy:**
Added sleep after readiness check:
```bash
echo "Waiting for cert-manager to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s

echo "Waiting for webhook to initialize..."
sleep 30  # Give webhook time to generate certificates

echo "Applying ClusterIssuer..."
kubectl apply -f ../kubernetes/base/letsencrypt-issuer.yaml
```

**Why:** The readiness check confirms pods are running, but cert-manager's webhook needs additional time to generate and trust its own certificates. 30 seconds provides sufficient buffer.

---

### Issue 4: Terraform Module Dependency Ordering

**Problem:**
DNS module tried to create A records before Compute module created the EIP, causing errors.

**Root cause:**
Implicit dependency not recognized by Terraform:
```hcl
module "dns" {
  ec2_public_ip = module.compute.instance_public_ip  # Depends on compute
}

module "compute" {
  # Creates EIP
}
```

**Remedy:**
Terraform automatically handles this through variable references. The explicit reference `module.compute.instance_public_ip` creates the dependency graph.

**Verification:**
```bash
terraform graph | dot -Tpng > graph.png
# Shows compute → dns dependency
```

**Why:** Terraform's dependency resolution works correctly when modules are properly connected via outputs. No manual `depends_on` needed.

---

### Issue 5: kubectl Commands Timing Out

**Problem:**
During first apply, kubectl commands in provisioner would timeout or fail.

**Root cause:**
1. Kubeconfig not downloaded before kubectl commands ran
2. k3s not fully ready on EC2 instance

**Remedy:**
Proper ordering in provisioner:
```bash
# 1. Wait for instance to be fully booted
sleep 30

# 2. Download kubeconfig FIRST
ssh ec2-user@${IP} "sudo cat /etc/rancher/k3s/k3s.yaml" > ~/.kube/yogapriya-config
sed -i '' "s/127.0.0.1/${IP}/g" ~/.kube/yogapriya-config

# 3. Wait for k3s API to be responsive
echo "Waiting for k3s to be ready..."
sleep 20

# 4. NOW run kubectl commands
kubectl apply -f ...
```

**Why:** The provisioner must ensure kubeconfig exists and k3s is ready before executing kubectl commands. Sequential execution with sleeps prevents race conditions.

---

## Known Open Issues

### 1. Manual DNS Record Import After Destroy/Apply

**Status:** Workaround Documented

**Issue:** After `terraform destroy` and `terraform apply`, A records must be manually imported.

**Workaround:**
```bash
ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='yogapriyaveturi.com.'].Id" --output text | cut -d'/' -f3)
terraform import module.dns.aws_route53_record.root ${ZONE_ID}_yogapriyaveturi.com_A
terraform import module.dns.aws_route53_record.www ${ZONE_ID}_www.yogapriyaveturi.com_A
terraform apply  # Update with new IP
```

**Why not fixed:** 
- Preserving hosted zone (and nameservers) is more important
- Destroy/recreate is rare
- Manual import is acceptable trade-off

**Alternative:** Could script the import in a null_resource provisioner, but adds complexity for rare operation.

---

### 2. Hard-Coded Sleep Timers

**Status:** Technical Debt

**Issue:** Multiple `sleep` commands in provisioners with arbitrary values (20s, 30s).

**Impact:** 
- Wastes time if services start faster
- May be insufficient if services start slower
- Not idempotent

**Better approach:**
Use polling with retry:
```bash
# Instead of: sleep 30
# Use:
until kubectl get pods -n kube-system &> /dev/null; do
  echo "Waiting for k8s..."
  sleep 5
done
```

**Effort:** ~4 hours to replace all sleeps with proper health checks

---

### 3. No Disaster Recovery Plan

**Status:** Future Enhancement

**Issue:** No documented backup/restore procedures for:
- Terraform state (if S3 bucket deleted)
- EC2 data (if instance terminated)
- Kubernetes state (if cluster recreated)

**TODO:**
- [ ] Document state backup procedure
- [ ] Create S3 bucket versioning policy
- [ ] Document cluster backup/restore with Velero
- [ ] Test disaster recovery scenarios

**Effort:** ~8 hours

---

### 4. Single Region Deployment

**Status:** Acceptable for Current Scale

**Issue:** All infrastructure in single region (us-east-2). No high availability or disaster recovery.

**Impact:**
- Regional outage = complete downtime
- No automatic failover

**Future enhancement:**
- Multi-region deployment with Route53 health checks
- Cross-region S3 replication for state
- Global load balancing

**Not a priority:** Personal website doesn't require HA. Cost vs. benefit doesn't justify multi-region complexity.

---

## CI/CD Integration

Infrastructure changes are validated via GitHub Actions. Terraform plans are automatically generated for pull requests affecting the `infrastructure/` directory.

See [.github/workflows/README.md](../.github/workflows/README.md) for complete CI/CD pipeline documentation.

---

## Operations

### Common Tasks

**Check infrastructure status:**
```bash
terraform show
terraform output
```

**Update infrastructure:**
```bash
terraform plan   # Review changes
terraform apply  # Apply changes
```

**Access EC2 instance:**
```bash
ssh -i keys/yogapriya-key ec2-user@$(terraform output -raw ec2_public_ip)
```

**View Terraform state:**
```bash
terraform state list
terraform state show module.compute.aws_instance.main
```

**Refresh state from AWS:**
```bash
terraform refresh
```

### Debugging

**Common issues:**

1. **"Error acquiring state lock"**
   ```bash
   # Check DynamoDB for lock
   aws dynamodb scan --table-name yogapriya-terraform-locks
   
   # Force unlock (use carefully!)
   terraform force-unlock <LOCK_ID>
   ```

2. **"No valid credential sources"**
   ```bash
   # Verify AWS CLI configured
   aws sts get-caller-identity
   
   # Re-configure if needed
   aws configure
   ```

3. **"Resource already exists"**
   ```bash
   # Import existing resource
   terraform import <resource_address> <resource_id>
   ```

---

## Cost Breakdown

**Monthly costs (AWS Free Tier active):**

| Resource | Free Tier | Cost |
|----------|-----------|------|
| EC2 t2.micro | 750 hours/month | $0 |
| EIP (attached) | 1 EIP | $0 |
| Route53 hosted zone | N/A | $0.50 |
| Route53 queries | 1M queries | ~$0.01 |
| S3 state storage | 5GB | <$0.01 |
| DynamoDB | 25GB + 25 WCU/RCU | $0 |
| **Total** | | **~$0.51/month** |

**After free tier expires (12 months):**

| Resource | Cost |
|----------|------|
| EC2 t2.micro (730 hrs) | $8.47 |
| Route53 hosted zone | $0.50 |
| Route53 queries | ~$0.01 |
| S3 + DynamoDB | <$0.10 |
| **Total** | **~$9/month** |

**Upgrade path (t3.small for better performance):**
- EC2 t3.small: ~$15/month
- Total: ~$15.60/month

---

## Testing

**Current state:** Manual testing only

**TODO:**
- [ ] Terraform validation in CI/CD
- [ ] `terraform fmt` check
- [ ] `tflint` for best practices
- [ ] Cost estimation with Infracost
- [ ] Security scanning with Checkov

---

## Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)