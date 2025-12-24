/**
 * Feedback Page - Survey & Feedback System
 * 
 * This feature uses Tier 3 schema tables:
 * - surveys_1EMAET
 * - survey_questions_1EMAET
 * - survey_responses_1EMAET
 * - feedback_analytics_1EMAET
 * 
 * Currently showing demo data. Full Supabase integration requires Tier 3 deployment.
 */

import { useState } from "react";
import { Plus, Edit, Trash2, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useModulePermissions } from "@/contexts/PermissionContext";

const templates = [
  { id: 1, title: "Quarterly review", type: "FACULTY_REVIEW", description: "Faculty review", qualities: 2 },
  { id: 2, title: "Dec Teacher reivew", type: "FACULTY_REVIEW", description: "Test", qualities: 2 },
  { id: 3, title: "teacher review", type: "FACULTY_REVIEW", description: "Test", qualities: 0 },
  { id: 4, title: "Yearly Teacher Review", type: "FACULTY_REVIEW", description: "Grading", qualities: 0 },
  { id: 5, title: "Monthly Teacher Review", type: "FACULTY_REVIEW", description: "Performance review", qualities: 0 },
  { id: 6, title: "DSA", type: "GENERAL", description: "XYZ", qualities: 3 },
];

const assignedForms = [
  { id: 1, name: "Dec Teacher reivew", type: "FACULTY_REVIEW", active: true, startDate: "12/6/2025", endDate: "12/8/2025", submissions: 0 },
  { id: 2, name: "DSA", type: "GENERAL", active: true, startDate: "12/5/2025", endDate: "12/8/2025", submissions: 1 },
];

const reviewResults = [
  { code: "ASB", reviews: 1, avgRating: 5, qualities: { Speed: 4, Quality: 3, Engaging: 5 }, rating: 5, comment: "very good" },
  { code: "ASM", reviews: 1, avgRating: 4, qualities: { Speed: 3, Quality: 4, Engaging: 4 }, rating: 4, comment: "okay okay" },
  { code: "JYCH", reviews: 1, avgRating: 2, qualities: { Speed: 1, Quality: 3, Engaging: 2 }, rating: 2, comment: "done" },
  { code: "KAP", reviews: 1, avgRating: 5, qualities: { Speed: 5, Quality: 5, Engaging: 5 }, rating: 5, comment: "excellent" },
];

const qualitiesOptions = [
  { id: "efficiency", name: "Efficiency", description: "The level of understanding of the topic" },
  { id: "engaging", name: "Engaging", description: "" },
  { id: "quality", name: "Quality", description: "" },
  { id: "speed", name: "Speed", description: "" },
];

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("JEE2026");
  const [selectedForm, setSelectedForm] = useState("dec-teacher");
  const [selectedQualities, setSelectedQualities] = useState<string[]>(["efficiency", "quality"]);

  // Permission check
  const { canRead, canCreate, canUpdate, canDelete } = useModulePermissions('FEEDBACK');

  const toggleQuality = (id: string) => {
    setSelectedQualities(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Tier 3 Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Tier 3 Feature</AlertTitle>
        <AlertDescription>
          The Feedback/Survey system requires Tier 3 schema tables. Currently showing demo data.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="assign"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Assign Forms
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Results & Analysis
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Feedback Form Templates</h2>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Qualities
              </Button>
              <Button onClick={() => setIsTemplateModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{template.title}</h3>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                      {template.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <p className="text-sm text-muted-foreground">{template.qualities} Qualities</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Assign Forms Tab */}
        <TabsContent value="assign" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Assign Feedback Forms to Batch</h2>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Assign Form
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Select Batch</Label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEE2026">JEE Advance Batch 2026</SelectItem>
                <SelectItem value="NEET2026">NEET Batch 2026</SelectItem>
                <SelectItem value="26TJMA1">26TJMA1 (Thane HO Branch)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {assignedForms.map((form) => (
              <div key={form.id} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{form.name}</h3>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                      {form.type}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Active: </span>
                    <span className="text-green-500 font-medium">{form.active ? "Yes" : "No"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start: {form.startDate} | End: {form.endDate}
                  </p>
                  <p className="text-sm text-muted-foreground">{form.submissions} Submissions</p>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 self-end sm:self-auto">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Results & Analysis Tab */}
        <TabsContent value="results" className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Feedback Results & Analysis</h2>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Select Form</Label>
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dec-teacher">Dec Teacher reivew (FACULTY_REVIEW)</SelectItem>
                <SelectItem value="quarterly">Quarterly review (FACULTY_REVIEW)</SelectItem>
                <SelectItem value="dsa">DSA (GENERAL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Faculty Review Results</h3>

            {reviewResults.map((result, index) => (
              <div key={index} className="border-b border-border pb-6 last:border-0 last:pb-0 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <h4 className="font-semibold text-foreground">{result.code}</h4>
                  <span className="text-sm text-muted-foreground">({result.reviews} reviews)</span>
                  <span className="text-foreground font-medium">Avg Rating: {result.avgRating}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quality Averages</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.qualities).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="bg-muted/50">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Rating: </span>
                    <span className="font-medium text-foreground">{result.rating}</span>
                    <span className="text-muted-foreground ml-4">Comment: </span>
                    <span className="italic text-foreground">{result.comment}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Quality Ratings: Speed({result.qualities.Speed}), Quality({result.qualities.Quality}), Engaging({result.qualities.Engaging})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input defaultValue="Quarterly review" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea defaultValue="Faculty review" className="resize-none" />
            </div>
            <div className="space-y-2">
              <Label>Form Type</Label>
              <Select defaultValue="FACULTY_REVIEW">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FACULTY_REVIEW">FACULTY_REVIEW</SelectItem>
                  <SelectItem value="GENERAL">GENERAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Select Qualities</Label>
              <div className="grid grid-cols-2 gap-3">
                {qualitiesOptions.map((quality) => (
                  <div 
                    key={quality.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedQualities.includes(quality.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => toggleQuality(quality.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedQualities.includes(quality.id)}
                        onCheckedChange={() => toggleQuality(quality.id)}
                      />
                      <span className="font-medium text-foreground">{quality.name}</span>
                    </div>
                    {quality.description && (
                      <p className="text-xs text-muted-foreground mt-1 pl-6">{quality.description}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected qualities will be snapshotted into the template so historic data remains consistent.
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <Button className="bg-primary">Update Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;
