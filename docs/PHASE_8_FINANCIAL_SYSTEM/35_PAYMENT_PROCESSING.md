# Payment Processing

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Payment Processing provides comprehensive payment tracking, manual payment entry, payment status management, installment tracking, and receipt generation.

---

## Database Schema

### Payment Tables

```sql
-- Payments (main payment records)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  payment_reference VARCHAR(100) UNIQUE,
  
  payment_amount DECIMAL(10, 2),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  payment_method VARCHAR(50),                       -- 'cash', 'cheque', 'online', 'upi', 'card', 'bank_transfer'
  
  payment_status VARCHAR(50) DEFAULT 'pending',     -- 'pending', 'realized', 'failed', 'cancelled', 'refunded'
  
  transaction_id VARCHAR(255),
  
  cheque_number VARCHAR(100),
  cheque_date DATE,
  bank_name VARCHAR(255),
  
  upi_transaction_id VARCHAR(255),
  
  remarks TEXT,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Payment Allocations (linking payments to installments)
CREATE TABLE payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  installment_id UUID NOT NULL,
  
  allocated_amount DECIMAL(10, 2),
  
  allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_payment FOREIGN KEY (payment_id) 
    REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_installment FOREIGN KEY (installment_id) 
    REFERENCES fee_installments(id) ON DELETE CASCADE
);

-- Payment Status History
CREATE TABLE payment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  
  reason TEXT,
  
  changed_by UUID,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_payment FOREIGN KEY (payment_id) 
    REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_changed_by FOREIGN KEY (changed_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  
  refund_method VARCHAR(50),
  refund_reference VARCHAR(100),
  
  refund_status VARCHAR(50) DEFAULT 'pending',      -- 'pending', 'processed', 'completed', 'failed'
  
  requested_by UUID,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  approved_by UUID,
  approved_at TIMESTAMP,
  
  processed_at TIMESTAMP,
  
  CONSTRAINT fk_payment FOREIGN KEY (payment_id) 
    REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_requested_by FOREIGN KEY (requested_by) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Outstanding Balances (Materialized View)
CREATE MATERIALIZED VIEW outstanding_balances AS
SELECT
  sf.student_id,
  sf.id as student_fee_id,
  sf.final_amount as total_fee,
  COALESCE(SUM(pa.allocated_amount), 0) as total_paid,
  sf.final_amount - COALESCE(SUM(pa.allocated_amount), 0) as outstanding_amount
FROM student_fees sf
LEFT JOIN fee_installments fi ON fi.student_fee_id = sf.id
LEFT JOIN payment_allocations pa ON pa.installment_id = fi.id
GROUP BY sf.id, sf.student_id, sf.final_amount;

CREATE INDEX idx_payments_org ON payments(org_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_installment ON payment_allocations(installment_id);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
```

---

## Payment Components

### 1. Manual Payment Entry Form

