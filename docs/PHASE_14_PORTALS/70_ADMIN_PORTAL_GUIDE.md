# 70 - Admin Portal Guide

## Overview

The Admin Portal provides comprehensive management and control of the entire EduMunch system. This guide covers all administrative functions for system configuration, user management, and operational oversight.

**Target Audience:** System administrators, super administrators, and organization heads

**Access:** Admins log in at `admin.edumunch.com`

---

## Table of Contents

1. Dashboard & Overview
2. User & Access Management
3. Organization Configuration
4. Academic Setup
5. Operations Management
6. Financial Management
7. Reporting & Analytics
8. System Configuration
9. Security & Compliance
10. Support & Troubleshooting

---

## 1. Dashboard & Overview

### Admin Dashboard

Your dashboard provides complete system overview.

### Key Metrics

**Organization Stats:**
- Total users (students, teachers, staff)
- Active users (logged in last 7 days)
- Total courses and batches
- Total enrollments
- System health status
- Storage usage

**Academic Metrics:**
- Overall student performance (average GPA)
- Course completion rate
- Assignment submission rate
- Attendance average
- Dropout risk count
- Top performers (if enabled)

**Operational Metrics:**
- Active classes today
- Pending approvals (transfers, leaves, etc.)
- Outstanding fees
- Payment collection rate
- Server uptime
- System alerts

**Financial Summary:**
- Total fees collected
- Outstanding amount
- Payment due this month
- Refunds/adjustments
- Monthly revenue trend

### Dashboard Widgets

**Real-time Monitoring:**
- Active user count
- Current system load
- API response time
- Database status
- Backup status
- Security alerts

**Quick Actions:**
- Create new user
- Add branch
- Create course
- View pending approvals
- Generate report
- Send bulk message

---

## 2. User & Access Management

### User Management

**Viewing Users:**
1. Go to **Users** or **User Management**
2. View all system users
3. Filter by:
   - Role (student, teacher, admin)
   - Status (active, inactive)
   - Branch
   - Department
   - Date added
4. Search by name/email

**User Information:**
- Name and email
- User ID/Roll No
- Role and permissions
- Department/Branch
- Last login
- Account status
- Contact information

### Creating Users

**Adding Single User:**
1. Go to **Users → Add User**
2. Select user type (student, teacher, staff)
3. Fill information:
   - Name
   - Email
   - Phone
   - Password (auto-generated or custom)
   - Role
   - Branch/Department
   - Additional fields per user type
4. Set password policy (if custom)
5. Send credentials via email
6. Save user

**Bulk User Upload:**
1. Go to **Users → Import**
2. Download template
3. Fill in user data (Excel)
4. Validate before upload
5. Upload file
6. Review import summary
7. Confirm import
8. Get import report

### User Roles & Permissions

**Available Roles:**
- **Super Admin**: Full system access
- **Admin**: Organization management
- **Faculty/Teacher**: Course management
- **Student**: Learning access
- **Staff**: Support functions
- **Parent**: Limited view access
- **Accountant**: Finance functions

**Assigning Roles:**
1. Go to **Users**
2. Click user name
3. Go to **Roles & Permissions**
4. Select role
5. Review permissions granted
6. Save

**Custom Permissions:**
1. Go to **Roles** settings
2. Create new role (if needed)
3. Assign permissions:
   - View [module]
   - Create [module]
   - Edit [module]
   - Delete [module]
   - Approve [module]
   - Report [module]
4. Save role
5. Assign users to role

### User Status Management

**Deactivating User:**
1. Go to **Users**
2. Click user
3. Go to **Status**
4. Click **Deactivate**
5. Confirm deactivation
6. User can no longer login

**Reactivating User:**
1. Go to **Users → Inactive**
2. Click user
3. Click **Reactivate**
4. User regains access

**Deleting User:**
1. Go to **Users**
2. Click user
3. Go to **Delete**
4. Confirm deletion
5. User data archived (not permanently deleted)

### Password Management

**Resetting User Password:**
1. Go to **Users**
2. Click user
3. Click **Reset Password**
4. New temporary password generated
5. Email sent to user
6. User changes on next login

**Password Policies:**
1. Go to **Settings → Security → Password Policy**
2. Configure:
   - Minimum length
   - Require uppercase
   - Require lowercase
   - Require numbers
   - Require special characters
   - Expiry days
   - History (prevent reuse)
3. Save policy

---

## 3. Organization Configuration

