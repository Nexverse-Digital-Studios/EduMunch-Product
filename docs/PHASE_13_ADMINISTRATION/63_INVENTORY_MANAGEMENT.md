# 63 - Inventory Management

## Overview

The Inventory Management system provides comprehensive tracking of physical assets, supplies, and resources used across the educational institution. Organizations can create inventory categories, track stock levels, manage item procurement, and generate inventory reports.

**Module Dependencies:**
- Branches Management (for organization and branch context)
- User Management (for audit trails and authorization)
- Feature Flags (inventory management feature)

**Technology Stack:**
- Frontend: React + TypeScript + React Query
- Backend: Supabase PostgreSQL + AutoAPI
- Storage: Supabase Files for item images
- Real-time: Postgres LISTEN/NOTIFY

---

## Database Schema

### 1. inventory_categories
```sql
CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_code VARCHAR(50) UNIQUE NOT NULL,
  parent_category_id UUID REFERENCES inventory_categories(id),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, category_code),
  INDEX idx_org_categories ON organization_id,
  INDEX idx_parent_category ON parent_category_id
);

-- RLS Policy
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their categories"
  ON inventory_categories FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage categories"
  ON inventory_categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### 2. inventory_items
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES inventory_categories(id) ON DELETE RESTRICT,
  item_code VARCHAR(100) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  item_type VARCHAR(50), -- consumable, equipment, furniture, etc.
  unit_of_measurement VARCHAR(50), -- pieces, kg, liters, etc.
  unit_cost DECIMAL(12, 2),
  reorder_level INTEGER,
  reorder_quantity INTEGER,
  supplier_id UUID REFERENCES suppliers(id),
  location VARCHAR(255), -- storage location/warehouse
  image_url TEXT,
  barcode VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, item_code),
  INDEX idx_org_items ON organization_id,
  INDEX idx_category_items ON category_id,
  INDEX idx_barcode ON barcode
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their items"
  ON inventory_items FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authorized staff can manage items"
  ON inventory_items FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'inventory_manager')
    )
  );
```

### 3. inventory_stock
```sql
CREATE TABLE inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  current_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
  last_counted_date TIMESTAMP,
  last_count_by UUID REFERENCES auth.users(id),
  expiry_date DATE,
  batch_number VARCHAR(100),
  storage_location VARCHAR(255),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(item_id, branch_id, batch_number),
  INDEX idx_item_stock ON item_id,
  INDEX idx_branch_stock ON branch_id,
  INDEX idx_low_stock ON available_quantity
);

ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View branch stock"
  ON inventory_stock FOR SELECT
  USING (
    branch_id IN (
      SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
    ) OR
    branch_id IS NULL
  );

CREATE POLICY "Manage stock with permission"
  ON inventory_stock FOR ALL
  USING (
    branch_id IN (
      SELECT branch_id FROM branch_users WHERE user_id = auth.uid()
    )
  );
```

### 4. inventory_ledger
```sql
CREATE TABLE inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  transaction_type VARCHAR(50) NOT NULL, -- IN, OUT, ADJUSTMENT, DAMAGE, EXPIRY
  transaction_date TIMESTAMP DEFAULT now(),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reference_id UUID, -- purchase_order_id, issue_request_id, etc.
  reference_type VARCHAR(50), -- purchase_order, stock_issue, damage_report, etc.
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  
  INDEX idx_item_ledger ON item_id,
  INDEX idx_transaction_type ON transaction_type,
  INDEX idx_transaction_date ON transaction_date,
  INDEX idx_reference ON reference_id
);

ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View ledger entries"
  ON inventory_ledger FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM inventory_items 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );
```

### 5. purchase_orders
```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  po_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  po_status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, APPROVED, SENT, RECEIVED, CANCELLED
  total_amount DECIMAL(14, 2),
  tax_amount DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, po_number),
  INDEX idx_org_po ON organization_id,
  INDEX idx_supplier_po ON supplier_id,
  INDEX idx_po_status ON po_status,
  INDEX idx_po_date ON po_date
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization POs"
  ON purchase_orders FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Manage POs with permission"
  ON purchase_orders FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'procurement')
    )
  );
```

### 6. purchase_order_items
```sql
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(14, 2),
  delivery_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PARTIAL, COMPLETE
  expected_delivery_date DATE,
  
  INDEX idx_po_items ON purchase_order_id,
  INDEX idx_item_po ON item_id
);
```

