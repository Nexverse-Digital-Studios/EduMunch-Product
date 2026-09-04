/**
 * ClassDetail Page
 * =================
 * Read-only view of class details
 * Route: /classes/:id
 */

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Hash,
  Calendar,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DeleteClassDialog, type ClassDB } from "./components";

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Permission checks
  const { canUpdate, canDelete } = useModulePermissions("classes");

  // Fetch class data
  const { data: classes = [], isLoading } = useSupabaseTable<ClassDB>(
    TABLES.CLASSES
  );
  const classItem = classes.find((c) => c.id === id);

  // Delete mutation
  const { deleteMutation } = useSupabaseTable<ClassDB>(TABLES.CLASSES);

  // Delete handler
  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Class deleted successfully",
          });
          navigate("/classes");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete class",
            variant: "destructive",
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-2xl font-bold">Class Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The class you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Button onClick={() => navigate("/classes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/classes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Class Details</h1>
            <p className="text-muted-foreground mt-1">View class information</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button onClick={() => navigate(`/classes/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {classItem.class_name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{classItem.class_code}</Badge>
                  <Badge
                    variant={classItem.is_active ? "default" : "secondary"}
                  >
                    {classItem.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Details Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {classItem.class_order !== null && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium">Class Order</span>
                </div>
                <p className="text-lg font-semibold">{classItem.class_order}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                {classItem.is_active ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className="text-lg font-semibold">
                {classItem.is_active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-sm">
                {new Date(classItem.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <p className="text-sm">
                {new Date(classItem.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Description Section */}
          {classItem.description && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Description</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {classItem.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteClassDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        className={classItem.class_name}
      />
    </div>
  );
}
