/**
 * ParentDetail Component
 * ======================
 * View detailed parent/guardian information with linked students
 */

import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  User,
  GraduationCap,
  Users,
  FileText,
  IndianRupee,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { ParentDB, StudentParentRelationDB } from "./types";

const INDEX_TOKEN = "1emaet";

interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  photo_url: string | null;
  status: string;
}

export function ParentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate, canDelete } = useModulePermissions("parents");

  // Fetch parent details
  const { data: parents, isLoading } = useSupabaseTable<ParentDB>(
    `parents_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch student-parent relations
  const { data: relations } = useSupabaseTable<StudentParentRelationDB>(
    `student_parent_relations_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch students
  const { data: students } = useSupabaseTable<StudentInfo>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { deleteMutation } = useSupabaseTable<ParentDB>(
    `parents_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const parent = useMemo(() => {
    return parents?.find((p) => p.id === id);
  }, [parents, id]);

  // Get linked students
  const linkedStudents = useMemo(() => {
    if (!relations || !students || !id) return [];

    const parentRelations = relations.filter((r) => r.parent_id === id);
    return parentRelations
      .map((relation) => {
        const student = students.find((s) => s.id === relation.student_id);
        if (!student) return null;
        return {
          ...student,
          is_primary_contact: relation.is_primary_contact,
          can_pickup: relation.can_pickup,
        };
      })
      .filter(Boolean);
  }, [relations, students, id]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast({
        title: "Parent deleted",
        description: "The parent record has been deleted.",
      });
      navigate("/parents");
    } catch (error) {
      console.error("Error deleting parent:", error);
      toast({
        title: "Error",
        description: "Failed to delete parent. Please try again.",
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
        return "bg-blue-100 text-blue-800";
      case "Mother":
        return "bg-pink-100 text-pink-800";
      case "Guardian":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Users className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Parent Not Found</h2>
        <p className="text-muted-foreground">
          The requested parent record could not be found.
        </p>
        <Button asChild>
          <Link to="/parents">Back to Parents</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/parents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{parent.full_name}</h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={getRelationshipColor(parent.relationship)}
              >
                {parent.relationship}
              </Badge>
              <span className="text-muted-foreground">
                Linked to {linkedStudents.length} student(s)
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button variant="outline" asChild>
              <Link to={`/parents/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Parent</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {parent.full_name}? This
                    action cannot be undone and will remove all linked student
                    relationships.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={parent.photo_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(parent.full_name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{parent.full_name}</h2>
              <Badge
                variant="secondary"
                className={`mt-2 ${getRelationshipColor(parent.relationship)}`}
              >
                {parent.relationship}
              </Badge>

              <Separator className="my-4" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{parent.phone}</span>
                </div>
                {parent.alternate_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{parent.alternate_phone}</span>
                  </div>
                )}
                {parent.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{parent.email}</span>
                  </div>
                )}
                {parent.occupation && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{parent.occupation}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Tabs */}
        <Card className="md:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <CardHeader>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="children">
                  Children ({linkedStudents.length})
                </TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="personal" className="mt-0 space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{parent.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Relationship
                      </p>
                      <p className="font-medium">{parent.relationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Occupation
                      </p>
                      <p className="font-medium">{parent.occupation || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Annual Income
                      </p>
                      <p className="font-medium">
                        {formatCurrency(parent.annual_income)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Address
                  </h3>
                  {parent.address_line1 || parent.city ? (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        {parent.address_line1 && <p>{parent.address_line1}</p>}
                        {parent.address_line2 && <p>{parent.address_line2}</p>}
                        <p>
                          {[parent.city, parent.state, parent.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p>{parent.country}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No address provided</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="children" className="mt-0">
                {linkedStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Children Linked</h3>
                    <p className="text-muted-foreground">
                      This parent is not linked to any students yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {linkedStudents.map((student: any) => (
                      <Card key={student.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={student.photo_url || undefined}
                                />
                                <AvatarFallback>
                                  {getInitials(
                                    `${student.first_name} ${student.last_name}`
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {student.first_name} {student.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {student.admission_number}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {student.is_primary_contact && (
                                <Badge variant="secondary">
                                  Primary Contact
                                </Badge>
                              )}
                              {student.can_pickup && (
                                <Badge variant="outline">Can Pickup</Badge>
                              )}
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/students/${student.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Aadhar Card</p>
                      {parent.aadhar_number ? (
                        <p className="text-sm text-muted-foreground">
                          **** **** {parent.aadhar_number.slice(-4)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Photo</p>
                      {parent.photo_url ? (
                        <p className="text-sm text-green-600">Uploaded</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not uploaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
