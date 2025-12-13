# Document Management System

## Overview
The Document Management System enables students, staff, and institutions to manage educational documents including admission proofs, certificates, transcripts, verification records, and digital archival of documents.

## Module Objectives
- Enable document upload and storage
- Manage document verification workflow
- Generate certificates and transcripts
- Track document status
- Provide digital archival
- Support multi-format documents
- Enable document tracking

## Key Features

### 1. Document Upload & Storage
- **Document Types**
  - Proof documents (ID proof, address proof, educational qualification)
  - Certificates
  - Transcripts
  - Admission documents
  - Personal documents

- **Upload Management**
  - Drag-and-drop upload
  - Multi-file upload
  - File size limits
  - Format validation
  - Virus scanning

### 2. Document Verification
- **Verification Workflow**
  - Document submission
  - Verification by admin
  - Status tracking
  - Approval/rejection
  - Re-upload requests

- **Verification Status**
  - PENDING
  - VERIFIED
  - REJECTED
  - EXPIRED
  - REQUIRES_RESUBMISSION

### 3. Certificate Generation
- **Certificate Types**
  - Completion certificate
  - Achievement certificate
  - Participation certificate
  - Transfer certificate
  - Character certificate

- **Certificate Customization**
  - Template selection
  - Organization branding
  - Custom text fields
  - Digital signatures
  - Watermarking

### 4. Transcript Generation
- **Transcript Content**
  - Student details
  - Course information
  - Academic performance
  - Grades and marks
  - Attendance
  - Comments

- **Transcript Formats**
  - PDF documents
  - Official transcripts
  - Unofficial transcripts
  - Digital transcripts

### 5. Document Tracking
- **Audit Trail**
  - Upload timestamps
  - Verification history
  - Modification tracking
  - Access logs
  - Download history

- **Status Monitoring**
  - Document status dashboard
  - Expiry alerts
  - Missing documents notification
  - Verification pending list

### 6. Digital Archival
- **Long-term Storage**
  - Secure archival
  - Version control
  - Backup management
  - Disaster recovery
  - Retention policies

## Database Schema

### Tables

#### `documents`
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Document
  document_type VARCHAR(100) NOT NULL, -- PROOF, CERTIFICATE, TRANSCRIPT, ADMISSION, PERSONAL
  document_category VARCHAR(100), -- ID_PROOF, ADDRESS_PROOF, QUALIFICATION, etc.
  document_name VARCHAR(255) NOT NULL,
  
  -- Student/Owner
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- File storage
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50), -- PDF, JPG, PNG, etc.
  file_size BIGINT,
  
  -- Content
  document_number VARCHAR(100), -- Certificate/Transcript number
  issue_date DATE,
  expiry_date DATE,
  
  -- Verification
  verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED, EXPIRED
  verified_by UUID REFERENCES employees(id),
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  is_public BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `document_verification`
```sql
CREATE TABLE document_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Verification
  verifier_id UUID NOT NULL REFERENCES employees(id),
  verification_date TIMESTAMP DEFAULT NOW(),
  
  -- Details
  verification_notes TEXT,
  authenticity_check BOOLEAN,
  completeness_check BOOLEAN,
  
  -- Status
  status VARCHAR(50), -- APPROVED, REJECTED, NEEDS_MORE_INFO
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `certificates`
```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Certificate
  certificate_type VARCHAR(100) NOT NULL, -- COMPLETION, ACHIEVEMENT, PARTICIPATION, TRANSFER, CHARACTER
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  
  -- Recipient
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255),
  
  -- Details
  issue_date DATE NOT NULL,
  valid_from DATE,
  valid_until DATE,
  
  -- Content
  course_id UUID REFERENCES courses(id),
  batch_id UUID REFERENCES batches(id),
  achievement_description TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, GENERATED, ISSUED, REVOKED
  
  -- Digital signature
  signature_authority UUID REFERENCES employees(id),
  signature_timestamp TIMESTAMP,
  
  -- File
  certificate_file_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `transcripts`
