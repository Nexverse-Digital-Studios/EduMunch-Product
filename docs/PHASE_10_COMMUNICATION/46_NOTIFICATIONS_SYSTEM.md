# Notifications System

## Overview
The Notifications System provides a centralized platform for managing all types of notifications in the application. This system supports multiple notification channels, preferences management, and notification history tracking.

## Module Objectives
- Create and manage notifications
- Support multiple notification types
- Enable user notification preferences
- Provide real-time notification delivery
- Track notification history
- Manage notification templates

## Key Features

### 1. Notification Creation
- **Notification Types**
  - System notifications (auto-generated)
  - Custom notifications (manual creation)
  - Scheduled notifications (time-based)
  - Event-triggered notifications
  - Batch notifications

- **Notification Content**
  - Title and message
  - Rich content support
  - Action buttons/links
  - Attachments
  - Priority levels

### 2. Notification Channels
- **Delivery Methods**
  - In-app notifications
  - Email notifications
  - SMS notifications
  - Push notifications (mobile)
  - Webhook notifications

- **Multi-Channel Support**
  - Send via multiple channels simultaneously
  - Channel-specific formatting
  - Fallback mechanisms

### 3. User Preferences
- **Preference Management**
  - Enable/disable notification types
  - Channel preferences
  - Quiet hours configuration
  - Frequency preferences
  - Do Not Disturb mode

- **Notification Categories**
  - Admissions updates
  - Assignment notifications
  - Payment reminders
  - Attendance alerts
  - Academic announcements
  - HR notifications

### 4. Notification Templates
- **Template System**
  - Pre-defined templates
  - Variable substitution
  - Multi-language support
  - Template versioning

### 5. Notification Delivery & Status
- **Delivery Tracking**
  - Delivery status (PENDING, SENT, FAILED, BOUNCED)
  - Retry mechanism
  - Delivery confirmations
  - Read/unread tracking

- **Failure Handling**
  - Automatic retries
  - Manual retry option
  - Dead letter queue
  - Failure notifications

## Database Schema

### Tables

#### `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Content
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  description TEXT,
  
  -- Type and priority
  notification_type VARCHAR(100) NOT NULL, -- ADMISSION, ASSIGNMENT, PAYMENT, ATTENDANCE, etc.
  priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  
  -- Scheduling
  scheduled_for TIMESTAMP,
  is_scheduled BOOLEAN DEFAULT FALSE,
  
  -- Content details
  rich_content JSONB, -- For formatted content
  action_url TEXT, -- URL to navigate on click
  action_label VARCHAR(100),
  
  -- Sender
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, id)
);
```

#### `notification_recipients`
```sql
CREATE TABLE notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  recipient_id UUID NOT NULL REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Delivery status
  delivery_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, FAILED, BOUNCED, DELIVERED
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Reading status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Retry info
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(notification_id, recipient_id)
);
```

#### `notification_channels`
```sql
CREATE TABLE notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  channel_type VARCHAR(50) NOT NULL, -- EMAIL, SMS, PUSH, WEBHOOK, IN_APP
  
  -- Sending details
  recipient_address VARCHAR(255), -- Email, phone, webhook URL
  content TEXT, -- Channel-specific content
  
  -- Status
  delivery_status VARCHAR(50) DEFAULT 'PENDING',
  sent_at TIMESTAMP,
  
  -- Response
  delivery_response TEXT, -- Response from external service
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `notification_preferences`
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Notification type preferences
  notification_type VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Channel preferences
  via_email BOOLEAN DEFAULT TRUE,
  via_sms BOOLEAN DEFAULT FALSE,
  via_push BOOLEAN DEFAULT TRUE,
  via_in_app BOOLEAN DEFAULT TRUE,
  
  -- Frequency
  frequency VARCHAR(50), -- IMMEDIATE, DAILY, WEEKLY, NEVER
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, notification_type, organization_id)
);
```

#### `notification_quiet_hours`
```sql
CREATE TABLE notification_quiet_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  day_of_week INT, -- 0-6 (Sunday to Saturday)
  quiet_start_time TIME NOT NULL,
  quiet_end_time TIME NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, day_of_week, organization_id)
);
```

#### `notification_templates`
```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  notification_type VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Template content
  subject_template VARCHAR(200),
  message_template TEXT NOT NULL,
  sms_template VARCHAR(160),
  
  -- Variables
  variables JSONB, -- Array of variable names and descriptions
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(organization_id, name)
);
```

#### `notification_history`
```sql
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  notification_id UUID REFERENCES notifications(id),
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  
  delivery_channels VARCHAR(50)[], -- Array of channels
  delivery_status VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP
);
```

### Views and Queries

#### User Notification Inbox
```sql
SELECT 
  nr.id,
  n.id as notification_id,
  n.title,
  n.message,
  n.notification_type,
  n.priority,
  nr.is_read,
  nr.created_at,
  nr.read_at
