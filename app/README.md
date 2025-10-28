# Application

Next.js personal website for yogapriyaveturi.com

## Design

### Technology Stack

- **Framework**: Next.js 15.5.6
- **Runtime**: Node.js 20
- **Language**: TypeScript
- **UI Framework**: React 18
- **Styling**: Tailwind CSS
- **Containerization**: Docker (multi-stage build)

### Application Architecture

```
app/
├── src/app/              # Next.js App Router
│   ├── layout.tsx        # Root layout (navigation, footer)
│   ├── page.tsx          # Homepage (redirects to /about)
│   ├── about/            # About page
│   ├── tech/             # Tech portfolio page
│   ├── arts/             # Arts page
│   ├── volunteering/     # Volunteering page
│   ├── contact/          # Contact page
│   └── globals.css       # Global styles
├── public/
│   ├── images/           # Static assets (profile photo, etc.)
│   └── favicon.ico
├── Dockerfile            # Multi-stage production build
├── .dockerignore         # Excludes node_modules, .next, .git
├── package.json          # Dependencies and scripts
└── next.config.ts        # Next.js configuration
```

### Why Next.js?

**Chosen for:**
- Server-side rendering (SSR) for SEO
- Built-in routing (`app/` directory structure)
- API routes capability for future backend needs
- Hot reload during development
- Optimized production builds
- Wide industry adoption - so learning!

**Compared to alternatives:**
- **vs Create React App**: Next.js includes SSR, routing, and optimization out of the box
- **vs Gatsby**: Better for dynamic content and API integration
- **vs Plain React**: Next.js provides structure and best practices

### Routing Structure

Next.js App Router with file-based routing:

```
/ (root)                  → Redirects to /about
/about                    → About page (default landing)
/tech                     → Tech portfolio
/arts                     → Arts portfolio
/volunteering             → Volunteering experience
/contact                  → Contact form
```

Each route is a separate directory under `src/app/` with its own `page.tsx`.

## Local Development

**Prerequisites:**
- Node.js 20+ installed
- npm or yarn package manager

**Setup:**
```bash
cd app

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000

**Development features:**
- Hot reload on file changes
- TypeScript type checking
- ESLint for code quality
- Tailwind CSS for styling

## Understanding npm Commands

**Three key commands for different purposes:**

| Command | Purpose | Mode | Speed | Hot Reload | Output |
|---------|---------|------|-------|------------|--------|
| `npm run dev` | Local development | Development | Slower |  Yes | Runs on localhost:3000 |
| `npm run build` | Compile for production | Build | N/A |  No | Creates `.next/` directory |
| `npm start` | Run production build | Production | Faster |  No | Serves from `.next/` |

**Development Workflow:**
```bash
# Daily development (hot reload, detailed errors)
npm run dev

# Build for production (optimization, minification)
npm run build

# Run production build locally (test optimized version)
npm start
```

**Key Differences:**

- **`npm run dev`**: 
  - For active development
  - Shows detailed error messages
  - Auto-refreshes on code changes
  - Runs directly from source code
  - NOT used in Docker

- **`npm run build`**: 
  - Compiles and optimizes code
  - Creates production-ready `.next/` directory
  - Minifies JavaScript and CSS
  - Optimizes images and fonts
  - **Used in Docker build stage**

- **`npm start`**: 
  - Serves the already-built `.next/` directory
  - Production-optimized performance
  - Minimal error messages
  - **Used in Docker runtime (CMD)**

## Docker Strategy

**Multi-stage build** for optimal production image:

```Dockerfile
# Stage 1: Builder
- Install dependencies
- Build Next.js application
- Generate optimized .next/ directory

# Stage 2: Runner (Production)
- Copy only production artifacts
- Minimal Node.js alpine image
- ~180MB final image size
```

**Key optimizations:**
- `.dockerignore` excludes local `.next/` (rebuilds fresh in Docker)
- Multi-stage build reduces image size by ~85%
- Alpine Linux base for minimal attack surface
- Production-only dependencies in final image

**Manual Docker Build (For Development/Debugging):**
Note: These commands are automated via GitHub Actions in production. Use these for:
- Local testing before pushing code
- Debugging build failures
- Understanding the CI/CD process

```bash
# Build image
docker build -t yogapriya-site:latest .

# Run locally
docker run -p 3000:3000 yogapriya-site:latest

# Tag for registry
docker tag yogapriya-site:latest yogapriyav/yogapriya-site:latest

# Push to Docker Hub
docker push yogapriyav/yogapriya-site:latest
```

---

## Issues & Remedies

### Issue 1: ESLint Build Failures

**Problem:**
Build failed with ESLint errors:
```
Error: Unexpected character (apostrophes in JSX text)
Error: Using <img> instead of Next.js <Image>
```

**Root cause:**
- Unescaped apostrophes in text content (e.g., "I'm" in JSX)
- Using HTML `<img>` tags instead of Next.js optimized `<Image>` component

**Remedy:**
Added to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Disable ESLint during builds
  },
};
```

**Better long-term solution** (TODO):
- Replace `<img>` with Next.js `<Image>` component
- Escape apostrophes: `I&apos;m` or `{"I'm"}`
- Fix linting issues properly

**Why:** Pragmatic for the moment - disabled linting temporarily to unblock deployment, but documented the technical debt for future cleanup.

