# 75 - Troubleshooting Guide

## Overview

Comprehensive troubleshooting guide for common EduMunch issues and their solutions.

---

## Table of Contents

1. Authentication Issues
2. Database & Data Issues
3. API & Backend Issues
4. Frontend & UI Issues
5. Performance Issues
6. Email & Notifications
7. Payment Issues
8. Deployment Issues
9. Security Issues
10. Emergency Procedures

---

## 1. Authentication Issues

### Users Can't Login

**Symptom:** "Invalid credentials" error on login

**Diagnosis Steps:**
```bash
# 1. Check Supabase auth service
curl https://[project].supabase.co/auth/v1/health

# 2. Verify user exists
SELECT * FROM users WHERE email = 'user@example.com';

# 3. Check user status
SELECT id, email, status FROM users 
WHERE email = 'user@example.com';
```

**Solutions:**

| Issue | Solution |
|-------|----------|
| User doesn't exist | Create user or verify email |
| Account locked | Check `account_locked` in users table, reset |
| Password expired | Force password reset |
| Wrong password | Use password reset flow |
| Email not verified | Resend verification email |
| Wrong database | Check connection string in .env |

**Reset User Password:**
```sql
-- Generate reset token
UPDATE auth.users 
SET recovery_token = gen_random_uuid()::text
WHERE email = 'user@example.com';

-- Send user reset link via email
-- User clicks link and sets new password
```

### JWT Token Invalid/Expired

**Symptom:** 401 Unauthorized, "JWT expired" error

**Solutions:**

1. **Refresh Token:**
```typescript
const { data, error } = await supabase.auth.refreshSession()
if (error) {
  // Redirect to login
  window.location.href = '/login'
}
```

2. **Check Token Expiry:**
```typescript
const { data } = await supabase.auth.getUser()
console.log(data.user?.user_metadata)
```

3. **Clear Cache & Login Again:**
```bash
# Clear browser cache
# Clear localStorage
localStorage.removeItem('sb-auth-token')
# Force refresh and login
```

### CORS Errors

**Symptom:** "CORS policy blocked request"

**Solutions:**

1. **Check Supabase CORS Settings:**
   - Go to Supabase Project Settings
   - API → CORS
   - Add domain: `https://app.edumunch.com`
   - Add domain: `https://localhost:3000`

2. **Verify Headers:**
```typescript
const headers = {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

3. **Enable Credentials (if needed):**
```typescript
fetch(url, {
  credentials: 'include'
})
```

---

## 2. Database & Data Issues

### Database Connection Timeout

**Symptom:** "Connection refused", "Connection timeout"

**Diagnosis:**
```bash
# Test database connectivity
psql postgres://user:password@host:5432/dbname -c "SELECT 1"

# Check port
lsof -i :5432

# Check firewall
telnet host 5432
```

**Solutions:**

1. **Check Connection String:**
```
postgres://postgres:password@[project].supabase.co:5432/postgres
```

2. **Use Connection Pooling:**
```
postgres://postgres:password@[project].supabase.co:6543/postgres
?options=application_name%3Dapp
```

3. **Increase Connection Timeout:**
```typescript
const client = new Pool({
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
})
```

### RLS Policy Blocking Access

**Symptom:** "Row level security policy violated" or no data returned

**Diagnosis:**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = '[table]';

-- Check active policies
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = '[table]';
```

**Solutions:**

1. **Verify User Has Role:**
```sql
SELECT role FROM users WHERE id = auth.uid();
```

2. **Check Policy Conditions:**
```sql
-- Test policy with user context
SELECT * FROM [table] 
WHERE auth.uid() = user_id; -- Should return data
```

3. **Disable RLS for Testing (Dev Only):**
```sql
ALTER TABLE [table] DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
```

### Missing Data After Migration

**Symptom:** Data exists in old database but not visible

**Solutions:**

1. **Verify Migration Completed:**
```sql
SELECT COUNT(*) FROM [table];
```

2. **Check RLS Policies:**
```typescript
const { data, error } = await supabase
  .from('[table]')
  .select('*')
  // RLS might filter results
```

3. **Use Service Role Key:**
```typescript
const admin = createClient(url, SERVICE_ROLE_KEY)
const { data } = await admin
  .from('[table]')
  .select('*')
  // Bypasses RLS for verification
```

4. **Restore from Backup if Needed:**
```bash
# Supabase Dashboard → Settings → Backups → Restore
```

### Slow Queries / High Database Load

**Symptom:** "Database under load", slow API responses

**Diagnosis:**
```sql
-- Check active queries
SELECT pid, query, query_start 
FROM pg_stat_activity
WHERE state != 'idle';

-- Find slow queries
SELECT query, mean_time, max_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0; -- Unused indexes
```

