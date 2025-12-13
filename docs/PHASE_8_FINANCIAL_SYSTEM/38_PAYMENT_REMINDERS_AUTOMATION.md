# Payment Reminders & Automation

---

## 🎯 Development Rules for This Document

> **Rule 1:** DO NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Payment Reminders & Automation provides automated reminder scheduling, SMS/email notifications, late fee calculations, automated actions, and recurring payment setup.

---

## Database Schema

### Reminder and Automation Tables

```sql
-- Payment Reminders
CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  student_id UUID NOT NULL,
  installment_id UUID,
  
  reminder_type VARCHAR(50),                        -- 'before_due', 'on_due', 'after_due'
  
  days_offset INTEGER,                              -- Days before/after due date
  
  reminder_subject VARCHAR(255),
  reminder_message TEXT,
  
  send_via VARCHAR(50),                             -- 'email', 'sms', 'both'
  
  scheduled_at TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'pending',             -- 'pending', 'sent', 'failed'
  
  sent_at TIMESTAMP,
  
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_installment FOREIGN KEY (installment_id) 
    REFERENCES fee_installments(id) ON DELETE SET NULL
);

-- Reminder Templates
CREATE TABLE reminder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  template_name VARCHAR(255),
  template_type VARCHAR(50),                        -- 'email', 'sms'
  
  subject VARCHAR(255),
  message_body TEXT,
  
  variables JSONB,                                  -- Available variables like {student_name}, {amount}
  
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Automation Rules
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  rule_name VARCHAR(255),
  rule_description TEXT,
  
  rule_type VARCHAR(50),                            -- 'reminder', 'late_fee', 'enrollment_block'
  
  trigger_condition JSONB,                          -- {days_overdue: 7, amount_threshold: 1000}
  
  actions JSONB,                                    -- Array of actions to perform
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Automation Logs
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID NOT NULL,
  
  student_id UUID,
  installment_id UUID,
  
  action_performed VARCHAR(100),
  
  result VARCHAR(50),                               -- 'success', 'failed'
  
  details JSONB,
  
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_automation_rule FOREIGN KEY (automation_rule_id) 
    REFERENCES automation_rules(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Late Fee Configuration
CREATE TABLE late_fee_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  late_fee_type VARCHAR(50),                        -- 'fixed', 'percentage', 'tiered'
  
  fixed_amount DECIMAL(10, 2),
  percentage_rate DECIMAL(5, 2),
  
  grace_period_days INTEGER DEFAULT 0,
  
  max_late_fee DECIMAL(10, 2),
  
  tiers JSONB,                                      -- [{days: 7, amount: 100}, {days: 14, amount: 200}]
  
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Late Fees Applied
CREATE TABLE late_fees_applied (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_id UUID NOT NULL,
  
  late_fee_amount DECIMAL(10, 2),
  
  days_overdue INTEGER,
  
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  waived BOOLEAN DEFAULT false,
  waived_by UUID,
  waived_at TIMESTAMP,
  waiver_reason TEXT,
  
  CONSTRAINT fk_installment FOREIGN KEY (installment_id) 
    REFERENCES fee_installments(id) ON DELETE CASCADE,
  CONSTRAINT fk_waived_by FOREIGN KEY (waived_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_payment_reminders_student ON payment_reminders(student_id);
CREATE INDEX idx_payment_reminders_status ON payment_reminders(status);
CREATE INDEX idx_payment_reminders_scheduled ON payment_reminders(scheduled_at);
CREATE INDEX idx_automation_rules_org ON automation_rules(org_id);
CREATE INDEX idx_automation_logs_rule ON automation_logs(automation_rule_id);
CREATE INDEX idx_late_fees_installment ON late_fees_applied(installment_id);
```

---

## Reminder & Automation Components

### 1. Reminder Configuration

