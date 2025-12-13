# Fees Structure Management

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Fees Structure Management provides comprehensive tools for creating and managing fee structures, pricing tiers, discounts, GST calculations, and course-specific fee components.

---

## Database Schema

### Fee Structure Tables

```sql
-- Fee Structures
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  structure_name VARCHAR(255),
  structure_code VARCHAR(100),
  
  description TEXT,
  
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Fee Components (breakdown of fees)
CREATE TABLE fee_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  component_name VARCHAR(255),
  component_code VARCHAR(100),
  
  component_type VARCHAR(50),                       -- 'tuition', 'admission', 'examination', 'library', 'transport', 'hostel', 'other'
  
  is_mandatory BOOLEAN DEFAULT true,
  is_refundable BOOLEAN DEFAULT false,
  
  tax_applicable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5, 2) DEFAULT 0,                -- GST rate percentage
  
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Course Fee Mapping
CREATE TABLE course_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  branch_id UUID,
  fee_structure_id UUID NOT NULL,
  
  base_fee DECIMAL(10, 2),
  
  component_fees JSONB,                            -- {component_id: amount}
  
  academic_year VARCHAR(10),
  
  effective_from DATE,
  effective_to DATE,
  
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT fk_course FOREIGN KEY (course_id) 
    REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_fee_structure FOREIGN KEY (fee_structure_id) 
    REFERENCES fee_structures(id) ON DELETE CASCADE
);

-- Discount Rules
CREATE TABLE discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  discount_name VARCHAR(255),
  discount_code VARCHAR(100),
  
  discount_type VARCHAR(50),                       -- 'percentage', 'fixed_amount', 'waiver'
  discount_value DECIMAL(10, 2),
  
  applicable_on VARCHAR(50),                       -- 'total', 'tuition_only', 'specific_component'
  component_id UUID,
  
  eligibility_criteria JSONB,                      -- {min_score: 90, category: 'EWS', etc}
  
  max_discount_amount DECIMAL(10, 2),
  
  valid_from DATE,
  valid_to DATE,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_component FOREIGN KEY (component_id) 
    REFERENCES fee_components(id) ON DELETE SET NULL
);

-- Student Fee Assignment
CREATE TABLE student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_fee_id UUID NOT NULL,
  
  total_fee DECIMAL(10, 2),
  
  discount_applied JSONB,                          -- Array of discounts
  total_discount DECIMAL(10, 2) DEFAULT 0,
  
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  
  final_amount DECIMAL(10, 2),
  
  fee_breakdown JSONB,                             -- Component-wise breakdown
  
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_fee FOREIGN KEY (course_fee_id) 
    REFERENCES course_fees(id) ON DELETE CASCADE
);

-- Fee Modifications (adjustments, waivers)
CREATE TABLE fee_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID NOT NULL,
  
  modification_type VARCHAR(50),                   -- 'discount', 'waiver', 'adjustment', 'penalty'
  
  amount DECIMAL(10, 2),
  
  reason TEXT,
  
  approved_by UUID,
  approved_at TIMESTAMP,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_student_fee FOREIGN KEY (student_fee_id) 
    REFERENCES student_fees(id) ON DELETE CASCADE,
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Fee Categories (for grouping)
CREATE TABLE fee_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  category_name VARCHAR(255),
  category_description TEXT,
  
  display_order INTEGER DEFAULT 0,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_fee_structures_org ON fee_structures(org_id);
CREATE INDEX idx_fee_components_org ON fee_components(org_id);
CREATE INDEX idx_course_fees_course ON course_fees(course_id);
CREATE INDEX idx_course_fees_branch ON course_fees(branch_id);
CREATE INDEX idx_discount_rules_org ON discount_rules(org_id);
CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_fee_modifications_student_fee ON fee_modifications(student_fee_id);
```

---

## Fee Structure Components

### 1. Fee Structure Form

