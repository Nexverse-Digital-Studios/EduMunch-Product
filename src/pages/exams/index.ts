/**
 * Exams Module
 * =============
 * Examination system including:
 * - Exam management (CRUD)
 * - Exam scheduling
 * - Marks entry and management
 * - Report card generation
 * - Grade calculations
 * - Export functionality
 */

export {
  ExamsList,
  ExamForm,
  ExamCreate,
  ExamDetail,
  ExamEdit,
  ExamSchedulePage,
  MarksEntryPage,
  ReportCardsPage,
  ExamsExportPage,
} from "./components";

export type {
  ExamDB,
  ExamSubjectDB,
  MarksDB,
  ReportCardDB,
  ExamFormData,
  MarksEntryData,
} from "./components/types";
