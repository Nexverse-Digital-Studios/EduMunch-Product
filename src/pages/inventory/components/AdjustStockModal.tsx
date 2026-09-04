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
import { Asset } from "./types";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset | null;
  onSubmit: (data: {
    assetId: string;
    adjustmentType: string;
    quantity: number;
    reason: string;
  }) => void;
}

export const AdjustStockModal = ({
  isOpen,
  onClose,
  selectedAsset,
  onSubmit,
}: AdjustStockModalProps) => {
  const [adjustmentType, setAdjustmentType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    onSubmit({
      assetId: selectedAsset.id,
      adjustmentType,
      quantity: parseInt(quantity, 10),
      reason,
    });

    // Reset form
    setAdjustmentType("");
    setQuantity("");
    setReason("");
  };

  const handleClose = () => {
    setAdjustmentType("");
    setQuantity("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedAsset && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="font-medium">{selectedAsset.asset_name}</p>
              <p className="text-sm text-muted-foreground">
                Code: {selectedAsset.asset_code}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="adjustmentType">Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={setAdjustmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock</SelectItem>
                <SelectItem value="remove">Remove Stock</SelectItem>
                <SelectItem value="damaged">Mark as Damaged</SelectItem>
                <SelectItem value="lost">Mark as Lost</SelectItem>
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
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!adjustmentType || !quantity || !reason}
            >
              Adjust Stock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
