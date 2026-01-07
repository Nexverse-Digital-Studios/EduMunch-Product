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

// Demo data
const demoRequests: PTMBookingWithDetails[] = [
  {
    id: 'req1',
    slot_id: 'slot1',
    student_id: 's1',
    parent_user_id: 'p1',
    booking_date: '2026-01-06T10:30:00',
    meeting_purpose: 'Want to discuss my child\'s declining performance in Mathematics and Science subjects',
    topics_to_discuss: ['Academic performance', 'Study habits', 'Extra classes'],
    status: 'Pending',
    cancellation_reason: null,
    cancelled_at: null,
    reminder_sent: false,
    reminder_sent_at: null,
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2026-01-06T10:30:00',
    updated_at: '2026-01-06T10:30:00',
    slot: {
      id: 'slot1',
      teacher_id: 't1',
      ptm_date: '2026-01-20',
      start_time: '10:00:00',
      end_time: '10:30:00',
      slot_duration_minutes: 30,
      max_bookings: 1,
      location: null,
      is_online: true,
      meeting_link: null,
      status: 'Requested',
      notes: null,
      is_bulk_scheduled: false,
      class_id: null,
      batch_id: null,
      created_at: '2026-01-06',
      updated_at: '2026-01-06',
      teacher: { id: 't1', first_name: 'Rajesh', last_name: 'Kumar', employee_code: 'TCH001', user_id: 'u1' },
    },
    student: {
      id: 's1',
      first_name: 'Rahul',
      last_name: 'Verma',
      admission_number: 'ADM2024001',
      class_id: 'c1',
      section_id: 'sec1',
      class: { class_name: 'Class 10' },
      section: { section_name: 'A' },
    },
    parent: {
      id: 'par1',
      user_id: 'p1',
      first_name: 'Suresh',
      last_name: 'Verma',
      phone: '9876543210',
      email: 'suresh.verma@email.com',
    },
  },
  {
    id: 'req2',
    slot_id: 'slot2',
    student_id: 's2',
    parent_user_id: 'p2',
    booking_date: '2026-01-05T14:00:00',
    meeting_purpose: 'Discuss behavioral issues and frequent absences',
    topics_to_discuss: ['Behavior', 'Attendance', 'Discipline'],
    status: 'Pending',
    cancellation_reason: null,
    cancelled_at: null,
    reminder_sent: false,
    reminder_sent_at: null,
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2026-01-05T14:00:00',
    updated_at: '2026-01-05T14:00:00',
    slot: {
      id: 'slot2',
      teacher_id: 't2',
      ptm_date: '2026-01-18',
      start_time: '14:00:00',
      end_time: '14:30:00',
      slot_duration_minutes: 30,
      max_bookings: 1,
      location: 'Room 105',
      is_online: false,
      meeting_link: null,
      status: 'Requested',
      notes: null,
      is_bulk_scheduled: false,
      class_id: null,
      batch_id: null,
      created_at: '2026-01-05',
      updated_at: '2026-01-05',
      teacher: { id: 't2', first_name: 'Priya', last_name: 'Sharma', employee_code: 'TCH002', user_id: 'u2' },
    },
    student: {
      id: 's2',
      first_name: 'Ananya',
      last_name: 'Singh',
      admission_number: 'ADM2024002',
      class_id: 'c1',
      section_id: 'sec1',
      class: { class_name: 'Class 10' },
      section: { section_name: 'A' },
    },
    parent: {
      id: 'par2',
      user_id: 'p2',
      first_name: 'Vikram',
      last_name: 'Singh',
      phone: '9876543211',
      email: 'vikram.singh@email.com',
    },
  },
  {
    id: 'req3',
    slot_id: 'slot3',
    student_id: 's3',
    parent_user_id: 'p3',
    booking_date: '2026-01-04T09:00:00',
    meeting_purpose: 'General progress discussion',
    topics_to_discuss: ['Progress', 'Future plans'],
    status: 'Confirmed',
    cancellation_reason: null,
    cancelled_at: null,
    reminder_sent: true,
    reminder_sent_at: '2026-01-06T10:00:00',
    reviewed_by: 'admin1',
    reviewed_at: '2026-01-04T15:00:00',
    rejection_reason: null,
    created_at: '2026-01-04T09:00:00',
    updated_at: '2026-01-04T15:00:00',
    slot: {
      id: 'slot3',
      teacher_id: 't3',
      ptm_date: '2026-01-22',
      start_time: '11:00:00',
      end_time: '11:30:00',
      slot_duration_minutes: 30,
      max_bookings: 1,
      location: null,
      is_online: true,
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      status: 'Booked',
      notes: null,
      is_bulk_scheduled: false,
      class_id: null,
      batch_id: null,
      created_at: '2026-01-04',
      updated_at: '2026-01-04',
      teacher: { id: 't3', first_name: 'Amit', last_name: 'Patel', employee_code: 'TCH003', user_id: 'u3' },
    },
    student: {
      id: 's3',
      first_name: 'Kavya',
      last_name: 'Gupta',
      admission_number: 'ADM2024003',
      class_id: 'c2',
      section_id: 'sec2',
      class: { class_name: 'Class 9' },
      section: { section_name: 'B' },
    },
    parent: {
      id: 'par3',
      user_id: 'p3',
      first_name: 'Arun',
      last_name: 'Gupta',
      phone: '9876543212',
      email: 'arun.gupta@email.com',
    },
  },
];

const PTMRequestsQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions('ptm');
  const { user } = useAuth();

  const [requests, setRequests] = useState<PTMBookingWithDetails[]>(demoRequests);
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
      if (data.length > 0) {
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
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
        description: `PTM request for ${request.student?.first_name} ${request.student?.last_name} has been approved. Both parent and teacher will be notified.`,
      });
    } catch (error) {
      console.error('Error approving request:', error);
      // Demo mode - update anyway
      setRequests(prev => prev.map(r => 
        r.id === request.id 
          ? { ...r, status: 'Confirmed' as const, reviewed_at: new Date().toISOString() }
          : r
      ));
      toast({
        title: 'Request Approved (Demo)',
        description: 'In production, notifications would be sent to parent and teacher.',
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
        description: `PTM request has been rejected. Parent will be notified.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Demo mode - update anyway
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
        title: 'Request Rejected (Demo)',
        description: 'In production, parent would be notified with the reason.',
      });
    } finally {
      setProcessing(false);
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
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
                    {request.parent?.first_name} {request.parent?.last_name}
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
                  Parent: {selectedRequest.parent?.first_name} {selectedRequest.parent?.last_name}
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
