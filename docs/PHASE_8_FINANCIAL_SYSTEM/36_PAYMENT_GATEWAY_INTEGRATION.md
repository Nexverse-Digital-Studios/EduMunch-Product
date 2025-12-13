# Payment Gateway Integration

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

Payment Gateway Integration provides Razorpay integration for online payments, UPI, cards, net banking, and secure payment flow with webhook handling.

---

## Database Schema

### Payment Gateway Tables

```sql
-- Payment Gateway Configuration
CREATE TABLE payment_gateway_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  
  gateway_name VARCHAR(50),                        -- 'razorpay', 'stripe', 'paytm'
  
  is_active BOOLEAN DEFAULT true,
  is_test_mode BOOLEAN DEFAULT true,
  
  api_key VARCHAR(255),
  api_secret VARCHAR(255),                         -- Encrypted
  
  webhook_secret VARCHAR(255),
  
  config_data JSONB,                               -- Additional configuration
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Online Payment Transactions
CREATE TABLE online_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  
  gateway_order_id VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  gateway_signature VARCHAR(255),
  
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  
  payment_method VARCHAR(50),                      -- 'card', 'upi', 'netbanking', 'wallet'
  
  transaction_status VARCHAR(50),                  -- 'created', 'attempted', 'authorized', 'captured', 'failed'
  
  error_code VARCHAR(100),
  error_description TEXT,
  
  gateway_response JSONB,                          -- Full response from gateway
  
  attempted_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_payment FOREIGN KEY (payment_id) 
    REFERENCES payments(id) ON DELETE CASCADE
);

-- Webhook Events
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(100),
  
  gateway_name VARCHAR(50),
  
  payload JSONB,
  
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  
  error_message TEXT,
  
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_event UNIQUE (gateway_name, event_id)
);

-- Payment Links (for sharing payment links)
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  
  link_reference VARCHAR(100) UNIQUE,
  
  amount DECIMAL(10, 2),
  description TEXT,
  
  link_url TEXT,
  
  expires_at TIMESTAMP,
  
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  
  payment_id UUID,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment FOREIGN KEY (payment_id) 
    REFERENCES payments(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_online_transactions_payment ON online_transactions(payment_id);
CREATE INDEX idx_online_transactions_gateway_order ON online_transactions(gateway_order_id);
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_payment_links_student ON payment_links(student_id);
CREATE INDEX idx_payment_links_reference ON payment_links(link_reference);
```

---

## Payment Gateway Components

### 1. Razorpay Payment Component

```typescript
// src/components/finance/PaymentGateway/RazorpayPayment.tsx
import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { paymentGatewayService } from '@/services/finance/paymentGateway.service';
import { Button } from '@/components/common/buttons/Button';
import { CreditCard } from 'lucide-react';

interface RazorpayPaymentProps {
  studentId: string;
  amount: number;
  description: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  studentId,
  amount,
  description,
  onSuccess,
  onFailure,
}) => {
  useEffect(() => {
    // Load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: () =>
      paymentGatewayService.createRazorpayOrder({
        student_id: studentId,
        amount: amount,
        description: description,
      }),
    onSuccess: (order) => {
      openRazorpayCheckout(order);
    },
    onError: (error) => {
      onFailure(error);
    },
  });
  
  const openRazorpayCheckout = (order: any) => {
    const options = {
      key: order.razorpay_key,
      amount: order.amount * 100, // Convert to paise
      currency: 'INR',
      name: order.org_name,
      description: order.description,
      order_id: order.order_id,
      handler: async (response: any) => {
        // Verify payment
        try {
          const verifiedPayment = await paymentGatewayService.verifyRazorpayPayment({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          
          onSuccess(verifiedPayment.payment_id);
        } catch (error) {
          onFailure(error);
        }
      },
      prefill: {
        name: order.student_name,
        email: order.student_email,
        contact: order.student_phone,
      },
      theme: {
        color: '#3B82F6',
      },
      modal: {
        ondismiss: () => {
          onFailure({ message: 'Payment cancelled by user' });
        },
      },
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };
  
  return (
    <Button
      onClick={() => createOrder()}
      isLoading={isPending}
      disabled={isPending}
      className="w-full"
    >
      <CreditCard size={20} className="mr-2" />
      Pay ₹{amount.toLocaleString()} via Razorpay
    </Button>
  );
};
```

