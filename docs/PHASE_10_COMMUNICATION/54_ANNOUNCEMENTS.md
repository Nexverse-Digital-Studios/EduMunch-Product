# Announcements System

## Overview
The Announcements module enables school administration to create, schedule, and distribute announcements to various audience segments (parents, students, staff). It includes targeting, delivery tracking, analytics, and archival management.

## Module Objectives
- Enable announcement creation and publishing
- Support targeted distribution
- Schedule announcements
- Track view and engagement metrics
- Archive announcements
- Send notifications across channels
- Maintain announcement history

## Key Features

### 1. Announcement Creation
- **Content Management**
  - Title and description
  - Rich text editor
  - Image/document attachments
  - Category tagging
  - Urgency level

- **Announcement Types**
  - School-wide announcements
  - Department announcements
  - Class announcements
  - Event announcements
  - Urgent notices
  - Holiday schedules

### 2. Targeting & Distribution
- **Audience Selection**
  - All students
  - Specific classes/sections
  - Specific departments
  - Staff only
  - Parents only
  - Custom filters (grade, branch, etc.)

- **Distribution Channels**
  - In-app notification
  - Email
  - SMS
  - Push notification
  - Portal display
  - Broadcast

### 3. Scheduling
- **Publication Options**
  - Immediate publishing
  - Schedule for future date/time
  - Recurring announcements (daily, weekly, monthly)
  - Auto-archive after date

- **Time Management**
  - Set publication time
  - Set expiry date
  - Featured/pinned announcements
  - Priority levels

### 4. Visibility & Access
- **Announcement Board**
  - Timeline view
  - Grid/list view
  - Filter by category
  - Search functionality
  - Save/bookmark

- **Detail View**
  - Full content display
  - Attachments
  - Publication date
  - Comments (if enabled)

### 5. Engagement Tracking
- **View Tracking**
  - Number of views
  - Viewers list
  - View timestamps
  - Read/unread status

- **Interaction Metrics**
  - Comment count
  - Share count
  - Bookmark count
  - Engagement rate

### 6. Archival & History
- **Archive Management**
  - Auto-archive old announcements
  - Searchable archive
  - Category-wise archival
  - Bulk archive operations

## Database Schema

### Tables

#### `announcements`
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content_html TEXT, -- Rich text content
  
  announcement_type VARCHAR(50) NOT NULL, -- SCHOOL, DEPARTMENT, CLASS, EVENT, URGENT, HOLIDAY
  category VARCHAR(100),
  urgency_level VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  
  -- Publication
  created_by UUID NOT NULL REFERENCES employees(id),
  published_at TIMESTAMP,
  published_by UUID REFERENCES employees(id),
  
  -- Scheduling
  scheduled_publish_date TIMESTAMP,
  scheduled_expiry_date TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, PUBLISHED, ARCHIVED, DELETED
  is_featured BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pin_order INT,
  
  -- Visibility
  is_visible_to_parents BOOLEAN DEFAULT TRUE,
  is_visible_to_students BOOLEAN DEFAULT TRUE,
  is_visible_to_staff BOOLEAN DEFAULT TRUE,
  
  -- Engagement
  total_views INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_bookmarks INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `announcement_recipients`
