# 64 - Inventory Transfers

## Overview

The Inventory Transfers system manages movement of inventory items between branches, departments, and storage locations within the organization. This module handles transfer requests, approval workflows, transfer tracking, and maintains accurate inventory ledgers across locations.

**Module Dependencies:**
- Inventory Management (inventory items and stock)
- Branches Management (for branch context)
- User Management (for approvals and audit trails)

**Technology Stack:**
- Frontend: React + TypeScript + React Query
- Backend: Supabase PostgreSQL + AutoAPI
- Workflow: Status-based state machine
- Real-time: Postgres LISTEN/NOTIFY

---

## Database Schema

### 1. inventory_transfers
```sql
CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  from_branch_id UUID NOT NULL REFERENCES branches(id),
  to_branch_id UUID NOT NULL REFERENCES branches(id),
  transfer_status VARCHAR(50) DEFAULT 'DRAFT', 
  -- DRAFT, PENDING_APPROVAL, APPROVED, IN_TRANSIT, RECEIVED, CANCELLED, REJECTED
  transfer_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  reason VARCHAR(255), -- replenishment, reallocation, stock_adjustment, etc.
  priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  notes TEXT,
  approval_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  completed_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, transfer_number),
  INDEX idx_org_transfers ON organization_id,
  INDEX idx_from_branch ON from_branch_id,
  INDEX idx_to_branch ON to_branch_id,
  INDEX idx_transfer_status ON transfer_status,
  INDEX idx_transfer_date ON transfer_date,
  CHECK (from_branch_id != to_branch_id)
);

-- RLS Policy
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization transfers"
  ON inventory_transfers FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Create and manage transfers"
  ON inventory_transfers FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'inventory_manager')
    )
  );
```

### 2. transfer_items
```sql
CREATE TABLE transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  requested_quantity INTEGER NOT NULL,
  approved_quantity INTEGER,
  transferred_quantity INTEGER DEFAULT 0,
  received_quantity INTEGER DEFAULT 0,
  item_condition VARCHAR(50) DEFAULT 'GOOD', -- GOOD, DAMAGED, PARTIAL
  unit_cost DECIMAL(12, 2),
  batch_number VARCHAR(100),
  expiry_date DATE,
  remarks TEXT,
  
  INDEX idx_transfer_items ON transfer_id,
  INDEX idx_item_transfer ON item_id
);

ALTER TABLE transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View transfer items"
  ON transfer_items FOR SELECT
  USING (
    transfer_id IN (
      SELECT id FROM inventory_transfers 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 3. transfer_approvals
```sql
CREATE TABLE transfer_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  approval_level INTEGER, -- 1, 2, 3 for multi-level approval
  approver_user_id UUID NOT NULL REFERENCES auth.users(id),
  approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  approval_date TIMESTAMP,
  rejection_reason TEXT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(transfer_id, approval_level),
  INDEX idx_approvals ON transfer_id,
  INDEX idx_approver ON approver_user_id,
  INDEX idx_approval_status ON approval_status
);

