/**
 * Period Configuration Page
 * ==========================
 * Manage school period timings and configuration
 */

import { useState } from "react";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

interface PeriodDB {
  id: string;
  period_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
  period_type: "class" | "break" | "lunch" | "assembly";
  is_active: boolean;
  display_order: number;
}

interface PeriodFormData {
  period_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
  period_type: "class" | "break" | "lunch" | "assembly";
  is_active: boolean;
}

const PERIOD_TYPES = [
  { value: "class", label: "Class Period" },
  { value: "break", label: "Short Break" },
  { value: "lunch", label: "Lunch Break" },
  { value: "assembly", label: "Assembly" },
];

// Mock period data
const mockPeriods: PeriodDB[] = [
  {
    id: "1",
    period_name: "Assembly",
    period_number: 0,
    start_time: "08:00",
    end_time: "08:30",
    period_type: "assembly",
    is_active: true,
    display_order: 1,
  },
  {
    id: "2",
    period_name: "Period 1",
    period_number: 1,
    start_time: "08:30",
    end_time: "09:15",
    period_type: "class",
    is_active: true,
    display_order: 2,
  },
  {
    id: "3",
    period_name: "Period 2",
    period_number: 2,
    start_time: "09:15",
    end_time: "10:00",
    period_type: "class",
    is_active: true,
    display_order: 3,
  },
  {
    id: "4",
    period_name: "Short Break",
    period_number: 0,
    start_time: "10:00",
    end_time: "10:15",
    period_type: "break",
    is_active: true,
    display_order: 4,
  },
  {
    id: "5",
    period_name: "Period 3",
    period_number: 3,
    start_time: "10:15",
    end_time: "11:00",
    period_type: "class",
    is_active: true,
    display_order: 5,
  },
  {
    id: "6",
    period_name: "Period 4",
    period_number: 4,
    start_time: "11:00",
    end_time: "11:45",
    period_type: "class",
    is_active: true,
    display_order: 6,
  },
  {
    id: "7",
    period_name: "Lunch Break",
    period_number: 0,
    start_time: "11:45",
    end_time: "12:30",
    period_type: "lunch",
    is_active: true,
    display_order: 7,
  },
  {
    id: "8",
    period_name: "Period 5",
    period_number: 5,
    start_time: "12:30",
    end_time: "13:15",
    period_type: "class",
    is_active: true,
    display_order: 8,
  },
  {
    id: "9",
    period_name: "Period 6",
    period_number: 6,
    start_time: "13:15",
    end_time: "14:00",
    period_type: "class",
    is_active: true,
    display_order: 9,
  },
];

const PeriodsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("timetable");

  const [periods, setPeriods] = useState<PeriodDB[]>(mockPeriods);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDB | null>(null);
  const [formData, setFormData] = useState<PeriodFormData>({
    period_name: "",
    period_number: 0,
    start_time: "",
    end_time: "",
    period_type: "class",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      period_name: "",
      period_number: 0,
      start_time: "",
      end_time: "",
      period_type: "class",
      is_active: true,
    });
  };

  const handleAdd = () => {
    if (!formData.period_name || !formData.start_time || !formData.end_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newPeriod: PeriodDB = {
      id: crypto.randomUUID(),
      ...formData,
      display_order: periods.length + 1,
    };

    setPeriods([...periods, newPeriod]);
    setShowAddDialog(false);
    resetForm();
    toast({
      title: "Success",
      description: "Period added successfully",
    });
  };

  const handleEdit = () => {
    if (!selectedPeriod) return;

    setPeriods(
      periods.map((p) =>
        p.id === selectedPeriod.id ? { ...p, ...formData } : p
      )
    );
    setShowEditDialog(false);
    setSelectedPeriod(null);
    resetForm();
    toast({
      title: "Success",
      description: "Period updated successfully",
    });
  };

  const handleDelete = (id: string) => {
    setPeriods(periods.filter((p) => p.id !== id));
    toast({
      title: "Success",
      description: "Period deleted successfully",
    });
  };

  const handleToggleActive = (id: string) => {
    setPeriods(
      periods.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const openEditDialog = (period: PeriodDB) => {
    setSelectedPeriod(period);
    setFormData({
      period_name: period.period_name,
      period_number: period.period_number,
      start_time: period.start_time,
      end_time: period.end_time,
      period_type: period.period_type,
      is_active: period.is_active,
    });
    setShowEditDialog(true);
  };

  const getPeriodTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "default";
      case "break":
        return "secondary";
      case "lunch":
        return "outline";
      case "assembly":
        return "destructive";
      default:
        return "default";
    }
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
                <p className="text-2xl font-bold">{periods.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Class Periods</p>
              <p className="text-2xl font-bold">
                {periods.filter((p) => p.period_type === "class").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Break Periods</p>
              <p className="text-2xl font-bold">
                {
                  periods.filter(
                    (p) =>
                      p.period_type === "break" || p.period_type === "lunch"
                  ).length
                }
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">School Hours</p>
              <p className="text-2xl font-bold">
                {periods.length > 0
                  ? `${periods[0].start_time} - ${
                      periods[periods.length - 1].end_time
                    }`
                  : "N/A"}
              </p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Period Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods
                .sort((a, b) => a.display_order - b.display_order)
                .map((period) => {
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
                        {period.period_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPeriodTypeColor(period.period_type)}>
                          {
                            PERIOD_TYPES.find(
                              (t) => t.value === period.period_type
                            )?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>{period.start_time}</TableCell>
                      <TableCell>{period.end_time}</TableCell>
                      <TableCell>{duration} min</TableCell>
                      <TableCell>
                        <Switch
                          checked={period.is_active}
                          onCheckedChange={() => handleToggleActive(period.id)}
                        />
                      </TableCell>
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
                            onClick={() => handleDelete(period.id)}
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
                placeholder="e.g., Period 1, Lunch Break"
              />
            </div>
            <div className="space-y-2">
              <Label>Period Type *</Label>
              <Select
                value={formData.period_type}
                onValueChange={(value: typeof formData.period_type) =>
                  setFormData({ ...formData, period_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {formData.period_type === "class" && (
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
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
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
                placeholder="e.g., Period 1, Lunch Break"
              />
            </div>
            <div className="space-y-2">
              <Label>Period Type *</Label>
              <Select
                value={formData.period_type}
                onValueChange={(value: typeof formData.period_type) =>
                  setFormData({ ...formData, period_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {formData.period_type === "class" && (
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
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PeriodsPage;
