# Student Profiles

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Student Profiles manage comprehensive student information including academic history, contact details, emergency contacts, and learning preferences.

---

## Database Schema

### Student Profile Tables

```sql
-- Extended Student Profile
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  
  -- Personal Info
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  nationality VARCHAR(100),
  
  -- Contact
  phone_number VARCHAR(20),
  alternate_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Parents/Guardians
  father_name VARCHAR(255),
  father_phone VARCHAR(20),
  mother_name VARCHAR(255),
  mother_phone VARCHAR(20),
  guardian_name VARCHAR(255),
  guardian_relation VARCHAR(100),
  guardian_phone VARCHAR(20),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_relation VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  -- Medical
  medical_conditions TEXT[],
  allergies TEXT[],
  medications TEXT,
  
  -- Academics
  previous_school VARCHAR(255),
  previous_grade VARCHAR(50),
  admission_date DATE,
  
  -- Documents
  aadhar_number VARCHAR(20),
  passport_number VARCHAR(30),
  admit_card_url TEXT,
  transfer_certificate_url TEXT,
  
  -- Preferences
  medium_of_instruction VARCHAR(50),                 -- 'English', 'Hindi', etc
  learning_style JSONB DEFAULT '{}',                 -- { visual, auditory, kinesthetic }
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Student Siblings (For organization purposes)
CREATE TABLE student_siblings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  
  sibling_name VARCHAR(255),
  sibling_grade VARCHAR(50),
  sibling_school VARCHAR(255),
  relation VARCHAR(50),                             -- 'brother', 'sister'
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- Student Medical Records
CREATE TABLE student_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  
  record_date DATE,
  record_type VARCHAR(100),                         -- 'vaccination', 'checkup', 'injury', 'illness'
  description TEXT,
  
  doctor_name VARCHAR(255),
  clinic_name VARCHAR(255),
  
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- Student Academic History (Previous Schools/Institutions)
CREATE TABLE student_academic_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  
  institution_name VARCHAR(255),
  institution_type VARCHAR(50),                     -- 'school', 'college', 'tuition'
  
  start_date DATE,
  end_date DATE,
  grade_studied VARCHAR(50),
  
  percentage DECIMAL(5, 2),
  result VARCHAR(50),                               -- 'pass', 'fail', 'distinction'
  
  certificate_url TEXT,
  notes TEXT,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- Student Guardian Mapping (Can have multiple guardians)
CREATE TABLE student_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  
  guardian_type VARCHAR(50),                        -- 'father', 'mother', 'uncle', 'guardian'
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  occupation VARCHAR(100),
  
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_org ON student_profiles(org_id);
CREATE INDEX idx_student_profiles_active ON student_profiles(is_active);
CREATE INDEX idx_medical_records_student ON student_medical_records(student_id);
CREATE INDEX idx_guardians_student ON student_guardians(student_id);
```

---

## Student Profile Components

### 1. Student Profile View

```typescript
// src/components/student/StudentProfile/ProfileView.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { studentService } from '@/services/student/student.service';
import { Card } from '@/components/common/cards/Card';
import { Edit2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user } = useUserStore();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => studentService.getStudentProfile(user!.id),
    enabled: !!user,
  });
  
  const { data: guardians = [] } = useQuery({
    queryKey: ['student-guardians', user?.id],
    queryFn: () => studentService.getGuardians(user!.id),
    enabled: !!user,
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;
  
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Personal Information</h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Edit2 size={16} />
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="font-medium">
              {profile.date_of_birth
                ? new Date(profile.date_of_birth).toLocaleDateString()
                : 'Not provided'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-medium">{profile.gender || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Blood Group</p>
            <p className="font-medium">{profile.blood_group || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Nationality</p>
            <p className="font-medium">{profile.nationality || 'Not provided'}</p>
          </div>
          
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">{profile.address || 'Not provided'}</p>
          </div>
        </div>
      </Card>
      
      {/* Contact Information */}
      <Card>
        <h2 className="text-xl font-bold mb-6">Contact Information</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{profile.phone_number || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Alternate Phone</p>
            <p className="font-medium">{profile.alternate_phone || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">City</p>
            <p className="font-medium">{profile.city || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Postal Code</p>
            <p className="font-medium">{profile.postal_code || 'Not provided'}</p>
          </div>
        </div>
      </Card>
      
      {/* Parents/Guardians */}
      <Card>
        <h2 className="text-xl font-bold mb-6">Guardians</h2>
        
        <div className="space-y-4">
          {guardians.map((guardian) => (
            <div
              key={guardian.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{guardian.guardian_name}</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {guardian.guardian_type}
                </span>
              </div>
              <p className="text-sm text-gray-600">Phone: {guardian.guardian_phone}</p>
              {guardian.occupation && (
                <p className="text-sm text-gray-600">Occupation: {guardian.occupation}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
      
      {/* Medical Information */}
      {profile.medical_conditions && profile.medical_conditions.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-6">Medical Information</h2>
          
          {profile.medical_conditions.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Medical Conditions</p>
              <div className="flex flex-wrap gap-2">
                {profile.medical_conditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {profile.allergies && profile.allergies.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
```

### 2. Edit Profile Form

```typescript
// src/components/student/StudentProfile/EditProfileForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { studentService } from '@/services/student/student.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

const profileSchema = z.object({
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  onSuccess: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ onSuccess }) => {
  const { user } = useUserStore();
  
  const { data: profile } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => studentService.getStudentProfile(user!.id),
    enabled: !!user,
  });
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });
  
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: ProfileFormData) =>
      studentService.updateStudentProfile(user!.id, data),
    onSuccess,
  });
  
  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Date of Birth"
          type="date"
          {...register('date_of_birth')}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            {...register('gender')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <FormInput
        label="Blood Group"
        {...register('blood_group')}
        placeholder="O+, A-, B+, etc"
      />
      
      <FormInput
        label="Phone Number"
        type="tel"
        {...register('phone_number')}
        error={errors.phone_number?.message}
      />
      
      <FormInput
        label="Address"
        as="textarea"
        {...register('address')}
      />
      
      <div className="grid grid-cols-3 gap-4">
        <FormInput
          label="City"
          {...register('city')}
        />
        
        <FormInput
          label="State"
          {...register('postal_code')}
        />
        
        <FormInput
          label="Postal Code"
          {...register('postal_code')}
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="flex-1"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};
```

---

## Student Service

```typescript
// src/services/student/student.service.ts
import { supabase } from '@/services/api/client';

export const studentService = {
  async getStudentProfile(userId: string) {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async updateStudentProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getGuardians(userId: string) {
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!profile) return [];
    
    const { data, error } = await supabase
      .from('student_guardians')
      .select('*')
      .eq('student_id', profile.id)
      .order('is_primary', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async addGuardian(userId: string, guardianData: any) {
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    const { data, error } = await supabase
      .from('student_guardians')
      .insert({
        student_id: profile.id,
        ...guardianData,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getMedicalRecords(userId: string) {
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!profile) return [];
    
    const { data, error } = await supabase
      .from('student_medical_records')
      .select('*')
      .eq('student_id', profile.id)
      .order('record_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getAcademicHistory(userId: string) {
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!profile) return [];
    
    const { data, error } = await supabase
      .from('student_academic_history')
      .select('*')
      .eq('student_id', profile.id)
      .order('end_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create student profile schema
2. ✅ Implement profile view component
3. ✅ Build edit profile form
4. ✅ Create student service
5. ✅ Proceed to `22_STUDENT_DASHBOARD.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Student Profiles Complete  
**Next Phase:** 22_STUDENT_DASHBOARD.md
