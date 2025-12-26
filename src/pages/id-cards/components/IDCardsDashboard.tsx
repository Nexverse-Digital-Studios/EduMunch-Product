/**
 * IDCardsDashboard Component
 * ==========================
 * Main dashboard for ID card management
 */

import { Link } from "react-router-dom";
import {
  CreditCard,
  Users,
  UserCheck,
  Palette,
  Download,
  Printer,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { StudentForIDCard, StaffForIDCard } from "./types";

const INDEX_TOKEN = "1emaet";

export function IDCardsDashboard() {
  const { canCreate } = useModulePermissions("id_cards");

  // Fetch students count
  const { data: students } = useSupabaseTable<StudentForIDCard>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch staff count
  const { data: staff } = useSupabaseTable<StaffForIDCard>(
    `employees_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const activeStudents =
    students?.filter((s) => s.status === "active").length || 0;
  const activeStaff = staff?.filter((s) => s.status === "active").length || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">ID Cards Management</h1>
        <p className="text-muted-foreground">
          Generate and manage ID cards for students and staff
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              Eligible for ID card generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff}</div>
            <p className="text-xs text-muted-foreground">
              Eligible for ID card generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeStudents + activeStaff}
            </div>
            <p className="text-xs text-muted-foreground">
              Total ID cards possible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student ID Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Student ID Cards
            </CardTitle>
            <CardDescription>
              Generate and print ID cards for students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/id-cards/students">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
              {canCreate && (
                <Button className="justify-start" asChild>
                  <Link to="/id-cards/students/generate">
                    <Printer className="mr-2 h-4 w-4" />
                    Generate
                  </Link>
                </Button>
              )}
            </div>
            <div className="pt-2 border-t">
              <Link
                to="/id-cards/students"
                className="text-sm text-primary flex items-center hover:underline"
              >
                Manage student ID cards
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Staff ID Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              Staff ID Cards
            </CardTitle>
            <CardDescription>
              Generate and print ID cards for staff members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/id-cards/staff">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
              {canCreate && (
                <Button className="justify-start" asChild>
                  <Link to="/id-cards/staff/generate">
                    <Printer className="mr-2 h-4 w-4" />
                    Generate
                  </Link>
                </Button>
              )}
            </div>
            <div className="pt-2 border-t">
              <Link
                to="/id-cards/staff"
                className="text-sm text-primary flex items-center hover:underline"
              >
                Manage staff ID cards
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates & Bulk Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-orange-500" />
              ID Card Templates
            </CardTitle>
            <CardDescription>Customize the design of ID cards</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/id-cards/templates">
                <Palette className="mr-2 h-4 w-4" />
                Manage Templates
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Generate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-violet-500" />
              Bulk Generation
            </CardTitle>
            <CardDescription>
              Generate multiple ID cards at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canCreate ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/id-cards/bulk-generate">
                  <Download className="mr-2 h-4 w-4" />
                  Bulk Generate Cards
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                You don't have permission to generate ID cards.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
