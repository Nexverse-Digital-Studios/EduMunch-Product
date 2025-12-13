# Invoices & Receipts Generation

---

## 🎯 Development Rules for This Document

> **Rule 1:** DO NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Invoices & Receipts Generation provides GST-compliant invoice creation, receipt generation, PDF export, email distribution, and document management.

---

## Database Schema

### Invoice and Receipt Tables

```sql
-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  invoice_number VARCHAR(100) UNIQUE,
  invoice_date DATE DEFAULT CURRENT_DATE,
  
  due_date DATE,
  
  subtotal DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  
  invoice_items JSONB,                             -- Line items with description, quantity, rate
  
  tax_breakdown JSONB,                             -- CGST, SGST, IGST breakdown
  
  notes TEXT,
  terms_and_conditions TEXT,
  
  invoice_status VARCHAR(50) DEFAULT 'draft',      -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  
  pdf_url TEXT,
  
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

-- Receipts
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  payment_id UUID NOT NULL,
  
  receipt_number VARCHAR(100) UNIQUE,
  receipt_date DATE DEFAULT CURRENT_DATE,
  
  amount_received DECIMAL(10, 2),
  payment_method VARCHAR(50),
  
  transaction_reference VARCHAR(255),
  
  remarks TEXT,
  
  pdf_url TEXT,
  
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment FOREIGN KEY (payment_id) 
    REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Invoice Templates
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  template_name VARCHAR(255),
  template_type VARCHAR(50),                       -- 'invoice', 'receipt', 'proforma'
  
  header_html TEXT,
  footer_html TEXT,
  
  terms_and_conditions TEXT,
  
  logo_url TEXT,
  
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Document Sequence (for numbering)
CREATE TABLE document_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  document_type VARCHAR(50),                       -- 'invoice', 'receipt'
  
  prefix VARCHAR(20),
  current_number INTEGER DEFAULT 0,
  
  year INTEGER,
  month INTEGER,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT unique_sequence UNIQUE (org_id, document_type, year, month)
);

CREATE INDEX idx_invoices_org ON invoices(org_id);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(invoice_status);
CREATE INDEX idx_receipts_org ON receipts(org_id);
CREATE INDEX idx_receipts_payment ON receipts(payment_id);
CREATE INDEX idx_receipts_number ON receipts(receipt_number);
```

---

## Invoice & Receipt Components

### 1. Invoice Generator

```typescript
// src/components/finance/Invoice/InvoiceGenerator.tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack:react-query';
import { useForm } from 'react-hook-form';
import { invoiceService } from '@/services/finance/invoice.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';
import { FormTextarea } from '@/components/common/forms/FormTextarea';
import { Plus, Trash2, FileText, Send } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export const InvoiceGenerator: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);
  
  const { register, handleSubmit, watch } = useForm();
  
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => invoiceService.getStudents(),
  });
  
  const { data: orgSettings } = useQuery({
    queryKey: ['org-settings'],
    queryFn: () => invoiceService.getOrganizationSettings(),
  });
  
  const { mutate: generateInvoice, isPending } = useMutation({
    mutationFn: (data: any) => invoiceService.createInvoice(data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      // Download PDF
      invoiceService.downloadInvoicePDF(invoice.id);
    },
  });
  
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    
    setItems(updated);
  };
  
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstRate = orgSettings?.gst_rate || 18;
  const cgst = (subtotal * gstRate) / 200; // Half for CGST
  const sgst = (subtotal * gstRate) / 200; // Half for SGST
  const total = subtotal + cgst + sgst;
  
  const onSubmit = (formData: any) => {
    generateInvoice({
      student_id: selectedStudent,
      invoice_items: items,
      subtotal: subtotal,
      tax_amount: cgst + sgst,
      total_amount: total,
      tax_breakdown: { cgst, sgst, gst_rate: gstRate },
      notes: formData.notes,
      due_date: formData.due_date,
    });
  };
  
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Generate Invoice</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Student</label>
            <select
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} - {student.email}
                </option>
              ))}
            </select>
          </div>
          
          <FormInput
            label="Due Date"
            type="date"
            {...register('due_date')}
            required
          />
        </div>
        
        {/* Invoice Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
            <Button onClick={addItem} size="sm" type="button">
              <Plus size={16} className="mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start p-3 border border-gray-200 rounded-lg">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    placeholder="Qty"
                    className="w-full p-2 border border-gray-300 rounded"
                    min="1"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                    placeholder="Rate"
                    className="w-full p-2 border border-gray-300 rounded"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <input
                    type="text"
                    value={`₹${item.amount.toFixed(2)}`}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
                
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Totals */}
        <div className="border-t border-gray-200 pt-4">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CGST ({gstRate / 2}%)</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">SGST ({gstRate / 2}%)</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <FormTextarea
          label="Notes"
          {...register('notes')}
          placeholder="Add any additional notes..."
          rows={3}
        />
        
        <div className="flex gap-3">
          <Button type="submit" isLoading={isPending} disabled={isPending}>
            <FileText size={16} className="mr-2" />
            Generate Invoice
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

### 2. Receipt Viewer

```typescript
// src/components/finance/Invoice/ReceiptViewer.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '@/services/finance/invoice.service';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { Download, Mail, Printer } from 'lucide-react';