### Organization Details

**Editing Organization Info:**
1. Go to **Organization Settings**
2. Update information:
   - Organization name
   - Short name/code
   - Logo
   - Banner image
   - Description
   - Website
   - Email
   - Phone
   - Address
3. Save changes

**Organization Logo:**
1. Go to **Organization Settings → Logo**
2. Upload logo image
3. Set size and position
4. Preview
5. Save

### Branches Management

**Creating Branch:**
1. Go to **Branches → New Branch**
2. Enter details:
   - Branch name
   - Location/Address
   - Phone
   - Email
   - Contact person
   - Coordinates (for map)
   - Working hours
   - Facilities available
3. Assign staff/admin
4. Create
5. Set as default (optional)

**Managing Branches:**
1. Go to **Branches**
2. View all branches
3. Click branch to edit
4. View courses offered
5. View students
6. Assign resources
7. Set policies

**Branch-Specific Settings:**
- Fee structure
- Course offerings
- Working hours
- Holidays
- Staff allocation
- Facilities

### Feature Flags

**Enabling/Disabling Features:**
1. Go to **Features** or **Feature Flags**
2. See all available features:
   - LMS (learning management)
   - Document management
   - Advanced enrollment
   - Analytics
   - Financial module
   - HR module
   - Communication
   - etc.
3. Toggle per organization:
   - Enabled (all users access)
   - Disabled (no users access)
   - Beta (limited users)
4. Save changes

**Feature Status Propagation:**
- Takes 5-10 minutes to reflect
- Email sent to admins on change
- Users see updated menu

### Custom Fields

**Creating Custom Fields:**
1. Go to **Custom Fields**
2. Choose entity:
   - Student
   - Course
   - User
   - Organization
   - etc.
3. Click **Add Field**
4. Configure:
   - Field name
   - Data type (text, number, date, dropdown, etc.)
   - Is required?
   - Validation rules
   - Help text
   - Options (for dropdown)
5. Save field

**Field Types Available:**
- Text (single/multi-line)
- Number (integer/decimal)
- Date/DateTime
- Boolean (yes/no)
- Dropdown (single/multi-select)
- File upload
- Email
- Phone

---

## 4. Academic Setup

### Course Management

**Creating Course:**
1. Go to **Courses → New Course**
2. Fill details:
   - Course code
   - Course name
   - Description
   - Duration (hours/weeks)
   - Department
   - Level (Foundation/Intermediate/Advanced)
   - Prerequisites
   - Outcomes
3. Add course content outline (optional)
4. Save

**Managing Courses:**
1. Go to **Courses**
2. View all courses
3. Click course to edit
4. See batches offered
5. View enrolled students
6. Assign faculty
7. Manage syllabus

### Batch Management

**Creating Batch:**
1. Go to **Batches → New Batch**
2. Enter details:
   - Course
   - Batch code
   - Start date
   - End date
   - Capacity
   - Faculty
   - Fees
   - Schedule
3. Assign subjects
4. Create

**Batch Operations:**
1. View all batches
2. See enrollment count
3. View subject allocation
4. Manage timetable
5. Process admissions
6. View performance

### Subject Management

**Creating Subject:**
1. Go to **Subjects → New Subject**
2. Enter:
   - Subject code
   - Subject name
   - Description
   - Credits
   - Department
   - Faculty
   - Prerequisites
   - Learning outcomes
3. Save

### Academic Calendar

**Setting Academic Calendar:**
1. Go to **Academic Calendar**
2. Create session:
   - Session name (e.g., 2024-2025)
   - Start date
   - End date
3. Add terms (if applicable):
   - Term 1, 2, 3, etc.
   - Start/end dates per term
   - Exam dates
   - Results date
4. Add holidays:
   - Holiday name
   - Dates
   - Category (national, religious, etc.)
5. Add important dates:
   - Admission opens
   - Enrollment closes
   - Exam schedule
   - Results announcement
   - etc.
6. Save calendar

---

## 5. Operations Management

### Admission Management

**Processing Admissions:**
1. Go to **Admissions**
2. View pending admissions
3. Click admission to review
4. Verify documents
5. Approve or reject:
   - Click **Approve**
   - Student automatically enrolled
   - Credentials sent to student
6. If rejected:
   - Provide reason
   - Refund any fees paid

**Admission Statistics:**
1. Go to **Reports → Admissions**
2. View:
   - Total applications
   - Approved count
   - Rejection count
   - Approval rate
   - Conversion rate
   - Source of admission

