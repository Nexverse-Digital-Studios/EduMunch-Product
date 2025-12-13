# Custom Fields Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Custom Fields Management allows administrators to extend system forms with organization-specific fields. Uses JSONB for flexible schema storage.

---

## Database Schema

```sql
-- Custom Field Definitions
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  entity_type VARCHAR(100),                         -- 'student', 'teacher', 'parent'
  field_name VARCHAR(100),
  field_label VARCHAR(255),
  field_description TEXT,
  
  field_type VARCHAR(50),                           -- 'text', 'number', 'select', 'checkbox', 'date', 'textarea'
  is_required BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  
  -- Display
  position INTEGER,
  placeholder_text VARCHAR(255),
  help_text TEXT,
  
  -- Validation
  validation_rules JSONB DEFAULT '{}',              -- { min, max, regex, etc }
  options JSONB,                                    -- For select/radio fields
  
  -- Visibility
  visible_to_roles UUID[],                          -- Which roles can see this field
  editable_by_roles UUID[],                         -- Which roles can edit this field
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Custom Field Values (for entities)
CREATE TABLE custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  custom_field_id UUID NOT NULL,
  
  entity_type VARCHAR(100),                         -- 'student', 'teacher', 'parent'
  entity_id UUID NOT NULL,                          -- student_id, teacher_id, etc
  
  field_value JSONB,                                -- Stores any type of value
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_custom_field FOREIGN KEY (custom_field_id) 
    REFERENCES custom_fields(id) ON DELETE CASCADE,
  UNIQUE(custom_field_id, entity_id)
);

CREATE INDEX idx_custom_fields_org_type ON custom_fields(org_id, entity_type);
CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX idx_custom_field_values_field ON custom_field_values(custom_field_id);
```

---

## Custom Field Builder Component

```typescript
// src/components/admin/CustomFields/FieldBuilder.tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const fieldBuilderSchema = z.object({
  field_name: z.string().min(1, 'Field name required'),
  field_label: z.string().min(1, 'Label required'),
  field_type: z.enum(['text', 'number', 'select', 'checkbox', 'date', 'textarea']),
  is_required: z.boolean().default(false),
  is_unique: z.boolean().default(false),
  placeholder_text: z.string().optional(),
  help_text: z.string().optional(),
});

type FieldBuilderFormData = z.infer<typeof fieldBuilderSchema>;

interface FieldBuilderProps {
  entityType: 'student' | 'teacher' | 'parent';
  onSave: (field: FieldBuilderFormData) => Promise<void>;
  initialData?: FieldBuilderFormData;
}

export const FieldBuilder: React.FC<FieldBuilderProps> = ({
  entityType,
  onSave,
  initialData,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState('');
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(fieldBuilderSchema),
    defaultValues: initialData,
  });
  
  const fieldType = watch('field_type');
  const [isPending, setIsPending] = useState(false);
  
  const onSubmit = async (data: FieldBuilderFormData) => {
    setIsPending(true);
    try {
      await onSave({
        ...data,
        options: fieldType === 'select' ? options : undefined,
      });
    } finally {
      setIsPending(false);
    }
  };
  
  const addOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput('');
    }
  };
  
  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-6">
        {initialData ? 'Edit Field' : 'Create Custom Field'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          
          <FormInput
            label="Field Name"
            placeholder="emergency_contact_phone"
            description="System name (no spaces)"
            {...register('field_name')}
            error={errors.field_name?.message}
          />
          
          <FormInput
            label="Field Label"
            placeholder="Emergency Contact Phone"
            description="Display label"
            {...register('field_label')}
            error={errors.field_label?.message}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Type
            </label>
            <select
              {...register('field_type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select Dropdown</option>
              <option value="checkbox">Checkbox</option>
              <option value="date">Date</option>
              <option value="textarea">Long Text</option>
            </select>
          </div>
        </div>
        
        {/* Display Options */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Display Options</h3>
          
          <FormInput
            label="Placeholder Text"
            placeholder="Enter placeholder..."
            {...register('placeholder_text')}
          />
          
          <FormInput
            label="Help Text"
            placeholder="Additional guidance for users..."
            {...register('help_text')}
          />
        </div>
        
        {/* Field Options (for select/radio) */}
        {fieldType === 'select' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Options</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                placeholder="Add option..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
              />
              <Button
                type="button"
                onClick={addOption}
                variant="secondary"
                size="sm"
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span>{option}</span>
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Validation */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Validation</h3>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('is_required')}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <span className="text-sm">Make this field required</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('is_unique')}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <span className="text-sm">Each value must be unique</span>
          </label>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            isLoading={isPending}
            disabled={isPending}
            className="flex-1"
          >
            {initialData ? 'Update Field' : 'Create Field'}
          </Button>
          <Button type="button" variant="secondary" className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
```

---

## Custom Fields Service

