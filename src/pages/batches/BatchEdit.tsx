/**
 * BatchEdit Page
 * ===============
 * Edit existing batch/section page
 * Route: /batches/:id/edit
 */

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  BatchForm,
  type SectionDB,
  type ClassDB,
  type BatchFormData,
} from "./components";

export default function BatchEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch section data
  const {
    data: sections,
    isLoading: loadingSection,
    updateMutation,
  } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    filters: { id },
  });

  // Fetch all classes for the dropdown
  const { data: classes, isLoading: loadingClasses } =
    useSupabaseTable<ClassDB>(TABLES.CLASSES, {
      orderBy: { column: "class_order", ascending: true },
    });

  const isLoading = loadingSection || loadingClasses;
  const section = sections?.[0];

  const handleSubmit = (data: BatchFormData) => {
    if (!id) return;

    if (!data.class_id) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    const updates: Partial<SectionDB> = {
      class_id: data.class_id,
      section_name: data.section_name.trim(),
      section_code: data.section_code.trim(),
      capacity: data.capacity || undefined,
      room_number: data.room_number?.trim() || undefined,
      is_active: data.is_active,
    };

    updateMutation.mutate(
      { id, updates },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Batch updated successfully",
          });
          navigate(`/batches/${id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update batch",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading batch details...</span>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/batches")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Batch Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              The requested batch could not be found
            </p>
            <Button onClick={() => navigate("/batches")} className="mt-6">
              Back to Batches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare default values for the form
  const defaultValues: Partial<BatchFormData> = {
    class_id: section.class_id,
    section_name: section.section_name,
    section_code: section.section_code,
    capacity: section.capacity || 40,
    room_number: section.room_number || "",
    is_active: section.is_active,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/batches/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Edit className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Batch</h1>
            <p className="text-muted-foreground">
              Update details for {section.section_name}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
          <CardDescription>
            Update the batch details below. Required fields are marked with an
            asterisk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BatchForm
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/batches/${id}`)}
            isLoading={updateMutation.isPending}
            defaultValues={defaultValues}
            submitLabel="Save Changes"
            classes={classes || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