```typescript
// src/components/finance/Reminders/ReminderConfiguration.tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { reminderService } from '@/services/finance/reminder.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { FormTextarea } from '@/components/common/forms/FormTextarea';
import { Bell, Save } from 'lucide-react';

export const ReminderConfiguration: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue } = useForm();
  
  const { data: templates = [] } = useQuery({
    queryKey: ['reminder-templates'],
    queryFn: () => reminderService.getReminderTemplates(),
  });
  
  const { mutate: saveTemplate, isPending } = useMutation({
    mutationFn: (data: any) => reminderService.saveReminderTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-templates'] });
    },
  });
  
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setValue('subject', template.subject);
      setValue('message_body', template.message_body);
      setSelectedTemplate(templateId);
    }
  };
  
  const onSubmit = (data: any) => {
    saveTemplate(data);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template List */}
      <div>
        <Card>
          <h3 className="text-lg font-semibold mb-4">Reminder Templates</h3>
          
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">{template.template_name}</p>
                <p className="text-sm text-gray-600 capitalize">{template.template_type}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Template Editor */}
      <div className="lg:col-span-2">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Edit Template</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              label="Template Name"
              {...register('template_name')}
              placeholder="e.g., Payment Due Reminder"
              required
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Template Type</label>
              <select {...register('template_type')} className="w-full p-2 border border-gray-300 rounded">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            
            <FormInput
              label="Subject (Email Only)"
              {...register('subject')}
              placeholder="Payment Reminder"
            />
            
            <FormTextarea
              label="Message Body"
              {...register('message_body')}
              placeholder="Dear {student_name}, your payment of ₹{amount} is due on {due_date}..."
              rows={6}
              required
            />
            
            {/* Available Variables */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium mb-2">Available Variables</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <code className="bg-white px-2 py-1 rounded">{'{student_name}'}</code>
                <code className="bg-white px-2 py-1 rounded">{'{amount}'}</code>
                <code className="bg-white px-2 py-1 rounded">{'{due_date}'}</code>
                <code className="bg-white px-2 py-1 rounded">{'{installment_number}'}</code>
                <code className="bg-white px-2 py-1 rounded">{'{org_name}'}</code>
                <code className="bg-white px-2 py-1 rounded">{'{outstanding_amount}'}</code>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('is_default')} className="w-4 h-4" />
              <label className="text-sm font-medium">Set as default template</label>
            </div>
            
            <div className="flex gap-3">
              <Button type="submit" isLoading={isPending} disabled={isPending}>
                <Save size={16} className="mr-2" />
                Save Template
              </Button>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
```

### 2. Automation Rules Manager

```typescript
// src/components/finance/Reminders/AutomationRulesManager.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reminderService } from '@/services/finance/reminder.service';
import { Card } from '@/components/common/cards/Card';
import { DataTable } from '@/components/common/tables/DataTable';
import { Button } from '@/components/common/buttons/Button';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export const AutomationRulesManager: React.FC = () => {
  const { data: rules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => reminderService.getAutomationRules(),
  });
  
  const columns = [
    {
      key: 'rule_name',
      label: 'Rule Name',
      render: (rule: any) => (
        <div>
          <p className="font-medium">{rule.rule_name}</p>
          <p className="text-sm text-gray-600">{rule.rule_description}</p>
        </div>
      ),
    },
    {
      key: 'rule_type',
      label: 'Type',
      render: (rule: any) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
          {rule.rule_type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'trigger_condition',
      label: 'Trigger Condition',
      render: (rule: any) => (
        <div className="text-sm">
          {rule.trigger_condition.days_overdue && (
            <p>Days Overdue: {rule.trigger_condition.days_overdue}</p>
          )}
          {rule.trigger_condition.amount_threshold && (
            <p>Amount: ₹{rule.trigger_condition.amount_threshold}</p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (rule: any) => (
        <div className="text-sm">
          {rule.actions.map((action: string, i: number) => (
            <span key={i} className="mr-2 px-2 py-1 bg-gray-100 rounded">
              {action}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (rule: any) => (
        <button className="flex items-center gap-2">
          {rule.is_active ? (
            <ToggleRight size={24} className="text-green-600" />
          ) : (
            <ToggleLeft size={24} className="text-gray-400" />
          )}
          <span className={rule.is_active ? 'text-green-600' : 'text-gray-400'}>
            {rule.is_active ? 'Active' : 'Inactive'}
          </span>
        </button>
      ),
    },
    {
      key: 'action_buttons',
      label: '',
      render: (rule: any) => (
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
        <h2 className="text-2xl font-bold">Automation Rules</h2>
        <Button>
          <Plus size={16} className="mr-2" />
          Create Rule
        </Button>
      </div>
      
      <DataTable columns={columns} data={rules} />
    </div>
  );
};
```

