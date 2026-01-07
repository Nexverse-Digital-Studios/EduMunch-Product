/**
 * PTM Requests Queue - Admin Approval Page
 * ==========================================
 * Allows admin to approve or reject parent-initiated PTM requests
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  MessageSquare,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useModulePermissions } from '@/contexts/PermissionContext';
import { useAuth } from '@/contexts/AuthContext';
import { PTMBookingWithDetails } from '@/types/ptm';
import { getPTMBookings, reviewPTMRequest } from '@/services/ptm';
import { format, parseISO } from 'date-fns';

const PTMRequestsQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions('ptm');
  const { user } = useAuth();

  const [requests, setRequests] = useState<PTMBookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PTMBookingWithDetails | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getPTMBookings();
      // Always set real data, even if empty (no demo data fallback)
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const approvedRequests = requests.filter(r => r.status === 'Confirmed');
  const rejectedRequests = requests.filter(r => r.status === 'Rejected');

  const handleApprove = async (request: PTMBookingWithDetails) => {
    setProcessing(true);
    try {
      await reviewPTMRequest(
        { booking_id: request.id, action: 'approve' },
        user?.id || 'admin'
      );
      
      // Update local state
      setRequests(prev => prev.map(r => 
        r.id === request.id 
          ? { ...r, status: 'Confirmed' as const, reviewed_at: new Date().toISOString() }
          : r
      ));
      
      toast({
        title: 'Request Approved',
        description: `PTM request for ${request.student?.first_name} ${request.student?.last_name} has been approved.`,
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      await reviewPTMRequest(
        { 
          booking_id: selectedRequest.id, 
          action: 'reject',
          rejection_reason: rejectionReason 
        },
        user?.id || 'admin'
      );
      
      // Update local state
      setRequests(prev => prev.map(r => 
        r.id === selectedRequest.id 
          ? { 
              ...r, 
              status: 'Rejected' as const, 
              reviewed_at: new Date().toISOString(),
              rejection_reason: rejectionReason 
            }
          : r
      ));
      
      toast({
        title: 'Request Rejected',
        description: `PTM request has been rejected.`,
        variant: 'destructive',
      });
      
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (request: PTMBookingWithDetails) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const RequestCard = ({ request, showActions = true }: { request: PTMBookingWithDetails; showActions?: boolean }) => (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Request Details */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    {request.student?.first_name} {request.student?.last_name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {request.student?.admission_number}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {request.student?.class?.class_name} - {request.student?.section?.section_name}
                </p>
              </div>
              {request.status === 'Confirmed' && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}
              {request.status === 'Rejected' && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </Badge>
              )}
            </div>

            {/* Parent & Teacher Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Parent</p>
                  <p className="font-medium">
                    {request.parent?.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{request.parent?.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Teacher Requested</p>
                  <p className="font-medium">
                    {request.slot?.teacher?.first_name} {request.slot?.teacher?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{request.slot?.teacher?.employee_code}</p>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {request.slot?.ptm_date && format(parseISO(request.slot.ptm_date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {request.slot?.start_time && formatTime(request.slot.start_time)} - {request.slot?.end_time && formatTime(request.slot.end_time)}
                </span>
              </div>
              <Badge variant="outline">
                {request.slot?.is_online ? '🌐 Online' : `📍 ${request.slot?.location || 'In-person'}`}
              </Badge>
            </div>

            {/* Purpose */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Purpose of Meeting</p>
                  <p className="text-sm">{request.meeting_purpose}</p>
                  {request.topics_to_discuss && request.topics_to_discuss.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {request.topics_to_discuss.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            {request.status === 'Rejected' && request.rejection_reason && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700 dark:text-red-300">{request.rejection_reason}</p>
              </div>
            )}

            {/* Request Time */}
            <p className="text-xs text-muted-foreground">
              Requested on {format(parseISO(request.created_at), 'MMM d, yyyy')} at {format(parseISO(request.created_at), 'h:mm a')}
              {request.reviewed_at && (
                <span> • Reviewed on {format(parseISO(request.reviewed_at), 'MMM d, yyyy')}</span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          {showActions && request.status === 'Pending' && canUpdate && (
            <div className="flex lg:flex-col gap-2 lg:min-w-[120px]">
              <Button 
                className="flex-1 lg:w-full" 
                onClick={() => handleApprove(request)}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 lg:w-full"
                onClick={() => openRejectDialog(request)}
                disabled={processing}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/ptm')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">PTM Requests</h1>
          <p className="text-muted-foreground">Review and manage parent meeting requests</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending PTM requests to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-4">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No approved requests yet
              </CardContent>
            </Card>
          ) : (
            approvedRequests.map((request) => (
              <RequestCard key={request.id} request={request} showActions={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6 space-y-4">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No rejected requests
              </CardContent>
            </Card>
          ) : (
            rejectedRequests.map((request) => (
              <RequestCard key={request.id} request={request} showActions={false} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject PTM Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this meeting request? The parent will be notified with your reason.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="p-3 bg-muted/50 rounded-lg mb-4">
                <p className="font-medium">
                  {selectedRequest.student?.first_name} {selectedRequest.student?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Parent: {selectedRequest.parent?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Teacher: {selectedRequest.slot?.teacher?.first_name} {selectedRequest.slot?.teacher?.last_name}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rejection_reason">Reason for Rejection *</Label>
                <Textarea
                  id="rejection_reason"
                  placeholder="Please provide a reason for rejecting this request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PTMRequestsQueue;
