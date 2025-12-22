# EduMunch: Platform Architecture & Separation of Concerns

> Three distinct platforms with clear responsibilities and isolated codebases

---

## Platform Overview

EduMunch consists of three independent applications:

| Platform | Primary Users | Purpose | Technology Stack |
|----------|---------------|---------|------------------|
| **Dev Panel** | Nexverse Digital Studios | System administration, Hub management, Schema sync | React + TypeScript, TailwindCSS |
| **Admin Dashboard** | School Admins (HR, Academic, Finance, Super Admin) | Operational management, Staff functions | React + TypeScript, TailwindCSS |
| **Web App** | Students, Teachers, Parents | Daily usage, Academic activities | React + TypeScript, TailwindCSS (PWA) |

---

## 1. DEV PANEL

### Purpose
Centralized control system for Nexverse Digital Studios to manage the entire EduMunch ecosystem.

### Key Responsibilities

1. **School Registry Management**
   - Onboard new schools
   - Assign DB Hubs and Index Tokens
   - Configure subscription tiers
   - Manage school lifecycle (active/suspended/archived)

2. **DB Hub Management**
   - Monitor Hub capacity (5 schools/hub)
   - Track disk usage across Hubs
   - Provision new Hubs when needed
   - Hub health monitoring

3. **Schema Synchronization**
   - Push schema updates to all Hubs
   - Version control for database patches
   - Atomic migration execution
   - Rollback support for failed migrations

4. **Feature Configuration**
   - Enable/disable features per school
   - Generate `features.config.ts` files
   - Trigger white-label builds

5. **Monitoring & Analytics**
   - System-wide health metrics
   - Hub performance monitoring
   - School usage statistics
   - Error tracking and alerts

6. **Billing & Subscriptions**
   - Renewal tracking
   - Payment history
   - Invoice generation
   - Auto-suspension for expired subscriptions

### Tech Stack

```typescript
// Frontend
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS + shadcn/ui
- React Query (Server state)
- Zustand (Client state)
- React Router v6

// Backend Integration
- Supabase (Dev Master DB)
- Supabase Admin API (for Hub management)
- GitHub API (for white-label repo updates)
- Vercel/Netlify API (for deployments)

// Monitoring
- Sentry (Error tracking)
- Mixpanel (Analytics)
```

### Key Features

#### 1. School Onboarding Wizard

```typescript
// Dev Panel: School Onboarding Flow
const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  
  return (
    <Wizard>
      {/* Step 1: Basic Info */}
      <WizardStep title="School Information">
        <Input name="schoolName" label="School Name" />
        <Input name="schoolCode" label="School Code" />
        <Input name="contactPerson" label="Contact Person" />
        <Input name="contactEmail" label="Email" />
        <Input name="contactPhone" label="Phone" />
      </WizardStep>
      
      {/* Step 2: Subscription */}
      <WizardStep title="Subscription Plan">
        <RadioGroup name="tier">
          <Radio value="basic">Basic - ₹6,800/year</Radio>
          <Radio value="standard">Standard - ₹12,000/year</Radio>
          <Radio value="advanced">Advanced - ₹20,000/year</Radio>
          <Radio value="enterprise">Enterprise - Custom</Radio>
        </RadioGroup>
      </WizardStep>
      
      {/* Step 3: Feature Selection */}
      <WizardStep title="Feature Configuration">
        <FeatureCheckboxes tier={selectedTier} />
      </WizardStep>
      
      {/* Step 4: DB Hub Assignment */}
      <WizardStep title="Database Allocation">
        <HubSelector availableHubs={hubs} />
        <IndexTokenGenerator />
      </WizardStep>
      
      {/* Step 5: Deployment */}
      <WizardStep title="Deploy">
        <DeploymentSettings />
        <Button onClick={handleDeploy}>Create & Deploy School</Button>
      </WizardStep>
    </Wizard>
  );
};
```

#### 2. Schema Migration Dashboard

