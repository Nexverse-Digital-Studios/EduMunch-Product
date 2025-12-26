/**
 * Transport Management Types
 * ==========================
 * Type definitions for transport management
 */

// Database Types (matching schema)
export interface TransportRouteDB {
  id: string;
  route_name: string;
  route_code: string;
  route_description: string | null;
  start_location: string;
  end_location: string;
  total_distance_km: number | null;
  estimated_duration_minutes: number | null;
  fare_amount: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransportStopDB {
  id: string;
  route_id: string;
  stop_name: string;
  stop_order: number;
  landmark: string | null;
  pickup_time: string | null;
  drop_time: string | null;
  distance_from_school_km: number | null;
  created_at: string;
}

export interface TransportVehicleDB {
  id: string;
  vehicle_number: string;
  vehicle_type: "Bus" | "Van" | "Auto" | "Other";
  capacity: number;
  manufacturer: string | null;
  model: string | null;
  year_of_manufacture: number | null;
  registration_date: string | null;
  insurance_number: string | null;
  insurance_expiry: string | null;
  pollution_certificate_expiry: string | null;
  fitness_certificate_expiry: string | null;
  gps_device_id: string | null;
  status: "Active" | "Maintenance" | "Retired";
  created_at: string;
  updated_at: string;
}

export interface VehicleDriverDB {
  id: string;
  full_name: string;
  employee_code: string;
  phone: string;
  alternate_phone: string | null;
  license_number: string;
  license_expiry: string;
  address: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  joining_date: string;
  status: "Active" | "On Leave" | "Resigned" | "Terminated";
  created_at: string;
  updated_at: string;
}

export interface VehicleRouteAssignmentDB {
  id: string;
  route_id: string;
  vehicle_id: string;
  driver_id: string;
  conductor_id: string | null;
  assignment_date: string;
  shift: "Morning" | "Evening" | "Both";
  is_active: boolean;
  created_at: string;
}

export interface StudentTransportDB {
  id: string;
  student_id: string;
  route_id: string;
  stop_id: string;
  academic_year_id: string;
  transport_fee: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleMaintenanceDB {
  id: string;
  vehicle_id: string;
  maintenance_type: "Regular Service" | "Repair" | "Inspection" | "Emergency";
  maintenance_date: string;
  description: string | null;
  cost: number | null;
  service_provider: string | null;
  next_service_date: string | null;
  status: "Scheduled" | "In Progress" | "Completed";
  created_at: string;
}

// Extended types with relations
export type TransportRoute = TransportRouteDB;
export type TransportStop = TransportStopDB;
export type TransportVehicle = TransportVehicleDB;
export type VehicleDriver = VehicleDriverDB;
export type VehicleRouteAssignment = VehicleRouteAssignmentDB;
export type StudentTransport = StudentTransportDB;
export type VehicleMaintenance = VehicleMaintenanceDB;

// Student info for transport assignment
export interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  section_id: string;
}

// Form data types
export interface RouteFormData {
  route_name: string;
  route_code: string;
  route_description?: string;
  start_location: string;
  end_location: string;
  total_distance_km?: number;
  estimated_duration_minutes?: number;
  fare_amount?: number;
  is_active: boolean;
}

export interface VehicleFormData {
  vehicle_number: string;
  vehicle_type: "Bus" | "Van" | "Auto" | "Other";
  capacity: number;
  manufacturer?: string;
  model?: string;
  year_of_manufacture?: number;
  registration_date?: string;
  insurance_number?: string;
  insurance_expiry?: string;
  pollution_certificate_expiry?: string;
  fitness_certificate_expiry?: string;
  gps_device_id?: string;
  status: "Active" | "Maintenance" | "Retired";
}

export interface DriverFormData {
  full_name: string;
  employee_code: string;
  phone: string;
  alternate_phone?: string;
  license_number: string;
  license_expiry: string;
  address?: string;
  photo_url?: string;
  date_of_birth?: string;
  joining_date: string;
  status: "Active" | "On Leave" | "Resigned" | "Terminated";
}

export interface StopFormData {
  route_id: string;
  stop_name: string;
  stop_order: number;
  landmark?: string;
  pickup_time?: string;
  drop_time?: string;
  distance_from_school_km?: number;
}

export interface StudentTransportFormData {
  student_id: string;
  route_id: string;
  stop_id: string;
  academic_year_id: string;
  transport_fee?: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}
