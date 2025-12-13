# Email & SMS Integration

## Overview
The Email & SMS Integration module provides services for sending transactional and marketing emails and SMS messages. This system integrates with SendGrid for email and Twilio for SMS, supporting templates and bulk messaging.

## Module Objectives
- Send emails through SendGrid
- Send SMS through Twilio
- Manage email and SMS templates
- Support template variables
- Enable bulk messaging
- Track delivery status

## Key Features

### 1. Email Service Integration
- **SendGrid Integration**
  - SMTP configuration
  - API key setup
  - Email authentication (SPF, DKIM)
  - Sender verification

- **Email Types**
  - Transactional emails (invoices, receipts)
  - Notification emails
  - Marketing emails
  - Bulk emails
  - Scheduled emails

### 2. SMS Service Integration
- **Twilio Integration**
  - Account SID and Auth Token
  - Phone number allocation
  - SMS routing
  - Webhook setup for delivery confirmations

- **SMS Types**
  - OTP and verification SMS
  - Notification SMS
  - Alert SMS
  - Bulk SMS campaigns

### 3. Email Templates
- **Template Management**
  - HTML email templates
  - Plain text fallback
  - Variable substitution
  - Dynamic content blocks
  - Multi-language support

- **Template Categories**
  - User registration
  - Password reset
  - Payment confirmations
  - Admission notifications
  - Attendance alerts
  - Result announcements

### 4. SMS Templates
- **Template Types**
  - OTP templates
  - Notification templates
  - Reminder templates
  - Alert templates

- **Template Features**
  - 160-character optimization
  - Variable substitution
  - Sender ID specification

### 5. Bulk Messaging
- **Batch Processing**
  - Bulk email sending
  - Bulk SMS sending
  - Progress tracking
  - Failure handling
  - Retry mechanism

### 6. Delivery Tracking
- **Email Tracking**
  - Delivery status
  - Bounce handling
  - Unsubscribe management
  - Open tracking (optional)
  - Click tracking (optional)

- **SMS Tracking**
  - Delivery status (SENT, DELIVERED, FAILED)
  - Webhook confirmations
  - Delivery time

## Database Schema

### Tables

#### `email_templates`
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Template content
  subject VARCHAR(200) NOT NULL,
  from_email VARCHAR(100),
  from_name VARCHAR(100),
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  
  -- Variables
  variables JSONB, -- Array of {name, description, required}
  
  -- Configuration
  is_transactional BOOLEAN DEFAULT FALSE,
  track_opens BOOLEAN DEFAULT FALSE,
  track_clicks BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(organization_id, code)
);
```

#### `sms_templates`
```sql
CREATE TABLE sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Template content
  message TEXT NOT NULL, -- 160 characters max
  sender_id VARCHAR(20),
  
  -- Variables
  variables JSONB, -- Array of variable names
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  UNIQUE(organization_id, code)
);
```

#### `email_logs`
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  email_template_id UUID REFERENCES email_templates(id),
  
  recipient_email VARCHAR(100) NOT NULL,
  recipient_id UUID REFERENCES employees(id),
  
  subject VARCHAR(200) NOT NULL,
  
  -- Content
  from_email VARCHAR(100),
  from_name VARCHAR(100),
  
  -- Sending
  send_at TIMESTAMP DEFAULT NOW(),
  
  -- Status
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, BOUNCED, FAILED
  status_updated_at TIMESTAMP,
  
  -- SendGrid info
  sendgrid_message_id VARCHAR(100),
  sendgrid_event_type VARCHAR(50),
  
  -- Engagement
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  -- Failure info
  error_message TEXT,
  bounce_type VARCHAR(50), -- PERMANENT, TEMPORARY
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(sendgrid_message_id)
);
```

#### `sms_logs`
```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  sms_template_id UUID REFERENCES sms_templates(id),
  
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_id UUID REFERENCES employees(id),
  
  message TEXT NOT NULL,
  
  -- Sending
  send_at TIMESTAMP DEFAULT NOW(),
  
  -- Status
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, FAILED
  status_updated_at TIMESTAMP,
  
  -- Twilio info
  twilio_message_sid VARCHAR(50),
  twilio_account_sid VARCHAR(50),
  
  -- Failure info
  error_code VARCHAR(20),
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(twilio_message_sid)
);
```

#### `email_configuration`
```sql
CREATE TABLE email_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- SendGrid config
  sendgrid_api_key VARCHAR(255) ENCRYPTED,
  sendgrid_from_email VARCHAR(100) NOT NULL,
  sendgrid_from_name VARCHAR(100),
  
  -- Configuration
  enable_tracking BOOLEAN DEFAULT FALSE,
  enable_open_tracking BOOLEAN DEFAULT FALSE,
  enable_click_tracking BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_configured BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `sms_configuration`
```sql
CREATE TABLE sms_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Twilio config
  twilio_account_sid VARCHAR(50) ENCRYPTED NOT NULL,
  twilio_auth_token VARCHAR(50) ENCRYPTED NOT NULL,
  twilio_phone_number VARCHAR(20) NOT NULL,
  
  -- Configuration
  default_sender_id VARCHAR(20),
  
  -- Status
  is_configured BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `bulk_email_campaigns`
