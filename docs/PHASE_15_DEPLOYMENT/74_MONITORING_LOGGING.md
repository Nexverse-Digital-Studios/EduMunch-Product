# 74 - Monitoring, Logging & Observability

## Overview

Complete monitoring, logging, and observability setup for EduMunch to ensure system health, performance, and reliability.

---

## Table of Contents

1. Logging Strategy
2. Centralized Log Aggregation
3. Error Tracking & Monitoring
4. Performance Monitoring
5. Uptime Monitoring
6. Database Monitoring
7. Security Monitoring
8. Alerting & Notifications
9. Dashboards
10. Best Practices

---

## 1. Logging Strategy

### Logging Levels

| Level | Purpose | Example |
|-------|---------|---------|
| DEBUG | Development | Request/response data, variable values |
| INFO | Standard operations | User login, API calls, business events |
| WARN | Potentially problematic | Rate limit approaching, cache miss |
| ERROR | Error conditions | Failed database query, API timeout |
| FATAL | Critical failures | Server crash, database down |

### Application Logging

**Setup Winston Logger:**

```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: {
    service: 'edumunch-api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION
  },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }))
}

export default logger
```

**Usage in Components:**

```typescript
import logger from '@/lib/logger'

async function handleUserLogin(email: string) {
  logger.info('User login attempt', { email, timestamp: new Date() })
  
  try {
    // Login logic
    logger.info('User login successful', { email })
  } catch (error) {
    logger.error('Login failed', { email, error })
  }
}
```

### Structured Logging

```typescript
logger.info('Assignment submitted', {
  studentId: 'user-123',
  assignmentId: 'assign-456',
  submissionTime: 2.5, // seconds
  fileSize: 1024, // bytes
  status: 'success'
})
```

### Log Retention

**Development:** 7 days
**Staging:** 30 days
**Production:** 90 days

---

## 2. Centralized Log Aggregation

### Setup with Supabase & External Service

**Option 1: Datadog**

1. **Install Datadog SDK:**
   ```bash
   npm install dd-trace
   ```

2. **Initialize in app:**
   ```typescript
   // pages/_app.tsx
   import tracer from 'dd-trace'
   
   tracer.init({
     service: 'edumunch',
     env: process.env.NODE_ENV,
     version: process.env.APP_VERSION,
   })
   ```

3. **Environment variables:**
   ```
   DD_API_KEY=[your-api-key]
   DD_APP_KEY=[your-app-key]
   DD_SITE=datadoghq.com
   ```

**Option 2: ELK Stack (Self-Hosted)**

```bash
# Docker compose for ELK
docker-compose up -d elasticsearch kibana logstash
```

### Database Logging

**Enable Query Logging:**

```sql
-- In Supabase, enable query logging
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- Log queries > 1s

-- View logs
SELECT query, query_start, state
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### API Request/Response Logging

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Log request
  console.info('[API Request]', {
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  })
  
  // Continue and measure response time
  const response = NextResponse.next()
  const duration = Date.now() - startTime
  
  // Log response
  console.info('[API Response]', {
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  })
  
  return response
}
```

---

## 3. Error Tracking & Monitoring

### Setup Sentry

1. **Create account at sentry.io**

2. **Create project for Next.js**

3. **Install SDK:**
   ```bash
   npm install @sentry/nextjs
   ```

4. **Configure in `pages/_app.tsx`:**
   ```typescript
   import * as Sentry from '@sentry/nextjs'
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     integrations: [
       new Sentry.Replay({
         maskAllText: true,
         blockAllMedia: true,
       }),
     ],
     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
     replaySessionSampleRate: 0.1,
     replayOnErrorSampleRate: 1.0,
   })
   ```

5. **Environment variables:**
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   SENTRY_ORG=your-org
   SENTRY_PROJECT=edumunch
   SENTRY_AUTH_TOKEN=token
   ```

### Error Reporting

**Automatic Error Capture:**
```typescript
// Errors are automatically captured:
// - Uncaught exceptions
// - Promise rejections
// - React error boundaries
```

**Manual Error Capture:**
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // Code that might error
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'enrollments',
      action: 'batch_admission'
    },
    level: 'error'
  })
}
```

### Error Alerts

