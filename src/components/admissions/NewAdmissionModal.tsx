import { useState } from "react";
import { X, Plus, Minus, Calculator, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NewAdmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewAdmissionModal = ({ open, onOpenChange }: NewAdmissionModalProps) => {
  const [installments, setInstallments] = useState([
    { name: "Installment 1", dueDate: "", amount: 0 },
  ]);

  const addInstallment = () => {
    setInstallments([
      ...installments,
      { name: `Installment ${installments.length + 1}`, dueDate: "", amount: 0 },
    ]);
  };

  const removeInstallment = (index: number) => {
    if (installments.length > 1) {
      setInstallments(installments.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">New Admission</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* General Admission Info */}
            <section className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">General Admission Info</h3>
                <Button variant="link" className="text-muted-foreground">Close</Button>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Admission ID</label>
                  <Input placeholder="Auto-generated" disabled />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Branch <span className="text-destructive">*</span>
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thane">Thane HO Branch</SelectItem>
                      <SelectItem value="palava">Palava Branch</SelectItem>
                      <SelectItem value="manpada">Manpada Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Course <span className="text-destructive">*</span>
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jee">JEE Foundation</SelectItem>
                      <SelectItem value="neet">NEET Foundation</SelectItem>
                      <SelectItem value="cet">CET 1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Session Year <span className="text-destructive">*</span>
                  </label>
                  <Input defaultValue="25" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Admission Date <span className="text-destructive">*</span>
                  </label>
                  <Input type="date" defaultValue="2025-12-12" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tie-Up School</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select School (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nalanda">Nalanda Group of schools</SelectItem>
                      <SelectItem value="saint-maria">Saint Maria School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Student & Academic Info */}
            <section className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold text-primary mb-4">Student & Academic Info</h3>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-600 text-3xl font-bold text-primary-foreground">
                    NA
                  </div>
                  <Button variant="link" className="text-primary">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Photo
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Student Name <span className="text-destructive">*</span>
                    </label>
                    <Input placeholder="Enter student name" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Student Email <span className="text-destructive">*</span>
                    </label>
                    <Input type="email" placeholder="Enter email" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Student Contact <span className="text-destructive">*</span>
                    </label>
                    <Input placeholder="Enter contact number" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Date of Birth <span className="text-destructive">*</span>
                    </label>
                    <Input type="date" placeholder="dd-mm-yyyy" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Gender <span className="text-destructive">*</span>
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <Input placeholder="Enter category" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium">
                      Address <span className="text-destructive">*</span>
                    </label>
                    <Textarea placeholder="Enter address" rows={2} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Current School <span className="text-destructive">*</span>
                    </label>
                    <Input placeholder="Enter school name" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Current Class</label>
                    <Input placeholder="Enter class" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Board (e.g., CBSE) <span className="text-destructive">*</span>
                    </label>
                    <Input placeholder="Enter board" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Last % or CGPA</label>
                    <Input placeholder="Enter percentage or CGPA" />
                  </div>
                </div>
              </div>
            </section>

            {/* Parent & Emergency Contact */}
            <section className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold text-primary mb-4">Parent & Emergency Contact</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Father's Name <span className="text-destructive">*</span>
                  </label>
                  <Input placeholder="Enter father's name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Father's Contact <span className="text-destructive">*</span>
                  </label>
                  <Input placeholder="Enter contact number" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Mother's Name <span className="text-destructive">*</span>
                  </label>
                  <Input placeholder="Enter mother's name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Mother's Contact <span className="text-destructive">*</span>
                  </label>
                  <Input placeholder="Enter contact number" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Emergency Contact Name</label>
                  <Input placeholder="Enter name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Emergency Contact No.</label>
                  <Input placeholder="Enter contact number" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Relation to Student</label>
                  <Input placeholder="Enter relation" />
                </div>
              </div>
            </section>

            {/* Fee Details */}
            <section className="rounded-lg border border-border p-4">
              <h3 className="text-lg font-semibold text-primary mb-4">Fee Details</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Course Fee <span className="text-destructive">*</span>
                  </label>
                  <Input type="number" defaultValue="0" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Total Payable <span className="text-destructive">*</span>
                  </label>
                  <Input type="number" defaultValue="0" />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="gst" />
                  <label htmlFor="gst" className="text-sm font-medium">
                    Is Total Payable inclusive of GST?
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">GST %</label>
                  <Input type="number" defaultValue="18" className="w-20" />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Discounts */}
              <div>
                <h4 className="font-semibold mb-2">Discounts</h4>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Discount
                </Button>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium">Discount Approved By</label>
                  <Input placeholder="Enter approver name" />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Fee Installments */}
              <div>
                <h4 className="font-semibold mb-4">Fee Installments</h4>
                
                <div className="rounded-lg bg-muted/50 p-4 mb-4">
                  <h5 className="font-medium mb-3">Installment Calculator</h5>
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox id="downpayment" />
                    <label htmlFor="downpayment" className="text-sm">Add Down Payment?</label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium"># of Installments</label>
                      <Input type="number" defaultValue="1" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Installments Start Date</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Installments End Date</label>
                      <Input type="date" />
                    </div>
                    <div className="flex items-end">
                      <Button variant="secondary" className="gap-2 w-full">
                        <Calculator className="h-4 w-4" />
                        Calculate
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Installments List */}
                <div className="space-y-3">
                  {installments.map((installment, index) => (
                    <div key={index} className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium">
                          Name {index + 1} <span className="text-destructive">*</span>
                        </label>
                        <Input value={installment.name} onChange={(e) => {
                          const newInstallments = [...installments];
                          newInstallments[index].name = e.target.value;
                          setInstallments(newInstallments);
                        }} />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium">
                          Due Date <span className="text-destructive">*</span>
                        </label>
                        <Input type="date" value={installment.dueDate} onChange={(e) => {
                          const newInstallments = [...installments];
                          newInstallments[index].dueDate = e.target.value;
                          setInstallments(newInstallments);
                        }} />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium">
                          Amount Due <span className="text-destructive">*</span>
                        </label>
                        <Input type="number" value={installment.amount} onChange={(e) => {
                          const newInstallments = [...installments];
                          newInstallments[index].amount = Number(e.target.value);
                          setInstallments(newInstallments);
                        }} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeInstallment(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={addInstallment}>
                  <Plus className="h-4 w-4" />
                  Add Installment
                </Button>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Submit Admission</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