### Approval Workflows

**Pending Approvals:**
1. Go to **Approvals** or dashboard widget
2. See all pending:
   - Batch transfers
   - Leave requests
   - Equipment purchases
   - Expenditure approvals
3. Click item to review
4. Approve or reject with reason
5. Notification sent to requester

### Attendance Management

**Attendance Configuration:**
1. Go to **Settings → Attendance**
2. Configure:
   - Minimum attendance percentage (usually 75%)
   - Allow late marking (yes/no)
   - Grace period (minutes late)
   - Eligibility rule enforcement
3. Save

**Attendance Monitoring:**
1. Go to **Attendance**
2. View daily status:
   - Classes scheduled
   - Attendance marked count
   - Pending attendance
3. View by branch/class
4. Export reports

**At-Risk Students:**
1. Go to **Analytics → At-Risk**
2. System identifies students with:
   - Attendance below 75%
   - Multiple absences
   - Pattern of absenteeism
3. Mark for intervention
4. Send notifications

### Leave Management

**Leave Configuration:**
1. Go to **Settings → Leave**
2. Set leave types:
   - Casual leave
   - Medical leave
   - Earned leave
   - Study leave
   - etc.
3. Set quota per user type
4. Set approval workflow
5. Save

**Leave Approvals:**
1. Go to **Approvals → Leave**
2. View pending requests
3. Check reason and documents
4. Approve or reject
5. Notification sent to user

---

## 6. Financial Management

### Fee Structure

**Creating Fee Structure:**
1. Go to **Finance → Fee Structure**
2. Click **New Structure**
3. Configure:
   - Course/Batch
   - Fee components (tuition, lab, sports, etc.)
   - Amount per component
   - GST percentage
   - Total fee
   - Applicable date
4. Save structure

**Fee Management:**
1. Go to **Fees**
2. View fee collection status
3. See outstanding amount
4. View payment trends
5. Process refunds (if applicable)

### Payments

**Payment Processing:**
1. Go to **Payments**
2. View all payments received
3. See payment details:
   - Student
   - Amount
   - Date
   - Method
   - Receipt number
4. Download receipts
5. Export for accounting

**Failed Payments:**
1. Go to **Payments → Failed**
2. View failed transactions
3. Reason for failure
4. Retry payment
5. Contact student

### Financial Reports

**Generating Reports:**
1. Go to **Reports → Financial**
2. Choose report type:
   - Collection report
   - Outstanding fees
   - Revenue summary
   - Payment method analysis
   - Monthly trends
3. Select date range
4. Generate/Download

---

## 7. Reporting & Analytics

### Pre-Built Reports

**Available Reports:**
1. Go to **Reports**
2. Choose category:
   - **Academic**: Performance, grades, attendance
   - **Admission**: Enquiries, applications, admission trends
   - **Financial**: Collections, outstanding, revenue
   - **Operations**: Leave, attendance, timetable
   - **System**: User activity, storage, backups

**Running Report:**
1. Click report name
2. Select parameters:
   - Date range
   - Branch/Department
   - Course/Batch
   - User type
3. Choose format: PDF, Excel, CSV
4. Generate
5. Download

### Custom Reports

**Building Custom Report:**
1. Go to **Reports → Custom**
2. Click **Create Report**
3. Select data source
4. Choose fields to include
5. Add filters
6. Set sorting
7. Configure formatting
8. Save report
9. Schedule if needed (daily/weekly/monthly)

### Analytics Dashboard

**Available Dashboards:**
1. Go to **Analytics**
2. View:
   - Student performance trends
   - Attendance patterns
   - Fee collection rates
   - Course completion
   - Staff utilization
   - Resource usage
3. Filter by parameters
4. Export charts

**Creating Dashboard:**
1. Go to **Analytics → Custom**
2. Add widgets
3. Configure each widget
4. Arrange layout
5. Save dashboard
6. Share with users (optional)

---

## 8. System Configuration

### Email Configuration

**SMTP Settings:**
1. Go to **Settings → Email**
2. Configure:
   - SMTP server
   - Port (usually 587)
   - Username/Password
   - From email address
   - From name
3. Test connection
4. Save

**Email Templates:**
1. Go to **Email Templates**
2. Edit templates:
   - Welcome email
   - Password reset
   - Admission notification
   - Grade notification
   - Payment receipt
   - System alerts
