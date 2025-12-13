# Branches Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Branches represent physical or administrative divisions within an organization. A school can have multiple branches (locations), a coaching center can have multiple centers, etc. Each branch operates semi-independently with shared organization settings.

---

## Database Schema

### Branches Table

```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100),                                -- Unique per org
  description TEXT,
  
  -- Location
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  manager_user_id UUID,                             -- Branch admin/manager
  
  -- Capacity
  total_capacity INTEGER DEFAULT 500,               -- Total students
  max_classes INTEGER DEFAULT 20,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  opened_at DATE,
  closed_at DATE,
  
  -- Configuration
  default_time_zone VARCHAR(50),
  academic_calendar_id UUID,                        -- Reference to calendar
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_manager FOREIGN KEY (manager_user_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_branch_slug UNIQUE(org_id, slug)
);

-- Indexes
CREATE INDEX idx_branches_org_id ON branches(org_id);
CREATE INDEX idx_branches_manager ON branches(manager_user_id);
CREATE INDEX idx_branches_active ON branches(is_active);

-- RLS Policy
CREATE POLICY "branch_isolation" ON branches
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  );
```

### Branch Admins Table

```sql
CREATE TABLE branch_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',                 -- admin, manager, supervisor
  
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID,
  
  CONSTRAINT unique_admin UNIQUE(branch_id, user_id),
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_branch_admins_branch_id ON branch_admins(branch_id);
CREATE INDEX idx_branch_admins_user_id ON branch_admins(user_id);
```

### Branch Settings Table

```sql
CREATE TABLE branch_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL UNIQUE,
  
  -- Academic
  academic_year VARCHAR(20),
  default_batch_id UUID,
  
  -- Fee Settings (Branch-specific override)
  use_custom_fees BOOLEAN DEFAULT false,
  custom_fee_installments INTEGER,
  custom_late_fee_percentage DECIMAL(5, 2),
  
  -- Working Days
  working_days VARCHAR(50),                         -- Mon,Tue,Wed,Thu,Fri
  school_opening_time VARCHAR(8),                   -- HH:MM:SS
  school_closing_time VARCHAR(8),
  
  -- Holiday Calendar
  holiday_calendar JSONB DEFAULT '{}',              -- List of holidays
  
  -- Notification
  email_sender_address VARCHAR(255),
  sms_sender_id VARCHAR(50),
  
  -- Reports
  custom_report_header TEXT,
  custom_report_footer TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX idx_branch_settings_branch_id ON branch_settings(branch_id);
```

### Branch Departments Table

```sql
CREATE TABLE branch_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL,
  
  name VARCHAR(100),                                -- Science, Commerce, Humanities
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT unique_dept UNIQUE(branch_id, name)
);
```

---

## Implementation Files

### 1. Branch Types (src/types/branch.types.ts)

```typescript
export interface Branch {
  id: string;
  org_id: string;
  
  name: string;
  slug: string;
  description?: string;
  
  // Location
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  
  // Contact
  email?: string;
  phone?: string;
  manager_user_id?: string;
  
  // Details
  total_capacity?: number;
  max_classes?: number;
  is_active: boolean;
  opened_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface BranchSettings {
  id: string;
  branch_id: string;
  
  academic_year?: string;
  default_batch_id?: string;
  
  use_custom_fees?: boolean;
  custom_fee_installments?: number;
  
  working_days?: string;
  school_opening_time?: string;
  school_closing_time?: string;
  
  holiday_calendar?: Record<string, string>;
  
  metadata?: Record<string, any>;
}

export interface BranchDepartment {
  id: string;
  branch_id: string;
  name: string;
  description?: string;
}
```

### 2. Branch Service (src/services/branch.service.ts)

```typescript
import { supabase } from '@/services/api/client';
import { Branch, BranchSettings, BranchDepartment } from '@/types/branch.types';

export const branchService = {
  // Get branches for organization
  async getOrgBranches(orgId: string): Promise<Branch[]> {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get single branch
  async getBranch(branchId: string): Promise<Branch> {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Create branch
  async createBranch(orgId: string, branch: Partial<Branch>): Promise<Branch> {
    const { data, error } = await supabase
      .from('branches')
      .insert({
        ...branch,
        org_id: orgId,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Create branch settings
    await supabase
      .from('branch_settings')
      .insert({ branch_id: data.id });
    
    return data;
  },
  
  // Update branch
  async updateBranch(branchId: string, updates: Partial<Branch>): Promise<Branch> {
    const { data, error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', branchId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get branch settings
  async getBranchSettings(branchId: string): Promise<BranchSettings> {
    const { data, error } = await supabase
      .from('branch_settings')
      .select('*')
      .eq('branch_id', branchId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update branch settings
  async updateBranchSettings(
    branchId: string,
    updates: Partial<BranchSettings>
  ): Promise<BranchSettings> {
    const { data, error } = await supabase
      .from('branch_settings')
      .update(updates)
      .eq('branch_id', branchId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get branch departments
  async getBranchDepartments(branchId: string): Promise<BranchDepartment[]> {
    const { data, error } = await supabase
      .from('branch_departments')
      .select('*')
      .eq('branch_id', branchId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Add department
  async addDepartment(
    branchId: string,
    name: string,
    description?: string
  ): Promise<BranchDepartment> {
    const { data, error } = await supabase
      .from('branch_departments')
      .insert({
        branch_id: branchId,
        name,
        description,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Assign branch admin
  async assignBranchAdmin(
    branchId: string,
    userId: string,
    role: string = 'admin'
  ) {
    const { data, error } = await supabase
      .from('branch_admins')
      .insert({
        branch_id: branchId,
        user_id: userId,
        role,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get branch users
  async getBranchUsers(branchId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('branch_id', branchId);
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

### 3. Branch Store (src/store/branch.store.ts)

```typescript
import { create } from 'zustand';
import { Branch, BranchSettings } from '@/types/branch.types';
import { branchService } from '@/services/branch.service';

