# EduMunch - Complete Features & Requirements Specification

**Project Type:** Template/Modular Saas Platform for Educational Institutions  
**Target Users:** Indian Tuition Classes, Schools (CBSE/ICSE/State Boards), Coaching Centers  
**Platform Architecture:** White-Labelable, Modular, Feature-Togglable  
**Database:** Supabase (PostgreSQL)  

---

## Project Overview

EduMunch is a one-stop solution platform designed to help Indian tuition classes and schools manage all aspects of their operations. Being a **template-based project**, it is built with modularity in mind - features can be easily enabled/disabled and customized based on client requirements.

### Key Principle
Each feature module is self-contained and can be removed entirely from the project without breaking other functionality. This allows for:
- Quick client onboarding with custom feature sets
- Easy white-labeling and rebranding
- Cost-effective deployment options
- Flexible pricing tiers based on feature selection

---

## Core System Architecture (Non-Removable)

These components form the foundation and should always be present:

### 1. **Authentication & User Management System**
- Multi-role user authentication (Super Admin, Admin, Teacher, Student, Parent, Accountant, etc.)
- Email/Password login
- Session management
- Password reset functionality
- User profile management
- Role-based access control (RBAC)
- Organization hierarchy (Organization → Branches → Users)

### 2. **Organization Setup**
- Organization creation and management
- Multiple branch support
- Branch-specific configurations
- Organization settings (GST Number, Registration Number, Logo, Contact Info)
- Multi-tenant architecture

### 3. **Dashboard**
- Role-specific dashboard views
- Quick stats and KPIs
- Recent activities
- Calendar view
- Notifications system

---

## BATCH 1: Features Extracted (Images 1-10)

### Feature Module: ADMISSIONS MANAGEMENT
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 1.1 Student Admissions Workflow
- **New Admission Form** with sections:
  - General Admission Info
    - Admission ID (auto-generated)
    - Branch selection dropdown
    - Course selection dropdown
    - Session Year (e.g., 25, 26)
    - Admission Date picker
    - Tie-Up School dropdown (if applicable)
  
  - Student & Academic Info
    - Student Name
    - Student Email
    - Student Contact Phone
    - Date of Birth
    - Gender selection (Male, Female, Other)
    - Category selection
    - Address (text area)
    - Current School
    - Current Class
    - Board specification (CBSE, ICSE, State Board)
    - Profile Photo upload
  
  - Parent & Emergency Contact Info
    - Father's Name & Contact
    - Mother's Name & Contact
    - Emergency Contact Name & Phone
    - Relation to Student
  
  - Fee Details Section
    - Course Fee input
    - Total Payable calculation
    - GST% calculation (default 18%)
    - GST Amount auto-calculation
    - Discount Amount input
    - Discount Approved By field
    - Final Amount after discount
    - Payment Status tracking
  
  - Advanced Fee Settings
    - GST Checkbox (Is Total Payable inclusive of GST?)
    - GST% input field (default 18)
    - Discounts section with "Add Discount" button
    - Discount Approved By field
  
  - Fee Installments Module
    - Installment Calculator
    - Add Down Payment option
    - Number of Installments input
    - Installments Start Date
    - Installments End Date
    - Calculate button
    - Individual Installment rows:
      - Name (Installment 1, Installment 2, etc.)
      - Due Date
      - Amount Due
      - Delete option for each installment
    - Add Installment button

#### 1.2 Admissions List & Management
- **Admissions Dashboard/List View**
  - Search bar (search by Name, Email, Admission ID, Branch, Course, Status, School)
  - Filter options:
    - Student Name
    - Student Email
    - Admission ID
    - Branch (All Branches dropdown)
    - Course (All Courses dropdown)
    - Tie-Up School (All Schools dropdown)
    - Status (All Statuses dropdown)
  - Apply & Reset buttons
  - Export to Excel functionality
  
- **Student List Table**
  - Student Profile Photo (Avatar)
  - Student Name
  - Admission ID
  - Branch Name
  - Course Name
  - Status (ACTIVE, INACTIVE)
  - Admission Date
  - School Name
  - Actions (Edit, Delete icons)

#### 1.3 Student Admission Status Types
- ACTIVE
- INACTIVE
- SUSPENDED
- COMPLETED
- PENDING_APPROVAL

---

### Feature Module: COURSES & ACADEMICS
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 2.1 Course Management
- Course name/title (e.g., "JEE Foundation", "CET 1 year")
- Course code/identifier
- Course description
- Duration in months
- Target board (CBSE, ICSE, State Board, etc.)
- Course activation/deactivation status

#### 2.2 Subjects & Topics Management
- Multiple subjects per course
- Subject name (Mathematics, Physics, Biology, Chemistry, English, etc.)
- Subject code
- Subject description
- Linked to specific course

#### 2.3 Topics & Content Management
- Topics nested under subjects
- Topic name and description
- Sequence/ordering of topics
- Content attachment support (for future: video, PDFs, notes)

#### 2.4 Batches Management
- Batch creation for specific course + branch combination
- Batch name (e.g., "JEE Advance Batch 2026 (Palava Branch)")
- Start Date and End Date
- Batch capacity (maximum students)
- Batch Status (ACTIVE, COMPLETED, PLANNING)
- Teacher assignment
- Subject-batch linking

#### 2.5 Enrollments
- Student enrollment in specific batches
- Multiple enrollments per student (can take multiple courses)
- Enrollment status (ACTIVE, DROPPED, COMPLETED)
- Enrollment date tracking

---

### Feature Module: ASSIGNMENTS & SUBMISSIONS
**Status:** Core Feature | **Removable:** Yes | **Priority:** High

#### 3.1 Assignment Templates
- Create reusable assignment templates by subject
- Assignment title and description
- Assignment type:
  - Theory (essay type, long answer)
  - MCQ (multiple choice questions)
  - Practical
  - Mixed
- File attachment support (PDF, DOC, Images - Max 15MB)
- Template library for quick assignment creation
- Creator tracking (which teacher created)

#### 3.2 Assignment Deployment
- Assign templates to specific batches
- Set Due Date for assignment
- View assignment status per batch
- Bulk assignment to multiple batches

#### 3.3 Student Assignment Submissions
- Student submission tracker
- View assignment details
  - Title
  - Type
  - Due Date
  - Submission Status (NOT_SUBMITTED, SUBMITTED, LATE, GRADED)
  - Marks Obtained / Total Marks
  
#### 3.4 Assignment Grading
- View student submissions
- MCQ auto-grading with answer key
- Manual grading for theory assignments
- Mark entry and validation
- Grading status tracking
- Submission comments/feedback

#### 3.5 Assignment Submissions List
- Filter by Batch
- Search by student name
- Sort options (Newest, Oldest, etc.)
- Submission status column
- Marks column (marks obtained / total marks)
- View Submission button
- Submission details modal:
  - Display submitted answers
  - Show marks obtained
  - For MCQ: Show correct/incorrect indicators
  - For Theory: Show grading interface

---

### Feature Module: ENROLLMENT & STUDENT MANAGEMENT
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 4.1 Student Registration & Profile
- Student profile creation (core student data)
- Student photo/avatar
- Contact information
- Emergency contacts
- Current school and class information
- Board affiliation
- Category information

#### 4.2 Student Enrollment Process
- Add student to batch (create enrollment)
- Enrollment date tracking
- Enrollment status management
- Multiple concurrent enrollments (student can be in multiple batches)
- Enrollment history

#### 4.3 Enrollment List & Management
- View all enrollments
- Filter by batch, status
- Search by student name
- Update enrollment status
- View associated fees and payments

---

## BATCH 2: Features Extracted (Images 11-20)

### Feature Module: ENHANCED ATTENDANCE & LECTURE MANAGEMENT
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 5.1 Weekly Attendance & Lecture Management - Schedule View
- **Interface Overview:**
  - Three-tab system: Schedule | Reports | Student Report
  
- **Schedule Tab Features:**
  - Branch selector dropdown
  - Batch filter (optional) - shows "All Batches in Branch"
  - Week date picker (Select a day in week)
  - Navigation: Previous/Next week buttons
  
  - **Daily Lecture Cards** displayed by date (e.g., Monday, December 8, 2025)
    - Each lecture card shows:
      - Batch code (e.g., 27KJ1)
      - Subject name (e.g., Physics, Chemistry, Math, Biology)
      - Teacher initials/code (e.g., MNP, APCH, ASM, ASB, VSM)
      - Time slot (e.g., 02:00 PM - 04:00 PM, 04:30 PM - 06:30 PM)
      - Classroom/Location (if assigned)
      - Two action buttons:
        - **Attendance** button (to mark attendance for that class)
        - **Remarks** button (to add teaching remarks/notes)

#### 5.2 Syllabus Status & Tracking
- **Syllabus Status Section:**
  - Select batch to view syllabus progress
  - Shows "Choose a batch to view syllabus progress"
  - Displays syllabus completion percentage per batch
  - Progress indicator for curriculum coverage

#### 5.3 Teacher Activity Log
- **Teacher Activity Tracking:**
  - Select Teacher dropdown (filters by teacher)
  - Displays "View recent remarks" link
  - Activity log entries showing:
    - Subject covered (e.g., "Calculus", "Continuity", "Quadratic Equations")
    - Subject Code/Batch Code (e.g., "Math • 261JMA1", "Math • 27KJ1")
    - Sub-topic covered (e.g., "LPP Details: started test the one with no real sub topic")
    - Date and Time (e.g., "12/10/2025, 1:30:00 PM")
    - Status badge:
      - **IN_PROGRESS** (yellow/amber badge)
      - **COMPLETED** (checkmark, green badge)
  - Scrollable list for viewing multiple entries

#### 5.4 Student Attendance Report
- **Student Report Tab:**
  - Student admission filter: "Select Student Admission" dropdown
  - Date range selector: Month & Year dropdowns
  - "Get Report" button
  - **Attendance Records Table:**
    - Columns: DATE, SUBJECT, BATCH, TEACHER, TIME, STATUS
    - Status types: NOT_MARKED, LATE
    - Shows 6 records found indicator
    - Example data with different date combinations

#### 5.5 Attendance Status Tracking
- **Status Types:**
  - NOT_MARKED (default/pending)
  - LATE (late attendance)
  - PRESENT (implied)
  - ABSENT (implied)
  - LEAVE (as per Batch 1)

---

### Feature Module: WEEKLY SCHEDULE MANAGEMENT
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 6.1 Branch Availability Schedule
- **Interface:**
  - Two-tab system: Branch Availability | Teacher Schedule
  
- **Branch Availability Tab:**
  - Branch selector dropdown (e.g., "Kalyan Branch")
  - Advanced filters:
    - Search by title/teacher (text input)
    - Event Type dropdown (All, specific types)
    - Teacher filter (branch view) dropdown
    - From date and To date pickers (UTC timezone)
    - Sort options (Start Date, etc.)
  
  - **Action Buttons:**
    - Clear Filters button
    - Reload Week button
    - Download Table button (export functionality)
  
  - **Weekly Calendar Display:**
    - Shows date range (e.g., "Dec 8, 2025 - Dec 14, 2025")
    - Navigation: Previous/Next week arrows
    - Day-wise cards (Monday, Tuesday, etc.) with dates
    - Each day shows:
      - No events scheduled message (if empty)
      - "Add Slot" button for each day
    - Results counter: "Showing 0 results" or actual count

#### 6.2 Teacher Schedule
- **Teacher Schedule Tab:**
  - Teacher selector dropdown (e.g., "RCM")
  - Similar filters and controls as Branch Availability
  - **Calendar View:**
    - Week date range display
    - Day-wise schedule display
    - Shows scheduled classes with:
      - Subject name (e.g., "Math - 27KJ1")
      - Time range in UTC (e.g., "11:00 - 13:00 (UTC)")
      - Vertical line indicator in calendar

#### 6.3 Weekly Schedule Creation/Management
- **Schedule Management Features:**
  - Add Slot functionality per day
  - Batch/Subject assignment capability
  - Teacher assignment
  - Time slot management (UTC timezone)
  - Event type classification
  - Schedule persistence and editing

---

### Feature Module: BATCH MANAGEMENT ENHANCEMENTS
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 7.1 Batch Details Management
- **Three-tab System:** Batch Details | Manage Subjects | Manage Faculty

- **Batch Details Tab:**
  - **Create Batch Button** (primary action)
  - **Refresh Button** (reload data)
  - **Export Button** (export batch list)
  
  - **Filter Options:**
    - Search bar (search by batch name, code, etc.)
    - Branch filter dropdown (All Branches)
    - Course filter dropdown (All Courses)
    - "Only Active" checkbox
    - Date range filters: From and To date pickers
  
  - **Batch List Table:**
    - Columns: Batch Name, Branch, Course, Start Date, End Date, Actions
    - Batch Name display (both display name and code)
    - Branch name
    - Course name
    - Start and end date display
    - Edit and Delete action icons
    - Example batches: "10TPF", "26KJMA1", "26KJMC1", "26KN1 NEET", "26MJMA1", "26MJMA2", "26MJMC1"

#### 7.2 Subject Management for Batches
- **Manage Subjects Tab:**
  - Select Batch dropdown (e.g., "26TJMA1")
  - **Two-Column Interface:**
    - **Left Column - Assigned Subjects:**
      - Shows subjects already assigned to batch
      - Displays subject count: "Assigned (4)"
      - Select all / Clear buttons
      - Checkboxes for each subject
      - Example assigned: Math (Math), Chemistry (Chem), Biology (BIO), Physics (PHY)
    
    - **Right Column - Available Subjects:**
      - Shows unassigned subjects
      - Displays count: "Available (2)"
      - Search functionality
      - All / Clear buttons
      - Checkboxes for each subject
      - Example available: Random Subject Name (RSN), GK (GK)
    
    - **Transfer Arrows:**
      - Left arrow (purple) - move to available
      - Right arrow (red/pink) - move to assigned

#### 7.3 Faculty Management for Batches
- **Manage Faculty Tab:**
  - Select Batch dropdown (e.g., "26TJMA1")
  - **Two-Column Interface (Similar to Subjects):**
    - **Left Column - Assigned Teachers:**
      - Displays count: "Assigned (13)"
      - Select all / Clear buttons
      - Teacher codes/names (checkboxes):
        - ASB, KAP, UKCH, VMM, VSM, ZAP, JYCH, MKP, MNCH, etc.
    
    - **Right Column - Available Teachers:**
      - Displays count: "Available (0)"
      - Shows "No available teachers" message
      - Search functionality
      - All / Clear buttons
    
    - **Transfer Arrows:**
      - Left arrow (purple) - unassign teacher
      - Right arrow (red) - assign teacher

---

### Feature Module: ORGANIZATION MANAGEMENT
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 8.1 Branch Management
- **Branch Management Interface:**
  - **Add Branch Button** (primary action)
  - **Branch List Table:**
    - Columns: Branch Name, Code, Address, Actions
    - Branch name and full details
    - Branch code (3-letter abbreviation, e.g., KAL, MAN, PAL, THN)
    - Full address (e.g., "Near railway station", "Samyangi Rama Nagara", "Palava station road")
    - Edit and Delete action icons
  
  - **Example Branches:**
    - Kalyan Branch - Code: KAL
    - Manpada Branch - Code: MAN
    - Palava Branch - Code: PAL
    - Thane HO Branch - Code: THN

#### 8.2 Course Management with Branch-Specific Pricing
- **Course Management Interface:**
  - **Add Course Button** (primary action)
  - **Course List Table:**
    - Columns: Course Name, Code, Branch Pricing, Actions
    - Course name and code
    - **Branch Pricing Display:**
      - Shows fees for each branch
      - Format: "Branch Name: ₹XX,XX,000.00"
      - Multiple branches listed per course
      - Example:
        - Kalyan Branch: ₹1,28,000.00
        - Manpada Branch: ₹1,00,000.00
        - Palava Branch: ₹1,85,000.00
        - Thane HO Branch: ₹1,30,000.00
    - Edit and Delete action icons
  
  - **Example Courses:**
    - 11th (Code: 11)
    - CET 1 year (Code: CET)
    - CET 2 years (Code: C2)
    - JEE Foundation (Code: JEE)
    - NEET Foundation (Code: NEET)
  
  - **Create Course Modal:**
    - Course Name input field
    - Course Code input field
    - **Branch Pricing (Fees per branch):**
      - Multiple branch selectors
      - Each row: Branch dropdown + Fees input field + Remove (X) button
      - "+ Add Branch Pricing" button to add more branches
    - Create Course button (submit)
    - Example branch: "Kalyan Branch" with fees field
    - Can dynamically add multiple branch pricing rows

---

### Feature Module: TEACHER & STAFF MANAGEMENT
**Status:** PARTIAL | **Removable:** Yes | **Priority:** Medium

#### 9.1 Teacher Codes & Identification
- Teacher codes observed: MNP, APCH, ASM, ASB, VSM, RCM, ZAP, JYCH, UKCH, VMM, MNCH, KAP, etc.
- Teacher codes appear to be 3-4 letter abbreviations
- Used throughout system for quick identification in schedules and assignments

#### 9.2 Teacher Activity Tracking
- Covered in detail in "Teacher Activity Log" (Section 5.3)
- Tracks topics covered, date, time, status
- Remarks/notes capability

---

## Feature Module: COURSE PRICING
**Status:** CORE | **Removable:** No | **Priority:** High

### Currently Implemented in Course Management:
- Branch-specific pricing per course
- Multiple branches with different fees for same course
- Price display in Indian Rupee format (₹)
- Price ranges: ₹1,00,000 to ₹4,00,000+
- Pricing flexibility across different locations

### Integration Points:
- Used during admission (Course Fee - Batch 1)
- Used during fee calculation and installment creation
- Displayed in Course Management UI

---

---

## BATCH 3: Features Extracted (Images 21-30)

### Feature Module: DASHBOARD ANALYTICS & KPIs
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 10.1 Dashboard Overview (Super Admin)
- **Welcome Message:** "Welcome back, [User Name]!"
- **Viewing Stats For:** Dropdown selector (e.g., "Global (All Branches)" or specific branch)

#### 10.2 Key Performance Indicators (KPI Cards)
**Top Row:**
1. **Active Students** 
   - Count: 6
   - Icon: Student profile icon

2. **New Admissions (30d)**
   - Count: 3
   - Icon: Users/admissions icon
   - Time frame: Last 30 days

3. **Total Batches**
   - Count: 28
   - Icon: Batch/class icon

4. **Total Admissions**
   - Count: 13
   - Icon: Admission icon

**Second Row:**
5. **Sessions This Week**
   - Count: 103
   - Icon: Calendar/schedule icon

6. **Present Today**
   - Count: 0
   - Icon: Checkmark icon
   - Status: Green background

7. **Absent Today**
   - Count: 0
   - Icon: X mark icon
   - Status: Red/pink background

8. **Teachers Available Today**
   - Count: 0
   - Icon: Teacher/people icon
   - Status: Green background

**Third Row:**
9. **Installments Due (Week)**
   - Count: 1
   - Icon: Rupee/currency icon
   - Status: Yellow/amber background

10. **Staff on Leave**
    - Count: 10
    - Icon: Leave icon
    - Status: Orange background

11. **Payslips (Last Month)**
    - Count: 3
    - Icon: Document/payslip icon
    - Status: Light blue background

12. **Open Doubts**
    - Count: 8
    - Icon: Question mark icon
    - Status: Light orange background

**Fourth Row:**
13. **Open Support Tickets**
    - Count: 3
    - Icon: Support/ticket icon
    - Status: Orange background

14. **Pending PTM Requests**
    - Count: 3
    - Icon: Calendar/request icon
    - Status: Yellow background

15. **PTMs Today**
    - Count: 0
    - Icon: Calendar/meeting icon
    - Status: Green background

16. **Pending Transfers**
    - Count: 0
    - Icon: Transfer/arrow icon
    - Status: Light blue background

