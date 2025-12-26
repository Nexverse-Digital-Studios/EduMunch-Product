/**
 * BookReturn Component
 * ====================
 * Process book returns
 */

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Search,
  BookOpen,
  Calendar,
  Check,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import {
  LibraryBook,
  LibraryMember,
  LibraryTransaction,
  StudentInfo,
  TeacherInfo,
  DEFAULT_FINE_SETTINGS,
} from "./types";

const INDEX_TOKEN = "1emaet";

export function BookReturn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<LibraryTransaction | null>(null);
  const [finePaid, setFinePaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { canCreate } = useModulePermissions("library");
  const { toast } = useToast();

  // Fetch data
  const { data: transactions, updateMutation } =
    useSupabaseTable<LibraryTransaction>(
      `library_transactions_${INDEX_TOKEN}`,
      { filters: { status: "issued" } }
    );

  const { data: books } = useSupabaseTable<LibraryBook>(
    `library_books_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: members } = useSupabaseTable<LibraryMember>(
    `library_members_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: students } = useSupabaseTable<StudentInfo>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: teachers } = useSupabaseTable<TeacherInfo>(
    `teachers_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Create lookup maps
  const bookMap = useMemo(() => {
    if (!books) return new Map<string, LibraryBook>();
    return new Map(books.map((b) => [b.id, b]));
  }, [books]);

  const memberMap = useMemo(() => {
    if (!members) return new Map<string, LibraryMember>();
    return new Map(members.map((m) => [m.id, m]));
  }, [members]);

  const studentMap = useMemo(() => {
    if (!students) return new Map<string, StudentInfo>();
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const teacherMap = useMemo(() => {
    if (!teachers) return new Map<string, TeacherInfo>();
    return new Map(teachers.map((t) => [t.id, t]));
  }, [teachers]);

  // Search filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions || !searchQuery) return transactions?.slice(0, 10) || [];
    const search = searchQuery.toLowerCase();

    return transactions.filter((t) => {
      const book = bookMap.get(t.book_id);
      const member = memberMap.get(t.member_id);

      if (book?.title.toLowerCase().includes(search)) return true;
      if (book?.isbn?.toLowerCase().includes(search)) return true;

      if (member) {
        if (member.membership_number.toLowerCase().includes(search))
          return true;
        if (member.member_type === "student") {
          const student = studentMap.get(member.member_id);
          if (
            student?.first_name.toLowerCase().includes(search) ||
            student?.last_name.toLowerCase().includes(search) ||
            student?.admission_number.toLowerCase().includes(search)
          )
            return true;
        } else {
          const teacher = teacherMap.get(member.member_id);
          if (
            teacher?.first_name.toLowerCase().includes(search) ||
            teacher?.last_name.toLowerCase().includes(search) ||
            teacher?.employee_code.toLowerCase().includes(search)
          )
            return true;
        }
      }

      return false;
    });
  }, [transactions, searchQuery, bookMap, memberMap, studentMap, teacherMap]);

  const getMemberName = (member: LibraryMember) => {
    if (member.member_type === "student") {
      const student = studentMap.get(member.member_id);
      return student ? `${student.first_name} ${student.last_name}` : "Unknown";
    } else {
      const teacher = teacherMap.get(member.member_id);
      return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unknown";
    }
  };

  const calculateFine = (transaction: LibraryTransaction) => {
    const dueDate = new Date(transaction.due_date);
    const today = new Date();

    if (today <= dueDate) return 0;

    const daysOverdue = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const effectiveDays = Math.min(
      daysOverdue,
      DEFAULT_FINE_SETTINGS.maxFineDays
    );
    return effectiveDays * DEFAULT_FINE_SETTINGS.finePerDay;
  };

  const isOverdue = (transaction: LibraryTransaction) => {
    return new Date(transaction.due_date) < new Date();
  };

  const handleReturn = async () => {
    if (!selectedTransaction) return;

    const fine = calculateFine(selectedTransaction);
    if (fine > 0 && !finePaid) {
      toast({
        title: "Fine Required",
        description: "Please collect the fine before processing the return.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: selectedTransaction.id,
        updates: {
          return_date: new Date().toISOString(),
          status: "returned",
          fine_amount: fine,
          fine_paid: finePaid,
        },
      });

      toast({
        title: "Book Returned",
        description: "The book has been returned successfully.",
      });

      navigate("/library");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process return. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/library">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Return Book</h1>
          <p className="text-muted-foreground">Process a book return</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Issued Book
          </CardTitle>
          <CardDescription>
            Search by book title, ISBN, member name, or ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issued books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredTransactions &&
            filteredTransactions.length > 0 &&
            !selectedTransaction && (
              <div className="border rounded-lg divide-y max-h-80 overflow-auto">
                {filteredTransactions.map((transaction) => {
                  const book = bookMap.get(transaction.book_id);
                  const member = memberMap.get(transaction.member_id);
                  const overdue = isOverdue(transaction);
                  const fine = calculateFine(transaction);

                  return (
                    <div
                      key={transaction.id}
                      className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                        overdue ? "bg-red-50 hover:bg-red-100" : ""
                      }`}
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setSearchQuery("");
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 rounded">
                            <AvatarImage
                              src={book?.cover_image_url || undefined}
                            />
                            <AvatarFallback className="rounded">
                              <BookOpen className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {book?.title || "Unknown Book"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member
                                ? getMemberName(member)
                                : "Unknown Member"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due:{" "}
                              {new Date(
                                transaction.due_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {overdue ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Overdue
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Issued</Badge>
                          )}
                          {fine > 0 && (
                            <p className="text-sm text-red-600 mt-1">
                              Fine: {formatCurrency(fine)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          {transactions?.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No issued books</h3>
              <p className="text-muted-foreground">
                There are no books currently issued
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Summary */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Return Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const book = bookMap.get(selectedTransaction.book_id);
              const member = memberMap.get(selectedTransaction.member_id);
              const overdue = isOverdue(selectedTransaction);
              const fine = calculateFine(selectedTransaction);
              const daysOverdue = Math.floor(
                (new Date().getTime() -
                  new Date(selectedTransaction.due_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Book Info */}
                    <div className="space-y-4">
                      <Label className="text-muted-foreground">
                        Book Details
                      </Label>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Avatar className="h-12 w-12 rounded">
                          <AvatarImage
                            src={book?.cover_image_url || undefined}
                          />
                          <AvatarFallback className="rounded">
                            <BookOpen className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{book?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {book?.author}
                          </p>
                          {book?.isbn && (
                            <p className="text-xs text-muted-foreground font-mono">
                              ISBN: {book.isbn}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="space-y-4">
                      <Label className="text-muted-foreground">
                        Member Details
                      </Label>
                      <div className="p-3 border rounded-lg">
                        <p className="font-medium">
                          {member ? getMemberName(member) : "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member?.membership_number}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {member?.member_type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Dates and Fine */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Issue Date
                      </Label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(
                          selectedTransaction.issue_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Due Date</Label>
                      <p
                        className={`font-medium flex items-center gap-2 ${
                          overdue ? "text-red-600" : ""
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        {new Date(
                          selectedTransaction.due_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Return Date
                      </Label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {overdue && (
                    <>
                      <Separator className="my-4" />
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-800 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Overdue Fine
                            </p>
                            <p className="text-sm text-red-600">
                              {daysOverdue} days overdue @ ₹
                              {DEFAULT_FINE_SETTINGS.finePerDay}/day
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(fine)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Checkbox
                            id="finePaid"
                            checked={finePaid}
                            onCheckedChange={(checked) =>
                              setFinePaid(checked as boolean)
                            }
                          />
                          <Label htmlFor="finePaid" className="text-red-800">
                            Fine collected
                          </Label>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator className="my-4" />

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTransaction(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReturn}
                      disabled={isSubmitting || (fine > 0 && !finePaid)}
                    >
                      {isSubmitting ? (
                        "Processing..."
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Process Return
                        </>
                      )}
                    </Button>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
