/**
 * ParentsList Component (CONSOLIDATED)
 * =====================================
 * Main listing page for parents/guardians with search, filters, and stats.
 * Create and Edit operations now use modal dialogs instead of separate routes.
 *
 * Route Consolidation: Replaces /parents/create and /parents/:id/edit routes
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Download,
  Upload,
  Briefcase,
  MapPin,
  ChevronRight,
  Pencil,
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
import { Skeleton } from "@/components/ui/skeleton";

import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { ParentDB, RELATIONSHIP_OPTIONS } from "./types";
import { ParentFormDialog } from "./ParentFormDialog";
import { BulkImportDialog } from "@/components/ui/bulk-import-dialog";
import {
  exportToExcel,
  PARENT_IMPORT_TEMPLATE,
  PARENT_IMPORT_CONFIG,
} from "@/lib/excel";

const INDEX_TOKEN = "1emaet";

export function ParentsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState<string>("all");

  // Modal states for create/edit (consolidation - replaces separate routes)
  const [showParentModal, setShowParentModal] = useState(false);
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  const { toast } = useToast();
  const { canCreate, canUpdate, canExport } = useModulePermissions("parents");

  // Fetch parents
  const {
    data: parents,
    isLoading,
    refetch,
    createMutation,
  } = useSupabaseTable<ParentDB>(`parents_${INDEX_TOKEN}`, {
    filters: {},
  });

  // Handle opening create modal
  const handleCreateParent = () => {
    setEditParentId(null);
    setShowParentModal(true);
  };

  // Handle opening edit modal
  const handleEditParent = (parentId: string) => {
    setEditParentId(parentId);
    setShowParentModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowParentModal(false);
    setEditParentId(null);
  };

  // Export parents to Excel
  const handleExport = () => {
    if (!filteredParents || filteredParents.length === 0) {
      toast({
        title: "No Data",
        description: "No parents to export.",
        variant: "destructive",
      });
      return;
    }

    exportToExcel({
      data: filteredParents,
      filename: `parents_export_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Parents",
      columns: [
        { header: "Full Name", key: "full_name", width: 20 },
        { header: "Relationship", key: "relationship", width: 12 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Alternate Phone", key: "alternate_phone", width: 15 },
        { header: "Occupation", key: "occupation", width: 15 },
        { header: "Annual Income", key: "annual_income", width: 15 },
        { header: "Address", key: "address_line1", width: 25 },
        { header: "City", key: "city", width: 15 },
        { header: "State", key: "state", width: 15 },
        { header: "Pincode", key: "pincode", width: 10 },
        { header: "Aadhar Number", key: "aadhar_number", width: 15 },
      ],
    });

    toast({
      title: "Export Complete",
      description: `Exported ${filteredParents.length} parents to Excel.`,
    });
  };

  // Bulk import handler
  const handleBulkImport = async (data: Record<string, any>[]) => {
    let success = 0;
    let failed = 0;
    const results: {
      data: Record<string, any>;
      success: boolean;
      reason?: string;
    }[] = [];

    // Get existing phone numbers to check for duplicates
    const existingPhones = new Set(parents?.map((p) => p.phone) || []);

    for (const row of data) {
      // Skip if phone number already exists
      if (existingPhones.has(row.phone)) {
        results.push({
          data: row,
          success: false,
          reason: `Duplicate phone number: ${row.phone}`,
        });
        failed++;
        continue;
      }

      try {
        await createMutation.mutateAsync({
          full_name: row.full_name,
          relationship: row.relationship || "Guardian",
          phone: row.phone,
          email: row.email || null,
          alternate_phone: row.alternate_phone || null,
          occupation: row.occupation || null,
          annual_income: row.annual_income ? parseInt(row.annual_income) : null,
          address_line1: row.address_line1 || null,
          city: row.city || null,
          state: row.state || null,
          pincode: row.pincode || null,
          country: "India",
          aadhar_number: row.aadhar_number || null,
        });
        results.push({ data: row, success: true });
        success++;
        // Add to existing phones to prevent duplicates within the same import batch
        existingPhones.add(row.phone);
      } catch (error: any) {
        console.error("Failed to import parent:", row, error);
        results.push({
          data: row,
          success: false,
          reason: error?.message || "Database insertion failed",
        });
        failed++;
      }
    }

    refetch();
    return { success, failed, results };
  };

  // Get parent data for edit mode
  const getEditParentData = () => {
    if (!editParentId || !parents) return undefined;
    const parent = parents.find((p) => p.id === editParentId);
    if (!parent) return undefined;
    return {
      full_name: parent.full_name,
      relationship: parent.relationship,
      phone: parent.phone,
      email: parent.email || "",
      occupation: parent.occupation || "",
      annual_income: parent.annual_income?.toString() || "",
      aadhar_number: parent.aadhar_number || "",
      address_line1: parent.address_line1 || "",
      address_line2: parent.address_line2 || "",
      city: parent.city || "",
      state: parent.state || "",
      pincode: parent.pincode || "",
    };
  };

  // Filtered parents
  const filteredParents = useMemo(() => {
    if (!parents) return [];

    return parents.filter((parent) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        parent.full_name.toLowerCase().includes(searchLower) ||
        parent.phone.includes(searchQuery) ||
        (parent.email?.toLowerCase().includes(searchLower) ?? false);

      // Relationship filter
      const matchesRelationship =
        relationshipFilter === "all" ||
        parent.relationship === relationshipFilter;

      return matchesSearch && matchesRelationship;
    });
  }, [parents, searchQuery, relationshipFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!parents) return { total: 0, fathers: 0, mothers: 0, guardians: 0 };

    return {
      total: parents.length,
      fathers: parents.filter((p) => p.relationship === "Father").length,
      mothers: parents.filter((p) => p.relationship === "Mother").length,
      guardians: parents.filter(
        (p) => p.relationship === "Guardian" || p.relationship === "Other"
      ).length,
    };
  }, [parents]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "Father":
        return "bg-blue-100 text-blue-800";
      case "Mother":
        return "bg-pink-100 text-pink-800";
      case "Guardian":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Parents & Guardians</h1>
          <p className="text-muted-foreground">
            Manage parent and guardian information
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button
              variant="outline"
              onClick={() => setShowBulkImportModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
          )}
          {canExport && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {canCreate && (
            <Button onClick={handleCreateParent}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Parent
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered parents/guardians
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fathers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.fathers}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${((stats.fathers / stats.total) * 100).toFixed(
                    0
                  )}% of total`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mothers</CardTitle>
            <Users className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.mothers}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${((stats.mothers / stats.total) * 100).toFixed(
                    0
                  )}% of total`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Guardians</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.guardians}
            </div>
            <p className="text-xs text-muted-foreground">Guardians & others</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={relationshipFilter}
              onValueChange={setRelationshipFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Relationships</SelectItem>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parents List ({filteredParents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredParents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No parents found</h3>
              <p className="text-muted-foreground">
                {searchQuery || relationshipFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding a parent"}
              </p>
              {canCreate && !searchQuery && relationshipFilter === "all" && (
                <Button className="mt-4" onClick={handleCreateParent}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Parent
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={parent.photo_url || undefined} />
                          <AvatarFallback>
                            {getInitials(parent.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{parent.full_name}</p>
                          {parent.aadhar_number && (
                            <p className="text-xs text-muted-foreground">
                              Aadhar: ****{parent.aadhar_number.slice(-4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getRelationshipColor(parent.relationship)}
                      >
                        {parent.relationship}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {parent.phone}
                        </div>
                        {parent.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {parent.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {parent.occupation ? (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          {parent.occupation}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {parent.city ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {parent.city}
                          {parent.state && `, ${parent.state}`}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditParent(parent.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/parents/${parent.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Parent Modal (Consolidated - replaces /parents/create and /parents/:id/edit routes) */}
      <ParentFormDialog
        open={showParentModal}
        onOpenChange={handleModalClose}
        mode={editParentId ? "edit" : "create"}
        parentId={editParentId || undefined}
        initialData={getEditParentData()}
        onSuccess={() => refetch()}
      />

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={showBulkImportModal}
        onOpenChange={setShowBulkImportModal}
        title="Bulk Import Parents"
        description="Import multiple parents/guardians from an Excel file. Download the template to see the required format."
        importConfig={PARENT_IMPORT_CONFIG}
        templateData={PARENT_IMPORT_TEMPLATE}
        templateFilename="parents_import"
        onImport={handleBulkImport}
        entityName="parents"
        identifierField="phone"
      />
    </div>
  );
}
