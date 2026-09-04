/**
 * Reports Components Index
 * ========================
 * Export all reports and analytics components
 */

export { ReportsDashboard } from "./ReportsDashboard";
export { StudentPerformanceReport } from "./StudentPerformanceReport";
export { AttendanceSummaryReport } from "./AttendanceSummaryReport";
export { AcademicTrendsReport } from "./AcademicTrendsReport";
export { FeeCollectionReport } from "./FeeCollectionReport";

// Types
export type {
  StudentPerformanceAnalytics,
  AttendancePatternAnalytics,
  AcademicTrendAnalytics,
  DashboardStats,
  ReportType,
  ReportConfig,
  ChartDataPoint,
  TimeSeriesData,
  ComparisonData,
  ReportFilters,
  StudentInfo,
  ClassInfo,
  SectionInfo,
  SubjectInfo,
  AcademicYearInfo,
} from "./types";

export { REPORT_CONFIGS } from "./types";
