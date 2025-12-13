# Technology Stack

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

EduMunch uses a **modern, scalable, and production-ready tech stack** optimized for Indian market requirements and maximum development velocity.

---

## Frontend Technology

### Framework: React 18+
- **Why React?** Component-based, large ecosystem, reusable components
- **Version:** 18.x or higher
- **Language:** TypeScript for type safety
- **Features Used:**
  - React Hooks (useState, useEffect, useContext, etc.)
  - React Router for client-side navigation
  - React Hook Form for form management
  - Controlled and uncontrolled components

### Build Tool: Vite
- **Why Vite?** Lightning-fast development server, optimized production builds
- **Version:** Latest stable
- **Configuration:** Pre-configured for React + TypeScript
- **Performance:**
  - Hot Module Replacement (HMR) for instant updates
  - Tree-shaking for minimal bundle size
  - Code splitting for better performance

### Styling: Tailwind CSS
- **Why Tailwind?** Utility-first, rapid UI development, consistent design
- **Version:** Latest stable
- **Setup:** Configured with PostCSS
- **Customization:**
  - Custom color palette matching brand
  - Custom fonts (Indian language support if needed)
  - Dark mode support
  - Responsive design (mobile-first)

### Component Library: Shadcn/ui
- **Why Shadcn?** Headless, composable, accessible components
- **Installation:** Copy-paste component installation
- **Components Included:**
  - Button, Input, Form, Table, Dialog, Dropdown, etc.
  - Fully customizable with Tailwind
  - Built on Radix UI for accessibility
  - Dark mode support

### State Management: Zustand
- **Why Zustand?** Lightweight, easy to learn, minimal boilerplate
- **Usage:** Store global application state
- **Examples:**
  - User authentication state
  - Organization/branch selection
  - Feature flags
  - UI state (sidebar open/close, theme)

### Data Fetching: TanStack Query (React Query)
- **Why TanStack Query?** Advanced caching, synchronization, background updates
- **Version:** Latest stable
- **Features:**
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Pagination support
  - Query invalidation

### Form Management: React Hook Form + Zod
- **React Hook Form:** Flexible, performant form state management
- **Zod:** TypeScript-first schema validation
- **Integration:** Seamless form handling and validation

### HTTP Client: Fetch API / Axios
- **Preference:** Fetch API with middleware
- **Supabase Client:** Official Supabase JavaScript client
- **Features:**
  - Request/response interceptors
  - Error handling
  - Automatic auth token injection
  - Type-safe requests

### Routing: React Router v6
- **Why React Router?** Industry standard, powerful nested routing
- **Features:**
  - Route-based code splitting
  - Protected routes (authentication)
  - Dynamic route parameters
  - Navigation helpers

---

## Backend Technology

### Database: Supabase (PostgreSQL)

#### Why Supabase?
- PostgreSQL for complex queries
- Built-in authentication
- Real-time capabilities
- Instant REST API
- Cloud hosting with automatic scaling

#### Key Components

**1. PostgreSQL Database**
- Version: 14+ (managed by Supabase)
- Capabilities:
  - 120+ tables for all features
  - Complex joins and queries
  - Full-text search
  - JSON/JSONB columns for flexibility
  - Row Level Security (RLS)
  - Triggers and functions (PL/pgSQL)

**2. Supabase Auth**
- Email/Password authentication
- Session management (JWT)
- Password reset workflow
- Two-Factor Authentication (2FA)
- Email verification
- Custom JWT claims for permissions

**3. Supabase Storage**
- File uploads (documents, images, videos)
- Organization: `/bucket/organization_id/feature/...`
- Max file size: Configurable (default 5MB for documents)
- Public and private buckets
- CDN for fast delivery

**4. Supabase Realtime**
- WebSocket-based real-time updates
- Database change notifications
- Presence tracking
- Message broadcasting

