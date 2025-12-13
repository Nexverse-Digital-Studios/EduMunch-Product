# Phase 4 Quick Reference Guide

## New Features at a Glance

| Feature | Service | UI Page | Route | Status |
|---------|---------|---------|-------|--------|
| Board Exams | ✅ boardExamService | ✅ BoardExamsPage | `/admin/academics/results` | ✅ COMPLETE |
| Competitive Exams | ✅ competitiveExamService | ⏳ (service only) | - | Service Only |
| Support Tickets | ✅ supportTicketService | ✅ SupportTicketsPage | `/admin/communications/support` | ✅ COMPLETE |
| Working Hours | ✅ workingHourService | ✅ WorkingHoursPage | `/admin/hr/working-hours` | ✅ COMPLETE |
| Salary Structures | ✅ salaryStructureService | ✅ SalaryStructuresPage | `/admin/hr/salary` | ✅ COMPLETE |
| Topics & Content | ✅ topicService | ✅ TopicsContentPage | `/admin/academics/topics` | ✅ COMPLETE |
| Timetables | ✅ timetableService | ✅ TimetablesPage | `/admin/academics/timetables` | ✅ COMPLETE |

## File Locations

### Services (7 new files)
```
src/services/
├── boardExamService.ts          (8 methods, 200 lines)
├── competitiveExamService.ts    (5 methods, 70 lines)
├── supportTicketService.ts      (7 methods, 180 lines)
├── workingHourService.ts        (8 methods, 150 lines)
├── salaryStructureService.ts    (16 methods, 280 lines)
├── topicService.ts             (11 methods, 280 lines)
└── timetableService.ts         (10 methods, 240 lines)
```

### Pages (6 new files)
```
src/pages/admin/
├── BoardExamsPage.tsx           (300 lines)
├── SupportTicketsPage.tsx       (280 lines)
├── WorkingHoursPage.tsx         (200 lines)
├── SalaryStructuresPage.tsx     (350 lines)
├── TopicsContentPage.tsx        (350 lines)
└── TimetablesPage.tsx          (280 lines)
```

### Database
```
supabase/migrations/
└── 20251213142027_add_remaining_features.sql  (12 tables)
```

### Documentation
```
Root directory/
├── PHASE_4_IMPLEMENTATION_SUMMARY.md
├── REMAINING_FEATURES.md
├── DEPLOYMENT_GUIDE_PHASE4.md
└── TESTING_GUIDE_PHASE4.md
```

## Key Data Models

### Board Exams
```typescript
board_exams {
  id: UUID
  org_id: UUID
  exam_name: string
  exam_type: "BOARD" | "INTERNAL"
  max_marks: number
  exam_date: date
}

exam_results {
  id: UUID
  exam_id: UUID (FK)
  student_id: UUID
  marks_obtained: number
  percentage: number
  grade: string
}
```

### Support Tickets
```typescript
support_tickets {
  id: UUID
  org_id: UUID
  title: string
  description: string
  ticket_type: "ATTENDANCE" | "PAYMENT" | "OTHER"
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  assigned_to: UUID (FK to users)
}
```

### Salary Structure
```typescript
salary_structures {
  id: UUID
  title: string
  base_salary: number
}

salary_earnings {
  salary_structure_id: UUID (FK)
  earning_name: string
  amount: number
}

salary_deductions {
  salary_structure_id: UUID (FK)
  deduction_name: string
  amount: number
}
```

### Topics
```typescript
topics {
  id: UUID
  subject_id: UUID (FK)
  parent_topic_id: UUID (FK, self-referential)
  topic_name: string
  topic_number: string
}

topic_content {
  id: UUID
  topic_id: UUID (FK)
  content_title: string
  content_type: "PDF" | "VIDEO" | "DOCUMENT" | "LINK"
}
```

### Timetables
```typescript
timetables {
  id: UUID
  batch_id: UUID (FK)
  week_date: date
}

timetable_slots {
  id: UUID
  timetable_id: UUID (FK)
  day_of_week: string
  start_time: time
  end_time: time
  subject_id: UUID (FK)
  faculty_id: UUID (FK)
}
```

## Common Service Patterns

### Getting Data with Org Filter
```typescript
async getSomething(user: AuthUser | null) {
  if (!user?.orgId) return { data: null, error: "No organization" };
  
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('org_id', user.orgId);
  
  return { data, error };
}
```

### Creating Data
```typescript
async createSomething(user: AuthUser | null, item: CreateItem) {
  if (!user?.orgId) return { data: null, error: "No organization" };
  
  const { data, error } = await supabase
    .from('table_name')
    .insert([{ ...item, org_id: user.orgId }])
    .select()
    .single();
  
  return { data, error };
}
```