### 7. suppliers
```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_code VARCHAR(100) UNIQUE NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  gst_number VARCHAR(50),
  payment_terms VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(organization_id, supplier_code),
  INDEX idx_org_suppliers ON organization_id
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization suppliers"
  ON suppliers FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  ));
```

### 8. inventory_valuation
```sql
CREATE TABLE inventory_valuation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  valuation_date DATE DEFAULT CURRENT_DATE,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  branch_id UUID REFERENCES branches(id),
  quantity_on_hand INTEGER,
  unit_cost DECIMAL(12, 2),
  total_value DECIMAL(14, 2),
  valuation_method VARCHAR(50), -- FIFO, LIFO, AVERAGE, WEIGHTED_AVERAGE
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_org_valuation ON organization_id,
  INDEX idx_valuation_date ON valuation_date,
  INDEX idx_item_valuation ON item_id
);
```

---

## React Components

### InventoryDashboard.tsx
```typescript
interface InventoryDashboardProps {
  organizationId: string;
}

interface StockMetrics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
  reorderNeeded: number;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ 
  organizationId 
}) => {
  const { data: metrics, isLoading } = useInventoryMetrics(organizationId);
  const { data: lowStockItems } = useLowStockItems(organizationId);
  const { data: recentTransactions } = useRecentInventoryTransactions(organizationId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          label="Total Items" 
          value={metrics?.totalItems ?? 0}
          icon={<Package />}
        />
        <MetricCard 
          label="Low Stock" 
          value={metrics?.lowStockItems ?? 0}
          icon={<AlertTriangle className="text-yellow-600" />}
        />
        <MetricCard 
          label="Out of Stock" 
          value={metrics?.outOfStockItems ?? 0}
          icon={<AlertCircle className="text-red-600" />}
        />
        <MetricCard 
          label="Total Value" 
          value={`₹${metrics?.totalInventoryValue || 0}`}
          icon={<DollarSign />}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockList items={lowStockItems || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTimeline transactions={recentTransactions || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### InventoryItemForm.tsx
```typescript
interface InventoryItemFormProps {
  organizationId: string;
  itemId?: string;
  onSuccess?: () => void;
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  organizationId,
  itemId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const { data: item, isLoading } = useInventoryItem(itemId);
  const { data: categories } = useInventoryCategories(organizationId);
  const { data: suppliers } = useSuppliers(organizationId);
  const mutation = useCreateOrUpdateInventoryItem();