---

### Issue 2: Routing and Navigation

**Problem:**
Initial single-page design with all sections on homepage using React state for navigation. No actual URL routing (clicking "About" didn't change URL).

**Remedy:**
Refactored to proper Next.js routing structure:
```
Before:
src/app/page.tsx (single page with all sections)

After:
src/app/
├── page.tsx (redirects to /about)
├── about/page.tsx
├── tech/page.tsx
├── arts/page.tsx
├── volunteering/page.tsx
└── contact/page.tsx
```

**Benefits:**
- Proper URL routing (/about, /tech, etc.)
- Better code organization and easier life-cycle management
- Scalable and Easier to add page-specific logic/APIs
- SEO-friendly (each page has unique URL)

---

### Issue 3: .dockerignore vs Copying .next/

**Problem:**
Confusion about why `.next/` is in `.dockerignore` but we copy it in Dockerfile.

**Explanation:**
1. `.dockerignore` blocks the LOCAL `.next/` from your laptop (might be stale/wrong architecture)
2. Dockerfile runs `npm run build` to create FRESH `.next/` inside Docker (Linux build)
3. Multi-stage build copies the DOCKER-built `.next/` to production image

**Why** Multi-stage Docker builds ensure platform-specific optimization and eliminate architecture mismatches between development and production.

---

### Issue 4: Docker Hub Account and Image Tagging

**Problem:**
Confusion about when to create Docker Hub account and how image tagging works.

**Resolution:**
- Tagging is LOCAL operation (no account needed)
- Docker Hub account only required for pushing images
- Username becomes part of image name: `yogapriyav/yogapriya-site:latest`

**Process:**
1. Build: `docker build -t yogapriya-site:latest .`
2. Tag: `docker tag yogapriya-site:latest yogapriyav/yogapriya-site:latest`
3. Create Docker Hub account
4. Login: `docker login`
5. Push: `docker push yogapriyav/yogapriya-site:latest`

**Security note:** Public images on Docker Hub are safe because:
- Only compiled `.next/` is included (not source code)
- `.env` files excluded via `.dockerignore`
- No AWS credentials or secrets in image

---

## Known Open Issues

### 1. ESLint Errors Suppressed

**Status:** Technical Debt

**Issue:** ESLint is disabled during builds to work around:
- Apostrophes in JSX text not properly escaped
- Using `<img>` instead of Next.js `<Image>` component

**Impact:** Medium - Code quality checks bypassed

**TODO:**
- [ ] Replace all `<img>` with `<Image>` from `next/image`
- [ ] Escape apostrophes in text content
- [ ] Re-enable ESLint in `next.config.ts`
- [ ] Fix all linting errors

**Effort:** ~2 hours

---

### 2. No Page-Specific APIs Yet

**Status:** Future Enhancement

**Issue:** Current pages are static - no backend API integration yet.

**Planned:**
- Contact form → API route to send email
- Tech page → API to fetch GitHub projects
- Dynamic content rendering

**Required:**
- Create API routes in `src/app/api/`
- Environment variables for API keys
- Kubernetes secrets for production

---

### 3. No Error Boundaries

**Status:** Missing Feature

**Issue:** No global error handling - app crashes show default Next.js error page.

**TODO:**
- Add `error.tsx` files for graceful error handling
- Custom 404 page
- Error tracking (Sentry or similar)

**Effort:** ~4 hours

---

## CI/CD Integration

Application deployments are automated via GitHub Actions. Code changes pushed to `main` in the `app/` directory trigger automatic Docker image builds and Kubernetes deployment updates.

See [.github/workflows/README.md](../.github/workflows/README.md) for complete CI/CD pipeline documentation.

---

## Development Workflow

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/new-page

# 2. Make changes in app/
cd app
npm run dev  # Test locally

# 3. Test Docker build
docker build -t yogapriya-site:test .
docker run -p 3000:3000 yogapriya-site:test

# 4. Commit and push
git add .
git commit -m "Add new page"
git push origin feature/new-page

# 5. Create PR to main
# 6. Merge triggers automatic deployment
```

### Debugging

**View app logs:**
```bash
# Local Docker
docker logs <container-id>

# Kubernetes
kubectl logs -l app=yogapriya-site -f
```

**Common issues:**
- Port 3000 already in use: `lsof -ti:3000 | xargs kill`
- npm install fails: Delete `node_modules` and `package-lock.json`, reinstall
- Docker build fails: Check `.dockerignore` and Dockerfile syntax

---

## Performance Metrics

**Current production metrics:**
- **Image size:** ~180MB (multi-stage build optimization)
- **Build time:** ~2-3 minutes
- **Cold start:** ~5 seconds
- **Memory usage:** ~100-130MB per pod
- **Response time:** <100ms (static pages)

**Optimization opportunities:**
- Add CDN (CloudFront or Cloudflare)
- Implement ISR (Incremental Static Regeneration)
- Add caching headers
- Optimize images with Next.js Image component

---

## Testing

**Current state:** Manual testing only

**TODO:**
- [ ] Unit tests with Jest
- [ ] Integration tests with React Testing Library
- [ ] E2E tests with Playwright
- [ ] CI integration for tests

**Test coverage goal:** 80%+

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)