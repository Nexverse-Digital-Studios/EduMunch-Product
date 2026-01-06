## Role-Based Access Testing Checklist

### 🔴 **PARENT** Role

**Expected Sidebar:**

- ✅ Dashboard
- ✅ My Profile
- ✅ Parent Portal (main module)
- ❌ No admin sections (Users, Roles, etc.)
- ❌ No teacher sections (create assignments, etc.)

**Expected Permissions:**

- View child's attendance (READ only)
- View child's fees (READ only, NOT create)
- View child's homework (READ only)
- Book PTM slots (CREATE/UPDATE)
- Submit feedback/grievances (CREATE)

**Test Steps:**

1. Log in as parent user
2. Verify only parent-related sidebar items show
3. Try accessing /users directly (should redirect or show 403)
4. Check Dashboard shows parent-specific data

---

### 🟡 **TEACHER** Role

**Expected Sidebar:**

- ✅ Dashboard
- ✅ My Profile
- ✅ Students (view students in their classes)
- ✅ Attendance (mark attendance)
- ✅ Assignments (create/manage)
- ✅ Homework (create/manage)
- ✅ Exams (view/grade)
- ❌ No admin sections
- ❌ No fee management

**Expected Permissions:**

- View students (READ)
- Mark attendance (CREATE/UPDATE)
- Create assignments (CREATE/UPDATE/DELETE)
- View exam results (READ/UPDATE marks)

---

### 💰 **ACCOUNTANT** Role

**Expected Sidebar:**

- ✅ Dashboard
- ✅ My Profile
- ✅ Students (read-only for fee tracking)
- ✅ Fee Management (full access)
- ✅ Reports (financial reports)
- ❌ No academic sections (assignments, exams)
- ❌ No admin sections

**Expected Permissions:**

- View student records (READ only)
- Manage fees (CREATE/UPDATE/DELETE)
- Generate reports (EXPORT)
- Approve payments (APPROVE)

---

### 👥 **HR MANAGER** Role

**Expected Sidebar:**

- ✅ Dashboard
- ✅ My Profile
- ✅ Teachers (manage staff)
- ✅ Employees (manage non-teaching staff)
- ✅ Staff Attendance
- ✅ Staff Leave
- ✅ Payroll
- ✅ Recruitment
- ❌ No student academic sections
- ❌ No admin sections

**Expected Permissions:**

- View/manage teachers (READ/CREATE/UPDATE)
- View/manage employees (READ/CREATE/UPDATE)
- Process payroll (CREATE/UPDATE/APPROVE)
- Manage recruitment (CREATE/UPDATE/DELETE)

---

### 📚 **LIBRARIAN** Role

**Expected Sidebar:**

- ✅ Dashboard
- ✅ My Profile
- ✅ Library (full library management)
- ✅ Students (view for library records)
- ✅ Teachers (view for library records)
- ❌ No academic sections
- ❌ No admin sections
- ❌ No fee management

**Expected Permissions:**

- Manage library books (CREATE/UPDATE/DELETE)
- Issue/return books (CREATE/UPDATE)
- View student/teacher records (READ only)

---

## 🧪 **Testing Steps**

### Step 1: Sidebar Visibility Test

1. **Log in as each role**
2. **Take screenshot of sidebar**
3. **Verify only expected modules appear**

### Step 2: Direct URL Access Test

Try accessing restricted URLs directly:

```
/users (should fail for non-admin)
/roles (should fail for non-admin)
/fees (should fail for teacher)
/library (should fail for accountant)
```

### Step 3: Permission Action Test

1. **Go to allowed modules**
2. **Test CRUD buttons** (Create/Edit/Delete)
3. **Verify buttons show/hide based on permissions**

### Step 4: Dashboard Permission Debug

1. **Check "Your Permissions & Accessible Routes" section**
2. **Verify correct role code shows** (not "unknown")
3. **Verify module count matches expectations**

---

## 🚨 **Expected Issues to Watch For**

1. **"unknown" role code** → User missing role assignment
2. **Empty sidebar** → User missing permissions in `user_roles` table
3. **403 errors** → Frontend/backend permission mismatch
4. **Admin sees everything** → Working correctly (bypass)

---

## 🔧 **If Issues Found**

### Issue: User has no sidebar items

**Fix:** Check if user has entry in `user_roles_1emaet`:

```sql
SELECT * FROM user_roles_1emaet WHERE user_id = 'user-uuid-here';
```

### Issue: Role shows as "unknown"

**Fix:** Check if user's `primary_role_id` points to valid role:

```sql
SELECT u.email, u.primary_role_id, r.role_code
FROM users_1emaet u
LEFT JOIN roles_1emaet r ON r.id = u.primary_role_id;
```

### Issue: Wrong permissions for role

**Fix:** Check role permissions in database:

```sql
SELECT p.permission_code, rp.can_read, rp.can_create, rp.can_update
FROM role_permissions_1emaet rp
JOIN permissions_1emaet p ON p.id = rp.permission_id
JOIN roles_1emaet r ON r.id = rp.role_id
WHERE r.role_code = 'teacher';
```
