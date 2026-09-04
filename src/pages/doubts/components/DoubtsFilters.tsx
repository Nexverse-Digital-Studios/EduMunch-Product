import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DoubtsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  subjectFilter: string;
  onSubjectChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

export const DoubtsFilters = ({
  searchQuery,
  onSearchChange,
  subjectFilter,
  onSubjectChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
  onClearFilters,
}: DoubtsFiltersProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions, students..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Subject</label>
        <Select value={subjectFilter} onValueChange={onSubjectChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="math">Math</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
            <SelectItem value="biology">Biology</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Status</label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Sort</label>
        <div className="flex gap-2">
          <Select value={sortOrder} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2 whitespace-nowrap"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
