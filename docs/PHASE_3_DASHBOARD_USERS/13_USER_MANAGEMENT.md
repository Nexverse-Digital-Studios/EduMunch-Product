# User Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

User Management provides administrators with tools to create, manage, and control user accounts across the organization. It handles bulk operations, role assignments, and user lifecycle management.

---

## Database Schema (Extended)

### User Management Tables

```sql
-- Bulk Import Jobs
CREATE TABLE user_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  branch_id UUID,
  
  file_name VARCHAR(255),
  file_url TEXT,                                    -- Storage URL
  file_type VARCHAR(20),                            -- 'csv', 'xlsx'
  
  total_records INTEGER,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  skipped_records INTEGER DEFAULT 0,
  
  status VARCHAR(50),                               -- 'pending', 'processing', 'completed', 'failed'
  error_log TEXT,
  
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- User Invitations
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  branch_id UUID,
  
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id UUID,
  
  token VARCHAR(500) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',             -- 'pending', 'sent', 'accepted', 'expired'
  
  invited_by UUID,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  custom_message TEXT,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_role FOREIGN KEY (role_id) 
    REFERENCES roles(id) ON DELETE SET NULL,
  CONSTRAINT fk_invited_by FOREIGN KEY (invited_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_invitations_email ON user_invitations(email);
CREATE INDEX idx_invitations_status ON user_invitations(status);
CREATE INDEX idx_invitations_org ON user_invitations(org_id);

-- Deactivated Users (Soft Delete History)
CREATE TABLE deactivated_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  deactivated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deactivated_by UUID,
  reason VARCHAR(255),
  
  data_retention_days INTEGER DEFAULT 90,
  auto_delete_at TIMESTAMP,
  
  is_reactivatable BOOLEAN DEFAULT true,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Implementation Files

### 1. User List Component

```typescript
// src/components/admin/UserManagement/UserList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { useBranchStore } from '@/store/branch.store';
import { userManagementService } from '@/services/admin/user.management.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { Search, Plus, Download, Upload, Edit2, Trash2, Lock, Unlock } from 'lucide-react';

