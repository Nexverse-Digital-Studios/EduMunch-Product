/**
 * Fee Structure Detail Dialog
 * ============================
 * Modal dialog for viewing fee structure details
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Calendar, GraduationCap, Info, List } from "lucide-react";
import { FeeStructureDB } from "./types";

interface ClassDB {
  id: string;
  class_name: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
  is_current: boolean;
}

interface FeeComponent {
  name: string;
  amount: number;
  is_optional: boolean;
}

interface FeeStructureDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structure: FeeStructureDB | null;
  classes: ClassDB[];
  academicYears: AcademicYearDB[];
}

export function FeeStructureDetailDialog({
  open,
  onOpenChange,
  structure,
  classes,
  academicYears,
}: FeeStructureDetailDialogProps) {
  if (!structure) return null;

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls?.class_name || "Unknown";
  };

  const getYearName = (yearId: string) => {
    const year = academicYears.find((y) => y.id === yearId);
    return year?.year_name || "Unknown";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseComponents = (): FeeComponent[] => {
    if (!structure.fee_components) return [];
    try {
      if (Array.isArray(structure.fee_components)) {
        return structure.fee_components.map((c) => ({
          name: (c as any).name || "",
          amount: (c as any).amount || 0,
          is_optional: (c as any).is_optional || false,
        }));
      }
      return [];
    } catch {
      return [];
    }
  };

  const components = parseComponents();
  const mandatoryTotal = components
    .filter((c) => !c.is_optional)
    .reduce((sum, c) => sum + c.amount, 0);
  const optionalTotal = components
    .filter((c) => c.is_optional)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            {structure.structure_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 p-1">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={structure.is_active ? "default" : "secondary"}>
                {structure.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Class
                    </p>
                    <p className="font-medium">{getClassName(structure.class_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Academic Year
                    </p>
                    <p className="font-medium">{getYearName(structure.academic_year_id)}</p>
                  </div>
                </div>
                {structure.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{structure.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Components */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Fee Components ({components.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {components.length > 0 ? (
                  <div className="space-y-2">
                    {components.map((component, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span>{component.name}</span>
                          {component.is_optional && (
                            <Badge variant="outline" className="text-xs">
                              Optional
                            </Badge>
                          )}
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(component.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No fee components defined
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Fee Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mandatory Components</span>
                  <span className="font-semibold">{formatCurrency(mandatoryTotal)}</span>
                </div>
                {optionalTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Optional Components</span>
                    <span className="font-semibold">{formatCurrency(optionalTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(structure.total_amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>
                      {structure.created_at
                        ? new Date(structure.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>
                      {structure.updated_at
                        ? new Date(structure.updated_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default FeeStructureDetailDialog;
