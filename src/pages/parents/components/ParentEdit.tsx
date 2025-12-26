/**
 * ParentEdit Component
 * ====================
 * Page for editing an existing parent/guardian record
 */

import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";

import { ParentForm } from "./ParentForm";
import { ParentDB, ParentFormData } from "./types";

const INDEX_TOKEN = "1emaet";

export function ParentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: parents,
    isLoading,
    updateMutation,
  } = useSupabaseTable<ParentDB>(`parents_${INDEX_TOKEN}`, { filters: {} });

  const parent = useMemo(() => {
    return parents?.find((p) => p.id === id);
  }, [parents, id]);

  const initialData: Partial<ParentFormData> | undefined = useMemo(() => {
    if (!parent) return undefined;

    return {
      full_name: parent.full_name,
      relationship: parent.relationship,
      email: parent.email || "",
      phone: parent.phone,
      alternate_phone: parent.alternate_phone || "",
      occupation: parent.occupation || "",
      annual_income: parent.annual_income?.toString() || "",
      address_line1: parent.address_line1 || "",
      address_line2: parent.address_line2 || "",
      city: parent.city || "",
      state: parent.state || "",
      pincode: parent.pincode || "",
      country: parent.country || "India",
      aadhar_number: parent.aadhar_number || "",
    };
  }, [parent]);

  const handleSubmit = async (data: ParentFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updates = {
        full_name: data.full_name,
        relationship: data.relationship as ParentDB["relationship"],
        email: data.email || null,
        phone: data.phone,
        alternate_phone: data.alternate_phone || null,
        occupation: data.occupation || null,
        annual_income: data.annual_income
          ? parseFloat(data.annual_income)
          : null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        country: data.country || "India",
        aadhar_number: data.aadhar_number || null,
        updated_at: new Date().toISOString(),
      };

      await updateMutation.mutateAsync({ id, updates });

      toast({
        title: "Parent updated",
        description: `${data.full_name}'s details have been updated.`,
      });

      navigate(`/parents/${id}`);
    } catch (error) {
      console.error("Error updating parent:", error);
      toast({
        title: "Error",
        description: "Failed to update parent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Parent Not Found</h2>
        <p className="text-muted-foreground">
          The requested parent record could not be found.
        </p>
        <Button asChild>
          <Link to="/parents">Back to Parents</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/parents/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Parent</h1>
          <p className="text-muted-foreground">
            Update {parent.full_name}'s information
          </p>
        </div>
      </div>

      {/* Form */}
      <ParentForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel="Update Parent"
      />
    </div>
  );
}
