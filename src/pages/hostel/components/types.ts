/**
 * Hostel Management Types
 * =======================
 * Type definitions for hostel management
 * Note: DB tables to be created when feature is implemented
 */

// Database Types (designed for future implementation)
export interface HostelBlockDB {
  id: string;
  block_name: string;
  block_code: string;
  block_type: "Boys" | "Girls" | "Staff" | "Mixed";
  total_floors: number;
  total_rooms: number;
  warden_id: string | null;
  address: string | null;
  contact_number: string | null;
  amenities: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostelRoomDB {
  id: string;
  block_id: string;
  room_number: string;
  floor_number: number;
  room_type: "Single" | "Double" | "Triple" | "Dormitory";
  capacity: number;
  current_occupancy: number;
  room_fee: number;
  amenities: string[] | null;
  status: "Available" | "Occupied" | "Maintenance" | "Reserved";
  created_at: string;
  updated_at: string;
}

export interface HostelAllocationDB {
  id: string;
  student_id: string;
  room_id: string;
  bed_number: number;
  academic_year_id: string;
  allocation_date: string;
  vacate_date: string | null;
  monthly_fee: number;
  deposit_amount: number;
  deposit_paid: boolean;
  status: "Active" | "Vacated" | "Transferred";
  created_at: string;
  updated_at: string;
}

export interface HostelFeeDB {
  id: string;
  allocation_id: string;
  student_id: string;
  fee_month: string; // YYYY-MM format
  amount: number;
  due_date: string;
  paid_date: string | null;
  payment_status: "Pending" | "Paid" | "Overdue" | "Partial";
  payment_mode: string | null;
  transaction_id: string | null;
  created_at: string;
}

export interface HostelAttendanceDB {
  id: string;
  student_id: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: "Present" | "Absent" | "Leave" | "Late";
  remarks: string | null;
  created_at: string;
}

export interface HostelLeaveDB {
  id: string;
  student_id: string;
  leave_type: "Home Visit" | "Medical" | "Emergency" | "Other";
  from_date: string;
  to_date: string;
  reason: string;
  parent_contact: string;
  approved_by: string | null;
  approval_status: "Pending" | "Approved" | "Rejected";
  actual_return_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostelComplaintDB {
  id: string;
  student_id: string | null;
  room_id: string | null;
  complaint_type: "Maintenance" | "Cleanliness" | "Food" | "Security" | "Other";
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostelVisitorDB {
  id: string;
  student_id: string;
  visitor_name: string;
  visitor_relation: string;
  visitor_phone: string;
  visit_date: string;
  check_in_time: string;
  check_out_time: string | null;
  purpose: string;
  id_proof_type: string | null;
  id_proof_number: string | null;
  approved_by: string | null;
  created_at: string;
}

// Extended types with relations
export type HostelBlock = HostelBlockDB;
export type HostelRoom = HostelRoomDB;
export type HostelAllocation = HostelAllocationDB;
export type HostelFee = HostelFeeDB;
export type HostelAttendance = HostelAttendanceDB;
export type HostelLeave = HostelLeaveDB;
export type HostelComplaint = HostelComplaintDB;
export type HostelVisitor = HostelVisitorDB;

// Student info for hostel management
export interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  section_id: string;
  phone: string | null;
  parent_phone: string | null;
}

// Warden/Staff info
export interface StaffInfo {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  phone: string;
}

// Form data types
export interface BlockFormData {
  block_name: string;
  block_code: string;
  block_type: "Boys" | "Girls" | "Staff" | "Mixed";
  total_floors: number;
  warden_id?: string;
  address?: string;
  contact_number?: string;
  amenities?: string[];
  is_active: boolean;
}

export interface RoomFormData {
  block_id: string;
  room_number: string;
  floor_number: number;
  room_type: "Single" | "Double" | "Triple" | "Dormitory";
  capacity: number;
  room_fee: number;
  amenities?: string[];
  status: "Available" | "Occupied" | "Maintenance" | "Reserved";
}

export interface AllocationFormData {
  student_id: string;
  room_id: string;
  bed_number: number;
  academic_year_id: string;
  allocation_date: string;
  monthly_fee: number;
  deposit_amount: number;
  deposit_paid: boolean;
}

export interface LeaveFormData {
  student_id: string;
  leave_type: "Home Visit" | "Medical" | "Emergency" | "Other";
  from_date: string;
  to_date: string;
  reason: string;
  parent_contact: string;
}

export interface ComplaintFormData {
  student_id?: string;
  room_id?: string;
  complaint_type: "Maintenance" | "Cleanliness" | "Food" | "Security" | "Other";
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
}

// Dashboard stats
export interface HostelStats {
  totalBlocks: number;
  totalRooms: number;
  totalCapacity: number;
  currentOccupancy: number;
  occupancyRate: number;
  pendingFees: number;
  openComplaints: number;
  todayAbsent: number;
}
