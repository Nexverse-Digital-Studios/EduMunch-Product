/**
 * DualListTransfer Component
 * ===========================
 * Reusable dual-list transfer component for assigning subjects/faculty to batches
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ListItem {
  id: string;
  label: string;
}

interface DualListTransferProps {
  assignedTitle: string;
  assignedItems: ListItem[];
  availableTitle: string;
  availableItems: ListItem[];
  emptyMessage?: string;
  onAssign?: (items: string[]) => void;
  onUnassign?: (items: string[]) => void;
}

export const DualListTransfer = ({
  assignedTitle,
  assignedItems,
  availableTitle,
  availableItems,
  emptyMessage = "No items available",
  onAssign,
  onUnassign,
}: DualListTransferProps) => {
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAssigned = (id: string) => {
    setSelectedAssigned((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAvailable = (id: string) => {
    setSelectedAvailable((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    if (onAssign && selectedAvailable.length > 0) {
      onAssign(selectedAvailable);
      setSelectedAvailable([]);
    }
  };

  const handleUnassign = () => {
    if (onUnassign && selectedAssigned.length > 0) {
      onUnassign(selectedAssigned);
      setSelectedAssigned([]);
    }
  };

  const filteredAvailable = availableItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch">
      {/* Assigned List */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {assignedTitle} ({assignedItems.length})
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedAssigned(assignedItems.map((i) => i.id))
                }
              >
                Select all
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssigned([])}
              >
                Clear
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Select items and use the arrows to move.
          </p>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {assignedItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No items assigned
                </p>
              ) : (
                assignedItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                      selectedAssigned.includes(item.id)
                        ? "bg-primary/20"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleAssigned(item.id)}
                  >
                    <Checkbox checked={selectedAssigned.includes(item.id)} />
                    <span>{item.label}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Transfer Buttons */}
      <div className="flex lg:flex-col items-center justify-center gap-2">
        <Button
          size="icon"
          className="bg-primary"
          onClick={handleAssign}
          disabled={selectedAvailable.length === 0}
          title="Assign selected"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={handleUnassign}
          disabled={selectedAssigned.length === 0}
          title="Unassign selected"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Available List */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {availableTitle} ({availableItems.length})
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search..."
                className="w-32 h-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedAvailable(filteredAvailable.map((i) => i.id))
                }
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAvailable([])}
              >
                Clear
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            {filteredAvailable.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {emptyMessage}
              </p>
            ) : (
              <div className="space-y-1">
                {filteredAvailable.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                      selectedAvailable.includes(item.id)
                        ? "bg-primary/20"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleAvailable(item.id)}
                  >
                    <Checkbox checked={selectedAvailable.includes(item.id)} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DualListTransfer;