**Fifth Row:**
17. **Open Grievances**
    - Count: 3
    - Icon: Shield/grievance icon
    - Status: Red/pink background

#### 10.3 Recent Announcements Widget
- **Section Title:** "Recent Announcements"
- **View All Link:** Link to full announcements
- **Announcement List:**
  - Announcement title
  - Date
  - Type/source (e.g., "System Trigger")
  - Example announcements:
    - "Batch Transfer" - December 10, 2025 - System Trigger
    - "Test" - December 10, 2025
- **Max 3-5 recent items shown**

---

### Feature Module: DOUBT MANAGEMENT (Q&A SYSTEM)
**Status:** Core Feature | **Removable:** Yes | **Priority:** High

#### 11.1 Assigned Doubts List
- **Module Navigation:** Listed in Communication section sidebar
- **Page Title:** "Assigned Doubts"
- **Refresh Button:** To reload doubt list

- **Filter Options:**
  - **Search:** Text input to search by questions or students
  - **Subject Filter:** Dropdown (All Subjects)
  - **Status Filter:** Dropdown (Open)

- **Sort Options:**
  - Dropdown for sorting (Newest, Oldest, etc.)

- **Action Buttons:**
  - Clear Filters button

- **Results Counter:**
  - Shows "Showing 8 of 17 total doubts"

#### 11.2 Doubt List Display
**Columns:**
- Question/Title
- Student Name who asked
- Subject and Topic area
- Status (Open, Closed, Resolved)

**Example Doubts:**
1. "i didn't understand the initial part"
   - From: Kumar Kalani
   - Subject: Math
   - Topic: Trigonometry

2. "speed velocity difference"
   - From: Student test 1
   - Subject: Physics
   - Topic: Electromagnetism

3. "we cannot understand your language"
   - From: Kumar Kalani
   - Subject: Chemistry
   - Topic: Physical Chemistry

4. "Cctv"
   - From: Priya Singh
   - Subject: Math
   - Topic: Calculus

5. "Test question"
   - From: Ram Sir
   - Subject: Biology
   - Topic: Animal Kingdom

6. "Doubt created from content section"
   - From: Kumar Kalani
   - Subject: Biology
   - Topic: Animal Kingdom

#### 11.3 Doubt Conversation Interface
- **Modal/Detail View:** "Doubt Conversation"
- **Doubt Title:** Shows the question
- **Meta Info:**
  - Subject and Topic
  - From: [Student Name]
  - To: [Teacher Code] (e.g., "ZAP")

- **Conversation Thread:**
  - Student message with timestamp
  - Teacher response with timestamp
  - Support for nested replies
  - Message ordering (chronological)

- **Media Support:**
  - Embedded video/image display capability
  - File preview support

- **Reply Interface:**
  - Text input field "Type message..."
  - Attachment button (paperclip icon)
  - Media button (mic icon)
  - Send button
  - Checkmark button (mark as resolved)

---

### Feature Module: EMPLOYEE MANAGEMENT (EXPANDED)
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 12.1 Employee/Teacher Directory
- **Page Title:** "Employee Management"
- **Onboard Employee Button:** Primary action

- **Filter Options:**
  - Search by name (text input)
  - Department filter dropdown (All Departments)
  - Designation filter dropdown (All Designations)

#### 12.2 Employee List Table
**Columns:**
- Employee Avatar/Code (colored circle with initials)
- Employee Name
- Employee Code/ID (e.g., "Code: APCH")
- Employee ID (numeric)
- Role (e.g., "teacher")
- Designation (e.g., "Chemistry Faculty", "Biology Faculty", "Maths Faculty", "Physics Faculty")
- Actions (Edit, Delete)

**Example Employees:**
1. Akshay Pandey - Code: APCH - ID: 41236 - Chemistry Faculty
2. Aniket Singh - Code: ASB - ID: 52684 - Biology Faculty
3. Anup Singh - Code: ASM - ID: 3 - Maths Faculty
4. Jayesh Yadav - Code: JYCH - ID: 324653 - Chemistry Faculty
5. Kumar Ahire - Code: KAP - ID: 74268 - Physics Faculty
6. Mukesh Kumar - Code: MKP - ID: 45677 - Physics Faculty
7. Manish Nihar - Code: MNCH - ID: 8699 - Chemistry Faculty
8. Mayank Nayak - Code: MN - Physics Faculty

---

### Feature Module: ENHANCED ENROLLMENT MANAGEMENT
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 13.1 Enrollment Management Interface
- **Page Title:** "Enrollment Management"
- **Primary Action Buttons:**
  - "Enroll Students" button
  - "Transfer Selected" button

- **Batch Selector:**
  - "Select a Batch to Manage" dropdown
  - Example: "26TJMA1 (Thane HO Branch)"

#### 13.2 Enrolled Students Display
- **Section Header:** "Enrolled Students in [Batch Code]"
- **Count:** "2 students enrolled"

- **Enrolled Students Table:**
  - **Columns:** Student Name, Email, Phone, Actions
  - **Rows:**
    - Kumar Kalani - kumar@vraz.com - 9191919191 - Delete action
    - Student 2 - st12@gmail.com - 9898988888 - Delete action

- **Actions Available:**
  - Delete student from batch (remove enrollment)
  - Checkbox selection for bulk operations

---

### Feature Module: FEEDBACK & PERFORMANCE REVIEW SYSTEM
**Status:** Core Feature | **Removable:** Yes | **Priority:** Medium

#### 14.1 Feedback Management Overview
- **Three-Tab Interface:** Templates | Assign Forms | Results & Analysis

#### 14.2 Templates Tab
- **Section Title:** "Feedback Form Templates"
- **Actions:**
  - "Manage Qualities" link
  - "Add Template" button (primary)

- **Feedback Template List:**
  - Template Name
  - Form Type/Tag (e.g., "FACULTY_REVIEW")
  - Description
  - Number of Qualities associated
  - Edit and Delete action buttons

**Example Templates:**
1. "Quarterly review" - Type: FACULTY_REVIEW - Description: "Faculty review" - 2 Qualities
2. "Dec Teacher review" - Type: FACULTY_REVIEW - Description: "Test" - 2 Qualities
3. "teacher review" - Type: FACULTY_REVIEW - Description: "Test" - 0 Qualities
4. "Yearly Teacher Review" - Type: FACULTY_REVIEW - Description: "Grading" - 0 Qualities
5. "Monthly Teacher Review" - Type: FACULTY_REVIEW - Description: "Performance review" - 0 Qualities
6. "DSA" - Type: GENERAL - Description: "XYZ" - 3 Questions

#### 14.3 Edit Template Modal
- **Fields:**
  - Title: Text input (e.g., "Quarterly review")
  - Description: Text area (e.g., "Faculty review")
  - Form Type: Dropdown (e.g., "FACULTY_REVIEW")
  
  - **Select Qualities:** Checkbox list
    - Multiple quality options available
    - Example qualities:
      - Efficiency (checked)
      - Quality (checked)
      - Engaging (unchecked)
      - Speed (unchecked)
    - Note: "Selected qualities will be snapshotted into the template so historic data remains consistent"

- **Action Button:** "Update Template" or "Create Template"

#### 14.4 Assign Forms Tab
- **Section Title:** "Assign Feedback Forms to Batch"
- **Batch Selector:** Dropdown (e.g., "JEE Advance Batch 2026")
- **Action Button:** "Assign Form" (primary)

- **Assigned Forms Display:**
  - Form Name with Type tag
  - Active status (Yes/No)
  - Start and End dates
  - Submission count
  - Edit action button
  - Example:
    - "Dec Teacher review" - FACULTY_REVIEW - Active: Yes - Start: 12/6/2025 | End: 12/8/2025 - 0 Submissions
    - "DSA" - GENERAL - Active: Yes - Start: 12/5/2025 | End: 12/8/2025 - 1 Submissions

#### 14.5 Results & Analysis Tab
- **Section Title:** "Feedback Results & Analysis"
- **Form Selector:** Dropdown to select which feedback form to view results
  - Example: "Dec Teacher review (FACULTY_REVIEW)"

- **Faculty Review Results:**
  - Teacher Code/Name
  - Review Count (e.g., "1 reviews")
  - Average Rating (e.g., "Avg Rating: 5")
  
  - **Quality Averages:**
    - Display individual quality ratings
    - Example: "Speed: 4, Quality: 3, Engaging: 5"
  
  - **Overall Rating:** Numeric with comment
    - Example: "Rating: 5" | "Comment: very good"
    - Full breakdown: "Quality Ratings: Speed(4), Quality(3), Engaging(5)"

**Example Results Display:**
- ASB (1 reviews) | Avg Rating: 5
  - Quality Averages: Speed 4, Quality 3, Engaging 5
  - Rating: 5 | Comment: very good

- ASM (1 reviews) | Avg Rating: 4
  - Quality Averages: Speed 3, Quality 4, Engaging 4
  - Rating: 4 | Comment: okay okay

- JYCH (1 reviews) | Avg Rating: 2
  - Quality Averages: Speed 1, Quality 3, Engaging 2
  - Rating: 2 | Comment: done

---

### Feature Module: GRIEVANCE MANAGEMENT
**Status:** Core Feature | **Removable:** Yes | **Priority:** Medium

#### 15.1 Grievance Management Interface
- **Page Title:** "Grievance Management"
- **Search & Filter Section:**
  - Search input: "Search Parent or Subject"
  - Status filter dropdown (All Statuses)
  - Clear Filters button

#### 15.2 Grievance List Table
**Columns:**
- Parent (with avatar and contact info)
- Subject (issue topic)
- Date Submitted
- Status
- Actions (View Details link)

**Status Types:**
- Pending (yellow)
- In Progress (blue)
- Closed (gray)
- Resolved (green)

**Example Grievances:**
1. Soham Kalani - Notes - 12/10/2025, 12:38:26 AM - Pending
2. Soham Kalani - Attention - 11/25/2025, 2:29:23 PM - In Progress
3. Soham Kalani - Sitting arrangement in class - 11/25/2025, 2:03:20 PM - Closed
4. Soham Kalani - Issue with the notes - 11/17/2025, 1:28:31 AM - Resolved
5. Soham Kalani - Payment issue - 11/5/2025, 1:30:28 PM - Closed
6. Soham Kalani - xyz - 11/2/2025, 7:31:00 PM - Pending
7. Soham Kalani - Bus Service Issue - 10/30/2025, 2:43:42 AM - Resolved

#### 15.3 Grievance Details Modal
- **Header:** "Grievance Details: #[Number]" (e.g., "#8")

- **Parent Information Section:**
  - Parent Name
  - Contact Phone
  - Children: List of associated students
  - Branch(es): Associated branch info

- **Grievance Details Section:**
  - Subject: Issue title
  - Description: Detailed complaint
  - Attachments: Support for file uploads with preview
  - Submitted on: Timestamp

- **Update Status Section:**
  - Status selector dropdown (e.g., "Pending")
  - Save Changes button

---

### Feature Module: INVENTORY & CASH MANAGEMENT
**Status:** Core Feature | **Removable:** Yes | **Priority:** Medium

#### 16.1 Inventory & Cash Management Tabs
**Five-Tab System:**
1. Branch Inventory
2. Transfers
3. Inventory Ledger
4. Petty Cash Ledger
5. Master Item List

#### 16.2 Branch Inventory Tab
- **Branch Selector:** Dropdown (e.g., "Kalyan Branch")
- **Action Button:** "Adjust Stock"

- **Inventory List Table:**
  - **Columns:** Item Name, Type, Quantity
  - **Item Types:**
    - ASSET (e.g., "Advertising Papers" - Quantity: 10)
  
- **Adjust Stock Modal:**
  - Item to Adjust dropdown
  - Quantity Change input (note: "use negative for removal")
  - Reason for Adjustment dropdown or text
  - Cancel and "Apply Adjustment" buttons

#### 16.3 Transfers Tab
- **Action Button:** "Initiate Transfer"

- **Transfers Table:**
  - **Columns:** From Branch, To Branch, Item, Quantity, Status, Initiated At, Actions
  - **Status Types:**
    - CANCELLED (red)
    - COMPLETED (green)
  
  **Example Transfers:**
  1. Thane HO Branch → Kalyan Branch - Cash - 2000 - CANCELLED - 11/15/2025, 2:35:26 PM
  2. Thane HO Branch → Manpada Branch - Cash - 100000 - COMPLETED - 10/17/2025, 4:10:59 PM
  3. Thane HO Branch → Kalyan Branch - Advertising Papers - 20 - COMPLETED - 10/17/2025, 4:09:56 PM

#### 16.4 Inventory Ledger Tab
- **Branch Selector:** Dropdown
- **Inventory Log Table:**
  - **Columns:** Date, Item, Quantity Change, Reason, Recorded By
  - **Example Entries:**
    - 11/15/2025, 2:07:41 PM - Advertising Papers - -10 - Distributed - Thane Branch manager

#### 16.5 Petty Cash Ledger Tab
- **Branch Selector:** Dropdown
- **Current Balance Display:** Shows balance in Rupees (e.g., "₹1,00,000.00")
- **Action Button:** "Add Entry"

- **Cash Transaction Table:**
  - **Columns:** Date, Description, Type, Recorded By, Amount, Actions
  - **Transaction Types:**
    - TRANSFER_IN (cash received)
    - Other transaction types

  **Example Entries:**
  1. 10/17/2025, 4:11:05 PM - From Branch ID 1 - TRANSFER_IN - Super Admin - ₹1,00,000.00

#### 16.6 Master Item List Tab
- **Action Button:** "Add New Item"

- **Master Items Table:**
  - **Columns:** Name, Description, Type, Actions
  - **Item Types:**
    - ASSET (e.g., "Advertising Papers" - Description: "For distribution")
    - CASH (e.g., "Cash" - Description: "For Spending")
    - CONSUMABLE (e.g., "Maths Books" - Description: "For student distribution")
  
  **Example Items:**
  1. Advertising Papers - For distribution - ASSET
  2. Cash - For Spending - CASH
  3. Maths Books - For student distribution - CONSUMABLE

---

## Feature Module: SUPPORT TICKETING & COMMUNICATION
**Status:** PARTIAL | **Removable:** Yes | **Priority:** Medium

### Currently Visible Features:
- Open Support Tickets (dashboard widget showing count: 3)
- Support Tickets menu item in Communication section
- Ticket management capability

### To Be Detailed:
- Ticket creation workflow
- Ticket assignment
- Ticket resolution tracking
- Priority and category management

---

---

## BATCH 4: Features Extracted (Images 31-40)

### Feature Module: LEAVE MANAGEMENT (EXPANDED)
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 17.1 Leave Applications Interface
- **Page Title:** "Leave Applications"
- **Filter & Search Options:**
  - Search by name or employee ID
  - Status filter dropdown (All, Pending, Approved, Rejected, etc.)
  - Leave Type filter dropdown (All types)
  - Date range filters: From and To date pickers

- **Sort Options:**
  - Sort by dropdown (e.g., "Start Date (new → old)")

- **Action Buttons:**
  - Clear filters button

#### 17.2 Leave Applications List
- **Result Count:** Shows "Showing 10 of 10" records

- **Leave Application Cards/List:**
  - Employee Name (e.g., "Ramswaroop Chaudhary")
  - Department (e.g., "Maths Faculty")
  - Leave Type (e.g., "CASUAL (4 days)", "CASUAL (2 days)", "CASUAL (3 days)")
  - Date Range (e.g., "12/30/2025 to 1/2/2026", "11/30/2025 to 12/1/2025", "11/28/2025 to 11/30/2025")
  - Reason for Leave (e.g., "Going out", "Not available", "Trip")
  - Deduction Information (e.g., "Deducted as: UNPAID", "Deducted as: CASUAL")
  
  - **Status Badges:**
    - PENDING (yellow badge with action buttons: Approve ✓, Reject ✗)
    - APPROVED (orange badge)
    - Status shown in top right of card

#### 17.3 Leave Application Status Types
- PENDING (awaiting approval)
- APPROVED (confirmed leave)
- REJECTED/DECLINED
- CANCELLED

---

### Feature Module: LECTURE TIMING TEMPLATES
**Status:** Core Feature | **Removable:** No | **Priority:** Medium

#### 18.1 Lecture Timing Configuration
- **Page Title:** "Lecture Timing Templates"
- **Description:** "Configure standard lecture slots for each branch."

- **Branch Selector:** Dropdown (e.g., "Kalyan Branch")

#### 18.2 Day-Wise Time Slot Configuration
- **Day Sections:** Collapsible sections for each day of week
  - MONDAY - Shows "4 slot(s)" indicator
  - TUESDAY - Shows "4 slot(s)" indicator
  - WEDNESDAY - Shows "4 slot(s)" indicator
  - THURSDAY - Shows "4 slot(s)" indicator
  - (and other days)

- **Each Day Slot Entry:**
  - Start Time field (time picker) - e.g., "08:30 AM", "11:00 AM", "01:30 PM", "04:00 PM"
  - End Time field (time picker) - e.g., "10:30 AM", "01:00 PM", "03:30 PM", "06:00 PM"
  - Delete button (trash icon) for removing slot
  - **Add Slot button** for each day to add additional time slots

#### 18.3 Time Slot Examples
- Monday: 08:30 AM - 10:30 AM, 11:00 AM - 01:00 PM, 01:30 PM - 03:30 PM, 04:00 PM - 06:00 PM
- Tuesday: Similar pattern with 4 slots
- Wednesday: Similar pattern with 4 slots
- Thursday: Similar pattern with 4 slots

---

### Feature Module: NOTIFICATION SYSTEM (EXPANDED)
**Status:** Core Feature | **Removable:** Yes | **Priority:** Medium

#### 19.1 Send Notifications Interface
- **Page Title:** "Send Notifications"
- **Two-Tab System:** Send New | History

#### 19.2 Compose Notification Tab
- **Form Fields:**
  - Title input (required)
  - Message text area (required)
  - Link (Optional) - URL input field with placeholder "https://your-website.com/link"

- **Target Audience Section:**
  - Role(s) dropdown - "All Roles" default
  - Branch(es) dropdown - "All Branches" default
  - Course(s) dropdown - "All Courses" default
  - Batch(es) dropdown - "All Batches" default
  - Tie-up School(s) dropdown - "All Tie-Up Schools"

- **Send/Submit Button**

#### 19.3 Notification History Tab
- **Filter & Search:**
  - Search input (search title or message)
  - Tie-up School(s) filter dropdown
  - Branch(es) filter dropdown
  - Role(s) filter dropdown
  - Course(s) filter dropdown
  - Batch(es) filter dropdown
  - Refresh button

- **Results Counter:** "Showing 50 / 50 (max 50)"

- **Notification History List:**
  - Notification Title (e.g., "Batch Transfer", "Test", "Parent Replied", "New Doubt Message")
  - Description/Content
  - Date & Time (e.g., "12/10/2025, 12:56:48 PM")
  - Sent By (e.g., "by Super Admin", "by Soham Kalani", "by Kumar Kalani")
  - Recipient Information:
    - "To: Invalid Target" (with recipient count e.g., "0")
    - "To: All Users" (with recipient count e.g., "34")
    - "To: Invalid Target" (with recipient count e.g., "2")

  **Example Notifications:**
  1. "Batch Transfer" - "Student test 1 has been transferred from CET Palava 25 to JEE Advance Batch 2026." - 12/10/2025, 12:56:48 PM
  2. "Batch Transfer" - "Student test 1 has been transferred from JEE Advance Batch 2026 to CET Palava 25." - 12/10/2025, 12:56:33 PM
  3. "Test" - "Hello" - 12/10/2025, 3:40:58 AM - To: All Users (34)
  4. "Parent Replied" - "New message on ticket #8: 'hello...'" - 12/10/2025, 2:49:46 AM
  5. "New Doubt Message" - "New message from Kumar Kalani regarding: 'i didn't understand the initial part'" - 12/10/2025, 2:48:37 AM

