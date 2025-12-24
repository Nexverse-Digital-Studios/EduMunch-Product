# EduMunch: API Architecture & Integration Guide

> Complete API structure, authentication flows, and third-party integrations

---

## API Architecture Overview

EduMunch uses a **serverless architecture** with Supabase as the primary backend, supplemented by Edge Functions for complex operations.

### API Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Apps                         │
│  (Dev Panel, Admin Dashboard, Web App)                  │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌─────────▼──────────┐
│  Supabase      │    │  Edge Functions    │
│  REST API      │    │  (Custom Logic)    │
│  (Auto-gen)    │    │                    │
└───────┬────────┘    └─────────┬──────────┘
        │                       │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │   Database (Hub)      │
        │   + RLS Policies      │
        └───────────────────────┘
```

---

## 1. Supabase Auto-Generated REST API

Supabase automatically exposes all tables as REST endpoints.

### Base Configuration

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Index Token loaded from environment
const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN;

// Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get table name with index token
export const getTableName = (baseTable: string): string => {
  return `${baseTable}_${INDEX_TOKEN}`;
};
```

### CRUD Operations

```typescript
// src/services/studentService.ts
import { supabase, getTableName } from '@/lib/supabase';

export const studentService = {
  // CREATE
  async createStudent(studentData: Partial<Student>) {
    const { data, error } = await supabase
      .from(getTableName('students'))
      .insert(studentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // READ (Single)
  async getStudentById(id: string) {
    const { data, error } = await supabase
      .from(getTableName('students'))
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // READ (List with filters)
  async getStudents(filters: {
    class_id?: string;
    section_id?: string;
    status?: string;
    search?: string;
  }) {
    let query = supabase
      .from(getTableName('students'))
      .select('*');
    
    if (filters.class_id) {
      query = query.eq('class_id', filters.class_id);
    }
    if (filters.section_id) {
      query = query.eq('section_id', filters.section_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,` +
        `last_name.ilike.%${filters.search}%,` +
        `admission_number.ilike.%${filters.search}%`
      );
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  // UPDATE
  async updateStudent(id: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from(getTableName('students'))
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // DELETE (Soft delete)
  async deleteStudent(id: string) {
    const { error } = await supabase
      .from(getTableName('students'))
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Complex query with joins
  async getStudentWithDetails(id: string) {
    const { data, error } = await supabase
      .from(getTableName('students'))
      .select(`
        *,
        class:classes_${INDEX_TOKEN}(class_name),
        section:sections_${INDEX_TOKEN}(section_name),
        parents:student_parent_relations_${INDEX_TOKEN}(
          parent:parents_${INDEX_TOKEN}(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

---

## 2. Authentication & Authorization

### Authentication Flow

```typescript
// src/lib/auth.ts
import { supabase } from '@/lib/supabase';

export const authService = {
  // Sign Up
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Additional metadata
      }
    });
    
    if (error) throw error;
    return data;
  },
  
  // Sign In
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },
  
  // Sign In with OTP
  async signInWithOTP(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone
    });
    
    if (error) throw error;
    return data;
  },
  
  // Verify OTP
  async verifyOTP(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    
    if (error) throw error;
    return data;
  },
  
  // Sign Out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // Get Current User
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  // Reset Password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};
```

### Role-Based Access Control (RBAC)

```typescript
// src/hooks/usePermissions.ts
import { useQuery } from '@tanstack/react-query';
import { supabase, getTableName } from '@/lib/supabase';

export const usePermissions = (userId: string) => {
  return useQuery(['permissions', userId], async () => {
    // Get user role
    const { data: user } = await supabase
      .from(getTableName('users'))
      .select('role')
      .eq('id', userId)
      .single();
    
    // Get permissions for role
    const { data: permissions } = await supabase
      .from(getTableName('permissions'))
      .select('*')
      .eq('role', user.role);
    
    // Convert to easy-to-use object
    const permissionMap = permissions.reduce((acc, perm) => {
      acc[perm.module] = {
        canView: perm.can_view,
        canCreate: perm.can_create,
        canEdit: perm.can_edit,
        canDelete: perm.can_delete
      };
      return acc;
    }, {});
    
    return permissionMap;
  });
};

