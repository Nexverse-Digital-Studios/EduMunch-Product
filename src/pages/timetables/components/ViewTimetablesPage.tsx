/**
 * View Timetables Page
 * =====================
 * Browse and view all section timetables
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Edit, Calendar, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
  class_id: string;
  max_students?: number;
}

interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
}

const ViewTimetablesPage = () => {
  const navigate = useNavigate();
  const { canView, canUpdate } = useModulePermissions("timetable");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Fetch sections
  const { data: sectionsData, isLoading: sectionsLoading } =
    useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
      orderBy: { column: "section_name", ascending: true },
    });

  // Fetch classes
  const { data: classesData } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "class_name", ascending: true },
  });

  const sections = sectionsData || [];
  const classes = classesData || [];

  // Filter sections
  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.section_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.section_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClass === "all" || section.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Get class name by ID
  const getClassName = (classId: string) => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem?.class_name || "N/A";
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to view timetables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">View Timetables</h1>
          <p className="text-muted-foreground">Browse timetables by section</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/timetable">
            <Calendar className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sections ({filteredSections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sectionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sections found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Max Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">
                      {section.section_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{section.section_code}</Badge>
                    </TableCell>
                    <TableCell>{getClassName(section.class_id)}</TableCell>
                    <TableCell>{section.max_students || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/timetable/view/${section.id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {canUpdate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/timetable/${section.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewTimetablesPage;
