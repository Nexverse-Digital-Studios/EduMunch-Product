/**
 * SubjectDetail Page
 * ===================
 * Read-only view of subject details
 * Route: /subjects/:id
 */

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubjects, useDeleteSubject } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { DeleteSubjectDialog } from "./components";

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Permission checks
  const { canUpdate, canDelete } = useModulePermissions("subjects");

  // Fetch subject data
  const { data: subjects = [], isLoading } = useSubjects();
  const subject = subjects.find((s) => s.id === id);

  // Delete mutation
  const deleteSubjectMutation = useDeleteSubject();

  // Delete handler
  const handleDelete = async () => {
    if (id) {
      try {
        await deleteSubjectMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Subject deleted successfully",
        });
        navigate("/subjects");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete subject",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-2xl font-bold">Subject Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The subject you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Button onClick={() => navigate("/subjects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
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
            onClick={() => navigate("/subjects")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Subject Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View subject information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button onClick={() => navigate(`/subjects/${id}/edit`)}>
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
                  {subject.subject_name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {subject.subject_code}
                  </code>
                  <Badge variant={subject.is_active ? "default" : "secondary"}>
                    {subject.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Details Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="text-sm font-medium">Subject Type</span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {subject.subject_type || "General"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                {subject.is_active ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className="text-lg font-semibold">
                {subject.is_active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-sm">
                {new Date(subject.created_at).toLocaleDateString("en-US", {
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
                {new Date(subject.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteSubjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        subjectName={subject.subject_name}
      />
    </div>
  );
}
