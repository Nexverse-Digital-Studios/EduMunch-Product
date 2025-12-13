import { supabase } from '@/lib/supabase';

export interface InventoryItem {
  id: string;
  org_id: string;
  item_name: string;
  item_code: string;
  description?: string;
  item_type: 'ASSET' | 'CONSUMABLE' | 'CASH';
  unit?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchInventory {
  id: string;
  org_id: string;
  branch_id: string;
  item_id: string;
  current_quantity: number;
  min_quantity?: number;
  max_quantity?: number;
  last_updated?: string;
  item?: InventoryItem;
  branch?: any;
}

export interface InventoryTransfer {
  id: string;
  org_id: string;
  from_branch_id: string;
  to_branch_id: string;
  item_id: string;
  quantity: number;
  transfer_date: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  initiated_by?: string;
  received_by?: string;
  received_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  item?: InventoryItem;
  from_branch?: any;
  to_branch?: any;
}

export interface InventoryLedger {
  id: string;
  org_id: string;
  branch_id: string;
  item_id: string;
  transaction_type: 'ADD' | 'REMOVE' | 'ADJUST' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  quantity_change: number;
  reason?: string;
  reference_id?: string;
  recorded_by?: string;
  transaction_date: string;
  created_at?: string;
}

export interface PettyCashLedger {
  id: string;
  org_id: string;
  branch_id: string;
  description: string;
  transaction_type: 'INCOME' | 'EXPENSE';
  amount: number;
  reference_type?: string;
  reference_id?: string;
  recorded_by?: string;
  transaction_date: string;
  created_at?: string;
}

class InventoryService {
  // Items
  async getItems(orgId: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true);
    if (error) throw error;
    return data as InventoryItem[];
  }

