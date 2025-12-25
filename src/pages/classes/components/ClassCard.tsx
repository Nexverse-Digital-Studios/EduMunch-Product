/**
 * ClassCard Component
 * ====================
 * Reusable card component for displaying classes on mobile
 * Used in ClassesList page
 */

import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, BookOpen, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ClassDB } from "./ClassTable";

interface ClassCardProps {
  classItem: ClassDB;
  onDelete: (classId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const ClassCard = ({
  classItem,
  onDelete,
  canUpdate,
  canDelete,
}: ClassCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {classItem.class_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {classItem.class_code}
                </Badge>
                <Badge
                  variant={classItem.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {classItem.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {classItem.class_order && (
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Order:</span>
              <span className="font-medium">{classItem.class_order}</span>
            </div>
          )}
          {classItem.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {classItem.description}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/classes/${classItem.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/classes/${classItem.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(classItem.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
