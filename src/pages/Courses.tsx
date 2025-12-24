import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BranchPricing {
  branch: string;
  price: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  pricing: BranchPricing[];
}

const coursesData: Course[] = [
  { 
    id: "1", 
    name: "11th", 
    code: "11", 
    pricing: [
      { branch: "Kalyan Branch", price: "₹1,20,000.00" },
      { branch: "Manpada Branch", price: "₹1,00,000.00" },
      { branch: "Palava Branch", price: "₹1,05,000.00" },
      { branch: "Thane HO Branch", price: "₹1,30,000.00" },
    ]
  },
  { 
    id: "2", 
    name: "CET 1 year", 
    code: "CET", 
    pricing: [
      { branch: "Thane HO Branch", price: "₹2,50,000.00" },
      { branch: "Kalyan Branch", price: "₹2,00,000.00" },
    ]
  },
  { 
    id: "3", 
    name: "CET 2 years", 
    code: "C2", 
    pricing: [
      { branch: "Kalyan Branch", price: "₹2,00,000.00" },
      { branch: "Manpada Branch", price: "₹2,40,000.00" },
      { branch: "Thane HO Branch", price: "₹1,90,000.00" },
      { branch: "Palava Branch", price: "₹2,50,000.00" },
    ]
  },
  { 
    id: "4", 
    name: "JEE Foundation", 
    code: "JEE", 
    pricing: [
      { branch: "Thane HO Branch", price: "₹4,00,000.00" },
    ]
  },
  { 
    id: "5", 
    name: "NEET Foundation", 
    code: "NEET", 
    pricing: []
  },
];

const Courses = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [branchPricings, setBranchPricings] = useState<{ branch: string; fees: string }[]>([
    { branch: "", fees: "" },
    { branch: "", fees: "" },
  ]);

  const addBranchPricing = () => {
    setBranchPricings([...branchPricings, { branch: "", fees: "" }]);
  };

  const removeBranchPricing = (index: number) => {
    setBranchPricings(branchPricings.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl flex items-center gap-3">
          <span>📚</span> Course Management
        </h1>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      <Card>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Branch Pricing</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursesData.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>📘</span>
                      <span className="font-medium">{course.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{course.code}</TableCell>
                  <TableCell>
                    {course.pricing.length === 0 ? (
                      <span className="text-muted-foreground">No pricing.</span>
                    ) : (
                      <div className="space-y-1">
                        {course.pricing.map((p, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground font-mono">{p.branch} :</span>
                            <Badge variant="secondary" className="font-mono">{p.price}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {coursesData.map((course) => (
            <div key={course.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span>📘</span>
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {course.pricing.length > 0 && (
                <div className="space-y-1">
                  {course.pricing.map((p, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{p.branch}:</span>
                      <Badge variant="secondary" className="font-mono">{p.price}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Create Course Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>📚</span> Create Course
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Course Name</label>
              <Input placeholder="Enter course name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Course Code</label>
              <Input placeholder="Enter code" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Branch Pricing (Fees per branch):</label>
              <div className="space-y-3">
                {branchPricings.map((pricing, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kalyan">Kalyan Branch</SelectItem>
                        <SelectItem value="thane">Thane HO Branch</SelectItem>
                        <SelectItem value="manpada">Manpada Branch</SelectItem>
                        <SelectItem value="palava">Palava Branch</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Fees" className="w-32" />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeBranchPricing(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addBranchPricing} className="w-full">
                  + Add Branch Pricing
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Create Course</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
