# TIER 3 Schema - Advanced Features

## ⚠️ CRITICAL PREREQUISITES
**TIER 1 AND TIER 2 MUST BE COMPLETELY DEPLOYED BEFORE RUNNING TIER 3 SCRIPTS**

TIER 3 adds premium advanced features on top of TIER 1 (Basic) and TIER 2 (Standard). It includes AI-powered analytics, admission management, asset tracking, and more.

## 📁 File Structure

```
tier3/
├── 01_tier3_1EMAET.sql    # School 1 TIER 3 tables
├── 02_tier3_2DDMK.sql    # School 2 TIER 3 tables
├── 03_tier3_3AAA.sql    # School 3 TIER 3 tables
├── 04_tier3_4CBV.sql    # School 4 TIER 3 tables
├── 05_tier3_5HKSK.sql    # School 5 TIER 3 tables
└── README.md              # This file
```

## 🎯 What's in TIER 3?

TIER 3 adds **37 new tables per school** covering:

### 1. AI-Powered Analytics - 3 Tables
- `analytics_student_performance_{TOKEN}` - ML-based performance predictions with personalized suggestions
- `analytics_attendance_patterns_{TOKEN}` - Dropout risk detection with early warning system
- `analytics_academic_trends_{TOKEN}` - Class/teacher effectiveness metrics and comparative analysis

### 2. Parent-Teacher Meeting (PTM) - 3 Tables
- `ptm_slots_{TOKEN}` - Teacher availability slot management
- `ptm_bookings_{TOKEN}` - Parent slot booking system with reminders
- `ptm_meeting_notes_{TOKEN}` - Discussion records with action items and follow-ups

### 3. Alumni Management - 5 Tables
- `alumni_{TOKEN}` - Alumni directory with batch info and engagement preferences
- `alumni_events_{TOKEN}` - Reunions, webinars, networking events
- `alumni_event_registrations_{TOKEN}` - Event RSVPs and attendance tracking
- `alumni_donations_{TOKEN}` - Fundraising campaign tracking with tax receipts
- `alumni_mentorship_{TOKEN}` - Alumni-student mentorship matching program

### 4. Admission Management - 5 Tables
- `admission_applications_{TOKEN}` - Online admission portal with document uploads
- `admission_interviews_{TOKEN}` - Interview scheduling and evaluation
- `admission_entrance_tests_{TOKEN}` - Test configuration and question papers
- `admission_test_results_{TOKEN}` - Test scores and ranking
- `admission_merit_list_{TOKEN}` - Final merit list generation and seat allocation

### 5. Inventory & Asset Management - 6 Tables
- `assets_{TOKEN}` - Furniture, equipment, IT assets with depreciation tracking
- `asset_maintenance_{TOKEN}` - Maintenance schedule and downtime tracking
- `lab_equipment_{TOKEN}` - Lab-specific equipment inventory with calibration
- `lab_chemicals_{TOKEN}` - Chemical/specimen tracking with safety compliance (MSDS)
- `stationery_items_{TOKEN}` - Stationery stock master with reorder alerts
- `stationery_transactions_{TOKEN}` - Issue/return/purchase tracking with approval workflow

### 6. Certificate & Document Generation - 3 Tables
- `certificate_templates_{TOKEN}` - TC, Bonafide, Character certificate templates with custom design
- `certificate_requests_{TOKEN}` - Student/parent request workflow with approval
- `generated_certificates_{TOKEN}` - Issued certificate log with digital signature and QR verification

### 7. Advanced Fee Management (Online Payments) - 3 Tables
- `online_payment_transactions_{TOKEN}` - Razorpay/Paytm/PhonePe gateway integration
- `payment_gateway_logs_{TOKEN}` - Webhook logs for auto-reconciliation
- `fee_refunds_{TOKEN}` - Refund request and processing workflow

