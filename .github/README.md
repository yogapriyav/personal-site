# CI/CD Workflows

Automated deployment and validation pipelines for yogapriyaveturi.com

## Overview

Two GitHub Actions workflows automate the deployment pipeline:

| Workflow | Trigger | Purpose | Output |
|----------|---------|---------|--------|
| **app-deploy.yml** | Push to `main` with `app/` changes | Build Docker image, deploy to k8s | Updated application in production |
| **infra-plan.yml** | Push to `main` with `infrastructure/` changes | Validate Terraform, show plan | PR comment with infrastructure changes |

---

## Workflow: app-deploy.yml

**Full path:** `.github/workflows/app-deploy.yml`

### Trigger

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'app/**'
```

Runs when code is pushed to `main` branch AND changes are in the `app/` directory.

### Steps

1. **Checkout code** - Clone repository
2. **Docker login** - Authenticate to Docker Hub using `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
3. **Build image** - `docker build -t yogapriyav/yogapriya-site:latest`
4. **Tag with commit SHA** - `docker tag yogapriyav/yogapriya-site:latest yogapriyav/yogapriya-site:${{ github.sha }}`
5. **Push to Docker Hub** - Upload both `latest` and SHA-tagged images
6. **Configure kubectl** - Download kubeconfig from secrets
7. **Update deployment** - `kubectl set image deployment/yogapriya-site nextjs=yogapriyav/yogapriya-site:${{ github.sha }}`
8. **Rollout restart** - `kubectl rollout restart deployment/yogapriya-site`
9. **Wait for rollout** - `kubectl rollout status deployment/yogapriya-site`

### Duration

**Typical run time:** 3-5 minutes

### Secrets Required

| Secret | Purpose | How to obtain |
|--------|---------|---------------|
| `DOCKER_USERNAME` | Docker Hub login | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub authentication | Create token at hub.docker.com → Account Settings → Security |
| `KUBE_CONFIG` | Kubernetes cluster access | Content of `~/.kube/yogapriya-config` (base64 encoded) |

### Success Criteria

- Docker build completes without errors
- Image successfully pushed to Docker Hub
- Kubernetes deployment updated
- New pods running and passing readiness checks
- Old pods terminated gracefully

### Verification

After workflow completes:

```bash
# Check deployment status
kubectl rollout status deployment/yogapriya-site

# Verify new pods running
kubectl get pods -l app=yogapriya-site

# Check image version
kubectl describe deployment yogapriya-site | grep Image

# Test site
curl https://yogapriyaveturi.com
```

---

## Workflow: infra-plan.yml

**Full path:** `.github/workflows/infra-plan.yml`

### Trigger

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'
```

Runs when code is pushed to `main` branch AND changes are in the `infrastructure/` directory.

### Steps

1. **Checkout code** - Clone repository
2. **Setup Terraform** - Install Terraform CLI
3. **Configure AWS credentials** - Use `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets
4. **Terraform init** - Initialize backend and download providers
5. **Terraform validate** - Check syntax and configuration
6. **Terraform plan** - Generate execution plan showing proposed changes
7. **Comment on PR** (if pull request) - Post plan output as PR comment

### Duration

**Typical run time:** 1-2 minutes

### Secrets Required

| Secret | Purpose | How to obtain |
|--------|---------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS authentication | Create IAM user with appropriate permissions |
| `AWS_SECRET_ACCESS_KEY` | AWS authentication | From IAM user creation |

### Success Criteria

- Terraform configuration valid
- Plan generates without errors
- No unexpected resource changes

### Note on Apply

**Important:** This workflow does NOT apply changes automatically. Infrastructure changes require manual `terraform apply` for safety.

**To apply infrastructure changes:**
1. Review plan output from workflow
2. SSH into local machine with AWS credentials
3. Run `terraform apply` manually
4. Verify changes

---

## Setting Up Secrets

### Adding Secrets to GitHub

1. Navigate to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

**For Docker Hub:**
```bash
# Secret name: DOCKER_USERNAME
# Value: yogapriyav

# Secret name: DOCKER_PASSWORD  
# Value: (Docker Hub access token)
```

