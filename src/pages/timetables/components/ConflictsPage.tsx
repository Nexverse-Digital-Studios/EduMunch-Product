/**
 * Schedule Conflicts Page
 * ========================
 * View and resolve scheduling conflicts
 */

import { useState } from "react";
import {
  AlertTriangle,
  Users,
  Clock,
  MapPin,
  Check,
  X,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";

interface Conflict {
  id: string;
  type: "teacher" | "room" | "section";
  severity: "high" | "medium" | "low";
  description: string;
  details: {
    resource: string;
    day: string;
    time: string;
    entries: {
      id: string;
      section: string;
      subject: string;
      teacher: string;
      room: string;
    }[];
  };
  resolved: boolean;
}

// Mock conflict data
const mockConflicts: Conflict[] = [
  {
    id: "1",
    type: "teacher",
    severity: "high",
    description: "Teacher assigned to multiple classes at the same time",
    details: {
      resource: "Mr. John Smith",
      day: "Monday",
      time: "09:00 - 10:00",
      entries: [
        {
          id: "e1",
          section: "Class 10-A",
          subject: "Mathematics",
          teacher: "Mr. John Smith",
          room: "Room 101",
        },
        {
          id: "e2",
          section: "Class 9-B",
          subject: "Mathematics",
          teacher: "Mr. John Smith",
          room: "Room 203",
        },
      ],
    },
    resolved: false,
  },
  {
    id: "2",
    type: "room",
    severity: "medium",
    description: "Multiple classes scheduled in the same room",
    details: {
      resource: "Physics Lab",
      day: "Tuesday",
      time: "11:00 - 12:00",
      entries: [
        {
          id: "e3",
          section: "Class 11-A",
          subject: "Physics Practical",
          teacher: "Dr. Sarah Lee",
          room: "Physics Lab",
        },
        {
          id: "e4",
          section: "Class 12-B",
          subject: "Physics Practical",
          teacher: "Mr. Robert Brown",
          room: "Physics Lab",
        },
      ],
    },
    resolved: false,
  },
  {
    id: "3",
    type: "section",
    severity: "low",
    description: "Section has back-to-back classes without break",
    details: {
      resource: "Class 8-C",
      day: "Wednesday",
      time: "10:00 - 13:00",
      entries: [
        {
          id: "e5",
          section: "Class 8-C",
          subject: "English",
          teacher: "Mrs. Emily Davis",
          room: "Room 105",
        },
        {
          id: "e6",
          section: "Class 8-C",
          subject: "History",
          teacher: "Mr. Michael Wilson",
          room: "Room 105",
        },
        {
          id: "e7",
          section: "Class 8-C",
          subject: "Geography",
          teacher: "Ms. Anna Taylor",
          room: "Room 105",
        },
      ],
    },
    resolved: false,
  },
];

const ConflictsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canUpdate } = useModulePermissions("timetable");

  const [conflicts, setConflicts] = useState<Conflict[]>(mockConflicts);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(
    null
  );
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const filteredConflicts = conflicts.filter((conflict) => {
    const matchesType = filterType === "all" || conflict.type === filterType;
    const matchesSeverity =
      filterSeverity === "all" || conflict.severity === filterSeverity;
    return matchesType && matchesSeverity && !conflict.resolved;
  });

  const resolvedCount = conflicts.filter((c) => c.resolved).length;
  const unresolvedCount = conflicts.filter((c) => !c.resolved).length;

  const handleResolve = (conflictId: string) => {
    setConflicts(
      conflicts.map((c) => (c.id === conflictId ? { ...c, resolved: true } : c))
    );
    setShowResolveDialog(false);
    setSelectedConflict(null);
    toast({
      title: "Conflict Resolved",
      description: "The scheduling conflict has been marked as resolved.",
    });
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case "teacher":
        return <Users className="h-5 w-5" />;
      case "room":
        return <MapPin className="h-5 w-5" />;
      case "section":
        return <Clock className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to view conflicts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Schedule Conflicts
        </h1>
        <p className="text-muted-foreground">
          View and resolve scheduling conflicts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conflicts</p>
                <p className="text-3xl font-bold">{conflicts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unresolved</p>
                <p className="text-3xl font-bold text-red-500">
                  {unresolvedCount}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-500">
                  {resolvedCount}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Conflict Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="teacher">Teacher Conflicts</SelectItem>
                <SelectItem value="room">Room Conflicts</SelectItem>
                <SelectItem value="section">Section Conflicts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts List */}
      <div className="space-y-4">
        {filteredConflicts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">No Conflicts Found</h3>
              <p className="text-muted-foreground">
                All scheduling conflicts have been resolved.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConflicts.map((conflict) => (
            <Card key={conflict.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getConflictIcon(conflict.type)}
                    <div>
                      <CardTitle className="text-lg">
                        {conflict.description}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {conflict.details.day} • {conflict.details.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(conflict.severity)}>
                    {conflict.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">
                    Conflicting Resource: {conflict.details.resource}
                  </p>
                  <div className="space-y-1">
                    {conflict.details.entries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="text-sm flex items-center gap-2"
                      >
                        <span className="font-mono text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span>
                          {entry.section} - {entry.subject}
                        </span>
                        <span className="text-muted-foreground">
                          ({entry.teacher}, {entry.room})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {canUpdate && (
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={() => {
                        setSelectedConflict(conflict);
                        setShowResolveDialog(true);
                      }}
                    >
                      Resolve Conflict
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Conflict</DialogTitle>
            <DialogDescription>
              Choose how to resolve this scheduling conflict.
            </DialogDescription>
          </DialogHeader>
          {selectedConflict && (
            <div className="space-y-4">
              <p className="text-sm">{selectedConflict.description}</p>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">
                  {selectedConflict.details.resource}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedConflict.details.day} •{" "}
                  {selectedConflict.details.time}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedConflict && handleResolve(selectedConflict.id)
              }
            >
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConflictsPage;
