import { useNavigate } from "react-router-dom";
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

export function StudentCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions("students");

  const { createMutation } = useSupabaseTable<StudentDB>(
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

  const handleSubmit = async (data: StudentFormData) => {
    try {
      await createMutation.mutateAsync({
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
        status: "active",
      });

      toast({
        title: "Student created",
        description: "The student has been successfully added.",
      });

      navigate("/students");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create student. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!canCreate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to create students.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/students")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-muted-foreground">
            Fill in the details to register a new student
          </p>
        </div>
      </div>

      <StudentForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/students")}
        isSubmitting={createMutation.isPending}
        classes={classes || []}
        sections={sections || []}
        academicYears={academicYears || []}
      />
    </div>
  );
}