---

### Feature Module: PAYMENT MANAGEMENT (EXPANDED)
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 20.1 Payment Management Overview
- **Page Title:** "Payment Management"
- **Three-Tab System:** Search Student | Filter Transactions | Outstanding Report

#### 20.2 Search Student Tab
- **Student Admission Selector:** Dropdown (e.g., "Student 2 (JEE Foundation)")

- **Student Summary Card:**
  - Student Name: "Student 2"
  - Admission Form #: "VT25001"
  - Course: "JEE Foundation"
  - Total Due: "₹4,00,000.00" (large display)
  - Total Paid/Balance: 
    - "₹0.00" (green - paid portion)
    - "₹4,00,000.00" (red - remaining balance)
  - Installment Count: "12 installment(s)"

- **Installment Details:**
  - Shows each installment with:
    - Installment name (e.g., "Installment 1", "Installment 2")
    - Due Date (e.g., "2/1/2025", "3/3/2025")
    - Amount Due (e.g., "₹33,636.36")
    - Status badge (PENDING)
    - Remaining amount (e.g., "₹33,636.36 remaining")

- **Transaction Section:**
  - "Transactions" header
  - "Record Payment" button (primary)
  - "Send Reminder" button (secondary)
  - Transaction list (empty: "No transactions recorded")

#### 20.3 Filter Transactions Tab
- **Filter Options:**
  - Start Date picker (dd-mm-yyyy format)
  - End Date picker
  - Branch dropdown (All Branches)
  - Batch dropdown (All Batches)
  - Payment Method dropdown (All Methods)
  - Status dropdown (All Statuses)
  - "Apply Filters" button (primary)

- **Summary Cards:**
  - Total Transactions: Count display (e.g., "4")
  - Total Realized: Amount in green (e.g., "₹30,428.57")
  - Total Pending: Amount in orange (e.g., "₹14,000.00")

- **Transaction List Table:**
  - **Columns:** Student, Branch, Amount, Date, Method, Status, Realized By
  - **Payment Methods:** CHEQUE, CASH, CARD, UPI, etc.
  - **Status Types:** PENDING (yellow), REALIZED (green)
  
  **Example Transactions:**
  1. Kumar Kalani (Form: 125478) - Thane HO Branch - ₹14,000.00 - 12/9/2025 - CHEQUE - PENDING - N/A
  2. Student test 1 (Form: VP26001) - Palava Branch - ₹10,000.00 - 12/7/2025 - CHEQUE - REALIZED - Super Admin
  3. Student test 1 (Form: VP26001) - Palava Branch - ₹10,000.00 - 12/6/2025 - CASH - REALIZED - Super Admin
  4. Student test 1 (Form: VP26001) - Palava Branch - ₹10,428.57 - 12/6/2025 - CARD - REALIZED - Super Admin

#### 20.4 Outstanding Report Tab
- **Filter Options:**
  - Due Start Date picker (e.g., "30-11-2025")
  - Due End Date picker (e.g., "27-12-2025")
  - Branch dropdown (All Branches)
  - Batch dropdown (All Batches)
  - "Apply Filters" button

- **Summary Cards:**
  - Total Outstanding Installments: Count (e.g., "9")
  - Total Outstanding Amount: Amount in red (e.g., "₹5,72,875.00")

- **Outstanding Installments Table:**
  - **Columns:** Student, Branch, Due Date, Total Due, Paid, Balance, Status
  - **Status Types:** PENDING, PARTIALLY PAID
  
  **Example Outstanding:**
  1. Student 2 - Thane HO Branch - 12/8/2025 - ₹30,000.00 - ₹0.00 - ₹30,000.00 - PENDING
  2. Kabir Singh (Ph: 8875012345) - Kalyan Branch - 12/16/2025 - ₹1,00,000.00 - ₹0.00 - ₹1,00,000.00 - PENDING
  3. Student test 1 (Ph: 7485857485) - Palava Branch - 12/17/2025 - ₹11,428.57 - ₹10,428.57 - ₹1,000.00 - PARTIALLY PAID
  4. Kumar Kalani (Ph: 9191919191) - Thane HO Branch - 12/22/2025 - ₹34,000.00 - ₹14,000.00 - ₹20,000.00 - PARTIALLY PAID

---

### Feature Module: PAYSLIP MANAGEMENT
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 21.1 Generate Payslips Tab
- **Month/Year Selector:**
  - Month dropdown (e.g., "December")
  - Year field (e.g., "2025")

- **Employee Selection:**
  - "Select Employees to Include" section
  - "All Eligible Employees" checkbox
  - Individual employee checkboxes with:
    - Employee Name
    - Employee ID (e.g., "41236", "52684", "3")
    - Employee Code (e.g., "APCH", "ASB", "ASM")

- **Generate Payslips Button** (primary action)

#### 21.2 View Generated Payslips Tab
- **Filter & Search:**
  - Month dropdown (e.g., "December")
  - Year field (e.g., "2025")
  - "Search" button
  - "Reset" button

- **Generated Payslips List:**
  - Result count: "Found 5 payslip(s)"
  - Period display: "Period: December 2025"

- **Payslip List Table:**
  - **Columns:** Employee, Net Salary, Payment Date, Actions
  - Employee Name (e.g., "Ramswaroop Chaudhary", "Umesh Khandelwal", "Anup Singh")
  - Net Salary amount (e.g., "₹50,066.66", "₹50,069.66", "₹46,574.20")
  - Payment Date (e.g., "11/18/2025", "12/6/2025")
  - Actions: View button (eye icon), Delete button (trash icon)

---

### Feature Module: PTM (PARENT-TEACHER MEETING) REQUESTS
**Status:** Core Feature | **Removable:** Yes | **Priority:** Medium

#### 22.1 PTM Requests Interface
- **Page Title:** "PTM Requests"
- **Create PTM Button** (primary action)

- **Multi-Tab Status View:**
  - Pending (count: 3)
  - Awaiting Parent (count: 1)
  - Approved (count: 5)
  - Declined (count: 14)

#### 22.2 PTM Request Listing
- **Filter & Search:**
  - Search input: "Search parent, teacher or reason..."
  - Refresh button

- **Result Count:** "Showing 3 of 29 total"

- **PTM Request Cards/Items:**
  - Parent Name (e.g., "Soham Kalani")
  - Teacher Name & Code (e.g., "Teacher: VSM", "Teacher: RCM", "Teacher: MNP")
  - Reason for Meeting (e.g., "performance", "For student performance", "Test to keep as pending")
  - Preferred Times (datetime) - e.g., "Dec 15, 2025, 12:00 PM", "Dec 14, 2025, 12:00 PM", "Nov 27, 2025, 12:00 PM"
  - Action Buttons:
    - Approve button (blue checkmark)
    - Decline button (red X)

#### 22.3 Create PTM Modal
- **Modal Title:** "Create New PTM Request"

- **Form Fields:**
  - Select Student dropdown ("-- Select Student --")
  - Select Parent dropdown ("-- Select Parent --")
  - Select Teacher dropdown ("-- Select Teacher --")
  - Scheduled Time date/time picker (dd-mm-yyyy format with time)
  - Reason for Meeting (Optional) - text area

- **Action Button:** "Create & Notify" (primary)

---

### Feature Module: RESULTS & GRADING (EXPANDED)
**Status:** Core Feature | **Removable:** Yes | **Priority:** Medium

#### 23.1 Results Module Overview
- **Two-Tab System:** Board Exams | Competitive Exams
- **Three Sub-Tabs:** Templates | Tests | Marks Entry (for both exam types)

#### 23.2 Board Exams - Templates Tab
- **Add Template Button**

- **Test Templates List:**
  - Template Name (e.g., "College exam template", "WINTER 2025")
  - Type Tag (EXTERNAL, INTERNAL) - e.g., "EXTERNAL", "INTERNAL"
  - Subjects (e.g., "Maths, Science, English", "Biology (Animal Kingdom)")
  - Edit and Delete action buttons

#### 23.3 Board Exams - Tests Tab
- **Add Test Button**

- **Tests List:**
  - Test Name (e.g., "Mid sem 2025 nov", "Dsa New", "Mid term College exam", "DSA")
  - Associated Template (e.g., "WINTER 2025 (INTERNAL)", "College exam template (EXTERNAL)")
  - Test Date (e.g., "11/25/2025", "11/13/2025", "11/12/2025")

#### 23.4 Board Exams - Marks Entry Tab
- **Filter/Selection Options:**
  - Branch dropdown (e.g., "Palava Branch")
  - Batch dropdown (e.g., "JEE Advance Batch 2026")
  - Test dropdown (e.g., "DSA (11/12/2025)")

- **Marks Entry Grid:**
  - Student Name column
  - Subject column with total marks indicator (e.g., "Biology (Animal Kingdom) / 50")
  - Marks input field (spinnable numeric input)
  - "Save All" button (primary)

  **Example:**
  - Student test 1 | Biology (Animal Kingdom) / 50 | [marks input field]

#### 23.5 Competitive Exams - Exam Templates
- **Competitive Exam Types:**
  - JEE Mains
    - Type: COMPETITIVE_EXAM
    - Max Marks: 700
    - Edit and Delete buttons
  
  - NEET
    - Type: COMPETITIVE_EXAM
    - Max Marks: 200
    - Edit and Delete buttons

---

### Feature Module: SIDEBAR NAVIGATION (REFERENCE)
**Status:** N/A | **Removable:** No | **Priority:** Critical

#### 24.1 Complete Navigation Sidebar Structure
- **Main Menu Items:**
  - Dashboard
  - Admissions (collapsible)
    - Admissions
    - Enrollments
    - Payments
  
  - Academics (collapsible)
    - Courses
    - Subjects
    - Topics & Content
    - Batches
    - Timetables
    - Attendance
    - Assignments
    - Results
    - Lecture Templates
  
  - Administration (collapsible)
    - Users
    - Roles & Permissions
    - Branches
    - Inventory
    - Tie-Up Schools
  
  - Human Resources (collapsible)
    - Employees
    - Salary Structures
    - Payslips
    - Leave Management
    - Working Hours
    - Availability Slots
  
  - Communication (collapsible - shown expanded)
    - Doubts
    - Notifications
    - Feedback
    - Grievances
    - PTM Requests
    - Support Tickets
  
  - Profile
  
  - Super Admin User Profile (bottom)

---

---

## BATCH 5: Features Extracted (Images 41-50)

### Feature Module: ROLES & PERMISSIONS MANAGEMENT (EXPANDED)
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 25.1 Roles & Permissions Interface
- **Page Title:** "Roles & Permissions"
- **Add Role Button** (primary action)

#### 25.2 Roles List
**System Roles:**
1. **Super Admin**
   - Icon: Lock icon (restricted)
   - Actions: View, Delete
   - Status: System role (cannot edit name)

2. **Branch Admin**
   - Actions: Edit, Delete

3. **Front Desk**
   - Actions: Edit, Delete

4. **Teacher**
   - Icon: Lock icon (restricted)
   - Actions: View, Delete

5. **Student**
   - Icon: Lock icon (restricted)
   - Actions: View, Delete

6. **Parent**
   - Icon: Lock icon (restricted)
   - Actions: View, Delete

7. **Employee**
   - Icon: Lock icon (restricted)
   - Actions: View, Delete

**Custom Roles:**
8. **Branch Management**
   - Actions: Edit, Delete

9. **Branch Inventory Management**
   - Actions: Edit, Delete

10. **Support Role**
    - Actions: Edit, Delete

#### 25.3 Create Role Modal
- **Role Name Input:** Text field for new role name

- **Modules Section:**
  - **Two-Column Layout:**
    - **Left Column - All Modules:**
      - Checkbox list of available modules
      - Examples: Payments, Courses, LMS Content, Subjects (checked), Topics (checked), Batches, Batch Faculty
      - Scrollable list with vertical scroll
    
    - **Right Column - Active Modules:**
      - Shows "No modules granted" by default
      - Displays selected modules after selection
    
    - **Transfer Arrows:**
      - Right arrow (blue) - move modules to active
      - Left arrow (red/pink) - remove from active

- **Permission Note:** "Active modules will grant read/write/delete permissions by default."

- **Create Role Button** (primary action)

---

### Feature Module: SALARY STRUCTURES (EXPANDED)
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 26.1 Salary Structures Dashboard
- **Add Structure Button** (primary action)

- **Summary Cards:**
  - **Total Base Salary:** ₹75,000.00
  - **Total Earnings:** ₹11,500.00 (green)
  - **Total Deductions:** ₹12,125.80 (red)
  - **Total Net Salary:** ₹74,374.20

#### 26.2 Salary Structures Table
**Columns:** Title, Base Salary, Total Earnings, Total Deductions, Net Salary, Actions

**Example Structures:**
1. **Basic Faculty Structure**
   - Base Salary: ₹50,000.00
   - Total Earnings: ₹8,500.00 (green)
   - Total Deductions: ₹9,925.80 (red)
   - Net Salary: ₹48,574.20
   - Actions: Edit, Delete

2. **Priya Maam**
   - Base Salary: ₹25,000.00
   - Total Earnings: ₹3,000.00 (green)
   - Total Deductions: ₹2,200.00 (red)
   - Net Salary: ₹25,800.00
   - Actions: Edit, Delete

3. **Totals Row**
   - Base Salary: ₹75,000.00
   - Total Earnings: ₹11,500.00 (green)
   - Total Deductions: ₹12,125.80 (red)
   - Net Salary: ₹74,374.20

#### 26.3 Create Salary Structure Modal
- **Structure Title Input**
- **Base Salary Input**
- **Description Text Area**

- **Salary Calculation Summary (Read-only):**
  - Base: ₹0.00
  - Earnings: ₹0.00 (green)
  - Deductions: ₹0.00 (red)
  - Net: ₹0.00

- **Import Unpaid Leaves Section:**
  - Description: "Fetch assigned employees and import deductions."
  - Month dropdown (e.g., "Dec")
  - Year field (e.g., "2025")
  - Fetch button

- **Earnings Section:**
  - "+ Add Earning" button to add earning components

- **Deductions Section:**
  - "+ Add Deduction" button to add deduction components

- **Action Buttons:** Cancel, Create Structure

---

### Feature Module: SUBJECT MANAGEMENT (EXPANDED)
**Status:** Core Feature | **Removable:** No | **Priority:** Medium

#### 27.1 Subject Management Interface
- **Page Title:** "Subject Management"
- **Add Subject Button** (primary action)

#### 27.2 Subjects List Table
**Columns:** Subject Name, Code, Type, Actions

**Example Subjects:**
1. **Biology**
   - Code: BIO
   - Type: Theory (blue badge)
   - Actions: Edit, Delete

2. **Chemistry**
   - Code: Chem
   - Type: Theory (blue badge)
   - Actions: Edit, Delete

3. **GK (General Knowledge)**
   - Code: GK
   - Type: General knowledge (gray badge)
   - Actions: Edit, Delete

4. **Math**
   - Code: Math
   - Type: Theory (blue badge)
   - Actions: Edit, Delete

5. **Phy (Physics)**
   - Code: PHY
   - Type: Theory (blue badge)
   - Actions: Edit, Delete

6. **Random Subject Name**
   - Code: RSN
   - Type: Test purpose (gray badge)
   - Actions: Edit, Delete

#### 27.3 Edit Subject Modal
- **Subject Name Input** (e.g., "Biology")
- **Subject Code Input** (e.g., "BIO")
- **Type Input** (e.g., "Theory" with dropdown or text field)

- **Update Subject Button** (primary action)

---

### Feature Module: SUPPORT TICKETS (FULL IMPLEMENTATION)
**Status:** Core Feature | **Removable:** Yes | **Priority:** Medium

#### 28.1 Support Tickets Interface
- **Page Title:** "Support Tickets"

- **Multi-Tab Status View:**
  - Open (count: 3) - Active/unresolved tickets
  - In Progress (count: 4) - Being worked on
  - Resolved (count: 1) - Completed tickets

#### 28.2 Ticket Filtering & Search
- **Filter Buttons:**
  - All (shows all tickets)
  - Me (assigned to current user)
  - Unassigned (no assignment yet)
  - Clear filters button

- **Search Input:** "Search..." placeholder
- **Sort Dropdown:** (Title, Date, Priority, etc.)

#### 28.3 Tickets List
**Open Tickets Example:**
1. **"Attendance: Child is absent"**
   - Ticket Icon: Red X (urgent indicator)
   - From: Soham Kalani
   - Assignment Status: Unassigned
   - Action buttons: Edit, Assign, Resolve

2. **"Other: Child not studying"**
   - Ticket Icon: Red X (urgent indicator)
   - From: Soham Kalani
   - Assignment Status: Unassigned
   - Action buttons: Edit, Assign, Resolve

3. **"Payment: issue"**
   - Ticket Icon: Red X (urgent indicator)
   - From: Soham Kalani
   - Assignment Status: Unassigned
   - Action buttons: Edit, Assign, Resolve

#### 28.4 Ticket Properties
- Ticket Title
- Description/Issue Details
- Reporter/From (Parent or Student name)
- Ticket Type/Category (Attendance, Other, Payment, etc.)
- Priority Level
- Assignment Status (Unassigned, Assigned to [User])
- Created Date/Time
- Status (Open, In Progress, Resolved)

---

### Feature Module: TIMETABLE MANAGEMENT (FULL IMPLEMENTATION)
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 29.1 Weekly Timetable View
- **Page Title:** "Weekly Timetable"
- **Bulk Schedule Button** (primary action)

- **Week Selection:**
  - Select Week date picker (e.g., "08-12-2025")
  - Clear Week button
  - Notify Week button

#### 29.2 Timetable Grid Display
- **Grid Structure:** Time-based rows × Batch/Branch columns
  - **Row Headers (Time Slots):**
    - 08:00-10:00
    - 08:30-10:30
    - 10:00-12:00
    - 10:15-12:15
    - 11:00-13:00
    - 13:00-15:00
    - 13:30-15:30
    - 16:00-18:00
    - 08:00-10:00 (second occurrence)

  - **Column Headers (Batches/Branches):**
    - Kalyan Branch - 27KJ1
    - Kalyan Branch - 27KJ2
    - Kalyan Branch - 27KN1
    - Manpada Branch - 27MJ1
    - Manpada Branch - 27MJ2
    - Palava Branch - JEE Advance Batch 2026
    - Thane HO Branch

#### 29.3 Class/Lecture Cells
**Cell Content:**
- Subject Name (e.g., "Chemistry", "Math", "Physics", "Biology")
- Teacher Code (e.g., "UKCH", "ASM", "ZAP", "ASB", "VSM", "MNP")
- Edit action button (pencil icon)
- Delete action button (trash icon)

**Special Display:**
- **MERGED indicator:** Shows when multiple same-subject classes are merged (shown in blue)
  - Example: "Chemistry MNCH ⟲ MERGED"

**Example Schedule Entries:**
- Kalyan Branch - 27KJ1 | 08:30-10:30: Phy (MNP)
- Kalyan Branch - 27KN1 | 08:00-10:00: Chemistry (UKCH)
- Kalyan Branch - 27KJ2 | 10:00-12:00: Math (ASM)
- Manpada Branch - 27MJ1 | 10:15-12:15: Math (VMM)
- Manpada Branch - 27MJ1 | 11:00-13:00: Chemistry (APCH), Math (ASM)
- Manpada Branch - 27MJ2 | 13:30-15:30: Biology (ASB), Math (VSM)
- Manpada Branch - 27MJ2 | 13:30-15:30: Chemistry (MNCH) ⟲ MERGED
- Palava Branch - JEE Advance | 10:00-12:00: GK (ZAP)

#### 29.4 Bulk Schedule Modal
- **Modal Title:** "Bulk Schedule Timetable for a Week"

