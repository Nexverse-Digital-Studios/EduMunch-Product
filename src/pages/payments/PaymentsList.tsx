import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Student,
  Installment,
  Transaction,
  OutstandingRecord,
  SearchStudentTab,
  TransactionsTab,
  OutstandingTab,
  RecordPaymentModal,
} from "./components";

// Placeholder data - would be replaced with actual data fetching
const students: Student[] = [];
const installments: Installment[] = [];
const transactions: Transaction[] = [];
const outstandingData: OutstandingRecord[] = [];

export const PaymentsList = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [selectedStudent, setSelectedStudent] = useState("1");
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);

  const openRecordPayment = (installment: Installment) => {
    setSelectedInstallment(installment);
    setIsRecordPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="search"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Search Student
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Filter Transactions
          </TabsTrigger>
          <TabsTrigger
            value="outstanding"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Outstanding Report
          </TabsTrigger>
        </TabsList>

        {/* Search Student Tab */}
        <TabsContent value="search" className="mt-6">
          <SearchStudentTab
            students={students}
            installments={installments}
            selectedStudent={selectedStudent}
            onStudentChange={setSelectedStudent}
            onRecordPayment={openRecordPayment}
          />
        </TabsContent>

        {/* Filter Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <TransactionsTab transactions={transactions} />
        </TabsContent>

        {/* Outstanding Report Tab */}
        <TabsContent value="outstanding" className="mt-6">
          <OutstandingTab outstandingData={outstandingData} />
        </TabsContent>
      </Tabs>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        selectedInstallment={selectedInstallment}
      />
    </div>
  );
};
