/**
 * IDCardPreview Component
 * =======================
 * Preview component for ID card design
 */

import { CreditCard, Phone, MapPin, Droplets, Building } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  StudentForIDCard,
  StaffForIDCard,
  ClassInfo,
  SectionInfo,
  IDCardDesign,
} from "./types";

interface IDCardPreviewProps {
  type: "student" | "staff";
  data: StudentForIDCard | StaffForIDCard;
  design: IDCardDesign;
  classInfo?: ClassInfo;
  sectionInfo?: SectionInfo;
}

export function IDCardPreview({
  type,
  data,
  design,
  classInfo,
  sectionInfo,
}: IDCardPreviewProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const isStudent = type === "student";
  const studentData = isStudent ? (data as StudentForIDCard) : null;
  const staffData = !isStudent ? (data as StaffForIDCard) : null;

  return (
    <div
      className="w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg border"
      style={{ backgroundColor: design.backgroundColor }}
    >
      {/* Header */}
      <div
        className="p-4 text-center"
        style={{ backgroundColor: design.headerColor }}
      >
        <div className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5 text-white" />
          <h3 className="text-white font-bold text-lg">
            {isStudent ? "STUDENT ID CARD" : "STAFF ID CARD"}
          </h3>
        </div>
        <p className="text-white/80 text-sm mt-1">Academic Year 2024-25</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Photo & Basic Info */}
        <div className="flex gap-4">
          {design.showPhoto && (
            <Avatar
              className="h-24 w-24 rounded-lg border-2"
              style={{ borderColor: design.accentColor }}
            >
              <AvatarImage src={data.photo_url || undefined} />
              <AvatarFallback className="text-2xl rounded-lg">
                {getInitials(data.first_name, data.last_name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 space-y-1">
            <h4
              className="font-bold text-lg"
              style={{ color: design.textColor }}
            >
              {data.first_name} {data.last_name}
            </h4>
            {isStudent && studentData && (
              <>
                <p className="text-sm" style={{ color: design.textColor }}>
                  <span className="text-muted-foreground">Adm No:</span>{" "}
                  {studentData.admission_number}
                </p>
                {classInfo && sectionInfo && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: design.accentColor,
                      color: "white",
                    }}
                  >
                    {classInfo.class_name} - {sectionInfo.section_name}
                  </Badge>
                )}
              </>
            )}
            {!isStudent && staffData && (
              <>
                <p className="text-sm" style={{ color: design.textColor }}>
                  <span className="text-muted-foreground">Emp Code:</span>{" "}
                  {staffData.employee_code}
                </p>
                {staffData.designation && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: design.accentColor,
                      color: "white",
                    }}
                  >
                    {staffData.designation}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm" style={{ color: design.textColor }}>
          {design.showBloodGroup && data.blood_group && (
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-red-500" />
              <span>Blood Group: {data.blood_group}</span>
            </div>
          )}

          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone
                className="h-4 w-4"
                style={{ color: design.accentColor }}
              />
              <span>{data.phone}</span>
            </div>
          )}

          {design.showAddress && data.address_line1 && (
            <div className="flex items-start gap-2">
              <MapPin
                className="h-4 w-4 mt-0.5"
                style={{ color: design.accentColor }}
              />
              <span>
                {data.address_line1}
                {data.city && `, ${data.city}`}
              </span>
            </div>
          )}

          {!isStudent && staffData?.department && (
            <div className="flex items-center gap-2">
              <Building
                className="h-4 w-4"
                style={{ color: design.accentColor }}
              />
              <span>Dept: {staffData.department}</span>
            </div>
          )}

          {design.showEmergencyContact && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Emergency Contact:{" "}
                {isStudent
                  ? studentData?.phone || "Not provided"
                  : staffData?.emergency_contact || "Not provided"}
              </p>
            </div>
          )}
        </div>

        {/* Barcode placeholder */}
        {design.showBarcode && (
          <div className="pt-2 border-t">
            <div
              className="h-10 bg-gradient-to-r from-black via-white to-black"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${design.textColor} 0px, ${design.textColor} 2px, ${design.backgroundColor} 2px, ${design.backgroundColor} 4px)`,
              }}
            />
            <p
              className="text-xs text-center mt-1 font-mono"
              style={{ color: design.textColor }}
            >
              {isStudent
                ? studentData?.admission_number
                : staffData?.employee_code}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 text-center text-xs"
        style={{ backgroundColor: design.headerColor, color: "white" }}
      >
        <p>This card is the property of the institution</p>
        <p>If found, please return to the school office</p>
      </div>
    </div>
  );
}
