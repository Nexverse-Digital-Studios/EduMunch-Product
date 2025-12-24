# EduMunch TIER 1 Schema Files

This folder contains the complete database schema for **TIER 1 (Basic Features)** supporting **5 schools in 1 Database Hub**.

---

## 📁 Files Overview

| File | Description | Tables Created |
|------|-------------|----------------|
| `00_hub_common.sql` | Common hub registry table | 1 table |
| `01_school_1EMAET.sql` | School 1 specific tables | 45 tables |
| `02_school_2DDMK.sql` | School 2 specific tables | 45 tables |
| `03_school_3AAA.sql` | School 3 specific tables | 45 tables |
| `04_school_4CBV.sql` | School 4 specific tables | 45 tables |
| `05_school_5HKSK.sql` | School 5 specific tables | 45 tables |

**Total: 226 tables** (1 common + 225 school-specific)

---

## 🚀 Execution Order

### Step 1: Create Common Table
```bash
psql -U postgres -d your_database -f 00_hub_common.sql
```

This creates:
- `hub_school_registry` table
- Inserts 5 school entries (editable names)

### Step 2: Create School 1 Tables
```bash
psql -U postgres -d your_database -f 01_school_1EMAET.sql
```

### Step 3: Create School 2 Tables
```bash
psql -U postgres -d your_database -f 02_school_2DDMK.sql
```

### Step 4: Create School 3 Tables
```bash
psql -U postgres -d your_database -f 03_school_3AAA.sql
```

### Step 5: Create School 4 Tables
```bash
psql -U postgres -d your_database -f 04_school_4CBV.sql
```

### Step 6: Create School 5 Tables
```bash
psql -U postgres -d your_database -f 05_school_5HKSK.sql
```

---

## ⚡ Quick Setup (All at once)

### For Supabase:
Run files in Supabase SQL Editor in order (00 → 05)

### For Local PostgreSQL:
```bash
cd tier1
for file in *.sql; do
  echo "Running $file..."
  psql -U postgres -d your_database -f "$file"
done
```

### For Windows PowerShell:
```powershell
cd tier1
Get-ChildItem *.sql | Sort-Object Name | ForEach-Object {
  Write-Host "Running $($_.Name)..." -ForegroundColor Green
  psql -U postgres -d your_database -f $_.FullName
}
```

---

## 🏫 School Index Tokens

| School | INDEX_TOKEN | Default Name (Editable) |
|--------|-------------|-------------------------|
| School 1 | `1EMAET` | School 1 - Edit Name |
| School 2 | `2DDMK` | School 2 - Edit Name |
| School 3 | `3AAA` | School 3 - Edit Name |
| School 4 | `4CBV` | School 4 - Edit Name |
| School 5 | `5HKSK` | School 5 - Edit Name |

### Update School Names:
```sql
UPDATE hub_school_registry 
SET school_name = 'Green Valley School' 
WHERE index_token = '1EMAET';

UPDATE hub_school_registry 
SET school_name = 'Sunrise Academy' 
WHERE index_token = '2DDMK';
-- ... and so on
```

---

## 📊 What's Included in Each School

Each of the 5 schools gets **45 independent tables**:

### 1. User Management (3 tables)
- users, sessions, permissions

### 2. Student Management (3 tables)
- students, parents, student_parent_relations

### 3. Academic Management (13 tables)
- academic_years, classes, sections, subjects, class_subjects
- topics, topic_content, teachers, teacher_subject_sections
- timetable_periods, timetables, timetable_substitutions, lecture_templates

### 4. Attendance Management (4 tables)
- attendance, attendance_subject_wise, leave_applications, teacher_attendance

### 5. Examination System (7 tables)
- exam_types, exams, exam_schedules, admit_cards
- exam_marks, report_cards, grade_config

### 6. Fee Management (7 tables)
- fee_components, fee_structures, fee_structure_components
- student_fees, fee_payments, late_fee_config

### 7. Communication System (5 tables)
- announcements, notifications, sms_logs, email_logs

### 8. ID Card Generation (1 table)
- id_cards

### 9. Audit & Logs (1 table)
- activity_logs

---

## 🔐 Authentication & Security

### Supabase Auth Integration:
- `auth.users` table is **shared** across all 5 schools (Supabase managed)
- Each school has `users_{TOKEN}` table that links via `auth_user_id`
- One email = one school (by design)

### Data Isolation:
- Each school's data is in separate table groups
- Tables named: `tablename_INDEXTOKEN`
- Frontend uses `.env` file with `VITE_INDEX_TOKEN` to route requests

### Email Conflicts (Optional Handling):
If two schools need same email:
```
School 1: john@example.com
School 2: school_john@example.com (prefix approach)
```

---

## 📦 Media Storage

All documents, photos, PDFs are stored in **Cloudflare R2**, not in database.

Database only stores URLs:
```
/{INDEX_TOKEN}/{module}/{filename}
/1EMAET/students/photo_12345.jpg
/2DDMK/documents/tc_67890.pdf
```

---

## ✅ Verification

After running all files, verify:

```sql
-- Check common table
SELECT * FROM hub_school_registry;

-- Check School 1 tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE '%_1EMAET';

-- Check School 2 tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE '%_2DDMK';

-- Expected result: 45 tables for each school
```

---

## 🛠️ Troubleshooting

### Issue: Duplicate key error
**Cause:** Running files multiple times  
**Solution:** Drop all tables and run again, or use `CREATE TABLE IF NOT EXISTS`

### Issue: Missing indexes
**Cause:** Script interrupted mid-execution  
**Solution:** Re-run the specific school file

### Issue: Performance slow with 226 tables
**Solution:** Normal for multi-tenant design. Add connection pooling (Supavisor)

---

## 📝 Next Steps

1. ✅ Run all SQL files in order
2. Update school names in `hub_school_registry`
3. Set up RLS policies (to be added later)
4. Configure frontend `.env` files for each school
5. Start building TIER 2 features (optional)

---

## 🔄 Schema Updates

When schema needs to be updated:
1. Modify the change in `00_hub_common.sql` (if common)
2. OR modify and replicate across all 5 school files
3. Use Dev Panel to push migrations (coming soon)

---

**Last Updated:** December 23, 2025  
**Version:** TIER 1 - v1.0.0  
**Architecture:** Multi-tenant with table prefixing