```sql
CREATE TABLE bulk_email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  campaign_name VARCHAR(100) NOT NULL,
  email_template_id UUID NOT NULL REFERENCES email_templates(id),
  
  -- Recipients
  total_recipients INT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, SENDING, COMPLETED, FAILED
  scheduled_for TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Progress
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

#### `bulk_sms_campaigns`
```sql
CREATE TABLE bulk_sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  campaign_name VARCHAR(100) NOT NULL,
  sms_template_id UUID NOT NULL REFERENCES sms_templates(id),
  
  -- Recipients
  total_recipients INT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, SENDING, COMPLETED, FAILED
  scheduled_for TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Progress
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

### Views and Queries

#### Email Delivery Status Summary
```sql
SELECT 
  DATE(send_at) as send_date,
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_count
FROM email_logs
WHERE organization_id = $1
  AND send_at >= $2
GROUP BY DATE(send_at), status
ORDER BY send_date DESC;
```

## Components

### EmailTemplateForm
Location: `src/features/emailSms/components/EmailTemplateForm.tsx`

**Purpose:** Create and edit email templates

**Props:**
```typescript
interface EmailTemplateFormProps {
  template?: EmailTemplate;
  organizationId: string;
  onSuccess: (template: EmailTemplate) => void;
}
```

**Features:**
- Template name and code
- Subject and from fields
- Rich HTML editor
- Variable insertion helper
- Preview functionality
- Test email sending

### SMSTemplateForm
Location: `src/features/emailSms/components/SMSTemplateForm.tsx`

**Purpose:** Create and edit SMS templates

**Props:**
```typescript
interface SMSTemplateFormProps {
  template?: SMSTemplate;
  organizationId: string;
  onSuccess: (template: SMSTemplate) => void;
}
```

**Features:**
- Template message (160 char limit)
- Character counter
- Variable insertion
- Sender ID configuration
- Test SMS sending

### MessageComposer
Location: `src/features/emailSms/components/MessageComposer.tsx`

**Purpose:** Compose and send email/SMS messages

**Props:**
```typescript
interface MessageComposerProps {
  organizationId: string;
  onSuccess: () => void;
  messageType: 'EMAIL' | 'SMS';
}
```

**Features:**
- Template selection
- Recipient selection/upload
- Variable mapping
- Preview
- Batch scheduling
- Send confirmation

### EmailConfiguration
Location: `src/features/emailSms/components/EmailConfiguration.tsx`

**Purpose:** Configure SendGrid settings

**Props:**
```typescript
interface EmailConfigurationProps {
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- API key input (secured)
- From email verification
- Test email
- Tracking options
- Webhook setup

### SMSConfiguration
Location: `src/features/emailSms/components/SMSConfiguration.tsx`

**Purpose:** Configure Twilio settings

**Props:**
```typescript
interface SMSConfigurationProps {
  organizationId: string;
  onSuccess: () => void;
}
```

**Features:**
- Account SID and token input
- Phone number configuration
- SMS balance info
- Webhook setup
- Test SMS

## Services

### `email.service.ts`
Location: `src/features/emailSms/services/email.service.ts`

```typescript
// Template Management
async createEmailTemplate(data: EmailTemplateInput): Promise<EmailTemplate>
async updateEmailTemplate(templateId: string, data: EmailTemplateInput): Promise<EmailTemplate>
async getEmailTemplate(templateId: string): Promise<EmailTemplate>
async listEmailTemplates(organizationId: string): Promise<EmailTemplate[]>
async deleteEmailTemplate(templateId: string): Promise<void>

// Email Sending
async sendEmail(data: SendEmailInput): Promise<EmailLog>
async sendEmailFromTemplate(templateId: string, data: SendFromTemplateInput): Promise<EmailLog>
async sendBulkEmails(data: BulkEmailInput[]): Promise<BulkEmailResult>
async scheduleBulkEmailCampaign(data: BulkEmailCampaignInput): Promise<BulkEmailCampaign>

// Email Configuration
async configureEmail(data: EmailConfigurationInput): Promise<void>
async getEmailConfiguration(organizationId: string): Promise<EmailConfiguration>
async testEmailConfiguration(organizationId: string, testEmail: string): Promise<void>

// Email Logs
async getEmailLog(emailLogId: string): Promise<EmailLog>
async getEmailLogs(organizationId: string, filters?: EmailLogFilters): Promise<EmailLog[]>
async getEmailDeliveryStatus(organizationId: string): Promise<DeliveryStatus>