3. Customize subject and body
4. Use variables: {{student_name}}, {{course}}, etc.

### SMS Configuration

**SMS Service Setup:**
1. Go to **Settings → SMS**
2. Choose provider (Twilio, AWS SNS, etc.)
3. Enter API credentials
4. Test SMS sending
5. Save configuration

**SMS Templates:**
1. Go to **SMS Templates**
2. Create templates for:
   - Attendance alerts
   - Grade notification
   - Fee reminder
   - Assignment reminder
3. Keep under 160 characters
4. Use variables

### Backup Configuration

**Automatic Backups:**
1. Go to **Settings → Backup**
2. Configure:
   - Frequency (daily, weekly)
   - Time of backup
   - Retention period (days to keep)
   - Backup location
3. Enable automatic backups
4. Save

**Manual Backups:**
1. Go to **Settings → Backup**
2. Click **Backup Now**
3. Select data to backup:
   - Database
   - Files
   - Configuration
4. Create backup
5. Download (optional)

---

## 9. Security & Compliance

### User Activity Logs

**Viewing Logs:**
1. Go to **Logs → Activity**
2. View all user actions:
   - Login/logout
   - Data access
   - Modifications
   - Downloads
3. Filter by:
   - User
   - Action type
   - Date range
4. Export logs

### Audit Trail

**Accessing Audit Trail:**
1. Go to **Compliance → Audit Trail**
2. View all changes:
   - Who changed
   - What changed
   - When changed
   - Before/after values
3. Search by entity
4. Download trail

### Security Alerts

**Monitoring Alerts:**
1. Go to **Security → Alerts**
2. View recent alerts:
   - Failed login attempts
   - Unauthorized access attempts
   - Suspicious activity
   - Policy violations
3. Status: Active, Acknowledged, Resolved
4. Take action on alerts

**Alert Actions:**
1. Click alert
2. Review details
3. Mark as reviewed
4. Block user (if needed)
5. Change password force (if needed)

### Data Protection

**GDPR/Privacy Compliance:**
1. Go to **Compliance → Data Protection**
2. Configure:
   - Consent settings
   - Data retention policies
   - User deletion workflows
   - Privacy notices
3. Enforce policies

**Data Exports & Deletion:**
1. Go to **User Management**
2. Click user
3. Go to **Data**
4. Choose:
   - **Export**: Get all user data
   - **Delete**: Permanently remove user (with archive)
5. Confirm action

---

## 10. Support & Troubleshooting

### System Maintenance

**Scheduled Maintenance:**
1. Go to **Settings → Maintenance**
2. Schedule maintenance window
3. Send notification to users
4. Put system in maintenance mode
5. Perform maintenance
6. Restore system
7. Notify users

**Performance Monitoring:**
1. Go to **System → Performance**
2. Monitor:
   - Server CPU usage
   - Memory usage
   - Database load
   - API response times
   - Storage usage
3. Set alerts for thresholds
4. Take action if needed

### Troubleshooting Common Issues

**System Slow**
- Check server resources
- Clear cache
- Optimize database
- Check network connectivity
- Review system logs

**Users Can't Login**
- Check authentication service
- Verify user status
- Reset user password
- Check IP restrictions
- Review security alerts

**Data Not Syncing**
- Check database connection
- Restart API service
- Verify network connectivity
- Check error logs
- Run data consistency check

### Support Resources

**Knowledge Base:**
- Help documentation
- Video tutorials
- FAQ
- Troubleshooting guides

**Get Help:**
- Email: admin-support@edumunch.com
- Phone: [Support Number]
- Response time: Priority support

---

## Admin Checklist

**Daily Tasks:**
- [ ] Review dashboards for alerts
- [ ] Approve pending items
- [ ] Check system health
- [ ] Monitor user activity
- [ ] Review error logs

**Weekly Tasks:**
- [ ] Review attendance reports
- [ ] Check fee collections
- [ ] Generate performance reports
- [ ] Review user access
- [ ] Check backup status

**Monthly Tasks:**
- [ ] Full system audit
- [ ] Update documentation
- [ ] Review security settings
- [ ] Performance optimization
- [ ] Plan for next month

**Quarterly Tasks:**
- [ ] System upgrade planning
- [ ] Security assessment
- [ ] User access review
- [ ] Compliance check
- [ ] Strategic planning

---

**Last Updated:** [Date]  
**Portal Version:** [Version]  
**Support Email:** admin-support@edumunch.com

