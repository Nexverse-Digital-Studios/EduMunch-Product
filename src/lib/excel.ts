/**
 * Excel Import/Export Utilities
 * ==============================
 * Centralized utilities for importing and exporting data to/from Excel format.
 * Uses SheetJS (xlsx) library for handling Excel files.
 */

import * as XLSX from "xlsx";

// =====================
// Types
// =====================

export interface ExportConfig<T> {
  data: T[];
  filename: string;
  sheetName?: string;
  columns: {
    header: string;
    key: keyof T | ((item: T) => any);
    width?: number;
  }[];
}

export interface ImportConfig {
  requiredFields: string[];
  optionalFields?: string[];
  fieldMappings?: Record<string, string>; // Excel header -> DB field
  validators?: Record<string, (value: any) => boolean | string>;
}

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: ImportError[];
  warnings: string[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

// =====================
// Export Functions
// =====================

/**
 * Export data to Excel file (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>({
  data,
  filename,
  sheetName = "Data",
  columns,
}: ExportConfig<T>): void {
  // Transform data based on column config
  const exportData = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const value =
        typeof col.key === "function" ? col.key(item) : item[col.key];
      row[col.header] = value ?? "";
    });
    return row;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = columns.map((col) => ({
    wch: col.width || Math.max(col.header.length, 15),
  }));
  ws["!cols"] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Download file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, any>>({
  data,
  filename,
  columns,
}: Omit<ExportConfig<T>, "sheetName">): void {
  // Transform data based on column config
  const exportData = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const value =
        typeof col.key === "function" ? col.key(item) : item[col.key];
      row[col.header] = value ?? "";
    });
    return row;
  });

  // Create worksheet and convert to CSV
  const ws = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // Download file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// =====================
// Import Functions
// =====================

/**
 * Parse Excel/CSV file and validate data
 */
export async function importFromExcel<T>(
  file: File,
  config: ImportConfig
): Promise<ImportResult<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(
          worksheet,
          {
            raw: false, // Get formatted strings
            defval: "", // Default value for empty cells
          }
        );

        // Process and validate data
        const result = validateImportData<T>(jsonData, config);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [
            {
              row: 0,
              field: "file",
              value: file.name,
              message: `Failed to parse file: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          warnings: [],
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate imported data against config
 */
function validateImportData<T>(
  data: Record<string, any>[],
  config: ImportConfig
): ImportResult<T> {
  const errors: ImportError[] = [];
  const warnings: string[] = [];
  const validData: T[] = [];

  // Normalize headers (trim, remove * suffix, lowercase, replace spaces with underscores)
  const normalizeHeader = (header: string) =>
    header
      .trim()
      .replace(/\s*\*\s*$/, "") // Remove trailing * (used for required field markers)
      .toLowerCase()
      .replace(/\s+/g, "_");

  data.forEach((row, index) => {
    const rowNumber = index + 2; // Excel row (1-indexed + header row)
    const processedRow: Record<string, any> = {};
    let isValid = true;

    // Map Excel headers to DB fields
    Object.entries(row).forEach(([header, value]) => {
      const normalizedHeader = normalizeHeader(header);
      const dbField =
        config.fieldMappings?.[normalizedHeader] ||
        config.fieldMappings?.[header] ||
        normalizedHeader;
      processedRow[dbField] = typeof value === "string" ? value.trim() : value;
    });

    // Check required fields
    for (const field of config.requiredFields) {
      const normalizedField = normalizeHeader(field);
      const value = processedRow[normalizedField] || processedRow[field];
      if (!value && value !== 0) {
        errors.push({
          row: rowNumber,
          field,
          value: undefined,
          message: `Missing required field: ${field}`,
        });
        isValid = false;
      }
    }

    // Run custom validators
    if (config.validators) {
      for (const [field, validator] of Object.entries(config.validators)) {
        const value = processedRow[field];
        if (value !== undefined && value !== "") {
          const validationResult = validator(value);
          if (validationResult !== true) {
            const message =
              typeof validationResult === "string"
                ? validationResult
                : `Invalid value for ${field}`;
            errors.push({
              row: rowNumber,
              field,
              value,
              message,
            });
            isValid = false;
          }
        }
      }
    }

    if (isValid) {
      validData.push(processedRow as T);
    }
  });

  return {
    success: errors.length === 0,
    data: validData,
    errors,
    warnings,
    totalRows: data.length,
    validRows: validData.length,
    invalidRows: data.length - validData.length,
  };
}

// =====================
// Template Generation
// =====================

/**
 * Generate and download an import template Excel file
 */
export function downloadImportTemplate(
  filename: string,
  headers: { header: string; required: boolean; example?: string }[],
  sheetName = "Template"
): void {
  // Create headers row
  const headerRow = headers.map((h) => h.header);

  // Create example row
  const exampleRow = headers.map((h) => h.example || "");

  // Create worksheet with headers and example
  const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);

  // Set column widths
  ws["!cols"] = headers.map((h) => ({
    wch: Math.max(h.header.length, h.example?.length || 0, 15),
  }));

  // Style required headers (add * marker)
  const styledHeaders = headers.map((h) => (h.required ? `${h.header} *` : h.header));
  XLSX.utils.sheet_add_aoa(ws, [styledHeaders], { origin: "A1" });

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Download file
  XLSX.writeFile(wb, `${filename}_template.xlsx`);
}

// =====================
// Pre-configured Templates
// =====================

export const STUDENT_IMPORT_TEMPLATE = [
  { header: "Admission Number", required: true, example: "ADM2024001" },
  { header: "First Name", required: true, example: "John" },
  { header: "Middle Name", required: false, example: "" },
  { header: "Last Name", required: true, example: "Doe" },
  { header: "Date of Birth", required: true, example: "2015-05-15" },
  { header: "Gender", required: true, example: "Male" },
  { header: "Blood Group", required: false, example: "O+" },
  { header: "Nationality", required: true, example: "Indian" },
  { header: "Religion", required: false, example: "" },
  { header: "Category", required: false, example: "General" },
  { header: "Email", required: false, example: "john.doe@email.com" },
  { header: "Phone", required: false, example: "9876543210" },
  { header: "Address Line 1", required: false, example: "123 Main Street" },
  { header: "City", required: false, example: "Mumbai" },
  { header: "State", required: false, example: "Maharashtra" },
  { header: "Pincode", required: false, example: "400001" },
  { header: "Admission Date", required: true, example: "2024-04-01" },
  { header: "Previous School", required: false, example: "" },
  { header: "Emergency Contact Name", required: false, example: "Jane Doe" },
  { header: "Emergency Contact Phone", required: false, example: "9876543211" },
];

export const TEACHER_IMPORT_TEMPLATE = [
  { header: "Employee Code", required: true, example: "EMP001" },
  { header: "First Name", required: true, example: "Jane" },
  { header: "Middle Name", required: false, example: "" },
  { header: "Last Name", required: true, example: "Smith" },
  { header: "Date of Birth", required: false, example: "1985-08-20" },
  { header: "Gender", required: false, example: "Female" },
  { header: "Email", required: false, example: "jane.smith@school.com" },
  { header: "Phone", required: true, example: "9876543210" },
  { header: "Address Line 1", required: false, example: "456 Oak Avenue" },
  { header: "City", required: false, example: "Delhi" },
  { header: "State", required: false, example: "Delhi" },
  { header: "Pincode", required: false, example: "110001" },
  { header: "Qualification", required: false, example: "M.Ed" },
  { header: "Specialization", required: false, example: "Mathematics" },
  { header: "Experience Years", required: false, example: "10" },
  { header: "Joining Date", required: true, example: "2020-07-01" },
  { header: "Employment Type", required: false, example: "Permanent" },
  { header: "Designation", required: false, example: "Senior Teacher" },
  { header: "Department", required: false, example: "Science" },
];

export const PARENT_IMPORT_TEMPLATE = [
  { header: "Full Name", required: true, example: "Robert Johnson" },
  { header: "Relationship", required: true, example: "Father" },
  { header: "Email", required: false, example: "robert@email.com" },
  { header: "Phone", required: true, example: "9876543210" },
  { header: "Alternate Phone", required: false, example: "9876543211" },
  { header: "Occupation", required: false, example: "Engineer" },
  { header: "Annual Income", required: false, example: "1200000" },
  { header: "Address Line 1", required: false, example: "789 Park Road" },
  { header: "City", required: false, example: "Bangalore" },
  { header: "State", required: false, example: "Karnataka" },
  { header: "Pincode", required: false, example: "560001" },
  { header: "Aadhar Number", required: false, example: "123456789012" },
];

export const EMPLOYEE_IMPORT_TEMPLATE = [
  { header: "Employee Code", required: true, example: "EMP001" },
  { header: "First Name", required: true, example: "Mike" },
  { header: "Middle Name", required: false, example: "" },
  { header: "Last Name", required: true, example: "Johnson" },
  { header: "Date of Birth", required: false, example: "1980-03-15" },
  { header: "Gender", required: false, example: "Male" },
  { header: "Email", required: false, example: "mike.j@school.com" },
  { header: "Phone", required: true, example: "9876543210" },
  { header: "Address Line 1", required: false, example: "321 Elm Street" },
  { header: "City", required: false, example: "Chennai" },
  { header: "State", required: false, example: "Tamil Nadu" },
  { header: "Pincode", required: false, example: "600001" },
  { header: "Qualification", required: false, example: "B.Com" },
  { header: "Experience Years", required: false, example: "5" },
  { header: "Joining Date", required: true, example: "2022-01-15" },
  { header: "Employment Type", required: false, example: "Permanent" },
  { header: "Designation", required: false, example: "Admin Officer" },
  { header: "Department", required: false, example: "Administration" },
];

// =====================
// Import Validators
// =====================

export const commonValidators = {
  email: (value: string) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || "Invalid email format";
  },
  phone: (value: string) => {
    if (!value) return true;
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(value.replace(/\D/g, "")) || "Phone must be 10 digits";
  },
  date: (value: string) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime()) || "Invalid date format (use YYYY-MM-DD)";
  },
  gender: (value: string) => {
    if (!value) return true;
    const validGenders = ["male", "female", "other"];
    return (
      validGenders.includes(value.toLowerCase()) ||
      "Gender must be Male, Female, or Other"
    );
  },
  relationship: (value: string) => {
    if (!value) return true;
    const validRelationships = ["father", "mother", "guardian", "other"];
    return (
      validRelationships.includes(value.toLowerCase()) ||
      "Relationship must be Father, Mother, Guardian, or Other"
    );
  },
  employmentType: (value: string) => {
    if (!value) return true;
    const validTypes = ["permanent", "contract", "part-time", "guest"];
    return (
      validTypes.includes(value.toLowerCase()) ||
      "Employment type must be Permanent, Contract, Part-time, or Guest"
    );
  },
};

// =====================
// Import Configs
// =====================

export const STUDENT_IMPORT_CONFIG: ImportConfig = {
  requiredFields: [
    "admission_number",
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "nationality",
    "admission_date",
  ],
  optionalFields: [
    "middle_name",
    "blood_group",
    "religion",
    "category",
    "email",
    "phone",
    "address_line1",
    "city",
    "state",
    "pincode",
    "previous_school",
    "emergency_contact_name",
    "emergency_contact_phone",
  ],
  fieldMappings: {
    admission_number: "admission_number",
    "admission number": "admission_number",
    first_name: "first_name",
    "first name": "first_name",
    middle_name: "middle_name",
    "middle name": "middle_name",
    last_name: "last_name",
    "last name": "last_name",
    date_of_birth: "date_of_birth",
    "date of birth": "date_of_birth",
    dob: "date_of_birth",
    blood_group: "blood_group",
    "blood group": "blood_group",
    address_line_1: "address_line1",
    "address line 1": "address_line1",
    admission_date: "admission_date",
    "admission date": "admission_date",
    previous_school: "previous_school",
    "previous school": "previous_school",
    emergency_contact_name: "emergency_contact_name",
    "emergency contact name": "emergency_contact_name",
    emergency_contact_phone: "emergency_contact_phone",
    "emergency contact phone": "emergency_contact_phone",
  },
  validators: {
    email: commonValidators.email,
    phone: commonValidators.phone,
    date_of_birth: commonValidators.date,
    admission_date: commonValidators.date,
    gender: commonValidators.gender,
  },
};

export const TEACHER_IMPORT_CONFIG: ImportConfig = {
  requiredFields: ["employee_code", "first_name", "last_name", "phone", "joining_date"],
  optionalFields: [
    "middle_name",
    "date_of_birth",
    "gender",
    "email",
    "address_line1",
    "city",
    "state",
    "pincode",
    "qualification",
    "specialization",
    "experience_years",
    "employment_type",
    "designation",
    "department",
  ],
  fieldMappings: {
    employee_code: "employee_code",
    "employee code": "employee_code",
    first_name: "first_name",
    "first name": "first_name",
    middle_name: "middle_name",
    "middle name": "middle_name",
    last_name: "last_name",
    "last name": "last_name",
    date_of_birth: "date_of_birth",
    "date of birth": "date_of_birth",
    dob: "date_of_birth",
    address_line_1: "address_line1",
    "address line 1": "address_line1",
    joining_date: "joining_date",
    "joining date": "joining_date",
    experience_years: "experience_years",
    "experience years": "experience_years",
    employment_type: "employment_type",
    "employment type": "employment_type",
  },
  validators: {
    email: commonValidators.email,
    phone: commonValidators.phone,
    date_of_birth: commonValidators.date,
    joining_date: commonValidators.date,
    gender: commonValidators.gender,
    employment_type: commonValidators.employmentType,
  },
};

export const PARENT_IMPORT_CONFIG: ImportConfig = {
  requiredFields: ["full_name", "relationship", "phone"],
  optionalFields: [
    "email",
    "alternate_phone",
    "occupation",
    "annual_income",
    "address_line1",
    "city",
    "state",
    "pincode",
    "aadhar_number",
  ],
  fieldMappings: {
    full_name: "full_name",
    "full name": "full_name",
    name: "full_name",
    alternate_phone: "alternate_phone",
    "alternate phone": "alternate_phone",
    annual_income: "annual_income",
    "annual income": "annual_income",
    address_line_1: "address_line1",
    "address line 1": "address_line1",
    aadhar_number: "aadhar_number",
    "aadhar number": "aadhar_number",
  },
  validators: {
    email: commonValidators.email,
    phone: commonValidators.phone,
    alternate_phone: commonValidators.phone,
    relationship: commonValidators.relationship,
  },
};

export const EMPLOYEE_IMPORT_CONFIG: ImportConfig = {
  requiredFields: ["employee_code", "first_name", "last_name", "phone", "joining_date"],
  optionalFields: [
    "middle_name",
    "date_of_birth",
    "gender",
    "email",
    "address_line1",
    "city",
    "state",
    "pincode",
    "qualification",
    "experience_years",
    "employment_type",
    "designation",
    "department",
  ],
  fieldMappings: {
    employee_code: "employee_code",
    "employee code": "employee_code",
    first_name: "first_name",
    "first name": "first_name",
    middle_name: "middle_name",
    "middle name": "middle_name",
    last_name: "last_name",
    "last name": "last_name",
    date_of_birth: "date_of_birth",
    "date of birth": "date_of_birth",
    dob: "date_of_birth",
    address_line_1: "address_line1",
    "address line 1": "address_line1",
    joining_date: "joining_date",
    "joining date": "joining_date",
    experience_years: "experience_years",
    "experience years": "experience_years",
    employment_type: "employment_type",
    "employment type": "employment_type",
  },
  validators: {
    email: commonValidators.email,
    phone: commonValidators.phone,
    date_of_birth: commonValidators.date,
    joining_date: commonValidators.date,
    gender: commonValidators.gender,
    employment_type: commonValidators.employmentType,
  },
};