```typescript
// src/components/finance/Payment/ManualPaymentForm.tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { paymentService } from '@/services/finance/payment.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { FormSelect } from '@/components/common/forms/FormSelect';
import { FormTextarea } from '@/components/common/forms/FormTextarea';
import { DollarSign, CreditCard, FileText } from 'lucide-react';

const paymentSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  payment_amount: z.number().positive('Amount must be positive'),
  payment_method: z.enum(['cash', 'cheque', 'online', 'upi', 'card', 'bank_transfer']),
  transaction_id: z.string().optional(),
  cheque_number: z.string().optional(),
  cheque_date: z.string().optional(),
  bank_name: z.string().optional(),
  remarks: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const ManualPaymentForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });
  
  const paymentMethod = watch('payment_method');
  
  const { data: students = [] } = useQuery({
    queryKey: ['students-with-fees'],
    queryFn: () => paymentService.getStudentsWithOutstanding(),
  });
  
  const { data: studentDetails } = useQuery({
    queryKey: ['student-fee-details', selectedStudent],
    queryFn: () => paymentService.getStudentFeeDetails(selectedStudent!),
    enabled: !!selectedStudent,
  });
  
  const { mutate: recordPayment, isPending } = useMutation({
    mutationFn: (data: PaymentFormData) => paymentService.recordManualPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['outstanding-balances'] });
    },
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Payment Form */}
      <div className="lg:col-span-2">
        <Card>
          <h2 className="text-2xl font-bold mb-6">Record Payment</h2>
          
          <form onSubmit={handleSubmit((data) => recordPayment(data))} className="space-y-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Student</label>
              <select
                {...register('student_id')}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} - {student.email} (Outstanding: ₹{student.outstanding})
                  </option>
                ))}
              </select>
              {errors.student_id && (
                <p className="text-red-600 text-sm mt-1">{errors.student_id.message}</p>
              )}
            </div>
            
            {/* Payment Amount */}
            <FormInput
              label="Payment Amount"
              type="number"
              step="0.01"
              {...register('payment_amount', { valueAsNumber: true })}
              error={errors.payment_amount?.message}
              placeholder="0.00"
              icon={<DollarSign size={18} />}
            />
            
            {/* Payment Method */}
            <FormSelect
              label="Payment Method"
              {...register('payment_method')}
              error={errors.payment_method?.message}
            >
              <option value="">Select Method</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online Banking</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </FormSelect>
            
            {/* Conditional Fields based on Payment Method */}
            {paymentMethod === 'cheque' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <FormInput
                  label="Cheque Number"
                  {...register('cheque_number')}
                  placeholder="Enter cheque number"
                />
                <FormInput
                  label="Cheque Date"
                  type="date"
                  {...register('cheque_date')}
                />
                <FormInput
                  label="Bank Name"
                  {...register('bank_name')}
                  placeholder="Enter bank name"
                  className="col-span-2"
                />
              </div>
            )}
            
            {(paymentMethod === 'online' || paymentMethod === 'upi' || paymentMethod === 'card') && (
              <FormInput
                label="Transaction ID"
                {...register('transaction_id')}
                placeholder="Enter transaction ID"
                icon={<CreditCard size={18} />}
              />
            )}
            
            {/* Remarks */}
            <FormTextarea
              label="Remarks"
              {...register('remarks')}
              placeholder="Add any additional notes..."
              rows={3}
            />
            
            <div className="flex gap-3">
              <Button type="submit" isLoading={isPending} disabled={isPending}>
                <FileText size={16} className="mr-2" />
                Record Payment
              </Button>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      {/* Student Fee Summary */}
      <div>
        {studentDetails && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Fee Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fee</span>
                <span className="font-bold">₹{studentDetails.total_fee.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-bold text-green-600">
                  ₹{studentDetails.paid_amount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold">Outstanding</span>
                <span className="text-xl font-bold text-red-600">
                  ₹{studentDetails.outstanding_amount.toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Pending Installments */}
            {studentDetails.pending_installments?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Pending Installments</h4>
                <div className="space-y-2">
                  {studentDetails.pending_installments.map((inst: any) => (
                    <div key={inst.id} className="p-3 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Installment #{inst.installment_number}</span>
                        <span className="font-bold">₹{inst.amount}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Due: {new Date(inst.due_date).toLocaleDateString()}
                        {inst.is_overdue && (
                          <span className="ml-2 text-red-600 font-medium">(Overdue)</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
```

### 2. Payment List View