**Configure Alerts in Sentry:**
1. Go to **Alerts**
2. Click **Create Alert Rule**
3. Configure:
   - **Conditions:** Error count > 5 in 1 minute
   - **Action:** Send email to team
   - **Add to:** All members

---

## 4. Performance Monitoring

### Web Vitals Monitoring

```typescript
// pages/_app.tsx
import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

export default function App({ Component, pageProps }: any) {
  useReportWebVitals((metric) => {
    // Report to Sentry
    Sentry.captureMessage(
      `Web Vital: ${metric.name}`,
      {
        level: 'info',
        tags: {
          metric: metric.name,
          value: metric.value,
          rating: metric.rating
        }
      }
    )
    
    // Log to console in dev
    console.log(metric)
  })
  
  return <Component {...pageProps} />
}
```

### Core Web Vitals

| Metric | Target | Tool |
|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | Next.js Analytics |
| FID (First Input Delay) | < 100ms | Sentry |
| CLS (Cumulative Layout Shift) | < 0.1 | Sentry |

### Database Query Performance

```typescript
// services/user.service.ts
import { performance } from 'perf_hooks'

export async function getUser(id: string) {
  const start = performance.now()
  
  const user = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  const duration = performance.now() - start
  
  if (duration > 1000) {
    console.warn(`Slow query: getUser took ${duration}ms`)
  }
  
  return user
}
```

### API Performance Monitoring

```typescript
// pages/api/[resource].ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now()
  
  try {
    // Handle request
    
    const duration = Date.now() - startTime
    res.setHeader('X-Response-Time', `${duration}ms`)
  } catch (error) {
    const duration = Date.now() - startTime
    res.status(500).json({ error })
  }
}
```

---

## 5. Uptime Monitoring

### Setup UptimeRobot

1. **Create account at uptimerobot.com**

2. **Add Monitor:**
   - **Monitor Type:** HTTP(S)
   - **URL:** https://app.edumunch.com/api/health
   - **Check Interval:** 5 minutes
   - **Alert Contacts:** Email to team

3. **Configure Alerts:**
   - Email on downtime
   - Email on recovery
   - SMS for critical downtime

### Health Check API

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  checks: {
    database: 'ok' | 'error'
    api: 'ok' | 'error'
    cache?: 'ok' | 'error'
  }
  version?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  const checks = {
    database: 'ok' as const,
    api: 'ok' as const,
  }
  
  try {
    // Check database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    
    if (error) {
      checks.database = 'error'
      throw new Error('Database check failed')
    }
    
    const isHealthy = Object.values(checks).every(v => v === 'ok')
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.APP_VERSION
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: { ...checks, database: 'error' }
    })
  }
}
```

---

## 6. Database Monitoring

### Query Performance Analysis

```sql
-- Top slow queries
SELECT query, mean_time, max_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Missing indexes
SELECT * FROM pg_stat_user_tables
WHERE seq_scan > 100 AND idx_scan = 0;
```

### Database Size Monitoring

```sql
-- Database size
SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
ORDER BY pg_database_size(datname) DESC;

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index sizes
SELECT schemaname, indexname, 
       pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Connection Pool Monitoring

**Track active connections:**
```sql
SELECT datname, count(*) as connection_count
FROM pg_stat_activity
GROUP BY datname;

-- Kill idle connections (if needed)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < now() - interval '30 minutes';
```

---

## 7. Security Monitoring

### Access Logs

```typescript
// Middleware to log all API access
export async function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for')
  
  // Log access attempt
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.info('[Access]', {
      ip,
      path: request.nextUrl.pathname,
      method: request.method,
      userId: request.headers.get('x-user-id'),
      timestamp: new Date().toISOString()
    })
  }
  
  return NextResponse.next()
}
```

### Failed Login Attempts

```sql
-- Check failed login attempts
SELECT user_id, ip_address, count(*) as attempts, max(attempt_time) as last_attempt
FROM failed_login_attempts
WHERE attempt_time > NOW() - INTERVAL '1 hour'
GROUP BY user_id, ip_address
HAVING count(*) > 3
ORDER BY attempts DESC;
```

### RLS Policy Violations

```sql
-- Check RLS policy denials
SELECT table_name, policy_name, count(*) as denial_count
FROM rls_denials
WHERE denied_at > NOW() - INTERVAL '24 hours'
GROUP BY table_name, policy_name
ORDER BY denial_count DESC;
```

