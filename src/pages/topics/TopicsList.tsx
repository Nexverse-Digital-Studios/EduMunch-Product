/**
 * TopicsList Page
 * ================
 * Main topics listing page with subject filtering and content management
 * Route: /topics
 */

import { useState } from "react";
import { Plus, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  TopicItem,
  TopicFormDialog,
  AddContentDialog,
  DeleteTopicDialog,
  DeleteContentDialog,
  type TopicDB,
  type TopicContentDB,
} from "./components";

// Subject type for filtering
interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

export default function TopicsList() {
  const { toast } = useToast();

  // UI State
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Permission checks
  const { canCreate, canUpdate, canDelete } = useModulePermissions("topics");

  // Fetch data
  const { data: subjects, isLoading: loadingSubjects } =
    useSupabaseTable<SubjectDB>(TABLES.SUBJECTS, {
      orderBy: { column: "subject_name", ascending: true },
    });

  const {
    data: topics,
    isLoading: loadingTopics,
    deleteMutation: deleteTopic,
  } = useSupabaseTable<TopicDB>(TABLES.TOPICS, {
    orderBy: { column: "display_order", ascending: true },
  });

  const {
    data: topicContents,
    isLoading: loadingContents,
    createMutation: createContent,
    deleteMutation: deleteContent,
  } = useSupabaseTable<TopicContentDB>(TABLES.TOPIC_CONTENT, {
    orderBy: { column: "display_order", ascending: true },
  });

  const isLoading = loadingSubjects || loadingTopics || loadingContents;

  // Modal handlers
  const handleCreate = () => {
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditId(null);
  };

  // Toggle topic expansion
  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Group topics by subject
  const topicsBySubject = (subjects || []).map((subject) => ({
    ...subject,
    topics: (topics || []).filter(
      (t) => t.subject_id === subject.id && t.is_active
    ),
  }));

  // Get contents for a topic
  const getTopicContents = (topicId: string) =>
    (topicContents || []).filter((c) => c.topic_id === topicId);

  // Filter by selected subject
  const filteredSubjects =
    selectedSubject === "all"
      ? topicsBySubject
      : topicsBySubject.filter((s) => s.id === selectedSubject);

  // Handlers
  const handleAddContent = (topicId: string) => {
    setSelectedTopicId(topicId);
    setIsAddContentOpen(true);
  };

  const handleCreateContent = (data: {
    content_type: string;
    content_title: string;
    content_url: string;
  }) => {
    if (!selectedTopicId) return;

    createContent.mutate(
      {
        topic_id: selectedTopicId,
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
          setSelectedTopicId(null);
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

  const handleDeleteTopic = () => {
    if (!deleteTopicId) return;

    deleteTopic.mutate(deleteTopicId, {
      onSuccess: () => {
        toast({ title: "Success", description: "Topic deleted successfully" });
        setDeleteTopicId(null);
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

  // Get selected items for dialogs
  const selectedTopic = deleteTopicId
    ? topics?.find((t) => t.id === deleteTopicId)
    : null;
  const selectedContent = deleteContentId
    ? topicContents?.find((c) => c.id === deleteContentId)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading topics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Topics & Content
            </h1>
            <p className="text-muted-foreground">
              Manage your curriculum topics and learning materials
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        )}
      </div>

      {/* Subject Filter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-64">
            <Label className="text-muted-foreground">Filter by Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {(subjects || []).map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Topics List by Subject */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No subjects found. Add subjects first to create topics.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                {subject.subject_name}
              </h2>
              {subject.topics.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No topics for this subject yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {subject.topics.map((topic) => (
                    <TopicItem
                      key={topic.id}
                      topic={topic}
                      contents={getTopicContents(topic.id)}
                      isExpanded={expandedTopics.includes(topic.id)}
                      onToggle={() => toggleTopic(topic.id)}
                      onAddContent={() => handleAddContent(topic.id)}
                      onDeleteTopic={() => setDeleteTopicId(topic.id)}
                      onDeleteContent={(contentId) =>
                        setDeleteContentId(contentId)
                      }
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Content Dialog */}
      <AddContentDialog
        open={isAddContentOpen}
        onOpenChange={(open) => {
          setIsAddContentOpen(open);
          if (!open) setSelectedTopicId(null);
        }}
        onSubmit={handleCreateContent}
        isPending={createContent.isPending}
      />

      {/* Delete Topic Dialog */}
      <DeleteTopicDialog
        open={!!deleteTopicId}
        onOpenChange={(open) => !open && setDeleteTopicId(null)}
        onConfirm={handleDeleteTopic}
        topicName={selectedTopic?.topic_name}
      />

      {/* Delete Content Dialog */}
      <DeleteContentDialog
        open={!!deleteContentId}
        onOpenChange={(open) => !open && setDeleteContentId(null)}
        onConfirm={handleDeleteContent}
        contentTitle={selectedContent?.content_title}
      />

      {/* Form Dialog */}
      <TopicFormDialog
        open={showModal}
        onOpenChange={handleModalClose}
        editId={editId}
        defaultSubjectId={selectedSubject !== "all" ? selectedSubject : undefined}
      />
    </div>
  );
}