**5. Supabase AutoAPI**
- Auto-generated REST API from database schema
- GraphQL endpoint available
- Authentication automatically enforced
- Query parameters for filtering/sorting
- Pagination support

### Business Logic: Database Functions (PL/pgSQL)

- Fee calculations
- Attendance percentage calculations
- Salary calculations
- Automated actions on triggers
- Complex data operations

### Task Scheduling: Supabase Cron (Edge Functions)

- Payment reminders (scheduled)
- Automated report generation
- Data cleanup jobs
- Scheduled notifications

---

## External Services & Integrations

### 1. Payment Gateway: Razorpay

**Why Razorpay?**
- #1 payment gateway in India
- Supports: Cards, UPI, Wallet, Net Banking
- Quick settlement
- Excellent developer documentation
- Supports EMI options

**Integration Points:**
- Online payment collection
- Webhook for payment confirmation
- Refund processing
- Multiple currency support

### 2. Email Service: SendGrid

**Why SendGrid?**
- Reliable email delivery
- Bulk email support
- Email templates
- Analytics and tracking
- Good pricing

**Features Used:**
- Transactional emails (receipts, confirmations)
- Marketing emails (announcements)
- Template management
- Delivery tracking

### 3. SMS Service: Twilio

**Why Twilio?**
- Reliable SMS delivery in India
- Good API
- Scheduled sending
- Delivery tracking

**Features Used:**
- Payment reminders
- Attendance notifications
- Alerts and announcements
- OTP delivery (if implemented)

### 4. Error Tracking: Sentry

**Why Sentry?**
- Real-time error tracking
- Performance monitoring
- Release tracking
- Team collaboration

**Usage:**
- Frontend error tracking
- Performance monitoring
- Session replay (optional)

---

## Development Tools

### Code Editor: VS Code

**Extensions Recommended:**
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint - Code linting
- Thunder Client - API testing
- SQL Tools - Database management

### Package Manager: npm or yarn

- Dependency management
- Script execution
- Version locking

### Version Control: Git & GitHub