### Security Alerts

Create alerts for:
- Multiple failed login attempts
- RLS policy violations
- Unusual data access patterns
- Large data exports
- Permission changes

---

## 8. Alerting & Notifications

### Alert Rules

**Error Rate Alert:**
```
IF error_rate > 5% FOR 5 minutes
THEN send_alert_to_team
```

**Database Alert:**
```
IF database_connection_pool > 90%
THEN send_alert_to_ops
```

**Performance Alert:**
```
IF api_response_time > 2s
THEN send_alert_to_team
```

### Notification Channels

**Slack Integration:**
```bash
# 1. Create Slack webhook
# 2. Install integration in Sentry/Datadog
# 3. Test notification
curl -X POST [webhook-url] \
  -H 'Content-Type: application/json' \
  -d '{"text":"System Alert: High Error Rate"}'
```

**Email Notifications:**
- Critical alerts: Immediate email
- Warnings: Digest email (daily)
- Info: Dashboard only

### Escalation Policy

```
Level 1 (Info):     Dashboard
Level 2 (Warning):  Email to team lead
Level 3 (Error):    Email + Slack to on-call
Level 4 (Critical): Email + SMS to CTO + Slack
```

---

## 9. Dashboards

### Grafana Dashboard

**Create Dashboard:**
1. Add data sources (Prometheus, Datadog, Sentry)
2. Create panels for:
   - API response time
   - Error rate
   - Database queries
   - User count
   - Revenue metrics

**Key Metrics to Display:**
```
- Requests per minute
- Error rate (%)
- Average response time (ms)
- Database query time (ms)
- Active users
- System uptime (%)
- Cache hit rate (%)
- Failed payments
```

### Custom Dashboard

**Next.js Custom Dashboard:**
```typescript
// pages/admin/monitoring.tsx
import { useState, useEffect } from 'react'

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState(null)
  
  useEffect(() => {
    async function fetchMetrics() {
      const response = await fetch('/api/metrics')
      const data = await response.json()
      setMetrics(data)
    }
    
    const interval = setInterval(fetchMetrics, 30000) // Every 30s
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div>
      <h1>System Monitoring</h1>
      {metrics && (
        <div>
          <p>API Health: {metrics.apiHealth}</p>
          <p>Database: {metrics.databaseStatus}</p>
          <p>Uptime: {metrics.uptime}%</p>
          <p>Error Rate: {metrics.errorRate}%</p>
        </div>
      )}
    </div>
  )
}
```

---

## 10. Best Practices

### Logging Best Practices

✅ **DO:**
- Log important business events
- Use structured logging (JSON)
- Include relevant context
- Set appropriate log levels
- Rotate logs regularly
- Encrypt sensitive data

❌ **DON'T:**
- Log passwords or tokens
- Log full request/response bodies
- Log customer PII without consent
- Leave DEBUG level in production
- Store logs indefinitely

### Monitoring Best Practices

✅ **DO:**
- Monitor key user journeys
- Track SLOs and SLIs
- Alert on anomalies
- Test alerting regularly
- Review logs daily
- Document incidents

❌ **DON'T:**
- Alert on every event
- Ignore low-severity alerts
- Store unlimited historical data
- Monitor without purpose
- Silence permanent alerts

### Security Monitoring Best Practices

✅ **DO:**
- Monitor access logs
- Track permission changes
- Alert on suspicious activity
- Review audit logs regularly
- Archive logs securely
- Comply with regulations

❌ **DON'T:**
- Store logs unencrypted
- Keep logs accessible to all
- Ignore security alerts
- Mix logs with application data

---

## Monitoring Runbook

### Daily Tasks

- [ ] Check error rate < 1%
- [ ] Verify all services healthy
- [ ] Review failed payments
- [ ] Check disk usage
- [ ] Verify backups completed

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Analyze slow queries
- [ ] Check security alerts
- [ ] Review capacity trends
- [ ] Update runbook if needed

### Monthly Tasks

- [ ] Full system audit
- [ ] Disaster recovery test
- [ ] Capacity planning
- [ ] Security review
- [ ] Performance optimization

---

**Last Updated:** [Date]  
**Monitoring Stack:** Sentry, Datadog, UptimeRobot  
**Status:** Production Ready

