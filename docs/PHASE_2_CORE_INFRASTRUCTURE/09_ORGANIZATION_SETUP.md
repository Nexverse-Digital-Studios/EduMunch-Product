# Organization Setup

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The Organization Setup system handles multi-tenancy initialization, allowing each educational institution to set up their own workspace independently.

---

## Database Schema

### Organizations Table

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,                -- URL-friendly identifier
  description TEXT,
  website VARCHAR(255),
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Address
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  logo_bucket_path VARCHAR(255),
  banner_bucket_path VARCHAR(255),
  brand_color VARCHAR(7),                           -- Hex color
  
  -- Organization Type
  org_type VARCHAR(50),                             -- 'school', 'coaching', 'online', 'ngо'
  establishment_year INTEGER,
  affiliation VARCHAR(100),                         -- CBSE, ICSE, State Board, etc
  
  -- License & Compliance
  license_key VARCHAR(255),                         -- For multi-tenant licensing
  license_type VARCHAR(50),                         -- 'free', 'starter', 'professional'
  max_users INTEGER DEFAULT 100,
  max_storage_gb INTEGER DEFAULT 10,
  
  -- Settings
  language VARCHAR(50) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  currency VARCHAR(3) DEFAULT 'INR',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  financial_year_start SMALLINT DEFAULT 4,         -- April (for India)
  
  -- Subscription
  subscription_start_date DATE,
  subscription_end_date DATE,
  subscription_status VARCHAR(50),                  -- 'active', 'trial', 'cancelled', 'expired'
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',                      -- Custom settings
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_status ON organizations(is_active);
CREATE INDEX idx_org_subscription ON organizations(subscription_status);

-- RLS Policy
CREATE POLICY "org_isolation" ON organizations
  USING (
    id = (SELECT org_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND users.id IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (
        SELECT id FROM roles WHERE slug = 'super_admin'
      )
    ))
  );
```

### Organization Admins Table

```sql
CREATE TABLE organization_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  is_owner BOOLEAN DEFAULT false,                   -- Primary owner
  
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  
  CONSTRAINT unique_admin UNIQUE(org_id, user_id),
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_org_id ON organization_admins(org_id);
CREATE INDEX idx_admin_user_id ON organization_admins(user_id);
```

### Organization Settings Table

```sql
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE,
  
  -- Academic Settings
  academic_year VARCHAR(20),                        -- e.g., '2024-2025'
  default_batch_id UUID,
  
  -- Fee Settings
  default_fee_installments INTEGER DEFAULT 12,
  late_fee_percentage DECIMAL(5, 2),
  late_fee_amount DECIMAL(10, 2),
  
  -- Notification Settings
  email_sender_name VARCHAR(255),
  email_sender_address VARCHAR(255),
  sms_sender_id VARCHAR(50),
  
  -- Report Settings
  custom_report_header TEXT,
  custom_report_footer TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- RLS Policy
CREATE POLICY "org_settings_isolation" ON organization_settings
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
```

---

## Implementation Files

### 1. Organization Types (src/types/organization.types.ts)

```typescript
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  
  // Address
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Branding
  logo_url?: string;
  banner_url?: string;
  brand_color?: string;
  
  // Details
  org_type?: string;
  establishment_year?: number;
  affiliation?: string;
  
  // Subscription
  license_type: 'free' | 'starter' | 'professional';
  subscription_status: 'active' | 'trial' | 'cancelled' | 'expired';
  max_users: number;
  max_storage_gb: number;
  
  // Settings
  language: string;
  timezone: string;
  currency: string;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  id: string;
  org_id: string;
  
  academic_year?: string;
  default_batch_id?: string;
  
  default_fee_installments?: number;
  late_fee_percentage?: number;
  late_fee_amount?: number;
  
  email_sender_name?: string;
  email_sender_address?: string;
  sms_sender_id?: string;
  
  custom_report_header?: string;
  custom_report_footer?: string;
  
  metadata?: Record<string, any>;
}
```

### 2. Organization Service (src/services/organization.service.ts)

```typescript
import { supabase } from '@/services/api/client';
import { Organization, OrganizationSettings } from '@/types/organization.types';