- **Week Selection:**
  - "Select any date in the desired week" instruction
  - Date picker (dd-mm-yyyy format)

- **Copy from Previous Week Section:**
  - "Select Source Week" label
  - Date picker for source week (dd-mm-yyyy format)
  - "Copy" button (blue)

- **Bulk Scheduling Grid:**
  - **Structure:** Multiple batches × Multiple time slots
  - Each batch header showing branch and batch code
  - Time slot rows (08:30 AM - 10:30 AM, 11:00 AM - 01:00 PM, etc.)
  - Subject dropdown fields for each cell (showing "Load..." during loading)
  - Delete buttons for each slot
  - Scrollable both horizontally and vertically

- **Action Buttons:**
  - Validate Timetable button
  - Save Timetable button (primary, blue)

**Batch Headers in Modal:**
- Kalyan Branch - 26KJMA1
- Kalyan Branch - 26KJMC1
- Kalyan Branch - 26KN1 NEET
- Kalyan Branch - 27KJ1
- Kalyan Branch - 27KJ2
- Kalyan Branch - 27KN1
- Manpada Branch - 26MJMA1
- Manpada Branch - 26MJMA2

---

### Feature Module: SUBJECT & ACADEMICS MANAGEMENT (REFERENCE)
**Status:** N/A | **Removable:** No | **Priority:** Critical

#### 30.1 Academics Module Structure
**Sub-Modules visible in sidebar:**
- Courses
- Subjects (expanded with management features)
- Topics & Content
- Batches
- Timetables (with full implementation)
- Attendance
- Assignments
- Results
- Lecture Templates

---

## BATCH 6: Features Extracted (Images 51-60) - FINAL BATCH

### Feature Module: TOPIC & CONTENT MANAGEMENT (FULL IMPLEMENTATION)
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 31.1 Topic & Content Management Interface
- **Page Title:** "Topic & Content Management"
- **Add Root Topic Button** (primary action)

- **Subject Selector:** Dropdown (e.g., "Biology")

#### 31.2 Hierarchical Topic Structure
**Three-Level Hierarchy Supported:**

**Level 1: Root Topics** (e.g., "1. Animal Kingdom", "2. Biotechnology")
- Expandable/collapsible with arrow indicator
- Edit action (pencil icon)
- Delete action (trash icon)
- Info icon for details

**Level 2: Sub-Topics** (e.g., "1.1 Classification of non-chordates", "1.2 Neural Control and Coordination")
- Numeric numbering system (1.1, 1.2, etc.)
- Edit action (pencil icon)
- Delete action (trash icon)
- Folder icon (indicating topic container)

**Level 3: Content Items** (e.g., "1.1.1 Introduction to chordates family", "1.2.1 Neurodivergence")
- Numeric numbering (1.1.1, 1.2.1, etc.)
- Content type indicators:
  - **Red flag icon ⚠️** = Assessment/Question content
  - **Document icon** = Lecture notes/document
  - **Link icon 🔗** = External resource link
- Edit action (pencil icon)
- Delete action (trash icon)

**Example Content Tree (Biology):**
```
▼ 1. Animal Kingdom
  ▼ 1.1 Classification of non-chordates
    ⚠️ 1.1.1 Introduction to chordates family
  ▼ 1.2 Neural Control and Coordination
    ⚠️ 1.2.1 Neurodivergence
    🔗 1.2.2 Coordination Stimuli
    📄 1.2.3 Diagram of Nerves in Human body
    🔗 1.2.4 Official NCERT Syllabus for Neuro Science
    📄 1.2.5 Darwinian evolutionary theory
  ▼ 1.3 Mammalia, Aves, Reptilia
    ⚠️ 1.3.1 Family Mammalia
▼ 2. Biotechnology
  ▼ 2.1 genetic engineering
    ⚠️ 2.1.1 Lecture
  ▼ 2.2 DNA technology
    (more items...)
```

#### 31.3 Edit Content Modal
- **Modal Title:** "Edit Content"

- **Form Fields:**
  - **Content Title:** Text input (e.g., "Diagram of Nerves in Human body")
  - **Content Type:** Dropdown (e.g., "PDF", Video, Document, Link, Assessment, etc.)
  - **PDF File Section:**
    - "Choose PDF" button
    - Selected file display (e.g., "PDF Selected: kvxeqsgye...")
    - Clear button
    - Preview button (blue)
    - File size notice: "Max size: 5MB. Only PDF files allowed."
  
  - **Content URL (read-only for PDFs):** 
    - Displays URL: "https://res.cloudinary.com/dxh1yarvh/image/upload/v1763214960/erp-l..."

- **Update Content Button** (primary action)

#### 31.4 Content Management Features
- Bulk edit/delete capabilities
- Content type validation
- File size restrictions (5MB max for PDFs)
- URL generation for remote content
- Support for multiple content types per topic
- Drag-and-drop reordering (implied by structure)

---

### Feature Module: USER MANAGEMENT (EXPANDED)
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 32.1 User Management Interface
- **Page Title:** "User Management"
- **Add User Button** (primary action)

- **Filter & Search:**
  - Filter by Role dropdown (e.g., "All Roles")
  - Apply button (blue)
  - Reset button

#### 32.2 Users List Table
**Columns:** User (Avatar+Name), Email, Phone Number, Role, Actions

**Example Users:**
1. **APCH** (Yellow avatar)
   - Full Name: APCH
   - Email: apch@vraz.com
   - Phone: 9658741256
   - Role: Teacher
   - Actions: Edit, Deactivate, Delete

2. **ASB** (Yellow avatar)
   - Full Name: ASB
   - Email: asb@vraz.com
   - Phone: 8596325769
   - Role: Teacher

3. **ASM** (Purple avatar)
   - Full Name: ASM
   - Email: anup@vraz.com
   - Phone: 8596745220
   - Role: Teacher

4. **Aarav Sharma** (Green avatar)
   - Full Name: Aarav Sharma
   - Email: aarav.sharma25@email.com
   - Phone: 9820012345
   - Role: Student

5. **Anand Gupta** (Purple avatar)
   - Full Name: Anand Gupta
   - Email: (not shown)
   - Phone: 9685658986
   - Role: Parent

6. **Anand Singh** (Yellow avatar)
   - Full Name: Anand Singh
   - Email: (not shown)
   - Phone: 9685658987
   - Role: Parent

7. **Ananya Iyer** (Teal avatar)
   - Full Name: Ananya Iyer
   - Email: ananyal@email.com
   - Phone: 9819812345
   - Role: Student

#### 32.3 Create User Modal
- **Modal Title:** "Create User"

- **User Avatar Section:**
  - Large circular avatar placeholder (shows "NA" initials)
  - "Upload Photo" link below avatar

- **Form Fields (Left Column):**
  - **Full Name*** (required) - Text input
  - **Phone Number*** (required) - Phone input

- **Form Fields (Right Column):**
  - **Email*** (required) - Email input (e.g., "super@admin.com")
  - **Password*** (required) - Password input (masked with dots: "••••••••")

- **Additional Fields:**
  - **Role*** (required) - Dropdown with options:
    - Select Role (default/placeholder)
    - super_admin
    - branch_admin
    - front_desk
    - teacher
    - employee
    - Branch Management
    - Branch Inventory Management
    - Support Role

  - **Branch (for staff)** - Dropdown (e.g., "Select Branch")
  - **Joining Date** - Date picker (dd-mm-yyyy format)

- **Action Button:** "Create User" (blue, primary)

#### 32.4 User Management Features
- Role-based user creation
- Branch assignment for staff
- Email and phone validation
- Joining date tracking
- User deactivation (soft delete)
- Photo upload capability
- Edit and delete actions

---

### Feature Module: WORKING HOURS MANAGEMENT
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 33.1 Manage Teacher Working Hours Interface
- **Page Title:** "Manage Teacher Working Hours"

- **Teacher Selector:** Dropdown (e.g., "RCM")

- **View Options:**
  - View dropdown (e.g., "All Days")
  - Sort dropdown (e.g., "Day Order (Sun → Sat)")

- **Action Buttons:**
  - Reload button
  - Set Default Hours button
  - Clear All (Week Off) button

- **Status Indicator:** "Some days configured"

#### 33.2 Day-Wise Working Hours Configuration
**Format:** Day of Week | Start Time | End Time | Week Off Checkbox

**Example Configuration:**

1. **Sunday**
   - Start Time: --:-- (greyed out)
   - End Time: --:-- (greyed out)
   - Week Off: ✓ Checked
   - Status: Full day off

2. **Monday**
   - Start Time: 09:00 AM (time picker)
   - End Time: 05:00 PM (time picker)
   - Week Off: ☐ Unchecked
   - Work hours: 8 hours

3. **Tuesday**
   - Start Time: 09:00 AM
   - End Time: 05:00 PM
   - Week Off: ☐ Unchecked

4. **Wednesday**
   - Start Time: 09:00 AM
   - End Time: 05:00 PM
   - Week Off: ☐ Unchecked

5. **Thursday**
   - Start Time: 09:00 AM
   - End Time: 05:00 PM
   - Week Off: ☐ Unchecked

6. **Friday**
   - Start Time: 09:00 AM
   - End Time: 05:00 PM
   - Week Off: ☐ Unchecked

#### 33.3 Working Hours Features
- Time picker for start and end times
- Week off toggle per day
- Default hours template application
- Bulk clear all hours (week off for all)
- Reload to revert changes
- Time format: 12-hour (AM/PM)
- Automatic calculation of working hours

---

### Summary: Complete Feature Set

**Total Modules Documented:** 60+ core and auxiliary features

**Module Breakdown:**
- **Core Management:** 12 modules (Admissions, Enrollments, Courses, Subjects, Topics, Batches, Timetables, Attendance)
- **Academic:** 8 modules (Assignments, Results, Lecture Templates, Content)
- **Financial:** 4 modules (Fees, Payments, Payslips, Salary Structures)
- **HR & Admin:** 12 modules (Users, Roles, Employees, Leave, Working Hours, Availability)
- **Communication:** 8 modules (Notifications, Feedback, Doubts, Grievances, PTM, Support Tickets)
- **Analytics & Reporting:** 4 modules (Dashboard, Results Analysis, Reports)
- **Operations:** 4 modules (Inventory, Branches, Tie-Ups, Settings)
- **Utilities:** 8 modules (Schedules, Templates, Grading, Quality Feedback)

---

## Final Recommendations

### For White-Labeling Implementation:

**Phase 1 (Essential - Always Include):**
- Authentication & User Management
- Organization/Branch Setup
- Dashboard
- Admissions & Enrollments
- Courses & Timetables
- Attendance

**Phase 2 (Academic - Recommended Add-on):**
- Assignments & Grading
- Results Management
- Topics & Content
- Lecture Templates

**Phase 3 (Financial - For Revenue Tracking):**
- Fees & Payment Management
- Payslips
- Financial Reports

**Phase 4 (HR - For Larger Institutions):**
- Employee Management
- Salary Structures
- Leave Management
- Working Hours

**Phase 5 (Advanced - Optional Features):**
- Feedback System
- Grievance Management
- Support Ticketing
- PTM Requests
- Inventory Management

### Database Implementation Strategy:

1. **Feature Flag Table:** `feature_flags` (module_name, organization_id, enabled)
2. **Role-Based Access:** Row-level security in Supabase
3. **Multi-Tenancy:** organization_id in all key tables
4. **Soft Deletes:** `deleted_at` timestamp for audit trail
5. **Audit Logging:** Separate audit table for compliance

### Technology Stack Recommendation:

- **Frontend:** Next.js with TypeScript
- **Backend:** Node.js/Express or Supabase Edge Functions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage (for PDFs, images)
- **Real-time:** Supabase Realtime for notifications
- **Payments:** Razorpay/PayU integration for Indian market

---

## Configuration Management

Each organization can configure:
- Logo and branding
- Feature module selections
- Custom fields per student/employee
- Custom roles and permissions
- Integration settings
- Notification preferences
- Report templates
- Discount policies
- Fee structures
- Payment methods

---



---

## BATCH 6: Features Extracted (Images 51-60)
*Reserved for next batch of images - To be updated*

---

## BATCH 7: Features Extracted (Images 61-70)
*Reserved for next batch of images - To be updated*

---

## BATCH 8: Features Extracted (Images 71-80)
*Reserved for next batch of images - To be updated*

---

## Feature Module: FEES & PAYMENTS MANAGEMENT
**Status:** FULL MODULE | **Removable:** Yes | **Priority:** High  
*Note: Appears in Admissions but detailed separately for completeness*

### Currently Implemented in Admissions:
- Course fee setup during admission
- GST calculation (Indian tax compliance)
- Discount management
- Installment creation and scheduling
- Fee status tracking (PENDING, PARTIAL, COMPLETED)

### Additional Capabilities (To Be Extracted from More Images):
- Payment gateway integration (Razorpay, PayU)
- Payment history and receipts
- Payment reminders/notifications
- Refund management
- Payment reconciliation
- Fee reports and analytics

---

## Feature Module: TIMETABLE & ATTENDANCE
**Status:** PARTIAL | **Removable:** Yes | **Priority:** Medium

### Timetable Features:
- Create class timetables
- Link to batch and subject
- Day-wise schedule
- Time slot allocation
- Room/Classroom assignment

### Attendance Features:
- Mark daily attendance (PRESENT, ABSENT, LEAVE)
- Attendance date tracking
- Attendance percentage calculation
- Attendance reports
- Attendance reminders

---

## Feature Module: USERS & ADMINISTRATION
**Status:** CORE | **Removable:** Partial | **Priority:** Critical

### Currently Implemented:
- User account creation
- Role assignment (Super Admin, Admin, Teacher, Student, Parent)
- Organization/Branch user assignment
- User activation/deactivation
- Basic profile management

### Likely Features (To Be Extracted):
- User groups/departments
- Permission management
- Activity logs
- User hierarchy
- Staff directory

---

## Feature Module: COMMUNICATION
**Status:** TO BE EXTRACTED | **Removable:** Yes | **Priority:** Medium

*Placeholder for communication features visible in sidebar*
- Likely: Notifications, SMS, Email, In-app messaging
- To be detailed when images are provided

---

## Feature Module: HUMAN RESOURCES
**Status:** TO BE EXTRACTED | **Removable:** Yes | **Priority:** Low

*Visible in sidebar but details to be extracted*
- Likely: Employee management, salary, leaves, working hours, availability
- To be detailed when images are provided

---

## Feature Module: RESULTS & GRADING
**Status:** TO BE EXTRACTED | **Removable:** Yes | **Priority:** Medium

*Visible in sidebar but details to be extracted*
- Likely: Internal exam results, marks management, report cards
- To be detailed when images are provided

---

## Feature Module: LECTURE TEMPLATES
**Status:** TO BE EXTRACTED | **Removable:** Yes | **Priority:** Low

*Visible in sidebar but details to be extracted*
- Likely: Pre-designed lecture templates for teachers
- To be detailed when images are provided

---

## Feature Module: INVENTORY MANAGEMENT
**Status:** TO BE EXTRACTED | **Removable:** Yes | **Priority:** Low

*Visible in sidebar but details to be extracted*
- Likely: Books, materials, equipment tracking
- To be detailed when images are provided

---

## Feature Module: TIE-UP SCHOOLS
**Status:** TO BE EXTRACTED | **Removable:** Yes | **Priority:** Medium

*Referenced in admissions form (Tie-Up School dropdown)*
- School affiliation management
- Linked student tracking
- School-specific batch management

---

## Implementation Tiers (For White-Labeling)

### Tier 1: ESSENTIAL (Always Included)
- Authentication & Organization Setup
- Dashboard
- Student Management
- Admissions
- Courses & Batches
- Enrollments
- Basic User Management

### Tier 2: ACADEMIC (Optional - Most Common)
- Assignments & Submissions
- Timetable
- Attendance
- Results & Grading
- Lecture Templates

### Tier 3: FINANCIAL (Optional - For Payment Handling)
- Fees & Payments
- Payment Gateway Integration
- Financial Reports

### Tier 4: ADMINISTRATIVE (Optional - For Large Institutions)
- Human Resources
- Inventory Management
- Communication System
- Tie-Up Schools Management
- Advanced Reporting

---

## Database Design Principles

1. **Modular Schema**: Each feature module has its own set of tables that can be disabled
2. **Soft Deletes**: Consider soft deletes for audit trail (especially for financial records)
3. **Extensibility**: Support for custom fields per organization
4. **Multi-Tenancy**: Proper isolation between organizations
5. **Audit Logging**: Track changes for compliance and troubleshooting

---

## Notes for Database Implementation

- **Supabase Choice**: Excellent for this project due to built-in Auth, Row Level Security, and Real-time capabilities
- **White-Labeling Strategy**: Database schema will include feature flags to enable/disable modules
- **GST Compliance**: All financial calculations must support Indian GST (18% standard, others available)
- **Board Support**: Support for CBSE, ICSE, State Boards, and custom boards
- **Scalability**: Design for 100-10,000+ students per instance

---

## Status Summary

| Feature Module | Status | Removable | Priority | Batch |
|---|---|---|---|---|
| Authentication & Users | Complete | Partial | Critical | Core |
| Organization & Branches | Complete | No | Critical | Core |
| Dashboard & Analytics | Complete | No | Critical | Batch 3 |
| Admissions | Complete | No | Critical | Batch 1 |
| Courses & Academics | Complete | No | Critical | Batch 1 |
| Assignments & Submissions | Complete | Yes | High | Batch 1 |
| Enrollments | Complete | No | Critical | Batch 1 |
| Timetable & Attendance | Partial | Yes | Medium | Batch 1 |
| Fees & Payments | Partial | Yes | High | Batch 1 |
| Enhanced Attendance & Lectures | Complete | No | Critical | Batch 2 |
| Weekly Schedule Management | Complete | No | Critical | Batch 2 |
| Batch Management Enhancements | Complete | No | Critical | Batch 2 |
| Organization Management | Complete | No | Critical | Batch 2 |
| Course Pricing | Complete | No | High | Batch 2 |
| Teacher & Staff Management | Complete | Partial | Medium | Batch 2 |
| Doubt Management (Q&A) | Complete | Yes | High | Batch 3 |
| Employee Management | Complete | Partial | Medium | Batch 3 |
| Enhanced Enrollment | Complete | No | Critical | Batch 3 |
| Feedback & Review System | Complete | Yes | Medium | Batch 3 |
| Grievance Management | Complete | Yes | Medium | Batch 3 |
| Inventory & Cash Management | Complete | Yes | Medium | Batch 3 |
| Support Ticketing | Partial | Yes | Medium | Batch 3 |
| Leave Management | Complete | Partial | Medium | Batch 4 |
| Lecture Timing Templates | Complete | No | Medium | Batch 4 |
| Notification System | Complete | Yes | Medium | Batch 4 |
| Payment Management | Complete | No | Critical | Batch 4 |
| Payslip Management | Complete | Partial | Medium | Batch 4 |
| PTM Requests | Complete | Yes | Medium | Batch 4 |
| Results & Grading | Complete | Yes | Medium | Batch 4 |
| Sidebar Navigation | Complete | No | Critical | Batch 4 |
| Roles & Permissions | Complete | No | Critical | Batch 5 |
| Salary Structures | Complete | Partial | Medium | Batch 5 |
| Subject Management | Complete | No | Medium | Batch 5 |
| Support Tickets | Complete | Yes | Medium | Batch 5 |
| Timetable Management | Complete | No | Critical | Batch 5 |
| Timetable Management | Complete | No | Critical | Batch 5 |
| Academics Module Integration | Complete | No | Critical | Batch 5 |
| Topic & Content Management | Complete | No | Critical | Batch 6 |
| User Management | Complete | No | Critical | Batch 6 |
| Working Hours Management | Complete | Partial | Medium | Batch 6 |

---

**Total Project Features Documented:** 60+ complete modules and sub-features

