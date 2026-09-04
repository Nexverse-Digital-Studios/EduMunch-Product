import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Branch, InventoryItem } from "./types";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  inventoryItems: InventoryItem[];
  onSubmit: (data: {
    fromBranch: string;
    toBranch: string;
    itemId: string;
    quantity: number;
    notes: string;
  }) => void;
}

export const TransferModal = ({
  isOpen,
  onClose,
  branches,
  inventoryItems,
  onSubmit,
}: TransferModalProps) => {
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      fromBranch,
      toBranch,
      itemId: selectedItem,
      quantity: parseInt(quantity, 10),
      notes,
    });

    // Reset form
    setFromBranch("");
    setToBranch("");
    setSelectedItem("");
    setQuantity("");
    setNotes("");
  };

  const handleClose = () => {
    setFromBranch("");
    setToBranch("");
    setSelectedItem("");
    setQuantity("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Initiate Transfer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromBranch">From Branch</Label>
            <Select value={fromBranch} onValueChange={setFromBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Select source branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toBranch">To Branch</Label>
            <Select value={toBranch} onValueChange={setToBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination branch" />
              </SelectTrigger>
              <SelectContent>
                {branches
                  .filter((branch) => branch.id !== fromBranch)
                  .map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.class_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item">Item</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {inventoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} (Qty: {item.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fromBranch || !toBranch || !selectedItem || !quantity}
            >
              Initiate Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