```sql
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Transcript
  transcript_type VARCHAR(50) DEFAULT 'OFFICIAL', -- OFFICIAL, UNOFFICIAL, DRAFT
  transcript_number VARCHAR(100) UNIQUE NOT NULL,
  
  -- Student
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Details
  generation_date DATE DEFAULT CURRENT_DATE,
  issued_by UUID NOT NULL REFERENCES employees(id),
  issued_at TIMESTAMP,
  
  -- Content
  start_date DATE,
  end_date DATE,
  cgpa DECIMAL(3,2),
  total_credits INT,
  
  -- Verification
  verification_signature TEXT,
  digital_seal BOOLEAN DEFAULT FALSE,
  
  -- File
  transcript_file_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ISSUED, REVOKED
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `transcript_details`
```sql
CREATE TABLE transcript_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Course details
  course_id UUID NOT NULL REFERENCES courses(id),
  course_name VARCHAR(255),
  course_code VARCHAR(50),
  
  -- Marks
  credit_hours INT,
  grade VARCHAR(2),
  marks_obtained DECIMAL(5,2),
  marks_total DECIMAL(5,2),
  
  -- Semester
  semester INT,
  academic_year VARCHAR(10)
);
```

#### `document_templates`
```sql
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Template
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100), -- CERTIFICATE, TRANSCRIPT, etc.
  
  -- Design
  template_html TEXT, -- HTML template with placeholders
  background_image_url TEXT,
  
  -- Fields
  editable_fields JSONB, -- Array of field names for customization
  
  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by UUID NOT NULL REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `document_access_log`
```sql
CREATE TABLE document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Access
  accessed_by UUID NOT NULL REFERENCES auth.users(id),
  accessed_at TIMESTAMP DEFAULT NOW(),
  
  -- Details
  access_type VARCHAR(50), -- VIEW, DOWNLOAD, SHARE
  user_role VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `document_retention_policy`
```sql
CREATE TABLE document_retention_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Policy
  document_type VARCHAR(100) NOT NULL,
  retention_days INT,
  
  auto_archive BOOLEAN DEFAULT TRUE,
  notify_before_deletion BOOLEAN DEFAULT TRUE,
  notification_days_before INT DEFAULT 30,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Views and Queries

#### Student Documents Overview
```sql
SELECT 
  s.id as student_id,
  CONCAT(s.first_name, ' ', s.last_name) as student_name,
  COUNT(DISTINCT d.id) as total_documents,
  COUNT(DISTINCT CASE WHEN d.verification_status = 'VERIFIED' THEN d.id END) as verified_documents,
  COUNT(DISTINCT CASE WHEN d.verification_status = 'PENDING' THEN d.id END) as pending_documents,
  MAX(d.updated_at) as last_updated
FROM students s
LEFT JOIN documents d ON s.id = d.student_id
WHERE s.organization_id = $1
GROUP BY s.id, s.first_name, s.last_name;
```

## Components

### DocumentUpload
Location: `src/features/documents/components/DocumentUpload.tsx`

**Purpose:** Upload documents with validation

**Props:**
```typescript
interface DocumentUploadProps {
  studentId: string;
  documentType: string;
  onSuccess: (document: Document) => void;
}
```

**Features:**
- Drag-and-drop upload
- File validation
- Progress indicator
- Preview before upload
- Error handling

### DocumentVerification
Location: `src/features/documents/components/DocumentVerification.tsx`

**Purpose:** Review and verify documents

**Props:**
```typescript
interface DocumentVerificationProps {
  documentId: string;
  onVerify: (verified: boolean) => void;
}
```

**Features:**
- Document preview
- Verification form
- Approval/rejection
- Notes entry
- Status tracking

### CertificateGenerator
Location: `src/features/documents/components/CertificateGenerator.tsx`

**Purpose:** Generate certificates

**Props:**
```typescript
interface CertificateGeneratorProps {
  studentId: string;
  certificateType: string;
  organizationId: string;
  onGenerate: (certificate: Certificate) => void;
}
```

**Features:**
- Template selection
- Field customization
- Preview
- Batch generation
- Download/print

### TranscriptGenerator
Location: `src/features/documents/components/TranscriptGenerator.tsx`

**Purpose:** Generate academic transcripts

**Props:**
```typescript
interface TranscriptGeneratorProps {
  studentId: string;
  organizationId: string;
}
```

**Features:**
- Academic data compilation
- Format selection
- Signature verification
- Digital seal
- Download

## Services

### `document.service.ts`
Location: `src/features/documents/services/document.service.ts`

