/**
 * Doubts List Page - Student Question & Answer System
 * ====================================================
 *
 * TODO: This feature requires a doubts table to be added to the Tier 2 schema.
 * Suggested schema:
 *
 * CREATE TABLE doubts_1EMAET (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   title VARCHAR(255) NOT NULL,
 *   description TEXT,
 *   student_id UUID NOT NULL REFERENCES students_1EMAET(id),
 *   subject_id UUID REFERENCES subjects_1EMAET(id),
 *   topic_id UUID REFERENCES topics_1EMAET(id),
 *   assigned_teacher_id UUID REFERENCES teachers_1EMAET(id),
 *   status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   resolved_at TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE TABLE doubt_messages_1EMAET (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   doubt_id UUID NOT NULL REFERENCES doubts_1EMAET(id) ON DELETE CASCADE,
 *   sender_id UUID NOT NULL REFERENCES users_1EMAET(id),
 *   message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'file')),
 *   content TEXT,
 *   attachment_url TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 */

import { useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  DoubtsFilters,
  DoubtsListView,
  ConversationModal,
  type Doubt,
  type Message,
} from "./components";

// Demo data - replace with actual data when schema is implemented
const doubtsData: Doubt[] = [];
const messagesData: Message[] = [];

const DoubtsList = () => {
  const [showConversation, setShowConversation] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [sortOrder, setSortOrder] = useState("newest");

  // Permission check
  const permissions = useModulePermissions("DOUBTS");

  const handleDoubtClick = (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setShowConversation(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSubjectFilter("all");
    setStatusFilter("open");
    setSortOrder("newest");
  };

  const handleRefresh = () => {
    // TODO: Implement refresh logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          Assigned Doubts
        </h1>
        <Button variant="outline" className="gap-2" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Schema Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Schema Extension Required</AlertTitle>
        <AlertDescription>
          The Doubts feature requires additional database tables (doubts and
          doubt_messages) to be added to the Tier 2 schema. Currently showing
          demo data.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Filters */}
          <DoubtsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            subjectFilter={subjectFilter}
            onSubjectChange={setSubjectFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onClearFilters={handleClearFilters}
          />

          <p className="text-sm text-muted-foreground">
            Showing {doubtsData.length} of {doubtsData.length} total doubts.
          </p>

          {/* Doubts List */}
          <DoubtsListView doubts={doubtsData} onDoubtClick={handleDoubtClick} />
        </CardContent>
      </Card>

      {/* Conversation Modal */}
      <ConversationModal
        open={showConversation}
        onOpenChange={setShowConversation}
        doubt={selectedDoubt}
        messages={messagesData}
      />
    </div>
  );
};

export default DoubtsList;
