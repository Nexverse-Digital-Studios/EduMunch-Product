/**
 * Fee Dashboard Page
 * ====================
 * Consolidated fee management with tabs for all fee functions
 *
 * CONSOLIDATED: All fee routes into single dashboard with tabs
 * - Structures tab: Fee structure management (create/edit via modals)
 * - Student Fees tab: View student fee assignments
 * - Collection tab: Collect payments
 * - Receipts tab: View payment receipts
 * - Reports tab: Fee analytics and reports
 */

import { useSearchParams } from "react-router-dom";
import {
  IndianRupee,
  ClipboardList,
  Receipt,
  FileText,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermissions } from "@/contexts/PermissionContext";

// Import tab content components
import { FeeStructuresList } from "./FeeStructuresList";
import { StudentFeesList } from "./StudentFeesList";
import { FeeCollectionPage } from "./FeeCollectionPage";
import { FeeReceiptsPage } from "./FeeReceiptsPage";
import { FeeReportsPage } from "./FeeReportsPage";

export function FeeDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "structures";
  const { canView, canExport } = useModulePermissions("fees");

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!canView) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        You don't have permission to view fee management.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            Manage fee structures, collections, and reports
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="structures" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            <span className="hidden sm:inline">Structures</span>
          </TabsTrigger>
          <TabsTrigger value="student-fees" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Student Fees</span>
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            <span className="hidden sm:inline">Collection</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Receipts</span>
          </TabsTrigger>
          {canExport && (
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="structures" className="space-y-4">
          <FeeStructuresList embedded />
        </TabsContent>

        <TabsContent value="student-fees" className="space-y-4">
          <StudentFeesList
            embedded
            onCollectFee={(feeId) => {
              // Switch to collection tab with the fee ID
              handleTabChange("collection");
            }}
          />
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <FeeCollectionPage embedded />
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <FeeReceiptsPage embedded />
        </TabsContent>

        {canExport && (
          <TabsContent value="reports" className="space-y-4">
            <FeeReportsPage embedded />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
