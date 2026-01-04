/**
 * StaffIDCards Component
 * ======================
 * List and generate staff ID cards
 */

import { useState, useMemo } from "react";
import {
  UserCheck,
  Search,
  Filter,
  CreditCard,
  Printer,
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
import { StaffForIDCard, DEFAULT_STAFF_TEMPLATE } from "./types";
import { IDCardPreview } from ".";

const INDEX_TOKEN = "1emaet";

interface StaffIDCardsProps {
  embedded?: boolean;
}

export function StaffIDCards({ embedded = false }: StaffIDCardsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewStaff, setPreviewStaff] = useState<StaffForIDCard | null>(null);

  const { canCreate } = useModulePermissions("id_cards");
  const { toast } = useToast();

  // Fetch staff
  const { data: staff, isLoading } = useSupabaseTable<StaffForIDCard>(
    `employees_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Get unique departments
  const departments = useMemo(() => {
    if (!staff) return [];
    const depts = new Set(staff.map((s) => s.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [staff]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    if (!staff) return [];

    return staff
      .filter((s) => s.status === "active")
      .filter((member) => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          member.first_name.toLowerCase().includes(searchLower) ||
          member.last_name.toLowerCase().includes(searchLower) ||
          member.employee_code.toLowerCase().includes(searchLower);

        // Department filter
        const matchesDept =
          departmentFilter === "all" || member.department === departmentFilter;

        return matchesSearch && matchesDept;
      });
  }, [staff, searchQuery, departmentFilter]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredStaff.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStaff.map((s) => s.id)));
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
        title: "No staff selected",
        description:
          "Please select at least one staff member to generate ID cards.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating ID Cards",
      description: `Generating ${selectedIds.size} ID card(s)...`,
    });

    window.print();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
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
            <h1 className="text-2xl font-bold">Staff ID Cards</h1>
            <p className="text-muted-foreground">
              Generate and manage staff identification cards
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
                placeholder="Search by name or employee code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept as string}>
                    {dept}
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
            {selectedIds.size === filteredStaff.length ? (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                Select All ({filteredStaff.length})
              </>
            )}
          </Button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} staff member(s) selected
            </span>
          )}
        </div>
      )}

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Staff Members ({filteredStaff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No staff found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {canCreate && <TableHead className="w-12"></TableHead>}
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    {canCreate && (
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(member.id)}
                          onCheckedChange={() => handleSelect(member.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.photo_url || undefined} />
                          <AvatarFallback>
                            {getInitials(member.first_name, member.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{member.employee_code}</TableCell>
                    <TableCell>
                      {member.designation ? (
                        <Badge variant="outline">{member.designation}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{member.department || "-"}</TableCell>
                    <TableCell>
                      {member.blood_group ? (
                        <Badge variant="secondary">{member.blood_group}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewStaff(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canCreate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedIds(new Set([member.id]));
                              handleGenerateSelected();
                            }}
                          >
                            <Printer className="h-4 w-4" />
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

      {/* Preview Dialog */}
      <Dialog open={!!previewStaff} onOpenChange={() => setPreviewStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ID Card Preview</DialogTitle>
          </DialogHeader>
          {previewStaff && (
            <IDCardPreview
              type="staff"
              data={previewStaff}
              design={DEFAULT_STAFF_TEMPLATE}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