**For Kubernetes:**
```bash
# Secret name: KUBE_CONFIG
# Value: Base64 encoded kubeconfig

# Generate value:
cat ~/.kube/yogapriya-config | base64
```

**For AWS:**
```bash
# Secret name: AWS_ACCESS_KEY_ID
# Value: (from IAM user)

# Secret name: AWS_SECRET_ACCESS_KEY
# Value: (from IAM user)
```

---

## Debugging Failed Workflows

### Docker Build Failures

**Symptom:** Build step fails with error

**Common causes:**
- ESLint errors (check app code)
- Missing dependencies in package.json
- Dockerfile syntax errors

**Debug:**
1. Check workflow logs for specific error
2. Reproduce locally: `docker build -t test .`
3. Fix issue in code
4. Push fix to trigger new workflow

### Docker Push Failures

**Symptom:** Push step fails with authentication error

**Common causes:**
- Invalid Docker Hub credentials
- Expired access token
- Username/password mismatch

**Fix:**
1. Regenerate Docker Hub token
2. Update `DOCKER_PASSWORD` secret in GitHub
3. Re-run workflow

### Kubernetes Deployment Failures

**Symptom:** Deployment update fails or pods crash

**Common causes:**
- Invalid kubeconfig in secrets
- Cluster unreachable
- Resource limits exceeded (OOM)

**Debug:**
```bash
# Check pod status
kubectl get pods -l app=yogapriya-site

# View pod logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Terraform Plan Failures

**Symptom:** Terraform validate or plan fails

**Common causes:**
- Syntax errors in .tf files
- Missing required variables
- Invalid AWS credentials
- State lock issues

**Debug:**
1. Check workflow logs for error details
2. Reproduce locally:
   ```bash
   cd infrastructure
   terraform init
   terraform validate
   terraform plan
   ```
3. Fix configuration
4. Push fix

---

## Workflow Optimization

### Current Performance

| Workflow | Duration | Bottleneck |
|----------|----------|------------|
| app-deploy.yml | 3-5 min | Docker build |
| infra-plan.yml | 1-2 min | Terraform init |

### Potential Improvements

**For app-deploy.yml:**
- Use Docker layer caching (GitHub Actions cache)
- Parallelize image builds for multiple architectures
- Skip build if no app changes (currently prevented by path filter)

**For infra-plan.yml:**
- Cache Terraform providers
- Skip validation if only documentation changed
- Add automatic apply for specific scenarios (e.g., variable changes only)

---

## Best Practices

### Branch Protection

Recommended settings for `main` branch:
- Require pull request reviews
- Require status checks to pass (workflows must succeed)
- Require branches to be up to date
- Include administrators in restrictions

### Deployment Strategy

**Current:** Direct deployment to production on `main` push

**Better (future):**
- Deploy to staging environment first
- Run smoke tests
- Manual approval gate
- Deploy to production

### Secrets Rotation

**Recommendation:** Rotate secrets every 90 days
- Docker Hub tokens
- AWS access keys
- Kubernetes certificates (Let's Encrypt handles TLS certs automatically)

---

## Troubleshooting Commands

### Re-run Failed Workflow

GitHub UI: Go to Actions → Failed workflow → Re-run failed jobs

### Force New Deployment

```bash
# Manually trigger rollout (bypasses GitHub Actions)
kubectl rollout restart deployment/yogapriya-site

# Or update image directly
kubectl set image deployment/yogapriya-site \
  nextjs=yogapriyav/yogapriya-site:latest

# Force pull new image
kubectl delete pods -l app=yogapriya-site
```

### Check Workflow Status

```bash
# Via GitHub CLI
gh run list
gh run view <run-id>
gh run watch <run-id>
```

---

## Monitoring

### Workflow Notifications

GitHub automatically notifies on:
- Workflow failures (email to committer)
- First success after failures
- Deployment status (if GitHub Deployments API used)

### Custom Notifications

**Future enhancement:** Add Slack/Discord notifications
```yaml
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Terraform GitHub Actions](https://github.com/hashicorp/setup-terraform)
- [kubectl GitHub Action](https://github.com/azure/setup-kubectl)