```sql
CREATE TABLE announcement_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  
  -- Audience
  recipient_type VARCHAR(50) NOT NULL, -- USER, ROLE, CLASS, DEPARTMENT, ORGANIZATION, CUSTOM
  recipient_id UUID, -- Foreign key based on recipient_type
  
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),
  
  -- Delivery
  delivery_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, FAILED, BOUNCED
  delivery_method VARCHAR(50) DEFAULT 'EMAIL', -- EMAIL, SMS, PUSH, IN_APP, ALL
  
  delivered_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `announcement_views`
```sql
CREATE TABLE announcement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  
  viewer_id UUID NOT NULL REFERENCES auth.users(id),
  viewer_type VARCHAR(50), -- STUDENT, PARENT, STAFF, ADMIN
  
  viewed_at TIMESTAMP DEFAULT NOW(),
  time_spent_seconds INT,
  
  is_read BOOLEAN DEFAULT TRUE,
  read_at TIMESTAMP,
  
  device_type VARCHAR(50), -- DESKTOP, MOBILE, TABLET
  user_agent TEXT
);
```

#### `announcement_comments`
```sql
CREATE TABLE announcement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  
  commented_by UUID NOT NULL REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  
  parent_comment_id UUID REFERENCES announcement_comments(id) ON DELETE CASCADE, -- For replies
  
  is_approved BOOLEAN DEFAULT FALSE,
  moderated_by UUID REFERENCES employees(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `announcement_bookmarks`
```sql
CREATE TABLE announcement_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  
  bookmarked_by UUID NOT NULL REFERENCES auth.users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(announcement_id, bookmarked_by)
);
```

#### `announcement_attachments`
```sql
CREATE TABLE announcement_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### `announcement_schedules`
```sql
CREATE TABLE announcement_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  
  -- Recurring schedule
  recurrence_pattern VARCHAR(50), -- DAILY, WEEKLY, MONTHLY, YEARLY, NONE
  recurrence_days JSONB, -- Array for WEEKLY: [0,1,2,3,4,5,6]
  
  start_date DATE NOT NULL,
  end_date DATE,
  
  next_scheduled_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `announcement_read_tracking`
```sql
CREATE TABLE announcement_read_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  first_view_at TIMESTAMP,
  last_view_at TIMESTAMP,
  view_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(announcement_id, recipient_id)
);
```

### Views and Queries

#### Active Announcements
```sql
SELECT 
  a.id,
  a.title,
  a.announcement_type,
  a.urgency_level,
  a.published_at,
  a.is_featured,
  a.is_pinned,
  CONCAT(e.first_name, ' ', e.last_name) as published_by,
  a.total_views,
  a.total_comments,
  a.scheduled_expiry_date
FROM announcements a
LEFT JOIN employees e ON a.published_by = e.id
WHERE a.organization_id = $1
  AND a.status = 'PUBLISHED'
  AND (a.scheduled_expiry_date IS NULL OR a.scheduled_expiry_date > CURRENT_TIMESTAMP)
ORDER BY a.is_pinned DESC, a.published_at DESC;
```

#### Announcement Engagement Analytics
```sql
SELECT 
  a.id,
  a.title,
  COUNT(DISTINCT av.viewer_id) as unique_viewers,
  COUNT(av.id) as total_views,
  ROUND(100.0 * COUNT(DISTINCT av.viewer_id) / 
    (SELECT COUNT(*) FROM announcement_recipients WHERE announcement_id = a.id), 2) as engagement_percentage,
  COUNT(DISTINCT ac.id) as comment_count,
  COUNT(DISTINCT ab.id) as bookmark_count
FROM announcements a
LEFT JOIN announcement_views av ON a.id = av.announcement_id
LEFT JOIN announcement_comments ac ON a.id = ac.announcement_id
LEFT JOIN announcement_bookmarks ab ON a.id = ab.announcement_id
WHERE a.organization_id = $1
  AND a.status = 'PUBLISHED'
GROUP BY a.id, a.title
ORDER BY total_views DESC;
```

## Components

### AnnouncementForm
Location: `src/features/announcements/components/AnnouncementForm.tsx`

**Purpose:** Create and edit announcements

**Props:**
```typescript
interface AnnouncementFormProps {
  organizationId: string;
  initialData?: Announcement;
  onSuccess: (announcement: Announcement) => void;
}
```

**Features:**
- Title and description
- Rich text editor
- Category selection
- Audience targeting
- Attachment upload
- Schedule options
- Draft/preview

### AnnouncementList
Location: `src/features/announcements/components/AnnouncementList.tsx`

**Purpose:** Display announcements feed

**Props:**
```typescript
interface AnnouncementListProps {
  organizationId: string;
  userId: string;
  userType?: 'student' | 'parent' | 'staff' | 'admin';
  filters?: AnnouncementFilters;
}
```

**Features:**
- Timeline view
- Grid/list toggle
- Filter by category/urgency
- Search
- Pinned announcements
- Bookmark management

### AnnouncementDetail
Location: `src/features/announcements/components/AnnouncementDetail.tsx`

**Purpose:** View full announcement with interactions

**Props:**
```typescript
interface AnnouncementDetailProps {
  announcementId: string;
  userId: string;
  onBack: () => void;
}
```

**Features:**
- Full content display
- Attachments
- Comments section
- Bookmark toggle
- Share options
- View statistics (for admin)

### AnnouncementComposer
Location: `src/features/announcements/components/AnnouncementComposer.tsx`

**Purpose:** Admin announcement creation tool

**Props:**
```typescript
interface AnnouncementComposerProps {
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- WYSIWYG editor
- Audience builder
- Schedule builder
- Attachment manager
- Preview mode
- Bulk send options

## Services

### `announcement.service.ts`
Location: `src/features/announcements/services/announcement.service.ts`

```typescript
// Announcement CRUD
async createAnnouncement(data: CreateAnnouncementInput): Promise<Announcement>
async getAnnouncement(announcementId: string): Promise<Announcement>
async listAnnouncements(organizationId: string, filters?: AnnouncementFilters): Promise<Announcement[]>
async updateAnnouncement(announcementId: string, data: UpdateAnnouncementInput): Promise<void>
async publishAnnouncement(announcementId: string): Promise<void>
async archiveAnnouncement(announcementId: string): Promise<void>
async deleteAnnouncement(announcementId: string): Promise<void>

// Targeting & Distribution
async setAnnouncementAudience(announcementId: string, audience: AudienceInput[]): Promise<void>
async getAudienceCount(announcementId: string): Promise<number>
async sendAnnouncement(announcementId: string, deliveryMethods: string[]): Promise<void>

// Scheduling
async scheduleAnnouncement(announcementId: string, schedule: ScheduleInput): Promise<void>
async updateSchedule(announcementId: string, schedule: ScheduleInput): Promise<void>
async processScheduledAnnouncements(): Promise<void>

// View Tracking
async recordView(announcementId: string, userId: string, deviceType?: string): Promise<void>
async getViewers(announcementId: string): Promise<Viewer[]>
async getViewStatistics(announcementId: string): Promise<ViewStats>

// Comments
async addComment(announcementId: string, comment: string): Promise<void>
async approveComment(commentId: string): Promise<void>
async deleteComment(commentId: string): Promise<void>
async getComments(announcementId: string): Promise<AnnouncementComment[]>

// Bookmarks
async toggleBookmark(announcementId: string, userId: string): Promise<void>
async getBookmarks(userId: string): Promise<Announcement[]>

// Attachments
async uploadAttachment(announcementId: string, file: File): Promise<AnnouncementAttachment>
async deleteAttachment(attachmentId: string): Promise<void>

// Analytics
async getAnnouncementStats(organizationId: string, period: DateRange): Promise<AnnouncementStats>
async getEngagementAnalytics(announcementId: string): Promise<EngagementMetrics>
async getViewTrends(organizationId: string, daysBack?: number): Promise<TrendData[]>
```

### `announcement.queries.ts`
Location: `src/features/announcements/services/announcement.queries.ts`

```typescript
// React Query hooks
export const useAnnouncement = (announcementId: string)
export const useAnnouncements = (organizationId: string, filters?: AnnouncementFilters)
export const useMyAnnouncements = (userId: string, organizationId: string)
export const useFeaturedAnnouncements = (organizationId: string)
export const useBookmarkedAnnouncements = (userId: string)
export const useAnnouncementViews = (announcementId: string)
export const useAnnouncementComments = (announcementId: string)
export const useAnnouncementStats = (announcementId: string)

// Mutations
export const useCreateAnnouncement = ()
export const usePublishAnnouncement = ()
export const useUpdateAnnouncement = ()
export const useRecordView = ()
export const useToggleBookmark = ()
export const useAddComment = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/announcements?organization_id=eq.{id}
POST   /rest/v1/announcements
GET    /rest/v1/announcements/{id}
PATCH  /rest/v1/announcements/{id}
DELETE /rest/v1/announcements/{id}

GET    /rest/v1/announcement_recipients?announcement_id=eq.{id}
POST   /rest/v1/announcement_recipients

GET    /rest/v1/announcement_views?announcement_id=eq.{id}
POST   /rest/v1/announcement_views

GET    /rest/v1/announcement_comments?announcement_id=eq.{id}
POST   /rest/v1/announcement_comments
PATCH  /rest/v1/announcement_comments/{id}
DELETE /rest/v1/announcement_comments/{id}

GET    /rest/v1/announcement_bookmarks?bookmarked_by=eq.{id}
POST   /rest/v1/announcement_bookmarks
DELETE /rest/v1/announcement_bookmarks/{id}

GET    /rest/v1/announcement_attachments?announcement_id=eq.{id}
POST   /rest/v1/announcement_attachments
DELETE /rest/v1/announcement_attachments/{id}

POST   /rest/v1/announcement_schedules
PATCH  /rest/v1/announcement_schedules/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Only admin/staff can create announcements
CREATE POLICY announcements_create ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name IN ('ADMIN', 'STAFF'))
    )
  );

