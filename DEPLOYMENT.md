# HUMMBL Deployment Guide

## Vercel Deployment Setup

HUMMBL is configured to deploy to Vercel at **hummbl.io**.

### Initial Setup

1. **Install Vercel CLI** (optional, for local testing):

   ```bash
   npm install -g vercel
   ```

2. **Connect Repository to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import the `hummbl-dev/hummbl` repository
   - Configure project settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm ci`

3. **Configure Custom Domain**:
   - In Vercel project settings, go to "Domains"
   - Add `hummbl.io` as a custom domain
   - Follow DNS configuration instructions

### Automatic Deployments

Vercel automatically deploys:

- **Production**: Every push to `main` branch → hummbl.io
- **Preview**: Every pull request → unique preview URL

### Environment Variables

Currently no environment variables required. Future additions:

- API keys (if backend integration added)
- Feature flags
- Analytics tokens

### Build Configuration

The project includes:

- ✅ `package-lock.json` for reproducible builds
- ✅ TypeScript strict mode
- ✅ Vercel Analytics integration
- ✅ Vite optimization

### GitHub Actions CI

The `.github/workflows/ci.yml` workflow runs on all pushes and PRs:

- ESLint checks
- TypeScript type checking
- Build verification
- Multi-node version testing (18.x, 20.x)

### Deployment Checklist

Before deploying to production:

- [ ] All CI checks pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build completes successfully
- [ ] Local preview works (`npm run preview`)
- [ ] Analytics configured in Vercel dashboard

### Local Preview

Test production build locally:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

### Automated Testing Agents

HUMMBL includes automated agents for production testing:

**Production Build Test Agent:**

```bash
npm run test:production
```

Automatically tests:

- Build completion
- Bundle sizes
- File structure
- HTML artifacts
- Generates SITREP report

**Visual Test Agent:**

```bash
npm run test:visual
```

Starts preview server with structured testing checklist.

**Full Test Suite:**

```bash
npm run test:all
```

See **[TESTING_AGENTS.md](./TESTING_AGENTS.md)** for complete documentation.

### Rollback Procedure

If a deployment has issues:

1. Go to Vercel dashboard → Deployments
2. Find the last stable deployment
3. Click "Promote to Production"

### Performance Optimization

Current optimizations:

- Vite code splitting
- Tree shaking
- CSS minification
- Asset optimization

### Monitoring

- **Analytics**: Vercel Analytics tracks page views and web vitals
- **Logs**: Available in Vercel dashboard under "Logs"
- **Runtime Logs**: Vercel Functions logs (if/when backend added)

### Future Enhancements

Planned infrastructure additions:

- Cloudflare Workers for API backend
- D1 database for mental model data
- KV storage for caching
- R2 for static assets

---

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Verify `package-lock.json` is committed
3. Ensure all dependencies are in `package.json`
4. Test build locally: `npm ci && npm run build`

### Analytics Not Working

1. Verify `@vercel/analytics` is installed
2. Check Analytics is enabled in Vercel project settings
3. Confirm production domain is configured

### CI Workflow Fails

1. Check GitHub Actions logs
2. Verify `package-lock.json` exists
3. Run locally: `npm ci && npm run lint && npm run build`

---

**Last Updated**: 2025-11-08  
**Maintained By**: HUMMBL Systems Engineering
