/**
 * Classes Management Page - EduMunch
 * ====================================
 * 
 * School-centric class management (Class 1, 2, 3... 12)
 * Based on classes_1EMAET schema table
 * 
 * Features:
 * - Create/Edit/Delete classes
 * - View class order (for sorting)
 * - Manage class-subject mappings
 */

import { useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  GraduationCap, 
  Loader2,
  BookOpen,
  MoreVertical,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";

// Database type matching schema
interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
  class_order: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form state
interface ClassFormData {
  class_name: string;
  class_code: string;
  class_order: string;
  description: string;
  is_active: boolean;
}

const initialFormData: ClassFormData = {
  class_name: "",
  class_code: "",
  class_order: "",
  description: "",
  is_active: true,
};

const Classes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassDB | null>(null);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClassFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { canCreate, canUpdate, canDelete } = useModulePermissions('classes');

  // Fetch classes from Supabase
  const { 
    data: classes, 
    isLoading, 
    error, 
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useSupabaseTable<ClassDB>(
    TABLES.CLASSES,
    { orderBy: { column: 'class_order', ascending: true } }
  );

  // Open modal for creating new class
  const openCreateModal = () => {
    setFormData(initialFormData);
    setEditingClass(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (classItem: ClassDB) => {
    setEditingClass(classItem);
    setFormData({
      class_name: classItem.class_name,
      class_code: classItem.class_code,
      class_order: classItem.class_order?.toString() || "",
      description: classItem.description || "",
      is_active: classItem.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.class_name || !formData.class_code) {
      toast({
        title: "Validation Error",
        description: "Class name and code are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        class_name: formData.class_name,
        class_code: formData.class_code.toUpperCase().replace(/\s+/g, '_'),
        class_order: formData.class_order ? parseInt(formData.class_order) : null,
        description: formData.description || null,
        is_active: formData.is_active,
      };

      if (editingClass) {
        await updateMutation.mutateAsync({
          id: editingClass.id,
          updates: payload,
        });
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: "Success",
          description: "Class created successfully",
        });
      }

      setIsModalOpen(false);
      refetch();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteClassId) return;

    try {
      await deleteMutation.mutateAsync(deleteClassId);
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
    setDeleteClassId(null);
  };

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading classes</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Classes</h1>
            <p className="text-sm text-muted-foreground">
              Manage school classes (e.g., Class 1, Class 2, ... Class 12)
            </p>
          </div>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{classes?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {classes?.filter(c => c.is_active).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!classes || classes.length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first class.
          </p>
          {canCreate && (
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          )}
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && classes && classes.length > 0 && (
        <Card>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16">
                    <ArrowUpDown className="h-4 w-4" />
                  </TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.id} className="hover:bg-muted/20">
                    <TableCell className="text-muted-foreground text-sm">
                      {classItem.class_order || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{classItem.class_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classItem.class_code}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {classItem.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={classItem.is_active ? "default" : "secondary"}>
                        {classItem.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => openEditModal(classItem)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem 
                              onClick={() => setDeleteClassId(classItem.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {classes.map((classItem) => (
              <div key={classItem.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{classItem.class_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {classItem.class_code}
                        </Badge>
                        <Badge 
                          variant={classItem.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {classItem.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canUpdate && (
                        <DropdownMenuItem onClick={() => openEditModal(classItem)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem 
                          onClick={() => setDeleteClassId(classItem.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {classItem.description && (
                  <p className="text-sm text-muted-foreground">
                    {classItem.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {editingClass ? "Edit Class" : "Create New Class"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="class_name">Class Name *</Label>
              <Input
                id="class_name"
                placeholder="e.g., Class 1, Class 10"
                value={formData.class_name}
                onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_code">Class Code *</Label>
                <Input
                  id="class_code"
                  placeholder="e.g., C1, C10"
                  value={formData.class_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_order">Display Order</Label>
                <Input
                  id="class_order"
                  type="number"
                  placeholder="e.g., 1, 2, 10"
                  value={formData.class_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_order: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for this class"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="is_active" className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive classes won't appear in dropdowns
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingClass ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteClassId} onOpenChange={() => setDeleteClassId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class 
              and may affect related sections and student assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Classes;