FROM notification_recipients nr
JOIN notifications n ON nr.notification_id = n.id
WHERE nr.recipient_id = $1
  AND nr.organization_id = $2
ORDER BY nr.created_at DESC;
```

#### Pending Notifications to Send
```sql
SELECT 
  nr.id,
  n.title,
  n.message,
  e.email,
  n.notification_type
FROM notification_recipients nr
JOIN notifications n ON nr.notification_id = n.id
JOIN employees e ON nr.recipient_id = e.id
WHERE nr.delivery_status = 'PENDING'
  AND (n.scheduled_for IS NULL OR n.scheduled_for <= NOW())
ORDER BY n.priority DESC, n.created_at ASC;
```

## Components

### NotificationCenter
Location: `src/features/notifications/components/NotificationCenter.tsx`

**Purpose:** Display user's notifications

**Props:**
```typescript
interface NotificationCenterProps {
  userId: string;
  organizationId: string;
  maxNotifications?: number;
}
```

**Features:**
- Notification list with infinite scroll
- Read/unread status toggle
- Delete notifications
- Filter by type
- Mark all as read
- Real-time updates

### NotificationForm
Location: `src/features/notifications/components/NotificationForm.tsx`

**Purpose:** Create and send notifications

**Props:**
```typescript
interface NotificationFormProps {
  organizationId: string;
  onSuccess: (notification: Notification) => void;
}
```

**Features:**
- Template selection
- Recipient selection
- Channel selection
- Schedule option
- Preview before sending
- Batch notifications

### NotificationHistory
Location: `src/features/notifications/components/NotificationHistory.tsx`

**Purpose:** View notification delivery history

**Props:**
```typescript
interface NotificationHistoryProps {
  notificationId: string;
  organizationId: string;
}
```

**Features:**
- Recipient delivery status
- Channel-wise breakdown
- Read status tracking
- Retry history
- Error messages

### PreferencesPanel
Location: `src/features/notifications/components/PreferencesPanel.tsx`

**Purpose:** Manage notification preferences

**Props:**
```typescript
interface PreferencesPanelProps {
  userId: string;
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Enable/disable notification types
- Channel preferences
- Quiet hours configuration
- Frequency settings
- Notification categories

## Services

### `notification.service.ts`
Location: `src/features/notifications/services/notification.service.ts`

```typescript
// Notification Management
async createNotification(data: CreateNotificationInput): Promise<Notification>
async getNotification(notificationId: string): Promise<Notification>
async deleteNotification(notificationId: string): Promise<void>
async sendNotification(notificationId: string): Promise<void>
async scheduleNotification(notificationId: string, scheduledFor: Date): Promise<void>

// Recipient Management
async addRecipients(notificationId: string, recipientIds: string[]): Promise<void>
async removeRecipient(notificationId: string, recipientId: string): Promise<void>
async getRecipients(notificationId: string): Promise<NotificationRecipient[]>

// User Inbox
async getUserNotifications(userId: string, organizationId: string, filters?: NotificationFilters): Promise<Notification[]>
async getUnreadCount(userId: string, organizationId: string): Promise<number>
async markAsRead(recipientNotificationId: string): Promise<void>
async markAllAsRead(userId: string, organizationId: string): Promise<void>
async deleteNotificationForUser(recipientNotificationId: string): Promise<void>

// Templates
async createTemplate(data: TemplateInput): Promise<NotificationTemplate>
async getTemplate(templateId: string): Promise<NotificationTemplate>
async listTemplates(organizationId: string, type?: string): Promise<NotificationTemplate[]>
async updateTemplate(templateId: string, data: TemplateInput): Promise<NotificationTemplate>
async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string>

// Delivery Management
async getDeliveryStatus(notificationId: string): Promise<DeliveryStatus[]>
async retryFailedDeliveries(notificationId: string): Promise<void>
async updateDeliveryStatus(recipientNotificationId: string, status: DeliveryStatus): Promise<void>

// Channel Management
async sendViaChannel(notificationId: string, channel: ChannelType): Promise<void>
async addChannel(notificationId: string, channel: ChannelInput): Promise<void>
async removeChannel(notificationId: string, channel: ChannelType): Promise<void>

// Bulk Operations
async sendBulkNotifications(recipientIds: string[], message: string, channels: ChannelType[]): Promise<void>
async scheduleRecurringNotification(data: RecurringNotificationInput): Promise<void>
```

### `notificationPreferences.service.ts`
Location: `src/features/notifications/services/notificationPreferences.service.ts`

```typescript
// Preferences
async getUserPreferences(userId: string, organizationId: string): Promise<NotificationPreference[]>
async updatePreference(userId: string, notificationType: string, preference: PreferenceInput): Promise<void>
async deletePreference(userId: string, notificationType: string): Promise<void>
async getPreferencesByType(userId: string, notificationType: string): Promise<NotificationPreference>

// Quiet Hours
async setQuietHours(userId: string, quietHours: QuietHoursInput): Promise<void>
async getQuietHours(userId: string, organizationId: string): Promise<QuietHours[]>
async isInQuietHours(userId: string, organizationId: string): Promise<boolean>
async removeQuietHours(userId: string, dayOfWeek: number): Promise<void>

// Default Preferences
async setDefaultPreferences(organizationId: string, preferences: DefaultPreferenceInput): Promise<void>
async getDefaultPreferences(organizationId: string): Promise<DefaultPreference[]>
```

### `notification.queries.ts`
Location: `src/features/notifications/services/notification.queries.ts`

```typescript
// React Query hooks
export const useUserNotifications = (userId: string, organizationId: string)
export const useNotification = (notificationId: string)
export const useUnreadCount = (userId: string, organizationId: string)
export const useNotificationHistory = (notificationId: string)
export const useNotificationTemplates = (organizationId: string)
export const useUserPreferences = (userId: string, organizationId: string)
export const useQuietHours = (userId: string, organizationId: string)

// Mutations
export const useSendNotification = ()
export const useScheduleNotification = ()
export const useMarkAsRead = ()
export const useDeleteNotification = ()
export const useUpdatePreferences = ()
export const useSetQuietHours = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/notifications?organization_id=eq.{id}
POST   /rest/v1/notifications
PATCH  /rest/v1/notifications/{id}
DELETE /rest/v1/notifications/{id}

GET    /rest/v1/notification_recipients?notification_id=eq.{id}
POST   /rest/v1/notification_recipients
PATCH  /rest/v1/notification_recipients/{id}

GET    /rest/v1/notification_preferences?user_id=eq.{id}
POST   /rest/v1/notification_preferences
PATCH  /rest/v1/notification_preferences/{id}

GET    /rest/v1/notification_templates?organization_id=eq.{id}
POST   /rest/v1/notification_templates
PATCH  /rest/v1/notification_templates/{id}

GET    /rest/v1/notification_quiet_hours?user_id=eq.{id}
POST   /rest/v1/notification_quiet_hours
DELETE /rest/v1/notification_quiet_hours/{id}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Users can view their own notifications
CREATE POLICY notifications_view ON notification_recipients
  FOR SELECT USING (
    recipient_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );

-- Only admins can send organization-wide notifications
CREATE POLICY notifications_send ON notifications
  FOR INSERT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('ADMIN', 'SUPER_ADMIN')
        AND ur.organization_id = organization_id
    )
  );

-- Users can manage their own preferences
CREATE POLICY preferences_manage ON notification_preferences
  FOR ALL USING (
    user_id = auth.uid()
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up notification templates
3. Initialize default preferences

### Phase 2: Notification Creation
1. Build NotificationForm
2. Implement notification service
3. Add to admin dashboard

### Phase 3: User Interface
1. Build NotificationCenter
2. Build PreferencesPanel
3. Add real-time updates

### Phase 4: Delivery Management
1. Implement delivery tracking
2. Build retry mechanism
3. Add channel management

### Phase 5: Advanced Features
1. Notification scheduling
2. Bulk notifications
3. Preference analytics

## Testing Strategy

### Unit Tests
- Template rendering
- Preference evaluation
- Quiet hours calculation
- Delivery status updates

### Component Tests
- NotificationCenter rendering
- PreferencesPanel interactions
- NotificationForm validation

### Integration Tests
- End-to-end notification flow
- Multi-channel delivery
- Preference application

## Performance Optimization

- Index on `recipient_id, created_at` for inbox queries
- Cache user preferences
- Batch delivery processing
- Archive old notifications
- Use database triggers for delivery status updates

## Future Enhancements

- Push notification integration (Firebase)
- Webhook support for external systems
- Advanced scheduling (recurring, conditional)
- Machine learning for preference optimization
- Notification analytics dashboard
- Rich notification templates with images
- WhatsApp integration
