/**
 * IDCardsDashboard Component
 * ==========================
 * Main dashboard for ID card management
 * 
 * CONSOLIDATED: All ID card routes into single dashboard with tabs
 */

import { useState } from "react";
import {
  CreditCard,
  Users,
  UserCheck,
  Palette,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { StudentForIDCard, StaffForIDCard } from "./types";
import { StudentIDCards } from "./StudentIDCards";
import { StaffIDCards } from "./StaffIDCards";
import { IDCardTemplates } from "./IDCardTemplates";

const INDEX_TOKEN = "1emaet";

export function IDCardsDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
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
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("students")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Student Cards
                </Button>
              </CardContent>
            </Card>

            {/* Staff ID Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  Staff ID Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("staff")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Staff Cards
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Templates & Bulk Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-orange-500" />
                  ID Card Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("templates")}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Manage Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-violet-500" />
                  Bulk Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {canCreate ? (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bulk")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Bulk Generate Cards
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You don't have permission to generate ID cards.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentIDCards embedded />
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <StaffIDCards embedded />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <IDCardTemplates embedded />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk ID Card Generation</CardTitle>
            </CardHeader>
            <CardContent>
              {canCreate ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Generate ID cards for multiple students or staff members at once.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={() => toast({ title: "Bulk Generate Students", description: "Generating ID cards for all students..." })}>
                      <Users className="mr-2 h-4 w-4" />
                      Generate All Student Cards
                    </Button>
                    <Button variant="outline" onClick={() => toast({ title: "Bulk Generate Staff", description: "Generating ID cards for all staff..." })}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Generate All Staff Cards
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You don't have permission to generate ID cards.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