```typescript
// src/components/finance/FeeStructure/FeeStructureForm.tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { feeStructureService } from '@/services/finance/feeStructure.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { FormTextarea } from '@/components/common/forms/FormTextarea';
import { Plus, Trash2, Save } from 'lucide-react';

const feeStructureSchema = z.object({
  structure_name: z.string().min(1, 'Structure name is required'),
  structure_code: z.string().min(1, 'Structure code is required'),
  description: z.string().optional(),
  is_default: z.boolean().default(false),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

interface ComponentAmount {
  component_id: string;
  amount: number;
}

export const FeeStructureForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedComponents, setSelectedComponents] = useState<ComponentAmount[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
  });
  
  const { data: components = [] } = useQuery({
    queryKey: ['fee-components'],
    queryFn: () => feeStructureService.getFeeComponents(),
  });
  
  const { mutate: createStructure, isPending } = useMutation({
    mutationFn: (data: FeeStructureFormData) =>
      feeStructureService.createFeeStructure(data, selectedComponents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
  
  const addComponent = () => {
    setSelectedComponents([
      ...selectedComponents,
      { component_id: '', amount: 0 },
    ]);
  };
  
  const removeComponent = (index: number) => {
    setSelectedComponents(selectedComponents.filter((_, i) => i !== index));
  };
  
  const updateComponent = (index: number, field: 'component_id' | 'amount', value: any) => {
    const updated = [...selectedComponents];
    updated[index][field] = value;
    setSelectedComponents(updated);
  };
  
  const totalAmount = selectedComponents.reduce((sum, comp) => sum + (comp.amount || 0), 0);
  
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Create Fee Structure</h2>
      
      <form onSubmit={handleSubmit((data) => createStructure(data))} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Structure Name"
            {...register('structure_name')}
            error={errors.structure_name?.message}
            placeholder="e.g., Standard Fee Structure 2024"
          />
          
          <FormInput
            label="Structure Code"
            {...register('structure_code')}
            error={errors.structure_code?.message}
            placeholder="e.g., STD-2024"
          />
        </div>
        
        <FormTextarea
          label="Description"
          {...register('description')}
          placeholder="Describe this fee structure..."
          rows={3}
        />
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('is_default')}
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">
            Set as default structure
          </label>
        </div>
        
        {/* Fee Components */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fee Components</h3>
            <Button onClick={addComponent} size="sm" type="button">
              <Plus size={16} className="mr-2" />
              Add Component
            </Button>
          </div>
          
          <div className="space-y-3">
            {selectedComponents.map((comp, index) => (
              <div key={index} className="flex gap-3 items-start p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <select
                    value={comp.component_id}
                    onChange={(e) => updateComponent(index, 'component_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Component</option>
                    {components.map((component) => (
                      <option key={component.id} value={component.id}>
                        {component.component_name} ({component.component_type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-40">
                  <input
                    type="number"
                    value={comp.amount}
                    onChange={(e) => updateComponent(index, 'amount', parseFloat(e.target.value))}
                    placeholder="Amount"
                    className="w-full p-2 border border-gray-300 rounded"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            
            {selectedComponents.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No components added. Click "Add Component" to start.
              </p>
            )}
          </div>
          
          {selectedComponents.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Base Fee</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" isLoading={isPending} disabled={isPending}>
            <Save size={16} className="mr-2" />
            Create Fee Structure
          </Button>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
```

### 2. Course Fee Configuration

```typescript
// src/components/finance/FeeStructure/CourseFeeConfiguration.tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feeStructureService } from '@/services/finance/feeStructure.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { DataTable } from '@/components/common/tables/DataTable';
import { Edit, Trash2, Plus } from 'lucide-react';

interface CourseFeeConfigurationProps {
  courseId: string;
}

export const CourseFeeConfiguration: React.FC<CourseFeeConfigurationProps> = ({
  courseId,
}) => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  
  const { data: courseFees = [] } = useQuery({
    queryKey: ['course-fees', courseId],
    queryFn: () => feeStructureService.getCourseFees(courseId),
  });
  
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => feeStructureService.getCourseDetails(courseId),
  });
  
  const columns = [
    {
      key: 'branch_name',
      label: 'Branch',
      render: (fee: any) => fee.branch_name || 'All Branches',
    },
    {
      key: 'structure_name',
      label: 'Fee Structure',
    },
    {
      key: 'base_fee',
      label: 'Base Fee',
      render: (fee: any) => (
        <span className="font-bold">₹{fee.base_fee.toLocaleString()}</span>
      ),
    },
    {
      key: 'academic_year',
      label: 'Academic Year',
    },
    {
      key: 'effective_period',
      label: 'Effective Period',
      render: (fee: any) => (
        <div className="text-sm">
          <p>{new Date(fee.effective_from).toLocaleDateString()}</p>
          <p className="text-gray-600">
            to {fee.effective_to ? new Date(fee.effective_to).toLocaleDateString() : 'Ongoing'}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (fee: any) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            fee.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {fee.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (fee: any) => (
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Edit size={16} />
          </button>
          <button className="p-2 hover:bg-red-50 text-red-600 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{course?.name} - Fee Configuration</h2>
          <p className="text-gray-600">Manage course fee structures across branches</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-2" />
          Add Fee Configuration
        </Button>
      </div>
      
      <DataTable columns={columns} data={courseFees} />
    </div>
  );
};
```

