/**
 * Academic Years Module Types
 * ============================
 * Type definitions based on DB schema:
 * - academic_years_${INDEX_TOKEN}
 * 
 * Routes:
 * - /academic-years - List all
 * - /academic-years/create - Create new
 * - /academic-years/:id - View details
 * - /academic-years/:id/edit - Edit
 * - /academic-years/:id/delete - Delete
 * - /academic-years/:id/set-current - Set as current
 */

// ==========================
// Academic Year DB Record
// ==========================
export interface AcademicYearDB {
  id: string;
  year_code: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AcademicYearFormData {
  year_code: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

// ==========================
// Filter Types
// ==========================
export interface AcademicYearFilters {
  is_current?: boolean;
  search?: string;
}
