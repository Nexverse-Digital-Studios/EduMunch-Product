/**
 * Fee Management Components Index
 * =================================
 * Exports all fee management components
 * 
 * CONSOLIDATED: All fee pages consolidated into FeeDashboard with tabs
 */

// Types
export * from "./types";

// Main Dashboard (Consolidated)
export { FeeDashboard } from "./FeeDashboard";

// Sub-page Components (used as tab content)
export { FeeStructuresList } from "./FeeStructuresList";
export { StudentFeesList } from "./StudentFeesList";
export { FeeCollectionPage } from "./FeeCollectionPage";
export { FeeReceiptsPage } from "./FeeReceiptsPage";
export { FeeReportsPage } from "./FeeReportsPage";

// Dialog Components (Consolidated CRUD)
export { FeeStructureFormDialog } from "./FeeStructureFormDialog";
export { FeeStructureDetailDialog } from "./FeeStructureDetailDialog";