**Total Batches Processed:** 6 (60 images analyzed)
| Human Resources | TO BE EXTRACTED | Yes | Low | TBD |
| Inventory | TO BE EXTRACTED | Yes | Low | TBD |
| Lecture Templates | TO BE EXTRACTED | Yes | Low | TBD |
| Tie-Up Schools | TO BE EXTRACTED | Yes | Medium | TBD |

---

## ARCHITECTURE: USER ROLES & PROFILES MANAGEMENT

### **Critical Architecture Decision**

**User Roles Storage:** Roles are NOT stored in authentication metadata. Instead:
- All user profile information is stored in a dedicated **`profiles`** table
- User roles are linked via **`user_roles`** table (supports many-to-many relationships)
- This enables flexible custom role creation and assignment
- Allows users to have multiple roles simultaneously
- Profile table contains role assignment, branch assignment, and custom attributes

### **User Profiles Table Structure**

```sql
profiles table fields:
- id (UUID, Primary Key)
- user_id (FK to auth.users)
- full_name
- email
- phone_number
- profile_photo_url
- date_of_birth
- gender
- address
- city
- state
- pincode
- organization_id (FK)
- branch_id (FK) -- for staff/teachers
- is_active
- joining_date
- custom_fields (JSONB for extensibility)
- created_at
- updated_at
```

### **User Roles & Permissions Table Structure**

```sql
user_roles table:
- id (UUID)
- user_id (FK to users)
- role_id (FK to roles)
- organization_id (FK)
- assigned_at
- assigned_by (FK to users)

roles table:
- id (UUID)
- role_name
- organization_id (FK) -- NULL for system roles, set for custom roles
- is_system_role (boolean)
- description
- created_at
- updated_at

role_permissions table:
- id (UUID)
- role_id (FK to roles)
- module_name (string - Payment, Course, etc.)
- can_read (boolean)
- can_write (boolean)
- can_delete (boolean)
- created_at
```

---

## WEB APPLICATION PORTALS (NOT MOBILE APPS)

### **1. STUDENT PORTAL**
**Login:** Student email/ID + Password

**Features Available:**
- **Dashboard:**
  - Enrolled batches
  - Upcoming classes (timetable view)
  - Next assignment due date
  - Current marks/grades summary
  - Attendance percentage
  - Fee payment status
  - Quick notifications

- **Academic Section:**
  - **Learning Platform:**
    - Watch course videos (integrated LMS)
    - Browse topics and content
    - Download lecture notes
    - Access study materials
    - Interactive assessments/quizzes
    - Topic-wise progress tracking
    - Recommended learning paths based on performance
  
  - **Assignments:**
    - View assigned assignments
    - Submit assignments (file upload)
    - Check submission status
    - View marks and feedback
    - Re-submit if allowed
  
  - **Performance & Rankings:**
    - View marks for all exams
    - Performance trend graph
    - Subject-wise marks breakdown
    - Class ranking (if enabled)
    - Percentile ranking
    - Performance improvement tips based on weak areas
    - Comparative performance (vs batch average)
  
  - **Attendance:**
    - Monthly attendance record
    - Attendance percentage
    - Present/Absent/Leave breakdown
    - Attendance trend

- **Communication Section:**
  - **Doubts:**
    - Ask doubts with file/image attachment
    - View teacher responses
    - Resolve/Close doubts
    - Doubt history
  
  - **Notifications:**
    - View all notifications
    - Filter by type
    - Archive notifications
  
  - **Announcements:**
    - View batch announcements
    - View course announcements

- **Finance Section:**
  - View fee structure
  - Track payment history
  - View outstanding balance
  - View installment schedule
  - Download payment receipts
  - Make online payment (if integrated)

- **Settings:**
  - Profile update (name, phone, address - non-editable email)
  - Change password
  - Notification preferences
  - Learning preferences (preferred speed, difficulty level)
  - Download progress report

---

### **2. PARENT PORTAL**
**Login:** Parent email + Password (Can have multiple children)

**Features Available:**
- **Dashboard:**
  - List of children with enrolled courses
  - Each child's attendance summary
  - Each child's fee status (paid/pending)
  - Upcoming important dates
  - Recent announcements
  - Open support tickets

- **Child Monitoring Section:**
  - **For Each Child:**
    - **Academic Performance:**
      - Current marks/grades
      - Performance trend (graphs)
      - Subject-wise performance
      - Exam results
      - Class ranking (if enabled)
      - Teacher comments/feedback
      - Progress report card
    
    - **Attendance Tracking:**
      - Daily attendance status
      - Monthly attendance summary
      - Absence alerts
      - Attendance trend
      - Leave applications submitted
    
    - **Assignment Tracking:**
      - Pending assignments
      - Submitted assignments
      - Assignment marks
      - Teacher feedback on assignments
    
    - **Timetable & Schedule:**
      - Class schedule
      - Exam dates
      - Important academic dates

- **Finance Section:**
  - **Fee Management:**
    - Fee structure breakdown
    - Payment history (all children combined or per child)
    - Outstanding balance per child
    - Upcoming due payments (by due date)
    - Payment reminders
  
  - **Online Payments:**
    - Make payment (integrated payment gateway)
    - View payment status
    - Download payment receipts
    - Payment methods: Card, UPI, Net Banking, Wallet
    - Payment history with status
  
  - **Fee Requests:**
    - Fee waiver/discount requests
    - Late fee waiver requests
    - Request tracking and approval status

- **Communication Section:**
  - **Parent-Teacher Meetings (PTM):**
    - View available PTM slots
    - Schedule PTM with teacher
    - View scheduled PTMs
    - PTM history/notes
  
  - **Messages:**
    - View messages from teachers
    - Send concerns to branch admin
    - View announcements
    - Receive notifications
  
  - **Support Tickets:**
    - Create support tickets
    - View ticket status
    - Attach documents/images
    - Chat with support team

- **Grievance Section:**
  - File grievances (fees, academics, behavior, facilities, etc.)
  - View grievance status
  - Add documents/evidence
  - Grievance resolution history

- **Settings:**
  - Profile update
  - Change password
  - Manage child profiles (name, date of birth, etc.)
  - Notification preferences
  - Communication preferences (SMS/Email alerts)
  - Linked children management

---

### **3. TEACHER PORTAL**
**Login:** Teacher code + Password

**Features Available:**
- **Dashboard:**
  - Today's classes
  - Pending assignments to grade
  - Pending doubts to answer
  - Open support tickets assigned to them
  - Class strength today
  - Today's attendance data
  - Recent notifications

- **Class Management Section:**
  - **Timetable:**
    - Weekly/monthly view
    - Class assignments
    - Room allocation
  
  - **Attendance:**
    - Mark attendance for today's class
    - View attendance history
    - Generate attendance reports
    - Attendance analytics per batch

- **Academic Content Delivery:**
  - **Upload Content:**
    - Upload lecture notes (PDF)
    - Upload study materials
    - Upload videos/links to external content
    - Create topics and sub-topics
    - Organize content in hierarchy
  
  - **Assignment Management:**
    - Create assignments
    - Assign to batches
    - Set due dates
    - View submissions
    - Grade assignments
    - Provide feedback
    - View submission statistics
  
  - **Results & Grading:**
    - Enter marks for exams
    - View student performance
    - Generate performance reports
    - Export marks
    - Create result cards/transcripts

- **Student Monitoring:**
  - **Performance Analytics:**
    - Student-wise performance
    - Batch-wise performance
    - Subject-wise performance
    - Individual student progress tracking
    - Identify low performers
    - Performance comparison with batch average
  
  - **Attendance Tracking:**
    - Batch attendance summary
    - Individual student attendance
    - Absent/Late patterns
    - Generate attendance reports

- **Doubt Resolution:**
  - View assigned doubts
  - Respond to doubts
  - Share resources in doubt responses
  - Mark doubt as resolved
  - View doubt resolution metrics

- **Communication:**
  - **Parent Communication:**
    - Send messages to parents
    - View parent messages
    - Schedule PTMs
    - View PTM history
  
  - **Feedback System:**
    - Fill feedback forms (if assigned)
    - View feedback responses

- **Activity Logging:**
  - **Teaching Activity:**
    - Log topics covered in class
    - Add teaching remarks/notes
    - Log subtopics and syllabus progress
    - Track lecture-wise completion status
    - View activity history

- **Reporting & Analytics:**
  - Generate performance reports
  - Attendance reports
  - Assignment submission reports
  - Class-wise analytics
  - Export reports to PDF/Excel

- **Settings:**
  - Profile update
  - Change password
  - Working hours configuration
  - Notification preferences
  - Availability status

- **My Teaching Schedule:**
  - View assigned batches and subjects
  - View lecture templates
  - View teaching hours
  - Manage availability/off days

---

### **4. BRANCH ADMIN PORTAL**
**Login:** Branch Admin credentials

**Features Available:**
- **Dashboard:**
  - Branch KPIs (students, batches, revenue, etc.)
  - Branch-specific announcements
  - Pending approvals (leave, grievances, transfers)
  - Branch inventory status
  - Branch revenue tracking

- **Student Management:**
  - All students in branch
  - Bulk import students
  - Approve batch transfers
  - View student details
  - Deactivate/Re-activate students

- **Batch Management:**
  - Create/manage batches
  - Assign teachers to batches
  - Manage batch capacity
  - Monitor batch performance
  - Batch analytics

- **Financial Management:**
  - View all transactions in branch
  - Outstanding payments
  - Payment collection tracking
  - Generate financial reports
  - Branch revenue analytics

- **HR & Staff Management:**
  - View employees in branch
  - Approve leave requests
  - Monitor attendance
  - Generate payslips
  - View salary structures

- **Communication:**
  - Send notifications to branch users
  - Manage grievances
  - Support tickets
  - Announcements

---

### **5. SUPER ADMIN PORTAL**
**Login:** Super Admin credentials

**Features Available:**
- **Organization Management:**
  - Create/manage branches
  - Manage courses (across all branches)
  - Manage global settings
  - View organization-wide KPIs

- **Global Analytics:**
  - All organizations (multi-organization view)
  - Revenue tracking
  - Student statistics
  - Performance analytics across branches
  - System health metrics

- **User & Role Management:**
  - Create/edit/delete users
  - Create/edit/delete roles (system and custom)
  - Assign permissions to roles
  - View user activity logs
  - Bulk user operations

- **System Administration:**
  - Feature flag management
  - System configurations
  - Database backups
  - Audit logs
  - API access management

- **All other features with global scope**

---

## MISSING FEATURES & ENHANCEMENTS ADDED

### **BATCH 7: DOCUMENT MANAGEMENT SYSTEM**
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 37.1 Student Document Management
- **Document Types:**
  - Aadhar/ID Proof
  - Birth Certificate
  - Previous Year Mark Sheet
  - Transfer Certificate
  - School Leaving Certificate
  - Address Proof
  - Photo (4x6 size)
  - Medical Records

- **Document Upload & Verification:**
  - Self-upload during admission
  - Document verification status (PENDING, VERIFIED, REJECTED)
  - Verified by (staff member name)
  - Verification date
  - Rejection reason (if rejected)
  - Re-upload capability

- **Document Retrieval:**
  - Student document portal
  - Parent view of documents
  - Admin verification interface

#### 37.2 Certificate Generation & Management
- **Certificate Types:**
  - Attendance Certificate
  - Completion Certificate
  - Performance Certificate
  - Conduct Certificate
  - Mark Sheet/Transcript
  - Course Completion Diploma

- **Certificate Generation:**
  - Bulk certificate generation
  - Template selection
  - Custom text/fields
  - Digital signature support (School/Principal)
  - Issue date and valid up to
  - Registration number assignment
  - QR code for verification

- **Certificate Distribution:**
  - Email certificates to students
  - Download PDF certificates
  - Print certificates
  - Certificate archival
  - Certificate revocation

#### 37.3 Transcript Management
- **Academic Transcripts:**
  - Generate student transcripts
  - Include all exams and marks
  - Include grades and percentage
  - Include attendance
  - Include disciplinary records
  - Digital signature
  - Official stamp/watermark
  - Export to PDF

#### 37.4 Document Audit Trail
- Who uploaded/verified document
- When document was uploaded/verified
- Changes made to document status
- Verification remarks

---

### **BATCH 8: LEARNING MANAGEMENT SYSTEM (LMS)**
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 38.1 Video Content Management
- **Video Hosting:**
  - Upload videos (MP4, WebM formats)
  - Video player with playback controls
  - Adjustable playback speed (0.5x, 1x, 1.25x, 1.5x, 2x)
  - Full-screen mode
  - Video progress tracking
  - Resume from last position
  - Video quality selection (480p, 720p, 1080p)
  - Streaming optimization

- **Video Metadata:**
  - Video title and description
  - Duration
  - Thumbnail image
  - Associated topic
  - Upload date
  - View count
  - Average rating

#### 38.2 Interactive Content
- **Inline Quizzes:**
  - Embed quizzes within video content
  - Pause video for quiz questions
  - Auto-continue after correct answer
  - Score tracking
  - Skip quiz option

- **Discussion Boards:**
  - Per-topic discussion threads
  - Student-to-student comments
  - Teacher moderation
  - Comment threading
  - Mark helpful answers
  - Pin important discussions

#### 38.3 Learning Progress Tracking
- **Student Progress:**
  - Content completion percentage
  - Video watched duration
  - Topics completed
  - Assessments completed
  - Quiz scores
  - Time spent on each topic
  - Learning pace (slow/normal/fast)

- **Learning Dashboard:**
  - Overall course progress
  - Next recommended topic
  - Weak areas identification
  - Study suggestions
  - Learning analytics
  - Certificate of completion

#### 38.4 Adaptive Learning Paths
- **Recommended Learning Sequence:**
  - Prerequisite content identification
  - Difficulty-based recommendations
  - Performance-based suggestions
  - Weakness-based remedial content
  - Strength-based advanced content

#### 38.5 Content Organization
- **Course Structure:**
  - Modules (chapters)
  - Lessons (within modules)
  - Topics (within lessons)
  - Content items (videos, notes, assessments, links)
  - Sequencing and dependencies

---

### **BATCH 9: ADVANCED REPORTING & ANALYTICS**
**Status:** Core Feature | **Removable:** No | **Priority:** High

#### 39.1 Custom Report Builder
- **Report Creation Interface:**
  - Drag-and-drop report builder
  - Select data sources (students, batches, marks, attendance, payments)
  - Choose metrics to display
  - Apply filters (date range, branch, batch, course)
  - Sorting options
  - Group by options
  - Calculation fields (sum, average, count, percentage)

- **Report Templates:**
  - Pre-built report templates
  - Save custom reports as templates
  - Share templates across branches
  - Template versioning

#### 39.2 Student Performance Analytics
- **Performance Dashboard:**
  - Student-wise performance tracking
  - Subject-wise performance breakdown
  - Exam-wise performance
  - Performance trend over time
  - Comparison with batch average
  - Strength and weakness identification
  - Learning curve analysis

- **Predictive Analytics:**
  - Identify at-risk students (likely to fail)
  - Performance prediction for future exams
  - Drop-out risk identification
  - Intervention recommendations

- **Performance Reports:**
  - Individual student report card
  - Class rank and percentile
  - Batch performance summary
  - Subject performance analysis
  - Exam analysis and insights

#### 39.3 Attendance & Engagement Analytics
- **Attendance Analytics:**
  - Attendance trends
  - Student absence patterns
  - Late arrival patterns
  - Attendance vs performance correlation
  - Staff attendance metrics

- **Engagement Metrics:**
  - Video watch time
  - Assignment submission rate
  - Quiz participation rate
  - Doubt asking frequency
  - Forum participation

#### 39.4 Financial Analytics & Reporting
- **Revenue Reports:**
  - Monthly/quarterly/yearly revenue
  - Revenue by course
  - Revenue by branch
  - Revenue trends
  - Outstanding amount tracking

- **Fee Collection Reports:**
  - Collection rate
  - Payment method breakdown
  - Pending payments report
  - Payment trend analysis
  - Overdue payment list
  - Payment follow-up status

- **Expense Reports:**
  - Staff salary expenses
  - Operational expenses
  - Expense by category
  - Expense vs revenue analysis

#### 39.5 Report Export & Scheduling
- **Export Formats:**
  - PDF with formatting
  - Excel spreadsheet
  - CSV for import
  - Print-friendly HTML

- **Scheduled Reports:**
  - Schedule report generation
  - Automated email delivery
  - Daily/weekly/monthly scheduling
  - Multiple recipients
  - Report history

---

### **BATCH 10: AUTOMATION & SCHEDULED TASKS**
**Status:** Core Feature | **Removable:** Partial | **Priority:** High

#### 40.1 Automated Notifications
- **Payment Reminders:**
  - Remind parents of upcoming due payments
  - Days before due date (configurable: 3, 7, 14 days)
  - Overdue payment reminders
  - SMS + Email notifications
  - Recurring reminders

- **Attendance Reminders:**
  - Alert if student attendance falls below threshold
  - Weekly absence summary
  - Leave approval reminders

- **Assignment Reminders:**
  - Assignment due date reminders
  - Late submission alerts
  - Grading completion reminders

- **Exam Reminders:**
  - Exam date reminders
  - Result declaration reminders
  - Performance alerts

#### 40.2 Automated Fee Management
- **Auto Late Fee Calculation:**
  - Calculate late fees based on configurable rules
  - Apply late fees automatically after due date
  - Grace period support (no fee if paid within X days)
  - Notification on late fee application

- **Auto Enrollment Blocking:**
  - Block re-enrollment if fees not cleared
  - Clear blocking once payment done
  - Notification to parent/student

#### 40.3 Scheduled Batch Operations
- **Batch Auto-Archival:**
  - Archive completed batches
  - Archive at end of session automatically
  - Preserve data for historical records

- **End of Year Processing:**
  - Generate transcripts
  - Generate completion certificates
  - Archive batch data
  - Close academic year

#### 40.4 Auto-Generated Reports
- **Scheduled Report Generation:**
  - Daily: Attendance report, payment status
  - Weekly: Performance report, batch-wise metrics
  - Monthly: Financial report, enrollment report
  - Auto-email to stakeholders

#### 40.5 Automated Data Management
- **Data Cleanup:**
  - Archive old notifications
  - Archive old transactions
  - Retain policies (30 days, 1 year, 7 years based on data type)

- **Auto Backup:**
  - Daily backups
  - Weekly full backups
  - Monthly archive backups

---

### **BATCH 11: AUDIT LOGGING & COMPLIANCE**
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 41.1 Complete Activity Audit Trail
- **Audit Log Table Fields:**
  - Timestamp (with timezone)
  - User ID (who performed action)
  - User Role
  - Action type (CREATE, UPDATE, DELETE, VIEW, EXPORT)
  - Entity type (Student, Batch, Payment, etc.)
  - Entity ID
  - Changes made (before/after values for updates)
  - IP Address
  - User Agent/Device
  - Status (Success, Failed)
  - Error message (if failed)
  - Organization & Branch context

#### 41.2 Audit Log Access
- **Audit Log Viewing:**
  - Filter by date range
  - Filter by user
  - Filter by entity type
  - Filter by action
  - Search by entity ID
  - Export audit logs

#### 41.3 Financial Transaction Audit
- **Transaction Audit Trail:**
  - All payment transactions logged
  - All fee modifications logged
  - Salary changes logged
  - Refunds logged
  - Who approved/made changes
  - Timestamp and reason

#### 41.4 User Access Logging
- **Login Audit:**
  - Login timestamp
  - Login IP address
  - Session ID
  - Logout timestamp
  - Session duration
  - Failed login attempts
  - Account lockout events

#### 41.5 Data Change Tracking
- **Changes Log:**
  - All student profile changes
  - All fee/payment changes
  - All marks changes
  - All enrollment changes
  - Modified by (user details)
  - Modified at (timestamp)
  - Reason for change (optional)