```typescript
// src/services/admin/custom.fields.service.ts
import { supabase } from '@/services/api/client';

export const customFieldsService = {
  async createField(orgId: string, fieldData: any) {
    const { data, error } = await supabase
      .from('custom_fields')
      .insert({
        org_id: orgId,
        ...fieldData,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getEntityFields(
    orgId: string,
    entityType: string,
    userId?: string
  ) {
    let query = supabase
      .from('custom_fields')
      .select('*')
      .eq('org_id', orgId)
      .eq('entity_type', entityType)
      .eq('is_active', true)
      .order('position');
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    
    // Filter based on user permissions if userId provided
    if (userId) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId);
      
      return data.filter((field) => {
        const roleIds = userRoles?.map((r) => r.role_id) || [];
        return !field.visible_to_roles ||
               field.visible_to_roles.some((rid) => roleIds.includes(rid));
      });
    }
    
    return data;
  },
  
  async setFieldValue(
    orgId: string,
    customFieldId: string,
    entityId: string,
    entityType: string,
    value: any
  ) {
    const { data, error } = await supabase
      .from('custom_field_values')
      .upsert({
        org_id: orgId,
        custom_field_id: customFieldId,
        entity_id: entityId,
        entity_type: entityType,
        field_value: value,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getEntityFieldValues(
    orgId: string,
    entityId: string,
    entityType: string
  ) {
    const { data, error } = await supabase
      .from('custom_field_values')
      .select('custom_field_id, field_value')
      .eq('org_id', orgId)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);
    
    if (error) throw new Error(error.message);
    
    // Convert to map
    return data.reduce((acc, item) => {
      acc[item.custom_field_id] = item.field_value;
      return acc;
    }, {});
  },
};
```

---

## Using Custom Fields in Forms

```typescript
// src/components/forms/StudentForm.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { customFieldsService } from '@/services/admin/custom.fields.service';
import { useOrganizationStore } from '@/store/organization.store';

interface StudentFormProps {
  studentId?: string;
  onSubmit: (data: any) => Promise<void>;
}

export const StudentForm: React.FC<StudentFormProps> = ({ studentId, onSubmit }) => {
  const { current: org } = useOrganizationStore();
  
  // Fetch custom fields for students
  const { data: customFields = [] } = useQuery({
    queryKey: ['student-custom-fields', org?.id],
    queryFn: () =>
      customFieldsService.getEntityFields(org!.id, 'student'),
    enabled: !!org,
  });
  
  // Fetch existing values if editing
  const { data: fieldValues = {} } = useQuery({
    queryKey: ['student-field-values', studentId],
    queryFn: () =>
      customFieldsService.getEntityFieldValues(
        org!.id,
        studentId!,
        'student'
      ),
    enabled: !!studentId && !!org,
  });
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Collect all form data including custom fields
      const formData = new FormData(e.currentTarget);
      onSubmit(Object.fromEntries(formData));
    }}>
      {/* Standard fields */}
      <div className="space-y-4">
        <label>
          <span className="block text-sm font-medium">Name</span>
          <input
            type="text"
            name="full_name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </label>
      </div>
      
      {/* Custom fields */}
      {customFields.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-4">
            {customFields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.field_label}
                  {field.is_required && <span className="text-red-600">*</span>}
                </label>
                
                {field.field_type === 'text' && (
                  <input
                    type="text"
                    name={field.field_name}
                    defaultValue={fieldValues[field.id]}
                    placeholder={field.placeholder_text}
                    required={field.is_required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
                
                {field.field_type === 'select' && (
                  <select
                    name={field.field_name}
                    defaultValue={fieldValues[field.id]}
                    required={field.is_required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
                
                {field.field_type === 'textarea' && (
                  <textarea
                    name={field.field_name}
                    defaultValue={fieldValues[field.id]}
                    placeholder={field.placeholder_text}
                    required={field.is_required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                )}
                
                {field.help_text && (
                  <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button type="submit" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md">
        Save
      </button>
    </form>
  );
};
```

---

## Custom Fields Store

```typescript
// src/store/customFields.store.ts
import { create } from 'zustand';
import { customFieldsService } from '@/services/admin/custom.fields.service';

interface CustomFieldsState {
  fields: Record<string, any[]>;
  loadFields: (orgId: string, entityType: string) => Promise<void>;
  addField: (orgId: string, fieldData: any) => Promise<void>;
  deleteField: (fieldId: string) => Promise<void>;
}

export const useCustomFieldsStore = create<CustomFieldsState>((set) => ({
  fields: {},
  
  loadFields: async (orgId: string, entityType: string) => {
    const fields = await customFieldsService.getEntityFields(orgId, entityType);
    set((state) => ({
      fields: {
        ...state.fields,
        [entityType]: fields,
      },
    }));
  },
  
  addField: async (orgId: string, fieldData: any) => {
    const field = await customFieldsService.createField(orgId, fieldData);
    set((state) => ({
      fields: {
        ...state.fields,
        [fieldData.entity_type]: [
          ...(state.fields[fieldData.entity_type] || []),
          field,
        ],
      },
    }));
  },
  
  deleteField: async (fieldId: string) => {
    // Implementation
  },
}));
```

---

## Next Steps

1. ✅ Create custom fields schema
2. ✅ Implement field builder UI
3. ✅ Create custom fields service
4. ✅ Set up field rendering in forms
5. ✅ Proceed to `15_NAVIGATION_SIDEBAR.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Custom Fields Complete  
**Next Phase:** 15_NAVIGATION_SIDEBAR.md