export const organizationService = {
  // Create new organization
  async createOrganization(
    name: string,
    slug: string,
    userId: string
  ): Promise<Organization> {
    // Step 1: Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        created_by: userId,
      })
      .select()
      .single();
    
    if (orgError) throw new Error(orgError.message);
    
    // Step 2: Assign user as owner
    const { error: adminError } = await supabase
      .from('organization_admins')
      .insert({
        org_id: org.id,
        user_id: userId,
        is_owner: true,
      });
    
    if (adminError) throw new Error(adminError.message);
    
    // Step 3: Update user organization
    await supabase
      .from('users')
      .update({ org_id: org.id })
      .eq('id', userId);
    
    // Step 4: Assign owner role
    const { data: ownerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('slug', 'org_admin')
      .single();
    
    if (ownerRole) {
      await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: ownerRole.id,
        org_id: org.id,
        is_active: true,
      });
    }
    
    // Step 5: Create organization settings
    await supabase
      .from('organization_settings')
      .insert({ org_id: org.id });
    
    return org;
  },
  
  // Get organization
  async getOrganization(orgId: string): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get current user's organization
  async getCurrentOrganization(): Promise<Organization> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .single();
    
    if (userError || !user?.org_id) {
      throw new Error('User not associated with an organization');
    }
    
    return this.getOrganization(user.org_id);
  },
  
  // Update organization
  async updateOrganization(
    orgId: string,
    updates: Partial<Organization>
  ): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Upload logo
  async uploadLogo(orgId: string, file: File): Promise<string> {
    const filePath = `${orgId}/logo`;
    
    // Delete old logo
    try {
      await supabase.storage.from('org-assets').remove([filePath]);
    } catch {}
    
    // Upload new logo
    const { data, error } = await supabase.storage
      .from('org-assets')
      .upload(filePath, file, { upsert: true });
    
    if (error) throw new Error(error.message);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('org-assets')
      .getPublicUrl(data.path);
    
    // Update organization
    await this.updateOrganization(orgId, { logo_url: publicUrl });
    
    return publicUrl;
  },
  
  // Get organization settings
  async getSettings(orgId: string): Promise<OrganizationSettings> {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update organization settings
  async updateSettings(
    orgId: string,
    updates: Partial<OrganizationSettings>
  ): Promise<OrganizationSettings> {
    const { data, error } = await supabase
      .from('organization_settings')
      .update(updates)
      .eq('org_id', orgId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // List users in organization
  async getOrganizationUsers(orgId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('org_id', orgId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Add user to organization
  async addUserToOrganization(orgId: string, email: string, roleSlug: string) {
    // Step 1: Create user invitation
    const { data: invite, error: inviteError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    
    if (inviteError) throw new Error('Organization not found');
    
    // Step 2: Send invitation email
    await supabase.functions.invoke('send-invitation', {
      body: {
        email,
        org_name: invite.name,
        org_id: orgId,
      },
    });
    
    return { message: 'Invitation sent' };
  },
};
```

### 3. Organization Store (src/store/organization.store.ts)

```typescript
import { create } from 'zustand';
import { Organization, OrganizationSettings } from '@/types/organization.types';
import { organizationService } from '@/services/organization.service';

interface OrganizationState {
  current: Organization | null;
  settings: OrganizationSettings | null;
  
  loadOrganization: (orgId: string) => Promise<void>;
  loadCurrentOrganization: () => Promise<void>;
  loadSettings: (orgId: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  updateSettings: (updates: Partial<OrganizationSettings>) => Promise<void>;
  clear: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  current: null,
  settings: null,
  
  loadOrganization: async (orgId) => {
    try {
      const org = await organizationService.getOrganization(orgId);
      set({ current: org });
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  },
  
  loadCurrentOrganization: async () => {
    try {
      const org = await organizationService.getCurrentOrganization();
      set({ current: org });
    } catch (error) {
      console.error('Failed to load current organization:', error);
    }
  },
  
  loadSettings: async (orgId) => {
    try {
      const settings = await organizationService.getSettings(orgId);
      set({ settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  updateOrganization: async (updates) => {
    const current = useOrganizationStore.getState().current;
    if (!current) return;
    
    try {
      const updated = await organizationService.updateOrganization(
        current.id,
        updates
      );
      set({ current: updated });
    } catch (error) {
      console.error('Failed to update organization:', error);
    }
  },
  
  updateSettings: async (updates) => {
    const current = useOrganizationStore.getState().current;
    if (!current) return;
    
    try {
      const updated = await organizationService.updateSettings(
        current.id,
        updates
      );
      set({ settings: updated });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
  
  clear: () => {
    set({ current: null, settings: null });
  },
}));
```

### 4. Organization Setup Component (src/components/auth/OrganizationSetup.tsx)

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { organizationService } from '@/services/organization.service';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { z } from 'zod';

const orgSetupSchema = z.object({
  name: z.string().min(3, 'Organization name required'),
  slug: z.string()
    .min(3, 'Slug required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
});

type OrgSetupFormData = z.infer<typeof orgSetupSchema>;

export const OrganizationSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<OrgSetupFormData>({
    resolver: zodResolver(orgSetupSchema),
  });
  
  const onSubmit = async (data: OrgSetupFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const org = await organizationService.createOrganization(
        data.name,
        data.slug,
        user.id
      );
      
      // Redirect to organization dashboard
      navigate(`/admin-portal/${org.id}/dashboard`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold mb-2">Create Your Organization</h1>
      <p className="text-gray-600 mb-6">Set up your educational institution workspace</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Organization Name"
          placeholder="Your School Name"
          {...register('name')}
          error={errors.name?.message}
        />
        
        <FormInput
          label="Organization Slug"
          placeholder="your-school-name"
          {...register('slug')}
          error={errors.slug?.message}
          helperText="Used in URLs, e.g., app.edumunch.io/your-school-name"
        />
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create Organization
        </Button>
      </form>
      
      <p className="text-sm text-gray-600 mt-4">
        You can customize your organization details later
      </p>
    </div>
  );
};
```

### 5. Organization Settings Component (src/components/admin/OrganizationSettings.tsx)

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { useOrganizationStore } from '@/store/organization.store';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

export const OrganizationSettings: React.FC = () => {
  const { current, settings, updateOrganization, updateSettings } = useOrganizationStore();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const { register, handleSubmit } = useForm({
    defaultValues: current || {},
  });
  
  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await updateOrganization(data);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Organization Name"
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
        
        <FormInput
          label="State"
          {...register('state')}
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
  );
};
```

---

## Organization Workflow

### Step 1: Registration
- User creates account
- Redirected to organization setup

### Step 2: Organization Creation
- User creates organization
- Becomes owner/admin
- Assigned admin role

### Step 3: Customization
- Upload logo and banner
- Configure settings
- Set academic year
- Configure fee structure

### Step 4: User Invitation
- Invite teachers, staff, students
- Set roles per person
- Send email invitations

### Step 5: Live
- Organization fully operational
- Ready for branch setup
- Ready for batch/course creation

---

## Next Steps

1. ✅ Create organizations table
2. ✅ Implement organization service
3. ✅ Create setup wizard
4. ✅ Build organization settings page
5. ✅ Proceed to `10_BRANCHES_MANAGEMENT.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Organization Setup Complete  
**Next Phase:** 10_BRANCHES_MANAGEMENT.md
