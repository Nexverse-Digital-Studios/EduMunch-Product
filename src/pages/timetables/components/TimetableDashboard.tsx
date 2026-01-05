/**
 * Timetable Dashboard
 * ====================
 * Overview dashboard for timetable management with tabbed interface
 * All sub-functionality is accessible via tabs, no separate routes needed
 */

import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Copy,
  AlertTriangle,
  UserCheck,
  Settings,
  FileDown,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

// Import sub-page components for tab content
import ViewTimetablesPage from "./ViewTimetablesPage";
import CreateTimetablePage from "./CreateTimetablePage";
import BulkCreatePage from "./BulkCreatePage";
import ConflictsPage from "./ConflictsPage";
import SubstitutePage from "./SubstitutePage";
import PeriodsPage from "./PeriodsPage";
import ExportTimetablePage from "./ExportTimetablePage";

const TimetableDashboard = () => {
  const { canView, canCreate, canUpdate, canExport } =
    useModulePermissions("timetable");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real data from database
  const { data: sectionsData } = useSupabaseTable(TABLES.SECTIONS);
  const { data: timetableData } = useSupabaseTable(TABLES.TIMETABLES, {
    filters: { is_active: true },
  });
  const { data: substitutionsData } = useSupabaseTable(
    TABLES.TIMETABLE_SUBSTITUTIONS,
    {
      filters: { is_active: true },
    }
  );

  // Calculate real stats
  const totalSections = sectionsData?.length || 0;

  // Get today's day name
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const classesToday =
    timetableData?.filter((entry) => entry.day_of_week === today).length || 0;

  // Active substitutions (today)
  const todayStr = new Date().toISOString().split("T")[0];
  const activeSubstitutions =
    substitutionsData?.filter((sub) => sub.substitution_date === todayStr)
      .length || 0;

  const quickActions = [
    {
      title: "View Timetables",
      description: "Browse all section timetables",
      icon: Eye,
      tabValue: "view",
      permission: canView,
      color: "bg-blue-500",
    },
    {
      title: "Create Timetable",
      description: "Create new timetable entry",
      icon: Plus,
      tabValue: "create",
      permission: canCreate,
      color: "bg-green-500",
    },
    {
      title: "Bulk Schedule",
      description: "Schedule multiple classes at once",
      icon: Calendar,
      tabValue: "bulk",
      permission: canCreate,
      color: "bg-purple-500",
    },
    {
      title: "View Conflicts",
      description: "Check scheduling conflicts",
      icon: AlertTriangle,
      tabValue: "conflicts",
      permission: canView,
      color: "bg-red-500",
    },
    {
      title: "Substitute Teacher",
      description: "Assign substitute teachers",
      icon: UserCheck,
      tabValue: "substitute",
      permission: canUpdate,
      color: "bg-yellow-500",
    },
    {
      title: "Period Settings",
      description: "Manage period configuration",
      icon: Settings,
      tabValue: "periods",
      permission: canUpdate,
      color: "bg-gray-500",
    },
    {
      title: "Export Timetable",
      description: "Download timetable data",
      icon: FileDown,
      tabValue: "export",
      permission: canExport,
      color: "bg-teal-500",
    },
  ];

  const stats = [
    {
      title: "Total Sections",
      value: totalSections.toString(),
      icon: Users,
      description: "Active sections with timetables",
    },
    {
      title: "Classes Today",
      value: classesToday.toString(),
      icon: Calendar,
      description: `Scheduled for ${today}`,
    },
    {
      title: "Active Substitutions",
      value: activeSubstitutions.toString(),
      icon: UserCheck,
      description: "Teachers on leave today",
    },
    {
      title: "Conflicts",
      value: "0",
      icon: AlertTriangle,
      description: "Scheduling conflicts",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timetable Management
          </h1>
          <p className="text-muted-foreground">
            Manage class schedules, periods, and substitutions
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setActiveTab("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Entry
          </Button>
        )}
      </div>

      {/* Tabs for all timetable functionality */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
          {canCreate && <TabsTrigger value="create">Create</TabsTrigger>}
          {canCreate && <TabsTrigger value="bulk">Bulk</TabsTrigger>}
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          {canUpdate && (
            <TabsTrigger value="substitute">Substitute</TabsTrigger>
          )}
          {canUpdate && <TabsTrigger value="periods">Periods</TabsTrigger>}
          {canExport && <TabsTrigger value="export">Export</TabsTrigger>}
        </TabsList>

        {/* Dashboard Tab - Quick Overview */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions
                .filter((action) => action.permission)
                .map((action) => (
                  <Card
                    key={action.tabValue}
                    className={`hover:shadow-md transition-shadow cursor-pointer h-full ${
                      activeTab === action.tabValue ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setActiveTab(action.tabValue)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Today's Schedule Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Schedule overview will be displayed here</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab("view")}
                >
                  View Full Timetable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Timetables Tab */}
        <TabsContent value="view">
          <ViewTimetablesPage />
        </TabsContent>

        {/* Create Timetable Tab */}
        {canCreate && (
          <TabsContent value="create">
            <CreateTimetablePage />
          </TabsContent>
        )}

        {/* Bulk Create Tab */}
        {canCreate && (
          <TabsContent value="bulk">
            <BulkCreatePage />
          </TabsContent>
        )}

        {/* Conflicts Tab */}
        <TabsContent value="conflicts">
          <ConflictsPage />
        </TabsContent>

        {/* Substitute Teacher Tab */}
        {canUpdate && (
          <TabsContent value="substitute">
            <SubstitutePage />
          </TabsContent>
        )}

        {/* Periods Settings Tab */}
        {canUpdate && (
          <TabsContent value="periods">
            <PeriodsPage />
          </TabsContent>
        )}

        {/* Export Tab */}
        {canExport && (
          <TabsContent value="export">
            <ExportTimetablePage />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TimetableDashboard;