```typescript
// Dev Panel: Schema Sync Interface
const SchemaMigration = () => {
  return (
    <div className="migration-dashboard">
      <h1>Schema Version Management</h1>
      
      {/* Current Version */}
      <Card>
        <h2>Current Version: v1.2.3</h2>
        <p>Applied to 15/15 hubs</p>
      </Card>
      
      {/* Pending Migration */}
      <Card>
        <h2>Pending Migration: v1.3.0</h2>
        <CodeBlock>{migrationSQL}</CodeBlock>
        
        <TargetSelector>
          <Checkbox label="Hub: Mumbai-01 (5 schools)" />
          <Checkbox label="Hub: Mumbai-02 (5 schools)" />
          <Checkbox label="Hub: Delhi-01 (3 schools)" />
        </TargetSelector>
        
        <Button onClick={handleMigrate}>Apply Migration</Button>
      </Card>
      
      {/* Migration History */}
      <Table>
        <thead>
          <tr>
            <th>Version</th>
            <th>Applied At</th>
            <th>Status</th>
            <th>Affected Hubs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>v1.2.3</td>
            <td>2025-12-15</td>
            <td>✅ Success</td>
            <td>15</td>
          </tr>
          <tr>
            <td>v1.2.2</td>
            <td>2025-12-01</td>
            <td>✅ Success</td>
            <td>15</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};
```

#### 3. Hub Monitoring

```typescript
// Dev Panel: Hub Health Monitoring
const HubMonitoring = () => {
  const hubs = useQuery(['hubs'], fetchHubs);
  
  return (
    <div className="hub-grid">
      {hubs.data?.map(hub => (
        <HubCard key={hub.id}>
          <h3>{hub.name}</h3>
          <StatusBadge status={hub.status} />
          
          <Metrics>
            <Metric label="Schools" value={`${hub.occupancy}/5`} />
            <Metric label="Disk Usage" value={`${hub.disk_usage_gb}/8 GB`} />
            <Metric label="CPU" value={hub.cpu_usage} />
            <Metric label="Memory" value={hub.memory_usage} />
          </Metrics>
          
          <SchoolList>
            {hub.schools.map(school => (
              <SchoolItem key={school.id}>
                {school.name} ({school.index_token})
              </SchoolItem>
            ))}
          </SchoolList>
          
          <Button onClick={() => viewDetails(hub.id)}>
            View Details
          </Button>
        </HubCard>
      ))}
      
      <AddHubCard onClick={createNewHub}>
        + Add New Hub
      </AddHubCard>
    </div>
  );
};
```

### Database Access

The Dev Panel connects to:
- **Dev Master DB** (Primary connection)
- **All DB Hubs** (Admin access via service keys for migrations)

### Security

- **Authentication:** Supabase Auth with email/password
- **Role:** Only Nexverse team members can access
- **MFA Required:** Yes
- **IP Whitelist:** Nexverse office IPs only
- **Audit Logging:** All actions logged

---

## 2. ADMIN DASHBOARD

### Purpose
Operational management platform for school administrators to manage day-to-day activities.

### User Roles & Permissions

1. **Super Admin**
   - Full access to all modules
   - User management
   - System configuration

2. **HR Manager**
   - Staff management
   - Attendance (staff)
   - Leave management
   - Payroll

3. **Academic Manager**
   - Student management
   - Attendance (student)
   - Timetable
   - Exams & marks
   - Assignments

4. **Finance Manager**
   - Fee management
   - Payments & receipts
   - Fee reports
   - Expense tracking

### Key Responsibilities

1. **User Management**
   - Create student/teacher/parent accounts
   - Assign roles and permissions
   - Bulk user creation
   - Account activation/deactivation

2. **Academic Operations**
   - Manage classes, sections, subjects
   - Teacher-subject allocation
   - Timetable creation
   - Exam scheduling
   - Marks entry and verification
   - Report card generation

3. **Attendance Management**
   - Mark attendance (students & staff)
   - Attendance reports
   - Leave management
   - Attendance alerts

4. **Fee Management**
   - Fee structure setup
   - Fee allocation to students
   - Payment collection
   - Receipt generation
   - Defaulter tracking

5. **Communication**
   - Send announcements
   - SMS/Email notifications
   - Parent communication

6. **Reports & Analytics**
   - Academic reports
   - Financial reports
   - Attendance reports
   - Custom report generation

### Tech Stack

```typescript
// Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Query
- Zustand
- React Router v6
- Recharts (for analytics)
- react-pdf (for report generation)

// Backend Integration
- Supabase (School's DB Hub)
- Cloudflare R2 (media upload)
- Razorpay API (if online payments enabled)
- SMS Gateway API
- Email Service (SMTP)
```

