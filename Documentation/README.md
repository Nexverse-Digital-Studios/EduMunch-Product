# EduMunch: Complete Documentation Index

> Central hub for all EduMunch technical documentation

---

## Documentation Structure

This folder contains the complete technical specification for the EduMunch multi-tenant school management system.

### Core Documents

1. **[baseIdea.md](baseIdea.md)** - Original concept and multi-tenant architecture overview
2. **[01_FeatureList.md](01_FeatureList.md)** - Comprehensive feature catalog (Basic to Enterprise)
3. **[02_DatabaseSchema.md](02_DatabaseSchema.md)** - Complete database design with all tables
4. **[03_FeatureToggleSystem.md](03_FeatureToggleSystem.md)** - Code-based feature management
5. **[04_PlatformArchitecture.md](04_PlatformArchitecture.md)** - Three platform designs (Dev Panel, Admin, Web App)
6. **[05_APIArchitecture.md](05_APIArchitecture.md)** - API structure and integrations
7. **[06_SchemaChangeSummary.md](06_SchemaChangeSummary.md)** - **NEW:** Course-based schema updates

---

## Quick Reference

### System Overview

**Cost Target:** ₹6,800/school/year

**Architecture:** Multi-tenant with DB Hub sharding (5 schools per Supabase Pro instance)

**Table Structure:** `[table_name]_[INDEX_TOKEN]` (e.g., `students_1EMAET`)

**Storage:** 
- Database: Textual data only (8GB limit per Hub)
- Media: Cloudflare R2 (unlimited, cost-effective)

---

## Feature Tiers

| Tier | Price/Year | Features |
|------|------------|----------|
| **Basic** | ₹6,800 | Core school management (attendance, exams, fees) |
| **Standard** | ₹12,000 | + LMS, Library, Transport, Staff management |
| **Advanced** | ₹20,000 | + AI Analytics, Online payments, Alumni, Admissions |
| **Enterprise** | Custom | + Multi-campus, Advanced HR, Accounting |

---

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS + shadcn/ui
- React Query (Server state)
- Zustand (Client state)
- React Router v6

### Backend
- Supabase (Database + Auth + Realtime + Storage)
- PostgreSQL (Database)
- Edge Functions (Deno runtime)
- Row Level Security (RLS)

### External Services
- Cloudflare R2 (Media storage)
- Razorpay (Payments)
- SMS Gateway (Notifications)
- SMTP/SendGrid (Email)

---

## Three Platforms

### 1. Dev Panel
**Users:** Nexverse Digital Studios team

**Purpose:** System administration, Hub management, Schema sync

**Key Features:**
- School onboarding
- DB Hub provisioning
- Schema migration management
- Feature configuration per school
- System-wide monitoring

---

### 2. Admin Dashboard
**Users:** School administrators (HR, Academic, Finance, Super Admin)

**Purpose:** Daily operational management

**Key Features:**
- Student/staff management
- Attendance marking
- Exam & marks management
- Fee collection
- Report generation
- Communication tools

---

### 3. Web App
**Users:** Students, Teachers, Parents

**Purpose:** Academic activities and information access

**Key Features:**
- View attendance & marks
- Submit assignments
- Access study materials
- Online fee payment
- Notifications
- PWA support (offline access)

---

## Database Highlights

### Core Tables (Always Present)
- `users_[TOKEN]` - Authentication & profiles
- `courses_[TOKEN]` - Course master (Class 11, JEE, NEET, etc.)
- `branches_[TOKEN]` - Multi-branch support
- `course_branch_pricing_[TOKEN]` - Branch-specific pricing
- `subjects_[TOKEN]` - Subject master
- `topics_[TOKEN]` - Topic/chapter hierarchy
- `batches_[TOKEN]` - Class batches/sections
- `batch_students_[TOKEN]` - Student batch enrollment
- `students_[TOKEN]` - Student records
- `teachers_[TOKEN]` - Teacher records
- `parents_[TOKEN]` - Parent information
- `teacher_subjects_[TOKEN]` - Teacher-batch-subject mapping
- `attendance_[TOKEN]` - Daily batch-wise attendance
- `timetables_[TOKEN]` - Weekly timetable (time-based)
- `lecture_templates_[TOKEN]` - Reusable lecture templates
- `exams_[TOKEN]` - Exam schedules
- `exam_marks_[TOKEN]` - Student marks
- `fee_structures_[TOKEN]` - Fee configuration
- `fee_payments_[TOKEN]` - Payment transactions

### Optional Tables (Feature-based)
- `library_books_[TOKEN]` - Library management
- `transport_routes_[TOKEN]` - Transport system
- `hostel_rooms_[TOKEN]` - Hostel management
- `assignments_[TOKEN]` - LMS assignments
- `study_materials_[TOKEN]` - Study materials with topic links
- `alumni_[TOKEN]` - Alumni tracking

### Custom Tables (XTRA Prefix)
- `XTRA_custom_feature_[TOKEN]` - School-specific features (not synced)

---

## Feature Toggle System

Features are **code-based**, not database-driven:

```typescript
// features.config.ts (embedded in each school's build)
export const FEATURES = {
  subscriptionTier: 'standard',
  lms: true,
  library: true,
  transport: false,  // Disabled for this school
  onlinePayments: true,
  aiAnalytics: false,
  // ... etc
};
```