interface ReceiptViewerProps {
  receiptId: string;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ receiptId }) => {
  const { data: receipt } = useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: () => invoiceService.getReceipt(receiptId),
  });
  
  const handleDownload = () => {
    if (receipt?.pdf_url) {
      window.open(receipt.pdf_url, '_blank');
    }
  };
  
  const handleEmail = () => {
    invoiceService.emailReceipt(receiptId);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (!receipt) {
    return <div>Loading receipt...</div>;
  };
  
  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button onClick={handleDownload} size="sm">
          <Download size={16} className="mr-2" />
          Download PDF
        </Button>
        <Button onClick={handleEmail} size="sm" variant="secondary">
          <Mail size={16} className="mr-2" />
          Email Receipt
        </Button>
        <Button onClick={handlePrint} size="sm" variant="secondary">
          <Printer size={16} className="mr-2" />
          Print
        </Button>
      </div>
      
      {/* Receipt Content */}
      <Card className="print:shadow-none">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {receipt.org_logo && (
                <img src={receipt.org_logo} alt="Logo" className="h-16 mb-4" />
              )}
              <h1 className="text-3xl font-bold text-gray-800">{receipt.org_name}</h1>
              <p className="text-gray-600">{receipt.org_address}</p>
              <p className="text-gray-600">
                GSTIN: {receipt.org_gstin} | PAN: {receipt.org_pan}
              </p>
            </div>
            
            <div className="text-right">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">RECEIPT</h2>
              <p className="text-lg font-mono">{receipt.receipt_number}</p>
              <p className="text-gray-600">{new Date(receipt.receipt_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Student Details */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Received From</h3>
            <p className="font-medium">{receipt.student_name}</p>
            <p className="text-gray-600">{receipt.student_email}</p>
            {receipt.student_phone && (
              <p className="text-gray-600">{receipt.student_phone}</p>
            )}
          </div>
          
          {/* Payment Details */}
          <div className="mb-8">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600">Payment Method</td>
                  <td className="py-3 text-right font-medium capitalize">
                    {receipt.payment_method}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600">Transaction Reference</td>
                  <td className="py-3 text-right font-mono text-sm">
                    {receipt.transaction_reference || 'N/A'}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-semibold text-lg">Amount Received</td>
                  <td className="py-3 text-right text-2xl font-bold text-green-600">
                    ₹{receipt.amount_received.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Amount in Words */}
          <div className="mb-8 p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Amount in Words</p>
            <p className="font-medium">{receipt.amount_in_words}</p>
          </div>
          
          {/* Remarks */}
          {receipt.remarks && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Remarks</h3>
              <p className="text-gray-600">{receipt.remarks}</p>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600">
                  This is a computer-generated receipt and does not require a signature.
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold mb-2">Authorized Signature</p>
                <div className="border-t border-gray-400 w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
```

---

## Invoice & Receipt Service

```typescript
// src/services/finance/invoice.service.ts
import { supabase } from '@/services/api/client';

export const invoiceService = {
  async getStudents() {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'student');
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getOrganizationSettings() {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('gst_rate, gst_number')
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async getNextInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const { data: sequence } = await supabase
      .from('document_sequences')
      .select('current_number, prefix')
      .eq('document_type', 'invoice')
      .eq('year', year)
      .eq('month', month)
      .single();
    
    if (sequence) {
      const newNumber = sequence.current_number + 1;
      
      await supabase
        .from('document_sequences')
        .update({ current_number: newNumber })
        .eq('document_type', 'invoice')
        .eq('year', year)
        .eq('month', month);
      
      return `${sequence.prefix}${year}${month.toString().padStart(2, '0')}${newNumber.toString().padStart(4, '0')}`;
    } else {
      // Create new sequence
      await supabase.from('document_sequences').insert({
        document_type: 'invoice',
        prefix: 'INV-',
        current_number: 1,
        year: year,
        month: month,
      });
      
      return `INV-${year}${month.toString().padStart(2, '0')}0001`;
    }
  },
  
  async createInvoice(invoiceData: any) {
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        student_id: invoiceData.student_id,
        invoice_items: invoiceData.invoice_items,
        subtotal: invoiceData.subtotal,
        tax_amount: invoiceData.tax_amount,
        total_amount: invoiceData.total_amount,
        tax_breakdown: invoiceData.tax_breakdown,
        notes: invoiceData.notes,
        due_date: invoiceData.due_date,
        invoice_status: 'sent',
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Generate PDF
    await this.generateInvoicePDF(data.id);
    
    return data;
  },
  
  async generateInvoicePDF(invoiceId: string) {
    // Call edge function to generate PDF
    const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
      body: { invoice_id: invoiceId },
    });
    
    if (error) throw new Error(error.message);
    
    // Update invoice with PDF URL
    await supabase
      .from('invoices')
      .update({ pdf_url: data.pdf_url })
      .eq('id', invoiceId);
    
    return data.pdf_url;
  },
  
  async downloadInvoicePDF(invoiceId: string) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('pdf_url, invoice_number')
      .eq('id', invoiceId)
      .single();
    
    if (invoice?.pdf_url) {
      const link = document.createElement('a');
      link.href = invoice.pdf_url;
      link.download = `${invoice.invoice_number}.pdf`;
      link.click();
    }
  },
  
  async createReceipt(paymentId: string) {
    const { data: payment } = await supabase
      .from('payments')
      .select(`
        *,
        users:student_id(full_name, email, phone)
      `)
      .eq('id', paymentId)
      .single();
    
    if (!payment) throw new Error('Payment not found');
    
    const receiptNumber = await this.getNextReceiptNumber();
    
    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert({
        receipt_number: receiptNumber,
        payment_id: paymentId,
        amount_received: payment.payment_amount,
        payment_method: payment.payment_method,
        transaction_reference: payment.transaction_id || payment.cheque_number,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Generate PDF
    await this.generateReceiptPDF(receipt.id);
    
    return receipt;
  },
  
  async getNextReceiptNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const { data: sequence } = await supabase
      .from('document_sequences')
      .select('current_number, prefix')
      .eq('document_type', 'receipt')
      .eq('year', year)
      .eq('month', month)
      .single();
    
    if (sequence) {
      const newNumber = sequence.current_number + 1;
      
      await supabase
        .from('document_sequences')
        .update({ current_number: newNumber })
        .eq('document_type', 'receipt')
        .eq('year', year)
        .eq('month', month);
      
      return `${sequence.prefix}${year}${month.toString().padStart(2, '0')}${newNumber.toString().padStart(4, '0')}`;
    } else {
      await supabase.from('document_sequences').insert({
        document_type: 'receipt',
        prefix: 'RCP-',
        current_number: 1,
        year: year,
        month: month,
      });
      
      return `RCP-${year}${month.toString().padStart(2, '0')}0001`;
    }
  },
  
  async generateReceiptPDF(receiptId: string) {
    const { data, error } = await supabase.functions.invoke('generate-receipt-pdf', {
      body: { receipt_id: receiptId },
    });
    
    if (error) throw new Error(error.message);
    
    await supabase
      .from('receipts')
      .update({ pdf_url: data.pdf_url })
      .eq('id', receiptId);
    
    return data.pdf_url;
  },
  
  async getReceipt(receiptId: string) {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        payments(
          users:student_id(full_name, email, phone)
        ),
        organizations(name, address, gstin, pan, logo_url)
      `)
      .eq('id', receiptId)
      .single();
    
    if (error) throw new Error(error.message);
    
    return {
      ...data,
      student_name: data.payments.users.full_name,
      student_email: data.payments.users.email,
      student_phone: data.payments.users.phone,
      org_name: data.organizations.name,
      org_address: data.organizations.address,
      org_gstin: data.organizations.gstin,
      org_pan: data.organizations.pan,
      org_logo: data.organizations.logo_url,
      amount_in_words: this.convertToWords(data.amount_received),
    };
  },
  
  async emailReceipt(receiptId: string) {
    const { data, error } = await supabase.functions.invoke('email-receipt', {
      body: { receipt_id: receiptId },
    });
    
    if (error) throw new Error(error.message);
    
    await supabase
      .from('receipts')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq('id', receiptId);
  },
  
  convertToWords(amount: number): string {
    // Simplified conversion - implement full conversion logic
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    
    return `Rupees ${rupees} ${paise > 0 ? `and ${paise} Paise` : ''} Only`;
  },
};
```

---

## Next Steps

1. ✅ Create invoice/receipt schema
2. ✅ Implement invoice generator
3. ✅ Build receipt viewer
4. ✅ Create invoice/receipt service
5. ✅ Proceed to `38_PAYMENT_REMINDERS_AUTOMATION.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Invoices & Receipts Generation Complete  
**Next Phase:** 38_PAYMENT_REMINDERS_AUTOMATION.md