interface BranchState {
  current: Branch | null;
  settings: BranchSettings | null;
  all: Branch[];
  
  selectBranch: (branchId: string) => Promise<void>;
  loadBranches: (orgId: string) => Promise<void>;
  loadSettings: (branchId: string) => Promise<void>;
  updateBranch: (updates: Partial<Branch>) => Promise<void>;
  updateSettings: (updates: Partial<BranchSettings>) => Promise<void>;
  clear: () => void;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  current: null,
  settings: null,
  all: [],
  
  selectBranch: async (branchId) => {
    try {
      const branch = await branchService.getBranch(branchId);
      const settings = await branchService.getBranchSettings(branchId);
      set({ current: branch, settings });
    } catch (error) {
      console.error('Failed to select branch:', error);
    }
  },
  
  loadBranches: async (orgId) => {
    try {
      const branches = await branchService.getOrgBranches(orgId);
      set({ all: branches });
      
      // Select first branch if available
      if (branches.length > 0) {
        await get().selectBranch(branches[0].id);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  },
  
  loadSettings: async (branchId) => {
    try {
      const settings = await branchService.getBranchSettings(branchId);
      set({ settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  updateBranch: async (updates) => {
    const current = get().current;
    if (!current) return;
    
    try {
      const updated = await branchService.updateBranch(current.id, updates);
      set({ current: updated });
    } catch (error) {
      console.error('Failed to update branch:', error);
    }
  },
  
  updateSettings: async (updates) => {
    const current = get().current;
    if (!current) return;
    
    try {
      const updated = await branchService.updateBranchSettings(current.id, updates);
      set({ settings: updated });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
  
  clear: () => {
    set({ current: null, settings: null, all: [] });
  },
}));
```

### 4. Branch Selector Component (src/components/common/BranchSelector.tsx)

```typescript
import React from 'react';
import { useBranchStore } from '@/store/branch.store';
import { useOrganizationStore } from '@/store/organization.store';

export const BranchSelector: React.FC = () => {
  const { all: branches, current, selectBranch, loadBranches } = useBranchStore();
  const { current: org } = useOrganizationStore();
  
  React.useEffect(() => {
    if (org?.id) {
      loadBranches(org.id);
    }
  }, [org?.id, loadBranches]);
  
  if (branches.length === 0) {
    return <div>No branches available</div>;
  }
  
  if (branches.length === 1) {
    return <div className="text-sm text-gray-600">{branches[0].name}</div>;
  }
  
  return (
    <select
      value={current?.id || ''}
      onChange={(e) => selectBranch(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md"
    >
      <option value="">Select Branch</option>
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  );
};
```

### 5. Branch Settings Component (src/components/admin/BranchSettings.tsx)

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { useBranchStore } from '@/store/branch.store';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

export const BranchSettingsForm: React.FC = () => {
  const { current, settings, updateBranch, updateSettings } = useBranchStore();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const { register, handleSubmit } = useForm({
    defaultValues: current || {},
  });
  
  const onSubmitBranch = async (data: any) => {
    setIsSaving(true);
    try {
      await updateBranch(data);
    } finally {
      setIsSaving(false);
    }
  };
  
  const { register: registerSettings, handleSubmit: handleSubmitSettings } = useForm({
    defaultValues: settings || {},
  });
  
  const onSubmitSettings = async (data: any) => {
    setIsSaving(true);
    try {
      await updateSettings(data);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Branch Information</h2>
        <form onSubmit={handleSubmit(onSubmitBranch)} className="space-y-4">
          <FormInput
            label="Branch Name"
            {...register('name')}
          />
          
          <FormInput
            label="Email"
            type="email"
            {...register('email')}
          />
          
          <FormInput
            label="Phone"
            {...register('phone')}
          />
          
          <FormInput
            label="City"
            {...register('city')}
          />
          
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save Branch Info
          </Button>
        </form>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Branch Settings</h2>
        <form onSubmit={handleSubmitSettings(onSubmitSettings)} className="space-y-4">
          <FormInput
            label="Academic Year"
            {...registerSettings('academic_year')}
          />
          
          <FormInput
            label="School Opening Time"
            type="time"
            {...registerSettings('school_opening_time')}
          />
          
          <FormInput
            label="School Closing Time"
            type="time"
            {...registerSettings('school_closing_time')}
          />
          
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
};
```

---

## Branch Workflow

### Single Branch Organization
- Most organizations start with one branch
- Branch creation optional
- All data belongs to the org by default

### Multi-Branch Organization
- Create branches for each location
- Assign branch managers/admins
- Branch-specific settings (timings, fees, holidays)
- Cross-branch reporting available for org admin

---

## RLS with Branches

```sql
-- Example: Users can see students from their branch
CREATE POLICY "student_branch_access" ON students
  USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM branch_admins 
      WHERE branch_id = students.branch_id 
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users u2 
      WHERE u2.id = auth.uid()
      AND u2.role_id IN (
        SELECT id FROM roles WHERE slug IN ('org_admin', 'super_admin')
      )
    )
  );
```

---

## Next Steps

1. ✅ Create branches table
2. ✅ Implement branch service
3. ✅ Create branch selector
4. ✅ Build branch settings page
5. ✅ Proceed to `11_FEATURE_FLAGS.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Branches Management Complete  
**Next Phase:** 11_FEATURE_FLAGS.md