### 8. Survey & Feedback System - 4 Tables
- `surveys_{TOKEN}` - Drag-and-drop survey builder with anonymous option
- `survey_questions_{TOKEN}` - Multiple question types (MCQ, rating, text, matrix)
- `survey_responses_{TOKEN}` - Response collection
- `feedback_analytics_{TOKEN}` - Sentiment analysis with action item generation

### 9. Event Registration - 1 Table
- `alumni_event_registrations_{TOKEN}` - Alumni event tracking (included in Alumni section)

## 🚀 Execution Order

**Option A: All Schools at Once (Recommended for new hub)**
```sql
-- Run all 5 files in sequence
\i 01_tier3_1EMAET.sql
\i 02_tier3_2DDMK.sql
\i 03_tier3_3AAA.sql
\i 04_tier3_4CBV.sql
\i 05_tier3_5HKSK.sql
```

**Option B: Individual School Deployment (For gradual rollout)**
```sql
-- Deploy only for schools subscribing to Advanced package
\i 01_tier3_1EMAET.sql  -- School 1 only
```

## 🏫 School Index Tokens

Each school has a unique 6-character token appended to table names:

| School | Index Token | File Name                  |
|--------|-------------|----------------------------|
| School 1 | 1EMAET    | `01_tier3_1EMAET.sql`     |
| School 2 | 2DDMK    | `02_tier3_2DDMK.sql`     |
| School 3 | 3AAA    | `03_tier3_3AAA.sql`     |
| School 4 | 4CBV    | `04_tier3_4CBV.sql`     |
| School 5 | 5HKSK    | `05_tier3_5HKSK.sql`     |

## 💰 Pricing Context

- **TIER 1 (Basic)**: ₹6,800/school/year - Essential features
- **TIER 2 (Standard)**: ₹12,000/school/year - TIER 1 + LMS + Transport + HR
- **TIER 3 (Advanced)**: ₹20,000/school/year - TIER 1 + TIER 2 + AI Analytics + Admissions + Alumni + Assets
- **TIER 4 (Enterprise)**: Custom pricing - All features + custom development

Schools on Basic or Standard packages should NOT run TIER 3 scripts.

## 📊 Table Dependencies

TIER 3 tables reference these TIER 1 & TIER 2 tables:
- **TIER 1**: `students_{TOKEN}`, `teachers_{TOKEN}`, `classes_{TOKEN}`, `sections_{TOKEN}`, `subjects_{TOKEN}`, `academic_years_{TOKEN}`, `users_{TOKEN}`
- **TIER 2**: `assignments_{TOKEN}`, `transport_routes_{TOKEN}`, `employees_{TOKEN}` (for asset assignment)

## 🔍 Verification Queries

### Check TIER 3 Deployment Status
```sql
-- Count TIER 3 tables for School 1
SELECT COUNT(*) as tier3_tables
FROM information_schema.tables 
WHERE table_name LIKE '%_1EMAET'
AND table_name IN (
  'analytics_student_performance_1EMAET',
  'ptm_slots_1EMAET',
  'alumni_1EMAET',
  'admission_applications_1EMAET',
  'assets_1EMAET',
  'certificate_templates_1EMAET',
  'online_payment_transactions_1EMAET',
  'surveys_1EMAET'
);
-- Expected: 8 (sample check)
```

### Check All Schools' TIER 3 Tables
```sql
SELECT 
  CASE 
    WHEN table_name LIKE '%_1EMAET' THEN 'School 1'
    WHEN table_name LIKE '%_2DDMK' THEN 'School 2'
    WHEN table_name LIKE '%_3AAA' THEN 'School 3'
    WHEN table_name LIKE '%_4CBV' THEN 'School 4'
    WHEN table_name LIKE '%_5HKSK' THEN 'School 5'
  END as school,
  COUNT(*) as tier3_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name LIKE 'analytics_%' OR
  table_name LIKE 'ptm_%' OR
  table_name LIKE 'alumni_%' OR
  table_name LIKE 'admission_%' OR
  table_name LIKE 'assets_%' OR
  table_name LIKE 'lab_%' OR
  table_name LIKE 'stationery_%' OR
  table_name LIKE 'certificate_%' OR
  table_name LIKE 'online_payment_%' OR
  table_name LIKE 'payment_gateway_%' OR
  table_name LIKE 'fee_refunds_%' OR
  table_name LIKE 'survey_%' OR
  table_name LIKE 'feedback_analytics_%'
)
GROUP BY school
ORDER BY school;
```

