/**
 * Academic Year Form Component
 * =============================
 * Reusable form for create/edit academic year
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { AcademicYearDB, AcademicYearFormData } from "./types";

interface AcademicYearFormProps {
  initialData?: AcademicYearDB;
  onSubmit: (data: AcademicYearFormData) => Promise<void>;
  isLoading?: boolean;
}

const AcademicYearForm = ({
  initialData,
  onSubmit,
  isLoading,
}: AcademicYearFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<AcademicYearFormData>({
    year_code: initialData?.year_code || "",
    year_name: initialData?.year_name || "",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    is_current: initialData?.is_current || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        year_code: initialData.year_code,
        year_name: initialData.year_name,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        is_current: initialData.is_current,
      });
    }
  }, [initialData]);

  // Auto-generate year code from dates
  useEffect(() => {
    if (formData.start_date && formData.end_date && !initialData) {
      const startYear = new Date(formData.start_date).getFullYear();
      const endYear = new Date(formData.end_date).getFullYear();
      if (startYear !== endYear) {
        setFormData((prev) => ({
          ...prev,
          year_code: `${startYear}-${endYear.toString().slice(-2)}`,
          year_name: `Academic Year ${startYear}-${endYear
            .toString()
            .slice(-2)}`,
        }));
      }
    }
  }, [formData.start_date, formData.end_date, initialData]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.year_code.trim()) {
      newErrors.year_code = "Year code is required";
    }
    if (!formData.year_name.trim()) {
      newErrors.year_name = "Year name is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save academic year.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialData ? "Edit Academic Year" : "Create Academic Year"}
          </h1>
          <p className="text-muted-foreground">
            {initialData
              ? "Update academic year details"
              : "Add a new academic year to the system"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Year Details
          </CardTitle>
          <CardDescription>
            Enter the details for the academic year
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dates Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                className={errors.start_date ? "border-destructive" : ""}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                }
                min={formData.start_date}
                className={errors.end_date ? "border-destructive" : ""}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Name and Code Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year_code">Year Code *</Label>
              <Input
                id="year_code"
                placeholder="e.g., 2024-25"
                value={formData.year_code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year_code: e.target.value,
                  }))
                }
                className={errors.year_code ? "border-destructive" : ""}
              />
              {errors.year_code && (
                <p className="text-sm text-destructive">{errors.year_code}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Unique identifier for this academic year
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_name">Year Name *</Label>
              <Input
                id="year_name"
                placeholder="e.g., Academic Year 2024-25"
                value={formData.year_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year_name: e.target.value,
                  }))
                }
                className={errors.year_name ? "border-destructive" : ""}
              />
              {errors.year_name && (
                <p className="text-sm text-destructive">{errors.year_name}</p>
              )}
            </div>
          </div>

          {/* Current Year Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Set as Current Year</Label>
              <p className="text-sm text-muted-foreground">
                Mark this as the active academic year for the institution
              </p>
            </div>
            <Switch
              checked={formData.is_current}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_current: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default AcademicYearForm;