```typescript
// src/components/finance/Payment/PaymentListView.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/finance/payment.service';
import { DataTable } from '@/components/common/tables/DataTable';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { Download, Eye, CheckCircle, XCircle } from 'lucide-react';

export const PaymentListView: React.FC = () => {
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
  });
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentService.getPayments(filters),
  });
  
  const columns = [
    {
      key: 'payment_reference',
      label: 'Reference',
      render: (payment: any) => (
        <span className="font-mono text-sm">{payment.payment_reference}</span>
      ),
    },
    {
      key: 'student_name',
      label: 'Student',
      render: (payment: any) => (
        <div>
          <p className="font-medium">{payment.student_name}</p>
          <p className="text-sm text-gray-600">{payment.student_email}</p>
        </div>
      ),
    },
    {
      key: 'payment_amount',
      label: 'Amount',
      render: (payment: any) => (
        <span className="font-bold text-lg">₹{payment.payment_amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (payment: any) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
          {payment.payment_method}
        </span>
      ),
    },
    {
      key: 'payment_date',
      label: 'Date',
      render: (payment: any) => (
        <div className="text-sm">
          <p>{new Date(payment.payment_date).toLocaleDateString()}</p>
          <p className="text-gray-600">{new Date(payment.payment_date).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (payment: any) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          realized: 'bg-green-100 text-green-800',
          failed: 'bg-red-100 text-red-800',
          cancelled: 'bg-gray-100 text-gray-800',
          refunded: 'bg-purple-100 text-purple-800',
        };
        
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              colors[payment.payment_status as keyof typeof colors]
            }`}
          >
            {payment.payment_status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (payment: any) => (
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded" title="View Details">
            <Eye size={16} />
          </button>
          {payment.payment_status === 'pending' && (
            <>
              <button
                className="p-2 hover:bg-green-50 text-green-600 rounded"
                title="Mark as Realized"
              >
                <CheckCircle size={16} />
              </button>
              <button
                className="p-2 hover:bg-red-50 text-red-600 rounded"
                title="Cancel Payment"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-blue-50 text-blue-600 rounded" title="Download Receipt">
            <Download size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="realized">Realized</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </Card>
      
      {/* Payment Table */}
      <DataTable columns={columns} data={payments} isLoading={isLoading} />
    </div>
  );
};
```

---

## Payment Service

```typescript
// src/services/finance/payment.service.ts
import { supabase } from '@/services/api/client';

export const paymentService = {
  async getStudentsWithOutstanding() {
    const { data, error } = await supabase
      .from('outstanding_balances')
      .select(`
        student_id,
        outstanding_amount,
        users:student_id(full_name, email)
      `)
      .gt('outstanding_amount', 0);
    
    if (error) throw new Error(error.message);
    
    return data?.map((item) => ({
      id: item.student_id,
      full_name: item.users.full_name,
      email: item.users.email,
      outstanding: item.outstanding_amount,
    })) || [];
  },
  
  async getStudentFeeDetails(studentId: string) {
    const { data: balance } = await supabase
      .from('outstanding_balances')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (!balance) return null;
    
    // Get pending installments
    const { data: installments } = await supabase
      .from('fee_installments')
      .select('*')
      .eq('student_fee_id', balance.student_fee_id)
      .eq('payment_status', 'pending')
      .order('due_date', { ascending: true });
    
    const now = new Date();
    const pendingInstallments = installments?.map((inst) => ({
      ...inst,
      is_overdue: new Date(inst.due_date) < now,
    }));
    
    return {
      total_fee: balance.total_fee,
      paid_amount: balance.total_paid,
      outstanding_amount: balance.outstanding_amount,
      pending_installments: pendingInstallments,
    };
  },
  
  async recordManualPayment(paymentData: any) {
    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        student_id: paymentData.student_id,
        payment_reference: paymentReference,
        payment_amount: paymentData.payment_amount,
        payment_method: paymentData.payment_method,
        payment_status: paymentData.payment_method === 'cheque' ? 'pending' : 'realized',
        transaction_id: paymentData.transaction_id,
        cheque_number: paymentData.cheque_number,
        cheque_date: paymentData.cheque_date,
        bank_name: paymentData.bank_name,
        remarks: paymentData.remarks,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Auto-allocate to pending installments
    if (data.payment_status === 'realized') {
      await this.allocatePaymentToInstallments(data.id, data.student_id, data.payment_amount);
    }
    
    return data;
  },
  
  async allocatePaymentToInstallments(paymentId: string, studentId: string, amount: number) {
    // Get pending installments
    const { data: installments } = await supabase
      .from('fee_installments')
      .select(`
        id,
        amount,
        paid_amount
      `)
      .eq('student_id', studentId)
      .eq('payment_status', 'pending')
      .order('due_date', { ascending: true });
    
    if (!installments || installments.length === 0) return;
    
    let remainingAmount = amount;
    const allocations = [];
    
    for (const installment of installments) {
      if (remainingAmount <= 0) break;
      
      const dueAmount = installment.amount - (installment.paid_amount || 0);
      const allocationAmount = Math.min(remainingAmount, dueAmount);
      
      allocations.push({
        payment_id: paymentId,
        installment_id: installment.id,
        allocated_amount: allocationAmount,
      });
      
      // Update installment
      const newPaidAmount = (installment.paid_amount || 0) + allocationAmount;
      const newStatus = newPaidAmount >= installment.amount ? 'paid' : 'partial';
      
      await supabase
        .from('fee_installments')
        .update({
          paid_amount: newPaidAmount,
          payment_status: newStatus,
        })
        .eq('id', installment.id);
      
      remainingAmount -= allocationAmount;
    }
    
    // Insert allocations
    if (allocations.length > 0) {
      await supabase.from('payment_allocations').insert(allocations);
    }
  },
  
  async getPayments(filters: any) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        users:student_id(full_name, email)
      `)
      .order('payment_date', { ascending: false });
    
    if (filters.status) {
      query = query.eq('payment_status', filters.status);
    }
    
    if (filters.method) {
      query = query.eq('payment_method', filters.method);
    }
    
    if (filters.dateFrom) {
      query = query.gte('payment_date', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte('payment_date', filters.dateTo);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    
    return data?.map((payment) => ({
      ...payment,
      student_name: payment.users.full_name,
      student_email: payment.users.email,
    })) || [];
  },
  
  async updatePaymentStatus(paymentId: string, newStatus: string, reason?: string) {
    const { data: payment } = await supabase
      .from('payments')
      .select('payment_status')
      .eq('id', paymentId)
      .single();
    
    if (!payment) throw new Error('Payment not found');
    
    // Update payment status
    await supabase
      .from('payments')
      .update({ payment_status: newStatus })
      .eq('id', paymentId);
    
    // Record status history
    await supabase.from('payment_status_history').insert({
      payment_id: paymentId,
      previous_status: payment.payment_status,
      new_status: newStatus,
      reason: reason,
    });
  },
};
```

---

## Next Steps

1. ✅ Create payment schema
2. ✅ Implement manual payment form
3. ✅ Build payment list view
4. ✅ Create payment service
5. ✅ Proceed to `36_PAYMENT_GATEWAY_INTEGRATION.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Payment Processing Complete  
**Next Phase:** 36_PAYMENT_GATEWAY_INTEGRATION.md