### 2. Payment Method Selector

```typescript
// src/components/finance/PaymentGateway/PaymentMethodSelector.tsx
import React, { useState } from 'react';
import { Card } from '@/components/common/cards/Card';
import { CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  onSelect: (method: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard size={24} />,
      description: 'Pay securely using your credit or debit card',
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone size={24} />,
      description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building2 size={24} />,
      description: 'Pay directly from your bank account',
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: <Wallet size={24} />,
      description: 'Pay using digital wallets',
    },
  ];
  
  const handleSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onSelect(methodId);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => handleSelect(method.id)}
          className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md ${
            selectedMethod === method.id
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${
                selectedMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {method.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
```

### 3. Payment Success/Failure

```typescript
// src/components/finance/PaymentGateway/PaymentResult.tsx
import React from 'react';
import { Card } from '@/components/common/cards/Card';
import { Button } from '@/components/common/buttons/Button';
import { CheckCircle, XCircle, Download } from 'lucide-react';

interface PaymentResultProps {
  success: boolean;
  transactionId?: string;
  amount?: number;
  message?: string;
  onDownloadReceipt?: () => void;
  onClose: () => void;
}

export const PaymentResult: React.FC<PaymentResultProps> = ({
  success,
  transactionId,
  amount,
  message,
  onDownloadReceipt,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          {success ? (
            <>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully.
              </p>
              
              {amount && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                  <p className="text-3xl font-bold text-green-600">₹{amount.toLocaleString()}</p>
                </div>
              )}
              
              {transactionId && (
                <div className="mb-6 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm">{transactionId}</p>
                </div>
              )}
              
              <div className="space-y-3">
                {onDownloadReceipt && (
                  <Button onClick={onDownloadReceipt} className="w-full">
                    <Download size={16} className="mr-2" />
                    Download Receipt
                  </Button>
                )}
                <Button onClick={onClose} variant="secondary" className="w-full">
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle size={48} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">
                {message || 'We could not process your payment. Please try again.'}
              </p>
              
              <div className="space-y-3">
                <Button onClick={onClose} className="w-full">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="secondary" className="w-full">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
```

---

## Payment Gateway Service

