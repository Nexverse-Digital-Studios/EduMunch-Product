/**
 * Exams Module
 * =============
 * Examination system including:
 * - Exam management (CRUD via modals)
 * - Marks entry and management
 * - Report card generation
 * - Grade calculations
 * 
 * CONSOLIDATED: Create/Edit via modal dialogs in ExamsList
 * Schedule and Export functionality integrated into ExamDetail
 */

export {
  ExamsList,
  ExamForm,
  ExamDetail,
  MarksEntryPage,
  ReportCardsPage,
  ExamFormDialog,
} from "./components";

export type {
  ExamDB,
  ExamSubjectDB,
  MarksDB,
  ReportCardDB,
  ExamFormData,
  MarksEntryData,
} from "./components/types";