#### 41.6 Compliance Reports
- **GST Compliance:**
  - GST-wise transaction report
  - Tax calculation verification
  - Compliance report generation

- **Data Privacy (GDPR/India Data Privacy):**
  - Data processing log
  - Consent management
  - Data deletion log
  - Data export requests
  - Data retention policy adherence

---

### **BATCH 12: SECURITY ENHANCEMENTS**
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 42.1 Multi-Factor Authentication (MFA)
- **Two-Factor Authentication (2FA):**
  - Email OTP (One Time Password)
  - SMS OTP
  - TOTP (Time-based One Time Password) - Google Authenticator
  - Backup codes for recovery
  - MFA enforcement per organization (optional)
  - MFA per role (e.g., Super Admin must use 2FA)

#### 42.2 Session Management
- **Session Security:**
  - Session timeout (configurable: 30 min, 1 hour, 2 hours)
  - Idle timeout warning
  - Re-authentication for sensitive operations
  - Session history per user
  - Force logout all sessions (for password change)
  - Device tracking (session per device)

#### 42.3 Password Policies
- **Password Requirements:**
  - Minimum length (e.g., 8 characters)
  - Complexity rules (uppercase, lowercase, numbers, special chars)
  - Password expiry (optional)
  - Password history (cannot reuse last N passwords)
  - Force password change on first login

#### 42.4 IP & Device Security
- **IP Whitelisting:**
  - Configure trusted IPs per organization
  - Restrict access to whitelisted IPs
  - Option to bypass for specific roles

- **Device Management:**
  - Track devices used for login
  - Device approval workflow
  - Force logout from unknown devices

#### 42.5 Encryption
- **Data Encryption:**
  - HTTPS for all data in transit
  - Encryption at rest for sensitive data (passwords, financial info)
  - End-to-end encryption for messaging (optional)

#### 42.6 Suspicious Activity Detection
- **Alert on Suspicious Activities:**
  - Unusual login location
  - Login from new device
  - Multiple failed login attempts
  - Bulk data access attempts
  - Unusual transaction amounts

---

### **BATCH 13: ACADEMIC CALENDAR & TERM MANAGEMENT**
**Status:** Core Feature | **Removable:** Partial | **Priority:** High

#### 43.1 Academic Calendar Setup
- **Calendar Configuration per Organization/Branch:**
  - Session/Year (e.g., 2025-26)
  - Session start and end dates
  - Terms/Semesters breakdown

- **Important Academic Dates:**
  - Admission start/end dates
  - Classes start date
  - Holidays (national, branch-specific, custom)
  - Exam dates (start and end)
  - Result declaration dates
  - Year-end closure date
  - Re-enrollment period

#### 43.2 Holiday Management
- **Holiday Types:**
  - National holidays
  - Regional holidays
  - Custom holidays (branch-specific)
  - Partial holidays (for specific batches)

- **Holiday Configuration:**
  - Holiday name
  - Holiday date(s)
  - Holiday type
  - Applicable to (all branches or specific)
  - Applicable batches

#### 43.3 Working Days Calculation
- **Automatic Working Days:**
  - Calculate working days excluding weekends and holidays
  - Used for attendance percentage calculation
  - Used for deadline calculations

#### 43.4 Calendar View & Display
- **Calendar Interface:**
  - Monthly calendar view
  - Highlight holidays
  - Highlight exam dates
  - Highlight important dates
  - Batch-specific calendar view
  - Exportable calendar

---

### **BATCH 14: ADVANCED ENROLLMENT FEATURES**
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 44.1 Waiting List Management
- **Waiting List Functionality:**
  - Add student to waiting list if batch full
  - Track waiting list position
  - Priority rules (FIFO, merit-based, etc.)
  - Auto-enroll when seat available
  - Waiting list notification to student
  - Waiting list expiry

#### 44.2 Enrollment Prerequisites
- **Prerequisite Validation:**
  - Define prerequisites per batch/course
  - Check prerequisites before enrollment
  - Show message if prerequisite not met
  - Allow exception approval by admin

#### 44.3 Batch Transfer Management
- **Transfer Request Workflow:**
  - Student/Parent request transfer
  - Transfer reason
  - New batch preference
  - Admin approval workflow
  - Approval/Rejection notification
  - Automatic enrollment in new batch
  - Fee adjustment on transfer

- **Transfer Restrictions:**
  - Date-based transfer windows (e.g., only in first month)
  - Batch capacity restrictions
  - Same course only transfer (or allow cross-course)
  - Max transfer count per student (e.g., max 2 transfers)

#### 44.4 Seat Availability Management
- **Batch Capacity Rules:**
  - Maximum capacity per batch
  - Current enrollment count
  - Available seats display
  - Waitlist count
  - Close batch when full (auto)
  - Over-enrollment override for admin

---

### **BATCH 15: RESOURCE MANAGEMENT & SCHEDULING**
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 45.1 Classroom & Resource Management
- **Classroom Inventory:**
  - Classroom name and code
  - Capacity (seat count)
  - Facilities (projector, whiteboard, AC, etc.)
  - Equipment (laptop, speakers, etc.)
  - Availability status

- **Resource Booking:**
  - Reserve classroom for class
  - Equipment allocation to classes
  - Resource conflict detection (prevent double booking)
  - Substitute resource assignment if primary unavailable

#### 45.2 Teacher Workload Balancing
- **Workload Analytics:**
  - Classes per teacher per week
  - Total teaching hours per week
  - Subject load distribution
  - Batch assignment analysis
  - Overload detection

- **Load Balancing:**
  - Suggest load-balanced assignments
  - Manual reassignment capability
  - Workload conflict prevention

#### 45.3 Facility & Lab Resource Allocation
- **Lab Management:**
  - Lab name and code
  - Capacity
  - Equipment inventory
  - Lab schedule/availability
  - Lab booking by teacher
  - Lab attendance tracking

- **Equipment Management:**
  - Equipment inventory
  - Maintenance schedule
  - Equipment assignment to labs/batches
  - Equipment condition tracking

#### 45.4 Resource Utilization Reports
- **Utilization Analytics:**
  - Classroom utilization rate
  - Equipment utilization
  - Lab usage pattern
  - Unused time slots
  - Resource allocation efficiency
  - Recommendations for optimization

---

### **BATCH 16: ADVANCED TEST & ASSESSMENT SYSTEM**
**Status:** Core Feature | **Removable:** Partial | **Priority:** High

#### 46.1 Test Series Management
- **Test Series Creation:**
  - Series name and description
  - Number of tests in series
  - Test sequence and dates
  - Topic coverage per test
  - Difficulty progression
  - Series type (FULL_MOCK, TOPIC_WISE, REVISION, SPEED_BUILDING)

- **Series Assignment:**
  - Assign series to batches
  - Series start date
  - Series end date
  - Mandatory/Optional series
  - Series completion tracking

#### 46.2 Mock Test Features
- **Mock Test Configuration:**
  - Mock test pattern (like actual exam)
  - Time duration
  - Question types (MCQ, Subjective, etc.)
  - Subject-wise question count
  - Mark scheme
  - Negative marking rules
  - Difficulty level distribution

- **Mock Test Execution:**
  - Online test platform
  - Timer display and countdown
  - Question navigation (previous/next, jump to question)
  - Mark for review feature
  - Auto-save responses
  - Submit test
  - Review responses after submission

#### 46.3 Question Bank Management
- **Question Library:**
  - Store questions by subject and topic
  - Question metadata (difficulty, topic, chapter, keywords)
  - Question types (MCQ, Fill-in-blank, Subjective, Numerical)
  - Answer keys and explanations
  - Source tracking (textbook, exam, year)
  - Question approval workflow

- **Question Difficulty Tagging:**
  - Difficulty levels (Easy, Medium, Hard)
  - Automatic difficulty calibration based on performance
  - Topic-wise difficulty tracking

- **Auto Question Generation:**
  - Generate mock tests automatically from question bank
  - Balanced difficulty selection
  - Topic-wise balanced questions

#### 46.4 Performance Analytics for Tests
- **Individual Test Performance:**
  - Marks obtained and percentage
  - Time spent per question
  - Question accuracy (correct/incorrect/unmarked)
  - Subject-wise performance
  - Difficulty-wise performance
  - All India Rank (AIR) if applicable
  - Percentile ranking in class

- **Performance Trends:**
  - Series performance progression
  - Weak question types
  - Weak topics
  - Weak subjects
  - Improvement areas
  - Strong areas

- **Comparative Analysis:**
  - Performance vs batch average
  - Performance vs class rank
  - Performance vs previous test
  - Subject-wise vs class average

#### 46.5 Test Analytics & Insights
- **Question Analytics:**
  - Question-wise performance across students
  - Percentage of students answering correctly
  - Difficulty calibration data
  - Time spent per question (average)
  - Common mistakes
  - Confusion points

- **Batch Analytics:**
  - Batch average performance
  - Batch performance trend
  - Topic-wise batch performance
  - Most problematic topics
  - Recommendations for remedial teaching

---

### **BATCH 17: PAYMENT GATEWAY INTEGRATION**
**Status:** Core Feature | **Removable:** No | **Priority:** Critical

#### 47.1 Payment Gateway Setup
- **Supported Payment Gateways (India-specific):**
  - Razorpay (primary recommendation)
  - PayU
  - PhonePe Business
  - Google Pay Business
  - Paytm Business
  - 2Checkout

- **Gateway Configuration:**
  - API Keys and Secrets (stored securely)
  - Webhook setup for payment confirmations
  - Test and Live mode switching
  - Currency configuration (INR)
  - Settlement account details

#### 47.2 Online Payment Processing
- **Payment Interface:**
  - Amount entry
  - Payment method selection
  - Payment gateway redirect
  - Payment processing
  - Success/Failure notification
  - Payment reference ID generation

- **Payment Methods Supported:**
  - Credit/Debit Card (Visa, Mastercard)
  - UPI (BHIM, Google Pay, PhonePe, etc.)
  - Net Banking
  - Digital Wallet
  - EMI options (if available)

#### 47.3 Payment Status Management
- **Payment Status Tracking:**
  - INITIATED (payment started)
  - PENDING (awaiting confirmation)
  - COMPLETED/REALIZED (payment successful)
  - FAILED (payment failed)
  - CANCELLED (user cancelled)
  - REFUNDED (refund processed)

- **Payment Reconciliation:**
  - Automatic reconciliation with bank
  - Manual reconciliation option
  - Discrepancy detection
  - Reversal handling

#### 47.4 Recurring Payments & Subscriptions
- **Installment Auto-Payment:**
  - Save card for future payments
  - Auto-debit on due date
  - Payment failure retry (3 retries with delays)
  - Notification before auto-debit
  - Opt-out option

- **Subscription Mode:**
  - Recurring monthly/quarterly/yearly payments
  - Subscription management
  - Auto-renewal
  - Cancellation handling

#### 47.5 Invoice & Receipt Generation
- **Invoice Details:**
  - Invoice number (auto-generated)
  - Invoice date
  - Student details
  - Course/Batch details
  - Fee breakdown
  - Discount details
  - GST calculation
  - Total amount
  - Payment method
  - Paid amount

- **Receipt Distribution:**
  - Email receipt to parent/student
  - Download PDF receipt
  - Print receipt
  - Digital signature option
  - Receipt archival

#### 47.6 Refund Management
- **Refund Process:**
  - Refund reason
  - Approval workflow
  - Refund amount calculation
  - Refund processing (back to original payment method)
  - Refund status tracking
  - Refund timeline (3-7 working days)
  - Refund confirmation notification

---

### **BATCH 18: COMMUNICATION PLATFORM EXPANSION**
**Status:** Core Feature | **Removable:** Partial | **Priority:** High

#### 48.1 SMS Gateway Integration
- **SMS Service Providers:**
  - Twilio (recommended)
  - AWS SNS
  - ClickSend
  - Local providers (Route Mobile, Netcore, etc.)

- **SMS Types:**
  - Payment reminders (3 days before due, on due date, after due date)
  - Attendance alerts (absent, low attendance warning)
  - Assignment reminders
  - Exam schedule and result notifications
  - Enrollment and batch transfer notifications
  - Leave approval/rejection
  - PTM schedule confirmations

#### 48.2 Email Automation
- **Email Service Providers:**
  - SendGrid (recommended)
  - AWS SES
  - Mailgun
  - Brevo (Sendinblue)

- **Email Templates:**
  - Transactional emails (receipts, confirmations)
  - Notification emails
  - Report emails
  - Announcement emails
  - Scheduled emails

- **Email Content:**
  - Dynamic placeholders (student name, amount, date, etc.)
  - HTML formatting
  - Attachments (receipts, certificates, reports)
  - Tracking (open, click)
  - Unsubscribe option

#### 48.3 WhatsApp Integration (Optional)
- **WhatsApp Business API:**
  - Message templates (pre-approved by WhatsApp)
  - Payment alerts via WhatsApp
  - Assignment reminders
  - Attendance notifications
  - Document delivery (e.g., certificates)
  - Two-way communication (reply capability)

#### 48.4 Push Notifications
- **Web Push Notifications:**
  - Browser-based push notifications
  - Real-time alerts
  - In-app notification center
  - Notification categories (academic, payment, general)
  - Notification scheduling

#### 48.5 Communication Preferences
- **User Preferences:**
  - Opt-in/opt-out for different notification types
  - Preferred communication channel (SMS, Email, Push, WhatsApp)
  - Quiet hours (no notifications between X and Y)
  - Notification frequency
  - Language preference

---

### **BATCH 19: PARENT-TEACHER COLLABORATION ENHANCEMENTS**
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 49.1 Shared Notes & Comments
- **Teacher Comments:**
  - Academic performance observations
  - Behavior and discipline notes
  - Attendance concerns
  - Suggestions for improvement
  - Positive feedback/achievements
  - Comment visibility (parent view)
  - Comment timestamp and author

- **Parent Feedback:**
  - Parent concerns and questions
  - Child behavior at home
  - Family situations affecting study
  - Resource needs from school
  - Feedback timestamp

#### 49.2 Parent-Teacher Conversation Threads
- **Chat Interface:**
  - Direct messaging between parent and teacher
  - Threaded conversations
  - File/image sharing
  - Message timestamp
  - Read/unread status
  - Archive conversations
  - Conversation history

#### 49.3 Parent App Features
- **Dedicated Parent Application:**
  - Mobile-responsive web app
  - Multi-child management
  - Real-time notifications
  - Offline mode (view cached data)
  - Dark mode
  - Multiple language support

#### 49.4 Multi-Child Parent View
- **Parent Dashboard with Multiple Children:**
  - Dropdown/tab to select child
  - Combined view of all children's status
  - Child-wise notifications
  - Child-wise fee status
  - Child-wise attendance summary
  - Performance comparison across children

---

### **BATCH 20: CUSTOM FIELDS & EXTENSIBILITY**
**Status:** Core Feature | **Removable:** Partial | **Priority:** Medium

#### 50.1 Custom Student Fields
- **Dynamic Field Support:**
  - Organization can add custom fields to student profile
  - Field types: Text, Number, Date, Dropdown, Checkbox, File
  - Field validation rules
  - Mandatory/Optional fields
  - Field visibility rules (who can see)
  - Field editing permissions

#### 50.2 Custom Batch Fields
- **Batch Custom Data:**
  - Custom fields for batch metadata
  - Subject-specific configurations
  - Batch performance tracking fields

#### 50.3 Custom Fee Components
- **Flexible Fee Structure:**
  - Add custom fee components (beyond tuition)
  - Maintenance charges, transport, uniform, etc.
  - One-time and recurring fees
  - Optional/mandatory components
  - Fee component visibility

#### 50.4 Metadata & JSONB Storage
- **Flexible Data Storage:**
  - JSONB columns in profiles and other tables
  - Store unstructured data
  - Query and filter on JSONB fields
  - Backward compatibility for future changes

---

## IMPLEMENTATION ARCHITECTURE UPDATE

### **User Authentication & Profiles - Final Architecture**

```
Authentication Flow:
├── Supabase Auth (auth.users table)
│   └── Stores: email, password (hashed), phone, metadata (minimal)
│
└── Profiles Table
    ├── user_id (FK to auth.users)
    ├── user_type (student, parent, teacher, employee, etc.)
    ├── full_name
    ├── profile_data (JSONB for custom fields)
    ├── organization_id (FK)
    ├── branch_id (FK)
    └── is_active
    
└── User Roles Table (Many-to-Many)
    ├── user_id (FK to profiles)
    ├── role_id (FK to roles)
    ├── organization_id (FK)
    └── assigned_at
    
└── Roles Table
    ├── id (UUID)
    ├── role_name (super_admin, branch_admin, teacher, student, etc.)
    ├── organization_id (FK, NULL for system roles)
    ├── is_system_role (boolean)
    ├── description
    ├── feature_flags (JSONB - which modules enabled)
    └── created_at

└── Role Permissions Table
    ├── role_id (FK)
    ├── module_name
    ├── can_read
    ├── can_write
    ├── can_delete
    └── can_export
```

### **Web App Architecture (Not Mobile)**

```
Web Applications:
├── Student Portal
│   ├── Authentication (Email/ID + Password)
│   ├── Dashboard
│   ├── Learning Platform (Videos, Topics, Content)
│   ├── Assignments (Submit, View Feedback)
│   ├── Performance & Rankings
│   ├── Attendance Tracking
│   ├── Doubts & Communication
│   ├── Finance & Fees
│   └── Settings

├── Parent Portal
│   ├── Authentication (Email + Password)
│   ├── Dashboard (Multiple children)
│   ├── Child Monitoring (Academic, Attendance, Assignments)
│   ├── Finance & Fee Management
│   ├── Online Payments (Payment Gateway)
│   ├── PTM Scheduling
│   ├── Communication & Support
│   ├── Grievances
│   └── Settings

├── Teacher Portal
│   ├── Authentication (Teacher Code + Password)
│   ├── Dashboard
│   ├── Class Management & Attendance
│   ├── Content Delivery (Upload, Organize)
│   ├── Assignments & Grading
│   ├── Student Monitoring & Performance
│   ├── Results & Marks Entry
│   ├── Doubt Resolution
│   ├── Activity Logging
│   ├── Parent Communication
│   ├── Reports & Analytics
│   └── Settings

├── Branch Admin Portal
│   ├── Authentication
│   ├── Dashboard (Branch KPIs)
│   ├── Student Management
│   ├── Batch Management
│   ├── Financial Management
│   ├── HR & Staff Management
│   ├── Communication & Support
│   └── Branch Analytics

└── Super Admin Portal
    ├── Authentication
    ├── Organization Management
    ├── Global Analytics
    ├── User & Role Management
    ├── System Administration
    └── All features with global scope
```

---

## PHASED ROLLOUT PLAN (UPDATED)

### **Phase 1: MVP (Core Platform) - Weeks 1-8**
✅ Authentication & User Management (Auth + Profiles)
✅ Organization & Branches
✅ Admissions & Enrollments
✅ Courses, Subjects, Batches
✅ Basic Timetable & Attendance
✅ Basic Fee Management (Manual)
✅ Dashboard (Super Admin & Branch Admin only)
✅ Roles & Permissions (System roles only)

### **Phase 2: Academic Core - Weeks 9-16**
✅ Topics & Content Management
✅ Assignments & Grading
✅ Student Portal (Basics)
✅ Teacher Portal (Class Management)
✅ Results & Marks Management
✅ Document Management (Upload & Verification)
✅ Advanced Attendance Tracking
✅ Custom Fields & Extensibility

### **Phase 3: Communication & Engagement - Weeks 17-24**
✅ Doubts Management (Q&A)
✅ Notifications System
✅ Email & SMS Integration
✅ Parent Portal (Basics)
✅ PTM Requests
✅ Feedback System
✅ Grievance Management
✅ Support Tickets

