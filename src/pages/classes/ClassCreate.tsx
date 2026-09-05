/**
 * ClassCreate Page
 * =================
 * Form page for creating a new class
 * Route: /classes/create
 */

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ClassForm, type ClassFormData, type ClassDB } from "./components";

export default function ClassCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form setup
  const form = useForm<ClassFormData>({
    defaultValues: {
      class_name: "",
      class_code: "",
      class_order: null,
      description: "",
      is_active: true,
    },
  });

  // Create mutation
  const { createMutation } = useSupabaseTable<ClassDB>(TABLES.CLASSES);

  // Submit handler
  const onSubmit = (data: ClassFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Class created successfully",
        });
        navigate("/classes");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create class",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/classes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Class</h1>
          <p className="text-muted-foreground mt-1">
            Add a new class to your school
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ClassForm form={form} />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Class
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/classes")}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
