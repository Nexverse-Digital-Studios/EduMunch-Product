/**
 * BatchCard Component
 * ====================
 * Mobile card view for batches/sections
 */

import { Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type BatchDisplay } from "./BatchTable";

interface BatchCardProps {
  batch: BatchDisplay;
  onDelete: (id: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const BatchCard = ({
  batch,
  onDelete,
  canUpdate,
  canDelete,
}: BatchCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{batch.name}</p>
            <p className="text-sm text-muted-foreground">{batch.code}</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/batches/${batch.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/batches/${batch.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onDelete(batch.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Class: </span>
            {batch.className}
          </div>
          <div>
            <span className="text-muted-foreground">Capacity: </span>
            {batch.capacity || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">Room: </span>
            {batch.roomNumber || "-"}
          </div>
          <div>
            <Badge
              variant={batch.isActive ? "default" : "secondary"}
              className={
                batch.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : ""
              }
            >
              {batch.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchCard;