### **Phase 4: Finance & Payment - Weeks 25-32**
✅ Payment Gateway Integration (Razorpay/PayU)
✅ Online Payments (Multiple methods)
✅ Automated Payment Reminders
✅ Payslip Generation
✅ Salary Structures
✅ Financial Reports & Analytics
✅ Late Fee Auto-Calculation
✅ Invoice & Receipt Generation

### **Phase 5: Advanced Features - Weeks 33-40**
✅ Learning Management System (LMS - Video Platform)
✅ Advanced Reporting & Custom Reports
✅ Test Series & Mock Tests
✅ Advanced Analytics & Predictive Analytics
✅ Academic Calendar & Holiday Management
✅ Leave Management (Complete)
✅ Teacher Workload Balancing
✅ Classroom & Resource Management

### **Phase 6: Security & Compliance - Weeks 41-48**
✅ Two-Factor Authentication (2FA)
✅ Audit Logging & Compliance
✅ Session Management Security
✅ IP Whitelisting
✅ Suspicious Activity Detection
✅ Data Privacy & GDPR Compliance
✅ Password Policies
✅ API Security

### **Phase 7: Automation & Advanced Enhancements - Weeks 49-56**
✅ Automated Scheduled Tasks
✅ Waiting List Management
✅ Batch Transfer Workflows
✅ Advanced Enrollment Features
✅ Adaptive Learning Paths
✅ Advanced PTM Features
✅ Parent App Enhancements
✅ WhatsApp Integration (Optional)

### **Phase 8: Optimization & Going Live - Weeks 57-60**
✅ Performance Optimization
✅ Caching Strategy
✅ Database Indexing
✅ UI/UX Polish
✅ Comprehensive Testing
✅ User Documentation
✅ Admin Training
✅ Go-Live & Support

---

## PROJECT STRUCTURE & FOLDER ORGANIZATION (TEMPLATE-BASED)

### **Core Philosophy: Modular & Reusable**
The entire EduMunch project is built as a **collection of feature templates**. Each organization can pick and choose which feature modules they need, and the codebase is structured so that entire feature folders can be:
- ✅ Copied to a new project
- ✅ Removed from an existing project
- ✅ Referenced as template code
- ✅ Modified without breaking other features

---

## ROOT PROJECT STRUCTURE

```
edumunch/
├── public/                          # Static assets
│   ├── icons/
│   ├── images/
│   └── documents/
│
├── src/
│   ├── components/                  # Reusable UI components (ORGANIZED BY FEATURE)
│   ├── pages/                       # Page components (ORGANIZED BY FEATURE)
│   ├── services/                    # API & Supabase services (ORGANIZED BY FEATURE)
│   ├── hooks/                       # Custom React hooks (ORGANIZED BY FEATURE)
│   ├── store/                       # Zustand stores (ORGANIZED BY FEATURE)
│   ├── types/                       # TypeScript types & interfaces (ORGANIZED BY FEATURE)
│   ├── utils/                       # Utility functions
│   │   ├── common/                  # Shared across all features
│   │   └── validators/
│   ├── layouts/                     # Layout components
│   │   ├── AdminLayout.tsx
│   │   ├── StudentLayout.tsx
│   │   └── ParentLayout.tsx
│   ├── styles/                      # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── tailwind.config.js
│   ├── constants/                   # Global constants
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   └── feature_flags.ts
│   ├── App.tsx                      # Main app component
│   └── main.tsx                     # Vite entry point
│
├── database/                        # DATABASE SCHEMA & MIGRATIONS (ORGANIZED BY FEATURE)
│   ├── migrations/                  # SQL migration files (organized by feature)
│   ├── functions/                   # PL/pgSQL database functions
│   ├── seeds/                       # Seed data for testing
│   └── README.md                    # Database documentation
│
├── docs/                            # PROJECT DOCUMENTATION
│   ├── ARCHITECTURE.md              # System architecture
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── API.md                       # API documentation
│   ├── FEATURES.md                  # Feature list (links to feature docs)
│   ├── SETUP.md                     # Development setup
│   ├── FEATURE_MODULES/             # Per-feature documentation
│   │   ├── attendance.md
│   │   ├── admissions.md
│   │   ├── payments.md
│   │   └── ...
│   └── TROUBLESHOOTING.md
│
├── .env.example                     # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

```

---

## FEATURE-BASED FOLDER ORGANIZATION

### **Pattern: Feature-Named Folders**

Each feature gets dedicated folders in components, pages, services, hooks, store, and types:

```
Example: ATTENDANCE Feature Structure

src/
├── components/
│   └── attendance/
│       ├── attendance_teachers/
│       │   ├── AttendanceTeachersList.tsx
│       │   ├── AttendanceTeacherDetail.tsx
│       │   ├── AttendanceTeacherForm.tsx
│       │   ├── AttendanceTeacherStats.tsx
│       │   └── index.ts
│       │
│       ├── attendance_students/
│       │   ├── AttendanceStudentsList.tsx
│       │   ├── AttendanceStudentDetail.tsx
│       │   ├── AttendanceStudentForm.tsx
│       │   ├── AttendanceStudentStats.tsx
│       │   └── index.ts
│       │
│       ├── attendance_reports/
│       │   ├── AttendanceReportGenerator.tsx
│       │   ├── AttendanceReportFilter.tsx
│       │   ├── AttendanceReportTable.tsx
│       │   └── index.ts
│       │
│       ├── attendance_common/
│       │   ├── AttendanceStatusBadge.tsx
│       │   ├── AttendanceChart.tsx
│       │   ├── AttendanceCalendar.tsx
│       │   └── index.ts
│       │
│       └── index.ts (exports all)
│
├── pages/
│   └── attendance/
│       ├── attendance_teachers/
│       │   ├── TeacherAttendancePage.tsx
│       │   ├── TeacherAttendanceDetailPage.tsx
│       │   └── index.ts
│       │
│       ├── attendance_students/
│       │   ├── StudentAttendancePage.tsx
│       │   ├── StudentAttendanceDetailPage.tsx
│       │   └── index.ts
│       │
│       ├── attendance_reports/
│       │   ├── AttendanceReportPage.tsx
│       │   └── index.ts
│       │
│       └── index.ts
│
├── services/
│   └── attendance/
│       ├── attendance_teachers/
│       │   ├── teacherAttendance.service.ts
│       │   └── types.ts
│       │
│       ├── attendance_students/
│       │   ├── studentAttendance.service.ts
│       │   └── types.ts
│       │
│       ├── attendance_reports/
│       │   ├── attendanceReport.service.ts
│       │   └── types.ts
│       │
│       ├── attendance_common/
│       │   ├── common.service.ts
│       │   └── utils.ts
│       │
│       └── index.ts
│
├── hooks/
│   └── attendance/
│       ├── attendance_teachers/
│       │   ├── useTeacherAttendance.ts
│       │   ├── useTeacherAttendanceList.ts
│       │   └── index.ts
│       │
│       ├── attendance_students/
│       │   ├── useStudentAttendance.ts
│       │   ├── useStudentAttendanceList.ts
│       │   └── index.ts
│       │
│       ├── attendance_reports/
│       │   ├── useAttendanceReport.ts
│       │   └── index.ts
│       │
│       └── index.ts
│
├── store/
│   └── attendance/
│       ├── attendance_teachers/
│       │   └── teacherAttendanceStore.ts
│       │
│       ├── attendance_students/
│       │   └── studentAttendanceStore.ts
│       │
│       ├── attendance_reports/
│       │   └── attendanceReportStore.ts
│       │
│       └── index.ts
│
└── types/
    └── attendance/
        ├── attendance.types.ts
        ├── teacher.types.ts
        ├── student.types.ts
        ├── report.types.ts
        └── index.ts

```

---

### **Example: ADMISSIONS Feature Structure**

```
src/
├── components/
│   └── admissions/
│       ├── admission_form/
│       │   ├── AdmissionForm.tsx
│       │   ├── AdmissionStudentInfo.tsx
│       │   ├── AdmissionParentInfo.tsx
│       │   ├── AdmissionFeeDetails.tsx
│       │   ├── AdmissionFeeInstallments.tsx
│       │   └── index.ts
│       │
│       ├── admission_list/
│       │   ├── AdmissionListTable.tsx
│       │   ├── AdmissionListFilters.tsx
│       │   ├── AdmissionListSearch.tsx
│       │   └── index.ts
│       │
│       ├── admission_details/
│       │   ├── AdmissionDetailView.tsx
│       │   ├── AdmissionDetailEdit.tsx
│       │   └── index.ts
│       │
│       ├── admission_common/
│       │   ├── AdmissionStatusBadge.tsx
│       │   ├── AdmissionPrintPreview.tsx
│       │   └── index.ts
│       │
│       └── index.ts
│
├── pages/
│   └── admissions/
│       ├── admission_form/
│       │   ├── NewAdmissionPage.tsx
│       │   └── index.ts
│       │
│       ├── admission_list/
│       │   ├── AdmissionListPage.tsx
│       │   └── index.ts
│       │
│       ├── admission_details/
│       │   ├── AdmissionDetailPage.tsx
│       │   └── index.ts
│       │
│       └── index.ts
│
├── services/
│   └── admissions/
│       ├── admission_form/
│       │   ├── admissionForm.service.ts
│       │   └── types.ts
│       │
│       ├── admission_list/
│       │   ├── admissionList.service.ts
│       │   └── types.ts
│       │
│       ├── admission_details/
│       │   ├── admissionDetail.service.ts
│       │   └── types.ts
│       │
│       ├── admission_common/
│       │   ├── common.service.ts
│       │   └── utils.ts
│       │
│       └── index.ts
│
├── hooks/
│   └── admissions/
│       ├── admission_form/
│       │   ├── useAdmissionForm.ts
│       │   ├── useAdmissionFeeCalculation.ts
│       │   └── index.ts
│       │
│       ├── admission_list/
│       │   ├── useAdmissionList.ts
│       │   ├── useAdmissionFilters.ts
│       │   └── index.ts
│       │
│       ├── admission_details/
│       │   ├── useAdmissionDetail.ts
│       │   └── index.ts
│       │
│       └── index.ts
│
├── store/
│   └── admissions/
│       ├── admissionFormStore.ts
│       ├── admissionListStore.ts
│       ├── admissionDetailStore.ts
│       └── index.ts
│
└── types/
    └── admissions/
        ├── admission.types.ts
        ├── student.types.ts
        ├── parent.types.ts
        ├── fee.types.ts
        └── index.ts

```

---

## COMPLETE FEATURE MODULES LIST WITH FOLDER STRUCTURE

```
FOLDER STRUCTURE MAPPING:

src/
├── components/
│   ├── authentication/               [FEATURE: AUTH & LOGIN]
│   ├── dashboard/                    [FEATURE: DASHBOARD & KPIs]
│   ├── admissions/                   [FEATURE: ADMISSIONS]
│   │   ├── admission_form/
│   │   ├── admission_list/
│   │   ├── admission_details/
│   │   └── admission_common/
│   │
│   ├── academics/                    [FEATURE: COURSES & ACADEMICS]
│   │   ├── courses/
│   │   ├── subjects/
│   │   ├── topics/
│   │   ├── batches/
│   │   └── academics_common/
│   │
│   ├── enrollments/                  [FEATURE: ENROLLMENTS]
│   │   ├── enrollment_management/
│   │   ├── enrollment_list/
│   │   ├── enrollment_transfer/
│   │   └── enrollments_common/
│   │
│   ├── attendance/                   [FEATURE: ATTENDANCE]
│   │   ├── attendance_teachers/
│   │   ├── attendance_students/
│   │   ├── attendance_reports/
│   │   └── attendance_common/
│   │
│   ├── assignments/                  [FEATURE: ASSIGNMENTS & GRADING]
│   │   ├── assignment_creation/
│   │   ├── assignment_submission/
│   │   ├── assignment_grading/
│   │   └── assignments_common/
│   │
│   ├── timetable/                    [FEATURE: TIMETABLE & SCHEDULING]
│   │   ├── timetable_view/
│   │   ├── timetable_create/
│   │   ├── timetable_bulk/
│   │   └── timetable_common/
│   │
│   ├── results/                      [FEATURE: RESULTS & GRADING]
│   │   ├── results_board/
│   │   ├── results_competitive/
│   │   ├── results_marks_entry/
│   │   └── results_common/
│   │
│   ├── payments/                     [FEATURE: PAYMENTS & FEES]
│   │   ├── payment_search/
│   │   ├── payment_transactions/
│   │   ├── payment_outstanding/
│   │   ├── payment_gateway/
│   │   └── payments_common/
│   │
│   ├── hr/                           [FEATURE: HR & EMPLOYEES]
│   │   ├── employees/
│   │   ├── leave_management/
│   │   ├── salary_structures/
│   │   ├── payslips/
│   │   ├── working_hours/
│   │   └── hr_common/
│   │
│   ├── communication/                [FEATURE: COMMUNICATION]
│   │   ├── doubts/
│   │   ├── notifications/
│   │   ├── feedback/
│   │   ├── grievances/
│   │   ├── ptm_requests/
│   │   ├── support_tickets/
│   │   └── communication_common/
│   │
│   ├── administration/               [FEATURE: ADMIN & SETTINGS]
│   │   ├── users/
│   │   ├── roles_permissions/
│   │   ├── branches/
│   │   ├── inventory/
│   │   └── admin_common/
│   │
│   ├── learning/                     [FEATURE: LMS & LEARNING]
│   │   ├── video_content/
│   │   ├── topics_content/
│   │   ├── learning_progress/
│   │   └── learning_common/
│   │
│   ├── documents/                    [FEATURE: DOCUMENT MANAGEMENT]
│   │   ├── document_upload/
│   │   ├── certificates/
│   │   ├── transcripts/
│   │   └── documents_common/
│   │
│   ├── reports/                      [FEATURE: ADVANCED REPORTING]
│   │   ├── custom_reports/
│   │   ├── report_builder/
│   │   ├── report_export/
│   │   └── reports_common/
│   │
│   ├── shared/                       [SHARED COMPONENTS]
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── modals/
│   │   ├── buttons/
│   │   └── common/
│   │
│   └── index.ts                      [EXPORTS ALL FEATURE COMPONENTS]
│
├── pages/                            [SAME FEATURE STRUCTURE AS COMPONENTS]
│
├── services/                         [SAME FEATURE STRUCTURE AS COMPONENTS]
│
├── hooks/                            [SAME FEATURE STRUCTURE AS COMPONENTS]
│
├── store/                            [SAME FEATURE STRUCTURE AS COMPONENTS]
│
├── types/                            [SAME FEATURE STRUCTURE AS COMPONENTS]
│
└── utils/
    ├── common/                       [SHARED UTILITIES]
    │   ├── formatters.ts
    │   ├── validators.ts
    │   ├── calculations.ts
    │   └── helpers.ts
    │
    └── constants/
        ├── roles.ts
        ├── permissions.ts
        └── status_types.ts
```

---

## FILE NAMING CONVENTION

### **Pattern: `[feature]_[subfeature]_[componentType]`**

```
Components (src/components/[feature]/[subfeature]/)
├── [Feature][SubFeature][Type].tsx
├── [Feature][SubFeature]Modal.tsx
├── [Feature][SubFeature]Form.tsx
├── [Feature][SubFeature]Card.tsx
├── [Feature][SubFeature]List.tsx
├── [Feature][SubFeature]Table.tsx
├── [Feature][SubFeature]Filter.tsx
├── [Feature][SubFeature]Chart.tsx
└── index.ts

Examples:
├── components/attendance/attendance_students/
│   ├── StudentAttendanceMarker.tsx          # Mark attendance
│   ├── StudentAttendanceList.tsx            # List view
│   ├── StudentAttendanceReport.tsx          # Report view
│   ├── StudentAttendanceModal.tsx           # Modal
│   └── index.ts
│
├── components/admissions/admission_form/
│   ├── AdmissionForm.tsx                    # Main form
│   ├── AdmissionStudentInfo.tsx             # Student section
│   ├── AdmissionParentInfo.tsx              # Parent section
│   ├── AdmissionFeeDetails.tsx              # Fee section
│   ├── AdmissionInstallments.tsx            # Installments section
│   └── index.ts
│
└── components/payments/payment_gateway/
    ├── PaymentGatewayForm.tsx               # Payment form
    ├── PaymentGatewaySuccess.tsx            # Success page
    ├── PaymentGatewayError.tsx              # Error page
    ├── PaymentGatewayReceipt.tsx            # Receipt view
    └── index.ts

Pages (src/pages/[feature]/[subfeature]/)
├── [Feature][SubFeature]Page.tsx
├── [Feature][SubFeature]DetailPage.tsx
├── [Feature][SubFeature]CreatePage.tsx
├── [Feature][SubFeature]EditPage.tsx
└── index.ts

Examples:
├── pages/attendance/attendance_students/
│   ├── StudentAttendancePage.tsx            # List page
│   ├── StudentAttendanceMarkPage.tsx        # Mark attendance page
│   └── index.ts
│
└── pages/admissions/admission_form/
    ├── NewAdmissionPage.tsx                 # Create page
    ├── AdmissionEditPage.tsx                # Edit page
    └── index.ts

Services (src/services/[feature]/[subfeature]/)
├── [feature][subfeature].service.ts
├── [feature][subfeature].queries.ts
├── [feature][subfeature].mutations.ts
├── types.ts
└── index.ts

Examples:
├── services/attendance/attendance_students/
│   ├── studentAttendance.service.ts         # All API calls
│   ├── studentAttendance.queries.ts         # Query hooks (TanStack)
│   ├── studentAttendance.mutations.ts       # Mutation hooks (TanStack)
│   ├── types.ts                             # TS types
│   └── index.ts
│
└── services/payments/payment_gateway/
    ├── paymentGateway.service.ts
    ├── paymentGateway.queries.ts
    ├── paymentGateway.mutations.ts
    ├── types.ts
    └── index.ts

Hooks (src/hooks/[feature]/[subfeature]/)
├── use[Feature][SubFeature].ts
├── use[Feature][SubFeature]List.ts
├── use[Feature][SubFeature]Form.ts
└── index.ts

Examples:
├── hooks/attendance/attendance_students/
│   ├── useStudentAttendance.ts              # Main hook
│   ├── useStudentAttendanceList.ts          # List logic
│   ├── useStudentAttendanceMarker.ts        # Mark attendance logic
│   └── index.ts
│
└── hooks/admissions/admission_form/
    ├── useAdmissionForm.ts                  # Form logic
    ├── useAdmissionFeeCalculation.ts        # Fee calculation
    ├── useAdmissionValidation.ts            # Validation
    └── index.ts

Store (src/store/[feature]/[subfeature]/)
├── [feature][subfeature].store.ts
└── index.ts

Examples:
├── store/attendance/attendance_students/
│   ├── studentAttendanceStore.ts            # Zustand store
│   └── index.ts
│
└── store/admissions/admission_form/
    ├── admissionFormStore.ts                # Form state
    └── index.ts

Types (src/types/[feature]/)
├── [feature].types.ts
├── [subfeature].types.ts
└── index.ts

Examples:
├── types/attendance/
│   ├── attendance.types.ts                  # Base types
│   ├── teacher.types.ts                     # Teacher-specific
│   ├── student.types.ts                     # Student-specific
│   ├── report.types.ts                      # Report types
│   └── index.ts
│
└── types/admissions/
    ├── admission.types.ts                   # Base types
    ├── student.types.ts
    ├── parent.types.ts
    ├── fee.types.ts
    ├── installment.types.ts
    └── index.ts
```

---

## DATABASE SCHEMA ORGANIZATION