ALTER TABLE transfer_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approvals"
  ON transfer_approvals FOR SELECT
  USING (
    transfer_id IN (
      SELECT id FROM inventory_transfers 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 4. transfer_status_history
```sql
CREATE TABLE transfer_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  status_change_date TIMESTAMP DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  status_reason TEXT,
  
  INDEX idx_transfer_history ON transfer_id,
  INDEX idx_status_date ON status_change_date
);

ALTER TABLE transfer_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View transfer history"
  ON transfer_status_history FOR SELECT
  USING (
    transfer_id IN (
      SELECT id FROM inventory_transfers 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 5. transfer_tracking
```sql
CREATE TABLE transfer_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  tracking_event VARCHAR(50) NOT NULL, 
  -- CREATED, SUBMITTED, APPROVED, DISPATCHED, IN_TRANSIT, RECEIVED, COMPLETED
  event_timestamp TIMESTAMP DEFAULT now(),
  location VARCHAR(255),
  notes TEXT,
  tracked_by UUID REFERENCES auth.users(id),
  
  INDEX idx_tracking_transfer ON transfer_id,
  INDEX idx_tracking_event ON tracking_event,
  INDEX idx_tracking_date ON event_timestamp
);

ALTER TABLE transfer_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View tracking"
  ON transfer_tracking FOR SELECT
  USING (
    transfer_id IN (
      SELECT id FROM inventory_transfers 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 6. transfer_receipts
```sql
CREATE TABLE transfer_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE RESTRICT,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  received_date TIMESTAMP DEFAULT now(),
  received_by UUID NOT NULL REFERENCES auth.users(id),
  received_condition VARCHAR(50) DEFAULT 'GOOD', -- GOOD, PARTIAL_DAMAGE, COMPLETE_LOSS
  variance_items INTEGER DEFAULT 0, -- items with qty mismatch
  damaged_items_count INTEGER DEFAULT 0,
  comments TEXT,
  receipt_photo_url TEXT,
  
  UNIQUE(transfer_id),
  INDEX idx_transfer_receipt ON transfer_id,
  INDEX idx_received_date ON received_date
);

ALTER TABLE transfer_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View receipts"
  ON transfer_receipts FOR SELECT
  USING (
    transfer_id IN (
      SELECT id FROM inventory_transfers 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 7. receipt_item_details
```sql
CREATE TABLE receipt_item_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES transfer_receipts(id) ON DELETE CASCADE,
  transfer_item_id UUID NOT NULL REFERENCES transfer_items(id),
  quantity_received INTEGER NOT NULL,
  quantity_damaged INTEGER DEFAULT 0,
  received_condition VARCHAR(50), -- GOOD, DAMAGED, PARTIAL
  variance_reason TEXT, -- shortage, overage, quality_issue
  inspected_by UUID REFERENCES auth.users(id),
  inspection_notes TEXT,
  
  INDEX idx_receipt_items ON receipt_id
);

ALTER TABLE receipt_item_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View receipt details"
  ON receipt_item_details FOR SELECT
  USING (
    receipt_id IN (
      SELECT id FROM transfer_receipts 
      WHERE transfer_id IN (
        SELECT id FROM inventory_transfers 
        WHERE organization_id IN (
          SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
        )
      )
    )
  );
```

---

## React Components

### TransferDashboard.tsx
```typescript
interface TransferDashboardProps {
  organizationId: string;
  userBranchId?: string;
}

interface TransferMetrics {
  totalTransfers: number;
  pendingApprovals: number;
  inTransit: number;
  completedToday: number;
  averageTransferTime: number;
}

export const TransferDashboard: React.FC<TransferDashboardProps> = ({
  organizationId,
  userBranchId
}) => {
  const { data: metrics, isLoading } = useTransferMetrics(organizationId);
  const { data: pendingTransfers } = usePendingTransfers(organizationId);
  const { data: inTransitTransfers } = useInTransitTransfers(organizationId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          label="Total Transfers"
          value={metrics?.totalTransfers ?? 0}
          icon={<Package />}
        />
        <MetricCard
          label="Pending Approval"
          value={metrics?.pendingApprovals ?? 0}
          icon={<Clock className="text-yellow-600" />}
        />
        <MetricCard
          label="In Transit"
          value={metrics?.inTransit ?? 0}
          icon={<Truck className="text-blue-600" />}
        />
        <MetricCard
          label="Completed Today"
          value={metrics?.completedToday ?? 0}
          icon={<CheckCircle className="text-green-600" />}
        />
        <MetricCard
          label="Avg. Transfer Time"
          value={`${metrics?.averageTransferTime ?? 0} days`}
          icon={<Calendar />}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingTransfersList transfers={pendingTransfers || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <InTransitList transfers={inTransitTransfers || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### CreateTransferForm.tsx
```typescript
interface CreateTransferFormProps {
  organizationId: string;
  userBranchId: string;
  onSuccess?: () => void;
}

export const CreateTransferForm: React.FC<CreateTransferFormProps> = ({
  organizationId,
  userBranchId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    to_branch_id: '',
    reason: '',
    priority: 'NORMAL',
    notes: '',
    items: [] as TransferItemInput[]
  });

  const { data: branches } = useBranches(organizationId);
  const { data: inventoryItems } = useInventoryItems(organizationId);
  const mutation = useCreateTransfer();

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', quantity: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      organization_id: organizationId,
      from_branch_id: userBranchId,
      ...formData,
      approval_required: true
    });
    onSuccess?.();
  };

  return (
    <Form>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="To Branch"
          options={branches
            ?.filter(b => b.id !== userBranchId)
            .map(b => ({ label: b.name, value: b.id })) || []
          }
          value={formData.to_branch_id}
          onChange={(value) => setFormData({ ...formData, to_branch_id: value })}
          required
        />
        <Select
          label="Reason"
          options={[
            { label: 'Replenishment', value: 'replenishment' },
            { label: 'Reallocation', value: 'reallocation' },
            { label: 'Stock Adjustment', value: 'stock_adjustment' },
            { label: 'Redistribution', value: 'redistribution' }
          ]}
          value={formData.reason}
          onChange={(value) => setFormData({ ...formData, reason: value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Select
          label="Priority"
          options={[
            { label: 'Low', value: 'LOW' },
            { label: 'Normal', value: 'NORMAL' },
            { label: 'High', value: 'HIGH' },
            { label: 'Urgent', value: 'URGENT' }
          ]}
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value })}
        />
      </div>

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(value) => setFormData({ ...formData, notes: value })}
        className="mt-4"
        rows={3}
      />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Items to Transfer</h3>
          <Button 
            onClick={handleAddItem}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <TransferItemRow
              key={index}
              item={item}
              items={inventoryItems || []}
              onUpdate={(updated) => {
                const newItems = [...formData.items];
                newItems[index] = updated;
                setFormData({ ...formData, items: newItems });
              }}
              onRemove={() => handleRemoveItem(index)}
            />
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={mutation.isPending || formData.items.length === 0}
        className="mt-6"
      >
        Create Transfer Request
      </Button>
    </Form>
  );
};
```

### TransferApprovalForm.tsx
```typescript
interface TransferApprovalFormProps {
  transferId: string;
  onSuccess?: () => void;
}

export const TransferApprovalForm: React.FC<TransferApprovalFormProps> = ({
  transferId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    approval_status: 'PENDING' as const,
    comments: '',
    rejection_reason: ''
  });

  const { data: transfer } = useTransfer(transferId);
  const { data: approval } = useUserApprovalForTransfer(transferId);
  const mutation = useApproveTransfer();

  const handleApprove = async () => {
    await mutation.mutateAsync({
      transfer_id: transferId,
      approval_status: 'APPROVED',
      comments: formData.comments
    });
    onSuccess?.();
  };

  const handleReject = async () => {
    if (!formData.rejection_reason) {
      alert('Please provide rejection reason');
      return;
    }
    await mutation.mutateAsync({
      transfer_id: transferId,
      approval_status: 'REJECTED',
      rejection_reason: formData.rejection_reason
    });
    onSuccess?.();
  };

  if (!approval) {
    return <div>You don't have approval rights for this transfer.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approve Transfer Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Transfer Details</label>
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <p><strong>From:</strong> {transfer?.from_branch?.name}</p>
            <p><strong>To:</strong> {transfer?.to_branch?.name}</p>
            <p><strong>Items:</strong> {transfer?.transfer_items?.length}</p>
            <p><strong>Reason:</strong> {transfer?.reason}</p>
          </div>
        </div>

        <Textarea
          label="Comments"
          value={formData.comments}
          onChange={(value) => setFormData({ ...formData, comments: value })}
          rows={3}
          placeholder="Add any comments (optional)"
        />

        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={mutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="destructive">Reject</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-semibold">Reject Transfer</h4>
                <Textarea
                  label="Rejection Reason"
                  value={formData.rejection_reason}
                  onChange={(value) => setFormData({ ...formData, rejection_reason: value })}
                  rows={3}
                  placeholder="Explain why you're rejecting..."
                  required
                />
                <Button
                  onClick={handleReject}
                  disabled={!formData.rejection_reason || mutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  Confirm Rejection
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};
```

### ReceiveTransferForm.tsx
```typescript
interface ReceiveTransferFormProps {
  transferId: string;
  onSuccess?: () => void;
}

export const ReceiveTransferForm: React.FC<ReceiveTransferFormProps> = ({
  transferId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    received_condition: 'GOOD',
    comments: '',
    itemDetails: [] as ReceiveItemDetail[]
  });

  const { data: transfer } = useTransfer(transferId);
  const mutation = useReceiveTransfer();

  useEffect(() => {
    if (transfer?.transfer_items) {
      setFormData(prev => ({
        ...prev,
        itemDetails: transfer.transfer_items.map(item => ({
          transfer_item_id: item.id,
          quantity_received: item.approved_quantity || 0,
          quantity_damaged: 0,
          received_condition: 'GOOD'
        }))
      }));
    }
  }, [transfer]);

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      transfer_id: transferId,
      received_condition: formData.received_condition,
      comments: formData.comments,
      item_details: formData.itemDetails
    });
    onSuccess?.();
  };

  return (
    <Form>
      <Select
        label="Overall Condition"
        options={[
          { label: 'Good - All items OK', value: 'GOOD' },
          { label: 'Partial Damage - Some items damaged', value: 'PARTIAL_DAMAGE' },
          { label: 'Complete Loss - Items unusable', value: 'COMPLETE_LOSS' }
        ]}
        value={formData.received_condition}
        onChange={(value) => setFormData({ ...formData, received_condition: value })}
        required
      />

      <Textarea
        label="Comments"
        value={formData.comments}
        onChange={(value) => setFormData({ ...formData, comments: value })}
        className="mt-4"
        rows={3}
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Received Items</h3>
        <div className="space-y-3">
          {formData.itemDetails.map((detail, index) => (
            <ReceiveItemRow
              key={index}
              detail={detail}
              item={transfer?.transfer_items[index]}
              onUpdate={(updated) => {
                const newDetails = [...formData.itemDetails];
                newDetails[index] = updated;
                setFormData({ ...formData, itemDetails: newDetails });
              }}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="mt-6"
      >
        Confirm Receipt
      </Button>
    </Form>
  );
};
```

### TransferList.tsx
```typescript
interface TransferListProps {
  organizationId: string;
  filterStatus?: string;
  userBranchId?: string;
}

export const TransferList: React.FC<TransferListProps> = ({
  organizationId,
  filterStatus,
  userBranchId
}) => {
  const { data: transfers, isLoading } = useTransfers(organizationId, {
    status: filterStatus,
    branchId: userBranchId
  });

  const columns = [
    {
      header: 'Transfer #',
      accessor: 'transfer_number',
      render: (row: InventoryTransfer) => (
        <Link to={`/inventory/transfers/${row.id}`}>
          {row.transfer_number}
        </Link>
      )
    },
    {
      header: 'From',
      accessor: 'from_branch',
      render: (row: InventoryTransfer) => row.from_branch?.name
    },
    {
      header: 'To',
      accessor: 'to_branch',
      render: (row: InventoryTransfer) => row.to_branch?.name
    },
    {
      header: 'Items',
      accessor: 'item_count',
      render: (row: InventoryTransfer) => row.transfer_items?.length ?? 0
    },
    {
      header: 'Status',
      accessor: 'transfer_status',
      render: (row: InventoryTransfer) => (
        <Badge variant={getStatusVariant(row.transfer_status)}>
          {row.transfer_status}
        </Badge>
      )
    },
    {
      header: 'Date',
      accessor: 'transfer_date',
      render: (row: InventoryTransfer) => formatDate(row.transfer_date)
    },
    {
      header: 'Actions',
      render: (row: InventoryTransfer) => (
        <div className="flex gap-2">
          <Link to={`/inventory/transfers/${row.id}`}>
            <Button size="sm" variant="outline">View</Button>
          </Link>
          {row.transfer_status === 'PENDING_APPROVAL' && (
            <Link to={`/inventory/transfers/${row.id}/approve`}>
              <Button size="sm" className="bg-blue-600">Approve</Button>
            </Link>
          )}
          {row.transfer_status === 'IN_TRANSIT' && (
            <Link to={`/inventory/transfers/${row.id}/receive`}>
              <Button size="sm" className="bg-green-600">Receive</Button>
            </Link>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={transfers || []}
      isLoading={isLoading}
    />
  );
};
```

---

## Service Layer (transferService.ts)

```typescript
import { supabase } from '@/config/supabase';

export class TransferService {
  async createTransfer(data: CreateTransferRequest) {
    const { data: transfer, error } = await supabase
      .from('inventory_transfers')
      .insert({
        ...data,
        transfer_status: 'DRAFT'
      })
      .select(`
        *,
        from_branch:branches(id, name),
        to_branch:branches(id, name)
      `)
      .single();

    if (error) throw error;

    // Create transfer items
    if (data.items?.length) {
      await supabase.from('transfer_items').insert(
        data.items.map(item => ({
          transfer_id: transfer.id,
          ...item
        }))
      );
    }

    // Create initial tracking record
    await this.addTrackingEvent(transfer.id, 'CREATED');

    return transfer;
  }

  async getTransfer(id: string) {
    const { data: transfer, error } = await supabase
      .from('inventory_transfers')
      .select(`
        *,
        from_branch:branches(*),
        to_branch:branches(*),
        transfer_items:transfer_items(
          *,
          item:inventory_items(*)
        ),
        transfer_approvals:transfer_approvals(*),
        transfer_tracking:transfer_tracking(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return transfer;
  }

  async getTransfers(orgId: string, filters?: TransferFilters) {
    let query = supabase
      .from('inventory_transfers')
      .select(`
        *,
        from_branch:branches(id, name),
        to_branch:branches(id, name),
        transfer_items(id)
      `)
      .eq('organization_id', orgId);

    if (filters?.status) {
      query = query.eq('transfer_status', filters.status);
    }
    if (filters?.branchId) {
      query = query.or(`from_branch_id.eq.${filters.branchId},to_branch_id.eq.${filters.branchId}`);
    }
    if (filters?.fromDate) {
      query = query.gte('transfer_date', filters.fromDate);
    }

    const { data: transfers, error } = await query.order('transfer_date', { ascending: false });
    if (error) throw error;
    return transfers;
  }

  async approveTransfer(transferId: string, data: ApprovalData) {
    const { data: updated, error } = await supabase
      .from('inventory_transfers')
      .update({
        transfer_status: 'APPROVED',
        approved_by: data.approved_by,
        updated_at: new Date().toISOString()
      })
      .eq('id', transferId)
      .select()
      .single();

    if (error) throw error;

    // Record approval
    await supabase.from('transfer_approvals').insert({
      transfer_id: transferId,
      approver_user_id: data.approved_by,
      approval_status: 'APPROVED',
      approval_date: new Date().toISOString(),
      comments: data.comments
    });

    // Add tracking
    await this.addTrackingEvent(transferId, 'APPROVED');

    return updated;
  }

  async rejectTransfer(transferId: string, data: RejectionData) {
    const { data: updated, error } = await supabase
      .from('inventory_transfers')
      .update({
        transfer_status: 'REJECTED',
        updated_at: new Date().toISOString()
      })
      .eq('id', transferId)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('transfer_approvals').insert({
      transfer_id: transferId,
      approver_user_id: data.rejected_by,
      approval_status: 'REJECTED',
      approval_date: new Date().toISOString(),
      rejection_reason: data.rejection_reason
    });

    await this.addTrackingEvent(transferId, 'REJECTED');

    return updated;
  }

  async dispatchTransfer(transferId: string) {
    const { data: updated, error } = await supabase
      .from('inventory_transfers')
      .update({
        transfer_status: 'IN_TRANSIT',
        updated_at: new Date().toISOString()
      })
      .eq('id', transferId)
      .select()
      .single();

    if (error) throw error;
    await this.addTrackingEvent(transferId, 'DISPATCHED');
    return updated;
  }

  async receiveTransfer(transferId: string, data: ReceiveTransferRequest) {
    const { data: receipt, error: receiptError } = await supabase
      .from('transfer_receipts')
      .insert({
        transfer_id: transferId,
        received_by: data.received_by,
        received_condition: data.received_condition,
        comments: data.comments
      })
      .select()
      .single();

    if (receiptError) throw receiptError;

    // Record item receipts
    await supabase.from('receipt_item_details').insert(
      data.item_details.map(detail => ({
        receipt_id: receipt.id,
        ...detail
      }))
    );

    // Update transfer status
    const { data: updated, error } = await supabase
      .from('inventory_transfers')
      .update({
        transfer_status: 'RECEIVED',
        actual_delivery_date: new Date().toISOString(),
        completed_by: data.received_by,
        updated_at: new Date().toISOString()
      })
      .eq('id', transferId)
      .select()
      .single();

    if (error) throw error;

    // Update stock in destination branch
    for (const detail of data.item_details) {
      const transferItem = data.transfer_items.find(ti => ti.id === detail.transfer_item_id);
      if (transferItem) {
        await supabase.from('inventory_stock').upsert({
          item_id: transferItem.item_id,
          branch_id: data.to_branch_id,
          current_quantity: `current_quantity + ${detail.quantity_received}`
        });

        // Record inventory transaction
        await supabase.from('inventory_ledger').insert({
          item_id: transferItem.item_id,
          transaction_type: 'IN',
          quantity_change: detail.quantity_received,
          branch_id: data.to_branch_id,
          reference_id: transferId,
          reference_type: 'transfer_receipt'
        });
      }
    }

    await this.addTrackingEvent(transferId, 'RECEIVED');
    return updated;
  }

  async addTrackingEvent(transferId: string, trackingEvent: string) {
    const { data, error } = await supabase
      .from('transfer_tracking')
      .insert({
        transfer_id: transferId,
        tracking_event: trackingEvent,
        event_timestamp: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  async getTransferMetrics(orgId: string) {
    const transfers = await this.getTransfers(orgId);

    return {
      totalTransfers: transfers.length,
      pendingApprovals: transfers.filter(t => t.transfer_status === 'PENDING_APPROVAL').length,
      inTransit: transfers.filter(t => t.transfer_status === 'IN_TRANSIT').length,
      completedToday: transfers.filter(t => 
        t.transfer_status === 'RECEIVED' && 
        isToday(new Date(t.actual_delivery_date))
      ).length
    };
  }
}

export const transferService = new TransferService();
```

---

## React Query Hooks

```typescript
export const useTransfer = (transferId: string) => {
  return useQuery({
    queryKey: ['transfer', transferId],
    queryFn: () => transferService.getTransfer(transferId),
    enabled: !!transferId
  });
};

export const useTransfers = (orgId: string, filters?: TransferFilters) => {
  return useQuery({
    queryKey: ['transfers', orgId, filters],
    queryFn: () => transferService.getTransfers(orgId, filters)
  });
};

export const usePendingTransfers = (orgId: string) => {
  return useQuery({
    queryKey: ['pending_transfers', orgId],
    queryFn: () => transferService.getTransfers(orgId, { status: 'PENDING_APPROVAL' })
  });
};

export const useInTransitTransfers = (orgId: string) => {
  return useQuery({
    queryKey: ['in_transit_transfers', orgId],
    queryFn: () => transferService.getTransfers(orgId, { status: 'IN_TRANSIT' })
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferRequest) => transferService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    }
  });
};

export const useApproveTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApprovalData & { transfer_id: string }) => 
      transferService.approveTransfer(data.transfer_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    }
  });
};

export const useReceiveTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReceiveTransferRequest & { transfer_id: string }) =>
      transferService.receiveTransfer(data.transfer_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_stock'] });
    }
  });
};

