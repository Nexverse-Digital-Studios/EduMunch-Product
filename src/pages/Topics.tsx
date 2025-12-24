import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronRight, FileText, Video, Link as LinkIcon, File } from "lucide-react";
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

interface Topic {
  id: string;
  name: string;
  description?: string;
  contentCount: number;
  contents: TopicContent[];
}

interface TopicContent {
  id: string;
  type: "video" | "document" | "link" | "file";
  title: string;
  url?: string;
}

interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

const subjectsWithTopics: Subject[] = [
  {
    id: "1",
    name: "Biology",
    topics: [
      { 
        id: "1", 
        name: "Cell Structure", 
        description: "Introduction to cell biology",
        contentCount: 3,
        contents: [
          { id: "c1", type: "video", title: "Cell Structure Overview" },
          { id: "c2", type: "document", title: "Cell Diagram PDF" },
          { id: "c3", type: "link", title: "Interactive Cell Model" },
        ]
      },
      { 
        id: "2", 
        name: "Animal Kingdom", 
        contentCount: 2,
        contents: [
          { id: "c4", type: "video", title: "Classification Video" },
          { id: "c5", type: "document", title: "Animal Kingdom Notes" },
        ]
      },
      { 
        id: "3", 
        name: "Plant Physiology", 
        contentCount: 1,
        contents: [
          { id: "c6", type: "file", title: "Plant Processes.pptx" },
        ]
      },
    ]
  },
  {
    id: "2",
    name: "Chemistry",
    topics: [
      { 
        id: "4", 
        name: "Organic Chemistry", 
        contentCount: 4,
        contents: [
          { id: "c7", type: "video", title: "Organic Basics" },
          { id: "c8", type: "document", title: "Reaction Mechanisms" },
          { id: "c9", type: "link", title: "Practice Problems" },
          { id: "c10", type: "video", title: "Advanced Concepts" },
        ]
      },
      { 
        id: "5", 
        name: "Inorganic Chemistry", 
        contentCount: 2,
        contents: [
          { id: "c11", type: "document", title: "Periodic Table Guide" },
          { id: "c12", type: "video", title: "Bonding Types" },
        ]
      },
    ]
  },
  {
    id: "3",
    name: "Physics",
    topics: [
      { 
        id: "6", 
        name: "Mechanics", 
        contentCount: 5,
        contents: [
          { id: "c13", type: "video", title: "Newton's Laws" },
          { id: "c14", type: "document", title: "Formula Sheet" },
          { id: "c15", type: "link", title: "Simulation Lab" },
          { id: "c16", type: "video", title: "Problem Solving" },
          { id: "c17", type: "file", title: "Practice Problems.pdf" },
        ]
      },
      { 
        id: "7", 
        name: "Thermodynamics", 
        contentCount: 3,
        contents: [
          { id: "c18", type: "video", title: "Heat Transfer" },
          { id: "c19", type: "document", title: "Laws of Thermodynamics" },
          { id: "c20", type: "link", title: "Virtual Experiments" },
        ]
      },
    ]
  },
  {
    id: "4",
    name: "Math",
    topics: [
      { 
        id: "8", 
        name: "Calculus", 
        contentCount: 4,
        contents: []
      },
      { 
        id: "9", 
        name: "Algebra", 
        contentCount: 3,
        contents: []
      },
      { 
        id: "10", 
        name: "Trigonometry", 
        contentCount: 2,
        contents: []
      },
    ]
  },
];

const Topics = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getContentIcon = (type: TopicContent["type"]) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-red-500" />;
      case "document": return <FileText className="h-4 w-4 text-blue-500" />;
      case "link": return <LinkIcon className="h-4 w-4 text-green-500" />;
      case "file": return <File className="h-4 w-4 text-orange-500" />;
    }
  };

  const filteredSubjects = selectedSubject === "all" 
    ? subjectsWithTopics 
    : subjectsWithTopics.filter(s => s.id === selectedSubject);

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
                {subjectsWithTopics.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Topics List by Subject */}
      <div className="space-y-6">
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              {subject.name}
            </h2>
            <div className="space-y-3">
              {subject.topics.map((topic) => (
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
                            <h3 className="font-medium text-foreground">{topic.name}</h3>
                            {topic.description && (
                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {topic.contentCount} items
                          </Badge>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" onClick={() => setIsAddContentOpen(true)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border bg-muted/10 p-4">
                        {topic.contents.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No content added yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {topic.contents.map((content) => (
                              <div 
                                key={content.id} 
                                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                              >
                                <div className="flex items-center gap-3">
                                  {getContentIcon(content.type)}
                                  <span className="text-sm text-foreground">{content.title}</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" className="h-7 w-7">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
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
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Topic Modal */}
      <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectsWithTopics.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input placeholder="Enter topic name" />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea placeholder="Enter description" rows={3} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddTopicOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Add Topic</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Content Modal */}
      <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Enter content title" />
            </div>
            <div className="space-y-2">
              <Label>URL / File</Label>
              <Input placeholder="Enter URL or upload file" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddContentOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Add Content</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Topics;