**Benefits:**
- Zero database queries for feature checks
- Faster app load times
- Smaller bundle size (tree-shaking)
- Compile-time security

---

## Authentication & Security

### Authentication
- **Supabase Auth** for email/password + OTP
- Session management (7-day validity)
- MFA support for admins

### Authorization
- **Row Level Security (RLS)** for data access
- Role-based permissions: Super Admin, HR Manager, Academic Manager, Finance Manager, Teacher, Student, Parent
- Granular module-level permissions

---

## API Structure

### Auto-Generated REST API
Supabase automatically generates REST endpoints for all tables.

```typescript
// Example: Fetch students
const { data } = await supabase
  .from(`students_${INDEX_TOKEN}`)
  .select('*')
  .eq('class_id', classId);
```

### Edge Functions
For complex operations:
- Bulk student upload
- Report card generation
- Payment processing
- SMS/Email sending
- Timetable generation

### Real-Time Subscriptions
WebSocket-based live updates:
- Attendance marking (live collaboration)
- Notifications (instant delivery)
- Admin announcements

---

## Deployment Strategy

### White-Labeling Process

1. **School Onboarding** (Dev Panel)
   - Create school entry in Dev Master DB
   - Assign Index Token (e.g., `1EMAET`)
   - Allocate DB Hub
   - Configure subscription tier

2. **Feature Configuration**
   - Select enabled features
   - Generate `features.config.ts`
   - Generate `.env.production`

3. **Database Setup**
   - Create tables in assigned Hub
   - Apply RLS policies
   - Seed initial data

4. **Build & Deploy**
   - Trigger CI/CD pipeline
   - Build with school-specific config
   - Deploy to Vercel/Netlify
   - Custom domain setup (e.g., `dps.edumunch.in`)

---

## Cost Breakdown (Per School)

| Component | Cost/Year | Notes |
|-----------|-----------|-------|
| **Supabase Pro** | ₹6,000 | Shared across 5 schools = ₹1,200/school |
| **Cloudflare R2** | ₹300 | ~10GB storage + bandwidth |
| **Domain & Hosting** | ₹500 | Vercel Pro (shared) |
| **SMS Gateway** | ₹2,000 | ~10,000 SMS/year |
| **Email Service** | ₹1,000 | SendGrid/SMTP |
| **Payment Gateway** | ₹0 | Pay-per-transaction (Razorpay) |
| **Maintenance** | ₹1,800 | Support & updates |
| **Total** | **₹6,800** | Basic tier target achieved ✅ |

---

## Next Steps

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up Dev Master DB
- [ ] Create Dev Panel (basic version)
- [ ] Design database schema SQL files
- [ ] Set up first DB Hub
- [ ] Implement authentication system

### Phase 2: Core Features (Weeks 5-12)
- [ ] Student management module
- [ ] Attendance system
- [ ] Exam & marks management
- [ ] Fee management
- [ ] Admin Dashboard UI

### Phase 3: Web App (Weeks 13-16)
- [ ] Student portal
- [ ] Teacher portal
- [ ] Parent portal
- [ ] PWA implementation

### Phase 4: Advanced Features (Weeks 17-20)
- [ ] LMS (assignments, study materials)
- [ ] Library management
- [ ] Transport system
- [ ] Communication tools (SMS/Email)

### Phase 5: Premium Features (Weeks 21-24)
- [ ] Online payment integration
- [ ] AI analytics
- [ ] Advanced reporting
- [ ] Mobile app (React Native)

### Phase 6: Polish & Launch (Weeks 25-28)
- [ ] Testing & bug fixes
- [ ] Documentation
- [ ] First school pilot
- [ ] Marketing & sales

---

## Important Notes

### Database Best Practices
1. **Always use dynamic table names** with Index Token
2. **Enable RLS on all tables** without exception
3. **Use UUIDs for primary keys** for global uniqueness
4. **Store media URLs only** in database, not actual files
5. **Implement soft deletes** (`deleted_at` column)
6. **Add timestamps** (`created_at`, `updated_at`) to all tables

### Security Checklist
- ✅ Row Level Security (RLS) enabled
- ✅ API keys stored in environment variables
- ✅ HTTPS only
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CSRF tokens for forms
- ✅ Rate limiting on sensitive endpoints

### Performance Optimization
- Use Supavisor (connection pooler) for high concurrency
- Implement pagination for large lists
- Cache frequently accessed data (React Query)
- Optimize images before upload
- Use CDN for static assets
- Lazy load components
- Debounce search inputs

---

## Support & Maintenance

### Monitoring
- **Error Tracking:** Sentry
- **Analytics:** Mixpanel / Google Analytics
- **Uptime Monitoring:** UptimeRobot
- **Database Health:** Supabase Dashboard

### Backup Strategy
- **Database:** Automated daily backups (Supabase)
- **Media:** R2 versioning enabled
- **Code:** Git version control

### Update Process
1. Test changes in staging Hub
2. Create database migration
3. Apply to all Hubs via Dev Panel
4. Deploy app updates
5. Monitor for errors

---

## Contact & Resources

**Developer:** Nexverse Digital Studios

**Tech Lead:** [Your Name]

**Repository:** [GitHub Link]

**Dev Panel:** [URL]

**Documentation:** This folder

---

**Status:** ✅ Complete documentation ready for implementation

**Last Updated:** December 22, 2025

**Version:** 1.0.0
