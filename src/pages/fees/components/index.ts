/**
 * Fee Management Components Index
 * =================================
 * Exports all fee management components
 * 
 * CONSOLIDATED: Create/Edit via modal dialogs
 */

// Types
export * from "./types";

// Main Pages
export { FeeStructuresList } from "./FeeStructuresList";
export { FeeCollectionPage } from "./FeeCollectionPage";

// Dialog Components (Consolidated CRUD)
export { FeeStructureFormDialog } from "./FeeStructureFormDialog";
export { FeeStructureDetailDialog } from "./FeeStructureDetailDialog";

// Legacy exports (routes removed, kept for reference)
// export { FeeStructureForm, FeeStructureCreate, FeeStructureEdit } from "./FeeStructureForm";
// export { FeeStructureDetail } from "./FeeStructureDetail";
// export { StudentFeesList } from "./StudentFeesList";
// export { FeeReceiptsPage } from "./FeeReceiptsPage";
// export { FeeReportsPage } from "./FeeReportsPage";
// export { FeesExportPage } from "./FeesExportPage";