- Source code management
- Branching strategy (main, develop, feature/*)
- Pull requests and code reviews
- Actions for CI/CD

### Database Management: Supabase Dashboard

- Visual table editor
- SQL editor
- Authentication management
- Storage bucket management
- Real-time monitoring

---

## Deployment & Hosting

### Frontend Hosting: Vercel

**Why Vercel?**
- Optimized for Next.js and React
- Automatic deployments from Git
- Global CDN
- Edge functions support
- Environment variable management
- Preview deployments for PRs

**Deployment Process:**
1. Push to GitHub
2. Vercel automatically builds
3. Deploys to edge nodes worldwide
4. Instant rollback capability

### Backend Hosting: Supabase Cloud

**Features:**
- Managed PostgreSQL
- Automatic backups
- SSL certificates
- API rate limiting
- Database monitoring
- Logs and metrics

**Backup Strategy:**
- Automatic daily backups (30 days retention)
- Manual backups for important releases
- Point-in-time recovery available

---

## Development Environment Setup

### System Requirements

**Minimum:**
- 8 GB RAM
- 10 GB disk space
- Windows 10+, macOS 10.14+, or Ubuntu 18.04+

**Recommended:**
- 16 GB RAM
- 20 GB SSD
- Node.js 18+ and npm 9+

### Local Development Tools

1. **Node.js & npm**
   - Node 18+ required
   - npm 9+ included with Node

2. **Supabase CLI**
   - Local Supabase instance for development
   - Database migrations
   - Function management

3. **Environment Variables**
   - `.env.local` for local development
   - `.env.staging` for staging
   - `.env.production` for production

---

## Technology Dependency Chart

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface (React)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Tailwind CSS + Shadcn/ui (Styling & Components) │  │
│  └──────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ React Router (Navigation)                        │  │
│  │ React Hook Form + Zod (Forms)                    │  │
│  │ Zustand (State Management)                       │  │
│  │ TanStack Query (Data Fetching)                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼────────┐   ┌────────▼───────┐
        │  Supabase JS   │   │  External APIs │
        │    Client      │   │  (Razorpay,    │
        └────────┬────────┘   │   Twilio, etc) │
                 │            └────────────────┘
        ┌────────▼─────────────────────┐
        │   Supabase Cloud Backend     │
        │  ┌────────────────────────┐  │
        │  │ PostgreSQL Database    │  │
        │  │ Auth                   │  │
        │  │ Storage                │  │
        │  │ Realtime               │  │
        │  │ AutoAPI (REST/GraphQL) │  │
        │  └────────────────────────┘  │
        └────────────────────────────────┘
```

---

## Technology Version Lock

| Technology | Version | Lock Status |
|-----------|---------|------------|
| Node.js | 18+ | ✅ Locked to 18.x |
| React | 18+ | ✅ Latest 18.x |
| TypeScript | 5+ | ✅ Latest 5.x |
| Vite | Latest | ✅ Auto-update |
| Tailwind CSS | 3+ | ✅ Latest 3.x |
| Shadcn/ui | Latest | ✅ Auto-update |
| Zustand | 4+ | ✅ Latest 4.x |
| Supabase JS | Latest | ✅ Auto-update |
| React Router | 6+ | ✅ Latest 6.x |
| Zod | 3+ | ✅ Latest 3.x |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|------------|
| First Contentful Paint (FCP) | < 2s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Lighthouse Score | > 90 | Desktop & Mobile |
| Bundle Size | < 250KB (gzipped) | Webpack analyzer |

---

## Browser Support

- ✅ Chrome/Edge (Latest 2 versions)
- ✅ Firefox (Latest 2 versions)
- ✅ Safari (Latest 2 versions)
- ✅ Mobile browsers (iOS 12+, Android 8+)

---

## Why This Stack?

### Advantages

1. **React + Vite:** Fast development, optimized builds
2. **Tailwind + Shadcn:** Rapid UI development, consistent design
3. **Supabase:** No backend to manage, instant APIs
4. **PostgreSQL:** Powerful queries for complex requirements
5. **TypeScript:** Type safety reduces bugs
6. **Zustand + React Query:** Efficient state and data management
7. **Vercel:** Seamless React deployment
8. **Indian services:** Razorpay, Twilio for local market

### Disadvantages

1. **Supabase:** Less flexibility for complex custom logic (mitigated by PL/pgSQL)
2. **React:** Learning curve for developers new to component frameworks
3. **TypeScript:** Initial setup overhead (but long-term benefits)

---

## Upgrade Path

### Short Term (6 months)
- React minor versions
- Tailwind CSS patches
- Dependencies updates

### Medium Term (1 year)
- React major versions (if backward compatible)
- Node.js LTS updates
- Database PostgreSQL minor versions

### Long Term (2+ years)
- Evaluate emerging frameworks
- Monitor Supabase alternatives
- Scale database if needed

---

## Security Considerations

### Frontend
- Content Security Policy (CSP)
- HTTPS enforcement
- Secure authentication token handling
- Input validation with Zod

### Backend
- Row Level Security (RLS) on all tables
- Supabase authentication for API access
- SQL injection prevention (parameterized queries)
- Rate limiting on endpoints

### External Services
- API keys in environment variables
- Encrypted sensitive data
- Webhook signature verification (Razorpay)

---

## Learning Resources

### Documentation
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org/docs)

### Video Tutorials
- React fundamentals
- Supabase getting started
- Tailwind CSS crash course

### Community
- React Discord
- Supabase Discord
- Stack Overflow for specific issues

---

## Next Steps

1. ✅ Understand each technology
2. ✅ Proceed to `03_DEVELOPMENT_SETUP.md` for installation
3. ✅ Set up local development environment
4. ✅ Create first React component
5. ✅ Connect to Supabase

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Tech Stack Finalized  
**Next Phase:** 03_DEVELOPMENT_SETUP.md
