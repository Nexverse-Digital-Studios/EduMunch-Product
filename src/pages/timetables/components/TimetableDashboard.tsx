/**
 * Timetable Dashboard
 * ====================
 * Overview dashboard for timetable management with quick actions
 */

import { Link } from "react-router-dom";
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
import { useModulePermissions } from "@/contexts/PermissionContext";

const TimetableDashboard = () => {
  const { canView, canCreate, canUpdate, canExport } =
    useModulePermissions("timetable");

  const quickActions = [
    {
      title: "View Timetables",
      description: "Browse all section timetables",
      icon: Eye,
      href: "/timetable/view",
      permission: canView,
      color: "bg-blue-500",
    },
    {
      title: "Create Timetable",
      description: "Create new timetable entry",
      icon: Plus,
      href: "/timetable/create",
      permission: canCreate,
      color: "bg-green-500",
    },
    {
      title: "Bulk Schedule",
      description: "Schedule multiple classes at once",
      icon: Calendar,
      href: "/timetable/bulk-create",
      permission: canCreate,
      color: "bg-purple-500",
    },
    {
      title: "Copy Schedule",
      description: "Copy from previous week",
      icon: Copy,
      href: "/timetable/copy",
      permission: canCreate,
      color: "bg-orange-500",
    },
    {
      title: "View Conflicts",
      description: "Check scheduling conflicts",
      icon: AlertTriangle,
      href: "/timetable/conflicts",
      permission: canView,
      color: "bg-red-500",
    },
    {
      title: "Substitute Teacher",
      description: "Assign substitute teachers",
      icon: UserCheck,
      href: "/timetable/substitute",
      permission: canUpdate,
      color: "bg-yellow-500",
    },
    {
      title: "Period Settings",
      description: "Manage period configuration",
      icon: Settings,
      href: "/timetable/periods",
      permission: canUpdate,
      color: "bg-gray-500",
    },
    {
      title: "Export Timetable",
      description: "Download timetable data",
      icon: FileDown,
      href: "/timetable/export",
      permission: canExport,
      color: "bg-teal-500",
    },
  ];

  const stats = [
    {
      title: "Total Sections",
      value: "24",
      icon: Users,
      description: "Active sections with timetables",
    },
    {
      title: "Classes Today",
      value: "86",
      icon: Calendar,
      description: "Scheduled for today",
    },
    {
      title: "Active Substitutions",
      value: "3",
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
          <Button asChild>
            <Link to="/timetable/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Entry
            </Link>
          </Button>
        )}
      </div>

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
              <Link key={action.href} to={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
              </Link>
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
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/timetable/view">View Full Timetable</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableDashboard;
