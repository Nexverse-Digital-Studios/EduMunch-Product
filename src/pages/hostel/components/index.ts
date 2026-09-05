/**
 * Hostel Management Components
 * ============================
 * Exports for hostel management module
 */

export { HostelDashboard } from "./HostelDashboard";
export { BlocksList } from "./BlocksList";
export { RoomsList } from "./RoomsList";
export { AllocationsList } from "./AllocationsList";
export { ComplaintsList } from "./ComplaintsList";

// Types
export type {
  HostelBlockDB,
  HostelRoomDB,
  HostelAllocationDB,
  HostelFeeDB,
  HostelAttendanceDB,
  HostelLeaveDB,
  HostelComplaintDB,
  HostelVisitorDB,
  HostelBlock,
  HostelRoom,
  HostelAllocation,
  HostelFee,
  HostelAttendance,
  HostelLeave,
  HostelComplaint,
  HostelVisitor,
  StudentInfo,
  StaffInfo,
  BlockFormData,
  RoomFormData,
  AllocationFormData,
  LeaveFormData,
  ComplaintFormData,
  HostelStats,
} from "./types";