// Usage in components
const StudentList = () => {
  const { data: permissions } = usePermissions(currentUser.id);
  
  if (!permissions?.studentManagement?.canView) {
    return <Unauthorized />;
  }
  
  return (
    <div>
      {/* List students */}
      {permissions.studentManagement.canCreate && (
        <Button onClick={createStudent}>Add Student</Button>
      )}
    </div>
  );
};
```

### Row Level Security (RLS) Policies

```sql
-- Students can only view their own records
-- Example: students_{INDEX_TOKEN} (e.g., students_1ENTK)
CREATE POLICY "Students can view own record"
ON students_{INDEX_TOKEN}
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Teachers can view students in their assigned classes
CREATE POLICY "Teachers can view assigned students"
ON students_{INDEX_TOKEN}
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM teacher_subjects_{INDEX_TOKEN} ts
    WHERE ts.teacher_id = (
      SELECT id FROM teachers_{INDEX_TOKEN} WHERE user_id = auth.uid()
    )
    AND ts.batch_id IN (
      SELECT batch_id FROM batch_students_{INDEX_TOKEN} 
      WHERE student_id = students_{INDEX_TOKEN}.id
    )
  )
);

-- Parents can view their children
CREATE POLICY "Parents can view their children"
ON students_{INDEX_TOKEN}
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM student_parent_relations_{INDEX_TOKEN} spr
    WHERE spr.parent_id = (SELECT id FROM parents_{INDEX_TOKEN} WHERE user_id = auth.uid())
    AND spr.student_id = students_{INDEX_TOKEN}.id
  )
);

-- Admins can view all students
CREATE POLICY "Admins can view all students"
ON students_{INDEX_TOKEN}
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM users_{INDEX_TOKEN}
    WHERE id = auth.uid()
    AND role IN ('admin_super', 'admin_hr', 'admin_academic')
  )
);

-- Only admins can create/update/delete students
CREATE POLICY "Admins can manage students"
ON students_{INDEX_TOKEN}
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users_{INDEX_TOKEN}
    WHERE id = auth.uid()
    AND role IN ('admin_super', 'admin_hr', 'admin_academic')
  )
);
```

---

## 3. Edge Functions (Supabase Functions)

For complex business logic that can't be handled by simple CRUD operations.

### Function Structure

```typescript
// supabase/functions/bulk-student-upload/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Parse request
    const { students, index_token } = await req.json();
    
    // Initialize Supabase client with service key for bypassing RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Validate data
    const validatedStudents = students.map(validateStudent);
    
    // Bulk insert
    const { data, error } = await supabase
      .from(`students_${index_token}`)
      .insert(validatedStudents)
      .select();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, count: data.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function validateStudent(student: any) {
  // Validation logic
  if (!student.first_name || !student.last_name) {
    throw new Error('Name is required');
  }
  // ... more validations
  return student;
}
```

### Common Edge Functions

1. **bulk-student-upload**: Bulk import students from Excel
2. **generate-report-card**: Generate PDF report cards
3. **send-bulk-notifications**: Send SMS/Email to multiple users
4. **calculate-attendance-percentage**: Complex attendance calculations
5. **process-fee-payment**: Handle online payment webhooks
6. **generate-timetable**: Auto-generate timetable with conflict detection
7. **sync-schema**: Sync schema changes across hubs (Dev Panel only)

### Invoking Edge Functions

```typescript
// src/services/bulkOperations.ts
import { supabase } from '@/lib/supabase';

export const bulkOperations = {
  async uploadStudents(studentsData: any[]) {
    const { data, error } = await supabase.functions.invoke(
      'bulk-student-upload',
      {
        body: {
          students: studentsData,
          index_token: INDEX_TOKEN
        }
      }
    );
    
    if (error) throw error;
    return data;
  },
  
  async generateReportCards(examId: string, classId: string) {
    const { data, error } = await supabase.functions.invoke(
      'generate-report-card',
      {
        body: { exam_id: examId, class_id: classId, index_token: INDEX_TOKEN }
      }
    );
    
    if (error) throw error;
    return data;
  }
};
```

---

## 4. Real-Time Subscriptions

Supabase provides real-time updates via WebSockets.

### Real-Time Attendance Updates

```typescript
// src/hooks/useRealtimeAttendance.ts
import { useEffect, useState } from 'react';
import { supabase, getTableName } from '@/lib/supabase';

