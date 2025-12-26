import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { StudentForm } from "./StudentForm";
import { StudentDB, StudentFormData } from "./types";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface SectionDB {
  id: string;
  section_name: string;
  class_id: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

export function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("students");

  const { data: students, isLoading } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`,
    { filters: { id } }
  );

  const { updateMutation } = useSupabaseTable<StudentDB>(
    `students_${INDEX_TOKEN}`
  );

  const { data: classes } = useSupabaseTable<ClassDB>(
    `classes_${INDEX_TOKEN}`,
    {
      orderBy: { column: "class_order", ascending: true },
    }
  );

  const { data: sections } = useSupabaseTable<SectionDB>(
    `sections_${INDEX_TOKEN}`
  );

  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`,
    { orderBy: { column: "year_name", ascending: false } }
  );

  const student = students?.[0];

  const handleSubmit = async (data: StudentFormData) => {
    if (!student?.id) return;

    try {
      await updateMutation.mutateAsync({
        id: student.id,
        updates: {
          first_name: data.first_name,
          middle_name: data.middle_name || null,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender as StudentDB["gender"],
          blood_group: data.blood_group || null,
          aadhar_number: data.aadhar_number || null,
          nationality: data.nationality || "Indian",
          religion: data.religion || null,
          caste: data.caste || null,
          category: (data.category as StudentDB["category"]) || null,
          admission_number: data.admission_number,
          roll_number: data.roll_number || null,
          class_id: data.class_id,
          section_id: data.section_id,
          academic_year_id: data.academic_year_id,
          admission_date: data.admission_date,
          previous_school: data.previous_school || null,
          email: data.email || null,
          phone: data.phone || null,
          address_line1: data.address_line1 || null,
          address_line2: data.address_line2 || null,
          city: data.city || null,
          state: data.state || null,
          pincode: data.pincode || null,
          country: data.country || "India",
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          emergency_contact_relation: data.emergency_contact_relation || null,
        },
      });

      toast({
        title: "Student updated",
        description: "The student has been successfully updated.",
      });

      navigate(`/students/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!canUpdate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to edit students.
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

  const initialData: Partial<StudentFormData> = {
    first_name: student.first_name,
    middle_name: student.middle_name || "",
    last_name: student.last_name,
    date_of_birth: student.date_of_birth,
    gender: student.gender,
    blood_group: student.blood_group || "",
    aadhar_number: student.aadhar_number || "",
    nationality: student.nationality,
    religion: student.religion || "",
    caste: student.caste || "",
    category: student.category || "",
    admission_number: student.admission_number,
    roll_number: student.roll_number || "",
    class_id: student.class_id,
    section_id: student.section_id,
    academic_year_id: student.academic_year_id,
    admission_date: student.admission_date,
    previous_school: student.previous_school || "",
    email: student.email || "",
    phone: student.phone || "",
    address_line1: student.address_line1 || "",
    address_line2: student.address_line2 || "",
    city: student.city || "",
    state: student.state || "",
    pincode: student.pincode || "",
    country: student.country,
    emergency_contact_name: student.emergency_contact_name || "",
    emergency_contact_phone: student.emergency_contact_phone || "",
    emergency_contact_relation: student.emergency_contact_relation || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/students/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-muted-foreground">
            Update {student.first_name} {student.last_name}'s information
          </p>
        </div>
      </div>

      <StudentForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/students/${id}`)}
        isSubmitting={updateMutation.isPending}
        classes={classes || []}
        sections={sections || []}
        academicYears={academicYears || []}
      />
    </div>
  );
}