**Solutions:**

1. **Kill Long-Running Query:**
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid != pg_backend_pid()
AND query_start < NOW() - INTERVAL '10 minutes';
```

2. **Add Indexes:**
```sql
CREATE INDEX idx_enrollments_student_batch 
ON enrollments(student_id, batch_id);
```

3. **Optimize Query:**
```typescript
// Before: Inefficient query
const { data } = await supabase
  .from('enrollments')
  .select('*, students(*), batches(*)')
  .eq('status', 'active')

// After: Limit columns
const { data } = await supabase
  .from('enrollments')
  .select('id, student_id, batch_id, students(id, name), batches(id, name)')
  .eq('status', 'active')
```

4. **Enable Connection Pooling:**
   - Check current connections
   - Enable PgBouncer in Supabase

---

## 3. API & Backend Issues

### 500 Server Error

**Symptom:** "Internal Server Error", unexpected response

**Diagnosis:**
```bash
# Check server logs
tail -f logs/error.log

# Check Sentry
https://sentry.io/organizations/[org]/issues/

# Check Vercel logs
https://vercel.com/[team]/[project]/deployments
```

**Solutions:**

1. **Check Environment Variables:**
```bash
# In Vercel, verify all env vars present
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

2. **Check API Endpoint:**
```bash
curl -X GET https://app.edumunch.com/api/health
```

3. **Review Logs:**
```typescript
// Add logging to API route
export default async function handler(req, res) {
  console.log('Request received:', req.method, req.url)
  try {
    // handler code
    console.log('Response sent:', res.status)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
}
```

4. **Restart Server:**
```bash
# Vercel: Redeploy
vercel --prod

# Or via dashboard
```

### API Response Too Slow

**Symptom:** API taking > 2 seconds to respond

**Diagnosis:**
```typescript
// Measure response time
const start = Date.now()
const response = await fetch(url)
const duration = Date.now() - start
console.log(`Request took ${duration}ms`)
```

**Solutions:**

1. **Add Indexes:**
```sql
CREATE INDEX idx_users_org_status ON users(organization_id, status);
```

2. **Cache Results:**
```typescript
import { unstable_cache } from 'next/cache'

const getCourses = unstable_cache(
  async () => {
    return await supabase.from('courses').select()
  },
  ['courses'],
  { revalidate: 3600 } // Cache for 1 hour
)
```

3. **Optimize Query:**
```typescript
// Select only needed fields
const { data } = await supabase
  .from('enrollments')
  .select('id, student_id, batch_id')
  .limit(100)
```

4. **Use Pagination:**
```typescript
const { data } = await supabase
  .from('students')
  .select('*')
  .range(0, 49) // First 50 records
```

### API Rate Limiting Exceeded

**Symptom:** 429 Too Many Requests error

**Solutions:**

1. **Check Rate Limit:**
```
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1234567890
```

2. **Implement Retry with Backoff:**
```typescript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
        await new Promise(r => setTimeout(r, retryAfter * 1000))
        continue
      }
      return response
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}
```

3. **Batch Requests:**
```typescript
// Bad: Multiple requests
for (const id of ids) {
  await fetch(`/api/users/${id}`)
}

// Good: Batch request
await fetch('/api/users/batch', {
  method: 'POST',
  body: JSON.stringify({ ids })
})
```

---

## 4. Frontend & UI Issues

### Page Won't Load

**Symptom:** Blank page, infinite loading

