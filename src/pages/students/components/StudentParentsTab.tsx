/**
 * Student Parents Tab Component
 * =============================
 * Manages linked parents/guardians for a student with options to:
 * - Add new parent relationships
 * - Set primary contact
 * - Manage pickup permissions
 * - Remove relationships
 */

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Phone,
  Mail,
  Star,
  Truck,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const INDEX_TOKEN = "1emaet";

interface ParentDB {
  id: string;
  full_name: string;
  relationship: "Father" | "Mother" | "Guardian" | "Other";
  email: string | null;
  phone: string;
  photo_url: string | null;
}

interface StudentParentRelationDB {
  id: string;
  student_id: string;
  parent_id: string;
  is_primary_contact: boolean;
  can_pickup: boolean;
  created_at: string;
}

interface LinkedParent extends ParentDB {
  relationshipId: string;
  is_primary_contact: boolean;
  can_pickup: boolean;
}

interface StudentParentsTabProps {
  studentId: string;
}

export function StudentParentsTab({ studentId }: StudentParentsTabProps) {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch all parents
  const { data: allParents, isLoading: loadingParents } =
    useSupabaseTable<ParentDB>(`parents_${INDEX_TOKEN}`, { filters: {} });

  // Fetch parent-student relations
  const { data: relations, refetch: refetchRelations } =
    useSupabaseTable<StudentParentRelationDB>(
      `student_parent_relations_${INDEX_TOKEN}`,
      { filters: {} }
    );

  // Get linked parents for this student
  const linkedParents = useMemo(() => {
    if (!relations || !allParents || !studentId) return [];

    const studentRelations = relations.filter(
      (r) => r.student_id === studentId
    );
    return studentRelations
      .map((relation) => {
        const parent = allParents.find((p) => p.id === relation.parent_id);
        if (!parent) return null;
        return {
          ...parent,
          relationshipId: relation.id,
          is_primary_contact: relation.is_primary_contact,
          can_pickup: relation.can_pickup,
        };
      })
      .filter(Boolean) as LinkedParent[];
  }, [relations, allParents, studentId]);

  // Get available parents (not yet linked)
  const availableParents = useMemo(() => {
    if (!allParents || !linkedParents) return [];
    const linkedIds = new Set(linkedParents.map((p) => p.id));
    return allParents.filter((p) => !linkedIds.has(p.id));
  }, [allParents, linkedParents]);

  // Filter available parents based on search query
  const filteredAvailableParents = useMemo(() => {
    if (!searchQuery.trim()) return availableParents;

    const query = searchQuery.toLowerCase();
    return availableParents.filter(
      (parent) =>
        parent.full_name.toLowerCase().includes(query) ||
        parent.phone.includes(query) ||
        parent.relationship.toLowerCase().includes(query) ||
        (parent.email?.toLowerCase().includes(query) ?? false)
    );
  }, [availableParents, searchQuery]);

  const handleAddParent = async () => {
    if (!selectedParentId) {
      toast({
        title: "Error",
        description: "Please select a parent.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from(`student_parent_relations_${INDEX_TOKEN}`)
        .insert([
          {
            student_id: studentId,
            parent_id: selectedParentId,
            is_primary_contact: false,
            can_pickup: true,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Parent added successfully.",
      });

      setOpenAddDialog(false);
      setSearchQuery("");
      setSelectedParentId("");
      refetchRelations();
    } catch (error: any) {
      console.error("Error adding parent:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add parent.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePrimaryContact = async (
    parentId: string,
    isPrimary: boolean
  ) => {
    const relation = linkedParents.find((p) => p.id === parentId);
    if (!relation) return;

    try {
      // If setting as primary, unset others
      if (isPrimary) {
        const { error: updateError } = await supabase
          .from(`student_parent_relations_${INDEX_TOKEN}`)
          .update({ is_primary_contact: false })
          .eq("student_id", studentId);

        if (updateError) throw updateError;
      }

      const { error } = await supabase
        .from(`student_parent_relations_${INDEX_TOKEN}`)
        .update({ is_primary_contact: isPrimary })
        .eq("id", relation.relationshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: isPrimary
          ? "Set as primary contact."
          : "Removed as primary contact.",
      });

      refetchRelations();
    } catch (error: any) {
      console.error("Error updating primary contact:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePickupPermission = async (
    parentId: string,
    canPickup: boolean
  ) => {
    const relation = linkedParents.find((p) => p.id === parentId);
    if (!relation) return;

    try {
      const { error } = await supabase
        .from(`student_parent_relations_${INDEX_TOKEN}`)
        .update({ can_pickup: canPickup })
        .eq("id", relation.relationshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: canPickup
          ? "Pickup permission enabled."
          : "Pickup permission disabled.",
      });

      refetchRelations();
    } catch (error: any) {
      console.error("Error updating pickup permission:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRelation = async (relationId: string) => {
    try {
      const { error } = await supabase
        .from(`student_parent_relations_${INDEX_TOKEN}`)
        .delete()
        .eq("id", relationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Parent removed successfully.",
      });

      setDeleteConfirm(null);
      refetchRelations();
    } catch (error: any) {
      console.error("Error deleting relation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove parent.",
        variant: "destructive",
      });
    }
  };

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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Mother":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "Guardian":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Linked Parents/Guardians</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage parent and guardian contacts for this student
          </p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Parent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Link Parent to Student</DialogTitle>
              <DialogDescription>
                Search and select a parent/guardian to link to this student.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or relationship..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Parent List */}
              <div className="space-y-2">
                {loadingParents ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredAvailableParents.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No parents found matching your search"
                      : "No available parents"}
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {filteredAvailableParents.map((parent) => (
                      <button
                        key={parent.id}
                        onClick={() => setSelectedParentId(parent.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          selectedParentId === parent.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="h-8 w-8 mt-0.5">
                              <AvatarImage src={parent.photo_url || ""} />
                              <AvatarFallback>
                                {parent.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {parent.full_name}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {parent.relationship}
                                </Badge>
                                <span>{parent.phone}</span>
                              </div>
                            </div>
                          </div>
                          {selectedParentId === parent.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenAddDialog(false);
                    setSearchQuery("");
                    setSelectedParentId("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddParent} disabled={!selectedParentId}>
                  Add Parent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Linked Parents List */}
      {linkedParents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No parents linked to this student yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Add Parent" to link a parent or guardian.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {linkedParents.map((parent) => (
            <Card key={parent.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Parent Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar>
                      <AvatarImage src={parent.photo_url || ""} />
                      <AvatarFallback>
                        {getInitials(parent.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{parent.full_name}</h4>
                        <Badge
                          className={getRelationshipColor(parent.relationship)}
                        >
                          {parent.relationship}
                        </Badge>
                        {parent.is_primary_contact && (
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {parent.phone && (
                          <a
                            href={`tel:${parent.phone}`}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            <Phone className="h-3 w-3" />
                            {parent.phone}
                          </a>
                        )}
                        {parent.email && (
                          <a
                            href={`mailto:${parent.email}`}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            <Mail className="h-3 w-3" />
                            {parent.email}
                          </a>
                        )}
                      </div>

                      {/* Permissions */}
                      <div className="flex gap-4 pt-2">
                        <button
                          onClick={() =>
                            handleUpdatePrimaryContact(
                              parent.id,
                              !parent.is_primary_contact
                            )
                          }
                          className="flex items-center gap-2 text-sm hover:text-foreground"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              parent.is_primary_contact
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {parent.is_primary_contact && (
                              <Star className="h-3 w-3 text-white fill-white" />
                            )}
                          </div>
                          <span>Primary Contact</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePickupPermission(
                              parent.id,
                              !parent.can_pickup
                            )
                          }
                          className="flex items-center gap-2 text-sm hover:text-foreground"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              parent.can_pickup
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {parent.can_pickup && (
                              <Truck className="h-3 w-3 text-white fill-white" />
                            )}
                          </div>
                          <span>Can Pickup</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div>
                    <AlertDialog
                      open={deleteConfirm === parent.id}
                      onOpenChange={(open) =>
                        setDeleteConfirm(open ? parent.id : null)
                      }
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(parent.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Parent?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will unlink {parent.full_name} from this
                            student. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() =>
                              handleDeleteRelation(parent.relationshipId)
                            }
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