export const useRealtimeAttendance = (date: string, classId: string) => {
  const [attendance, setAttendance] = useState([]);
  
  useEffect(() => {
    // Initial fetch
    fetchAttendance();
    
    // Subscribe to changes
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: getTableName('attendance'),
          filter: `date=eq.${date}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAttendance(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setAttendance(prev =>
              prev.map(item =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAttendance(prev =>
              prev.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, classId]);
  
  const fetchAttendance = async () => {
    const { data } = await supabase
      .from(getTableName('attendance'))
      .select('*')
      .eq('date', date)
      .eq('class_id', classId);
    
    setAttendance(data || []);
  };
  
  return attendance;
};
```

### Real-Time Notifications

```typescript
// src/hooks/useRealtimeNotifications.ts
export const useRealtimeNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: getTableName('notifications'),
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Show toast notification
          toast({
            title: payload.new.title,
            description: payload.new.message
          });
          
          setNotifications(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  return notifications;
};
```

---

## 5. File Upload (Cloudflare R2)

All media files are stored in Cloudflare R2, not in the database.

### File Upload Service

```typescript
// src/services/fileUploadService.ts
import { supabase } from '@/lib/supabase';

const R2_BUCKET_URL = import.meta.env.VITE_R2_BUCKET_URL;
const R2_PUBLIC_TOKEN = import.meta.env.VITE_R2_PUBLIC_TOKEN;

export const fileUploadService = {
  async uploadFile(file: File, folder: string): Promise<string> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${INDEX_TOKEN}/${folder}/${fileName}`;
    
    // Upload to R2 via presigned URL
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${R2_BUCKET_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${R2_PUBLIC_TOKEN}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('File upload failed');
    }
    
    const { url } = await response.json();
    return url;
  },
  
  async uploadStudentPhoto(studentId: string, file: File) {
    const url = await this.uploadFile(file, 'student-photos');
    
    // Update student record
    await supabase
      .from(getTableName('students'))
      .update({ photo_url: url })
      .eq('id', studentId);
    
    return url;
  },
  
  async uploadDocument(file: File, docType: string) {
    return await this.uploadFile(file, `documents/${docType}`);
  },
  
  async deleteFile(fileUrl: string) {
    // Extract file path from URL
    const filePath = fileUrl.replace(R2_BUCKET_URL, '');
    
    await fetch(`${R2_BUCKET_URL}${filePath}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${R2_PUBLIC_TOKEN}`
      }
    });
  }
};
```

### React Component Example

```typescript
// src/components/StudentPhotoUpload.tsx
import { useState } from 'react';
import { fileUploadService } from '@/services/fileUploadService';

export const StudentPhotoUpload = ({ studentId }: { studentId: string }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    
    setUploading(true);
    try {
      const url = await fileUploadService.uploadStudentPhoto(studentId, file);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <Spinner />}
    </div>
  );
};
```

---

## 6. Third-Party Integrations

### Payment Gateway (Razorpay)

```typescript
// src/services/paymentService.ts
import { supabase, getTableName } from '@/lib/supabase';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

export const paymentService = {
  async initiatePayment(studentFeeId: string, amount: number) {
    // Create Razorpay order via Edge Function
    const { data: order } = await supabase.functions.invoke(
      'create-razorpay-order',
      {
        body: { amount: amount * 100, currency: 'INR' } // Amount in paise
      }
    );
    
    // Open Razorpay checkout
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'EduMunch',
      description: 'Fee Payment',
      order_id: order.id,
      handler: async (response: any) => {
        // Payment successful
        await this.verifyPayment(studentFeeId, response);
      },
      prefill: {
        name: currentUser.name,
        email: currentUser.email,
        contact: currentUser.phone
      },
      theme: {
        color: '#4F46E5'
      }
    };
    
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  },
  
  async verifyPayment(studentFeeId: string, paymentData: any) {
    // Verify payment via Edge Function
    const { data, error } = await supabase.functions.invoke(
      'verify-razorpay-payment',
      {
        body: {
          payment_id: paymentData.razorpay_payment_id,
          order_id: paymentData.razorpay_order_id,
          signature: paymentData.razorpay_signature,
          student_fee_id: studentFeeId
        }
      }
    );
    
    if (error) throw error;
    return data;
  }
};
```

### SMS Gateway

```typescript
// src/services/smsService.ts
const SMS_API_KEY = import.meta.env.VITE_SMS_API_KEY;
const SMS_SENDER_ID = import.meta.env.VITE_SMS_SENDER_ID;

