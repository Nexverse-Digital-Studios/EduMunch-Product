export interface Installment {
  id: number;
  name: string;
  dueDate: string;
  amount: number;
  remaining: number;
  status: "PENDING" | "PAID" | "PARTIAL";
  transactions: Transaction[];
}

export interface Transaction {
  id: number;
  student: string;
  formNumber: string;
  branch: string;
  date: string;
  amount: number;
  method: string;
  status: "PENDING" | "REALIZED";
  realizedBy: string;
}

export interface Student {
  id: string;
  name: string;
  formNumber: string;
  course: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  installments: number;
}

export interface OutstandingRecord {
  student: string;
  phone: string;
  branch: string;
  dueDate: string;
  totalDue: number;
  paid: number;
  balance: number;
  status: "PENDING" | "PARTIALLY PAID";
}
