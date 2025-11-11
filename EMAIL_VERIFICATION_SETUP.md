# Email Verification Setup Guide

## Overview

Email verification has been successfully implemented using Cloudflare Workers and the Resend API. This guide walks you through the final configuration steps.

## ✅ Completed

### Backend Implementation
- ✅ Migration 004 created and applied (`email_verifications` table)
- ✅ Email service library with Resend integration (`workers/src/lib/email.ts`)
- ✅ Three verification endpoints:
  - `POST /auth/register` - Creates account and sends verification email
  - `GET /auth/verify-email/:token` - Verifies email with token
  - `POST /auth/resend-verification` - Resends verification email (rate-limited)
- ✅ Backend deployed: version `316feb2d-8790-4d99-b21a-4148d2b18c43`

### Frontend Implementation
- ✅ `VerifyEmail.tsx` page with loading/success/error states
- ✅ `EmailVerificationBanner.tsx` component for unverified users
- ✅ Updated User types to include `emailVerified` field
- ✅ Registration success message prompts users to check email
- ✅ Banner integrated into Layout (shows for unverified users)
- ✅ Frontend pushed to GitHub (auto-deploying to Vercel)

### Database
- ✅ Local D1 database updated (8 commands executed)
- ✅ Remote D1 database updated (4 commands executed)
- ✅ Tables: `users` (with email_verified columns), `email_verifications`

## 🔧 Required Configuration

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up/login
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Name it: `HUMMBL Production`
5. Copy the API key (starts with `re_`)

**Note**: Resend offers 100 free emails per day on the free tier.

### Step 2: Configure Cloudflare Workers Secrets

Run these commands from the `workers/` directory:

```bash
cd /Users/others/hummbl-1/workers

# Set Resend API key
wrangler secret put RESEND_API_KEY
# Paste your API key when prompted

# Set application URL
wrangler secret put APP_URL
# Enter: https://hummbl.vercel.app

# Set from email address
wrangler secret put FROM_EMAIL
# Enter: noreply@hummbl.app
# (or your verified domain email)
```

### Step 3: Verify Domain (Optional but Recommended)

For production use, verify your domain in Resend:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `hummbl.app`)
4. Add DNS records as instructed
5. Wait for verification (usually 24-48 hours)

Until domain is verified, emails will be sent from `onboarding@resend.dev` but will still work.

## 📧 Email Verification Flow

### User Registration
1. User fills out registration form
2. Backend creates account with `email_verified = 0`
3. Backend generates verification token (expires in 24 hours)
4. Backend sends verification email via Resend
5. Frontend shows success message: "Please check your email"
6. User is logged in but sees verification banner

### Email Verification
1. User clicks verification link in email
2. Link redirects to `/verify-email?token=...`
3. Frontend calls `GET /api/auth/verify-email/:token`
4. Backend validates token and updates `email_verified = 1`
5. Frontend shows success and redirects to dashboard
6. Verification banner disappears

### Resend Email
1. User clicks "Resend verification email" in banner
2. Frontend calls `POST /api/auth/resend-verification`
3. Backend checks rate limit (5 minutes between resends)
4. Backend generates new token and sends email
5. Frontend shows success message

## 🧪 Testing Checklist

### Local Testing (Development)
```bash
cd /Users/others/hummbl-1

# Start backend (uses local D1)
cd workers && npm run dev

# Start frontend (in another terminal)
cd /Users/others/hummbl-1 && npm run dev
```

In development mode, emails are logged to console instead of sent.

### Production Testing
1. ✅ Register new account at https://hummbl.vercel.app/register
2. ⏳ Check email inbox for verification email
3. ⏳ Click verification link
4. ⏳ Verify redirect to dashboard
5. ⏳ Register another account, test resend button
6. ⏳ Verify banner shows for unverified users only
7. ⏳ Test expired token (wait 24 hours or manually test)

## 📊 Email Templates

### Verification Email
- **Subject**: Verify your HUMMBL account
- **Design**: Gradient blue header (#0ea5e9 to #0369a1)
- **Button**: Blue CTA button linking to verification page
- **Fallback**: Plain text link for email clients without HTML support
- **Responsive**: Mobile-friendly design

### Rate Limits
- **Registration**: 5 requests per minute per IP
- **Verification**: Unlimited (tokens expire in 24 hours)
- **Resend**: 5 minutes between resends per user

## 🔍 Monitoring & Debugging

### Check Backend Logs
```bash
cd /Users/others/hummbl-1/workers
npm run tail
```

### Check Database
```bash
# Local database
npx wrangler d1 execute hummbl-workflows --local --command "SELECT * FROM email_verifications ORDER BY created_at DESC LIMIT 10"

# Production database
npx wrangler d1 execute hummbl-workflows --command "SELECT * FROM email_verifications ORDER BY created_at DESC LIMIT 10"
```

### Common Issues

**Emails not sending:**
- Check `RESEND_API_KEY` is configured: `wrangler secret list`
- Verify API key is valid in Resend dashboard
- Check backend logs for errors: `npm run tail`

**Verification link not working:**
- Check token hasn't expired (24 hours)
- Verify `APP_URL` secret is correct
- Check frontend is deployed and accessible

**Banner not showing:**
- Check user's `email_verified` field in database
- Verify `EmailVerificationBanner` is in Layout component
- Check browser console for errors

## 📁 File Reference

### Backend Files
- `workers/migrations/004_add_email_verification.sql` - Database schema
- `workers/src/lib/email.ts` - Email service (250+ lines)
- `workers/src/routes/auth.ts` - Verification endpoints
- `workers/src/lib/auth.ts` - User interface with email_verified
- `workers/src/types/index.ts` - Env interface with email secrets

### Frontend Files
- `src/pages/VerifyEmail.tsx` - Verification landing page (120 lines)
- `src/components/EmailVerificationBanner.tsx` - Banner component (90 lines)
- `src/components/Layout/Layout.tsx` - Includes banner
- `src/pages/Register.tsx` - Shows success message
- `src/store/authStore.ts` - User type with emailVerified
- `src/App.tsx` - /verify-email route

## 🚀 Deployment Status

- **Backend**: ✅ Deployed (version 316feb2d-8790-4d99-b21a-4148d2b18c43)
- **Frontend**: ✅ Pushed to GitHub (auto-deploying via Vercel)
- **Database**: ✅ Migrations applied to production
- **Secrets**: ⏳ Need to configure RESEND_API_KEY, APP_URL, FROM_EMAIL

## 📝 Next Steps

1. **Configure Resend API key** (see Step 2 above)
2. **Test email verification flow** in production
3. **Verify domain** in Resend (optional but recommended)
4. **Monitor email delivery** for first few days
5. **Update FROM_EMAIL** once domain is verified

## 💡 Future Enhancements

- Password reset emails (template already exists)
- Email change verification
- Welcome email after verification
- Email delivery tracking via Resend webhooks
- Email templates in database for easy editing
- Admin panel to view email logs

---

**Status**: Email verification system is fully implemented and deployed. Only requires Resend API key configuration to be production-ready.

**Estimated Setup Time**: 10 minutes (5 min for Resend signup + 5 min for secret configuration)