### Key Features

#### 1. Student Management

```typescript
// Admin Dashboard: Student Management
const StudentManagement = () => {
  return (
    <Layout>
      <Header>
        <h1>Student Management</h1>
        <Actions>
          <Button onClick={openBulkUpload}>Bulk Upload</Button>
          <Button onClick={openAdmissionForm}>+ Add Student</Button>
        </Actions>
      </Header>
      
      <Filters>
        <Select name="class" options={classes} />
        <Select name="section" options={sections} />
        <Select name="status" options={['Active', 'Inactive']} />
        <Input name="search" placeholder="Search by name/admission no." />
      </Filters>
      
      <DataTable
        columns={[
          { key: 'admission_number', label: 'Admission No.' },
          { key: 'full_name', label: 'Name' },
          { key: 'class', label: 'Class' },
          { key: 'section', label: 'Section' },
          { key: 'roll_number', label: 'Roll No.' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' }
        ]}
        data={students}
        onRowClick={openStudentDetails}
      />
      
      <Pagination />
    </Layout>
  );
};
```

#### 2. Attendance Marking

```typescript
// Admin Dashboard: Quick Attendance
const AttendanceMarking = () => {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date());
  
  return (
    <Layout>
      <Header>
        <h1>Mark Attendance</h1>
        <DatePicker value={date} onChange={setDate} />
      </Header>
      
      <ClassSelector>
        <Select name="class" onChange={loadStudents} />
        <Select name="section" onChange={loadStudents} />
      </ClassSelector>
      
      <QuickActions>
        <Button onClick={markAllPresent}>Mark All Present</Button>
        <Button onClick={markAllAbsent}>Mark All Absent</Button>
      </QuickActions>
      
      <AttendanceTable>
        {students.map(student => (
          <AttendanceRow key={student.id}>
            <span>{student.roll_number}</span>
            <span>{student.full_name}</span>
            <ButtonGroup>
              <Button 
                variant={student.status === 'present' ? 'success' : 'ghost'}
                onClick={() => markStatus(student.id, 'present')}
              >
                Present
              </Button>
              <Button 
                variant={student.status === 'absent' ? 'danger' : 'ghost'}
                onClick={() => markStatus(student.id, 'absent')}
              >
                Absent
              </Button>
              <Button 
                variant={student.status === 'late' ? 'warning' : 'ghost'}
                onClick={() => markStatus(student.id, 'late')}
              >
                Late
              </Button>
            </ButtonGroup>
          </AttendanceRow>
        ))}
      </AttendanceTable>
      
      <SubmitButton onClick={saveAttendance}>
        Save Attendance
      </SubmitButton>
    </Layout>
  );
};
```

#### 3. Fee Management

```typescript
// Admin Dashboard: Fee Collection
const FeeCollection = () => {
  return (
    <Layout>
      <Header>
        <h1>Fee Collection</h1>
        <Stats>
          <Stat label="Today's Collection" value="₹45,000" />
          <Stat label="Pending" value="₹12,50,000" />
          <Stat label="Overdue" value="₹2,30,000" />
        </Stats>
      </Header>
      
      <SearchStudent>
        <Input 
          placeholder="Search by admission no. or name" 
          onChange={searchStudent}
        />
      </SearchStudent>
      
      {selectedStudent && (
        <FeeDetails>
          <StudentInfo>
            <Avatar src={selectedStudent.photo_url} />
            <div>
              <h3>{selectedStudent.full_name}</h3>
              <p>{selectedStudent.class} - {selectedStudent.section}</p>
            </div>
          </StudentInfo>
          
          <FeeBreakdown>
            <Table>
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.fees.map(fee => (
                  <tr key={fee.id}>
                    <td>{fee.fee_type}</td>
                    <td>₹{fee.total_amount}</td>
                    <td>₹{fee.paid_amount}</td>
                    <td className="text-red-600">₹{fee.balance_amount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </FeeBreakdown>
          
          <PaymentForm>
            <Input 
              label="Amount to Pay" 
              type="number" 
              placeholder="Enter amount"
            />
            <Select 
              label="Payment Mode"
              options={['Cash', 'Cheque', 'UPI', 'Card']}
            />
            <Button onClick={collectPayment}>
              Collect Payment & Generate Receipt
            </Button>
          </PaymentForm>
        </FeeDetails>
      )}
    </Layout>
  );
};
```

