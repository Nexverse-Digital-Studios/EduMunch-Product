/**
 * StudentIDCards Component
 * ========================
 * List and generate student ID cards
 */

import { useState, useMemo, useRef } from "react";
import {
  Users,
  Search,
  Filter,
  CreditCard,
  Printer,
  Download,
  CheckSquare,
  Square,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  StudentForIDCard,
  ClassInfo,
  SectionInfo,
  DEFAULT_STUDENT_TEMPLATE,
} from "./types";
import { IDCardPreview } from ".";

const INDEX_TOKEN = "1emaet";

interface StudentIDCardsProps {
  embedded?: boolean;
}

export function StudentIDCards({ embedded = false }: StudentIDCardsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewStudent, setPreviewStudent] = useState<StudentForIDCard | null>(
    null
  );

  const { canCreate } = useModulePermissions("id_cards");
  const { toast } = useToast();

  // Fetch students
  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentForIDCard>(`students_${INDEX_TOKEN}`, {
      filters: {},
    });

  // Fetch classes
  const { data: classes } = useSupabaseTable<ClassInfo>(
    `classes_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch sections
  const { data: sections } = useSupabaseTable<SectionInfo>(
    `sections_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Create lookup maps
  const classMap = useMemo(() => {
    if (!classes) return new Map<string, ClassInfo>();
    return new Map(classes.map((c) => [c.id, c]));
  }, [classes]);

  const sectionMap = useMemo(() => {
    if (!sections) return new Map<string, SectionInfo>();
    return new Map(sections.map((s) => [s.id, s]));
  }, [sections]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students
      .filter((s) => s.status === "active")
      .filter((student) => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          student.first_name.toLowerCase().includes(searchLower) ||
          student.last_name.toLowerCase().includes(searchLower) ||
          student.admission_number.toLowerCase().includes(searchLower);

        // Class filter
        const matchesClass =
          classFilter === "all" || student.class_id === classFilter;

        // Section filter
        const matchesSection =
          sectionFilter === "all" || student.section_id === sectionFilter;

        return matchesSearch && matchesClass && matchesSection;
      });
  }, [students, searchQuery, classFilter, sectionFilter]);

  // Filter sections by class
  const filteredSections = useMemo(() => {
    if (!sections || classFilter === "all") return sections || [];
    return sections.filter((s) => s.class_id === classFilter);
  }, [sections, classFilter]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleGenerateSelected = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to generate ID cards.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating ID Cards",
      description: `Generating ${selectedIds.size} ID card(s)...`,
    });

    // In a real app, this would trigger PDF generation
    // For now, we'll open print dialog
    window.print();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (loadingStudents) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {!embedded && (
          <div>
            <h1 className="text-2xl font-bold">Student ID Cards</h1>
            <p className="text-muted-foreground">
              Generate and manage student identification cards
            </p>
          </div>
        )}
        {canCreate && selectedIds.size > 0 && (
          <Button onClick={handleGenerateSelected}>
            <Printer className="mr-2 h-4 w-4" />
            Generate Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={classFilter}
              onValueChange={(v) => {
                setClassFilter(v);
                setSectionFilter("all");
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {filteredSections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    Section {sec.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Actions */}
      {canCreate && (
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedIds.size === filteredStudents.length ? (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                Select All ({filteredStudents.length})
              </>
            )}
          </Button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} student(s) selected
            </span>
          )}
        </div>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {canCreate && <TableHead className="w-12"></TableHead>}
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const classInfo = classMap.get(student.class_id);
                  const sectionInfo = sectionMap.get(student.section_id);

                  return (
                    <TableRow key={student.id}>
                      {canCreate && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(student.id)}
                            onCheckedChange={() => handleSelect(student.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.photo_url || undefined} />
                            <AvatarFallback>
                              {getInitials(
                                student.first_name,
                                student.last_name
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {student.first_name} {student.last_name}
                            </p>
                            {student.roll_number && (
                              <p className="text-xs text-muted-foreground">
                                Roll: {student.roll_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.admission_number}</TableCell>
                      <TableCell>
                        {classInfo && sectionInfo ? (
                          <Badge variant="outline">
                            {classInfo.class_name} - {sectionInfo.section_name}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {student.blood_group ? (
                          <Badge variant="secondary">
                            {student.blood_group}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canCreate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedIds(new Set([student.id]));
                                handleGenerateSelected();
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewStudent}
        onOpenChange={() => setPreviewStudent(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ID Card Preview</DialogTitle>
          </DialogHeader>
          {previewStudent && (
            <IDCardPreview
              type="student"
              data={previewStudent}
              design={DEFAULT_STUDENT_TEMPLATE}
              classInfo={classMap.get(previewStudent.class_id)}
              sectionInfo={sectionMap.get(previewStudent.section_id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
