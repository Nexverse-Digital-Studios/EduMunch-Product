import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  AlertTriangle,
  Download,
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
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentDB, STUDENT_STATUS_OPTIONS } from "./types";
import { StudentParentsTab } from "./StudentParentsTab";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface SectionDB {
  id: string;
  section_name: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
}

export function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canUpdate, canDelete } = useModulePermissions("students");

  const { data: students, isLoading } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`,
    { filters: { id } }
  );

  const { deleteMutation } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`
  );

  const { data: classes } = useSupabaseTable<ClassDB>(`classes_${INDEX_TOKEN}`);
  const { data: sections } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`
  );
  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`
  );

  const student = students?.[0];

  const getClassName = (classId: string) => {
    return classes?.find((c) => c.id === classId)?.class_name || "N/A";
  };

  const getSectionName = (sectionId: string) => {
    return sections?.find((s) => s.id === sectionId)?.section_name || "N/A";
  };

  const getYearName = (yearId: string) => {
    return academicYears?.find((y) => y.id === yearId)?.year_name || "N/A";
  };

  const handleDelete = async () => {
    if (!student?.id) return;

    try {
      await deleteMutation.mutateAsync(student.id);
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
      navigate("/students");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
      }
    > = {
      active: { variant: "default", className: "bg-green-500" },
      inactive: { variant: "secondary" },
      graduated: { variant: "default", className: "bg-blue-500" },
      transferred: { variant: "outline" },
      dropped: { variant: "destructive" },
    };
    const config = statusConfig[status] || { variant: "secondary" as const };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view students.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Student not found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/students")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Student Profile
            </h1>
            <p className="text-muted-foreground">
              View and manage student information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              onClick={() => navigate(`/students/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
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
                  <AlertDialogTitle>Delete Student</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {student.first_name}{" "}
                    {student.last_name}? This action cannot be undone.
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
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photo_url || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(student.first_name, student.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {student.first_name} {student.middle_name || ""}{" "}
                  {student.last_name}
                </h2>
                {getStatusBadge(student.status)}
              </div>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {getClassName(student.class_id)} -{" "}
                  {getSectionName(student.section_id)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {getYearName(student.academic_year_id)}
                </span>
                <span className="font-mono">
                  Adm. No: {student.admission_number}
                </span>
                {student.roll_number && (
                  <span className="font-mono">Roll: {student.roll_number}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(student.date_of_birth).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                    <span className="text-muted-foreground ml-2">
                      ({calculateAge(student.date_of_birth)} years old)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{student.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">
                    {student.blood_group || "Not specified"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{student.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Religion</p>
                  <p className="font-medium">
                    {student.religion || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {student.category || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Caste</p>
                  <p className="font-medium">
                    {student.caste || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aadhar Number</p>
                  <p className="font-medium font-mono">
                    {student.aadhar_number || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Medical Info */}
              {(student.medical_conditions?.length ||
                student.allergies?.length) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Medical Information
                    </h4>
                    {student.allergies && student.allergies.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">
                          Allergies
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.allergies.map((allergy, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-orange-600"
                            >
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Info Tab */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Admission Number
                  </p>
                  <p className="font-medium font-mono">
                    {student.admission_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-medium font-mono">
                    {student.roll_number || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Admission Date
                  </p>
                  <p className="font-medium">
                    {new Date(student.admission_date).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">
                    {getClassName(student.class_id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">
                    {getSectionName(student.section_id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Academic Year</p>
                  <p className="font-medium">
                    {getYearName(student.academic_year_id)}
                  </p>
                </div>
              </div>

              {student.previous_school && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Previous School
                    </p>
                    <p className="font-medium">{student.previous_school}</p>
                  </div>
                </>
              )}

              {(student.tc_number || student.tc_issued_date) && (
                <>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">TC Number</p>
                      <p className="font-medium">
                        {student.tc_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        TC Issued Date
                      </p>
                      <p className="font-medium">
                        {student.tc_issued_date
                          ? new Date(
                              student.tc_issued_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {student.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {student.phone || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.address_line1 ? (
                  <div className="space-y-1">
                    <p>{student.address_line1}</p>
                    {student.address_line2 && <p>{student.address_line2}</p>}
                    <p>
                      {[student.city, student.state, student.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>{student.country}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No address provided</p>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.emergency_contact_name ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {student.emergency_contact_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {student.emergency_contact_phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relation</p>
                      <p className="font-medium">
                        {student.emergency_contact_relation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No emergency contact provided
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Parents Tab */}
        <TabsContent value="parents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Parents & Guardians
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudentParentsTab studentId={student?.id || ""} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>Uploaded student documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Photo", url: student.photo_url },
                  {
                    label: "Birth Certificate",
                    url: student.birth_certificate_url,
                  },
                  { label: "Aadhar Card", url: student.aadhar_card_url },
                  {
                    label: "Transfer Certificate",
                    url: student.transfer_certificate_url,
                  },
                  {
                    label: "Previous Marksheet",
                    url: student.previous_marksheet_url,
                  },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{doc.label}</span>
                    </div>
                    {doc.url ? (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="secondary">Not uploaded</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
