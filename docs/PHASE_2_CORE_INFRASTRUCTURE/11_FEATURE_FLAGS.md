# Feature Flags

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Feature flags enable organizations to selectively enable/disable features without code changes. This allows:
- A/B testing of new features
- Phased rollout of features
- Billing-based feature access
- Easy emergency feature disabling
- Different feature sets per license tier

---

## Database Schema

### Feature Flags Table

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,                                      -- NULL = system-wide flag
  feature_key VARCHAR(100) NOT NULL,                -- 'lms', 'payment_gateway', '2fa'
  
  -- Configuration
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100,           -- 0-100, for gradual rollout
  
  -- Feature Details
  feature_name VARCHAR(255),
  description TEXT,
  feature_category VARCHAR(50),                     -- 'academic', 'financial', 'communication'
  
  -- Metadata
  config JSONB DEFAULT '{}',                        -- Feature-specific config
  enabled_for_roles VARCHAR(255)[],                 -- Specific roles only
  
  -- Dates
  rollout_start_date TIMESTAMP,
  rollout_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Audit
  enabled_by UUID,
  enabled_reason TEXT,
  
  CONSTRAINT unique_flag UNIQUE(org_id, feature_key),
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_enabled_by FOREIGN KEY (enabled_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_flags_org_id ON feature_flags(org_id);
CREATE INDEX idx_flags_key ON feature_flags(feature_key);
CREATE INDEX idx_flags_enabled ON feature_flags(is_enabled);

-- System-wide default flags (org_id = NULL)
INSERT INTO feature_flags (feature_key, feature_name, feature_category, description, is_enabled) VALUES
  ('lms', 'Learning Management System', 'academic', 'Video uploads, course content, assignments', false),
  ('payment_gateway', 'Online Payment Gateway', 'financial', 'Razorpay integration for online payments', true),
  ('sms_notifications', 'SMS Notifications', 'communication', 'Send SMS via Twilio', true),
  ('email_notifications', 'Email Notifications', 'communication', 'Send emails via SendGrid', true),
  ('2fa', 'Two-Factor Authentication', 'security', 'Enable 2FA for users', true),
  ('attendance_biometric', 'Biometric Attendance', 'academic', 'Facial recognition for attendance', false),
  ('parent_app', 'Parent Mobile App', 'portals', 'Separate mobile app for parents', false),
  ('analytics_dashboard', 'Advanced Analytics', 'analytics', 'Custom dashboards and reports', true),
  ('document_management', 'Document Management', 'academic', 'Upload and manage student documents', true),
  ('audit_logging', 'Audit Logging', 'security', 'Log all user actions', true),
  ('custom_fields', 'Custom Fields', 'administration', 'Allow custom fields per org', true),
  ('custom_roles', 'Custom Roles', 'security', 'Create custom roles per org', true),
  ('api_access', 'API Access', 'integration', 'REST API access for integrations', false);
```

### Feature Usage Tracking Table

```sql
CREATE TABLE feature_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  feature_key VARCHAR(100),
  user_id UUID,
  
  action VARCHAR(100),                              -- 'viewed', 'used', 'configured'
  resource_type VARCHAR(100),
  resource_id UUID,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_feature_usage_org ON feature_usage_log(org_id);
CREATE INDEX idx_feature_usage_key ON feature_usage_log(feature_key);
CREATE INDEX idx_feature_usage_created ON feature_usage_log(created_at);
```

---

## Implementation Files

### 1. Feature Flags Types (src/types/featureFlags.types.ts)

```typescript
export interface FeatureFlag {
  id: string;
  org_id?: string;
  feature_key: string;
  is_enabled: boolean;
  rollout_percentage?: number;
  
  feature_name?: string;
  description?: string;
  feature_category?: string;
  
  config?: Record<string, any>;
  enabled_for_roles?: string[];
  
  rollout_start_date?: string;
  rollout_end_date?: string;
  
  created_at: string;
  updated_at: string;
}

export interface FeatureConfig {
  [key: string]: any;
}

export type FeatureKey = 
  | 'lms'
  | 'payment_gateway'
  | 'sms_notifications'
  | 'email_notifications'
  | '2fa'
  | 'attendance_biometric'
  | 'parent_app'
  | 'analytics_dashboard'
  | 'document_management'
  | 'audit_logging'
  | 'custom_fields'
  | 'custom_roles'
  | 'api_access'
  | string; // Allow custom features

export interface FeatureUsageLog {
  id: string;
  org_id: string;
  feature_key: string;
  user_id?: string;
  action: 'viewed' | 'used' | 'configured';
  resource_type?: string;
  resource_id?: string;
  created_at: string;
}
```

### 2. Feature Flags Service (src/services/featureFlags.service.ts)

```typescript
import { supabase } from '@/services/api/client';
import { FeatureFlag, FeatureKey } from '@/types/featureFlags.types';

export const featureFlagsService = {
  // Get flag for organization
  async getFlag(orgId: string, featureKey: FeatureKey): Promise<FeatureFlag | null> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('feature_key', featureKey)
      .order('org_id', { ascending: false }) // Org-specific overrides system default
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    
    return data || null;
  },
  
  // Check if feature is enabled
  async isEnabled(
    orgId: string,
    featureKey: FeatureKey,
    userRole?: string
  ): Promise<boolean> {
    try {
      const flag = await this.getFlag(orgId, featureKey);
      
      if (!flag) return false;
      if (!flag.is_enabled) return false;
      
      // Check rollout date
      const now = new Date();
      if (flag.rollout_start_date && new Date(flag.rollout_start_date) > now) {
        return false;
      }
      if (flag.rollout_end_date && new Date(flag.rollout_end_date) < now) {
        return false;
      }
      
      // Check role restriction
      if (flag.enabled_for_roles && flag.enabled_for_roles.length > 0) {
        if (!userRole || !flag.enabled_for_roles.includes(userRole)) {
          return false;
        }
      }
      
      // Check rollout percentage (simple hash-based)
      if (flag.rollout_percentage && flag.rollout_percentage < 100) {
        return Math.random() * 100 < flag.rollout_percentage;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  },
  
  // Get all flags for organization
  async getOrgFlags(orgId: string): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('org_id', orgId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get system flags
  async getSystemFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .is('org_id', null);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Enable feature
  async enableFeature(
    orgId: string,
    featureKey: FeatureKey,
    config?: Record<string, any>,
    enabledBy?: string,
    enabledReason?: string
  ): Promise<FeatureFlag> {
    // Check if override exists
    let flag = await this.getOrgFlagOverride(orgId, featureKey);
    
    if (flag) {
      // Update existing override
      const { data, error } = await supabase
        .from('feature_flags')
        .update({
          is_enabled: true,
          config,
          enabled_by: enabledBy,
          enabled_reason: enabledReason,
        })
        .eq('id', flag.id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } else {
      // Get system flag to copy config
      const systemFlag = await this.getFlag(orgId, featureKey);
      
      // Create new override
      const { data, error } = await supabase
        .from('feature_flags')
        .insert({
          org_id: orgId,
          feature_key: featureKey,
          is_enabled: true,
          feature_name: systemFlag?.feature_name,
          feature_category: systemFlag?.feature_category,
          description: systemFlag?.description,
          config: config || systemFlag?.config,
          enabled_by: enabledBy,
          enabled_reason: enabledReason,
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  // Disable feature
  async disableFeature(orgId: string, featureKey: FeatureKey): Promise<void> {
    const flag = await this.getOrgFlagOverride(orgId, featureKey);
    
    if (flag) {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', flag.id);
      
      if (error) throw new Error(error.message);
    }
  },
  
  // Get feature config
  async getFeatureConfig(orgId: string, featureKey: FeatureKey): Promise<Record<string, any>> {
    const flag = await this.getFlag(orgId, featureKey);
    return flag?.config || {};
  },
  
  // Update feature config
  async updateFeatureConfig(
    orgId: string,
    featureKey: FeatureKey,
    config: Record<string, any>
  ): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('feature_flags')
      .update({ config })
      .eq('org_id', orgId)
      .eq('feature_key', featureKey)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get org-specific override (not system default)
  async getOrgFlagOverride(orgId: string, featureKey: FeatureKey): Promise<FeatureFlag | null> {
    const { data } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('org_id', orgId)
      .eq('feature_key', featureKey)
      .single();
    
    return data || null;
  },
  
  // Log feature usage
  async logUsage(
    orgId: string,
    featureKey: FeatureKey,
    action: 'viewed' | 'used' | 'configured',
    resourceType?: string,
    resourceId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('feature_usage_log')
      .insert({
        org_id: orgId,
        feature_key: featureKey,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
      });
    
    if (error) {
      console.error('Failed to log feature usage:', error);
    }
  },
};
```

### 3. Feature Flags Store (src/store/featureFlags.store.ts)

```typescript
import { create } from 'zustand';
import { FeatureFlag, FeatureKey } from '@/types/featureFlags.types';
import { featureFlagsService } from '@/services/featureFlags.service';

interface FeatureFlagsState {
  flags: Map<string, FeatureFlag>;
  isLoading: boolean;
  
  loadFlags: (orgId: string) => Promise<void>;
  isEnabled: (featureKey: FeatureKey, userRole?: string) => Promise<boolean>;
  getConfig: (featureKey: FeatureKey) => Record<string, any>;
  
  enableFeature: (featureKey: FeatureKey, config?: Record<string, any>) => Promise<void>;
  disableFeature: (featureKey: FeatureKey) => Promise<void>;
  
  logUsage: (
    featureKey: FeatureKey,
    action: 'viewed' | 'used' | 'configured'
  ) => Promise<void>;
}

export const useFeatureFlagsStore = create<FeatureFlagsState>((set, get) => ({
  flags: new Map(),
  isLoading: false,
  
  loadFlags: async (orgId) => {
    set({ isLoading: true });
    try {
      const systemFlags = await featureFlagsService.getSystemFlags();
      const orgFlags = await featureFlagsService.getOrgFlags(orgId);
      
      // Merge: org flags override system flags
      const merged = new Map<string, FeatureFlag>();
      systemFlags.forEach(f => merged.set(f.feature_key, f));
      orgFlags.forEach(f => merged.set(f.feature_key, f));
      
      set({ flags: merged });
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  isEnabled: async (featureKey, userRole) => {
    // Try to get from cache first
    const cached = get().flags.get(featureKey);
    if (cached) {
      return cached.is_enabled && (!cached.enabled_for_roles || 
        cached.enabled_for_roles.length === 0 || 
        (userRole && cached.enabled_for_roles.includes(userRole)));
    }
    
    // Fallback to service call
    return false;
  },
  
  getConfig: (featureKey) => {
    return get().flags.get(featureKey)?.config || {};
  },
  
  enableFeature: async (featureKey, config) => {
    try {
      const orgId = 'current-org-id'; // Get from auth store
      const updated = await featureFlagsService.enableFeature(
        orgId,
        featureKey,
        config
      );
      
      const flags = new Map(get().flags);
      flags.set(featureKey, updated);
      set({ flags });
    } catch (error) {
      console.error('Failed to enable feature:', error);
    }
  },
  
  disableFeature: async (featureKey) => {
    try {
      const orgId = 'current-org-id'; // Get from auth store
      await featureFlagsService.disableFeature(orgId, featureKey);
      
      const flags = new Map(get().flags);
      flags.delete(featureKey);
      set({ flags });
    } catch (error) {
      console.error('Failed to disable feature:', error);
    }
  },
  
  logUsage: async (featureKey, action) => {
    try {
      const orgId = 'current-org-id'; // Get from auth store
      await featureFlagsService.logUsage(orgId, featureKey, action);
    } catch (error) {
      console.error('Failed to log feature usage:', error);
    }
  },
}));
```

### 4. Feature Guard Component (src/components/common/FeatureGuard.tsx)

```typescript
import React from 'react';
import { useFeatureFlagsStore } from '@/store/featureFlags.store';
import { FeatureKey } from '@/types/featureFlags.types';

interface FeatureGuardProps {
  feature: FeatureKey;
  userRole?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  onFeatureAccess?: () => void;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  userRole,
  fallback = null,
  children,
  onFeatureAccess,
}) => {
  const { flags, isLoading } = useFeatureFlagsStore();
  const flag = flags.get(feature);
  
  React.useEffect(() => {
    if (!isLoading && flag?.is_enabled) {
      onFeatureAccess?.();
    }
  }, [flag?.is_enabled, isLoading, feature, onFeatureAccess]);
  
  if (isLoading) return null;
  
  const isEnabled = flag?.is_enabled && (!flag?.enabled_for_roles || 
    flag.enabled_for_roles.length === 0 || 
    (userRole && flag.enabled_for_roles.includes(userRole)));
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Usage example
export function LMSModule() {
  return (
    <FeatureGuard
      feature="lms"
      fallback={<p>LMS feature is not enabled for your organization</p>}
    >
      <LMSContent />
    </FeatureGuard>
  );
}
```

### 5. Feature Flags Admin Component (src/components/admin/FeatureFlagsAdmin.tsx)

```typescript
import React from 'react';
import { useFeatureFlagsStore } from '@/store/featureFlags.store';
import { FeatureFlag } from '@/types/featureFlags.types';
import { Button } from '@/components/common/buttons/Button';

export const FeatureFlagsAdmin: React.FC = () => {
  const { flags, enableFeature, disableFeature } = useFeatureFlagsStore();
  
  const flagArray = Array.from(flags.values());
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Feature Flags</h1>
      
      <div className="grid gap-4">
        {flagArray.map((flag) => (
          <div
            key={flag.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-semibold">{flag.feature_name}</h3>
              <p className="text-sm text-gray-600">{flag.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Category: {flag.feature_category}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                flag.is_enabled ? 'text-green-600' : 'text-red-600'
              }`}>
                {flag.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
              
              {flag.is_enabled ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => disableFeature(flag.feature_key as any)}
                >
                  Disable
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => enableFeature(flag.feature_key as any)}
                >
                  Enable
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Usage Examples

### Check Feature and Render Conditional Content

```typescript
function Dashboard() {
  const { flags } = useFeatureFlagsStore();
  
  return (
    <div>
      {flags.get('analytics_dashboard')?.is_enabled && (
        <AnalyticsDashboard />
      )}
      
      {flags.get('document_management')?.is_enabled && (
        <DocumentManagement />
      )}
    </div>
  );
}
```

### Feature-Protected Function Execution

```typescript
async function submitAssignment(data: any) {
  const { flags } = useFeatureFlagsStore();
  
  if (!flags.get('lms')?.is_enabled) {
    throw new Error('Assignment feature is not enabled');
  }
  
  // Proceed with submission
  await assignmentService.submit(data);
}
```

### Log Feature Usage

```typescript
function CoursePage() {
  const { logUsage } = useFeatureFlagsStore();
  
  React.useEffect(() => {
    logUsage('lms', 'viewed', 'course');
  }, [logUsage]);
  
  return <CourseContent />;
}
```

---

## Feature Flag Categories

### Academic Features
- `lms` - Learning Management System
- `attendance_biometric` - Biometric attendance
- `document_management` - Student documents

### Financial Features
- `payment_gateway` - Online payments
- `invoice_generation` - Automated invoices

### Communication Features
- `sms_notifications` - SMS alerts
- `email_notifications` - Email notifications
- `parent_app` - Mobile app for parents

### Security Features
- `2fa` - Two-factor authentication
- `audit_logging` - Activity logs

### Administration Features
- `custom_fields` - Custom field management
- `custom_roles` - Custom role creation
- `api_access` - API access

---

## Gradual Rollout Example

Enable a new feature for 10% of users first:

```typescript
await featureFlagsService.enableFeature(
  orgId,
  'new_feature',
  {
    rollout_percentage: 10,
    rollout_start_date: new Date(),
    rollout_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  }
);
```

Increase to 50% after monitoring:

```typescript
await featureFlagsService.updateFeatureConfig(
  orgId,
  'new_feature',
  { rollout_percentage: 50 }
);
```

---

## Next Steps

1. ✅ Create feature flags table
2. ✅ Implement feature flags service
3. ✅ Create feature guard components
4. ✅ Build admin interface for flags
5. ✅ Phase 2 Complete!
6. ✅ Proceed to Phase 3: Dashboard & Users

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Feature Flags System Complete  
**Phase 2 Completion:** ✅ COMPLETE
**Next Phase:** Phase 3 - Dashboard & Users