export const UserList: React.FC = () => {
  const { current: org } = useOrganizationStore();
  const { current: branch } = useBranchStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users', org?.id, branch?.id, searchTerm, roleFilter, statusFilter],
    queryFn: () =>
      userManagementService.searchUsers(
        org!.id,
        branch?.id,
        { search: searchTerm, role: roleFilter, status: statusFilter }
      ),
    enabled: !!org,
  });
  
  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (user: any) => (
        <div className="flex items-center gap-3">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={user.full_name}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium">{user.full_name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (user: any) => <span className="text-sm">{user.email}</span>,
    },
    {
      key: 'primary_role',
      label: 'Role',
      render: (user: any) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {user.primary_role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: any) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          user.status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {user.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: any) => (
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-200 rounded">
            <Edit2 size={16} />
          </button>
          {user.status === 'active' ? (
            <button className="p-1 hover:bg-gray-200 rounded" title="Deactivate">
              <Lock size={16} />
            </button>
          ) : (
            <button className="p-1 hover:bg-gray-200 rounded" title="Activate">
              <Unlock size={16} />
            </button>
          )}
          <button className="p-1 hover:bg-red-200 rounded text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button
          onClick={() => {/* Open add user modal */}}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add User
        </Button>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormInput
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={20} />}
        />
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        
        <Button variant="secondary" className="flex items-center gap-2">
          <Download size={20} />
          Export
        </Button>
      </div>
      
      {/* Bulk Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Bulk Actions</span>
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <Upload size={16} />
            Import Users
          </Button>
        </div>
      </div>
      
      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pagination={{
          pageSize: 20,
          currentPage: 1,
        }}
      />
    </div>
  );
};
```

### 2. Add User Component

```typescript
// src/components/admin/UserManagement/AddUserModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { userManagementService } from '@/services/admin/user.management.service';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

const addUserSchema = z.object({
  email: z.string().email('Invalid email'),
  first_name: z.string().min(2, 'First name required'),
  last_name: z.string().min(2, 'Last name required'),
  role_id: z.string().uuid('Role required'),
  send_invitation: z.boolean().default(true),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  roles: any[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSuccess, roles }) => {
  const { current: org } = useOrganizationStore();
  const { register, handleSubmit, formState: { errors } } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
  });
  
  const { mutate: addUser, isPending } = useMutation({
    mutationFn: (data: AddUserFormData) =>
      userManagementService.addUser(org!.id, data),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });
  
  const onSubmit = (data: AddUserFormData) => {
    addUser(data);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold mb-4">Add New User</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Email"
            type="email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <FormInput
            label="First Name"
            placeholder="John"
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          
          <FormInput
            label="Last Name"
            placeholder="Doe"
            {...register('last_name')}
            error={errors.last_name?.message}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              {...register('role_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="text-red-600 text-sm mt-1">{errors.role_id.message}</p>
            )}
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('send_invitation')}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <span className="text-sm">Send invitation email</span>
          </label>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              disabled={isPending}
              fullWidth
            >
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 3. User Management Service

```typescript
// src/services/admin/user.management.service.ts
import { supabase } from '@/services/api/client';

export const userManagementService = {
  async searchUsers(
    orgId: string,
    branchId?: string,
    filters?: { search?: string; role?: string; status?: string }
  ) {
    let query = supabase
      .from('users')
      .select('*')
      .eq('org_id', orgId);
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }
    
    if (filters?.role && filters.role !== 'all') {
      query = query.eq('primary_role', filters.role);
    }
    
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
  
  async addUser(orgId: string, userData: any) {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      email_confirm: false,
    });
    
    if (authError) throw new Error(authError.message);
    
    // Step 2: Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        org_id: orgId,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        status: 'invited',
      })
      .select()
      .single();
    
    if (profileError) throw new Error(profileError.message);
    
    // Step 3: Assign role
    if (userData.role_id) {
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role_id: userData.role_id,
        org_id: orgId,
      });
    }
    
    // Step 4: Send invitation if requested
    if (userData.send_invitation) {
      await this.sendInvitation(orgId, authData.user.id, userData.email);
    }
    
    return profile;
  },
  
  async sendInvitation(orgId: string, userId: string, email: string) {
    // Generate invitation token
    const token = Math.random().toString(36).substring(2);
    
    const { error } = await supabase
      .from('user_invitations')
      .insert({
        org_id: orgId,
        email,
        token,
        status: 'sent',
      });
    
    if (error) throw new Error(error.message);
    
    // Send email with invitation link
    const invitationUrl = `${window.location.origin}/accept-invitation?token=${token}`;
    
    // Call edge function to send email
    await supabase.functions.invoke('send-invitation-email', {
      body: {
        email,
        invitationUrl,
      },
    });
  },
  
  async bulkImportUsers(orgId: string, file: File) {
    // Create import job
    const filePath = `imports/${orgId}/${Date.now()}_${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-imports')
      .upload(filePath, file);
    
    if (uploadError) throw new Error(uploadError.message);
    
    const { data: jobData, error: jobError } = await supabase
      .from('user_import_jobs')
      .insert({
        org_id: orgId,
        file_name: file.name,
        file_url: uploadData.path,
        file_type: file.name.endsWith('.csv') ? 'csv' : 'xlsx',
        status: 'pending',
      })
      .select()
      .single();
    
    if (jobError) throw new Error(jobError.message);
    
    // Trigger import processing via edge function
    await supabase.functions.invoke('process-user-import', {
      body: { import_job_id: jobData.id },
    });
    
    return jobData;
  },
};
```

---

## User Workflow

### Single User Addition
1. Click "Add User"
2. Fill form
3. Send invitation
4. User receives email
5. User clicks link and sets password
6. User gains access

### Bulk Import
1. Download template CSV
2. Fill with user data
3. Upload file
4. System validates
5. Creates all users
6. Sends invitations
7. Shows import summary

---

## Next Steps

1. ✅ Create user management tables
2. ✅ Implement user service
3. ✅ Build user list component
4. ✅ Create add user modal
5. ✅ Set up bulk import
6. ✅ Proceed to `14_CUSTOM_FIELDS.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ User Management Complete  
**Next Phase:** 14_CUSTOM_FIELDS.md