  async createItem(orgId: string, item: Partial<InventoryItem>) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([
        {
          org_id: orgId,
          item_name: item.item_name,
          item_code: item.item_code,
          description: item.description,
          item_type: item.item_type,
          unit: item.unit,
          is_active: true,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  }

  // Branch Inventory
  async getBranchInventory(branchId: string) {
    const { data, error } = await supabase
      .from('branch_inventory')
      .select(`
        *,
        item:item_id(*)
      `)
      .eq('branch_id', branchId)
      .order('last_updated', { ascending: false });
    if (error) throw error;
    return data as any[];
  }

  async getBranchInventoryItem(branchId: string, itemId: string) {
    const { data, error } = await supabase
      .from('branch_inventory')
      .select('*')
      .eq('branch_id', branchId)
      .eq('item_id', itemId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data as BranchInventory | null;
  }

  async adjustInventory(
    branchId: string,
    itemId: string,
    quantityChange: number,
    reason: string,
    orgId: string
  ) {
    // Update branch inventory
    const current = await this.getBranchInventoryItem(branchId, itemId);
    const newQuantity = (current?.current_quantity || 0) + quantityChange;

    if (current) {
      await supabase
        .from('branch_inventory')
        .update({ current_quantity: newQuantity, last_updated: new Date().toISOString() })
        .eq('id', current.id);
    } else {
      await supabase
        .from('branch_inventory')
        .insert([
          {
            org_id: orgId,
            branch_id: branchId,
            item_id: itemId,
            current_quantity: newQuantity,
          },
        ]);
    }

    // Log transaction
    const { data, error } = await supabase
      .from('inventory_ledger')
      .insert([
        {
          org_id: orgId,
          branch_id: branchId,
          item_id: itemId,
          transaction_type: 'ADJUST',
          quantity_change: quantityChange,
          reason: reason,
          transaction_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as InventoryLedger;
  }

  // Transfers
  async initiateTransfer(orgId: string, transfer: Partial<InventoryTransfer>) {
    const { data, error } = await supabase
      .from('inventory_transfers')
      .insert([
        {
          org_id: orgId,
          from_branch_id: transfer.from_branch_id,
          to_branch_id: transfer.to_branch_id,
          item_id: transfer.item_id,
          quantity: transfer.quantity,
          transfer_date: transfer.transfer_date || new Date().toISOString().split('T')[0],
          status: 'PENDING',
          notes: transfer.notes,
        },
      ])
      .select()
      .single();
    if (error) throw error;

    // Create ledger entries
    await supabase
      .from('inventory_ledger')
      .insert([
        {
          org_id: orgId,
          branch_id: transfer.from_branch_id,
          item_id: transfer.item_id,
          transaction_type: 'TRANSFER_OUT',
          quantity_change: -(transfer.quantity || 0),
          reference_id: data.id,
          transaction_date: new Date().toISOString(),
        },
      ]);

    return data as InventoryTransfer;
  }

  async completeTransfer(transferId: string, orgId: string) {
    const transfer = await this.getTransferById(transferId);

    // Update transfer status
    await supabase
      .from('inventory_transfers')
      .update({
        status: 'COMPLETED',
        received_at: new Date().toISOString(),
      })
      .eq('id', transferId);

    // Update inventory at receiving branch
    const current = await this.getBranchInventoryItem(transfer.to_branch_id, transfer.item_id);
    const newQuantity = (current?.current_quantity || 0) + transfer.quantity;

    if (current) {
      await supabase
        .from('branch_inventory')
        .update({ current_quantity: newQuantity, last_updated: new Date().toISOString() })
        .eq('id', current.id);
    } else {
      await supabase
        .from('branch_inventory')
        .insert([
          {
            org_id: orgId,
            branch_id: transfer.to_branch_id,
            item_id: transfer.item_id,
            current_quantity: newQuantity,
          },
        ]);
    }

    // Log received entry
    await supabase
      .from('inventory_ledger')
      .insert([
        {
          org_id: orgId,
          branch_id: transfer.to_branch_id,
          item_id: transfer.item_id,
          transaction_type: 'TRANSFER_IN',
          quantity_change: transfer.quantity,
          reference_id: transferId,
          transaction_date: new Date().toISOString(),
        },
      ]);
  }

  async getTransferById(id: string) {
    const { data, error } = await supabase
      .from('inventory_transfers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as InventoryTransfer;
  }

  async getTransfers(orgId: string, fromBranchId?: string) {
    let query = supabase
      .from('inventory_transfers')
      .select(`
        *,
        item:item_id(*),
        from_branch:from_branch_id(id, name),
        to_branch:to_branch_id(id, name)
      `)
      .eq('org_id', orgId);

    if (fromBranchId) {
      query = query.eq('from_branch_id', fromBranchId);
    }

    const { data, error } = await query.order('transfer_date', { ascending: false });
    if (error) throw error;
    return data as any[];
  }

  // Ledger
  async getLedger(branchId: string) {
    const { data, error } = await supabase
      .from('inventory_ledger')
      .select('*')
      .eq('branch_id', branchId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data as InventoryLedger[];
  }

  // Petty Cash
  async recordCashTransaction(orgId: string, transaction: Partial<PettyCashLedger>) {
    const { data, error } = await supabase
      .from('petty_cash_ledger')
      .insert([
        {
          org_id: orgId,
          branch_id: transaction.branch_id,
          description: transaction.description,
          transaction_type: transaction.transaction_type,
          amount: transaction.amount,
          reference_type: transaction.reference_type,
          reference_id: transaction.reference_id,
          transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as PettyCashLedger;
  }

  async getCashLedger(branchId: string) {
    const { data, error } = await supabase
      .from('petty_cash_ledger')
      .select('*')
      .eq('branch_id', branchId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data as PettyCashLedger[];
  }

  async getBranchCashBalance(branchId: string) {
    const { data, error } = await supabase
      .from('petty_cash_ledger')
      .select('transaction_type, amount')
      .eq('branch_id', branchId);
    if (error) throw error;

    let balance = 0;
    data?.forEach((entry: any) => {
      if (entry.transaction_type === 'INCOME') {
        balance += entry.amount;
      } else {
        balance -= entry.amount;
      }
    });

    return balance;
  }
}

export const inventoryService = new InventoryService();
