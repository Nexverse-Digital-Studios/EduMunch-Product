/**
 * ParentCreate Component
 * ======================
 * Page for creating a new parent/guardian record
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";

import { ParentForm } from "./ParentForm";
import { ParentDB, ParentFormData } from "./types";

const INDEX_TOKEN = "1emaet";

export function ParentCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createMutation } = useSupabaseTable<ParentDB>(
    `parents_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const handleSubmit = async (data: ParentFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
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
      };

      await createMutation.mutateAsync(payload);

      toast({
        title: "Parent created",
        description: `${data.full_name} has been added successfully.`,
      });

      navigate("/parents");
    } catch (error) {
      console.error("Error creating parent:", error);
      toast({
        title: "Error",
        description: "Failed to create parent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/parents">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Parent</h1>
          <p className="text-muted-foreground">
            Create a new parent or guardian record
          </p>
        </div>
      </div>

      {/* Form */}
      <ParentForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel="Create Parent"
      />
    </div>
  );
}
