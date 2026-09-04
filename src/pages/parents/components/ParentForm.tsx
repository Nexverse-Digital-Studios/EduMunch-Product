/**
 * ParentForm Component
 * ====================
 * Reusable form for creating and editing parent/guardian records
 */

import { useForm } from "react-hook-form";
import { Loader2, User, Phone, MapPin, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import {
  ParentFormData,
  DEFAULT_PARENT_FORM,
  RELATIONSHIP_OPTIONS,
  OCCUPATION_OPTIONS,
} from "./types";

interface ParentFormProps {
  initialData?: Partial<ParentFormData>;
  onSubmit: (data: ParentFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ParentForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save Parent",
}: ParentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ParentFormData>({
    defaultValues: {
      ...DEFAULT_PARENT_FORM,
      ...initialData,
    },
  });

  const relationship = watch("relationship");
  const occupation = watch("occupation");

  const handleFormSubmit = async (data: ParentFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="Enter full name"
              {...register("full_name", { required: "Full name is required" })}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">
              Relationship <span className="text-red-500">*</span>
            </Label>
            <Select
              value={relationship}
              onValueChange={(value) => setValue("relationship", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register("relationship", {
                required: "Relationship is required",
              })}
            />
            {errors.relationship && (
              <p className="text-sm text-red-500">
                {errors.relationship.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Select
              value={occupation}
              onValueChange={(value) => setValue("occupation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {OCCUPATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_income">Annual Income (₹)</Label>
            <Input
              id="annual_income"
              type="number"
              placeholder="e.g., 500000"
              {...register("annual_income")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="10-digit mobile number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              })}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternate_phone">Alternate Phone</Label>
            <Input
              id="alternate_phone"
              placeholder="Alternate contact number"
              {...register("alternate_phone", {
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              })}
            />
            {errors.alternate_phone && (
              <p className="text-sm text-red-500">
                {errors.alternate_phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register("email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              placeholder="House/Flat No., Building Name"
              {...register("address_line1")}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              placeholder="Street, Area, Landmark"
              {...register("address_line2")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Enter city" {...register("city")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="Enter state"
              {...register("state")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              placeholder="6-digit pincode"
              {...register("pincode", {
                pattern: {
                  value: /^\d{6}$/,
                  message: "Enter a valid 6-digit pincode",
                },
              })}
            />
            {errors.pincode && (
              <p className="text-sm text-red-500">{errors.pincode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} defaultValue="India" />
          </div>
        </CardContent>
      </Card>

      {/* Document Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="aadhar_number">Aadhar Number</Label>
            <Input
              id="aadhar_number"
              placeholder="12-digit Aadhar number"
              {...register("aadhar_number", {
                pattern: {
                  value: /^\d{12}$/,
                  message: "Enter a valid 12-digit Aadhar number",
                },
              })}
            />
            {errors.aadhar_number && (
              <p className="text-sm text-red-500">
                {errors.aadhar_number.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
