/**
 * Academic Years List Page
 * =========================
 * List and manage academic years
 * Route: /academic-years
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Search,
  CheckCircle,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type { AcademicYearDB } from "./types";

const AcademicYearsList = () => {
  const { toast } = useToast();
  const { canCreate, canUpdate, canDelete } =
    useModulePermissions("academic_years");

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch academic years
  const {
    data: academicYears,
    isLoading,
    refetch,
  } = useSupabaseTable<AcademicYearDB>(TABLES.ACADEMIC_YEARS);

  // Filter academic years
  const filteredYears = useMemo(() => {
    if (!academicYears) return [];

    return academicYears
      .filter((year) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          year.year_name.toLowerCase().includes(query) ||
          year.year_code.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        // Current year first, then by start date descending
        if (a.is_current && !b.is_current) return -1;
        if (!a.is_current && b.is_current) return 1;
        return (
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
      });
  }, [academicYears, searchQuery]);

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      // In real implementation, call Supabase to delete
      console.log("Deleting academic year:", id);
      toast({
        title: "Academic year deleted",
        description: "The academic year has been deleted successfully.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete academic year.",
        variant: "destructive",
      });
    }
  };

  // Handle set as current
  const handleSetCurrent = async (id: string) => {
    try {
      // In real implementation, call Supabase to update
      console.log("Setting academic year as current:", id);
      toast({
        title: "Current year updated",
        description: "The academic year has been set as current.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set current academic year.",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get current year
  const currentYear = academicYears?.find((y) => y.is_current);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Years</h1>
          <p className="text-muted-foreground">
            Manage academic year configurations
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/academic-years/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Academic Year
            </Link>
          </Button>
        )}
      </div>

      {/* Current Year Info */}
      {currentYear && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Current Academic Year</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold">{currentYear.year_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentYear.start_date)} -{" "}
                  {formatDate(currentYear.end_date)}
                </p>
              </div>
              <Badge variant="default">{currentYear.year_code}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search academic years..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Years Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Academic Years
          </CardTitle>
          <CardDescription>
            {filteredYears.length} academic year(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading academic years...
            </div>
          ) : filteredYears.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No academic years found
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell>
                        <Link
                          to={`/academic-years/${year.id}`}
                          className="font-medium hover:underline"
                        >
                          {year.year_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{year.year_code}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(year.start_date)} -{" "}
                        {formatDate(year.end_date)}
                      </TableCell>
                      <TableCell>
                        {year.is_current ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Current
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {canUpdate && !year.is_current && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSetCurrent(year.id)}
                              title="Set as current"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          {canUpdate && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/academic-years/${year.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canDelete && !year.is_current && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Academic Year
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {year.year_name}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(year.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicYearsList;
