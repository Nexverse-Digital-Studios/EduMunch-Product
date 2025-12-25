/**
 * TopicCreate Page
 * =================
 * Form page for creating a new topic
 * Route: /topics/create
 */

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { TopicForm, type TopicFormData, type TopicDB } from "./components";

// Subject type
interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

export default function TopicCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch subjects for dropdown
  const { data: subjects = [] } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
    orderBy: { column: "subject_name", ascending: true },
  });

  // Form setup
  const form = useForm<TopicFormData>({
    defaultValues: {
      subject_id: "",
      topic_name: "",
      topic_code: "",
      description: "",
      display_order: null,
      estimated_hours: null,
      is_active: true,
    },
  });

  // Create mutation
  const { createMutation } = useSupabaseTable<TopicDB>(TABLES.TOPICS);

  // Submit handler
  const onSubmit = (data: TopicFormData) => {
    if (!data.subject_id) {
      toast({
        title: "Error",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(
      {
        subject_id: data.subject_id,
        topic_name: data.topic_name,
        topic_code: data.topic_code || null,
        description: data.description || null,
        display_order: data.display_order,
        estimated_hours: data.estimated_hours,
        is_active: data.is_active,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Topic created successfully",
          });
          navigate("/topics");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create topic",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/topics")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Topic</h1>
            <p className="text-muted-foreground mt-1">
              Add a new topic to your curriculum
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TopicForm form={form} subjects={subjects} />

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
                    Create Topic
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/topics")}
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
