/**
 * Bulk Import Dialog Component
 * =============================
 * Reusable component for importing data from Excel/CSV files.
 * Used across Students, Teachers, Employees, and Parents modules.
 */

import { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  importFromExcel,
  downloadImportTemplate,
  type ImportConfig,
  type ImportResult,
  type ImportError,
} from "@/lib/excel";
import { useToast } from "@/hooks/use-toast";

// Detailed import result for each record
export interface ImportRecordResult {
  data: Record<string, any>;
  success: boolean;
  reason?: string;
}

export interface DetailedImportResult {
  success: number;
  failed: number;
  results: ImportRecordResult[];
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  importConfig: ImportConfig;
  templateData: { header: string; required: boolean; example?: string }[];
  templateFilename: string;
  onImport: (data: Record<string, any>[]) => Promise<DetailedImportResult>;
  entityName: string; // "students", "teachers", etc.
  identifierField?: string; // Field to display as identifier (e.g., "admission_number", "employee_code")
}

type ImportStep = "upload" | "preview" | "importing" | "complete";

export function BulkImportDialog({
  open,
  onOpenChange,
  title,
  description,
  importConfig,
  templateData,
  templateFilename,
  onImport,
  entityName,
  identifierField = "first_name",
}: BulkImportDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult<
    Record<string, any>
  > | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [finalResult, setFinalResult] = useState<DetailedImportResult | null>(
    null
  );

  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setImportResult(null);
    setIsProcessing(false);
    setImportProgress(0);
    setFinalResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const result = await importFromExcel<Record<string, any>>(
        file,
        importConfig
      );
      setImportResult(result);
      setStep("preview");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse the file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadImportTemplate(templateFilename, templateData);
    toast({
      title: "Template Downloaded",
      description: "Fill in the template and upload it to import data.",
    });
  };

  const handleStartImport = async () => {
    if (!importResult || importResult.validRows === 0) return;

    setStep("importing");
    setImportProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await onImport(importResult.data);

      clearInterval(progressInterval);
      setImportProgress(100);
      setFinalResult(result);
      setStep("complete");

      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.success} ${entityName}. ${
          result.failed > 0 ? `${result.failed} failed.` : ""
        }`,
        variant: result.failed > 0 ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred during import. Please try again.",
        variant: "destructive",
      });
      setStep("preview");
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Download Template */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="h-6 w-6 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium">Download Template</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Start by downloading our Excel template. Fill in the data and
              upload it.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        {isProcessing ? (
          <div className="space-y-3">
            <Loader2 className="h-10 w-10 mx-auto text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Processing file...</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-3 font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground mt-1">
              Excel (.xlsx, .xls) or CSV files
            </p>
          </>
        )}
      </div>

      {/* Required Fields Info */}
      <Accordion type="single" collapsible>
        <AccordionItem value="fields">
          <AccordionTrigger className="text-sm">
            Required & Optional Fields
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium mb-2">Required Fields *</h5>
                <div className="flex flex-wrap gap-2">
                  {templateData
                    .filter((f) => f.required)
                    .map((f) => (
                      <Badge key={f.header} variant="default">
                        {f.header}
                      </Badge>
                    ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-2">Optional Fields</h5>
                <div className="flex flex-wrap gap-2">
                  {templateData
                    .filter((f) => !f.required)
                    .map((f) => (
                      <Badge key={f.header} variant="outline">
                        {f.header}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  const renderPreviewStep = () => {
    if (!importResult) return null;

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{importResult.totalRows}</p>
            <p className="text-sm text-muted-foreground">Total Rows</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {importResult.validRows}
            </p>
            <p className="text-sm text-muted-foreground">Valid</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">
              {importResult.invalidRows}
            </p>
            <p className="text-sm text-muted-foreground">Invalid</p>
          </div>
        </div>

        {/* Errors */}
        {importResult.errors.length > 0 && (
          <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
            <div className="bg-red-50 dark:bg-red-950/20 px-4 py-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-600">
                {importResult.errors.length} Validation Errors
              </span>
            </div>
            <ScrollArea className="h-[150px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Row</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResult.errors.slice(0, 50).map((error, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{error.row}</TableCell>
                      <TableCell className="font-medium">
                        {error.field}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {error.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {/* Preview Data */}
        {importResult.validRows > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                Preview ({Math.min(5, importResult.data.length)} of{" "}
                {importResult.data.length} rows)
              </span>
            </div>
            <div className="max-h-[250px] overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
              <Table className="min-w-max">
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {Object.keys(importResult.data[0] || {}).map((key) => (
                      <TableHead key={key} className="whitespace-nowrap px-4">
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResult.data.slice(0, 5).map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.values(row).map((val, i) => (
                        <TableCell key={i} className="whitespace-nowrap px-4">
                          {String(val || "-")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* File Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>File: {selectedFile?.name}</span>
          <Button variant="ghost" size="sm" onClick={resetState}>
            <X className="h-4 w-4 mr-2" />
            Choose Different File
          </Button>
        </div>
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="py-8 space-y-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
        <p className="mt-4 font-medium">Importing {entityName}...</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we process your data.
        </p>
      </div>
      <Progress value={importProgress} className="w-full" />
      <p className="text-center text-sm text-muted-foreground">
        {importProgress}% complete
      </p>
    </div>
  );

  const renderCompleteStep = () => {
    const successResults = finalResult?.results.filter((r) => r.success) || [];
    const failedResults = finalResult?.results.filter((r) => !r.success) || [];

    // Helper to get display name from a record
    const getDisplayName = (data: Record<string, any>) => {
      if (data.full_name) return data.full_name;
      if (data.first_name && data.last_name)
        return `${data.first_name} ${data.last_name}`;
      if (data[identifierField]) return data[identifierField];
      return "Unknown";
    };

    const getIdentifier = (data: Record<string, any>) => {
      return (
        data[identifierField] ||
        data.admission_number ||
        data.employee_code ||
        data.phone ||
        ""
      );
    };

    return (
      <div className="space-y-4">
        {/* Summary Header */}
        <div className="text-center py-4">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
          <h3 className="text-xl font-semibold mt-2">Import Complete!</h3>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {finalResult?.success || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Successfully Imported
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-600">
              {finalResult?.failed || 0}
            </p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="max-h-[300px] overflow-y-auto space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Success List */}
          {successResults.length > 0 && (
            <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
              <div className="bg-green-50 dark:bg-green-950/30 px-4 py-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Imported Successfully ({successResults.length})
                </span>
              </div>
              <div className="divide-y divide-green-100 dark:divide-green-900">
                {successResults.slice(0, 10).map((result, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 flex items-center justify-between bg-green-50/50 dark:bg-green-950/10"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="font-medium">
                        {getDisplayName(result.data)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getIdentifier(result.data)}
                    </span>
                  </div>
                ))}
                {successResults.length > 10 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                    ... and {successResults.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Failed List */}
          {failedResults.length > 0 && (
            <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
              <div className="bg-red-50 dark:bg-red-950/30 px-4 py-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-700 dark:text-red-400">
                  Failed to Import ({failedResults.length})
                </span>
              </div>
              <div className="divide-y divide-red-100 dark:divide-red-900">
                {failedResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-red-50/50 dark:bg-red-950/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <X className="h-3 w-3 text-red-500" />
                        <span className="font-medium">
                          {getDisplayName(result.data)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getIdentifier(result.data)}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-5">
                      {result.reason || "Unknown error"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4 flex-1 overflow-auto">
          {step === "upload" && renderUploadStep()}
          {step === "preview" && renderPreviewStep()}
          {step === "importing" && renderImportingStep()}
          {step === "complete" && renderCompleteStep()}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={resetState}>
                Back
              </Button>
              <Button
                onClick={handleStartImport}
                disabled={!importResult || importResult.validRows === 0}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {importResult?.validRows || 0} {entityName}
              </Button>
            </>
          )}
          {step === "complete" && <Button onClick={handleClose}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
