/**
 * BooksList Component
 * ===================
 * Browse and manage library books catalog
 */

import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  BookCopy,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { LibraryBook, LibraryCategory } from "./types";

const INDEX_TOKEN = "1emaet";

export function BooksList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canCreate, canUpdate, canDelete } = useModulePermissions("library");
  const { toast } = useToast();

  // Fetch books
  const {
    data: books,
    isLoading,
    deleteMutation,
  } = useSupabaseTable<LibraryBook>(`library_books_${INDEX_TOKEN}`, {
    filters: {},
  });

  // Fetch categories
  const { data: categories } = useSupabaseTable<LibraryCategory>(
    `library_categories_${INDEX_TOKEN}`,
    { filters: {} }
  );

  // Category map
  const categoryMap = useMemo(() => {
    if (!categories) return new Map<string, LibraryCategory>();
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    if (!books) return [];

    return books.filter((book) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.isbn?.toLowerCase().includes(searchLower);

      const matchesCategory =
        categoryFilter === "all" || book.category_id === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || book.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [books, searchQuery, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!books) return { total: 0, available: 0, categories: 0 };
    return {
      total: books.reduce((sum, b) => sum + b.total_copies, 0),
      available: books.reduce((sum, b) => sum + b.available_copies, 0),
      categories: categories?.length || 0,
    };
  }, [books, categories]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Book deleted",
        description: "The book has been removed from the catalog.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, available: number, total: number) => {
    if (status === "damaged") {
      return <Badge variant="destructive">Damaged</Badge>;
    }
    if (status === "lost") {
      return <Badge variant="destructive">Lost</Badge>;
    }
    if (available === 0) {
      return <Badge variant="secondary">All Issued</Badge>;
    }
    return (
      <Badge className="bg-green-100 text-green-800">
        {available}/{total} Available
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Books Catalog</h1>
          <p className="text-muted-foreground">
            {stats.total} books across {stats.categories} categories
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => toast({ title: "Add Book", description: "Book form coming soon." })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookCopy className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-xl font-bold">{stats.categories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="all_issued">All Issued</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Books ({filteredBooks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No books found</h3>
              <p className="text-muted-foreground">
                {books?.length === 0
                  ? "Start by adding books to the catalog"
                  : "Try adjusting your filters"}
              </p>
              {canCreate && books?.length === 0 && (
                <Button className="mt-4" onClick={() => toast({ title: "Add Book", description: "Book form coming soon." })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Book
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => {
                  const category = categoryMap.get(book.category_id || "");

                  return (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded">
                            <AvatarImage
                              src={book.cover_image_url || undefined}
                            />
                            <AvatarFallback className="rounded">
                              <BookOpen className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{book.title}</p>
                            {book.edition && (
                              <p className="text-xs text-muted-foreground">
                                {book.edition} Edition
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="outline">
                            {category.category_name}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {book.isbn || "-"}
                      </TableCell>
                      <TableCell>{book.location || "-"}</TableCell>
                      <TableCell>
                        {getStatusBadge(
                          book.status,
                          book.available_copies,
                          book.total_copies
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/library/books/${book.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/library/books/${book.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Book
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {book.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(book.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
