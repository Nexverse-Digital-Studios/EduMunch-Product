import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  IndianRupee,
  Calendar,
  GraduationCap,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { FeeStructureDB } from "./types";

const INDEX_TOKEN = "1emaet";

interface ClassDB {
  id: string;
  class_name: string;
}

interface AcademicYearDB {
  id: string;
  year_name: string;
}

interface FeeComponent {
  name: string;
  amount: number;
  is_optional: boolean;
}

export function FeeStructureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canView, canUpdate, canDelete } = useModulePermissions("fees");

  const { data: structures, isLoading } = useSupabaseTable<FeeStructureDB>(
    `fee_structures_${INDEX_TOKEN}`,
    { filters: { id } }
  );

  const { deleteMutation } = useSupabaseTable<FeeStructureDB>(
    `fee_structures_${INDEX_TOKEN}`
  );

  const { data: classes } = useSupabaseTable<ClassDB>(`classes_${INDEX_TOKEN}`);
  const { data: academicYears } = useSupabaseTable<AcademicYearDB>(
    `academic_years_${INDEX_TOKEN}`
  );

  const structure = structures?.[0];
  const className =
    classes?.find((c) => c.id === structure?.class_id)?.class_name || "N/A";
  const yearName =
    academicYears?.find((y) => y.id === structure?.academic_year_id)
      ?.year_name || "N/A";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseComponents = (): FeeComponent[] => {
    if (!structure?.fee_components) return [];
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

  const handleDelete = async () => {
    if (!structure?.id) return;

    try {
      await deleteMutation.mutateAsync(structure.id);
      toast({
        title: "Success",
        description: "Fee structure deleted successfully.",
      });
      navigate("/fees/structures");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete fee structure.",
        variant: "destructive",
      });
    }
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view fee structures.
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

  if (!structure) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Fee structure not found.
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
            onClick={() => navigate("/fees/structures")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {structure.structure_name}
            </h1>
            <p className="text-muted-foreground">Fee structure details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              onClick={() => navigate(`/fees/structures/${id}/edit`)}
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
                  <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this fee structure? This
                    action cannot be undone. Students linked to this structure
                    will need to be reassigned.
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

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{className}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearName}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(structure.total_amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {structure.is_active ? (
                <Badge variant="default" className="mt-1 bg-green-500">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-1">
                  Inactive
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {structure.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{structure.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Fee Components */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Components</CardTitle>
          <CardDescription>
            Breakdown of all fee components in this structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((component, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {component.name}
                  </TableCell>
                  <TableCell>
                    {component.is_optional ? (
                      <Badge variant="outline">Optional</Badge>
                    ) : (
                      <Badge variant="default">Mandatory</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(component.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {components.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No fee components defined
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Mandatory Components
              </span>
              <span className="font-medium">
                {formatCurrency(mandatoryTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Optional Components</span>
              <span className="font-medium">
                {formatCurrency(optionalTotal)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Grand Total (All)</span>
              <span>{formatCurrency(mandatoryTotal + optionalTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {new Date(structure.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(structure.updated_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
