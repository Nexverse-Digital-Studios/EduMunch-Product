/**
 * Library Management Types
 * ========================
 * Type definitions for library management module
 *
 * Note: These tables may need to be created in the database
 * Tables (INDEX_TOKEN = 1emaet):
 * - library_books_1emaet
 * - library_categories_1emaet
 * - library_transactions_1emaet
 * - library_members_1emaet
 */

// Book Category
export interface LibraryCategory {
  id: string;
  category_name: string;
  category_code: string;
  description: string | null;
  parent_category_id: string | null;
  is_active: boolean;
  created_at: string;
}

// Book
export interface LibraryBook {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  publication_year: number | null;
  edition: string | null;
  category_id: string | null;
  language: string;
  pages: number | null;
  price: number | null;
  location: string | null; // Shelf/rack location
  total_copies: number;
  available_copies: number;
  cover_image_url: string | null;
  description: string | null;
  tags: string[] | null;
  status: "available" | "all_issued" | "damaged" | "lost";
  created_at: string;
  updated_at: string;
}

// Library Member (could be student or staff)
export interface LibraryMember {
  id: string;
  member_type: "student" | "teacher" | "staff";
  member_id: string; // References student_id, teacher_id, or employee_id
  membership_number: string;
  membership_date: string;
  expiry_date: string | null;
  max_books_allowed: number;
  current_books_count: number;
  total_fines_due: number;
  status: "active" | "suspended" | "expired";
  created_at: string;
}

// Book Transaction (Issue/Return)
export interface LibraryTransaction {
  id: string;
  book_id: string;
  member_id: string;
  transaction_type: "issue" | "return" | "renew" | "reserve";
  issue_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number | null;
  fine_paid: boolean;
  remarks: string | null;
  issued_by: string | null;
  returned_to: string | null;
  status: "issued" | "returned" | "overdue" | "lost";
  created_at: string;
  updated_at: string;
}

// Book Reservation
export interface BookReservation {
  id: string;
  book_id: string;
  member_id: string;
  reservation_date: string;
  expiry_date: string;
  status: "active" | "fulfilled" | "cancelled" | "expired";
  notified: boolean;
  created_at: string;
}

// Student info for display
export interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  section_id: string;
}

// Teacher info for display
export interface TeacherInfo {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

// Class info for display
export interface ClassInfo {
  id: string;
  class_name: string;
  class_code: string;
}

// Section info for display
export interface SectionInfo {
  id: string;
  section_name: string;
  section_code: string;
  class_id: string;
}

// Dashboard stats
export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  totalMembers: number;
  overdueBooks: number;
  totalFinesDue: number;
}

// Fine settings
export interface FineSettings {
  finePerDay: number;
  maxFineDays: number;
  gracePeriodDays: number;
}

// Default settings
export const DEFAULT_FINE_SETTINGS: FineSettings = {
  finePerDay: 2, // ₹2 per day
  maxFineDays: 30,
  gracePeriodDays: 1,
};

export const DEFAULT_MAX_BOOKS = {
  student: 3,
  teacher: 5,
  staff: 3,
};

export const LOAN_PERIOD_DAYS = {
  student: 14,
  teacher: 30,
  staff: 14,
};
