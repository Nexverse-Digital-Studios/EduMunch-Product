import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronRight, FileText, Video, Link as LinkIcon, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Database types
interface TopicDB {
  id: string;
  subject_id: string;
  topic_name: string;
  topic_code?: string;
  description?: string;
  parent_topic_id?: string;
  display_order?: number;
  estimated_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TopicContentDB {
  id: string;
  topic_id: string;
  content_type: 'PDF' | 'Video' | 'Link' | 'Document' | 'Image' | 'Quiz';
  content_title: string;
  content_url?: string;
  description?: string;
  display_order?: number;
  uploaded_by?: string;
  created_at: string;
}

interface SubjectDB {
  id: string;
  subject_name: string;
  subject_code: string;
  is_active: boolean;
}

const Topics = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  
  // Form state
  const [newTopic, setNewTopic] = useState({ subject_id: '', topic_name: '', description: '' });
  const [newContent, setNewContent] = useState({ content_type: '', content_title: '', content_url: '' });
  
  const { toast } = useToast();
  
  // Fetch data from Supabase
  const { data: subjects, isLoading: loadingSubjects } = useSupabaseTable<SubjectDB>(
    TABLES.SUBJECTS,
    { orderBy: { column: 'subject_name', ascending: true } }
  );
  
  const { 
    data: topics, 
    isLoading: loadingTopics, 
    createMutation: createTopic,
    deleteMutation: deleteTopic 
  } = useSupabaseTable<TopicDB>(
    TABLES.TOPICS,
    { orderBy: { column: 'display_order', ascending: true } }
  );
  
  const { 
    data: topicContents, 
    isLoading: loadingContents,
    createMutation: createContent,
    deleteMutation: deleteContent 
  } = useSupabaseTable<TopicContentDB>(
    TABLES.TOPIC_CONTENT,
    { orderBy: { column: 'display_order', ascending: true } }
  );
  
  const isLoading = loadingSubjects || loadingTopics || loadingContents;

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getContentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video": return <Video className="h-4 w-4 text-red-500" />;
      case "pdf":
      case "document": return <FileText className="h-4 w-4 text-blue-500" />;
      case "link": return <LinkIcon className="h-4 w-4 text-green-500" />;
      default: return <File className="h-4 w-4 text-orange-500" />;
    }
  };

  // Group topics by subject
  const topicsBySubject = (subjects || []).map(subject => ({
    ...subject,
    topics: (topics || []).filter(t => t.subject_id === subject.id && t.is_active)
  }));
  
  // Get contents for a topic
  const getTopicContents = (topicId: string) => 
    (topicContents || []).filter(c => c.topic_id === topicId);

  const filteredSubjects = selectedSubject === "all" 
    ? topicsBySubject 
    : topicsBySubject.filter(s => s.id === selectedSubject);
    
  // Handlers
  const handleCreateTopic = () => {
    if (!newTopic.subject_id || !newTopic.topic_name.trim()) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    
    createTopic.mutate({
      subject_id: newTopic.subject_id,
      topic_name: newTopic.topic_name.trim(),
      description: newTopic.description.trim() || null,
      is_active: true
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Topic created successfully" });
        setIsAddTopicOpen(false);
        setNewTopic({ subject_id: '', topic_name: '', description: '' });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleCreateContent = () => {
    if (!selectedTopicId || !newContent.content_type || !newContent.content_title.trim()) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    
    createContent.mutate({
      topic_id: selectedTopicId,
      content_type: newContent.content_type,
      content_title: newContent.content_title.trim(),
      content_url: newContent.content_url.trim() || null
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Content added successfully" });
        setIsAddContentOpen(false);
        setNewContent({ content_type: '', content_title: '', content_url: '' });
        setSelectedTopicId(null);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleDeleteTopic = () => {
    if (!deleteTopicId) return;
    
    deleteTopic.mutate(deleteTopicId, {
      onSuccess: () => {
        toast({ title: "Success", description: "Topic deleted successfully" });
        setDeleteTopicId(null);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleDeleteContent = () => {
    if (!deleteContentId) return;
    
    deleteContent.mutate(deleteContentId, {
      onSuccess: () => {
        toast({ title: "Success", description: "Content deleted successfully" });
        setDeleteContentId(null);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Topics & Content</h1>
        </div>
        <Button onClick={() => setIsAddTopicOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
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
                  <SelectItem key={subject.id} value={subject.id}>{subject.subject_name}</SelectItem>
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
              <p className="text-sm text-muted-foreground py-4">No topics for this subject yet.</p>
            ) : (
            <div className="space-y-3">
              {subject.topics.map((topic) => {
                const contents = getTopicContents(topic.id);
                return (
                <Collapsible 
                  key={topic.id} 
                  open={expandedTopics.includes(topic.id)}
                  onOpenChange={() => toggleTopic(topic.id)}
                >
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <ChevronRight 
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              expandedTopics.includes(topic.id) ? "rotate-90" : ""
                            }`} 
                          />
                          <div className="text-left">
                            <h3 className="font-medium text-foreground">{topic.topic_name}</h3>
                            {topic.description && (
                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {contents.length} items
                          </Badge>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedTopicId(topic.id);
                              setIsAddContentOpen(true);
                            }}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTopicId(topic.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border bg-muted/10 p-4">
                        {contents.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No content added yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {contents.map((content) => (
                              <div 
                                key={content.id} 
                                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                              >
                                <div className="flex items-center gap-3">
                                  {getContentIcon(content.content_type)}
                                  <span className="text-sm text-foreground">{content.content_title}</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" className="h-7 w-7">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => setDeleteContentId(content.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )})}
            </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Add Topic Modal */}
      <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select 
                value={newTopic.subject_id} 
                onValueChange={(val) => setNewTopic(prev => ({ ...prev, subject_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {(subjects || []).map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.subject_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input 
                placeholder="Enter topic name" 
                value={newTopic.topic_name}
                onChange={(e) => setNewTopic(prev => ({ ...prev, topic_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea 
                placeholder="Enter description" 
                rows={3}
                value={newTopic.description}
                onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddTopicOpen(false)}>Cancel</Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleCreateTopic}
                disabled={createTopic.isPending}
              >
                {createTopic.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Topic
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Content Modal */}
      <Dialog open={isAddContentOpen} onOpenChange={(open) => {
        setIsAddContentOpen(open);
        if (!open) setSelectedTopicId(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select 
                value={newContent.content_type}
                onValueChange={(val) => setNewContent(prev => ({ ...prev, content_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Link">Link</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                placeholder="Enter content title" 
                value={newContent.content_title}
                onChange={(e) => setNewContent(prev => ({ ...prev, content_title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>URL / File</Label>
              <Input 
                placeholder="Enter URL or upload file" 
                value={newContent.content_url}
                onChange={(e) => setNewContent(prev => ({ ...prev, content_url: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddContentOpen(false)}>Cancel</Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleCreateContent}
                disabled={createContent.isPending}
              >
                {createContent.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Content
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Topic Confirmation */}
      <AlertDialog open={!!deleteTopicId} onOpenChange={(open) => !open && setDeleteTopicId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic? This will also delete all content within this topic.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopic} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Content Confirmation */}
      <AlertDialog open={!!deleteContentId} onOpenChange={(open) => !open && setDeleteContentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContent} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Topics;