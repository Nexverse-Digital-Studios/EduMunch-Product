/**
 * Period Configuration Page
 * ==========================
 * Manage school period timings and configuration
 * Connected to database: timetable_periods_1EMAET
 */

import { useState } from "react";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  GripVertical,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

// Database schema matches: timetable_periods_1EMAET
interface PeriodDB {
  id: string;
  period_number: number;
  period_name: string | null;
  start_time: string;
  end_time: string;
  is_break: boolean;
  display_order: number | null;
  created_at?: string;
  updated_at?: string;
}

interface PeriodFormData {
  period_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
  is_break: boolean;
}

const PeriodsPage = () => {
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("timetable");

  // Fetch periods from database
  const {
    data: periods = [],
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useSupabaseTable<PeriodDB>(TABLES.TIMETABLE_PERIODS, {
    orderBy: { column: "display_order", ascending: true },
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDB | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PeriodFormData>({
    period_name: "",
    period_number: 0,
    start_time: "",
    end_time: "",
    is_break: false,
  });

  const resetForm = () => {
    setFormData({
      period_name: "",
      period_number: 0,
      start_time: "",
      end_time: "",
      is_break: false,
    });
  };

  const handleAdd = async () => {
    if (!formData.period_name || !formData.start_time || !formData.end_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const maxDisplayOrder =
        periods.length > 0
          ? Math.max(...periods.map((p) => p.display_order || 0))
          : 0;

      await createMutation.mutateAsync({
        period_name: formData.period_name,
        period_number: formData.is_break ? 0 : formData.period_number,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_break: formData.is_break,
        display_order: maxDisplayOrder + 1,
      });

      setShowAddDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Period added successfully",
      });
      refetch();
    } catch (err) {
      console.error("Error adding period:", err);
      toast({
        title: "Error",
        description: "Failed to add period. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPeriod) return;

    if (!formData.period_name || !formData.start_time || !formData.end_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: selectedPeriod.id,
        updates: {
          period_name: formData.period_name,
          period_number: formData.is_break ? 0 : formData.period_number,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_break: formData.is_break,
        },
      });

      setShowEditDialog(false);
      setSelectedPeriod(null);
      resetForm();
      toast({
        title: "Success",
        description: "Period updated successfully",
      });
      refetch();
    } catch (err) {
      console.error("Error updating period:", err);
      toast({
        title: "Error",
        description: "Failed to update period. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPeriod) return;

    setIsSubmitting(true);
    try {
      await deleteMutation.mutateAsync(selectedPeriod.id);
      setShowDeleteDialog(false);
      setSelectedPeriod(null);
      toast({
        title: "Success",
        description: "Period deleted successfully",
      });
      refetch();
    } catch (err) {
      console.error("Error deleting period:", err);
      toast({
        title: "Error",
        description:
          "Failed to delete period. It may be in use by timetable entries.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (period: PeriodDB) => {
    setSelectedPeriod(period);
    setFormData({
      period_name: period.period_name || "",
      period_number: period.period_number,
      start_time: period.start_time,
      end_time: period.end_time,
      is_break: period.is_break,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (period: PeriodDB) => {
    setSelectedPeriod(period);
    setShowDeleteDialog(true);
  };

  const getPeriodBadgeVariant = (isBreak: boolean) => {
    return isBreak ? "secondary" : "default";
  };

  const getPeriodTypeLabel = (period: PeriodDB) => {
    if (period.is_break) {
      const name = (period.period_name || "").toLowerCase();
      if (name.includes("lunch")) return "Lunch Break";
      if (name.includes("assembly")) return "Assembly";

      // Calculate duration in minutes
      const start = new Date(`2000-01-01T${period.start_time}`);
      const end = new Date(`2000-01-01T${period.end_time}`);
      const durationMinutes = Math.round(
        (end.getTime() - start.getTime()) / 60000
      );

      // Short break: <= 30 min, Long break: > 30 min
      return durationMinutes > 30 ? "Long Break" : "Short Break";
    }
    return "Class Period";
  };

  if (!canUpdate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to manage periods.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load periods</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  // Sort periods by display_order
  const sortedPeriods = [...periods].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  // Calculate stats
  const classPeriods = sortedPeriods.filter((p) => !p.is_break);
  const breakPeriods = sortedPeriods.filter((p) => p.is_break);
  const schoolHours =
    sortedPeriods.length > 0
      ? `${sortedPeriods[0].start_time} - ${
          sortedPeriods[sortedPeriods.length - 1].end_time
        }`
      : "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Period Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage school period timings and schedule
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Period
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Periods</p>
                <p className="text-2xl font-bold">{sortedPeriods.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Class Periods</p>
              <p className="text-2xl font-bold">{classPeriods.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Break Periods</p>
              <p className="text-2xl font-bold">{breakPeriods.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">School Hours</p>
              <p className="text-2xl font-bold">{schoolHours}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Period Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPeriods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No periods configured</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first period
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Period
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Period Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPeriods.map((period) => {
                  const start = new Date(`2000-01-01T${period.start_time}`);
                  const end = new Date(`2000-01-01T${period.end_time}`);
                  const duration = Math.round(
                    (end.getTime() - start.getTime()) / 60000
                  );

                  return (
                    <TableRow key={period.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell className="font-medium">
                        {period.period_name || `Period ${period.period_number}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPeriodBadgeVariant(period.is_break)}>
                          {getPeriodTypeLabel(period)}
                        </Badge>
                      </TableCell>
                      <TableCell>{period.start_time}</TableCell>
                      <TableCell>{period.end_time}</TableCell>
                      <TableCell>{duration} min</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(period)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(period)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* Add Period Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Period</DialogTitle>
            <DialogDescription>
              Configure a new period for the school schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Period Name *</Label>
              <Input
                value={formData.period_name}
                onChange={(e) =>
                  setFormData({ ...formData, period_name: e.target.value })
                }
                placeholder="e.g., Period 1, Lunch Break, Assembly"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_break"
                checked={formData.is_break}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    is_break: checked,
                    period_number: checked ? 0 : formData.period_number,
                  })
                }
              />
              <Label htmlFor="is_break">
                This is a break period (not a class)
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            {!formData.is_break && (
              <div className="space-y-2">
                <Label>Period Number</Label>
                <Input
                  type="number"
                  value={formData.period_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      period_number: parseInt(e.target.value) || 0,
                    })
                  }
                  min={1}
                  placeholder="e.g., 1, 2, 3..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Period Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Period</DialogTitle>
            <DialogDescription>
              Update the period configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Period Name *</Label>
              <Input
                value={formData.period_name}
                onChange={(e) =>
                  setFormData({ ...formData, period_name: e.target.value })
                }
                placeholder="e.g., Period 1, Lunch Break, Assembly"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_break"
                checked={formData.is_break}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    is_break: checked,
                    period_number: checked ? 0 : formData.period_number,
                  })
                }
              />
              <Label htmlFor="edit_is_break">
                This is a break period (not a class)
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            {!formData.is_break && (
              <div className="space-y-2">
                <Label>Period Number</Label>
                <Input
                  type="number"
                  value={formData.period_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      period_number: parseInt(e.target.value) || 0,
                    })
                  }
                  min={1}
                  placeholder="e.g., 1, 2, 3..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Period</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPeriod?.period_name}"?
              This action cannot be undone and may affect existing timetable
              entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PeriodsPage;