### Database Access

- Connects to **school's specific DB Hub** using Index Token
- All queries use dynamic table names: `tablename_${INDEX_TOKEN}`
- RLS policies enforce role-based access

### Security

- **Authentication:** Supabase Auth (email/password + OTP)
- **RLS:** Strict row-level security
- **Role-based permissions:** Defined in `permissions_{INDEX_TOKEN}` table
- **Session timeout:** 8 hours
- **IP restrictions:** Optional per school

---

## 3. WEB APP (Student/Teacher/Parent Portal)

### Purpose
Daily-use platform for students, teachers, and parents to access academic information and perform routine tasks.

### User Types

1. **Students**
   - View attendance
   - View marks & report cards
   - Submit assignments
   - Access study materials
   - Apply for leave
   - View timetable
   - Pay fees (if online payments enabled)

2. **Teachers**
   - Mark attendance
   - Create assignments
   - Upload study materials
   - Enter marks
   - View timetable
   - Communicate with parents

3. **Parents**
   - View child's attendance
   - View marks & progress
   - Apply leave for child
   - Pay fees
   - Receive notifications
   - View announcements

### Tech Stack

```typescript
// Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Query
- Zustand
- React Router v6
- PWA (Progressive Web App)
- Push Notifications

// Backend Integration
- Supabase (DB + Auth + Realtime)
- Cloudflare R2 (media access)
- Razorpay API (payments)
```

### Key Features

#### 1. Student Dashboard

```typescript
// Web App: Student Dashboard
const StudentDashboard = () => {
  const { student } = useAuth();
  
  return (
    <Layout>
      <Header>
        <Avatar src={student.photo_url} />
        <div>
          <h1>{student.full_name}</h1>
          <p>{student.class} - {student.section}</p>
        </div>
      </Header>
      
      <QuickStats>
        <StatCard 
          icon="check" 
          label="Attendance" 
          value={`${student.attendance_percentage}%`}
          color={student.attendance_percentage >= 75 ? 'green' : 'red'}
        />
        <StatCard 
          icon="book" 
          label="Pending Assignments" 
          value={student.pending_assignments}
        />
        <StatCard 
          icon="rupee" 
          label="Fee Due" 
          value={`₹${student.fee_balance}`}
        />
      </QuickStats>
      
      <RecentUpdates>
        <h2>Recent Updates</h2>
        <UpdatesList>
          <UpdateItem>
            New assignment in Mathematics - Due: 25 Dec
          </UpdateItem>
          <UpdateItem>
            Mid-term results published
          </UpdateItem>
          <UpdateItem>
            Holiday on 26 Dec - Republic Day
          </UpdateItem>
        </UpdatesList>
      </RecentUpdates>
      
      <QuickActions>
        <ActionButton to="/attendance">View Attendance</ActionButton>
        <ActionButton to="/assignments">Assignments</ActionButton>
        <ActionButton to="/marks">View Marks</ActionButton>
        <ActionButton to="/fees">Pay Fees</ActionButton>
      </QuickActions>
    </Layout>
  );
};
```

#### 2. Teacher Assignment Creation

```typescript
// Web App: Teacher Creates Assignment
const CreateAssignment = () => {
  return (
    <Layout>
      <Header>
        <h1>Create Assignment</h1>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <Select 
          label="Class" 
          options={teacherClasses}
          required
        />
        <Select 
          label="Subject" 
          options={teacherSubjects}
          required
        />
        <Input 
          label="Assignment Title" 
          placeholder="Chapter 5 - Exercise Problems"
          required
        />
        <Textarea 
          label="Description" 
          placeholder="Solve questions 1-10 from textbook"
          rows={4}
        />
        <Input 
          label="Maximum Marks" 
          type="number"
          placeholder="20"
        />
        <DatePicker 
          label="Submission Date" 
          required
        />
        <FileUpload 
          label="Attach Files (Optional)" 
          accept=".pdf,.doc,.docx"
          multiple
        />
        
        <Checkbox 
          label="Allow late submission" 
          name="lateSubmission"
        />
        
        <SubmitButton>Create Assignment</SubmitButton>
      </Form>
    </Layout>
  );
};
```

#### 3. Parent Dashboard

