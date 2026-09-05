/**
 * Inventory Types
 * ================
 * Type definitions for the inventory module
 */

export interface Asset {
  id: string;
  asset_code: string;
  asset_name: string;
  asset_category: string;
  asset_type: string | null;
  description: string | null;
  status: string;
  condition_status: string;
  purchase_cost: number | null;
  created_at: string;
}

export interface Branch {
  id: string;
  class_name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
}

export interface Transfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  item: string;
  quantity: number;
  status: string;
  initiatedAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  item: string;
  quantityChange: number;
  reason: string;
  recordedBy: string;
}

export interface PettyCashEntry {
  id: string;
  date: string;
  description: string;
  type: 'expense' | 'deposit' | 'transfer_in';
  amount: number;
  recordedBy: string;
}
