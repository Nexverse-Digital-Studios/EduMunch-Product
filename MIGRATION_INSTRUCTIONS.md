# Migration Instructions: Parent-Teacher → Parent-Admin Grievance System

## Issue

The old table `parent_teacher_grievances_1emaet` already exists from a previous migration, so running CREATE TABLE will fail.

## Solution

Use the UPDATE migration script provided instead: `migrations/002_migrate_parent_teacher_to_parent_admin_grievances.sql`

## Steps to Run

### 1. **Backup Your Database** (IMPORTANT!)

Before running any migrations, backup your database:

```bash
# Using Supabase CLI
supabase db pull  # backs up current schema

# Or manually export your data
```

### 2. **Run the Migration Script**

#### Option A: Via Supabase Dashboard

1. Go to Supabase dashboard → SQL Editor
2. Open `migrations/002_migrate_parent_teacher_to_parent_admin_grievances.sql`
3. Copy all the SQL
4. Paste into Supabase SQL Editor
5. Click "Run"

#### Option B: Via Supabase CLI

```bash
supabase migration up
# Or manually run:
psql postgresql://[connection-string] < migrations/002_migrate_parent_teacher_to_parent_admin_grievances.sql
```

### 3. **Verify Migration Success**

Run the verification queries at the bottom of the migration file:

```sql
-- Check admin_id column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'parent_teacher_grievances_1emaet'
AND column_name IN ('admin_id', 'unread_by_admin', 'teacher_id');

-- Check all grievances have admin assigned
SELECT COUNT(*) as grievances_with_admin FROM parent_teacher_grievances_1emaet WHERE admin_id IS NOT NULL;

-- Check message types updated
SELECT sender_type, COUNT(*) as count FROM grievance_messages_1emaet GROUP BY sender_type;
```

## What the Migration Does

1. ✅ Drops old teacher-related policies
2. ✅ Adds `admin_id` column referencing `users_1emaet`
3. ✅ Renames `unread_by_teacher` → `unread_by_admin`
4. ✅ Updates existing grievances to assign to default admin
5. ✅ Converts message sender_type from 'Teacher' to 'Admin'
6. ✅ Recreates triggers with new column names
7. ✅ Updates RLS policies for admin access
8. ✅ Updates CHECK constraint for valid sender types

## If Something Goes Wrong

### Check for errors:

```sql
-- See if admin_id is populated
SELECT COUNT(*), COUNT(admin_id), COUNT(teacher_id) FROM parent_teacher_grievances_1emaet;

-- Check if trigger is working
SELECT COUNT(*) FROM grievance_messages_1emaet WHERE sender_type NOT IN ('Parent', 'Admin');
```

### Rollback (if needed):

The migration includes rollback steps at the bottom. Use them to revert if necessary.

### Manual cleanup (optional):

After verification, you can drop the old teacher_id column:

```sql
ALTER TABLE parent_teacher_grievances_1emaet DROP COLUMN teacher_id;
```

## Frontend Code Update

The React/TypeScript code has already been updated to use `admin_id` and `unread_by_admin`. No additional changes needed there.

## Testing After Migration

1. **Test as Parent:**

   - Create new grievance (no teacher selection needed)
   - Verify it appears in your grievance list
   - Check that it's assigned to an admin

2. **Test as Admin:**

   - Should see all grievances from all parents
   - Should be able to change status
   - Should be able to send messages

3. **Test Real-time:**
   - Send message and verify it appears immediately
   - Check unread counts update correctly

## Notes

- Old `teacher_id` column can remain for now (not removed to preserve history)
- To completely clean up, you can drop `teacher_id` after verifying everything works
- All existing grievances will be assigned to the first admin user found
- If no admin exists, the migration will fail at step 6 with a constraint error
