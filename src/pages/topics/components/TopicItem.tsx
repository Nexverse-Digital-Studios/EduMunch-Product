/**
 * TopicItem Component
 * ====================
 * Collapsible topic item with content management
 * Used in TopicsList page
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Database types
export interface TopicDB {
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

export interface TopicContentDB {
  id: string;
  topic_id: string;
  content_type: "PDF" | "Video" | "Link" | "Document" | "Image" | "Quiz";
  content_title: string;
  content_url?: string;
  description?: string;
  display_order?: number;
  uploaded_by?: string;
  created_at: string;
}

interface TopicItemProps {
  topic: TopicDB;
  contents: TopicContentDB[];
  isExpanded: boolean;
  onToggle: () => void;
  onAddContent: () => void;
  onDeleteTopic: () => void;
  onDeleteContent: (contentId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
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

export const TopicItem = ({
  topic,
  contents,
  isExpanded,
  onToggle,
  onAddContent,
  onDeleteTopic,
  onDeleteContent,
  canUpdate,
  canDelete,
}: TopicItemProps) => {
  const navigate = useNavigate();

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
              <div className="text-left">
                <h3 className="font-medium text-foreground">
                  {topic.topic_name}
                </h3>
                {topic.description && (
                  <p className="text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {contents.length} items
              </Badge>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canUpdate && (
                  <>
                    <Button size="sm" variant="outline" onClick={onAddContent}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/topics/${topic.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {canDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={onDeleteTopic}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
                      <span className="text-sm text-foreground">
                        {content.content_title}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {canUpdate && (
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onDeleteContent(content.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default TopicItem;