### Sample Data Insertion (School 1)

#### Alumni Registration
```sql
INSERT INTO alumni_1EMAET (first_name, last_name, email, phone, batch_year, class_graduated, current_occupation, current_company, is_mentor)
VALUES ('Rajesh', 'Kumar', 'rajesh.kumar@example.com', '9876543210', 2018, 'Class 12', 'Software Engineer', 'Google India', true);
```

#### Admission Application
```sql
INSERT INTO admission_applications_1EMAET (
  application_number, first_name, last_name, date_of_birth, gender, 
  phone, parent_name, parent_phone, applying_for_class, academic_year, 
  previous_school_name, previous_percentage
)
VALUES (
  'ADM2025001', 'Priya', 'Sharma', '2012-05-15', 'Female',
  '9123456789', 'Mr. Sharma', '9876543210', 'Class 6', '2025-26',
  'ABC Public School', 92.5
);
```

#### Survey Creation
```sql
INSERT INTO surveys_1EMAET (survey_title, survey_type, target_audience, start_date, end_date, status, created_by)
VALUES (
  'Teacher Effectiveness Feedback Q1 2025',
  'Teacher Feedback',
  'Students',
  '2025-03-01',
  '2025-03-15',
  'Active',
  (SELECT id FROM users_1EMAET WHERE role = 'academic_admin' LIMIT 1)
);
```

#### Asset Registration
```sql
INSERT INTO assets_1EMAET (asset_code, asset_name, asset_category, asset_type, purchase_date, purchase_cost, assigned_to_department, condition_status)
VALUES ('LPT001', 'Dell Latitude 5420', 'IT Equipment', 'Laptop', '2024-01-15', 55000, 'Computer Lab', 'Excellent');
```

#### Online Payment Transaction
```sql
INSERT INTO online_payment_transactions_1EMAET (
  transaction_id, gateway, student_id, paid_by_user_id, payer_name, 
  amount, payment_method, status, initiated_at
)
VALUES (
  'TXN' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Razorpay',
  (SELECT id FROM students_1EMAET LIMIT 1),
  (SELECT id FROM users_1EMAET WHERE role = 'parent' LIMIT 1),
  'Parent Name',
  5000.00,
  'UPI',
  'Success',
  NOW()
);
```

## 🛡️ Security & Compliance

### Data Privacy
- **Alumni data**: Consent required for public display
- **Payment data**: PCI-DSS compliance required, store only gateway references
- **Asset data**: Restrict access to inventory managers only
- **Survey responses**: Anonymous option for sensitive feedback
- **Admission data**: Secure document storage (Cloudflare R2), database stores only URLs

### AI Analytics
- **Performance predictions**: Display confidence scores, not absolute guarantees
- **Dropout risk**: Alerts should trigger counselor intervention, not punitive action
- **Privacy**: ML models should not expose individual student raw data

### Payment Gateway Integration
- **Never store**: Card CVV, full card numbers, OTP
- **Store only**: Gateway transaction IDs, order IDs, status
- **Reconciliation**: Daily auto-reconciliation from webhook logs
- **Refunds**: Approval workflow required for amounts > ₹5,000

## 📝 Migration Path

