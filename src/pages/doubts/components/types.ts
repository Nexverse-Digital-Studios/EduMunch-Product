/**
 * Doubt Types
 * ============
 * Type definitions for the doubts module
 */

export interface Doubt {
  id: string;
  title: string;
  from: string;
  subject: string;
  topic: string;
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  type: "text" | "image" | "file";
}
