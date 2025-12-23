# TIER 2 Schema - Standard Features

## ⚠️ CRITICAL PREREQUISITE
**TIER 1 MUST BE COMPLETELY DEPLOYED BEFORE RUNNING TIER 2 SCRIPTS**

TIER 2 extends the base schema with advanced features. It depends on tables created in TIER 1 (users, classes, sections, students, teachers, subjects, academic_years, etc.)

## 📁 File Structure

```
tier2/
├── 01_tier2_1EMAET.sql    # School 1 TIER 2 tables
├── 02_tier2_2DDMK.sql    # School 2 TIER 2 tables
├── 03_tier2_3AAA.sql    # School 3 TIER 2 tables
├── 04_tier2_4CBV.sql    # School 4 TIER 2 tables
├── 05_tier2_5HKSK.sql    # School 5 TIER 2 tables
└── README.md              # This file
```

## 🎯 What's in TIER 2?

TIER 2 adds **25 new tables per school** covering:

### 1. Online Learning Management (LMS) - 6 Tables
- `assignments_{TOKEN}` - Teacher-created assignments with deadlines
- `assignment_submissions_{TOKEN}` - Student submissions and evaluations
- `study_materials_{TOKEN}` - Subject-wise learning resources
- `online_class_sessions_{TOKEN}` - Virtual class scheduling (Zoom/Meet/Teams)
- `class_recordings_{TOKEN}` - Recorded class videos
- `material_access_logs_{TOKEN}` - Student engagement tracking

### 2. Transport Management - 7 Tables
- `transport_routes_{TOKEN}` - Bus routes with fare information
- `transport_stops_{TOKEN}` - Stops along each route
- `transport_vehicles_{TOKEN}` - Vehicle registration & documents
- `vehicle_drivers_{TOKEN}` - Driver credentials & licenses
- `vehicle_route_assignments_{TOKEN}` - Daily vehicle-route-driver mapping
- `student_transport_{TOKEN}` - Student transport allocation
- `vehicle_maintenance_{TOKEN}` - Service and repair history

### 3. Advanced HR & Payroll - 8 Tables
- `employees_{TOKEN}` - Non-teaching staff records
- `salary_structures_{TOKEN}` - Salary templates by designation
- `salary_components_{TOKEN}` - Breakdown of earnings/deductions (HRA, DA, PF, ESI)
- `monthly_payroll_{TOKEN}` - Monthly salary processing for all staff
- `pf_esi_records_{TOKEN}` - Statutory contribution tracking
- `performance_reviews_{TOKEN}` - Annual appraisal system
- `recruitment_applications_{TOKEN}` - Job application tracking
- `staff_leave_applications_{TOKEN}` - Leave management for all staff

### 4. Homework & Diary - 2 Tables
- `homework_{TOKEN}` - Daily homework assigned by teachers
- `homework_submissions_{TOKEN}` - Student homework submission tracking

### 5. Staff Management - 2 Tables
*(Included in HR & Payroll section above)*
- Non-teaching staff master data
- Leave application workflow

## 🚀 Execution Order

**Option A: All Schools at Once (Recommended for new hub)**
```sql
-- Run all 5 files in sequence
\i 01_tier2_1EMAET.sql
\i 02_tier2_2DDMK.sql
\i 03_tier2_3AAA.sql
\i 04_tier2_4CBV.sql
\i 05_tier2_5HKSK.sql
```

**Option B: Individual School Deployment (For gradual rollout)**
```sql
-- Deploy only for schools subscribing to Standard package
\i 01_tier2_1EMAET.sql  -- School 1 only
```

## 🏫 School Index Tokens

Each school has a unique 6-character token appended to table names:

| School | Index Token | File Name                  |
|--------|-------------|----------------------------|
| School 1 | 1EMAET    | `01_tier2_1EMAET.sql`     |
| School 2 | 2DDMK    | `02_tier2_2DDMK.sql`     |
| School 3 | 3AAA    | `03_tier2_3AAA.sql`     |
| School 4 | 4CBV    | `04_tier2_4CBV.sql`     |
| School 5 | 5HKSK    | `05_tier2_5HKSK.sql`     |

## 💰 Pricing Context

- **TIER 1 (Basic)**: ₹6,800/school/year - Essential features only
- **TIER 2 (Standard)**: ₹12,000/school/year - Includes all TIER 1 + LMS + Transport + Advanced HR

