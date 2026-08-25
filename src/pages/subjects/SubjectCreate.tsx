/**
 * SubjectCreate Page
 * ===================
 * Form page for creating a new subject
 * Route: /subjects/create
 */

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateSubject } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { SubjectForm, type SubjectFormData } from "./components";

export default function SubjectCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form setup
  const form = useForm<SubjectFormData>({
    defaultValues: {
      subject_name: "",
      subject_code: "",
      subject_type: "",
      is_active: true,
    },
  });

  // Create mutation
  const createSubjectMutation = useCreateSubject();

  // Submit handler
  const onSubmit = async (data: SubjectFormData) => {
    try {
      await createSubjectMutation.mutateAsync({
        subject_name: data.subject_name,
        subject_code: data.subject_code.toUpperCase(),
        subject_type: data.subject_type || undefined,
        is_active: data.is_active,
      });
      toast({
        title: "Success",
        description: "Subject created successfully",
      });
      navigate("/subjects");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/subjects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Subject
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new subject to your curriculum
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SubjectForm form={form} />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createSubjectMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                {createSubjectMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Subject
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/subjects")}
                disabled={createSubjectMutation.isPending}
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