```typescript
// Web App: Parent Dashboard
const ParentDashboard = () => {
  const { parent, children } = useAuth();
  const [selectedChild, setSelectedChild] = useState(children[0]);
  
  return (
    <Layout>
      <Header>
        <h1>Parent Portal</h1>
        {children.length > 1 && (
          <ChildSelector>
            {children.map(child => (
              <ChildTab 
                key={child.id}
                active={selectedChild.id === child.id}
                onClick={() => setSelectedChild(child)}
              >
                {child.full_name}
              </ChildTab>
            ))}
          </ChildSelector>
        )}
      </Header>
      
      <ChildInfo>
        <Avatar src={selectedChild.photo_url} />
        <div>
          <h2>{selectedChild.full_name}</h2>
          <p>{selectedChild.class} - {selectedChild.section}</p>
          <p>Roll No: {selectedChild.roll_number}</p>
        </div>
      </ChildInfo>
      
      <StatsGrid>
        <StatCard 
          label="Attendance" 
          value={`${selectedChild.attendance_percentage}%`}
          trend={selectedChild.attendance_trend}
        />
        <StatCard 
          label="Last Exam Average" 
          value={`${selectedChild.last_exam_percentage}%`}
          trend={selectedChild.marks_trend}
        />
        <StatCard 
          label="Fee Status" 
          value={selectedChild.fee_status}
          color={selectedChild.fee_status === 'Paid' ? 'green' : 'red'}
        />
      </StatsGrid>
      
      <RecentActivity>
        <h3>Recent Activity</h3>
        <ActivityList>
          <ActivityItem>
            Absent on 20 Dec 2025
          </ActivityItem>
          <ActivityItem>
            Scored 18/20 in Mathematics Assignment
          </ActivityItem>
          <ActivityItem>
            Fee payment received - ₹5,000
          </ActivityItem>
        </ActivityList>
      </RecentActivity>
      
      <QuickActions>
        <Button to={`/attendance/${selectedChild.id}`}>
          View Attendance
        </Button>
        <Button to={`/marks/${selectedChild.id}`}>
          View Marks
        </Button>
        <Button to={`/fees/${selectedChild.id}`}>
          Pay Fees
        </Button>
        <Button to={`/leave/${selectedChild.id}`}>
          Apply Leave
        </Button>
      </QuickActions>
    </Layout>
  );
};
```

### Progressive Web App (PWA) Features

```typescript
// Web App: PWA Configuration
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EduMunch - Delhi Public School',
        short_name: 'DPS Portal',
        description: 'Student, Teacher & Parent Portal',
        theme_color: '#4F46E5',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          }
        ]
      }
    })
  ]
});
```

### Push Notifications

```typescript
// Web App: Push Notification Setup
import { messaging } from '@/firebase';

const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    const token = await getToken(messaging);
    // Save token to database
    await supabase
      .from(`users_${INDEX_TOKEN}`)
      .update({ fcm_token: token })
      .eq('id', currentUser.id);
  }
};

// Listen for notifications
onMessage(messaging, (payload) => {
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png'
  });
});
```

### Database Access

- Connects to **school's DB Hub**
- Uses **Supabase RLS** for data access control
- Students can only view their own data
- Teachers can view/edit data for assigned classes
- Parents can view data for their children only

### Security

- **Authentication:** Supabase Auth (email/password + OTP)
- **RLS:** Strict row-level security per user role
- **Session management:** 7-day sessions
- **Data encryption:** HTTPS only
- **Content Security Policy:** Enabled

---

## Platform Comparison

| Feature | Dev Panel | Admin Dashboard | Web App |
|---------|-----------|-----------------|---------|
| **Users** | Nexverse Team | School Admins | Students/Teachers/Parents |
| **Deployment** | Single instance | White-labeled per school | White-labeled per school |
| **Database** | Dev Master DB + All Hubs | School's Hub only | School's Hub only |
| **Authentication** | Nexverse accounts | School admin accounts | Student/Teacher/Parent accounts |
| **Access Level** | System-wide | School-wide | User-specific |
| **Mobile Support** | Desktop only | Desktop + Tablet | Desktop + Mobile (PWA) |
| **Offline Mode** | No | No | Yes (PWA) |
| **Branding** | Nexverse | School branding | School branding |

---

**Status:** Platform architecture complete. Ready for API & integration documentation.
