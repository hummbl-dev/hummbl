# Deployment Debug - White Screen Issue

**Date**: November 9, 2025  
**Status**: Investigating white screen on production deployment

## Issue

- Frontend deployed to Vercel shows white screen
- HTML loads correctly (2.57 kB)
- JavaScript bundles load (30.97 kB main)  
- Backend deployed and healthy
- Local build works perfectly

## Diagnostic Steps

### 1. Verify Build Settings in Vercel

Check Vercel dashboard:
- Build Command: Should be `npm run build`
- Output Directory: Should be `dist`
- Install Command: `npm install`
- Node Version: 18.x or 20.x

### 2. Check for Runtime Errors

The white screen typically indicates a JavaScript runtime error. Common causes:

**A. Missing Environment Variables**
- Vercel may need `VITE_API_URL` set to backend URL
- Check: Settings → Environment Variables in Vercel dashboard
- Required:
  ```
  VITE_API_URL=https://hummbl-backend.hummbl.workers.dev
  ```

**B. Build Output Issues**
- Vercel might be caching old build
- Solution: Trigger redeploy or clear build cache

**C. React Router Issues**
- SPA routing requires rewrite rules
- Current `vercel.json` has correct config ✅

### 3. Browser Console Errors

Most likely errors to check:
1. **Module not found**: Missing import or incorrect path
2. **Network errors**: API calls failing CORS
3. **undefined is not a function**: Missing dependency
4. **Syntax error**: Build output incompatible with browser

## Quick Fixes

### Fix 1: Force Redeploy
```bash
# Trigger new deployment
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

### Fix 2: Add Environment Variable
In Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL = https://hummbl-backend.hummbl.workers.dev
```

### Fix 3: Check Build Logs
1. Go to Vercel Dashboard
2. Click on the failing deployment
3. Check "Build Logs" tab
4. Look for any errors or warnings

### Fix 4: Test with Preview Build
```bash
npm run preview
# Open http://localhost:4173
# This simulates production build locally
```

## Expected Behavior

When working correctly:
1. HTML loads with `<div id="root"></div>`
2. React hydrates the root
3. Router initializes
4. Dashboard page renders
5. No console errors

## Root Cause Analysis

Most likely causes (in order of probability):
1. **Environment variable missing** - VITE_API_URL not set in Vercel
2. **Build cache issue** - Vercel using stale build
3. **Node version mismatch** - Different Node version than local
4. **TypeScript error in production** - Strict mode issue

## Solution Steps

1. Check Vercel deployment logs for errors
2. Add `VITE_API_URL` environment variable
3. Trigger manual redeploy
4. If still failing, check browser console at https://hummbl.vercel.app
5. Enable Vercel error monitoring

## Next Actions

- [ ] Check Vercel build logs
- [ ] Verify environment variables set
- [ ] Test browser console on deployed site
- [ ] If needed: rollback to previous working deployment
- [ ] Monitor Vercel Analytics for errors

## Rollback Plan

If issue persists:
```bash
# Rollback to previous commit
git log --oneline -5  # Find last working commit
git revert HEAD
git push origin main
```

Or use Vercel Dashboard → Deployments → Previous deployment → Promote to Production

---

**Status**: Awaiting Vercel build completion and browser console check