### Updating Data
```typescript
async updateSomething(user: AuthUser | null, id: string, updates: Partial<Item>) {
  if (!user?.orgId) return { data: null, error: "No organization" };
  
  const { data, error } = await supabase
    .from('table_name')
    .update(updates)
    .eq('id', id)
    .eq('org_id', user.orgId)
    .select()
    .single();
  
  return { data, error };
}
```

## Common Page Patterns

### State Management
```typescript
const { user } = useAuthStore();
const [items, setItems] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
```

### Data Fetching
```typescript
useEffect(() => {
  if (user?.orgId) {
    fetchItems();
  }
}, [user?.orgId]);

const fetchItems = async () => {
  setLoading(true);
  const { data } = await serviceMethod(user);
  setItems(data || []);
  setLoading(false);
};
```

### Modal Form Handling
```typescript
const handleCreate = async () => {
  const { error } = await serviceMethod(user, formData);
  if (!error) {
    setShowModal(false);
    setFormData({ /* reset */ });
    fetchItems(); // Refresh list
  }
};
```

## Testing Quick Commands

### Run Build
```bash
npm run build
```

Expected: 0 TypeScript errors, 683.66 KB bundle

### Test Specific Service
```bash
# Add to package.json and run:
npm test -- boardExamService
```

### Check for TypeScript Errors
```bash
npx tsc --noEmit
```

### Check Bundle Size
```bash
npm run build
# Check dist/assets/ size
```

## Deployment Quick Checklist

- [ ] Run `npm run build` - verify 0 errors
- [ ] Run migration in Supabase
- [ ] Test all 6 new pages
- [ ] Verify RLS policies active
- [ ] Check performance metrics
- [ ] Confirm responsive design
- [ ] Test on 3+ browsers
- [ ] Deploy to production
- [ ] Monitor error logs for 24 hours
- [ ] Send release notes to stakeholders

## Common Issues & Solutions

### Issue: "Cannot find module '@/store/authStore'"
```bash
# Solution: All imports should use @/store/authStore, not @/stores/authStore
```

### Issue: "AuthUser type not found"
```bash
# Solution: Import from './auth.service'
import { AuthUser } from './auth.service';
```

### Issue: RLS blocking all access
```sql
-- Solution: Check that policies reference the correct field
WHERE org_id = auth.jwt() ->> 'org_id'
-- And that user has org_id in JWT claims
```

### Issue: Build bundle too large
```typescript
// Solution: Convert to lazy loading
const Page = lazy(() => import('./pages/Page'));
```

## Performance Tips

### Database Queries
- Always filter by `org_id` first
- Use indexes on frequently queried columns
- Limit results with `.limit()`
- Use `.select()` to specify needed columns

### React Performance
- Use `useCallback` for functions passed to child components
- Memoize expensive computations
- Use `lazy()` and `Suspense` for route-based code splitting
- Avoid inline object creation in dependencies

### Bundle Optimization
- Monitor with `npm run build`
- Use dynamic imports for heavy modules
- Tree-shake unused code
- Minify CSS and JavaScript

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Check TypeScript
npx tsc --noEmit

# Format code
npm run format  # if available

# Lint code
npm run lint    # if available

# Run tests
npm test        # if available
```

## Route Structure

### Admin Routes with New Features
```
/admin/academics/
  ├── results            → BoardExamsPage ✅
  ├── topics             → TopicsContentPage ✅
  └── timetables         → TimetablesPage ✅

/admin/hr/
  ├── salary             → SalaryStructuresPage ✅
  └── working-hours      → WorkingHoursPage ✅

/admin/communications/
  └── support            → SupportTicketsPage ✅
```

## API Response Format

All services follow consistent response format:
```typescript
{
  data: T | null,
  error: Error | null
}
```

Usage:
```typescript
const { data, error } = await serviceMethod(user, params);
if (error) {
  console.error('Operation failed:', error);
}
```

## Database Constraints

All tables have:
- ✅ RLS enabled
- ✅ org_id isolation
- ✅ Proper indexes
- ✅ Foreign key constraints
- ✅ Timestamp fields (created_at, updated_at)

## Next Phase Recommendations

1. **Implement UI for existing services**
   - Grievances (service exists)
   - Feedback (service exists)
   
2. **Add remaining features**
   - Subject Management
   - Enrollments
   - Doubts/Q&A

3. **Optimize performance**
   - Code splitting
   - Service worker
   - Database query optimization

4. **Add features**
   - Export to Excel
   - Bulk operations
   - Advanced reporting

---

**Last Updated**: Phase 4 Implementation Complete
**Build Status**: ✅ Production Ready
**Documentation**: Complete
**Testing**: Ready for QA