  useEffect(() => {
    if (item) setFormData(item);
  }, [item]);

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      ...formData,
      organization_id: organizationId,
      id: itemId
    });
    onSuccess?.();
  };

  return (
    <Form>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Item Code"
          value={formData.item_code || ''}
          onChange={(value) => setFormData({ ...formData, item_code: value })}
          disabled={!!itemId}
          required
        />
        <FormField
          label="Item Name"
          value={formData.item_name || ''}
          onChange={(value) => setFormData({ ...formData, item_name: value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Select
          label="Category"
          options={categories?.map(c => ({ label: c.name, value: c.id })) || []}
          value={formData.category_id}
          onChange={(value) => setFormData({ ...formData, category_id: value })}
          required
        />
        <Select
          label="Item Type"
          options={[
            { label: 'Consumable', value: 'consumable' },
            { label: 'Equipment', value: 'equipment' },
            { label: 'Furniture', value: 'furniture' },
            { label: 'Book', value: 'book' }
          ]}
          value={formData.item_type}
          onChange={(value) => setFormData({ ...formData, item_type: value })}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <FormField
          label="Unit Cost (₹)"
          type="number"
          value={formData.unit_cost?.toString() || ''}
          onChange={(value) => setFormData({ ...formData, unit_cost: parseFloat(value) })}
        />
        <FormField
          label="Reorder Level"
          type="number"
          value={formData.reorder_level?.toString() || ''}
          onChange={(value) => setFormData({ ...formData, reorder_level: parseInt(value) })}
        />
        <FormField
          label="Reorder Quantity"
          type="number"
          value={formData.reorder_quantity?.toString() || ''}
          onChange={(value) => setFormData({ ...formData, reorder_quantity: parseInt(value) })}
        />
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="mt-6"
      >
        {itemId ? 'Update Item' : 'Create Item'}
      </Button>
    </Form>
  );
};
```

### InventoryList.tsx
```typescript
interface InventoryListProps {
  organizationId: string;
  branchId?: string;
  categoryId?: string;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  organizationId,
  branchId,
  categoryId
}) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    showLowStock: false,
    categoryId
  });

  const { data: items, isLoading } = useInventoryItems(organizationId, filters);

  const columns = [
    {
      header: 'Item Code',
      accessor: 'item_code',
      render: (row: InventoryItem) => (
        <Link to={`/inventory/items/${row.id}`}>
          {row.item_code}
        </Link>
      )
    },
    {
      header: 'Item Name',
      accessor: 'item_name'
    },
    {
      header: 'Category',
      accessor: 'category_id',
      render: (row: InventoryItem) => row.category?.name
    },
    {
      header: 'Current Stock',
      accessor: 'current_stock'
    },
    {
      header: 'Reorder Level',
      accessor: 'reorder_level',
      render: (row: InventoryItem) => {
        const status = row.current_stock <= row.reorder_level ? 'low' : 'ok';
        return <Badge variant={status === 'low' ? 'destructive' : 'secondary'}>
          {row.reorder_level}
        </Badge>;
      }
    },
    {
      header: 'Unit Cost',
      accessor: 'unit_cost',
      render: (row: InventoryItem) => `₹${row.unit_cost?.toFixed(2)}`
    },
    {
      header: 'Actions',
      render: (row: InventoryItem) => (
        <div className="flex gap-2">
          <Link to={`/inventory/items/${row.id}/edit`}>
            <Button size="sm" variant="outline">Edit</Button>
          </Link>
          <Link to={`/inventory/items/${row.id}/stock`}>
            <Button size="sm" variant="outline">View Stock</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search items..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          className="flex-1"
        />
        <Checkbox
          label="Show Low Stock Only"
          checked={filters.showLowStock}
          onChange={(checked) => setFilters({ ...filters, showLowStock: checked })}
        />
      </div>

      <DataTable
        columns={columns}
        data={items || []}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### StockTransactionForm.tsx
```typescript
interface StockTransactionFormProps {
  itemId: string;
  onSuccess?: () => void;
}

export const StockTransactionForm: React.FC<StockTransactionFormProps> = ({
  itemId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    transaction_type: 'IN' as const,
    quantity: 0,
    remarks: '',
    batch_number: ''
  });

  const mutation = useCreateInventoryTransaction();

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      item_id: itemId,
      ...formData
    });
    onSuccess?.();
  };

  return (
    <Form>
      <Select
        label="Transaction Type"
        options={[
          { label: 'Stock In', value: 'IN' },
          { label: 'Stock Out', value: 'OUT' },
          { label: 'Adjustment', value: 'ADJUSTMENT' },
          { label: 'Damage', value: 'DAMAGE' },
          { label: 'Expiry', value: 'EXPIRY' }
        ]}
        value={formData.transaction_type}
        onChange={(value) => setFormData({ ...formData, transaction_type: value })}
        required
      />

      <FormField
        label="Quantity"
        type="number"
        value={formData.quantity.toString()}
        onChange={(value) => setFormData({ ...formData, quantity: parseInt(value) })}
        required
        className="mt-4"
      />

      <FormField
        label="Batch Number"
        value={formData.batch_number}
        onChange={(value) => setFormData({ ...formData, batch_number: value })}
        className="mt-4"
      />

      <Textarea
        label="Remarks"
        value={formData.remarks}
        onChange={(value) => setFormData({ ...formData, remarks: value })}
        className="mt-4"
        rows={4}
      />

      <Button 
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="mt-6"
      >
        Record Transaction
      </Button>
    </Form>
  );
};
```

---

## Service Layer (inventory.service.ts)

```typescript
import { supabase } from '@/config/supabase';

export class InventoryService {
  // ============ ITEMS ============
  async createInventoryItem(data: CreateInventoryItemRequest) {
    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return item;
  }

  async updateInventoryItem(id: string, data: Partial<InventoryItem>) {
    const { data: item, error } = await supabase
      .from('inventory_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return item;
  }

  async getInventoryItem(id: string) {
    const { data: item, error } = await supabase
      .from('inventory_items')
      .select(`*, category:inventory_categories(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return item;
  }

  async getInventoryItems(orgId: string, filters?: ItemFilters) {
    let query = supabase
      .from('inventory_items')
      .select('*, category:inventory_categories(*)')
      .eq('organization_id', orgId);

    if (filters?.searchTerm) {
      query = query.or(`item_code.ilike.%${filters.searchTerm}%,item_name.ilike.%${filters.searchTerm}%`);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data: items, error } = await query.order('item_name');
    if (error) throw error;
    return items;
  }

  // ============ STOCK ============
  async getCurrentStock(itemId: string, branchId?: string) {
    let query = supabase
      .from('inventory_stock')
      .select('*')
      .eq('item_id', itemId);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: stock, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw error;
    return stock;
  }

  async getLowStockItems(orgId: string) {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        stock:inventory_stock(available_quantity)
      `)
      .eq('organization_id', orgId)
      .lt('current_quantity', 'reorder_level');
    
    if (error) throw error;
    return items;
  }

  async updateStock(itemId: string, quantity: number, branchId?: string) {
    const { data, error } = await supabase
      .from('inventory_stock')
      .update({ current_quantity: quantity, updated_at: new Date().toISOString() })
      .eq('item_id', itemId)
      .eq('branch_id', branchId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ============ TRANSACTIONS ============
  async recordTransaction(data: InventoryTransaction) {
    const { data: transaction, error } = await supabase
      .from('inventory_ledger')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;

    // Update stock quantity
    const stock = await this.getCurrentStock(data.item_id, data.branch_id);
    const newQuantity = (stock?.current_quantity || 0) + data.quantity_change;
    
    await this.updateStock(data.item_id, newQuantity, data.branch_id);
    
    return transaction;
  }

  async getInventoryLedger(itemId: string, filters?: LedgerFilters) {
    let query = supabase
      .from('inventory_ledger')
      .select('*')
      .eq('item_id', itemId);

    if (filters?.fromDate) {
      query = query.gte('transaction_date', filters.fromDate);
    }
    if (filters?.toDate) {
      query = query.lte('transaction_date', filters.toDate);
    }
    if (filters?.transactionType) {
      query = query.eq('transaction_type', filters.transactionType);
    }

    const { data: ledger, error } = await query.order('transaction_date', { ascending: false });
    if (error) throw error;
    return ledger;
  }

  // ============ PURCHASE ORDERS ============
  async createPurchaseOrder(data: CreatePurchaseOrderRequest) {
    const { data: po, error } = await supabase
      .from('purchase_orders')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return po;
  }

  async getPurchaseOrder(id: string) {
    const { data: po, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return po;
  }

  async receivePurchaseOrderItems(poId: string, itemUpdates: POItemReceive[]) {
    const updates = itemUpdates.map(item => ({
      id: item.po_item_id,
      quantity_received: item.quantity_received
    }));

    const { data, error } = await supabase
      .from('purchase_order_items')
      .upsert(updates);
    
    if (error) throw error;

    // Record stock in transaction for each item
    for (const item of itemUpdates) {
      await this.recordTransaction({
        item_id: item.item_id,
        transaction_type: 'IN',
        quantity_change: item.quantity_received,
        reference_id: poId,
        reference_type: 'purchase_order',
        remarks: `Received from PO: ${poId}`
      });
    }

    return data;
  }

  // ============ REPORTING ============
  async getInventoryValuation(orgId: string, valuationDate: Date) {
    const { data: valuation, error } = await supabase
      .from('inventory_valuation')
      .select('*, item:inventory_items(*)')
      .eq('organization_id', orgId)
      .eq('valuation_date', valuationDate.toISOString().split('T')[0]);
    
    if (error) throw error;
    return valuation;
  }

  async generateInventoryReport(orgId: string, filters: ReportFilters) {
    const items = await this.getInventoryItems(orgId);
    
    const report = items.map(item => ({
      itemCode: item.item_code,
      itemName: item.item_name,
      category: item.category?.name,
      currentStock: item.current_stock,
      reorderLevel: item.reorder_level,
      unitCost: item.unit_cost,
      totalValue: (item.current_stock || 0) * (item.unit_cost || 0),
      status: item.current_stock <= item.reorder_level ? 'Low Stock' : 'OK'
    }));

    return report;
  }

  async getInventoryMetrics(orgId: string) {
    const items = await this.getInventoryItems(orgId);
    
    return {
      totalItems: items.length,
      lowStockItems: items.filter(i => i.current_stock <= i.reorder_level).length,
      outOfStockItems: items.filter(i => i.current_stock === 0).length,
      totalInventoryValue: items.reduce((sum, i) => sum + ((i.current_stock || 0) * (i.unit_cost || 0)), 0)
    };
  }
}

export const inventoryService = new InventoryService();
```

---

## React Query Hooks

```typescript
export const useInventoryItems = (orgId: string, filters?: ItemFilters) => {
  return useQuery({
    queryKey: ['inventory_items', orgId, filters],
    queryFn: () => inventoryService.getInventoryItems(orgId, filters)
  });
};

export const useInventoryItem = (itemId?: string) => {
  return useQuery({
    queryKey: ['inventory_item', itemId],
    queryFn: () => inventoryService.getInventoryItem(itemId!),
    enabled: !!itemId
  });
};

export const useCurrentStock = (itemId: string, branchId?: string) => {
  return useQuery({
    queryKey: ['inventory_stock', itemId, branchId],
    queryFn: () => inventoryService.getCurrentStock(itemId, branchId)
  });
};

export const useLowStockItems = (orgId: string) => {
  return useQuery({
    queryKey: ['low_stock_items', orgId],
    queryFn: () => inventoryService.getLowStockItems(orgId)
  });
};

export const useInventoryLedger = (itemId: string, filters?: LedgerFilters) => {
  return useQuery({
    queryKey: ['inventory_ledger', itemId, filters],
    queryFn: () => inventoryService.getInventoryLedger(itemId, filters)
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => inventoryService.createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
    }
  });
};

export const useCreateInventoryTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryTransaction) => inventoryService.recordTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_ledger'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_stock'] });
    }
  });
};

export const useInventoryMetrics = (orgId: string) => {
  return useQuery({
    queryKey: ['inventory_metrics', orgId],
    queryFn: () => inventoryService.getInventoryMetrics(orgId),
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });
};
```

---

## REST API Endpoints (Supabase AutoAPI)

```
GET    /rest/v1/inventory_items?organization_id=eq.{orgId}
GET    /rest/v1/inventory_items?item_code=eq.{code}
POST   /rest/v1/inventory_items
PATCH  /rest/v1/inventory_items?id=eq.{id}
DELETE /rest/v1/inventory_items?id=eq.{id}

GET    /rest/v1/inventory_stock?item_id=eq.{itemId}
PATCH  /rest/v1/inventory_stock?item_id=eq.{itemId}

GET    /rest/v1/inventory_ledger?item_id=eq.{itemId}&order=transaction_date.desc
POST   /rest/v1/inventory_ledger

GET    /rest/v1/purchase_orders?organization_id=eq.{orgId}
POST   /rest/v1/purchase_orders
PATCH  /rest/v1/purchase_orders?id=eq.{id}

GET    /rest/v1/suppliers?organization_id=eq.{orgId}
POST   /rest/v1/suppliers
```

---

## Implementation Workflow

### Phase 1: Database Setup (Week 1)
- Create inventory schema tables with RLS policies
- Set up indexes for performance
- Create supplier management tables
- Test data insertion and queries

### Phase 2: Core Components (Week 2)
- Build InventoryDashboard with metrics
- Create InventoryItemForm for CRUD operations
- Build InventoryList with filtering and search
- Implement StockTransactionForm

### Phase 3: Inventory Tracking (Week 3)
- Complete inventory_ledger functionality
- Build transaction recording system
- Create stock level monitoring
- Implement low stock alerts

### Phase 4: Purchase Orders (Week 4)
- Build PO creation and management
- Implement PO item receiving
- Create supplier management interface
- Build PO tracking and status updates

### Phase 5: Reporting & Analytics (Week 5)
- Create inventory valuation reports
- Build stock movement reports
- Implement inventory metrics dashboard
- Add export functionality

---

## Testing Strategy

### Unit Tests
- Service functions with mock Supabase responses
- Component rendering with sample data
- Calculation functions (stock, valuation)

### Integration Tests
- Complete item creation workflow
- Stock transaction recording and verification
- PO creation to goods receipt flow

### E2E Tests
- User creates inventory category and items
- Records stock transactions
- Generates inventory report
- Creates and receives purchase orders

---

## Security Considerations

- All tables have RLS policies enforced
- Inventory operations require specific roles (inventory_manager, admin)
- Audit trails on all stock transactions
- Batch numbers and expiry tracking for compliance
- Transaction immutability (ledger append-only)

---

## Performance Recommendations

- Index on organization_id, category_id, item_code for fast lookups
- Index on transaction_type and transaction_date for ledger queries
- Cache inventory metrics for dashboard display
- Use pagination for large item lists (limit 50 per page)
- Implement search with debounce (300ms)

---

## Future Enhancements

1. **Barcode/QR Scanning**: Mobile app integration for inventory counting
2. **Multi-level Approval**: Approval workflows for POs and stock transfers
3. **Inventory Forecasting**: Predictive analytics for stock needs
4. **Inventory Audits**: Physical counting workflows with reconciliation
5. **Vendor Integration**: EDI/API integration with suppliers
6. **Mobile App**: Offline-first inventory management
7. **Advanced Reporting**: Pivot tables, trend analysis
8. **Depreciation Tracking**: Asset depreciation for equipment