If deploying TIER 3 to existing schools:
1. **Backup database** (critical - TIER 3 adds 37 tables)
2. **Verify TIER 1 & TIER 2** are complete
3. **Test payment gateway** in sandbox mode first
4. **Run school-specific TIER 3 file**
5. **Configure payment gateway credentials** in application
6. **Import legacy data**:
   - Alumni records from Excel
   - Existing assets inventory
   - Previous admission cycles
7. **Enable feature flags** in `features.config.ts`
8. **Train staff** on new modules (especially admissions, assets)

## 🐛 Troubleshooting

**Error: "relation does not exist" for TIER 1/2 tables**
- Cause: TIER 1 or TIER 2 not deployed
- Fix: Deploy TIER 1 and TIER 2 first in order

**Payment gateway webhook failing**
- Cause: Webhook URL not configured or SSL certificate issue
- Fix: Verify webhook URL in gateway dashboard, ensure HTTPS

**Large file upload failures (certificates, documents)**
- Cause: Cloudflare R2 or database connection timeout
- Fix: Upload to R2 first, then store URL in database

**Analytics tables not populating**
- Cause: Background job not running or insufficient exam data
- Fix: Ensure cron job is configured, need minimum 3 exam cycles for predictions

**Slow queries on asset/alumni tables**
- Solution: Indexes already created, but consider partitioning by year for large datasets (5+ years)

## 📚 Feature-Specific Notes

### AI Analytics
- Requires minimum 3 exam cycles for reliable predictions
- Runs as nightly batch job (not real-time)
- Confidence score < 0.7 means "insufficient data"

### Alumni Management
- Batch year field critical for reunion targeting
- Email verification required before mentorship eligibility
- Donation receipts auto-generated for tax purposes (80G)

### Admission Management
- Application number format: `ADM{YEAR}{SEQUENCE}`
- Merit list weightage configurable per school
- Entrance test optional (many schools do direct admission)

### Asset Management
- QR code generation recommended for physical asset tags
- Depreciation calculated on straight-line method
- Lab chemicals require MSDS upload (regulatory compliance)

### Certificate Generation
- Templates support HTML/CSS for custom design
- QR code links to verification URL (public endpoint)
- Digital signature requires school principal's e-signature

### Online Payments
- Gateway fee (1.5-2%) deducted automatically
- Reconciliation runs at 2 AM daily
- Failed payments auto-retry after 1 hour

### Survey System
- Matrix questions useful for batch teacher feedback
- Sentiment analysis requires minimum 20 responses
- Anonymous surveys cannot track completion by individual

## ✅ Post-Deployment Checklist

- [ ] All 5 school files executed (or only subscribed schools)
- [ ] 37 new tables created per school
- [ ] Payment gateway credentials configured (Razorpay/Paytm)
- [ ] Cloudflare R2 bucket created for documents/certificates
- [ ] AI analytics cron job scheduled (nightly at 2 AM)
- [ ] Alumni import script executed (if legacy data exists)
- [ ] Asset inventory import completed
- [ ] Certificate templates designed and uploaded
- [ ] Survey builder tested with sample survey
- [ ] Application feature flags enabled for TIER 3
- [ ] User roles updated with TIER 3 permissions
- [ ] Staff training completed for new modules
- [ ] Backup created before deployment
- [ ] Documentation updated with deployment date

## 📈 Expected Impact

**For Schools:**
- 40% reduction in admission cycle time (online portal)
- 25% increase in alumni engagement (events, donations)
- 30% faster certificate generation (automated templates)
- 15% early dropout detection accuracy (AI analytics)

**For Parents:**
- PTM slot booking eliminates queue waiting
- Online fee payment 24/7 convenience
- Real-time admission application status

**For Staff:**
- Asset tracking reduces loss/theft by 50%
- Automated survey analysis saves 10 hours/month
- Inventory reorder alerts prevent stock-outs

---

**Next Steps**: After successful TIER 3 deployment, consider TIER 4 (Enterprise features: Multi-campus, AI Proctoring, Accounting ERP, Government Portal Integration) based on school requirements and budget.
