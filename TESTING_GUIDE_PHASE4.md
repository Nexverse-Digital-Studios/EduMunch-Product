# Phase 4 Testing & Verification Guide

## Unit Testing Checklist

### Service Layer Testing

#### Board Exam Service (`boardExamService.ts`)
- [ ] getBoardExams() - retrieves all exams
- [ ] getBoardExamById() - gets single exam
- [ ] createBoardExam() - creates new exam
- [ ] updateBoardExam() - updates exam details
- [ ] deleteBoardExam() - removes exam
- [ ] getExamResults() - retrieves results
- [ ] addExamResult() - adds result with auto-calculated percentage
- [ ] getExamStats() - calculates statistics

**Test Cases:**
```
Test: Create exam without name → should return error
Test: Get exam from different org → should return error (RLS)
Test: Add result with 85/100 marks → should calculate 85% and grade B
Test: Get stats for 10 students → should return accurate average
```

#### Support Ticket Service (`supportTicketService.ts`)
- [ ] getSupportTickets() - with status filter
- [ ] getTicketsByStatus() - filters by OPEN/IN_PROGRESS/RESOLVED
- [ ] createTicket() - creates with current user as creator
- [ ] updateTicket() - updates ticket fields
- [ ] assignTicket() - assigns and sets status to IN_PROGRESS
- [ ] updateTicketStatus() - changes status
- [ ] getTicketStats() - returns count by status
- [ ] searchTickets() - searches title and description

**Test Cases:**
```
Test: Create ticket without org → should return error
Test: Search for "payment" → should find matching tickets
Test: Assign to user A then user B → should update correctly
Test: Get stats with 5 open, 3 progress, 2 resolved → should count correctly
```

#### Working Hours Service (`workingHourService.ts`)
- [ ] getWorkingHours() - for specific employee
- [ ] getAllWorkingHours() - for organization
- [ ] addWorkingHour() - creates single entry
- [ ] updateWorkingHour() - updates time
- [ ] deleteWorkingHour() - removes entry
- [ ] setWeekOff() - marks day as week off
- [ ] clearWeekOff() - removes week off
- [ ] bulkSetWorkingHours() - replaces all for employee

**Test Cases:**
```
Test: Set working hours 9 AM to 5 PM Monday → should save correctly
Test: Bulk set all 7 days → should replace existing
Test: Mark Friday as week off → is_week_off should be true
```

#### Salary Structure Service (`salaryStructureService.ts`)
- [ ] getSalaryStructures() - all structures in org
- [ ] getSalaryStructureDetails() - with components
- [ ] createSalaryStructure() - creates structure
- [ ] addEarning() - adds earning component
- [ ] addDeduction() - adds deduction component
- [ ] updateEarning/Deduction() - updates amounts
- [ ] calculateTotalEarnings() - sums all earnings
- [ ] calculateTotalDeductions() - sums all deductions

**Test Cases:**
```
Test: Create structure with 50000 base → should save
Test: Add HRA 5000, DA 2000 → total earnings = 7000
Test: Add TDS 5000, Insurance 1000 → total deductions = 6000
Test: Calculate net = base + earnings - deductions = 51000
```

#### Topic Service (`topicService.ts`)
- [ ] getTopicsBySubject() - parent topics only
- [ ] getSubtopics() - children of parent
- [ ] getTopicById() - single topic
- [ ] createTopic() - with optional parent
- [ ] updateTopic() - modifies topic
- [ ] deleteTopic() - cascade deletes subtopics
- [ ] addTopicContent() - attaches resource
- [ ] getCompleteHierarchy() - tree structure

**Test Cases:**
```
Test: Create topic "Algebra" under Math → should link to Math
Test: Create subtopic "Quadratic Equations" under Algebra → parent set correctly
Test: Delete Algebra → all subtopics should delete
Test: Get hierarchy → should return tree with nesting
```

#### Timetable Service (`timetableService.ts`)
- [ ] getTimetableByBatch() - latest for batch
- [ ] getAllTimetables() - organization level
- [ ] createTimetable() - with week date
- [ ] getTimetableSlots() - for timetable
- [ ] addSlot() - creates slot
- [ ] updateSlot() - modifies slot
- [ ] bulkCreateSlots() - multiple slots
- [ ] getTimetableComplete() - with slots

**Test Cases:**
```
Test: Create timetable for Class 10-A → batch_id should match
Test: Add slot Monday 9-10 AM for Math → should store correctly
Test: Bulk create 30 slots → all should insert
Test: Get complete → should include all slots
```

