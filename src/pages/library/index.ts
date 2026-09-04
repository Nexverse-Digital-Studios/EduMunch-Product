/**
 * Library Management Module
 * =========================
 * Components for library book management, issue/return, and member tracking
 * 
 * Routes:
 * - /library - Dashboard with overview stats
 * - /library/books - Browse and manage book catalog
 * - /library/issue - Issue books to members
 * - /library/return - Process book returns
 * - /library/members - Manage library members
 */

export {
  LibraryDashboard,
  BooksList,
  BookIssue,
  BookReturn,
  LibraryMembers,
} from "./components";
