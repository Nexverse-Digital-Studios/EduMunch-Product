# 73 - Deployment Guide

## Overview

Complete guide to deploying EduMunch to production using Vercel for frontend and Supabase for backend.

---

## Table of Contents

1. Pre-Deployment Checklist
2. Vercel Deployment
3. Supabase Production Setup
4. Environment Configuration
5. Domain & SSL Setup
6. Database Migration
7. CI/CD Pipeline
8. Monitoring & Health Checks
9. Rollback Procedures
10. Post-Deployment Verification

---

## 1. Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Dependencies audit clean: `npm audit`
- [ ] TypeScript strict mode enabled
- [ ] Environment variables documented
- [ ] Secrets not committed to repo
- [ ] Dead code removed
- [ ] Performance optimized (Lighthouse score > 80)

### Security

- [ ] RLS policies configured
- [ ] Authentication flows tested
- [ ] API endpoints secured
- [ ] Sensitive data encrypted
- [ ] CORS headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protected
- [ ] XSS protections enabled
- [ ] CSRF tokens implemented

### Database

- [ ] Migrations tested locally
- [ ] Backup strategy defined
- [ ] Rollback plan ready
- [ ] Indexes optimized
- [ ] RLS policies active
- [ ] Test data removed
- [ ] Schema documented

### Documentation

- [ ] README updated
- [ ] API docs current
- [ ] Deployment steps documented
- [ ] Runbooks created
- [ ] Troubleshooting guide ready
- [ ] Team trained

---

## 2. Vercel Deployment

### Connect GitHub Repository

**Step 1: Login to Vercel**
1. Go to `vercel.com`
2. Sign up/Login with GitHub
3. Authorize Vercel to access repositories

**Step 2: Import Project**
1. Click **Import Project**
2. Select GitHub repository
3. Click **Import**

**Step 3: Configure Project**
1. **Project Name:** edumunch (or custom)
2. **Framework:** Next.js
3. **Root Directory:** ./ (leave as default)
4. **Build Command:** `npm run build`
5. **Output Directory:** `.next`
6. **Install Command:** `npm ci`

**Step 4: Environment Variables**
1. Go to project **Settings → Environment Variables**
2. Add variables (see section 4)
3. Deploy

### Deploy Main Branch

```bash
# Push to main branch
git add .
git commit -m "Deploy to production"
git push origin main

# Vercel automatically deploys
# Watch deployment at vercel.com/dashboard
```

### Deployment URL

After deployment:
```
Production URL: https://edumunch.vercel.app
Custom domain: https://app.edumunch.com (after setup)
Preview URL: https://[branch-name]-edumunch.vercel.app
```

### Redeploy

**Manual Redeploy:**
1. Go to Vercel Dashboard
2. Select project
3. Click **Deployments**
4. Click **...** on latest deployment
5. Click **Redeploy**

**Trigger Redeploy via API:**
```bash
curl -X POST https://api.vercel.com/v12/deployments \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"name":"edumunch"}'
```

---

## 3. Supabase Production Setup

### Create Production Project

**Step 1: Create Project**
1. Go to `supabase.com`
2. Click **New Project**
3. Configure:
   - **Name:** EduMunch Production
   - **Database Password:** [strong password]
   - **Region:** [closest to users]
   - **Organization:** [your org]
4. Create project

**Step 2: Get Credentials**
1. Project **Settings → API**
2. Copy:
   - `Project URL` (API URL)
   - `anon key` (Anon/Public key)
   - `service_role_key` (Service Role key)
3. Store securely (1Password, etc.)

**Step 3: Enable Services**
1. Go to **Settings**
2. Enable:
   - Authentication
   - Realtime
   - Storage
   - Edge Functions (optional)

### Run Migrations

```bash
# Install Supabase CLI
npm install -D supabase

# Login
supabase login

# Create migration
supabase link --project-ref [project-ref]

# Push all migrations
supabase db push

# Verify migration
supabase db pull --schema public
```

