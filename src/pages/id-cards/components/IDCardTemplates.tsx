/**
 * IDCardTemplates Component
 * =========================
 * Manage ID card design templates
 */

import { useState } from "react";
import { Palette, Users, UserCheck, Check, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  IDCardDesign,
  DEFAULT_STUDENT_TEMPLATE,
  DEFAULT_STAFF_TEMPLATE,
  StudentForIDCard,
  StaffForIDCard,
} from "./types";
import { IDCardPreview } from ".";

// Sample data for preview
const SAMPLE_STUDENT: StudentForIDCard = {
  id: "1",
  admission_number: "ADM-2024-001",
  roll_number: "15",
  first_name: "Rahul",
  last_name: "Sharma",
  date_of_birth: "2010-05-15",
  blood_group: "O+",
  photo_url: null,
  class_id: "1",
  section_id: "1",
  phone: "9876543210",
  address_line1: "123, Gandhi Nagar",
  city: "Mumbai",
  status: "active",
};

const SAMPLE_STAFF: StaffForIDCard = {
  id: "1",
  employee_code: "EMP-001",
  first_name: "Priya",
  last_name: "Verma",
  designation: "Senior Teacher",
  department: "Mathematics",
  date_of_joining: "2020-06-01",
  blood_group: "A+",
  photo_url: null,
  phone: "9876543211",
  emergency_contact: "9876543212",
  address_line1: "456, Nehru Road",
  city: "Mumbai",
  status: "active",
};

interface IDCardTemplatesProps {
  embedded?: boolean;
}

export function IDCardTemplates({ embedded = false }: IDCardTemplatesProps) {
  const [studentDesign, setStudentDesign] = useState<IDCardDesign>(
    DEFAULT_STUDENT_TEMPLATE
  );
  const [staffDesign, setStaffDesign] = useState<IDCardDesign>(
    DEFAULT_STAFF_TEMPLATE
  );
  const [showPreview, setShowPreview] = useState<"student" | "staff" | null>(
    null
  );

  const { canUpdate } = useModulePermissions("id_cards");
  const { toast } = useToast();

  const handleSave = (type: "student" | "staff") => {
    toast({
      title: "Template saved",
      description: `${
        type === "student" ? "Student" : "Staff"
      } ID card template has been updated.`,
    });
  };

  const updateDesign = (
    type: "student" | "staff",
    key: keyof IDCardDesign,
    value: any
  ) => {
    if (type === "student") {
      setStudentDesign((prev) => ({ ...prev, [key]: value }));
    } else {
      setStaffDesign((prev) => ({ ...prev, [key]: value }));
    }
  };

  const renderDesignEditor = (type: "student" | "staff") => {
    const design = type === "student" ? studentDesign : staffDesign;

    return (
      <div className="space-y-6">
        {/* Colors */}
        <div className="space-y-4">
          <h3 className="font-medium">Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={design.backgroundColor}
                  onChange={(e) =>
                    updateDesign(type, "backgroundColor", e.target.value)
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={design.backgroundColor}
                  onChange={(e) =>
                    updateDesign(type, "backgroundColor", e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Header Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={design.headerColor}
                  onChange={(e) =>
                    updateDesign(type, "headerColor", e.target.value)
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={design.headerColor}
                  onChange={(e) =>
                    updateDesign(type, "headerColor", e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={design.textColor}
                  onChange={(e) =>
                    updateDesign(type, "textColor", e.target.value)
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={design.textColor}
                  onChange={(e) =>
                    updateDesign(type, "textColor", e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={design.accentColor}
                  onChange={(e) =>
                    updateDesign(type, "accentColor", e.target.value)
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={design.accentColor}
                  onChange={(e) =>
                    updateDesign(type, "accentColor", e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-4">
          <h3 className="font-medium">Display Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Show Photo</Label>
              <Switch
                checked={design.showPhoto}
                onCheckedChange={(v) => updateDesign(type, "showPhoto", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Blood Group</Label>
              <Switch
                checked={design.showBloodGroup}
                onCheckedChange={(v) => updateDesign(type, "showBloodGroup", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Address</Label>
              <Switch
                checked={design.showAddress}
                onCheckedChange={(v) => updateDesign(type, "showAddress", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Emergency Contact</Label>
              <Switch
                checked={design.showEmergencyContact}
                onCheckedChange={(v) =>
                  updateDesign(type, "showEmergencyContact", v)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show QR Code</Label>
              <Switch
                checked={design.showQRCode}
                onCheckedChange={(v) => updateDesign(type, "showQRCode", v)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowPreview(type)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {canUpdate && (
            <Button onClick={() => handleSave(type)}>
              <Check className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold">ID Card Templates</h1>
          <p className="text-muted-foreground">
            Customize the design of student and staff ID cards
          </p>
        </div>
      )}

      {/* Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Template Designer
          </CardTitle>
          <CardDescription>
            Configure colors and display options for ID cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student Template
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Staff Template
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-6">
              {renderDesignEditor("student")}
            </TabsContent>

            <TabsContent value="staff" className="mt-6">
              {renderDesignEditor("staff")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showPreview === "student" ? "Student" : "Staff"} ID Card Preview
            </DialogTitle>
          </DialogHeader>
          {showPreview === "student" && (
            <IDCardPreview
              type="student"
              data={SAMPLE_STUDENT}
              design={studentDesign}
              classInfo={{
                id: "1",
                class_name: "Class 10",
                class_code: "CLS-10",
              }}
              sectionInfo={{
                id: "1",
                section_name: "A",
                section_code: "SEC-A",
                class_id: "1",
              }}
            />
          )}
          {showPreview === "staff" && (
            <IDCardPreview
              type="staff"
              data={SAMPLE_STAFF}
              design={staffDesign}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
