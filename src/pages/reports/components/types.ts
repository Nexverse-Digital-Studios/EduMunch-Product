/**
 * Reports & Analytics Types
 * =========================
 * Type definitions for reporting and analytics module
 *
 * Tables (INDEX_TOKEN = 1emaet):
 * - analytics_student_performance_1emaet
 * - analytics_attendance_patterns_1emaet
 * - analytics_academic_trends_1emaet
 */

// Student Performance Analytics
export interface StudentPerformanceAnalytics {
  id: string;
  student_id: string;
  academic_year_id: string;
  subject_id: string | null;
  
  // Performance Metrics
  current_percentage: number | null;
  predicted_percentage: number | null;
  strength_areas: string[] | null;
  weakness_areas: string[] | null;
  improvement_rate: number | null;
  
  // AI Insights
  risk_level: "Low" | "Medium" | "High" | "Critical" | null;
  personalized_suggestions: string | null;
  recommended_study_hours: number | null;
  recommended_topics: string[] | null;
  
  // Metadata
  last_analyzed_at: string | null;
  data_points_count: number | null;
  confidence_score: number | null;
  
  created_at: string;
  updated_at: string;
}

// Attendance Pattern Analytics
export interface AttendancePatternAnalytics {
  id: string;
  student_id: string;
  academic_year_id: string;
  
  // Attendance Metrics
  attendance_percentage: number | null;
  consecutive_absences: number | null;
  irregular_pattern_detected: boolean;
  
  // Risk Assessment
  dropout_risk_score: number | null;
  dropout_risk_level: "Low" | "Medium" | "High" | "Critical" | null;
  
  // Patterns Detected
  frequent_absence_days: string[] | null;
  absence_reasons_distribution: Record<string, number> | null;
  
  // Alerts
  alert_sent: boolean;
  alert_sent_at: string | null;
  parent_contacted: boolean;
  intervention_required: boolean;
  
  // Analysis Window
  analysis_period_start: string;
  analysis_period_end: string;
  
  created_at: string;
  updated_at: string;
}

// Academic Trend Analytics
export interface AcademicTrendAnalytics {
  id: string;
  
  // Scope
  analysis_type: "Class" | "Section" | "Subject" | "Teacher" | "School";
  class_id: string | null;
  section_id: string | null;
  subject_id: string | null;
  teacher_id: string | null;
  academic_year_id: string;
  
  // Performance Trends
  average_percentage: number | null;
  pass_percentage: number | null;
  excellence_percentage: number | null;
  trend_direction: "Improving" | "Declining" | "Stable" | null;
  
  // Comparative Analysis
  comparison_with_previous_year: number | null;
  rank_in_school: number | null;
  
  // Teacher Effectiveness
  student_satisfaction_score: number | null;
  average_marks_improvement: number | null;
  teaching_effectiveness_rating: number | null;
  
  // Time Period
  analysis_period_start: string;
  analysis_period_end: string;
  
  // Insights
  key_insights: string | null;
  recommendations: string | null;
  
  generated_at: string | null;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  averageAttendance: number;
  averagePerformance: number;
  feeCollectionRate: number;
}

// Report Types
export type ReportType = 
  | "student-performance"
  | "attendance-summary"
  | "academic-trends"
  | "fee-collection"
  | "teacher-workload"
  | "class-analysis";

export interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: string;
  category: "academic" | "attendance" | "financial" | "staff";
  formats: ("pdf" | "excel" | "csv")[];
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  change: number;
}

// Filter Options
export interface ReportFilters {
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Student Info for reports
export interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  section_id: string;
}

// Class Info for reports
export interface ClassInfo {
  id: string;
  class_name: string;
  class_code: string;
}

// Section Info for reports
export interface SectionInfo {
  id: string;
  section_name: string;
  section_code: string;
  class_id: string;
}

// Subject Info for reports
export interface SubjectInfo {
  id: string;
  subject_name: string;
  subject_code: string;
}

// Academic Year Info
export interface AcademicYearInfo {
  id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

// Available Reports Configuration
export const REPORT_CONFIGS: ReportConfig[] = [
  {
    id: "student-performance",
    title: "Student Performance Report",
    description: "Detailed analysis of student academic performance",
    icon: "GraduationCap",
    category: "academic",
    formats: ["pdf", "excel"],
  },
  {
    id: "attendance-summary",
    title: "Attendance Summary Report",
    description: "Comprehensive attendance statistics and patterns",
    icon: "CalendarCheck",
    category: "attendance",
    formats: ["pdf", "excel", "csv"],
  },
  {
    id: "academic-trends",
    title: "Academic Trends Report",
    description: "Performance trends across classes and subjects",
    icon: "TrendingUp",
    category: "academic",
    formats: ["pdf", "excel"],
  },
  {
    id: "fee-collection",
    title: "Fee Collection Report",
    description: "Fee collection status and pending dues",
    icon: "IndianRupee",
    category: "financial",
    formats: ["pdf", "excel", "csv"],
  },
  {
    id: "teacher-workload",
    title: "Teacher Workload Report",
    description: "Teaching hours and class assignments analysis",
    icon: "Users",
    category: "staff",
    formats: ["pdf", "excel"],
  },
  {
    id: "class-analysis",
    title: "Class Analysis Report",
    description: "Comprehensive class-wise performance breakdown",
    icon: "BarChart3",
    category: "academic",
    formats: ["pdf", "excel"],
  },
];