### Seed Production Data

```bash
# Run seed script (if needed)
psql postgres://postgres:[password]@[host]/postgres < scripts/seed.sql

# Or via Supabase dashboard:
# SQL Editor → paste seed script → Execute
```

### RLS Policies Verification

**Check all tables have RLS enabled:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Verify policies exist:**
```sql
SELECT table_name, policy_name 
FROM information_schema.applicable_roles 
WHERE table_schema = 'public';
```

---

## 4. Environment Configuration

### Create Environment Files

**File: `.env.local` (local development)**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[local-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[local-service-key]
DATABASE_URL=postgres://postgres:[password]@localhost:5432/postgres
```

**File: `.env.production` (production)**
```
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[prod-service-key]
DATABASE_URL=postgres://postgres:[prod-password]@[prod-host]:5432/postgres
```

### Vercel Environment Variables

1. Go to Vercel **Settings → Environment Variables**
2. Add all production environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - Any other secrets

3. Set availability:
   - Production
   - Preview
   - Development (if needed)

### Secret Management

**Best Practices:**
- Never commit `.env.production` to git
- Use `.env.example` for template
- Rotate secrets monthly
- Store in secure vault (1Password, AWS Secrets)
- Use Vercel's native environment variables
- Don't log sensitive data

---

## 5. Domain & SSL Setup

### Configure Custom Domain

**At Vercel:**
1. Project **Settings → Domains**
2. Click **Add Domain**
3. Enter domain: `app.edumunch.com`
4. Click **Add**

**At Domain Registrar:**
1. Go to DNS settings
2. Add CNAME record:
   - **Name:** app (or subdomain)
   - **Value:** cname.vercel-dns.com.
   - **TTL:** 3600

3. Verify DNS propagation (5-30 minutes)
4. Vercel auto-provisions SSL certificate

### SSL/TLS Certificate

**Auto-Provisioned by Vercel:**
- Automatically issued via Let's Encrypt
- Auto-renews 30 days before expiry
- HSTS enabled automatically
- Mixed content blocked

**Verify SSL:**
```bash
# Check certificate
openssl s_client -connect app.edumunch.com:443

# Or use online tool:
# https://www.sslshopper.com/ssl-checker.html
```

### HTTPS Redirect

**Automatic Redirect:**
```javascript
// Next.js automatically redirects HTTP → HTTPS
// Or configure in next.config.js:

module.exports = {
  // Vercel handles this automatically
  // No configuration needed
}
```

---

## 6. Database Migration

### Pre-Migration

1. **Backup existing data**
   ```bash
   pg_dump [old-db-url] > backup.sql
   ```

2. **Test migration in staging**
   - Create staging database
   - Run migrations
   - Verify data integrity
   - Test application

3. **Notify stakeholders**
   - Inform users of maintenance window
   - Schedule during low-traffic time
   - Prepare rollback plan

### Migration Steps

```bash
# 1. Freeze writes (optional, if possible)
# 2. Create final backup
pg_dump [old-db] > final-backup.sql

# 3. Run migrations
supabase db push

# 4. Verify migrations
supabase db pull --schema public

# 5. Verify data (sample queries)
psql -c "SELECT COUNT(*) FROM users;"
psql -c "SELECT COUNT(*) FROM enrollments;"

# 6. Enable application
# Point application to new database
```

### Post-Migration Verification

```sql
-- Check table counts
SELECT schemaname, tablename, n_live_tup AS rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Verify indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Verify constraints
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public';
```

### Rollback Plan

```bash
# If migration fails, restore backup:
psql postgres://postgres:[password]@host/dbname < backup.sql

# Or use Supabase backup restore:
# Settings → Backups → Restore
```

---

## 7. CI/CD Pipeline

### GitHub Actions Workflow

**File: `.github/workflows/deploy.yml`**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true
      
      - name: Run migrations
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: supabase db push
```

### Manual Deployment

```bash
# Build locally
npm run build

# Verify build
npm start

# Deploy to Vercel
vercel --prod

# Verify deployment
curl https://app.edumunch.com/api/health
```

---

## 8. Monitoring & Health Checks

### Uptime Monitoring

**Using Vercel Analytics:**
1. Project **Analytics**
2. View:
   - Uptime percentage
   - Response times
   - Error rates
   - Traffic patterns

**Using Third-Party Service:**
```bash
# Uptime Robot: https://uptimerobot.com
# Configure HTTP checks:
# - URL: https://app.edumunch.com/api/health
# - Interval: 5 minutes
# - Alert: Email on downtime
```

### Health Check Endpoint

**Create in Next.js API route:**

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check database connectivity
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    
    if (error) throw error
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}
```

### Error Tracking

**Setup Sentry:**
1. Create Sentry account
2. Create project
3. Install SDK: `npm install @sentry/nextjs`
4. Initialize in `pages/_app.tsx`:

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

5. Add to environment variables:
   - `NEXT_PUBLIC_SENTRY_DSN`

### Performance Monitoring

**Web Vitals:**
```typescript
// pages/_app.tsx
import { useReportWebVitals } from 'next/web-vitals'