export const useTransferMetrics = (orgId: string) => {
  return useQuery({
    queryKey: ['transfer_metrics', orgId],
    queryFn: () => transferService.getTransferMetrics(orgId),
    refetchInterval: 5 * 60 * 1000
  });
};
```

---

## REST API Endpoints

```
GET    /rest/v1/inventory_transfers?organization_id=eq.{orgId}
GET    /rest/v1/inventory_transfers?transfer_status=eq.PENDING_APPROVAL
POST   /rest/v1/inventory_transfers
PATCH  /rest/v1/inventory_transfers?id=eq.{id}

GET    /rest/v1/transfer_items?transfer_id=eq.{transferId}
POST   /rest/v1/transfer_items

GET    /rest/v1/transfer_approvals?transfer_id=eq.{transferId}
POST   /rest/v1/transfer_approvals

GET    /rest/v1/transfer_tracking?transfer_id=eq.{transferId}&order=event_timestamp.desc
POST   /rest/v1/transfer_tracking

GET    /rest/v1/transfer_receipts?transfer_id=eq.{transferId}
POST   /rest/v1/transfer_receipts
```

---

## Implementation Workflow

### Phase 1: Database & RLS Setup (Week 1)
- Create transfer tables with proper constraints
- Set up RLS policies
- Create tracking and history tables
- Test data integrity constraints

### Phase 2: Core Transfer Management (Week 2)
- Build CreateTransferForm
- Implement TransferList with filtering
- Create TransferDashboard
- Build transfer status workflow

### Phase 3: Approval Workflow (Week 3)
- Build TransferApprovalForm
- Implement multi-level approval logic
- Create approval notification system
- Track approval history

### Phase 4: Transfer Receipt (Week 4)
- Build ReceiveTransferForm
- Implement item-level receipt tracking
- Create variance reporting
- Update destination branch inventory

### Phase 5: Analytics & Reporting (Week 5)
- Create transfer metrics dashboard
- Build transfer performance reports
- Implement transfer time analysis
- Add variance analysis reports

---

## Testing Strategy

### Unit Tests
- Transfer creation with validation
- Approval workflow logic
- Stock update calculations
- Status transition validations

### Integration Tests
- Full transfer lifecycle (create → approve → dispatch → receive)
- Multi-level approval flows
- Stock updates on receipt
- Variance handling

### E2E Tests
- User creates transfer request
- Manager approves transfer
- Items dispatched and marked in-transit
- Receiving user confirms receipt with variance
- Stock properly updated in both branches

---

## Security

- RLS policies enforce organization and branch boundaries
- Approval workflows prevent unauthorized transfers
- Audit trail on all status changes
- Variance tracking for accountability
- Receipt documentation for compliance

---

## Performance Recommendations

- Index on organization_id, transfer_status for dashboard queries
- Cache transfer metrics (refresh every 5 minutes)
- Pagination for transfer lists (50 per page)
- Batch update operations for stock when receiving multiple items
- Archive old completed transfers after 90 days

---

## Future Enhancements

1. **Barcode Scanning**: QR code scanning during receipt
2. **Photo Documentation**: Attach photos to transfers
3. **Cost Tracking**: Transfer cost allocation
4. **Automated Approvals**: Rule-based auto-approval
5. **Partial Receipts**: Support multiple receipt dates
6. **Transfer Insurance**: Track value and insurance
7. **Route Optimization**: Suggest efficient transfer routes
8. **Notifications**: Real-time updates to stakeholders