Schools on Basic package should NOT run TIER 2 scripts.

## 📊 Table Dependencies

TIER 2 tables reference these TIER 1 tables:
- `sections_{TOKEN}` - For class-wise features (LMS, homework)
- `subjects_{TOKEN}` - For subject-specific content
- `students_{TOKEN}` - For student-related records (transport, assignments)
- `teachers_{TOKEN}` - For teacher-created content and payroll
- `academic_years_{TOKEN}` - For academic year scoping

## 🔍 Verification Queries

### Check TIER 2 Deployment Status
```sql
-- Count TIER 2 tables for a school
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_name LIKE '%_1EMAET'
AND table_name IN (
  'assignments_1EMAET',
  'transport_routes_1EMAET',
  'employees_1EMAET',
  'homework_1EMAET'
);
-- Expected: 4 (sample tables)
```

### Check All Schools' TIER 2 Tables
```sql
SELECT 
  CASE 
    WHEN table_name LIKE '%_1EMAET' THEN 'School 1'
    WHEN table_name LIKE '%_2DDMK' THEN 'School 2'
    WHEN table_name LIKE '%_3AAA' THEN 'School 3'
    WHEN table_name LIKE '%_4CBV' THEN 'School 4'
    WHEN table_name LIKE '%_5HKSK' THEN 'School 5'
  END as school,
  COUNT(*) as tier2_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name LIKE 'assignments_%' OR
  table_name LIKE 'transport_%' OR
  table_name LIKE 'employees_%' OR
  table_name LIKE 'homework_%' OR
  table_name LIKE 'salary_%'
)
GROUP BY school
ORDER BY school;
```

### Sample Data Insertion (School 1)
```sql
-- Add a transport route
INSERT INTO transport_routes_1EMAET (route_name, route_code, start_location, end_location, total_distance_km, fare_amount)
VALUES ('Route 1 - North', 'R001', 'Central Bus Stand', 'School Main Gate', 15.5, 800.00);

-- Add an online class session
INSERT INTO online_class_sessions_1EMAET (session_title, section_id, subject_id, teacher_id, session_date, start_time, end_time, platform, meeting_link)
VALUES (
  'Physics Chapter 3',
  (SELECT id FROM sections_1EMAET WHERE section_name = 'A' LIMIT 1),
  (SELECT id FROM subjects_1EMAET WHERE subject_name = 'Physics' LIMIT 1),
  (SELECT id FROM teachers_1EMAET LIMIT 1),
  CURRENT_DATE + 1,
  '10:00:00',
  '11:00:00',
  'Zoom',
  'https://zoom.us/j/123456789'
);
```

## 🛡️ Security Notes

- Row Level Security (RLS) policies should be added after deployment
- Ensure `index_token` is validated in all user sessions
- Material URLs should use signed URLs with expiration
- Driver license and PF/ESI numbers are sensitive PII
- Salary data requires strict access control

## 📝 Migration Path

If deploying TIER 2 to existing schools:
1. Take database backup
2. Verify TIER 1 is complete
3. Run school-specific TIER 2 file
4. Test with sample data
5. Enable feature flags in application
6. Migrate/import legacy data if needed

## 🐛 Troubleshooting

**Error: "relation does not exist"**
- Cause: TIER 1 not deployed or table name mismatch
- Fix: Deploy TIER 1 first, verify table names

**Error: "foreign key constraint violation"**
- Cause: Referencing non-existent section/subject/teacher
- Fix: Ensure TIER 1 has master data populated

**Performance issues with large tables**
- Solution: Indexes are already created on foreign keys
- For reporting: Create materialized views

## 📚 Additional Resources

- Refer to `01_FeatureList.md` for detailed feature specifications
- See `02_DatabaseSchema.md` for ER diagrams
- Check `03_FeatureToggleSystem.md` for enabling TIER 2 features in app

## ✅ Post-Deployment Checklist

- [ ] All 5 school files executed successfully (or only subscribed schools)
- [ ] 25 new tables created per school
- [ ] Sample queries execute without errors
- [ ] Application feature flags enabled for TIER 2
- [ ] User roles granted appropriate permissions
- [ ] Backup created before deployment
- [ ] Documentation updated with deployment date

---

**Next Steps**: After successful TIER 2 deployment, consider TIER 3 (Advanced features) or TIER 4 (Enterprise features) based on school requirements.
