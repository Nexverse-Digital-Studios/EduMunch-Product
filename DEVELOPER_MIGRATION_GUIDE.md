# EduMunch Development Migration Guide

**Version:** 2.0  
**Date:** December 22, 2025  
**Status:** Ready for Implementation

---

## Quick Start for Developers

### What Changed?

| Item | Before | After |
|------|--------|-------|
| **Branches** | Fully supported per school | Removed (XTRA feature) |
| **Pricing** | Branch-wise (3-table join) | Course-wide (single column) |
| **Index Tokens** | AZHBXC format | 1ENTK, 2DDMRH, 3TTKB, 4CBW, 5HKSK |
| **Tables Removed** | `branches_{TOKEN}`, `course_branch_pricing_{TOKEN}` | - |
| **Columns Removed** | `branch_id` from students, batches, timetables | - |
| **Performance** | ~3-4 table joins for queries | Direct access (no joins needed) |

---

## For Frontend Developers

### 1. Update Course Fee Retrieval

**Before:**
```typescript
const { data: pricing } = await supabase
  .from(`course_branch_pricing_${INDEX_TOKEN}`)
  .select('*, courses(*), branches(*)')
  .eq('course_id', courseId)
  .eq('branch_id', branchId)
  .single();

const fee = pricing.fees_amount;
```

**After:**
```typescript
const { data: course } = await supabase
  .from(`courses_${INDEX_TOKEN}`)
  .select('*')
  .eq('id', courseId)
  .single();

const fee = course.fees_amount;
```

### 2. Update Batch Queries

**Before:**
```typescript
const { data: batches } = await supabase
  .from(`batches_${INDEX_TOKEN}`)
  .select('*, courses(*), branches(*)')
  .eq('branch_id', branchId)
  .eq('course_id', courseId);
```

**After:**
```typescript
const { data: batches } = await supabase
  .from(`batches_${INDEX_TOKEN}`)
  .select('*, courses(*)')
  .eq('course_id', courseId);
```

### 3. Update Student Enrollment

**Before:**
```typescript
const { data: students } = await supabase
  .from(`batch_students_${INDEX_TOKEN}`)
  .select(`*, student(*), batch(*, branch(*))`)
  .eq('batch_id', batchId)
  .eq('student.branch_id', branchId);
```

**After:**
```typescript
const { data: students } = await supabase
  .from(`batch_students_${INDEX_TOKEN}`)
  .select(`*, student(*), batch(*)`)
  .eq('batch_id', batchId);
```

### 4. Remove Branch Filters from UI

**Forms/Dropdowns to Remove:**
- Branch selection dropdown from course pricing form
- Branch filter from batch listing
- Branch filter from student assignment

**Keep These:**
- Course selection
- Batch selection
- Year/semester selection

---

## For Backend Developers

### 1. Update Environment Variables

```bash
# Change from
VITE_INDEX_TOKEN=AZHBXC

# To one of
VITE_INDEX_TOKEN=1ENTK    # For school 1
VITE_INDEX_TOKEN=2DDMRH   # For school 2
VITE_INDEX_TOKEN=3TTKB    # For school 3
VITE_INDEX_TOKEN=4CBW     # For school 4
VITE_INDEX_TOKEN=5HKSK    # For school 5
```

### 2. Update API Routes

**Remove routes:**
- `GET /api/branches`
- `GET /api/course-pricing` (was getting branch-wise pricing)
- `POST /api/branches`
- `PUT /api/branches/:id`
- `DELETE /api/branches/:id`
- `POST /api/course-pricing`

**Simplify routes:**
- `GET /api/courses` - Now includes `fees_amount`
- `GET /api/courses/:id` - Directly get fees

### 3. Update Database Queries

**Example Migration:**

```sql
-- Before: Complex join
SELECT 
  c.id, c.course_name, cbp.fees_amount,
  b.branch_name, b.branch_code
FROM courses_1ENTK c
JOIN course_branch_pricing_1ENTK cbp ON c.id = cbp.course_id
JOIN branches_1ENTK b ON cbp.branch_id = b.id
WHERE c.is_active = true;

-- After: Simple query
SELECT 
  id, course_name, fees_amount
FROM courses_1ENTK
WHERE is_active = true;
```

### 4. Remove RLS Policies for Branches

**Delete policies that reference:**
```sql
-- These should be removed:
CREATE POLICY "Branch-based access" ON students_1ENTK ...;
CREATE POLICY "Branch assignment" ON batches_1ENTK ...;
```

---

## For Database Administrators

### Migration Steps

#### Step 1: Backup Data
```bash
# Backup important tables (especially if you have branch data)
pg_dump -h hub.supabase.co -U postgres -d postgres \
  --table course_branch_pricing_1ENTK > backup.sql
```

#### Step 2: Migrate Branch Pricing
```sql
-- If you have branch-specific pricing, consolidate to primary branch
UPDATE courses_1ENTK c
SET fees_amount = (
  SELECT fees_amount 
  FROM course_branch_pricing_1ENTK 
  WHERE course_id = c.id 
  AND branch_id = 'primary-branch-id'  -- Replace with your primary
  LIMIT 1
)
WHERE fees_amount IS NULL;

-- Verify migration
SELECT id, course_name, fees_amount FROM courses_1ENTK;
```