export const smsService = {
  async sendSMS(phone: string, message: string, type: string) {
    // Send via Edge Function
    const { error } = await supabase.functions.invoke('send-sms', {
      body: {
        phone,
        message,
        type,
        index_token: INDEX_TOKEN
      }
    });
    
    if (error) throw error;
  },
  
  async sendAttendanceAlert(studentId: string) {
    const { data: student } = await supabase
      .from(getTableName('students'))
      .select('first_name, last_name, parents:student_parent_relations_${INDEX_TOKEN}(parent:parents_${INDEX_TOKEN}(phone))')
      .eq('id', studentId)
      .single();
    
    const message = `Dear Parent, ${student.first_name} ${student.last_name} was absent today. - ${SCHOOL_NAME}`;
    
    for (const relation of student.parents) {
      await this.sendSMS(relation.parent.phone, message, 'attendance');
    }
  },
  
  async sendFeeReminder(studentId: string, dueAmount: number) {
    // Similar implementation
  }
};
```

### Email Service

```typescript
// src/services/emailService.ts
export const emailService = {
  async sendEmail(to: string, subject: string, body: string, type: string) {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        body,
        type,
        index_token: INDEX_TOKEN
      }
    });
    
    if (error) throw error;
  },
  
  async sendReportCard(studentId: string, reportCardUrl: string) {
    const { data: student } = await supabase
      .from(getTableName('students'))
      .select('email, first_name, last_name')
      .eq('id', studentId)
      .single();
    
    const subject = 'Report Card - Academic Year 2024-25';
    const body = `
      <h2>Dear ${student.first_name} ${student.last_name},</h2>
      <p>Your report card for the current academic year is now available.</p>
      <p><a href="${reportCardUrl}">Download Report Card</a></p>
      <p>Best Regards,<br>${SCHOOL_NAME}</p>
    `;
    
    await this.sendEmail(student.email, subject, body, 'report_card');
  }
};
```

---

## 7. API Error Handling

```typescript
// src/lib/apiErrorHandler.ts
export class APIError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any) => {
  console.error('API Error:', error);
  
  // Supabase errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        throw new APIError('Record already exists', 'DUPLICATE_ENTRY', 409);
      case '23503': // Foreign key violation
        throw new APIError('Referenced record not found', 'INVALID_REFERENCE', 400);
      case 'PGRST116': // No rows found
        throw new APIError('Record not found', 'NOT_FOUND', 404);
      default:
        throw new APIError(error.message, error.code, 500);
    }
  }
  
  // Network errors
  if (error instanceof TypeError) {
    throw new APIError('Network error. Please check your connection.', 'NETWORK_ERROR', 503);
  }
  
  throw new APIError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
};

// Usage in services
export const studentService = {
  async getStudentById(id: string) {
    try {
      const { data, error } = await supabase
        .from(getTableName('students'))
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleAPIError(error);
    }
  }
};
```

---

## 8. API Rate Limiting & Caching

### React Query Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      onError: handleAPIError
    },
    mutations: {
      retry: 1,
      onError: handleAPIError
    }
  }
});
```

### Usage with React Query

```typescript
// src/hooks/useStudents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';

export const useStudents = (filters: any) => {
  return useQuery(
    ['students', filters],
    () => studentService.getStudents(filters),
    {
      staleTime: 2 * 60 * 1000 // 2 minutes for student list
    }
  );
};

export const useStudent = (id: string) => {
  return useQuery(
    ['student', id],
    () => studentService.getStudentById(id),
    {
      enabled: !!id, // Only run if id exists
      staleTime: 5 * 60 * 1000
    }
  );
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (studentData: any) => studentService.createStudent(studentData),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(['students']);
        toast.success('Student created successfully');
      },
      onError: (error: APIError) => {
        toast.error(error.message);
      }
    }
  );
};
```

---

## API Summary

| Feature | Technology | Purpose |
|---------|-----------|---------|
| **CRUD Operations** | Supabase REST API | Auto-generated from database schema |
| **Authentication** | Supabase Auth | Email/password, OTP, session management |
| **Authorization** | RLS Policies | Row-level security per user role |
| **Complex Logic** | Edge Functions | Bulk operations, report generation |
| **Real-Time** | Supabase Realtime | Live attendance updates, notifications |
| **File Storage** | Cloudflare R2 | Images, documents, PDFs |
| **Payments** | Razorpay | Online fee payments |
| **SMS** | Third-party Gateway | Attendance alerts, reminders |
| **Email** | SMTP / SendGrid | Report cards, notifications |
| **Caching** | React Query | Reduce API calls, improve performance |

---

**Status:** Complete API & integration documentation ready for implementation.