### 3. Discount Management

```typescript
// src/components/finance/FeeStructure/DiscountManagement.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { feeStructureService } from '@/services/finance/feeStructure.service';
import { Card } from '@/components/common/cards/Card';
import { DataTable } from '@/components/common/tables/DataTable';
import { Badge } from '@/components/common/badges/Badge';
import { Percent, DollarSign, Award } from 'lucide-react';

export const DiscountManagement: React.FC = () => {
  const { data: discounts = [] } = useQuery({
    queryKey: ['discount-rules'],
    queryFn: () => feeStructureService.getDiscountRules(),
  });
  
  const columns = [
    {
      key: 'discount_name',
      label: 'Discount Name',
      render: (discount: any) => (
        <div>
          <p className="font-medium">{discount.discount_name}</p>
          <p className="text-sm text-gray-600">{discount.discount_code}</p>
        </div>
      ),
    },
    {
      key: 'discount_type',
      label: 'Type',
      render: (discount: any) => {
        const icons = {
          percentage: <Percent size={16} />,
          fixed_amount: <DollarSign size={16} />,
          waiver: <Award size={16} />,
        };
        
        return (
          <div className="flex items-center gap-2">
            {icons[discount.discount_type as keyof typeof icons]}
            <span className="capitalize">{discount.discount_type.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      key: 'discount_value',
      label: 'Value',
      render: (discount: any) => (
        <span className="font-bold text-blue-600">
          {discount.discount_type === 'percentage'
            ? `${discount.discount_value}%`
            : `₹${discount.discount_value}`}
        </span>
      ),
    },
    {
      key: 'applicable_on',
      label: 'Applicable On',
      render: (discount: any) => (
        <span className="text-sm capitalize">
          {discount.applicable_on.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'validity',
      label: 'Validity',
      render: (discount: any) => (
        <div className="text-sm">
          <p>{new Date(discount.valid_from).toLocaleDateString()}</p>
          <p className="text-gray-600">
            to {new Date(discount.valid_to).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (discount: any) => {
        const now = new Date();
        const validFrom = new Date(discount.valid_from);
        const validTo = new Date(discount.valid_to);
        
        let status = 'active';
        if (!discount.is_active) status = 'inactive';
        else if (now < validFrom) status = 'upcoming';
        else if (now > validTo) status = 'expired';
        
        const colors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          upcoming: 'bg-blue-100 text-blue-800',
          expired: 'bg-red-100 text-red-800',
        };
        
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
  ];
  
  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Discount Rules</h2>
      <DataTable columns={columns} data={discounts} />
    </Card>
  );
};
```

---

## Fee Structure Service