-- Users can view announcements targeted to them
CREATE POLICY announcements_view ON announcements
  FOR SELECT USING (
    status = 'PUBLISHED'
    AND (
      (is_visible_to_parents AND EXISTS (SELECT 1 FROM employees WHERE auth.uid() = user_id AND employee_type = 'PARENT'))
      OR (is_visible_to_students AND EXISTS (SELECT 1 FROM students WHERE auth.uid() = user_id))
      OR (is_visible_to_staff AND EXISTS (SELECT 1 FROM employees WHERE auth.uid() = user_id AND employee_type = 'STAFF'))
    )
  );

-- Users can manage their own bookmarks
CREATE POLICY announcement_bookmarks_manage ON announcement_bookmarks
  FOR ALL USING (bookmarked_by = auth.uid());
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up notification templates
3. Configure default categories

### Phase 2: Announcement Management
1. Build AnnouncementForm
2. Implement publication workflow
3. Add draft management

### Phase 3: Distribution & Targeting
1. Build audience selector
2. Implement delivery system
3. Add scheduling support

### Phase 4: Engagement & Tracking
1. Build AnnouncementDetail
2. Implement view tracking
3. Add comment system

### Phase 5: Analytics & Archival
1. Build analytics dashboard
2. Implement archival workflow
3. Generate reports

## Testing Strategy

### Unit Tests
- Announcement validation
- Schedule calculation
- Audience targeting
- View tracking

### Component Tests
- Form submission
- List rendering
- Detail display
- Comment interactions

### Integration Tests
- End-to-end publication
- Notification delivery
- View tracking accuracy

## Performance Optimization

- Index on `organization_id, status, published_at`
- Index on `status, scheduled_expiry_date`
- Cache featured announcements
- Archive old announcements
- Batch view tracking

## Future Enhancements

- AI-powered content recommendations
- Automatic translation support
- Video announcements
- Interactive polls in announcements
- SMS/WhatsApp delivery
- QR code generation
- Digital signature support
- Announcement versioning
- Multi-language support
