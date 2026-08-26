/**
 * Fee Structures List Page
 * =========================
 * List all fee structures with management options
 * 
 * CONSOLIDATED: Create/Edit via modal dialogs (no sub-routes)
 */

import { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { FeeStructureDB } from "./types";
import { FeeStructureFormDialog } from "./FeeStructureFormDialog";
import { FeeStructureDetailDialog } from "./FeeStructureDetailDialog";

const INDEX_TOKEN = "1emaet";

interface FeeStructuresListProps {
  embedded?: boolean;
}

interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

export function FeeStructuresList({ embedded = false }: FeeStructuresListProps) {
  const { toast } = useToast();
  const { canView, canCreate, canUpdate, canDelete } =
    useModulePermissions("fees");

  // Modal states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructureDB | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState<FeeStructureDB | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Handlers
  const handleCreate = () => {
    setSelectedStructure(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (structure: FeeStructureDB) => {
    setSelectedStructure(structure);
    setFormDialogOpen(true);
  };

  const handleView = (structure: FeeStructureDB) => {
    setSelectedStructure(structure);
    setDetailDialogOpen(true);
  };

  const {
    data: feeStructures,
    isLoading,
    error,
    refetch,
    deleteMutation,
  } = useSupabaseTable<FeeStructureDB>(`fee_structures_${INDEX_TOKEN}`, {
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    {
      orderBy: { column: "class_order", ascending: true },
    }
  );

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "Unknown";
  };

  const getYearName = (yearId: string) => {
    const year = academicYears?.find((y) => y.id === yearId);
    return year?.year_name || "Unknown";
  };

  const filteredStructures = feeStructures?.filter((structure) => {
    const matchesSearch = structure.structure_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || structure.class_id === selectedClass;
    const matchesYear =
      selectedYear === "all" || structure.academic_year_id === selectedYear;
    return matchesSearch && matchesClass && matchesYear;
  });

  const handleDelete = async () => {
    if (!structureToDelete) return;
    try {
      await deleteMutation.mutateAsync(structureToDelete.id);
      toast({
        title: "Fee structure deleted",
        description: "The fee structure has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setStructureToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete fee structure.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view fee structures.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">
            Error loading fee structures: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalStructures = feeStructures?.length || 0;
  const activeStructures =
    feeStructures?.filter((f) => f.is_active).length || 0;
  const totalRevenue =
    feeStructures?.reduce((sum, f) => sum + f.total_amount, 0) || 0;

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fee Structures</h1>
            <p className="text-muted-foreground">
              Manage fee structures and components for each class
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {canCreate && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Structure
              </Button>
            )}
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Structure
            </Button>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Structures
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStructures}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Structures
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeStructures}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Fee Amount
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                totalStructures > 0 ? totalRevenue / totalStructures : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fee structures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by class" />
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
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.year_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredStructures && filteredStructures.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Structure Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell className="font-medium">
                        {structure.structure_name}
                      </TableCell>
                      <TableCell>{getClassName(structure.class_id)}</TableCell>
                      <TableCell>
                        {getYearName(structure.academic_year_id)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(structure.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            structure.is_active ? "default" : "secondary"
                          }
                        >
                          {structure.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(structure)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(structure)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setStructureToDelete(structure);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedClass !== "all" || selectedYear !== "all"
                ? "No fee structures match your filters."
                : "No fee structures found. Create one to get started."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{structureToDelete?.structure_name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialog for Create/Edit */}
      <FeeStructureFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editData={selectedStructure}
        onSuccess={() => refetch()}
      />

      {/* Detail Dialog for View */}
      <FeeStructureDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        structure={selectedStructure}
        classes={classes || []}
        academicYears={academicYears || []}
      />
    </div>
  );
}
