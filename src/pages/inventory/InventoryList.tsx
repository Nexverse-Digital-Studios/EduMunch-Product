import { useState } from "react";
import { Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import {
  Asset,
  Branch,
  InventoryItem,
  BranchInventoryTab,
  TransfersTab,
  LedgerTab,
  PettyCashTab,
  MasterItemsTab,
  AdjustStockModal,
  TransferModal,
  AddEntryModal,
  AddItemModal,
} from "./components";

export const InventoryList = () => {
  const permissions = useModulePermissions("inventory");
  const { canCreate } = permissions;

  // State
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Modal states
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Fetch data
  const { data: branches = [], isLoading: branchesLoading } =
    useSupabaseTable<Branch>(TABLES.CLASSES, { select: "id, class_name" });

  // Placeholder data - would be replaced with actual data fetching
  const inventoryItems: InventoryItem[] = [];
  const masterItems: InventoryItem[] = [];

  // Handlers
  const handleAdjustStock = () => {
    setIsAdjustStockOpen(true);
  };

  const handleInitiateTransfer = () => {
    setIsTransferOpen(true);
  };

  const handleAddEntry = () => {
    setIsAddEntryOpen(true);
  };

  const handleAddItem = () => {
    setIsAddItemOpen(true);
  };

  const handleAdjustStockSubmit = (data: {
    assetId: string;
    adjustmentType: string;
    quantity: number;
    reason: string;
  }) => {
    console.log("Adjust stock:", data);
    setIsAdjustStockOpen(false);
  };

  const handleTransferSubmit = (data: {
    fromBranch: string;
    toBranch: string;
    itemId: string;
    quantity: number;
    notes: string;
  }) => {
    console.log("Transfer:", data);
    setIsTransferOpen(false);
  };

  const handleAddEntrySubmit = (data: {
    type: "credit" | "debit";
    amount: number;
    category: string;
    description: string;
  }) => {
    console.log("Add entry:", data);
    setIsAddEntryOpen(false);
  };

  const handleAddItemSubmit = (data: {
    name: string;
    category: string;
    unit: string;
    description: string;
  }) => {
    console.log("Add item:", data);
    setIsAddItemOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage assets, transfers, and petty cash across branches
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="branch-inventory" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="branch-inventory">Branch Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="petty-cash">Petty Cash</TabsTrigger>
          <TabsTrigger value="master-items">Master Items</TabsTrigger>
        </TabsList>

        <TabsContent value="branch-inventory">
          <BranchInventoryTab
            branches={branches}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            items={inventoryItems}
            isLoading={branchesLoading}
            canCreate={canCreate}
            onAdjustStock={handleAdjustStock}
          />
        </TabsContent>

        <TabsContent value="transfers">
          <TransfersTab
            canCreate={canCreate}
            onInitiateTransfer={handleInitiateTransfer}
          />
        </TabsContent>

        <TabsContent value="ledger">
          <LedgerTab
            branches={branches}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
          />
        </TabsContent>

        <TabsContent value="petty-cash">
          <PettyCashTab
            branches={branches}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            canCreate={canCreate}
            onAddEntry={handleAddEntry}
          />
        </TabsContent>

        <TabsContent value="master-items">
          <MasterItemsTab
            masterItems={masterItems}
            isLoading={false}
            canCreate={canCreate}
            onAddItem={handleAddItem}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AdjustStockModal
        isOpen={isAdjustStockOpen}
        onClose={() => setIsAdjustStockOpen(false)}
        selectedAsset={selectedAsset}
        onSubmit={handleAdjustStockSubmit}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        branches={branches}
        inventoryItems={inventoryItems}
        onSubmit={handleTransferSubmit}
      />

      <AddEntryModal
        isOpen={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
        selectedBranch={selectedBranch}
        onSubmit={handleAddEntrySubmit}
      />

      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onSubmit={handleAddItemSubmit}
      />
    </div>
  );
};
