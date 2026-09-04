/**
 * LibraryDashboard Component
 * ==========================
 * Main dashboard for library management
 */

import { useState, useMemo } from "react";
import {
  BookOpen,
  BookCopy,
  Users,
  Clock,
  AlertTriangle,
  IndianRupee,
  Plus,
  Search,
  ArrowUpRight,
  BookMarked,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  LibraryBook,
  LibraryTransaction,
  LibraryMember,
  LibraryStats,
} from "./types";

const INDEX_TOKEN = "1emaet";

export function LibraryDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("books");

  const { canView, canCreate } = useModulePermissions("library");
  const { toast } = useToast();

  // Fetch books
  const { data: books, isLoading: loadingBooks } =
    useSupabaseTable<LibraryBook>(`library_books_${INDEX_TOKEN}`, {
      filters: {},
    });

  // Fetch transactions
  const { data: transactions } = useSupabaseTable<LibraryTransaction>(
    `library_transactions_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Fetch members
  const { data: members } = useSupabaseTable<LibraryMember>(
    `library_members_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Calculate stats
  const stats: LibraryStats = useMemo(() => {
    const totalBooks = books?.reduce((sum, b) => sum + b.total_copies, 0) || 0;
    const availableBooks =
      books?.reduce((sum, b) => sum + b.available_copies, 0) || 0;
    const issuedBooks = totalBooks - availableBooks;

    const overdueTransactions =
      transactions?.filter(
        (t) =>
          t.status === "overdue" ||
          (t.status === "issued" && new Date(t.due_date) < new Date())
      ) || [];

    const totalFinesDue =
      transactions?.reduce(
        (sum, t) => sum + (t.fine_amount && !t.fine_paid ? t.fine_amount : 0),
        0
      ) || 0;

    return {
      totalBooks,
      availableBooks,
      issuedBooks,
      totalMembers: members?.filter((m) => m.status === "active").length || 0,
      overdueBooks: overdueTransactions.length,
      totalFinesDue,
    };
  }, [books, transactions, members]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [transactions]);

  // Overdue books
  const overdueBooks = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(
      (t) => t.status === "issued" && new Date(t.due_date) < new Date()
    );
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddBook = () => {
    toast({
      title: "Add Book",
      description: "Book creation will be available in the Books tab.",
    });
    setActiveTab("books");
  };

  if (loadingBooks) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Library Management
          </h1>
          <p className="text-muted-foreground">
            Manage books, members, and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button onClick={handleAddBook}>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.availableBooks} available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <BookCopy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued Books</p>
                <p className="text-2xl font-bold">{stats.issuedBooks}</p>
                <p className="text-xs text-muted-foreground">Currently out</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdueBooks}</p>
                <p className="text-xs text-muted-foreground">Need follow-up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <IndianRupee className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fines Due</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalFinesDue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pending collection
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Now using buttons to switch tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("books")}
        >
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">Browse Books</p>
            <p className="text-xs text-muted-foreground">View catalog</p>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("issue")}
        >
          <CardContent className="pt-6 text-center">
            <BookMarked className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium">Issue Book</p>
            <p className="text-xs text-muted-foreground">New checkout</p>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("return")}
        >
          <CardContent className="pt-6 text-center">
            <RotateCcw className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium">Return Book</p>
            <p className="text-xs text-muted-foreground">Process return</p>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => setActiveTab("members")}
        >
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium">Members</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalMembers} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="books">
            <BookOpen className="mr-2 h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="issue">
            <BookMarked className="mr-2 h-4 w-4" />
            Issue
          </TabsTrigger>
          <TabsTrigger value="return">
            <RotateCcw className="mr-2 h-4 w-4" />
            Return
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Clock className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="overdue">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Overdue ({overdueBooks.length})
          </TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle>Book Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              {books && books.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{book.category}</Badge>
                        </TableCell>
                        <TableCell>{book.available_copies}</TableCell>
                        <TableCell>{book.total_copies}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No books in catalog</h3>
                  <p className="text-muted-foreground mb-4">
                    Add books to your library
                  </p>
                  {canCreate && (
                    <Button onClick={handleAddBook}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Book
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issue Tab */}
        <TabsContent value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Issue Books</CardTitle>
              <CardDescription>Issue books to library members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Issue a Book</h3>
                <p className="text-muted-foreground mb-4">
                  Select a book and member to issue
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Return Tab */}
        <TabsContent value="return">
          <Card>
            <CardHeader>
              <CardTitle>Return Books</CardTitle>
              <CardDescription>Process book returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Process Return</h3>
                <p className="text-muted-foreground mb-4">
                  Enter book or member ID to process return
                </p>
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Search Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Library Members</CardTitle>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Books Issued</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.member_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.current_books_count || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No members registered</h3>
                  <p className="text-muted-foreground">
                    Library members will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">
                    No recent transactions
                  </h3>
                  <p className="text-muted-foreground">
                    Transactions will appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.transaction_type === "issue"
                                ? "default"
                                : transaction.transaction_type === "return"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {transaction.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.book_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {transaction.member_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {new Date(
                            transaction.issue_date
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "returned"
                                ? "outline"
                                : transaction.status === "overdue"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Books */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Overdue Books
              </CardTitle>
              <CardDescription>
                Books that have passed their due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueBooks.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No overdue books!</h3>
                  <p className="text-muted-foreground">
                    All books have been returned on time
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Fine</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueBooks.map((transaction) => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() -
                          new Date(transaction.due_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const fine = daysOverdue * 2; // ₹2 per day

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.book_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {transaction.member_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction.issue_date
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction.due_date
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {daysOverdue} days
                            </Badge>
                          </TableCell>
                          <TableCell className="text-red-600 font-medium">
                            {formatCurrency(fine)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Send Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
