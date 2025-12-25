/**
 * TopicEdit Page
 * ===============
 * Form page for editing an existing topic
 * Route: /topics/:id/edit
 */

import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  TopicForm,
  DeleteTopicDialog,
  type TopicFormData,
  type TopicDB,
} from "./components";

// Subject type
interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

export default function TopicEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Permission checks
  const { canDelete } = useModulePermissions("topics");

  // Fetch data
  const { data: topics = [], isLoading: loadingTopics } =
    useSupabaseTable<TopicDB>(TABLES.TOPICS);
  const topic = topics.find((t) => t.id === id);

  const { data: subjects = [] } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
    orderBy: { column: "subject_name", ascending: true },
  });

  // Mutations
  const { updateMutation, deleteMutation } = useSupabaseTable<TopicDB>(
    TABLES.TOPICS
  );

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

  // Populate form when topic data loads
  useEffect(() => {
    if (topic) {
      form.reset({
        subject_id: topic.subject_id,
        topic_name: topic.topic_name,
        topic_code: topic.topic_code || "",
        description: topic.description || "",
        display_order: topic.display_order ?? null,
        estimated_hours: topic.estimated_hours ?? null,
        is_active: topic.is_active,
      });
    }
  }, [topic, form]);

  // Submit handler
  const onSubmit = (data: TopicFormData) => {
    if (!id) return;

    updateMutation.mutate(
      {
        id,
        updates: {
          subject_id: data.subject_id,
          topic_name: data.topic_name,
          topic_code: data.topic_code || null,
          description: data.description || null,
          display_order: data.display_order,
          estimated_hours: data.estimated_hours,
          is_active: data.is_active,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Topic updated successfully",
          });
          navigate(`/topics/${id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update topic",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Delete handler
  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Topic deleted successfully",
          });
          navigate("/topics");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete topic",
            variant: "destructive",
          });
        },
      });
    }
  };

  if (loadingTopics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading topic details...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Topic Not Found</h2>
          <p className="text-muted-foreground">
            The topic you're trying to edit doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/topics")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/topics/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Topic</h1>
            <p className="text-muted-foreground mt-1">
              Update topic information
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
            <TopicForm form={form} subjects={subjects} isEdit />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/topics/${id}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              {canDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={updateMutation.isPending}
                  className="sm:ml-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Topic
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteTopicDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        topicName={topic.topic_name}
      />
    </div>
  );
}