```
database/
├── migrations/                              # SQL migration files
│   ├── core/                                # CORE (Always required)
│   │   ├── 001_core_organizations.sql
│   │   ├── 002_core_auth_profiles.sql
│   │   ├── 003_core_roles_permissions.sql
│   │   └── 004_core_branches.sql
│   │
│   ├── academic/                            # ACADEMIC MODULE
│   │   ├── 010_academic_courses.sql
│   │   ├── 011_academic_subjects.sql
│   │   ├── 012_academic_topics.sql
│   │   ├── 013_academic_batches.sql
│   │   ├── 014_academic_enrollments.sql
│   │   └── 015_academic_timetable.sql
│   │
│   ├── admissions/                          # ADMISSIONS MODULE
│   │   ├── 020_admissions_students.sql
│   │   ├── 021_admissions_fees.sql
│   │   ├── 022_admissions_installments.sql
│   │   └── 023_admissions_status.sql
│   │
│   ├── attendance/                          # ATTENDANCE MODULE
│   │   ├── 030_attendance_records.sql
│   │   ├── 031_attendance_schedule.sql
│   │   └── 032_attendance_reports.sql
│   │
│   ├── assignments/                         # ASSIGNMENTS MODULE
│   │   ├── 040_assignments_templates.sql
│   │   ├── 041_assignments_submissions.sql
│   │   ├── 042_assignments_grading.sql
│   │   └── 043_assignments_questions.sql
│   │
│   ├── payments/                            # PAYMENTS MODULE
│   │   ├── 050_payments_transactions.sql
│   │   ├── 051_payments_gateway.sql
│   │   ├── 052_payments_refunds.sql
│   │   └── 053_payments_receipts.sql
│   │
│   ├── hr/                                  # HR MODULE
│   │   ├── 060_hr_employees.sql
│   │   ├── 061_hr_leave.sql
│   │   ├── 062_hr_salary.sql
│   │   ├── 063_hr_payslips.sql
│   │   ├── 064_hr_working_hours.sql
│   │   └── 065_hr_attendance.sql
│   │
│   ├── communication/                       # COMMUNICATION MODULE
│   │   ├── 070_communication_doubts.sql
│   │   ├── 071_communication_notifications.sql
│   │   ├── 072_communication_feedback.sql
│   │   ├── 073_communication_grievances.sql
│   │   ├── 074_communication_ptm.sql
│   │   └── 075_communication_tickets.sql
│   │
│   ├── learning/                            # LEARNING MODULE (LMS)
│   │   ├── 080_learning_videos.sql
│   │   ├── 081_learning_progress.sql
│   │   ├── 082_learning_recommendations.sql
│   │   └── 083_learning_assessments.sql
│   │
│   ├── documents/                           # DOCUMENT MODULE
│   │   ├── 090_documents_student.sql
│   │   ├── 091_documents_certificates.sql
│   │   ├── 092_documents_transcripts.sql
│   │   └── 093_documents_tracking.sql
│   │
│   ├── reports/                             # REPORTS MODULE
│   │   ├── 100_reports_templates.sql
│   │   ├── 101_reports_scheduled.sql
│   │   └── 102_reports_exports.sql
│   │
│   ├── inventory/                           # INVENTORY MODULE
│   │   ├── 110_inventory_items.sql
│   │   ├── 111_inventory_ledger.sql
│   │   ├── 112_inventory_transfers.sql
│   │   └── 113_inventory_cash.sql
│   │
│   ├── audit/                               # AUDIT & COMPLIANCE
│   │   ├── 120_audit_logs.sql
│   │   ├── 121_audit_access.sql
│   │   ├── 122_audit_financial.sql
│   │   └── 123_audit_compliance.sql
│   │
│   ├── shared/                              # SHARED/UTILITY TABLES
│   │   ├── 999_feature_flags.sql
│   │   ├── 999_custom_fields.sql
│   │   ├── 999_settings.sql
│   │   └── 999_utilities.sql
│   │
│   └── README.md                            # Migration guide
│
├── functions/                               # PL/pgSQL Database Functions
│   ├── core/
│   │   ├── fn_check_permission.sql
│   │   ├── fn_audit_log.sql
│   │   └── fn_create_user_profile.sql
│   │
│   ├── academic/
│   │   ├── fn_enroll_student.sql
│   │   ├── fn_calculate_attendance.sql
│   │   └── fn_batch_performance.sql
│   │
│   ├── payments/
│   │   ├── fn_calculate_fee.sql
│   │   ├── fn_calculate_late_fee.sql
│   │   ├── fn_process_payment.sql
│   │   └── fn_generate_receipt.sql
│   │
│   ├── hr/
│   │   ├── fn_calculate_salary.sql
│   │   ├── fn_approve_leave.sql
│   │   ├── fn_process_payroll.sql
│   │   └── fn_calculate_attendance_pct.sql
│   │
│   └── triggers/
│       ├── trg_on_payment_received.sql
│       ├── trg_on_enrollment_created.sql
│       ├── trg_on_fee_modified.sql
│       ├── trg_on_user_created.sql
│       └── trg_audit_all_changes.sql
│
├── seeds/                                   # TEST DATA
│   ├── seed_organizations.sql
│   ├── seed_users.sql
│   ├── seed_courses.sql
│   ├── seed_batches.sql
│   ├── seed_students.sql
│   ├── seed_sample_data.sql
│   └── seed_cleanup.sql
│
└── README.md                                # Database setup instructions

```

---

## DOCUMENTATION ORGANIZATION

```
docs/
├── README.md                                # Project overview
│
├── SETUP.md                                 # Development setup (Vite, React, Supabase)
├── ARCHITECTURE.md                          # System architecture & data flow
├── DATABASE.md                              # Database schema documentation
├── API.md                                   # Supabase API documentation
├── DEPLOYMENT.md                            # Deployment guide (Vercel, Supabase)
├── TROUBLESHOOTING.md                       # Common issues & solutions
│
├── FEATURE_MODULES/                         # Per-feature documentation
│   │
│   ├── CORE/
│   │   ├── authentication.md                # Auth & login system
│   │   ├── organization_setup.md            # Org management
│   │   ├── users_roles.md                   # User & role management
│   │   └── dashboard.md                     # Dashboard & KPIs
│   │
│   ├── ACADEMICS/
│   │   ├── courses_setup.md                 # Course management
│   │   ├── batches.md                       # Batch management
│   │   ├── timetable.md                     # Timetable & scheduling
│   │   ├── topics_content.md                # Content management
│   │   ├── attendance.md                    # Attendance system
│   │   ├── assignments.md                   # Assignments & grading
│   │   └── results.md                       # Results & marks
│   │
│   ├── STUDENT_MANAGEMENT/
│   │   ├── admissions.md                    # Admission workflow
│   │   ├── enrollments.md                   # Enrollment management
│   │   ├── student_portal.md                # Student portal features
│   │   └── document_management.md           # Document upload & certs
│   │
│   ├── FINANCE/
│   │   ├── fees_management.md               # Fee structure & calculation
│   │   ├── payments.md                      # Payment processing
│   │   ├── payment_gateway.md               # Razorpay integration
│   │   ├── invoices_receipts.md             # Invoice generation
│   │   └── financial_reports.md             # Financial reports
│   │
│   ├── HR/
│   │   ├── employee_management.md           # Employee management
│   │   ├── leave_management.md              # Leave system
│   │   ├── salary_structures.md             # Salary setup
│   │   ├── payroll.md                       # Payroll processing
│   │   └── working_hours.md                 # Working hours management
│   │
│   ├── COMMUNICATION/
│   │   ├── doubts.md                        # Q&A system
│   │   ├── notifications.md                 # Notification system
│   │   ├── feedback.md                      # Feedback forms
│   │   ├── grievances.md                    # Grievance management
│   │   ├── ptm.md                           # PTM requests
│   │   ├── support_tickets.md               # Support ticketing
│   │   └── email_sms.md                     # Email & SMS integration
│   │
│   ├── LEARNING/
│   │   ├── lms_overview.md                  # LMS platform
│   │   ├── video_content.md                 # Video hosting & streaming
│   │   ├── learning_progress.md             # Progress tracking
│   │   ├── assessments.md                   # Quizzes & assessments
│   │   └── adaptive_learning.md             # Recommended paths
│   │
│   ├── REPORTING/
│   │   ├── custom_reports.md                # Report builder
│   │   ├── analytics.md                     # Analytics & insights
│   │   ├── performance_reports.md           # Performance analytics
│   │   └── financial_analytics.md           # Financial analytics
│   │
│   └── ADMIN/
│       ├── branches.md                      # Branch management
│       ├── inventory.md                     # Inventory system
│       ├── audit_logging.md                 # Audit trail
│       ├── feature_flags.md                 # Feature toggles
│       ├── custom_fields.md                 # Custom field management
│       └── system_settings.md               # System configuration
│
├── GUIDES/
│   ├── QUICK_START.md                       # 5-minute getting started
│   ├── HOW_TO_CREATE_NEW_FEATURE.md          # Adding new feature (template copy)
│   ├── HOW_TO_DISABLE_FEATURE.md             # Disabling/removing feature
│   ├── HOW_TO_CUSTOMIZE.md                   # Customization guide
│   ├── TESTING_GUIDE.md                      # Testing strategy
│   ├── PERFORMANCE_OPTIMIZATION.md           # Performance tips
│   └── SECURITY_CHECKLIST.md                 # Security best practices
│
└── API_REFERENCE/
    ├── authentication.md                    # Auth endpoints
    ├── students.md                          # Student endpoints
    ├── batches.md                           # Batch endpoints
    ├── attendance.md                        # Attendance endpoints
    ├── payments.md                          # Payment endpoints
    ├── assignments.md                       # Assignment endpoints
    └── ...                                  # Other API endpoints

```

---

## FEATURE MODULE TEMPLATE (FOR COPYING)

When creating a new feature or copying an existing one:

```
Feature: [FEATURE_NAME]
Status: OPTIONAL/CORE
Module Type: REMOVABLE/NON-REMOVABLE

📁 FOLDER STRUCTURE TO COPY:

src/
├── components/[feature_folder]/
│   ├── [subfolder1]/
│   │   ├── [Component1].tsx
│   │   ├── [Component2].tsx
│   │   └── index.ts
│   ├── [subfolder2]/
│   │   ├── [Component3].tsx
│   │   └── index.ts
│   └── index.ts
│
├── pages/[feature_folder]/
│   ├── [subfolder1]/
│   │   ├── [Page1].tsx
│   │   └── index.ts
│   └── index.ts
│
├── services/[feature_folder]/
│   ├── [subfolder1]/
│   │   ├── [feature].service.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts
│
├── hooks/[feature_folder]/
│   ├── [subfolder1]/
│   │   ├── use[Feature].ts
│   │   └── index.ts
│   └── index.ts
│
├── store/[feature_folder]/
│   ├── [feature].store.ts
│   └── index.ts
│
└── types/[feature_folder]/
    ├── [feature].types.ts
    └── index.ts

database/migrations/
├── [batch_number]_[feature_tables1].sql
├── [batch_number]_[feature_tables2].sql
└── README.md (with feature-specific instructions)

docs/FEATURE_MODULES/
└── [feature_name].md
    ├── Overview
    ├── Setup Instructions
    ├── Database Tables
    ├── API Endpoints
    ├── Component Structure
    ├── Service/Hook Usage
    ├── Configuration
    └── Customization Options
```

---

## MIGRATION FILE NAMING & ORGANIZATION

### **Migration Numbering System**

```
Format: [batch_number]_[module]_[description].sql

Batch Numbering:
001-009: CORE (Authentication, Organization, Users, Roles)
010-019: ACADEMICS (Courses, Subjects, Topics, Batches, Timetable)
020-029: ADMISSIONS (Students, Fees, Installments)
030-039: ATTENDANCE (Records, Schedule, Reports)
040-049: ASSIGNMENTS (Templates, Submissions, Grading)
050-059: PAYMENTS (Transactions, Gateway, Refunds)
060-069: HR (Employees, Leave, Salary, Payroll)
070-079: COMMUNICATION (Doubts, Notifications, Feedback, Grievances, PTM, Tickets)
080-089: LEARNING (Videos, Progress, Assessments)
090-099: DOCUMENTS (Student docs, Certificates, Transcripts)
100-109: REPORTS (Templates, Scheduled, Exports)
110-119: INVENTORY (Items, Ledger, Transfers, Cash)
120-129: AUDIT & COMPLIANCE (Logs, Access, Financial, Compliance)
999:     SHARED & UTILITIES (Feature flags, Custom fields, Settings)

Examples:
├── 001_core_organizations.sql           ✅ CORE
├── 002_core_auth_profiles.sql           ✅ CORE
├── 003_core_roles_permissions.sql       ✅ CORE
├── 010_academics_courses.sql            ✅ ACADEMICS
├── 011_academics_subjects.sql           ✅ ACADEMICS
├── 020_admissions_students.sql          ✅ ADMISSIONS
├── 030_attendance_records.sql           ✅ ATTENDANCE
├── 050_payments_transactions.sql        ✅ PAYMENTS
├── 070_communication_doubts.sql         ✅ COMMUNICATION
├── 080_learning_videos.sql              ✅ LEARNING
├── 090_documents_student.sql            ✅ DOCUMENTS
├── 100_reports_templates.sql            ✅ REPORTS
├── 110_inventory_items.sql              ✅ INVENTORY
├── 120_audit_logs.sql                   ✅ AUDIT
└── 999_shared_feature_flags.sql         🔄 SHARED

TEMPORARY vs REUSABLE:

TEMPORARY (For Testing/Development):
├── migrations/temp/
│   ├── test_001_sample_data.sql
│   ├── dev_001_debug_tables.sql
│   └── README.md (Mark as TEMPORARY - DELETE BEFORE PRODUCTION)

REUSABLE (For Production):
├── migrations/
│   ├── [batch]_[feature]_[desc].sql (All production migrations)
│   └── README.md (Production migration guide)

Configuration:
├── Feature enabled/disabled via feature_flags table
├── Organization-specific customization via settings table
├── Custom fields added to custom_fields table
└── All migrations run only once (idempotent)
```

---

## GIT ORGANIZATION & BRANCHING STRATEGY

```
Branch Structure:

main
├── Production code (stable, tested)
└── Protected (requires PR reviews)

develop
├── Integration branch for features
└── Base for feature branches

feature/[feature-name]
├── feature/attendance-management
├── feature/admissions-workflow
├── feature/payment-gateway
└── Single feature per branch

bugfix/[bug-name]
├── bugfix/attendance-calculation-error
└── For fixing production bugs

docs/[doc-name]
├── docs/api-documentation
└── For documentation updates

Commit Message Format:
[FEATURE|FIX|DOCS|CHORE] [module]: Description

Examples:
├── [FEATURE] attendance: Add student attendance marking
├── [FIX] payments: Fix late fee calculation
├── [DOCS] admissions: Update admission process guide
├── [CHORE] deps: Update React to 18.3
└── [FEATURE] learning: Add video streaming support
```

---

## PROJECT INITIALIZATION CHECKLIST

When starting a new EduMunch project for a client:

### **Step 1: Feature Selection**
- [ ] Determine which features client needs
- [ ] Identify CORE features (always included)
- [ ] Identify OPTIONAL features (to be copied/included)
- [ ] Mark DISABLED features (to be removed/skipped)

### **Step 2: Folder Structure Setup**
- [ ] Create src/ with standard structure
- [ ] Copy components/ folders for selected features
- [ ] Copy pages/ folders for selected features
- [ ] Copy services/ folders for selected features
- [ ] Copy hooks/ folders for selected features
- [ ] Copy store/ folders for selected features
- [ ] Copy types/ folders for selected features

### **Step 3: Database Setup**
- [ ] Create Supabase project
- [ ] Run CORE migrations (001-009)
- [ ] Run selected feature migrations
- [ ] Skip migrations for disabled features
- [ ] Set up feature_flags for enabled features
- [ ] Create RLS policies for security

### **Step 4: Configuration**
- [ ] Copy .env.example to .env.local
- [ ] Configure Supabase credentials
- [ ] Configure Razorpay keys
- [ ] Configure SendGrid keys
- [ ] Configure Twilio keys (if needed)
- [ ] Update feature_flags in database

### **Step 5: Documentation**
- [ ] Copy relevant docs/FEATURE_MODULES/ files
- [ ] Create docs/CUSTOMIZATION.md for client-specific changes
- [ ] Document which features are enabled
- [ ] Document custom configuration
- [ ] Update README.md for project

### **Step 6: Testing**
- [ ] Run seed data for enabled features
- [ ] Test all enabled feature flows
- [ ] Verify disabled features don't appear in UI
- [ ] Check permissions for different roles
- [ ] Test payment gateway (test mode)
- [ ] Verify email/SMS integration

### **Step 7: Deployment**
- [ ] Deploy to Vercel
- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Run migrations on production DB
- [ ] Set up monitoring (Sentry, Analytics)
- [ ] Go live!

---

**Last Updated:** December 13, 2025  
**Structure:** ✅ MODULAR & TEMPLATE-BASED | FEATURE FOLDERS ORGANIZED  
**Documentation:** ✅ ORGANIZED BY FEATURE MODULE & PERMANENT vs TEMPORARY  
**Ready for:** SQL Schema & Component Development

### **Frontend (Web Apps Only - React)**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (for fast development and optimized builds)
- **Styling:** Tailwind CSS + Shared CN (Component Naming Convention)
- **UI Components:** Shadcn/ui (headless, composable components)
- **State Management:** Zustand or TanStack Query
- **Real-time:** Supabase Realtime with WebSockets
- **Charts & Analytics:** Recharts or Chart.js
- **File Handling:** React-Dropzone for uploads
- **PDF Generation:** pdfkit or react-pdf
- **Authentication:** Supabase Auth with Custom UI
- **HTTP Client:** Axios or Fetch API
- **Routing:** React Router v6
- **Responsiveness:** Mobile-first design (but web-only, not app)
- **Form Management:** React Hook Form + Zod validation

### **Backend (Supabase Only - No Node.js)**
- **Database:** Supabase (PostgreSQL)
- **Auth Service:** Supabase Auth (Email/Password, SSO, 2FA)
- **File Storage:** Supabase Storage (for documents, certificates, videos, PDFs)
- **Real-time Database:** Supabase Realtime (WebSocket-based)
- **API:** Supabase AutoAPI (REST & GraphQL endpoints auto-generated from schema)
- **Edge Functions:** Supabase Edge Functions (Deno-based, for custom logic if needed)
- **Business Logic:** Database Functions (PL/pgSQL) for complex operations
- **Scheduled Tasks:** Supabase Cron Jobs (for automated reminders, backups, etc.)

### **External Integrations**
- **Payment Gateway:** Razorpay (primary for Indian market)
- **SMS Service:** Twilio or AWS SNS
- **Email Service:** SendGrid or AWS SES
- **Video Streaming:** Supabase Storage + HLS.js (client-side streaming)
- **File Storage:** Only Supabase Storage (no Cloudinary)

### **DevOps & Deployment**
- **Frontend Hosting:** Vercel, Netlify, or AWS Amplify
- **Database & Backend:** Supabase Cloud (PostgreSQL, Auth, Storage)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (error tracking)
- **Performance Monitoring:** Web Vitals, Lighthouse
- **Backup Strategy:** Supabase automated backups + manual exports

### **Security**
- **HTTPS:** Automatic (Vercel/Netlify)
- **Database Security:** Supabase RLS (Row Level Security) on all tables
- **Authentication:** Supabase JWT tokens
- **Secrets Management:** Environment variables in .env.local
- **Storage Security:** Supabase Storage policies (public/private buckets)
- **Two-Factor Auth:** Supabase built-in 2FA support

---

**Last Updated:** December 13, 2025  
**Total Features Documented:** 100+ complete modules and sub-features with enhancements  
**Batch Status:** ✅ COMPLETE - All gaps identified and addressed  
**Architecture:** ✅ FINALIZED - Web-only, User Profiles in DB, Custom Roles Support  
**Ready for:** SQL Schema Generation