```typescript
// src/services/finance/paymentGateway.service.ts
import { supabase } from '@/services/api/client';
import crypto from 'crypto';

export const paymentGatewayService = {
  async getGatewayConfig() {
    const { data, error } = await supabase
      .from('payment_gateway_config')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async createRazorpayOrder(orderData: any) {
    // Call backend edge function to create Razorpay order
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        student_id: orderData.student_id,
        amount: orderData.amount,
        description: orderData.description,
      },
    });
    
    if (error) throw new Error(error.message);
    
    // Store transaction record
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        student_id: orderData.student_id,
        payment_amount: orderData.amount,
        payment_method: 'online',
        payment_status: 'pending',
      })
      .select()
      .single();
    
    await supabase.from('online_transactions').insert({
      payment_id: payment.id,
      gateway_order_id: data.order_id,
      amount: orderData.amount,
      transaction_status: 'created',
    });
    
    return {
      ...data,
      payment_internal_id: payment.id,
    };
  },
  
  async verifyRazorpayPayment(verificationData: any) {
    // Verify signature
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: verificationData,
    });
    
    if (error || !data.verified) {
      throw new Error('Payment verification failed');
    }
    
    // Update transaction status
    await supabase
      .from('online_transactions')
      .update({
        gateway_payment_id: verificationData.payment_id,
        gateway_signature: verificationData.signature,
        transaction_status: 'captured',
        completed_at: new Date().toISOString(),
      })
      .eq('gateway_order_id', verificationData.order_id);
    
    // Update payment status
    const { data: transaction } = await supabase
      .from('online_transactions')
      .select('payment_id')
      .eq('gateway_order_id', verificationData.order_id)
      .single();
    
    if (transaction) {
      await supabase
        .from('payments')
        .update({ payment_status: 'realized' })
        .eq('id', transaction.payment_id);
      
      return { payment_id: transaction.payment_id };
    }
    
    throw new Error('Transaction not found');
  },
  
  async handleWebhook(webhookData: any, signature: string, gatewayName: string) {
    // Verify webhook signature
    const config = await this.getGatewayConfig();
    
    if (gatewayName === 'razorpay') {
      const expectedSignature = crypto
        .createHmac('sha256', config.webhook_secret)
        .update(JSON.stringify(webhookData))
        .digest('hex');
      
      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature');
      }
    }
    
    // Store webhook event
    const { data: event } = await supabase
      .from('webhook_events')
      .insert({
        event_id: webhookData.event || webhookData.id,
        event_type: webhookData.event_type || webhookData.type,
        gateway_name: gatewayName,
        payload: webhookData,
      })
      .select()
      .single();
    
    // Process webhook event
    await this.processWebhookEvent(event);
  },
  
  async processWebhookEvent(event: any) {
    const payload = event.payload;
    
    switch (event.event_type) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
      
      case 'refund.processed':
        await this.handleRefundProcessed(payload);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event_type);
    }
    
    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('id', event.id);
  },
  
  async handlePaymentCaptured(payload: any) {
    const paymentEntity = payload.payload?.payment?.entity;
    
    if (paymentEntity) {
      await supabase
        .from('online_transactions')
        .update({
          transaction_status: 'captured',
          gateway_response: paymentEntity,
          completed_at: new Date().toISOString(),
        })
        .eq('gateway_order_id', paymentEntity.order_id);
    }
  },
  
  async handlePaymentFailed(payload: any) {
    const paymentEntity = payload.payload?.payment?.entity;
    
    if (paymentEntity) {
      await supabase
        .from('online_transactions')
        .update({
          transaction_status: 'failed',
          error_code: paymentEntity.error_code,
          error_description: paymentEntity.error_description,
          gateway_response: paymentEntity,
        })
        .eq('gateway_order_id', paymentEntity.order_id);
    }
  },
  
  async handleRefundProcessed(payload: any) {
    // Handle refund logic
    console.log('Refund processed:', payload);
  },
  
  async createPaymentLink(linkData: any) {
    const linkReference = `LINK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create Razorpay payment link
    const { data: linkResponse } = await supabase.functions.invoke('create-payment-link', {
      body: {
        amount: linkData.amount,
        description: linkData.description,
        student_id: linkData.student_id,
      },
    });
    
    // Store payment link
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
    
    const { data, error } = await supabase
      .from('payment_links')
      .insert({
        student_id: linkData.student_id,
        link_reference: linkReference,
        amount: linkData.amount,
        description: linkData.description,
        link_url: linkResponse.short_url,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};
```

---

## Supabase Edge Functions

### Edge Function: create-razorpay-order

```typescript
// supabase/functions/create-razorpay-order/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Razorpay from 'npm:razorpay@2.9.2';

serve(async (req) => {
  try {
    const { student_id, amount, description } = await req.json();
    
    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID'),
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET'),
    });
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        student_id: student_id,
        description: description,
      },
    });
    
    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: amount,
        razorpay_key: Deno.env.get('RAZORPAY_KEY_ID'),
        description: description,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Edge Function: verify-razorpay-payment

```typescript
// supabase/functions/verify-razorpay-payment/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

serve(async (req) => {
  try {
    const { order_id, payment_id, signature } = await req.json();
    
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const body = order_id + '|' + payment_id;
    
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    const verified = expectedSignature === signature;
    
    return new Response(
      JSON.stringify({ verified }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Next Steps

1. ✅ Create payment gateway schema
2. ✅ Implement Razorpay integration
3. ✅ Build payment method selector
4. ✅ Create payment result components
5. ✅ Create gateway service and edge functions
6. ✅ Proceed to `37_INVOICES_RECEIPTS_GENERATION.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Payment Gateway Integration Complete  
**Next Phase:** 37_INVOICES_RECEIPTS_GENERATION.md
