/**
 * Exams Module Components Index
 * ==============================
 * Exports all exam, marks, and report card components
 * 
 * CONSOLIDATED: Create/Edit via modal dialogs
 */

// Main Pages
export { ExamsList } from "./ExamsList";
export { ExamDetail } from "./ExamDetail";
export { ReportCardsPage } from "./ReportCardsPage";
export { MarksEntryPage } from "./MarksEntryPage";

// Dialog Components (Consolidated CRUD)
export { ExamFormDialog } from "./ExamFormDialog";

// Legacy form component (may be used elsewhere)
export { ExamForm } from "./ExamForm";

// Legacy page exports (routes removed, kept for reference)
// export { ExamCreate } from "./ExamCreate";
// export { ExamEdit } from "./ExamEdit";
// export { ExamSchedulePage } from "./ExamSchedulePage";
// export { ExamsExportPage } from "./ExamsExportPage";

// Types
export * from "./types";