### 3. Late Fee Configuration

```typescript
// src/components/finance/Reminders/LateFeeConfiguration.tsx
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { reminderService } from '@/services/finance/reminder.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { Save } from 'lucide-react';

export const LateFeeConfiguration: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, watch } = useForm();
  const lateFeeType = watch('late_fee_type', 'fixed');
  
  const { data: config } = useQuery({
    queryKey: ['late-fee-config'],
    queryFn: () => reminderService.getLateFeeConfig(),
  });
  
  const { mutate: saveConfig, isPending } = useMutation({
    mutationFn: (data: any) => reminderService.saveLateFeeConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['late-fee-config'] });
    },
  });
  
  return (
    <Card>
      <h2 className="text-xl font-bold mb-6">Late Fee Configuration</h2>
      
      <form onSubmit={handleSubmit((data) => saveConfig(data))} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Late Fee Type</label>
          <select
            {...register('late_fee_type')}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="fixed">Fixed Amount</option>
            <option value="percentage">Percentage</option>
            <option value="tiered">Tiered (Progressive)</option>
          </select>
        </div>
        
        {lateFeeType === 'fixed' && (
          <FormInput
            label="Fixed Amount"
            type="number"
            step="0.01"
            {...register('fixed_amount', { valueAsNumber: true })}
            placeholder="100.00"
          />
        )}
        
        {lateFeeType === 'percentage' && (
          <FormInput
            label="Percentage Rate"
            type="number"
            step="0.01"
            {...register('percentage_rate', { valueAsNumber: true })}
            placeholder="5.00"
            helperText="Percentage of the outstanding amount"
          />
        )}
        
        {lateFeeType === 'tiered' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Configure progressive late fees based on days overdue
            </p>
            {/* Add tier configuration UI */}
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm">Tier 1: 1-7 days - ₹50</p>
              <p className="text-sm">Tier 2: 8-14 days - ₹100</p>
              <p className="text-sm">Tier 3: 15+ days - ₹200</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Grace Period (Days)"
            type="number"
            {...register('grace_period_days', { valueAsNumber: true })}
            placeholder="0"
            helperText="Days after due date before late fee applies"
          />
          
          <FormInput
            label="Maximum Late Fee"
            type="number"
            step="0.01"
            {...register('max_late_fee', { valueAsNumber: true })}
            placeholder="1000.00"
            helperText="Cap on total late fees"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('is_active')} className="w-4 h-4" />
          <label className="text-sm font-medium">Enable automatic late fee calculation</label>
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" isLoading={isPending} disabled={isPending}>
            <Save size={16} className="mr-2" />
            Save Configuration
          </Button>
        </div>
      </form>
    </Card>
  );
};
```

---

## Reminder & Automation Service