## Integration Testing

### End-to-End User Workflows

#### Workflow 1: Board Exam Creation & Results Entry
1. Admin navigates to `/admin/academics/results`
2. Clicks "New Exam"
3. Fills form: Name="Midterm", Type="Board", MaxMarks=100, Date=2024-01-15
4. Clicks Create
5. Exam appears in list
6. Clicks Marks Entry tab
7. Enters marks for 5 students
8. Marks saved and statistics display

**Expected Outcome:**
- Exam visible in table
- Marks saved to exam_results
- Statistics calculated correctly

#### Workflow 2: Support Ticket Creation & Resolution
1. Staff member navigates to `/admin/communications/support`
2. Sees stats: Open=3, In Progress=4, Resolved=1
3. Clicks "New Ticket"
4. Fills: Title="Attendance Issue", Description="Student absent without leave", Type="Attendance"
5. Submits ticket
6. Ticket appears in OPEN tab
7. Admin assigns to staff member
8. Status changes to IN_PROGRESS
9. Admin marks as RESOLVED
10. Ticket moves to RESOLVED tab

**Expected Outcome:**
- New ticket count increases
- Status transitions work
- Statistics update in real-time

#### Workflow 3: Salary Structure Creation
1. HR admin navigates to `/admin/hr/salary`
2. Clicks "New Structure"
3. Name="Senior Teacher", Base=50000
4. Adds earnings: HRA=5000, DA=3000, Allowance=2000
5. Adds deductions: TDS=6000, Insurance=500
6. Saves structure
7. Card shows structure with summary

**Expected Outcome:**
- Structure saved with components
- Earnings total: 10000
- Deductions total: 6500
- Net: 50000 + 10000 - 6500 = 53500

#### Workflow 4: Topic Hierarchy Creation
1. Teacher navigates to `/admin/academics/topics`
2. Selects subject "Physics"
3. Creates topic "Mechanics" (topic_number=1)
4. Creates subtopic "Newton's Laws" (parent=Mechanics)
5. Adds content "Chapter 1 PDF"
6. Creates another subtopic "Kinematics"
7. Adds content "Kinematics Video"
8. Views hierarchy tree

**Expected Outcome:**
- Tree shows Mechanics with 2 subtopics
- Each subtopic shows content count
- Can expand/collapse topics

#### Workflow 5: Timetable Configuration
1. Admin navigates to `/admin/academics/timetables`
2. Selects batch "Class 10-A"
3. New timetable created for week of 2024-01-15
4. Fills grid:
   - Monday 9-10 AM: Mathematics
   - Tuesday 9-10 AM: English
   - Wednesday 9-10 AM: Physics
   - etc.
5. Saves timetable
6. Grid displays with color-coded subjects

**Expected Outcome:**
- 30 slots created (6 days × 5 hours)
- Each slot shows assigned subject
- Can edit/delete individual slots

#### Workflow 6: Working Hours Configuration
1. HR admin navigates to `/admin/hr/working-hours`
2. Selects employee "John Doe"
3. Configures:
   - Monday-Friday: 9 AM - 5 PM
   - Saturday: Week Off
   - Sunday: Week Off
4. Saves configuration
5. Loads another employee, sees different hours

**Expected Outcome:**
- Hours saved for John Doe
- Saturday/Sunday marked as week off
- Switch to different employee shows their schedule

## UI/UX Testing

### Visual Regression Testing
- [ ] Board Exams page matches VRaZ design
- [ ] Support Tickets tabs styled correctly
- [ ] Working Hours form displays properly
- [ ] Salary Structures cards render properly
- [ ] Topics tree indentation correct
- [ ] Timetables grid aligned properly

### Responsive Design Testing
Test on viewports:
- [ ] 1920px (Desktop)
- [ ] 1366px (Laptop)
- [ ] 768px (Tablet)
- [ ] 375px (Mobile)

### Interaction Testing
- [ ] Buttons have hover states
- [ ] Forms show validation errors
- [ ] Modals close on backdrop click
- [ ] Search filters update in real-time
- [ ] Tab switching works smoothly
- [ ] Pagination/scrolling works (if applicable)

## Security Testing

### RLS Policy Testing
- [ ] User cannot see data from other orgs
  ```
  Test: Login as user in Org A, query Org B data → should be empty
  ```