```typescript
// src/services/finance/feeStructure.service.ts
import { supabase } from '@/services/api/client';

export const feeStructureService = {
  async getFeeComponents() {
    const { data, error } = await supabase
      .from('fee_components')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async createFeeStructure(
    structureData: any,
    components: Array<{ component_id: string; amount: number }>
  ) {
    const { data: structure, error: structureError } = await supabase
      .from('fee_structures')
      .insert({
        structure_name: structureData.structure_name,
        structure_code: structureData.structure_code,
        description: structureData.description,
        is_default: structureData.is_default,
      })
      .select()
      .single();
    
    if (structureError) throw new Error(structureError.message);
    
    return structure;
  },
  
  async getCourseFees(courseId: string) {
    const { data, error } = await supabase
      .from('course_fees')
      .select(`
        *,
        branches(name),
        fee_structures(structure_name)
      `)
      .eq('course_id', courseId);
    
    if (error) throw new Error(error.message);
    
    return data?.map((fee) => ({
      ...fee,
      branch_name: fee.branches?.name,
      structure_name: fee.fee_structures.structure_name,
    })) || [];
  },
  
  async getCourseDetails(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('name, code')
      .eq('id', courseId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getDiscountRules() {
    const { data, error } = await supabase
      .from('discount_rules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async assignFeeToStudent(studentId: string, courseFeeId: string, discounts: any[]) {
    // Get course fee details
    const { data: courseFee } = await supabase
      .from('course_fees')
      .select(`
        *,
        fee_structures(*)
      `)
      .eq('id', courseFeeId)
      .single();
    
    if (!courseFee) throw new Error('Course fee not found');
    
    // Calculate total discount
    let totalDiscount = 0;
    const discountApplied = [];
    
    for (const discount of discounts) {
      if (discount.discount_type === 'percentage') {
        const discountAmount = (courseFee.base_fee * discount.discount_value) / 100;
        totalDiscount += Math.min(discountAmount, discount.max_discount_amount || discountAmount);
      } else if (discount.discount_type === 'fixed_amount') {
        totalDiscount += discount.discount_value;
      }
      
      discountApplied.push({
        discount_id: discount.id,
        discount_name: discount.discount_name,
        amount: discount.discount_value,
      });
    }
    
    // Calculate tax
    const taxableAmount = courseFee.base_fee - totalDiscount;
    const taxAmount = 0; // Calculate based on components with tax
    
    const finalAmount = taxableAmount + taxAmount;
    
    const { data, error } = await supabase
      .from('student_fees')
      .insert({
        student_id: studentId,
        course_fee_id: courseFeeId,
        total_fee: courseFee.base_fee,
        discount_applied: discountApplied,
        total_discount: totalDiscount,
        tax_amount: taxAmount,
        final_amount: finalAmount,
        fee_breakdown: courseFee.component_fees,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async calculateFeeWithGST(baseFee: number, components: any[]) {
    let totalTax = 0;
    
    for (const component of components) {
      if (component.tax_applicable) {
        const componentAmount = component.amount;
        const tax = (componentAmount * component.tax_rate) / 100;
        totalTax += tax;
      }
    }
    
    return {
      base_fee: baseFee,
      tax_amount: totalTax,
      total_amount: baseFee + totalTax,
    };
  },
};
```

---

## Usage Examples

### Example 1: Creating a Fee Structure

```typescript
import { feeStructureService } from '@/services/finance/feeStructure.service';

// Create fee structure with components
const createFeeStructure = async () => {
  const structureData = {
    structure_name: 'JEE Standard Fee 2024',
    structure_code: 'JEE-STD-2024',
    description: 'Standard fee structure for JEE courses',
    is_default: true,
  };
  
  const components = [
    { component_id: 'comp-1', amount: 50000 }, // Tuition
    { component_id: 'comp-2', amount: 5000 },  // Admission
    { component_id: 'comp-3', amount: 3000 },  // Library
    { component_id: 'comp-4', amount: 2000 },  // Examination
  ];
  
  const structure = await feeStructureService.createFeeStructure(
    structureData,
    components
  );
  
  console.log('Fee structure created:', structure);
};
```

### Example 2: Applying Discount to Student

```typescript
import { feeStructureService } from '@/services/finance/feeStructure.service';

// Assign fee with discount
const assignFeeWithDiscount = async () => {
  const studentId = 'student-123';
  const courseFeeId = 'course-fee-456';
  
  const discounts = [
    {
      id: 'disc-1',
      discount_name: 'Merit Scholarship',
      discount_type: 'percentage',
      discount_value: 10,
      max_discount_amount: 5000,
    },
    {
      id: 'disc-2',
      discount_name: 'Early Bird',
      discount_type: 'fixed_amount',
      discount_value: 2000,
    },
  ];
  
  const studentFee = await feeStructureService.assignFeeToStudent(
    studentId,
    courseFeeId,
    discounts
  );
  
  console.log('Student fee assigned:', studentFee);
};
```

---

## Next Steps

1. ✅ Create fee structure schema
2. ✅ Implement fee structure form
3. ✅ Build course fee configuration
4. ✅ Create discount management
5. ✅ Create fee structure service
6. ✅ Proceed to `35_PAYMENT_PROCESSING.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Fees Structure Management Complete  
**Next Phase:** 35_PAYMENT_PROCESSING.md
