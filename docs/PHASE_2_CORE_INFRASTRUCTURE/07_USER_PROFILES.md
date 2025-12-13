# User Profiles

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The User Profile system manages all user-related data beyond authentication. Unlike Supabase Auth metadata, profiles are stored in the database and include rich information about each user.

---

## Architecture

### User Profile Data Model

```
┌─ Users (Base Profile)
│  ├─ Identity (email, name, phone)
│  ├─ Media (avatar)
│  ├─ Status (active/inactive/suspended)
│  └─ Metadata (custom fields per org)
│
├─ Student Profiles (Sub-type)
│  ├─ Roll number
│  ├─ Parent reference
│  └─ Academic details
│
├─ Teacher Profiles (Sub-type)
│  ├─ Subject specialization
│  ├─ Qualification
│  └─ Experience
│
├─ Employee Profiles (Sub-type)
│  ├─ Department
│  ├─ Designation
│  └─ Salary scale
│
└─ Parent Profiles (Sub-type)
   ├─ Occupation
   ├─ Children references
   └─ Contact preferences
```

---

## Database Schema

### User Profiles Table Structure

```sql
-- Main users table (already covered in authentication)
-- This section covers additional profile tables

-- 1. Student Profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  branch_id UUID,
  
  -- Academic Info
  roll_number VARCHAR(50),                          -- Unique per batch
  enrollment_number VARCHAR(50) UNIQUE,
  current_batch_id UUID,
  current_class_id UUID,
  admission_date DATE,
  
  -- Parent/Guardian Info
  parent_user_id UUID,                              -- Linked to parent account
  secondary_parent_user_id UUID,                    -- Second parent/guardian
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  
  -- Financial Info
  fee_amount DECIMAL(10, 2),
  fee_category VARCHAR(100),                        -- Regular, Scholarship, etc
  fee_installments INTEGER DEFAULT 1,
  
  -- Additional Info
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(5),
  religion VARCHAR(50),
  caste VARCHAR(50),
  disability_status BOOLEAN DEFAULT false,
  disability_type VARCHAR(255),
  
  -- Document Uploads
  aadhar_number VARCHAR(12),                        -- Encrypted
  pan_number VARCHAR(10),                           -- Encrypted
  
  -- Preferences
  communication_language VARCHAR(50) DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',                      -- Custom fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_batch FOREIGN KEY (current_batch_id) 
    REFERENCES batches(id) ON DELETE SET NULL,
  CONSTRAINT fk_parent FOREIGN KEY (parent_user_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_student_org_id ON student_profiles(org_id);
CREATE INDEX idx_student_batch_id ON student_profiles(current_batch_id);
CREATE INDEX idx_student_parent ON student_profiles(parent_user_id);
CREATE INDEX idx_student_enrollment ON student_profiles(enrollment_number);

-- RLS Policy
CREATE POLICY "student_profile_isolation" ON student_profiles
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- 2. Teacher Profiles
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  branch_id UUID,
  
  -- Professional Info
  employee_id VARCHAR(50) UNIQUE,
  designation VARCHAR(100),
  department VARCHAR(100),
  joining_date DATE,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  
  -- Subject/Expertise
  subject_ids UUID[],                               -- Array of subject IDs
  specialization VARCHAR(255),
  
  -- Teaching Load
  max_classes_per_week INTEGER DEFAULT 20,
  max_students_per_class INTEGER DEFAULT 50,
  
  -- Bank Info (for salary)
  bank_account_number VARCHAR(50),                  -- Encrypted
  bank_ifsc_code VARCHAR(11),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE SET NULL
);

CREATE INDEX idx_teacher_org_id ON teacher_profiles(org_id);
CREATE INDEX idx_teacher_branch_id ON teacher_profiles(branch_id);

CREATE POLICY "teacher_profile_isolation" ON teacher_profiles
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- 3. Parent Profiles
CREATE TABLE parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  
  -- Personal Info
  occupation VARCHAR(255),
  employer VARCHAR(255),
  
  -- Children (links to student_profiles.parent_user_id)
  -- Query: SELECT * FROM student_profiles WHERE parent_user_id = auth.uid()
  
  -- Contact Preferences
  preferred_contact_method VARCHAR(50),              -- email, sms, app
  preferred_language VARCHAR(50),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_parent_org_id ON parent_profiles(org_id);

-- 4. Employee Profiles (General)
CREATE TABLE employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  branch_id UUID,
  
  -- Professional Info
  employee_id VARCHAR(50) UNIQUE,
  designation VARCHAR(100),
  department VARCHAR(100),
  joining_date DATE,
  
  -- Bank Info
  bank_account_number VARCHAR(50),                  -- Encrypted
  bank_ifsc_code VARCHAR(11),
  
  -- Leave/Attendance
  leaves_per_year INTEGER DEFAULT 20,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE SET NULL
);

-- 5. User Skills (for matching, recommendations)
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  skill_name VARCHAR(100),
  proficiency_level VARCHAR(50),                    -- beginner, intermediate, expert
  endorsements_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_skill UNIQUE(user_id, skill_name)
);

-- 6. User Qualifications
CREATE TABLE user_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  qualification_type VARCHAR(100),                  -- BSc, MSc, PhD, etc
  qualification_name VARCHAR(255),
  institution VARCHAR(255),
  year_of_completion INTEGER,
  score DECIMAL(5, 2),
  grade VARCHAR(10),
  certificate_url TEXT,                             -- Storage URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- 7. User Preferences & Settings
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  
  -- UI Preferences
  theme VARCHAR(20) DEFAULT 'light',                -- light, dark
  language VARCHAR(50) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  
  -- Privacy Settings
  profile_visibility VARCHAR(50),                   -- public, private, org_only
  show_contact_info BOOLEAN DEFAULT true,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- 8. User Activity Log
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  
  activity_type VARCHAR(100),                       -- 'login', 'logout', 'view_page', 'submit_assignment'
  resource_type VARCHAR(100),                       -- 'assignment', 'course', etc
  resource_id UUID,
  action VARCHAR(50),                               -- 'view', 'create', 'update', 'delete'
  
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  duration_seconds INTEGER,                         -- How long they spent
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON user_activity_log(created_at);
```