```typescript
// src/services/finance/reminder.service.ts
import { supabase } from '@/services/api/client';

export const reminderService = {
  async getReminderTemplates() {
    const { data, error } = await supabase
      .from('reminder_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async saveReminderTemplate(templateData: any) {
    const { data, error } = await supabase
      .from('reminder_templates')
      .upsert({
        template_name: templateData.template_name,
        template_type: templateData.template_type,
        subject: templateData.subject,
        message_body: templateData.message_body,
        is_default: templateData.is_default,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async scheduleReminders() {
    // Get all pending installments
    const { data: installments } = await supabase
      .from('fee_installments')
      .select(`
        *,
        student_fees(student_id),
        users:student_fees(student_id(full_name, email, phone))
      `)
      .eq('payment_status', 'pending');
    
    if (!installments) return;
    
    const now = new Date();
    
    for (const installment of installments) {
      const dueDate = new Date(installment.due_date);
      const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Schedule reminder 3 days before due date
      if (daysDiff === 3) {
        await this.createReminder(installment, 'before_due', -3);
      }
      
      // Schedule reminder on due date
      if (daysDiff === 0) {
        await this.createReminder(installment, 'on_due', 0);
      }
      
      // Schedule reminder 3 days after due date
      if (daysDiff === -3) {
        await this.createReminder(installment, 'after_due', 3);
      }
    }
  },
  
  async createReminder(installment: any, reminderType: string, daysOffset: number) {
    // Get template
    const { data: template } = await supabase
      .from('reminder_templates')
      .select('*')
      .eq('is_default', true)
      .single();
    
    if (!template) return;
    
    // Replace variables in message
    const message = this.replaceVariables(template.message_body, {
      student_name: installment.users.full_name,
      amount: installment.amount,
      due_date: new Date(installment.due_date).toLocaleDateString(),
      installment_number: installment.installment_number,
    });
    
    // Create reminder
    await supabase.from('payment_reminders').insert({
      student_id: installment.student_fees.student_id,
      installment_id: installment.id,
      reminder_type: reminderType,
      days_offset: daysOffset,
      reminder_subject: template.subject,
      reminder_message: message,
      send_via: 'both',
      scheduled_at: new Date().toISOString(),
    });
  },
  
  replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    
    return result;
  },
  
  async sendPendingReminders() {
    const { data: reminders } = await supabase
      .from('payment_reminders')
      .select(`
        *,
        users:student_id(email, phone)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString());
    
    if (!reminders) return;
    
    for (const reminder of reminders) {
      try {
        if (reminder.send_via === 'email' || reminder.send_via === 'both') {
          await this.sendEmail(
            reminder.users.email,
            reminder.reminder_subject,
            reminder.reminder_message
          );
        }
        
        if (reminder.send_via === 'sms' || reminder.send_via === 'both') {
          await this.sendSMS(reminder.users.phone, reminder.reminder_message);
        }
        
        await supabase
          .from('payment_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', reminder.id);
      } catch (error) {
        await supabase
          .from('payment_reminders')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', reminder.id);
      }
    }
  },
  
  async sendEmail(to: string, subject: string, body: string) {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, body },
    });
    
    if (error) throw error;
  },
  
  async sendSMS(to: string, message: string) {
    const { error } = await supabase.functions.invoke('send-sms', {
      body: { to, message },
    });
    
    if (error) throw error;
  },
  
  async getAutomationRules() {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async calculateLateFees() {
    // Get late fee config
    const { data: config } = await supabase
      .from('late_fee_config')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (!config) return;
    
    // Get overdue installments
    const { data: installments } = await supabase
      .from('fee_installments')
      .select('*')
      .eq('payment_status', 'pending')
      .lt('due_date', new Date().toISOString());
    
    if (!installments) return;
    
    for (const installment of installments) {
      const dueDate = new Date(installment.due_date);
      const now = new Date();
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue <= config.grace_period_days) continue;
      
      let lateFee = 0;
      
      if (config.late_fee_type === 'fixed') {
        lateFee = config.fixed_amount;
      } else if (config.late_fee_type === 'percentage') {
        lateFee = (installment.amount * config.percentage_rate) / 100;
      }
      
      if (config.max_late_fee && lateFee > config.max_late_fee) {
        lateFee = config.max_late_fee;
      }
      
      // Apply late fee
      await supabase.from('late_fees_applied').insert({
        installment_id: installment.id,
        late_fee_amount: lateFee,
        days_overdue: daysOverdue,
      });
    }
  },
  
  async getLateFeeConfig() {
    const { data, error } = await supabase
      .from('late_fee_config')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },
  
  async saveLateFeeConfig(configData: any) {
    const { data, error } = await supabase
      .from('late_fee_config')
      .upsert(configData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Next Steps

1. ✅ Create reminder schema
2. ✅ Implement reminder configuration
3. ✅ Build automation rules manager
4. ✅ Create late fee configuration
5. ✅ Create reminder service
6. ✅ Proceed to `39_FINANCIAL_REPORTS.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Payment Reminders & Automation Complete  
**Next Phase:** 39_FINANCIAL_REPORTS.md