// Webhooks
async processEmailWebhook(event: SendGridWebhookEvent): Promise<void>
async updateEmailStatus(sendgridMessageId: string, event: string): Promise<void>
```

### `sms.service.ts`
Location: `src/features/emailSms/services/sms.service.ts`

```typescript
// Template Management
async createSMSTemplate(data: SMSTemplateInput): Promise<SMSTemplate>
async updateSMSTemplate(templateId: string, data: SMSTemplateInput): Promise<SMSTemplate>
async getSMSTemplate(templateId: string): Promise<SMSTemplate>
async listSMSTemplates(organizationId: string): Promise<SMSTemplate[]>
async deleteSMSTemplate(templateId: string): Promise<void>

// SMS Sending
async sendSMS(data: SendSMSInput): Promise<SMSLog>
async sendSMSFromTemplate(templateId: string, data: SendSMSFromTemplateInput): Promise<SMSLog>
async sendBulkSMS(data: BulkSMSInput[]): Promise<BulkSMSResult>
async scheduleBulkSMSCampaign(data: BulkSMSCampaignInput): Promise<BulkSMSCampaign>

// SMS Configuration
async configureSMS(data: SMSConfigurationInput): Promise<void>
async getSMSConfiguration(organizationId: string): Promise<SMSConfiguration>
async testSMSConfiguration(organizationId: string, testPhone: string): Promise<void>

// SMS Logs
async getSMSLog(smsLogId: string): Promise<SMSLog>
async getSMSLogs(organizationId: string, filters?: SMSLogFilters): Promise<SMSLog[]>
async getSMSDeliveryStatus(organizationId: string): Promise<DeliveryStatus>

// Webhooks
async processSMSWebhook(event: TwilioWebhookEvent): Promise<void>
async updateSMSStatus(twilioMessageSid: string, status: string): Promise<void>
```

### `emailSms.queries.ts`
Location: `src/features/emailSms/services/emailSms.queries.ts`

```typescript
// React Query hooks
export const useEmailTemplates = (organizationId: string)
export const useSMSTemplates = (organizationId: string)
export const useEmailLogs = (organizationId: string, filters?: EmailLogFilters)
export const useSMSLogs = (organizationId: string, filters?: SMSLogFilters)
export const useEmailDeliveryStatus = (organizationId: string)
export const useSMSDeliveryStatus = (organizationId: string)

// Mutations
export const useSendEmail = ()
export const useSendSMS = ()
export const useSendBulkEmails = ()
export const useSendBulkSMS = ()
export const useCreateEmailTemplate = ()
export const useCreateSMSTemplate = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/email_templates?organization_id=eq.{id}
POST   /rest/v1/email_templates
PATCH  /rest/v1/email_templates/{id}
DELETE /rest/v1/email_templates/{id}

GET    /rest/v1/sms_templates?organization_id=eq.{id}
POST   /rest/v1/sms_templates
PATCH  /rest/v1/sms_templates/{id}
DELETE /rest/v1/sms_templates/{id}

GET    /rest/v1/email_logs?organization_id=eq.{id}
GET    /rest/v1/email_logs/{id}

GET    /rest/v1/sms_logs?organization_id=eq.{id}
GET    /rest/v1/sms_logs/{id}

POST   /rest/v1/bulk_email_campaigns
GET    /rest/v1/bulk_email_campaigns/{id}

POST   /rest/v1/bulk_sms_campaigns
GET    /rest/v1/bulk_sms_campaigns/{id}
```

### Webhook Endpoints

```
POST   /webhooks/sendgrid
POST   /webhooks/twilio
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Only admins can manage templates
CREATE POLICY email_templates_manage ON email_templates
  FOR INSERT, UPDATE, DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('ADMIN', 'SUPER_ADMIN')
        AND ur.organization_id = organization_id
    )
  );

-- Configuration access restricted to admins
CREATE POLICY email_configuration_manage ON email_configuration
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('ADMIN', 'SUPER_ADMIN')
    )
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Set up SendGrid account and API key
2. Set up Twilio account and credentials
3. Create configuration tables

### Phase 2: Templates
1. Build EmailTemplateForm
2. Build SMSTemplateForm
3. Implement template management

### Phase 3: Basic Sending
1. Implement email sending service
2. Implement SMS sending service
3. Add to notification system

### Phase 4: Bulk Messaging
1. Build MessageComposer
2. Implement bulk send logic
3. Add campaign tracking

### Phase 5: Webhooks & Tracking
1. Implement SendGrid webhooks
2. Implement Twilio webhooks
3. Add delivery tracking

## Testing Strategy

### Unit Tests
- Template variable substitution
- Message validation
- Configuration validation

### Integration Tests
- Email sending (with mock SendGrid)
- SMS sending (with mock Twilio)
- Bulk campaign processing
- Webhook event handling

## Performance Optimization

- Queue bulk messages for async processing
- Cache template data
- Batch webhook processing
- Index on recipient and status for logs

## Future Enhancements

- WhatsApp integration
- Push notification service
- Message template versioning and rollback
- Advanced scheduling (conditional, recurring)
- A/B testing for campaigns
- Rate limiting and throttling
- Delivery analytics dashboard