---

## Implementation Files

### 1. User Profile Types (src/types/user.types.ts)

```typescript
export interface UserProfile {
  id: string;
  org_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  primary_role: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface StudentProfile extends UserProfile {
  roll_number?: string;
  enrollment_number?: string;
  current_batch_id?: string;
  parent_user_id?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
}

export interface TeacherProfile extends UserProfile {
  employee_id?: string;
  designation?: string;
  experience_years?: number;
  subject_ids?: string[];
  specialization?: string;
}

export interface ParentProfile extends UserProfile {
  occupation?: string;
  preferred_contact_method?: string;
  children?: StudentProfile[];
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export interface Qualification {
  id: string;
  qualification_type: string;
  qualification_name: string;
  institution: string;
  year_of_completion: number;
  score?: number;
  certificate_url?: string;
}

export interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'expert';
  endorsements_count: number;
}
```

### 2. User Profile Service (src/services/user.profile.service.ts)

```typescript
import { supabase } from '@/services/api/client';
import { StudentProfile, TeacherProfile, UserProfile } from '@/types/user.types';

export const userProfileService = {
  // Fetch user profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update basic profile
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get student profile with related data
  async getStudentProfile(userId: string): Promise<StudentProfile> {
    const { data, error } = await supabase
      .from('student_profiles')
      .select(`
        *,
        user:users(*)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      ...data.user,
      ...data,
    };
  },
  
  // Update student profile
  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>) {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const filePath = `${userId}/avatar`;
    
    // Delete old avatar if exists
    try {
      await supabase.storage
        .from('avatars')
        .remove([filePath]);
    } catch {}
    
    // Upload new avatar
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    
    if (error) throw new Error(error.message);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);
    
    // Update user profile
    await this.updateProfile(userId, {
      avatar_url: publicUrl,
    });
    
    return publicUrl;
  },
  
  // Get user preferences
  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update user preferences
  async updatePreferences(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get qualifications
  async getQualifications(userId: string) {
    const { data, error } = await supabase
      .from('user_qualifications')
      .select('*')
      .eq('user_id', userId)
      .order('year_of_completion', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Add qualification
  async addQualification(userId: string, qualification: any) {
    const { data, error } = await supabase
      .from('user_qualifications')
      .insert({
        user_id: userId,
        ...qualification,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get skills
  async getSkills(userId: string) {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Add skill
  async addSkill(userId: string, skill: any) {
    const { data, error } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        ...skill,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Log user activity
  async logActivity(userId: string, activity: any) {
    await supabase.from('user_activity_log').insert({
      user_id: userId,
      ...activity,
    });
  },
};
```

### 3. Profile Hook (src/hooks/useUserProfile.ts)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { userProfileService } from '@/services/user.profile.service';
import { UserProfile } from '@/types/user.types';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userProfileService.getUserProfile(userId),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) =>
      userProfileService.updateProfile(userId, updates),
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      userProfileService.uploadAvatar(userId, file),
  });
}
```

### 4. Profile Edit Component (src/components/common/UserProfileEdit.tsx)

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { useUserProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useUserProfile';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

interface UserProfileEditProps {
  userId: string;
}

export const UserProfileEdit: React.FC<UserProfileEditProps> = ({ userId }) => {
  const { data: profile, isLoading } = useUserProfile(userId);
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: uploadAvatar } = useUploadAvatar();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: profile,
  });
  
  const onSubmit = (data: any) => {
    updateProfile({ userId, updates: data });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar({ userId, file });
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-4">
        <img 
          src={profile?.avatar_url || '/default-avatar.png'} 
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="block"
        />
      </div>
      
      <FormInput
        label="First Name"
        {...register('first_name')}
        error={errors.first_name?.message}
      />
      
      <FormInput
        label="Last Name"
        {...register('last_name')}
        error={errors.last_name?.message}
      />
      
      <FormInput
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <FormInput
        label="Phone"
        {...register('phone')}
        error={errors.phone?.message}
      />
      
      <Button type="submit" variant="primary">
        Save Changes
      </Button>
    </form>
  );
};
```

---

## Custom Fields Support

### Custom Fields Table

```sql
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  module VARCHAR(100),                              -- 'users', 'students', 'teachers'
  field_name VARCHAR(100),
  field_label VARCHAR(255),
  field_type VARCHAR(50),                           -- text, email, number, date, select
  field_options JSONB,                              -- For select fields
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT unique_field UNIQUE(org_id, module, field_name)
);

-- Custom field values stored in metadata JSONB
-- Example: users.metadata = { "custom_field_name": "value" }
```

---

## Migration Query

```sql
-- Add custom fields to metadata when accessing
SELECT 
  users.*,
  jsonb_object_agg(cf.field_name, users.metadata -> cf.field_name) as custom_fields
FROM users
LEFT JOIN custom_fields cf ON true
WHERE users.id = 'user-id'
GROUP BY users.id;
```

---

## Next Steps

1. ✅ Create user profile tables
2. ✅ Implement profile service
3. ✅ Create profile edit components
4. ✅ Add avatar upload support
5. ✅ Proceed to `08_ROLES_PERMISSIONS_SYSTEM.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ User Profiles Complete  
**Next Phase:** 08_ROLES_PERMISSIONS_SYSTEM.md
