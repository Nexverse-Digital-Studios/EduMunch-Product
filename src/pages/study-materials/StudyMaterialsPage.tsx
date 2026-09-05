/**
 * Study Materials Page - Learning Resources Management
 *
 * Features:
 * - Upload and organize study materials
 * - Filter by class, subject, topic
 * - Download/view materials
 * - Categorize by type (PDF, Video, Notes, etc.)
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  FileText,
  Video,
  Image,
  FileSpreadsheet,
  Presentation,
  Link as LinkIcon,
  Folder,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  GraduationCap,
  BookMarked,
  Clock,
  Star,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Demo study materials
const demoMaterials = [
  {
    id: 1,
    title: "Chapter 5 - Quadratic Equations",
    description:
      "Complete notes on quadratic equations including formulas, examples, and practice problems.",
    type: "pdf",
    subject: "Mathematics",
    class: "10",
    topic: "Algebra",
    fileSize: "2.4 MB",
    uploadedBy: "Mr. Sharma",
    uploadDate: "2026-01-02",
    downloads: 145,
    views: 320,
    isStarred: true,
  },
  {
    id: 2,
    title: "Photosynthesis - Video Lecture",
    description:
      "Detailed video explanation of the photosynthesis process in plants.",
    type: "video",
    subject: "Biology",
    class: "9",
    topic: "Plant Physiology",
    fileSize: "156 MB",
    uploadedBy: "Mrs. Patel",
    uploadDate: "2026-01-01",
    downloads: 89,
    views: 456,
    isStarred: false,
  },
  {
    id: 3,
    title: "French Revolution Timeline",
    description:
      "Interactive presentation covering the major events of the French Revolution.",
    type: "presentation",
    subject: "History",
    class: "8",
    topic: "World History",
    fileSize: "8.7 MB",
    uploadedBy: "Mr. Verma",
    uploadDate: "2025-12-28",
    downloads: 67,
    views: 189,
    isStarred: true,
  },
  {
    id: 4,
    title: "Periodic Table - Quick Reference",
    description:
      "High-quality printable periodic table with element properties.",
    type: "image",
    subject: "Chemistry",
    class: "11",
    topic: "Elements",
    fileSize: "1.2 MB",
    uploadedBy: "Dr. Kumar",
    uploadDate: "2025-12-25",
    downloads: 234,
    views: 567,
    isStarred: false,
  },
  {
    id: 5,
    title: "Grammar Workbook - Tenses",
    description: "Practice exercises for all tenses with answer keys included.",
    type: "pdf",
    subject: "English",
    class: "7",
    topic: "Grammar",
    fileSize: "3.1 MB",
    uploadedBy: "Ms. Johnson",
    uploadDate: "2025-12-20",
    downloads: 178,
    views: 423,
    isStarred: false,
  },
  {
    id: 6,
    title: "Physics Formula Sheet",
    description: "All important formulas for Class 12 Physics board exams.",
    type: "pdf",
    subject: "Physics",
    class: "12",
    topic: "All Topics",
    fileSize: "856 KB",
    uploadedBy: "Mr. Sharma",
    uploadDate: "2025-12-18",
    downloads: 312,
    views: 789,
    isStarred: true,
  },
  {
    id: 7,
    title: "Computer Science - Python Basics",
    description: "Introduction to Python programming with code examples.",
    type: "link",
    subject: "Computer Science",
    class: "11",
    topic: "Programming",
    fileSize: "External Link",
    uploadedBy: "Mr. Tech",
    uploadDate: "2025-12-15",
    downloads: 0,
    views: 234,
    isStarred: false,
  },
  {
    id: 8,
    title: "Hindi Sahitya Notes",
    description:
      "Summary and analysis of prescribed Hindi literature for board exams.",
    type: "pdf",
    subject: "Hindi",
    class: "10",
    topic: "Literature",
    fileSize: "4.5 MB",
    uploadedBy: "Mrs. Gupta",
    uploadDate: "2025-12-10",
    downloads: 156,
    views: 345,
    isStarred: false,
  },
];

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  video: Video,
  image: Image,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  link: LinkIcon,
};

const typeColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600",
  video: "bg-purple-100 text-purple-600",
  image: "bg-green-100 text-green-600",
  spreadsheet: "bg-emerald-100 text-emerald-600",
  presentation: "bg-orange-100 text-orange-600",
  link: "bg-blue-100 text-blue-600",
};

const subjects = [
  "All Subjects",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "History",
  "Computer Science",
];
const classes = ["All Classes", "6", "7", "8", "9", "10", "11", "12"];
const types = ["All Types", "pdf", "video", "image", "presentation", "link"];

export const StudyMaterialsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedType, setSelectedType] = useState("All Types");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const filteredMaterials = demoMaterials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      selectedSubject === "All Subjects" ||
      material.subject === selectedSubject;
    const matchesClass =
      selectedClass === "All Classes" || material.class === selectedClass;
    const matchesType =
      selectedType === "All Types" || material.type === selectedType;
    const matchesTab =
      activeTab === "all" || (activeTab === "starred" && material.isStarred);

    return (
      matchesSearch &&
      matchesSubject &&
      matchesClass &&
      matchesType &&
      matchesTab
    );
  });

  const stats = {
    total: demoMaterials.length,
    totalViews: demoMaterials.reduce((acc, m) => acc + m.views, 0),
    totalDownloads: demoMaterials.reduce((acc, m) => acc + m.downloads, 0),
    starred: demoMaterials.filter((m) => m.isStarred).length,
  };

  const handleUpload = () => {
    toast({
      title: "Material uploaded",
      description: "Your study material has been uploaded successfully.",
    });
    setIsUploadOpen(false);
  };

  const getIcon = (type: string) => {
    return typeIcons[type] || FileText;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Study Materials
          </h1>
          <p className="text-muted-foreground mt-1">
            Access and manage learning resources
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="bg-primary">
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalDownloads.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.starred}</p>
                <p className="text-sm text-muted-foreground">Starred</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full lg:w-48">
                <BookMarked className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full lg:w-40">
                <GraduationCap className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls === "All Classes" ? cls : `Class ${cls}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "All Types" ? type : type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            All Materials ({demoMaterials.length})
          </TabsTrigger>
          <TabsTrigger
            value="starred"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            <Star className="h-4 w-4 mr-2" />
            Starred ({demoMaterials.filter((m) => m.isStarred).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No materials found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMaterials.map((material) => {
                const Icon = getIcon(material.type);
                return (
                  <Card
                    key={material.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`p-3 rounded-lg ${
                            typeColors[material.type]
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          {material.isStarred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                {material.isStarred ? "Unstar" : "Star"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                        {material.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {material.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{material.subject}</Badge>
                        <Badge variant="outline">Class {material.class}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {material.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {material.downloads}
                        </span>
                        <span>{material.fileSize}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaterials.map((material) => {
                const Icon = getIcon(material.type);
                return (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            typeColors[material.type]
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {material.title}
                            </h3>
                            {material.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {material.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {material.uploadedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(
                                new Date(material.uploadDate),
                                "MMM d, yyyy"
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {material.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {material.downloads}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{material.subject}</Badge>
                          <Badge variant="outline">
                            Class {material.class}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Study Material
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Enter material title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Brief description of the material" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.slice(1).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.slice(1).map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input placeholder="e.g., Algebra, Grammar, etc." />
            </div>
            <div className="space-y-2">
              <Label>Upload File or Enter URL</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Video, Image, or Presentation (Max 100MB)
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Browse Files
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} className="bg-primary">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyMaterialsPage;
