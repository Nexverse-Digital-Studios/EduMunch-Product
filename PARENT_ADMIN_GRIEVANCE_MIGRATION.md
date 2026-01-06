# Parent-Admin Grievance System Migration

## Overview

Successfully migrated the grievance system from **Parent-Teacher Model** to **Parent-Admin Model**.

In this new model:

- **Parents** submit grievances to **Admin** (instead of specific teachers)
- **Admin** receives all grievances from all parents in a centralized chat interface
- **Admin** manages grievance status with options: Open, In Progress, Resolved, Closed, Escalated
- **Parents** can view their grievances and track status updates

## Changes Made

### 1. Database Schema

**File:** `Schema/parent_teacher_grievances.sql`

#### Changes:

- Updated comment from "Parent-Teacher" to "Parent-Admin"
- Replaced `teacher_id` field with `admin_id` UUID foreign key
- Updated RLS policies:
  - Removed `grievances_teacher_access` policy
  - Updated `grievances_admin_access` to handle all admin roles
  - Parents still only see their own grievances
  - Admins see all grievances
- Updated trigger function `update_grievance_on_message`:
  - Changed `unread_by_teacher` to `unread_by_admin`
  - Updated sender_type conditions from 'Teacher' to 'Admin'

### 2. TypeScript Types

**File:** `src/pages/grievances/types.ts`

#### Changes:

- Updated file header comment from "Parent-Teacher" to "Parent-Admin"
- Changed `MessageSenderType` from `'Parent' | 'Teacher' | 'Admin'` to `'Parent' | 'Admin'`
- Updated `GrievanceDB` interface:
  - Changed `teacher_id: string` to `admin_id: string`
  - Changed `unread_by_teacher: number` to `unread_by_admin: number`
- Updated `GrievanceWithDetails` interface:
  - Changed `teacher?` property to `admin?` property with `{ id, full_name, email }`

### 3. Grievance Hooks

**File:** `src/pages/grievances/useGrievances.ts`

#### Key Changes:

**useGrievances Hook:**

- Removed `isTeacher` role check
- Removed `getTeachersForStudent()` method (no longer needed)
- Updated `fetchGrievances()`:
  - Changed query from selecting `teachers_*` to selecting `users_*` with admin_id relation
  - Removed teacher filtering logic
- Updated `createGrievance()`:
  - Removed `teacher_id` parameter
  - Now fetches default admin user from `users_*` table with admin role
  - Assigns grievance to fetched admin automatically
- Updated `updateStatus()`:
  - Kept same functionality (only admins can update status)
- Updated `markAsRead()`:
  - Changed `unread_by_teacher` to `unread_by_admin`
  - Changed sender_type condition from `['Teacher', 'Admin']` to `['Admin']`
- Updated return object:
  - Removed `isTeacher` and `getTeachersForStudent` exports

**useGrievanceChat Hook:**

- Added `isAdmin` boolean flag
- Updated `fetchData()`:
  - Changed query from selecting `teachers_*` to selecting `users_*` with admin_id relation
- Updated `sendMessage()`:
  - Removed Teacher option from sender_type logic
  - Now determines sender as either 'Parent' or 'Admin'
  - Changed auto-update condition: only Admin message triggers "Open" → "In Progress"
- Updated return object:
  - Added `isAdmin` export

### 4. Create Grievance Dialog

**File:** `src/pages/grievances/CreateGrievanceDialog.tsx`

#### Changes:

- Removed `TeacherOption` interface
- Removed imports: `GraduationCap`, `User`, `Avatar`, `AvatarFallback`
- Removed states:
  - `selectedTeacher`
  - `teachers` array
  - `loadingTeachers` boolean
- Removed `getTeachersForStudent()` hook call
- Updated form validation:
  - Removed teacher selection requirement
  - Kept child selection and subject as required
  - Removed description requirement (now optional)
- Updated `createGrievance()` call:
  - Removed `teacher_id` parameter
  - Hook now auto-assigns admin
- Removed entire teacher selection UI section
- Updated dialog title: "New Grievance / Communication" → "New Grievance"
- Updated dialog description: "Start a conversation with a teacher" → "Submit a grievance or concern to the administration"
- Updated success toast: "sent to the teacher" → "submitted to the admin"
- Simplified selected student preview

### 5. Grievance Chat Component

**File:** `src/pages/grievances/GrievanceChat.tsx`

#### Changes:

- Removed `isTeacher` variable
- Added `isAdmin` from `useGrievanceChat()` hook
- Removed `getTeacherName()` helper function
- Added `getAdminName()` helper function to fetch admin full name
- Updated table header display:
  - Changed "Teacher" label to "Admin"
  - Changed display logic from `isParentUser ? Teacher : Parent` to `isParentUser ? Admin : Parent`
- Updated status dropdown menu:
  - Changed from `isTeacher && !isClosed` condition to `isAdmin` only
  - Only admins can now change grievance status
- Updated message sender names in chat display:
  - Parent messages: use `getParentName()`
  - Admin messages: use `getAdminName()` (changed from `getTeacherName()`)

### 6. Grievances List Component

**File:** `src/pages/grievances/GrievancesList.tsx`

#### Changes:

- Updated file header comment from "Parent-Teacher" to "Parent-Admin"
- Removed `isTeacher` from hook return
- Updated empty state message:
  - Changed from "start a conversation with a teacher" to "submit a grievance to admin"
- Updated table columns:
  - Header changed from "Teacher" to "Admin" (with conditional `isAdmin ? "Parent" : "Admin"`)
  - Updated display logic to show parent (if admin view) or admin (if parent view)
- Updated unread count logic:
  - Changed from `unread_by_teacher` to `unread_by_admin`

### 7. Sidebar Configuration

**File:** `src/routes/sidebarConfig.ts`

#### Changes:

- Updated grievances module comment: "Parent-Teacher Communication" → "Parent-Admin Communication"
- Updated display name: "Parent-Teacher Chat" → "Grievances"

## Migration Checklist

✅ Database schema updated with admin_id instead of teacher_id  
✅ RLS policies updated for parent-admin access  
✅ Types updated to use admin_id and Admin sender type  
✅ useGrievances hook refactored to fetch/assign admins  
✅ useGrievanceChat hook updated with isAdmin support  
✅ CreateGrievanceDialog simplified to remove teacher selection  
✅ GrievanceChat component updated for admin status management  
✅ GrievancesList updated to show admin/parent in list  
✅ Sidebar configuration updated

## Testing Recommendations

1. **Parent Flow:**

   - Create new grievance (no teacher selection)
   - Verify grievance appears in parent's grievance list
   - Send message and verify admin receives it
   - Check unread count updates correctly

2. **Admin Flow:**

   - Verify all grievances from all parents appear
   - Update grievance status (In Progress, Resolved, etc.)
   - Send message and verify parent receives it
   - Check status badge updates correctly

3. **Real-time Features:**

   - Verify messages appear in real-time
   - Check unread badge updates
   - Verify status changes propagate

4. **Role-based Access:**
   - Only admins should see status dropdown
   - Parents should only see their own grievances
   - Admins should see all grievances

## Database Cleanup (Optional)

Once migration is complete and tested, consider:

1. Renaming table from `parent_teacher_grievances_*` to `parent_admin_grievances_*` (requires careful migration)
2. Creating database views for backward compatibility if needed
3. Archiving old teacher-related grievances

## Notes

- The table name remains `parent_teacher_grievances_*` for backward compatibility (can be renamed later if needed)
- The system automatically assigns the first available admin user when a parent creates a grievance
- If no admin exists, grievance creation will fail with error message
- All grievance history and messages are preserved during migration
