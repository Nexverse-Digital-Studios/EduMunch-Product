/**
 * Inventory.tsx - Inventory & Cash Management
 * 
 * NOTE: This feature requires Tier 3 schema to be deployed.
 * 
 * Supabase Tables (Tier 3):
 * - assets_1EMAET: School assets (furniture, equipment, IT assets)
 * - asset_maintenance_1EMAET: Asset maintenance schedule/history
 * - lab_equipment_1EMAET: Lab-specific equipment
 * 
 * Schema Reference:
 * - assets: asset_code, asset_name, asset_category, status, condition_status, purchase_cost
 * - asset_maintenance: asset_id, maintenance_type, maintenance_date, status
 * 
 * Currently using mock data until Tier 3 is deployed.
 */
import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Clock, AlertTriangle, Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1emaet';

// Types for Tier 3 assets (when available)
interface Asset {
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

interface Branch {
  id: string;
  class_name: string;
}

// Mock data for demo (until Tier 3 is deployed)
const mockInventoryItems = [
  { id: "1", name: "Advertising Papers", type: "ASSET", quantity: 10 },
  { id: "2", name: "Markers", type: "CONSUMABLE", quantity: 50 },
  { id: "3", name: "Projector", type: "ASSET", quantity: 2 },
];

const mockTransfers = [
  { id: "1", fromBranch: "Thane HO Branch", toBranch: "Kalyan Branch", item: "Cash", quantity: 2000, status: "CANCELLED", initiatedAt: "11/15/2025, 2:35:26 PM" },
  { id: "2", fromBranch: "Thane HO Branch", toBranch: "Manpada Branch", item: "Cash", quantity: 100000, status: "COMPLETED", initiatedAt: "10/17/2025, 4:10:59 PM" },
];

const mockPettyCashLedger = [
  { id: "1", date: "10/17/2025, 4:11:05 PM", description: "From Branch ID 1", type: "TRANSFER_IN", recordedBy: "Super Admin", amount: 100000 },
  { id: "2", date: "10/15/2025, 2:00:00 PM", description: "Stationary Purchase", type: "EXPENSE", recordedBy: "Branch Manager", amount: -500 },
];

const mockMasterItems = [
  { id: "1", name: "Advertising Papers", description: "For distribution", type: "ASSET" },
  { id: "2", name: "Cash", description: "For Spending", type: "CASH" },
  { id: "3", name: "Maths Books", description: "For student distribution", type: "CONSUMABLE" },
];

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("branch");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const { canView, canCreate, canUpdate, canDelete } = useModulePermissions('INVENTORY');
  const { toast } = useToast();

  // Try to fetch branches (classes) from Tier 1
  const { data: branches = [] } = useSupabaseTable<Branch>(
    `classes_${INDEX_TOKEN}`,
    { select: 'id, class_name' }
  );

  // Try to fetch assets from Tier 3 (may not be available)
  const { data: assets = [], isLoading: assetsLoading } = useSupabaseTable<Asset>(
    `assets_${INDEX_TOKEN}`,
    { 
      select: '*',
      orderBy: { column: 'created_at', ascending: false }
    }
  );

  // For tier 3 availability, just check if assets loaded
  const isTier3Available = assets.length >= 0;

  const currentBalance = 100000;

  // Use real assets if available, otherwise mock data
  const inventoryItems = useMemo(() => {
    if (isTier3Available && assets.length > 0) {
      return assets.map(a => ({
        id: a.id,
        name: a.asset_name,
        type: a.asset_category || 'Unknown',
        quantity: 1 // Assets are typically single items
      }));
    }
    return mockInventoryItems;
  }, [assets, isTier3Available]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryItems, searchQuery]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Inventory & Cash Management</h1>

