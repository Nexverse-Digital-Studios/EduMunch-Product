/**
 * Academic Year Detail Page
 * ==========================
 * View academic year details
 * Route: /academic-years/:id
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Edit,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import type { AcademicYearDB } from "./types";

const AcademicYearDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canUpdate } = useModulePermissions("academic_years");

  // Fetch academic year
  const { data: academicYears, isLoading } = useSupabaseTable<AcademicYearDB>(
    TABLES.ACADEMIC_YEARS,
    {
      filters: { id },
    }
  );

  const academicYear = academicYears?.[0];

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate duration
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} month(s), ${days} day(s)`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!academicYear) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Academic Year Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              The academic year you're looking for doesn't exist.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/academic-years")}
            >
              Back to List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {academicYear.year_name}
              </h1>
              {academicYear.is_current && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Current
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Academic Year Details</p>
          </div>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link to={`/academic-years/${academicYear.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      {/* Details Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Year Code</p>
                <Badge variant="outline" className="mt-1">
                  {academicYear.year_code}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  {academicYear.is_current ? (
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Year Name</p>
              <p className="font-medium">{academicYear.year_name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {formatDate(academicYear.start_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{formatDate(academicYear.end_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="font-medium">
                {calculateDuration(
                  academicYear.start_date,
                  academicYear.end_date
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p>{new Date(academicYear.created_at).toLocaleString("en-IN")}</p>
            </div>
            {academicYear.updated_at && (
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>
                  {new Date(academicYear.updated_at).toLocaleString("en-IN")}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">ID</p>
              <p className="font-mono text-xs">{academicYear.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {canUpdate && !academicYear.is_current && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              <Star className="mr-2 h-4 w-4" />
              Set as Current Year
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicYearDetail;
