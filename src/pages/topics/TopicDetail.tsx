/**
 * TopicDetail Page
 * =================
 * Read-only view of topic details with content management
 * Route: /topics/:id
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Clock,
  Hash,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  Plus,
  Video,
  Link as LinkIcon,
  File,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  AddContentDialog,
  DeleteTopicDialog,
  DeleteContentDialog,
  type TopicDB,
  type TopicContentDB,
} from "./components";

// Subject type
interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

const getContentIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return <Video className="h-4 w-4 text-red-500" />;
    case "pdf":
    case "document":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "link":
      return <LinkIcon className="h-4 w-4 text-green-500" />;
    default:
      return <File className="h-4 w-4 text-orange-500" />;
  }
};

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);

  // Permission checks
  const { canUpdate, canDelete } = useModulePermissions("topics");

  // Fetch data
  const { data: topics = [], isLoading: loadingTopics } =
    useSupabaseTable<TopicDB>(TABLES.TOPICS);
  const topic = topics.find((t) => t.id === id);

  const { data: subjects = [] } = useSupabaseTable<SubjectDB>(TABLES.SUBJECTS);
  const subject = topic
    ? subjects.find((s) => s.id === topic.subject_id)
    : null;

  const {
    data: topicContents = [],
    isLoading: loadingContents,
    createMutation: createContent,
    deleteMutation: deleteContent,
  } = useSupabaseTable<TopicContentDB>(TABLES.TOPIC_CONTENT, {
    orderBy: { column: "display_order", ascending: true },
  });

  const contents = topicContents.filter((c) => c.topic_id === id);

  // Delete mutations
  const { deleteMutation: deleteTopic } = useSupabaseTable<TopicDB>(
    TABLES.TOPICS
  );

  const isLoading = loadingTopics || loadingContents;

  // Handlers
  const handleDelete = () => {
    if (id) {
      deleteTopic.mutate(id, {
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

  const handleCreateContent = (data: {
    content_type: string;
    content_title: string;
    content_url: string;
  }) => {
    if (!id) return;

    createContent.mutate(
      {
        topic_id: id,
        content_type: data.content_type as TopicContentDB["content_type"],
        content_title: data.content_title.trim(),
        content_url: data.content_url.trim() || null,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Content added successfully",
          });
          setIsAddContentOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteContent = () => {
    if (!deleteContentId) return;

    deleteContent.mutate(deleteContentId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Content deleted successfully",
        });
        setDeleteContentId(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const selectedContent = deleteContentId
    ? contents.find((c) => c.id === deleteContentId)
    : null;

  if (isLoading) {
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
          <div>
            <h2 className="text-2xl font-bold">Topic Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The topic you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Button onClick={() => navigate("/topics")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topics
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
            onClick={() => navigate("/topics")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Topic Details</h1>
            <p className="text-muted-foreground mt-1">
              View topic information and content
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button onClick={() => navigate(`/topics/${id}/edit`)}>
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
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{topic.topic_name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {topic.topic_code && (
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {topic.topic_code}
                    </code>
                  )}
                  <Badge variant={topic.is_active ? "default" : "secondary"}>
                    {topic.is_active ? "Active" : "Inactive"}
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
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Subject</span>
              </div>
              <p className="text-lg font-semibold">
                {subject?.subject_name || "Unknown"}
              </p>
            </div>

            {topic.display_order !== null && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium">Display Order</span>
                </div>
                <p className="text-lg font-semibold">{topic.display_order}</p>
              </div>
            )}

            {topic.estimated_hours !== null && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Estimated Hours</span>
                </div>
                <p className="text-lg font-semibold">
                  {topic.estimated_hours} hours
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                {topic.is_active ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className="text-lg font-semibold">
                {topic.is_active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-sm">
                {new Date(topic.created_at).toLocaleDateString("en-US", {
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
                {new Date(topic.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Description Section */}
          {topic.description && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Description</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {topic.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content ({contents.length} items)
            </CardTitle>
            {canUpdate && (
              <Button size="sm" onClick={() => setIsAddContentOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No content added yet.
            </p>
          ) : (
            <div className="space-y-2">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    {getContentIcon(content.content_type)}
                    <div>
                      <span className="text-sm font-medium">
                        {content.content_title}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {content.content_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canUpdate && (
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteContentId(content.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Content Dialog */}
      <AddContentDialog
        open={isAddContentOpen}
        onOpenChange={setIsAddContentOpen}
        onSubmit={handleCreateContent}
        isPending={createContent.isPending}
      />

      {/* Delete Topic Dialog */}
      <DeleteTopicDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        topicName={topic.topic_name}
      />

      {/* Delete Content Dialog */}
      <DeleteContentDialog
        open={!!deleteContentId}
        onOpenChange={(open) => !open && setDeleteContentId(null)}
        onConfirm={handleDeleteContent}
        contentTitle={selectedContent?.content_title}
      />
    </div>
  );
}