**Diagnosis:**
1. Open browser console (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests
4. Check **Application** → **Local Storage** for auth tokens

**Solutions:**

1. **Clear Cache:**
```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or clear cache manually
# DevTools → Application → Clear Storage
```

2. **Check Authentication:**
```typescript
const { data } = await supabase.auth.getUser()
console.log('Authenticated:', !!data.user)
```

3. **Check API Connectivity:**
```bash
curl https://[project].supabase.co/rest/v1/health
```

### Component Not Rendering

**Symptom:** Expected component missing from page

**Diagnosis:**
```typescript
// Add debug logging
useEffect(() => {
  console.log('Component mounted')
  return () => console.log('Component unmounted')
}, [])

// Check if data loading
console.log('Data:', data, 'Loading:', isLoading, 'Error:', error)
```

**Solutions:**

1. **Check Data Loading:**
```typescript
const { data, isLoading, error } = useQuery([key], fetcher)

if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>
return <div>{data && data.map(...)}</div>
```

2. **Check Conditional Rendering:**
```typescript
// Bad: Component hidden due to condition
{user?.role === 'admin' && <AdminPanel />}

// Debug: Check condition
console.log('User role:', user?.role)
```

3. **Verify Permissions:**
```typescript
// Check if user has required role
if (!hasPermission('view_courses')) {
  return <AccessDenied />
}
```

### Form Submission Fails

**Symptom:** Form won't submit, no error message

**Diagnosis:**
```typescript
const handleSubmit = async (e) => {
  e.preventDefault()
  console.log('Form submitted')
  
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    console.log('Response:', response.status)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

**Solutions:**

1. **Validate Form Data:**
```typescript
if (!formData.email || !formData.email.includes('@')) {
  setError('Invalid email')
  return
}
```

2. **Check API Endpoint:**
```bash
curl -X POST https://app.edumunch.com/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

3. **Check Request Headers:**
```typescript
const response = await fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(formData)
})
```

---

## 5. Performance Issues

### High CPU Usage

**Diagnosis:**
```bash
# Check top processes
top -b -n 1 | head -20

# Node process details
ps aux | grep node
```

**Solutions:**

1. **Identify Bottleneck:**
```typescript
// Profile code
console.time('operation')
// expensive operation
console.timeEnd('operation')
```

2. **Optimize Loops:**
```typescript
// Before: O(n²)
for (const a of array1) {
  for (const b of array2) {
    if (a.id === b.id) { }
  }
}

// After: O(n)
const map = new Map(array2.map(b => [b.id, b]))
for (const a of array1) {
  const b = map.get(a.id)
}
```

3. **Implement Pagination:**
```typescript
const { data } = await supabase
  .from('records')
  .select()
  .range(0, 99) // First 100
  .limit(100)
```

### High Memory Usage

**Diagnosis:**
```bash
# Check memory
free -h

# Node memory
node --max-old-space-size=4096 app.js
```

**Solutions:**

1. **Avoid Memory Leaks:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // cleanup
  }, 1000)
  
  return () => clearInterval(interval) // Cleanup!
}, [])
```

2. **Limit Cache Size:**
```typescript
const cache = new LRU({ max: 1000 })
```

3. **Use Streams for Large Data:**
```typescript
const stream = fs.createReadStream('large-file.csv')
stream.on('data', (chunk) => {
  // Process chunk
})
```

---

## 6. Email & Notifications

### Emails Not Sending

**Symptom:** Students not receiving emails

**Diagnosis:**
```sql
-- Check email logs
SELECT * FROM email_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check failed emails
SELECT * FROM email_logs 
WHERE status = 'failed'
LIMIT 10;
```

**Solutions:**

1. **Check Configuration:**
```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})
```

2. **Verify SMTP Settings:**
```bash
telnet smtp.gmail.com 587
```

3. **Test Email Sending:**
```typescript
await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'test@example.com',
  subject: 'Test',
  html: '<p>Test email</p>'
})
```

4. **Check Email Queue:**
```sql
SELECT * FROM email_queue 
WHERE status = 'pending'
LIMIT 20;
```

### SMS Not Sending

**Symptom:** SMS notifications not received

**Diagnosis:**
```sql
SELECT * FROM sms_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Solutions:**

1. **Verify Phone Numbers:**
```typescript
const E164_REGEX = /^\+[1-9]\d{1,14}$/
if (!E164_REGEX.test(phoneNumber)) {
  throw new Error('Invalid phone format')
}
```

2. **Check SMS Provider:**
   - Verify API key
   - Check account balance
   - Test via provider dashboard

3. **Verify Contact:**
```bash
# Twilio test
curl https://api.twilio.com/2010-04-01/Accounts/[SID]/Messages \
  -X POST \
  --data-urlencode "To=+1234567890" \
  --data-urlencode "From=+[YOUR_NUMBER]" \
  --data-urlencode "Body=Test" \
  -u [SID]:[AUTH_TOKEN]
```

---

## 7. Payment Issues

### Payment Gateway Not Responding

**Symptom:** Payment button unresponsive, "Connection timeout"

**Diagnosis:**
```typescript
// Check payment service
const response = await fetch(PAYMENT_API_URL + '/health')
console.log('Payment service:', response.status)
```

**Solutions:**

1. **Check API Status:**
   - Visit payment provider status page
   - Verify API credentials
   - Check IP whitelist

2. **Test Locally:**
```bash
curl -X POST https://api.razorpay.com/v1/health \
  -u [KEY_ID]:[KEY_SECRET]
```

3. **Implement Retry:**
```typescript
async function processPaymentWithRetry(paymentData) {
  for (let i = 0; i < 3; i++) {
    try {
      return await processPayment(paymentData)
    } catch (error) {
      if (i < 2) await sleep(1000 * (i + 1))
      else throw error
    }
  }
}
```

### Payment Webhook Not Triggering

**Symptom:** Payment successful but status not updated

**Diagnosis:**
```sql
-- Check webhook logs
SELECT * FROM webhook_logs 
WHERE event_type = 'payment.success'
ORDER BY created_at DESC
LIMIT 20;
```

