/**
 * BookIssue Component
 * ===================
 * Issue books to library members
 */

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookMarked,
  Search,
  User,
  BookOpen,
  Calendar,
  Check,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  LOAN_PERIOD_DAYS,
} from "./types";

const INDEX_TOKEN = "1emaet";

export function BookIssue() {
  const [selectedMember, setSelectedMember] = useState<LibraryMember | null>(
    null
  );
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { canCreate } = useModulePermissions("library");
  const { toast } = useToast();

  // Fetch data
  const { data: books } = useSupabaseTable<LibraryBook>(
    `library_books_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: members } = useSupabaseTable<LibraryMember>(
    `library_members_${INDEX_TOKEN}`,
    { filters: { status: "active" } }
  );

  const { data: students } = useSupabaseTable<StudentInfo>(
    `students_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { data: teachers } = useSupabaseTable<TeacherInfo>(
    `teachers_${INDEX_TOKEN}`,
    { filters: {} }
  );

  const { createMutation } = useSupabaseTable<LibraryTransaction>(
    `library_transactions_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Create lookup maps
  const studentMap = useMemo(() => {
    if (!students) return new Map<string, StudentInfo>();
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const teacherMap = useMemo(() => {
    if (!teachers) return new Map<string, TeacherInfo>();
    return new Map(teachers.map((t) => [t.id, t]));
  }, [teachers]);

  // Filter available books
  const availableBooks = useMemo(() => {
    if (!books) return [];
    return books.filter(
      (b) => b.available_copies > 0 && b.status === "available"
    );
  }, [books]);

  // Search filtered books
  const filteredBooks = useMemo(() => {
    if (!bookSearch) return availableBooks.slice(0, 10);
    const search = bookSearch.toLowerCase();
    return availableBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search) ||
        b.isbn?.toLowerCase().includes(search)
    );
  }, [availableBooks, bookSearch]);

  // Search filtered members
  const filteredMembers = useMemo(() => {
    if (!members || !memberSearch) return [];
    const search = memberSearch.toLowerCase();

    return members.filter((m) => {
      if (m.member_type === "student") {
        const student = studentMap.get(m.member_id);
        if (!student) return false;
        return (
          student.first_name.toLowerCase().includes(search) ||
          student.last_name.toLowerCase().includes(search) ||
          student.admission_number.toLowerCase().includes(search) ||
          m.membership_number.toLowerCase().includes(search)
        );
      } else {
        const teacher = teacherMap.get(m.member_id);
        if (!teacher) return false;
        return (
          teacher.first_name.toLowerCase().includes(search) ||
          teacher.last_name.toLowerCase().includes(search) ||
          teacher.employee_code.toLowerCase().includes(search) ||
          m.membership_number.toLowerCase().includes(search)
        );
      }
    });
  }, [members, memberSearch, studentMap, teacherMap]);

  const getMemberName = (member: LibraryMember) => {
    if (member.member_type === "student") {
      const student = studentMap.get(member.member_id);
      return student ? `${student.first_name} ${student.last_name}` : "Unknown";
    } else {
      const teacher = teacherMap.get(member.member_id);
      return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unknown";
    }
  };

  const getMemberCode = (member: LibraryMember) => {
    if (member.member_type === "student") {
      const student = studentMap.get(member.member_id);
      return student?.admission_number || member.membership_number;
    } else {
      const teacher = teacherMap.get(member.member_id);
      return teacher?.employee_code || member.membership_number;
    }
  };

  const calculateDueDate = () => {
    if (!selectedMember) return new Date();
    const loanDays = LOAN_PERIOD_DAYS[selectedMember.member_type] || 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDays);
    return dueDate;
  };

  const handleIssue = async () => {
    if (!selectedMember || !selectedBook) {
      toast({
        title: "Selection Required",
        description: "Please select both a member and a book.",
        variant: "destructive",
      });
      return;
    }

    if (
      selectedMember.current_books_count >= selectedMember.max_books_allowed
    ) {
      toast({
        title: "Limit Reached",
        description: "This member has reached their maximum book limit.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const dueDate = calculateDueDate();

      await createMutation.mutateAsync({
        book_id: selectedBook.id,
        member_id: selectedMember.id,
        transaction_type: "issue",
        issue_date: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        status: "issued",
      } as Partial<LibraryTransaction>);

      toast({
        title: "Book Issued",
        description: `"${selectedBook.title}" has been issued successfully.`,
      });

      navigate("/library");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold">Issue Book</h1>
          <p className="text-muted-foreground">
            Issue a book to a library member
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Member
            </CardTitle>
            <CardDescription>
              Search for a library member by name or ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission no, or membership ID..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {memberSearch && filteredMembers.length > 0 && (
              <div className="border rounded-lg divide-y max-h-60 overflow-auto">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                      selectedMember?.id === member.id ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      setSelectedMember(member);
                      setMemberSearch("");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{getMemberName(member)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getMemberCode(member)} • {member.member_type}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {member.current_books_count}/{member.max_books_allowed}{" "}
                        books
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedMember && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getMemberName(selectedMember).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getMemberName(selectedMember)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getMemberCode(selectedMember)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        selectedMember.current_books_count >=
                        selectedMember.max_books_allowed
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {selectedMember.current_books_count}/
                      {selectedMember.max_books_allowed} books
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedMember.member_type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSelectedMember(null)}
                >
                  Change Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Book
            </CardTitle>
            <CardDescription>Search for an available book</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredBooks.length > 0 && !selectedBook && (
              <div className="border rounded-lg divide-y max-h-60 overflow-auto">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      setSelectedBook(book);
                      setBookSearch("");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {book.available_copies} available
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedBook && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded">
                    <AvatarImage
                      src={selectedBook.cover_image_url || undefined}
                    />
                    <AvatarFallback className="rounded">
                      <BookOpen className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedBook.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedBook.author}
                    </p>
                    {selectedBook.isbn && (
                      <p className="text-xs text-muted-foreground font-mono">
                        ISBN: {selectedBook.isbn}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedBook.available_copies} available
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSelectedBook(null)}
                >
                  Change Book
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Summary */}
      {selectedMember && selectedBook && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Issue Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Member</Label>
                <p className="font-medium">{getMemberName(selectedMember)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Book</Label>
                <p className="font-medium">{selectedBook.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Due Date</Label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {calculateDueDate().toLocaleDateString()}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link to="/library">Cancel</Link>
              </Button>
              <Button onClick={handleIssue} disabled={isSubmitting}>
                {isSubmitting ? (
                  "Issuing..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Issue Book
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