#### Step 3: Remove Branch References
```sql
-- Remove constraints first
ALTER TABLE students_1ENTK DROP CONSTRAINT IF EXISTS students_branch_fk;
ALTER TABLE batches_1ENTK DROP CONSTRAINT IF EXISTS batches_branch_fk;
ALTER TABLE timetables_1ENTK DROP CONSTRAINT IF EXISTS timetables_branch_fk;

-- Drop columns
ALTER TABLE students_1ENTK DROP COLUMN IF EXISTS branch_id;
ALTER TABLE batches_1ENTK DROP COLUMN IF EXISTS branch_id;
ALTER TABLE timetables_1ENTK DROP COLUMN IF EXISTS branch_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_students_branch;
DROP INDEX IF EXISTS idx_batches_branch;
DROP INDEX IF EXISTS idx_timetables_branch;
```

#### Step 4: Remove Unused Tables
```sql
DROP TABLE IF EXISTS course_branch_pricing_1ENTK;
DROP TABLE IF EXISTS branches_1ENTK;
```

#### Step 5: Verify Schema
```sql
-- Check remaining structure
\d students_1ENTK
\d batches_1ENTK
\d courses_1ENTK

-- Verify no branch references remain
SELECT column_name FROM information_schema.columns 
WHERE table_name LIKE '%1ENTK' AND column_name LIKE '%branch%';
-- Should return no rows
```

---

## Testing Checklist

### Unit Tests
- [ ] Course fee retrieval works without branches
- [ ] Batch queries return correct data
- [ ] Student enrollment doesn't reference branches
- [ ] Timetable generation works without branch filter

### Integration Tests
- [ ] Admin can create course with fees
- [ ] Admin can create batches for course
- [ ] Teachers can view assigned batches (no branch filter)
- [ ] Students can enroll in batches
- [ ] Parents can view child's batch (no branch filter)

### Database Tests
- [ ] No orphaned data from deleted branch records
- [ ] All fees_amount values populated in courses
- [ ] RLS policies work without branch_id
- [ ] No queries returning branch data

### Performance Tests
- [ ] Course queries < 50ms (was >200ms with joins)
- [ ] Batch queries < 100ms (was >300ms)
- [ ] No N+1 queries for branch lookups

---

## Common Issues & Solutions

### Issue: "branch_id column not found"
**Solution:**
Remove all references to `branch_id` in queries:
```typescript
// Remove
.eq('branch_id', branchId)

// Remove from selects
.select('*, branches(*)')
```

### Issue: "course_branch_pricing table not found"
**Solution:**
Use `courses` table directly:
```typescript
// Old
const { data: pricing } = await supabase
  .from(`course_branch_pricing_${INDEX_TOKEN}`)
  .select('fees_amount')

// New
const { data: course } = await supabase
  .from(`courses_${INDEX_TOKEN}`)
  .select('fees_amount')
```

### Issue: "Different fees for different branches"
**Solution:**
This is now a custom feature. Options:
1. Use standard pricing (update all courses to same fee)
2. Request XTRA feature development from Nexverse

### Issue: RLS policy still checking branch access
**Solution:**
Update RLS policies to remove branch checks:
```sql
-- Before
WHERE branch_id = selected_branch_id AND user_branch = selected_branch_id

-- After
WHERE auth.uid() = user_id
```

---

## Rollback Plan (If Needed)

If you need to revert to multi-branch architecture:

1. **Restore backup:**
   ```bash
   psql -h hub.supabase.co -U postgres -d postgres < backup.sql
   ```

2. **Restore dropped columns:**
   ```sql
   ALTER TABLE students_1ENTK ADD COLUMN branch_id UUID;
   ALTER TABLE batches_1ENTK ADD COLUMN branch_id UUID;
   ALTER TABLE timetables_1ENTK ADD COLUMN branch_id UUID;
   ```

3. **Restore deleted tables from backup**

4. **Rollback code to previous version**

**Note:** We recommend testing in a staging environment first!

---

## Need Help?

### Documentation References
- **Schema Details:** See `SCHEMA_UPDATES_SUMMARY.md`
- **Index Tokens:** See `INDEX_TOKEN_REFERENCE.md`
- **Database Design:** See `Documentation/02_DatabaseSchema.md`

### Quick Links
- **DB Schema:** `Documentation/02_DatabaseSchema.md`
- **API Docs:** `Documentation/05_APIArchitecture.md`
- **Features:** `Documentation/01_FeatureList.md`

### Support
For issues with migration:
1. Check the Troubleshooting section above
2. Review the documentation files
3. Contact Nexverse technical team

---

**Status:** Ready for implementation  
**Estimated Migration Time:** 2-4 hours per school  
**Testing Time:** 1-2 days  
**Deployment:** Coordinate with Nexverse