**Solutions:**

1. **Verify Webhook URL:**
   - Should be public (not localhost)
   - Should handle POST requests
   - Should return 200 OK

2. **Check Webhook Secret:**
```typescript
const crypto = require('crypto')
const signature = req.headers['x-razorpay-signature']
const secret = process.env.WEBHOOK_SECRET

const hash = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(req.body))
  .digest('hex')

if (hash !== signature) {
  throw new Error('Invalid webhook signature')
}
```

3. **Manually Trigger Webhook:**
```bash
curl -X POST https://app.edumunch.com/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.success","payment_id":"PAY123"}'
```

---

## 8. Deployment Issues

### Deployment Fails

**Symptom:** Build fails, deployment error

**Diagnosis:**
```bash
# Check build logs
npm run build

# Check Vercel logs
vercel logs --follow
```

**Solutions:**

1. **Check Environment Variables:**
```bash
# Verify all required vars present in Vercel
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

2. **Test Build Locally:**
```bash
npm run build
npm run start
```

3. **Check Dependencies:**
```bash
npm audit
npm ci
```

### Application Won't Start

**Symptom:** "Application failed to start", 500 error

**Diagnosis:**
```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --follow
```

**Solutions:**

1. **Check Port:**
```typescript
// Next.js uses 3000 by default
const port = process.env.PORT || 3000
```

2. **Check Database Connection:**
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

3. **Restart Application:**
```bash
vercel --prod --confirm
```

---

## 9. Security Issues

### SQL Injection Detected

**Symptom:** Security alert about SQL injection vulnerability

**Solutions:**

1. **Use Parameterized Queries:**
```typescript
// Bad
const query = `SELECT * FROM users WHERE id = '${userId}'`

// Good
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
```

2. **Validate Input:**
```typescript
const { error } = await supabase
  .from('users')
  .select('*')
  .eq('id', z.string().uuid().parse(userId))
```

### XSS Vulnerability

**Symptom:** Security alert about XSS vulnerability

**Solutions:**

1. **Sanitize Output:**
```typescript
// Bad
<div>{userInput}</div>

// Good
<div>{sanitizeHtml(userInput)}</div>
```

2. **Use CSP Headers:**
```typescript
// next.config.js
const CSP = "default-src 'self';"

module.exports = {
  headers: async () => [{
    source: '/(.*)',
    headers: [{
      key: 'Content-Security-Policy',
      value: CSP
    }]
  }]
}
```

### Unauthorized Access

**Symptom:** Users can access data they shouldn't

**Solutions:**

1. **Verify RLS Policies:**
```sql
SELECT policyname, qual FROM pg_policies 
WHERE tablename = '[table]';
```

2. **Check Route Protection:**
```typescript
async function handler(req, res) {
  const { data: { user } } = await supabase.auth.getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
}
```

---

## 10. Emergency Procedures

### Complete Service Down

**Immediate Steps:**
1. Check status page: `app.edumunch.com/status`
2. Verify database connection
3. Check error tracking (Sentry)
4. Restart services

```bash
# Restart Vercel deployment
vercel --prod --confirm

# Or rollback to previous version
vercel rollback
```

### Data Corruption

**Immediate Steps:**
1. **Stop all writes** (if possible)
2. **Backup current state**
3. **Restore from backup**

```bash
# Restore from Supabase backup
# Settings → Backups → Restore to [timestamp]
```

### Security Breach

**Immediate Steps:**
1. **Notify team** immediately
2. **Rotate all secrets**
   - Database password
   - API keys
   - JWT secrets
3. **Audit access logs**
4. **Force password reset** for all users
5. **Disable compromised accounts**

```bash
# Rotate Supabase keys
supabase projects api-keys rotate
```

### Database Corruption

**Recovery Steps:**
```bash
# 1. Create backup of corrupted data (for analysis)
pg_dump > corrupted_backup.sql

# 2. Restore from last known good backup
# Supabase: Settings → Backups → Restore

# 3. Verify data integrity
SELECT COUNT(*) FROM [table];
SELECT * FROM [table] WHERE [check_constraint];

# 4. Run consistency checks
VACUUM ANALYZE;
REINDEX DATABASE postgres;
```

---

## Emergency Contacts

- **On-Call Engineer:** [Phone/Email]
- **Database Admin:** [Phone/Email]
- **Payment Support:** [Phone/Email]
- **Supabase Support:** https://supabase.com/support
- **Vercel Support:** https://vercel.com/support

## Runbook Reference

See separate runbook documents for:
- Deployment Runbook
- Incident Response Plan
- Disaster Recovery Plan
- Security Incident Response

---

**Last Updated:** [Date]  
**Approval:** [Name]  
**Status:** Ready for Production