export default function App() {
  useReportWebVitals((metric) => {
    console.log(metric)
    // Send to analytics service
  })
  
  return <YourApp />
}
```

---

## 9. Rollback Procedures

### Quick Rollback

**From Vercel:**
1. Go to **Deployments**
2. Find previous stable deployment
3. Click **...** → **Promote to Production**
4. Verify application works

**Via CLI:**
```bash
vercel --prod --confirm
```

### Database Rollback

**If Migration Fails:**
```bash
# Revert last migration
supabase db reset

# Or restore from backup
# Supabase Dashboard → Settings → Backups → Restore
```

### Partial Rollback

```bash
# Deploy specific commit
git checkout [previous-commit]
git push origin main --force

# Or via Vercel UI:
# Deployments → Select commit → Redeploy
```

---

## 10. Post-Deployment Verification

### Functionality Tests

- [ ] Login works (all user types)
- [ ] Dashboard loads
- [ ] Can view courses
- [ ] Can submit assignments
- [ ] Can view grades
- [ ] Payment processing works
- [ ] Email notifications sending
- [ ] SMS notifications sending
- [ ] Reports generating
- [ ] Analytics updating

### Performance Checks

- [ ] Page load time < 2s
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] CDN working (images, CSS)
- [ ] Lighthouse score > 80

### Security Verification

- [ ] SSL certificate valid
- [ ] HTTPS redirect working
- [ ] Authentication required for protected routes
- [ ] RLS policies enforced
- [ ] Rate limiting active
- [ ] CORS headers correct
- [ ] No sensitive data in logs

### Monitoring Setup

- [ ] Error tracking enabled
- [ ] Uptime monitoring active
- [ ] Performance monitoring enabled
- [ ] Log aggregation working
- [ ] Alerts configured

### Documentation

- [ ] Deployment documented
- [ ] Known issues logged
- [ ] Runbook updated
- [ ] Team trained
- [ ] Incident plan reviewed

---

## Deployment Checklist

### Pre-Deployment (Day Before)

- [ ] Final testing complete
- [ ] Backups created
- [ ] Stakeholders notified
- [ ] Rollback plan reviewed
- [ ] Team on-call

### Deployment Day

- [ ] Final code review
- [ ] Merge to main branch
- [ ] Verify CI/CD pipeline passes
- [ ] Monitor deployment
- [ ] Verify application works
- [ ] Check monitoring dashboards

### Post-Deployment (1-2 Hours)

- [ ] User reports monitored
- [ ] Error rates normal
- [ ] Performance metrics good
- [ ] Document any issues
- [ ] Notify stakeholders

---

**Last Updated:** [Date]  
**Version:** 1.0  
**Status:** Production Ready

