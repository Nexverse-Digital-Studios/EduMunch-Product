/**
 * BatchCreate Page
 * =================
 * Create new batch/section page
 * Route: /batches/create
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
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

export default function BatchCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch classes for the dropdown
  const { data: classes, isLoading: loadingClasses } =
    useSupabaseTable<ClassDB>(TABLES.CLASSES, {
      orderBy: { column: "class_order", ascending: true },
    });

  const { createMutation } = useSupabaseTable<SectionDB>(TABLES.SECTIONS);

  const handleSubmit = (data: BatchFormData) => {
    if (!data.class_id) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<SectionDB> = {
      class_id: data.class_id,
      section_name: data.section_name.trim(),
      section_code: data.section_code.trim(),
      capacity: data.capacity || undefined,
      room_number: data.room_number?.trim() || undefined,
      is_active: data.is_active,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Batch created successfully",
        });
        navigate("/batches");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create batch",
          variant: "destructive",
        });
      },
    });
  };

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/batches")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Plus className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Create New Batch
            </h1>
            <p className="text-muted-foreground">
              Add a new section/batch to a class
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
          <CardDescription>
            Enter the details for the new batch/section. Required fields are
            marked with an asterisk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BatchForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/batches")}
            isLoading={createMutation.isPending}
            submitLabel="Create Batch"
            classes={classes || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