- [ ] Users can only modify their org data
  ```
  Test: Try to update exam from different org → should fail
  ```

- [ ] Anonymous users cannot access endpoints
  ```
  Test: Make request without auth token → should get 401
  ```

### Data Isolation Testing
- [ ] Create tickets in Org A, verify hidden from Org B
- [ ] Create exams in Org A, verify hidden from Org B
- [ ] Create structures in Org A, verify hidden from Org B

### Input Validation Testing
- [ ] Empty fields rejected
  ```
  Test: Submit exam without name → error shown
  ```
- [ ] XSS attempts sanitized
  ```
  Test: Enter <script>alert('xss')</script> → should be escaped
  ```
- [ ] SQL injection attempts blocked
  ```
  Test: Enter '; DROP TABLE -- in search → should be safe
  ```

## Performance Testing

### Load Testing
- [ ] Page loads in <2 seconds
- [ ] Search returns results in <500ms
- [ ] Bulk operations (30 slots) complete in <2 seconds
- [ ] Statistics calculations complete in <1 second

### Database Performance
- [ ] Queries without N+1 problems
- [ ] Indexes are being used
- [ ] No missing indexes

**To Check:**
1. Open Supabase console
2. Go to Logs → Slow Queries
3. Verify no queries >1000ms

### Memory Testing
- [ ] No memory leaks on page reload
- [ ] React DevTools: Component unmounts properly
- [ ] Network tab: No duplicate requests

## Accessibility Testing

### WCAG 2.1 Level A Compliance
- [ ] All form labels associated with inputs
- [ ] Buttons have accessible text
- [ ] Color not sole indicator of status (use badges)
- [ ] Focus states visible on all interactive elements

### Keyboard Navigation
- [ ] Tab through all form inputs
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] Tab order logical

## Browser Compatibility Testing

Test on:
- [ ] Chrome 120+
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+

## Error Handling Testing

### Network Error Scenarios
- [ ] Network disconnected → show error
- [ ] API timeout → show retry option
- [ ] Server returns 500 → show error message

### Invalid Data Scenarios
- [ ] Negative numbers for marks → validation error
- [ ] Past dates → validation warning
- [ ] Duplicate exam names → warning or allow

### Edge Cases
- [ ] Empty search results → "No results" message
- [ ] Very large result sets → pagination/virtualization
- [ ] Concurrent edits → conflict resolution

## Test Data Checklist

Before testing, ensure you have:
- [ ] 3 organizations set up
- [ ] 10+ users across orgs
- [ ] 5+ exams with results
- [ ] 10+ support tickets at various stages
- [ ] Multiple salary structures
- [ ] Full topic hierarchy (10+ topics)
- [ ] Multiple timetables for different batches

## Automation Testing (Optional)

Create Cypress/Playwright tests for critical flows:

```typescript
// Example Cypress test
describe('Board Exams', () => {
  it('should create exam and enter marks', () => {
    cy.login('admin@test.com', 'password');
    cy.visit('/admin/academics/results');
    cy.contains('New Exam').click();
    cy.get('[name="exam_name"]').type('Midterm');
    cy.get('[name="max_marks"]').type('100');
    cy.contains('Create').click();
    cy.contains('Midterm').should('be.visible');
  });
});
```

## Sign-Off Criteria

All of the following must be true:

- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ No console errors
- ✅ Visual design matches mockups
- ✅ Mobile responsive confirmed
- ✅ Security audit passed
- ✅ Performance acceptable
- ✅ Accessibility standards met
- ✅ Documentation complete
- ✅ Ready for production deployment

## Test Report Template

```
Date: YYYY-MM-DD
Tester: [Name]
Environment: [Staging/Production]
Browser: [Chrome 120]
OS: [Windows 11]

Features Tested:
- Board Exams: [PASS/FAIL]
- Support Tickets: [PASS/FAIL]
- Working Hours: [PASS/FAIL]
- Salary Structures: [PASS/FAIL]
- Topics & Content: [PASS/FAIL]
- Timetables: [PASS/FAIL]

Issues Found: [Number]
- [Issue 1]: Severity [HIGH/MEDIUM/LOW]
- [Issue 2]: Severity [HIGH/MEDIUM/LOW]

Sign-Off: [Name] [Date]
```

---

**Testing Start Date**: [TO BE FILLED]
**Testing End Date**: [TO BE FILLED]
**Overall Status**: [TO BE FILLED]