```typescript
// Document Management
async uploadDocument(data: DocumentUploadInput): Promise<Document>
async getDocument(documentId: string): Promise<Document>
async listDocuments(studentId: string, filters?: DocumentFilters): Promise<Document[]>
async updateDocument(documentId: string, data: UpdateDocumentInput): Promise<void>
async deleteDocument(documentId: string): Promise<void>

// Document Verification
async submitForVerification(documentId: string): Promise<void>
async verifyDocument(documentId: string, verified: boolean, notes?: string): Promise<void>
async rejectDocument(documentId: string, reason: string): Promise<void>
async getVerificationHistory(documentId: string): Promise<VerificationRecord[]>

// Certificate Management
async generateCertificate(data: CertificateGenerationInput): Promise<Certificate>
async getCertificate(certificateId: string): Promise<Certificate>
async listCertificates(studentId: string): Promise<Certificate[]>
async revokeCertificate(certificateId: string, reason: string): Promise<void>
async downloadCertificate(certificateId: string): Promise<Blob>

// Transcript Management
async generateTranscript(studentId: string, options?: TranscriptOptions): Promise<Transcript>
async getTranscript(transcriptId: string): Promise<Transcript>
async listTranscripts(studentId: string): Promise<Transcript[]>
async downloadTranscript(transcriptId: string): Promise<Blob>

// Template Management
async listCertificateTemplates(organizationId: string): Promise<Template[]>
async createCertificateTemplate(data: TemplateInput): Promise<Template>
async updateTemplate(templateId: string, data: TemplateInput): Promise<void>

// Access & Audit
async logDocumentAccess(documentId: string, accessType: string): Promise<void>
async getAccessLog(documentId: string): Promise<AccessLog[]>
async archiveOldDocuments(organizationId: string): Promise<void>
```

### `document.queries.ts`
Location: `src/features/documents/services/document.queries.ts`

```typescript
// React Query hooks
export const useDocument = (documentId: string)
export const useStudentDocuments = (studentId: string)
export const useCertificate = (certificateId: string)
export const useStudentCertificates = (studentId: string)
export const useTranscript = (transcriptId: string)
export const useCertificateTemplates = (organizationId: string)

// Mutations
export const useUploadDocument = ()
export const useVerifyDocument = ()
export const useGenerateCertificate = ()
export const useGenerateTranscript = ()
export const useCreateTemplate = ()
```

## API Endpoints

### REST API (via Supabase AutoAPI)

```
GET    /rest/v1/documents?student_id=eq.{id}
POST   /rest/v1/documents
PATCH  /rest/v1/documents/{id}
DELETE /rest/v1/documents/{id}

GET    /rest/v1/document_verification?document_id=eq.{id}
POST   /rest/v1/document_verification

GET    /rest/v1/certificates?student_id=eq.{id}
POST   /rest/v1/certificates
PATCH  /rest/v1/certificates/{id}

GET    /rest/v1/transcripts?student_id=eq.{id}
POST   /rest/v1/transcripts

GET    /rest/v1/document_templates?organization_id=eq.{id}
POST   /rest/v1/document_templates
PATCH  /rest/v1/document_templates/{id}

GET    /rest/v1/document_access_log?document_id=eq.{id}
POST   /rest/v1/document_access_log
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Students can view their own documents
CREATE POLICY documents_student_view ON documents
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE auth.uid() = user_id)
  );

-- Admin can view all documents
CREATE POLICY documents_admin_view ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employee_roles 
      WHERE employee_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
      AND role_id IN (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  );

-- Only verifiers can verify documents
CREATE POLICY document_verification_manage ON document_verification
  FOR ALL USING (
    verifier_id = (SELECT id FROM employees WHERE auth.uid() = user_id)
  );
```

## Implementation Workflow

### Phase 1: Core Setup
1. Create database tables
2. Set up storage buckets
3. Configure retention policies

### Phase 2: Document Management
1. Build DocumentUpload
2. Implement upload service
3. Add file storage

### Phase 3: Verification Workflow
1. Build DocumentVerification
2. Implement verification logic
3. Add status tracking

### Phase 4: Certificate & Transcript
1. Build CertificateGenerator
2. Build TranscriptGenerator
3. Implement generation logic

### Phase 5: Audit & Archival
1. Implement access logging
2. Add archival automation
3. Generate audit reports

## Testing Strategy

### Unit Tests
- File validation
- Document verification
- Certificate generation
- Access control

### Component Tests
- Upload interface
- Verification form
- Certificate preview

### Integration Tests
- End-to-end document workflow
- Verification process
- Archive automation

## Performance Optimization

- Index on `student_id, document_type`
- Cache templates
- Background job for generation
- Archive old documents
- Compression for storage

## Future Enhancements

- Blockchain-based verification
- Advanced document OCR
- AI-powered document classification
- Biometric verification
- Document watermarking
- Barcode/QR code support
- Multilingual document support
- Mobile document capture
