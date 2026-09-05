import { Plus, Pencil, Trash2, RefreshCw, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ExamType } from "./types";

interface TemplatesTabProps {
  examType: "board" | "competitive";
  templates: ExamType[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onAddTemplate: () => void;
  onEditTemplate: (template: ExamType) => void;
  onDeleteTemplate: (id: string) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isDeleting: boolean;
}

export const TemplatesTab = ({
  examType,
  templates,
  isLoading,
  searchQuery,
  onSearchChange,
  onRefresh,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  canCreate,
  canUpdate,
  canDelete,
  isDeleting,
}: TemplatesTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">
          {examType === "competitive"
            ? "Competitive Exam Templates"
            : "Test Templates"}
        </h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canCreate && (
            <Button
              onClick={onAddTemplate}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">
                      {template.exam_type_name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={
                        template.is_active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {template.exam_type_code}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.description || "No description"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canUpdate && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => onEditTemplate(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteTemplate(template.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No templates found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