      {!isTier3Available && (
        <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">Tier 3 Schema Required</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            This feature requires Tier 3 schema (assets, asset_maintenance, lab_equipment tables) to be deployed.
            Currently showing demo data. Deploy Tier 3 schema for full functionality.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0 flex-wrap">
          <TabsTrigger
            value="branch"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Branch Inventory
          </TabsTrigger>
          <TabsTrigger
            value="transfers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Transfers
          </TabsTrigger>
          <TabsTrigger
            value="ledger"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Inventory Ledger
          </TabsTrigger>
          <TabsTrigger
            value="petty"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Petty Cash Ledger
          </TabsTrigger>
          <TabsTrigger
            value="master"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Master Item List
          </TabsTrigger>
        </TabsList>

        {/* Branch Inventory Tab */}
        <TabsContent value="branch" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Select Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
            {canCreate && (
              <Button onClick={() => setIsAdjustModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Adjust Stock
              </Button>
            )}
          </div>

          {assetsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.type}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="mt-6 space-y-6">
          <div className="flex justify-end">
            {canCreate && (
              <Button onClick={() => setIsTransferModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Initiate Transfer
              </Button>
            )}
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>From Branch</TableHead>
                  <TableHead>To Branch</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Initiated At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransfers.map((transfer) => (
                  <TableRow key={transfer.id} className="hover:bg-muted/20">
                    <TableCell className="text-foreground">{transfer.fromBranch}</TableCell>
                    <TableCell className="text-foreground">{transfer.toBranch}</TableCell>
                    <TableCell className="text-foreground">{transfer.item}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">{transfer.quantity.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={transfer.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-red-100 text-red-800 border-red-300'}
                      >
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{transfer.initiatedAt}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Inventory Ledger Tab */}
        <TabsContent value="ledger" className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Select Branch</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">11/15/2025, 2:07:41 PM</TableCell>
                  <TableCell className="text-foreground">Advertising Papers</TableCell>
                  <TableCell className="text-right font-medium text-red-600">-10</TableCell>
                  <TableCell className="text-foreground">Distributed</TableCell>
                  <TableCell className="text-muted-foreground">Thane Branch manager</TableCell>
                </TableRow>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground">10/20/2025, 10:30:00 AM</TableCell>
                  <TableCell className="text-foreground">Markers</TableCell>
                  <TableCell className="text-right font-medium text-green-600">+25</TableCell>
                  <TableCell className="text-foreground">Restocked</TableCell>
                  <TableCell className="text-muted-foreground">Super Admin</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Petty Cash Ledger Tab */}
        <TabsContent value="petty" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Select Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canCreate && (
              <Button onClick={() => setIsAddEntryModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <span className="text-foreground font-medium">Current Balance: </span>
            <span className="text-green-600 font-bold text-lg">₹{currentBalance.toLocaleString('en-IN')}.00</span>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPettyCashLedger.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/20">
                    <TableCell className="text-muted-foreground">{entry.date}</TableCell>
                    <TableCell className="text-foreground">{entry.description}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.type}</TableCell>
                    <TableCell className="text-foreground">{entry.recordedBy}</TableCell>
                    <TableCell className={`text-right font-medium ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(entry.amount).toLocaleString('en-IN')}.00
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Master Item List Tab */}
        <TabsContent value="master" className="mt-6 space-y-6">
          <div className="flex justify-end">
            {canCreate && (
              <Button onClick={() => setIsAddItemModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            )}
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMasterItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.description}</TableCell>
                    <TableCell className="text-foreground">{item.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canUpdate && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Adjust Stock Modal */}
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Branch Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Item to Adjust</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity Change (use negative for removal)</Label>
              <Input type="number" placeholder="Enter quantity" />
            </div>
            <div className="space-y-2">
              <Label>Reason for Adjustment</Label>
              <Input placeholder="Enter reason" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Apply Adjustment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Initiate Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>From Branch</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.class_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.class_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Item</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {mockMasterItems.map((item) => (
                    <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" placeholder="Enter quantity" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Initiate Transfer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Entry Modal */}
      <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Petty Cash Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Enter description" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="transfer_in">Transfer In</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Add Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Enter item name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Enter description" className="resize-none" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSET">ASSET</SelectItem>
                  <SelectItem value="CONSUMABLE">CONSUMABLE</SelectItem>
                  <SelectItem value="CASH">CASH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Add Item</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
