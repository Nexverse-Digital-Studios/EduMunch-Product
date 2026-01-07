/**
 * Parent PTM Bookings - View PTM Bookings History (Parent)
 * =========================================================
 * Shows parent's PTM booking history and status
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isPast } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock4,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getPTMBookings } from '@/services/ptm';

// Simplified interface for demo data and local state
interface LocalBooking {
  id: string;
  slot_id: string;
  student_id: string;
  parent_user_id: string;
  booking_date: string;
  status: string;
  meeting_purpose: string | null;
  topics_to_discuss: string[] | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  slot?: {
    id: string;
    teacher_id: string;
    ptm_date: string;
    start_time: string;
    end_time: string;
    status: string;
    is_online: boolean;
    meeting_link: string | null;
    teacher?: {
      first_name: string;
      last_name: string;
      employee_code: string;
    };
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  meetingNotes?: {
    id: string;
    discussion_points: string;
    student_strengths: string | null;
    areas_of_improvement: string | null;
    action_items: string[] | null;
    follow_up_required: boolean;
    follow_up_date: string | null;
  };
}

// Demo bookings for parent view
const demoBookings: LocalBooking[] = [
  {
    id: 'b1',
    slot_id: 's1',
    student_id: 'st1',
    parent_user_id: 'p1',
    booking_date: new Date().toISOString(),
    status: 'Confirmed',
    meeting_purpose: 'Discuss academic performance and upcoming exams',
    topics_to_discuss: ['Academic Performance', 'Study Habits', 'Career Guidance'],
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slot: {
      id: 's1',
      teacher_id: 't1',
      ptm_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '10:00:00',
      end_time: '10:30:00',
      status: 'Booked',
      is_online: true,
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      teacher: { first_name: 'Rajesh', last_name: 'Kumar', employee_code: 'TCH001' },
    },
    student: { id: 'st1', first_name: 'Rahul', last_name: 'Verma', admission_number: 'ADM2024001' },
  },
  {
    id: 'b2',
    slot_id: 's2',
    student_id: 'st1',
    parent_user_id: 'p1',
    booking_date: new Date().toISOString(),
    status: 'Pending',
    meeting_purpose: 'Discuss attendance concerns',
    topics_to_discuss: ['Attendance', 'Behavior'],
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slot: {
      id: 's2',
      teacher_id: 't2',
      ptm_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '14:00:00',
      end_time: '14:30:00',
      status: 'Booked',
      is_online: false,
      meeting_link: null,
      teacher: { first_name: 'Priya', last_name: 'Sharma', employee_code: 'TCH002' },
    },
    student: { id: 'st1', first_name: 'Rahul', last_name: 'Verma', admission_number: 'ADM2024001' },
  },
  {
    id: 'b3',
    slot_id: 's3',
    student_id: 'st2',
    parent_user_id: 'p1',
    booking_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
    meeting_purpose: 'Quarterly progress review',
    topics_to_discuss: ['Academic Performance', 'Extra-curricular Activities'],
    rejection_reason: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    slot: {
      id: 's3',
      teacher_id: 't3',
      ptm_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '11:00:00',
      end_time: '11:30:00',
      status: 'Completed',
      is_online: true,
      meeting_link: null,
      teacher: { first_name: 'Amit', last_name: 'Patel', employee_code: 'TCH003' },
    },
    student: { id: 'st2', first_name: 'Priya', last_name: 'Verma', admission_number: 'ADM2024015' },
    meetingNotes: {
      id: 'n1',
      discussion_points: 'Discussed overall performance. Student is doing well in Science.',
      student_strengths: 'Quick learner, participates actively in class',
      areas_of_improvement: 'Needs to focus more on Mathematics',
      action_items: ['Practice math problems daily', 'Complete extra worksheets'],
      follow_up_required: true,
      follow_up_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  },
  {
    id: 'b4',
    slot_id: 's4',
    student_id: 'st1',
    parent_user_id: 'p1',
    booking_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Rejected',
    meeting_purpose: 'Discuss sports participation',
    topics_to_discuss: null,
    rejection_reason: 'Teacher on leave during requested period. Please reschedule.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    slot: {
      id: 's4',
      teacher_id: 't4',
      ptm_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '15:00:00',
      end_time: '15:30:00',
      status: 'Cancelled',
      is_online: false,
      meeting_link: null,
      teacher: { first_name: 'Sunita', last_name: 'Gupta', employee_code: 'TCH004' },
    },
    student: { id: 'st1', first_name: 'Rahul', last_name: 'Verma', admission_number: 'ADM2024001' },
  },
];

const ParentPTMBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<LocalBooking[]>(demoBookings);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<LocalBooking | null>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getPTMBookings({ parent_user_id: user?.id });
      if (data.length > 0) {
        setBookings(data as any);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Confirmed</Badge>;
      case 'Pending':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CalendarDays className="h-5 w-5 text-blue-500" />;
      case 'Pending':
        return <Clock4 className="h-5 w-5 text-yellow-500" />;
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const upcomingBookings = bookings.filter(
    b => ['Confirmed', 'Pending'].includes(b.status) && 
         b.slot && !isPast(parseISO(b.slot.ptm_date + 'T' + b.slot.end_time))
  );
  const pastBookings = bookings.filter(
    b => b.status === 'Completed' ||
         (b.slot && isPast(parseISO(b.slot.ptm_date + 'T' + b.slot.end_time)))
  );
  const rejectedBookings = bookings.filter(b => b.status === 'Rejected');

  const BookingCard = ({ booking }: { booking: LocalBooking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(booking.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold">
                  {booking.slot?.teacher?.first_name} {booking.slot?.teacher?.last_name}
                </h3>
                {getStatusBadge(booking.status)}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                For: {booking.student?.first_name} {booking.student?.last_name}
              </p>

              {booking.slot && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(parseISO(booking.slot.ptm_date), 'EEE, dd MMM yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {booking.slot.start_time.slice(0, 5)} - {booking.slot.end_time.slice(0, 5)}
                  </span>
                  <span className="flex items-center gap-1">
                    {booking.slot.is_online ? (
                      <Video className="h-4 w-4 text-primary" />
                    ) : (
                      <MapPin className="h-4 w-4 text-primary" />
                    )}
                    {booking.slot.is_online ? 'Online' : 'In-person'}
                  </span>
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {booking.meeting_purpose}
              </p>

              {booking.status === 'Rejected' && booking.rejection_reason && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-sm">
                  <span className="font-medium text-red-800 dark:text-red-200">Reason: </span>
                  <span className="text-red-700 dark:text-red-300">{booking.rejection_reason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {booking.status === 'Confirmed' && booking.slot?.is_online && booking.slot.meeting_link && (
              <Button
                size="sm"
                onClick={() => window.open(booking.slot?.meeting_link || '', '_blank')}
              >
                <Video className="h-4 w-4 mr-1" />
                Join
              </Button>
            )}
            
            {booking.status === 'Completed' && booking.meetingNotes && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowNotesDialog(true);
                }}
              >
                <FileText className="h-4 w-4 mr-1" />
                Notes
              </Button>
            )}

            {booking.status === 'Rejected' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/parent/ptm/request')}
              >
                Reschedule
              </Button>
            )}
          </div>
        </div>

        {booking.topics_to_discuss && booking.topics_to_discuss.length > 0 && (
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
            {booking.topics_to_discuss.map((topic, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My PTM Bookings</h1>
            <p className="text-muted-foreground">View your parent-teacher meeting history</p>
          </div>
        </div>
        <Button onClick={() => navigate('/parent/ptm/request')}>
          <Plus className="h-4 w-4 mr-2" />
          Request Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingBookings.filter(b => b.status === 'Confirmed').length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <Clock4 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'Pending').length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastBookings.filter(b => b.status === 'Completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedBookings.length}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({pastBookings.filter(b => b.status === 'Completed').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : upcomingBookings.length > 0 ? (
            upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState message="No upcoming meetings. Request a meeting to get started." />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {pastBookings.filter(b => b.status === 'Completed').length > 0 ? (
            pastBookings.filter(b => b.status === 'Completed').map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState message="No completed meetings yet." />
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4 space-y-3">
          {rejectedBookings.length > 0 ? (
            rejectedBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState message="No rejected requests." />
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Meeting Notes</DialogTitle>
            <DialogDescription>
              Notes from your meeting with {selectedBooking?.slot?.teacher?.first_name} {selectedBooking?.slot?.teacher?.last_name}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking?.meetingNotes && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Discussion Points</h4>
                <p className="text-sm">{selectedBooking.meetingNotes.discussion_points}</p>
              </div>

              {selectedBooking.meetingNotes.student_strengths && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Strengths</h4>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-sm">
                    {selectedBooking.meetingNotes.student_strengths}
                  </div>
                </div>
              )}

              {selectedBooking.meetingNotes.areas_of_improvement && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Areas of Improvement</h4>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-sm">
                    {selectedBooking.meetingNotes.areas_of_improvement}
                  </div>
                </div>
              )}

              {selectedBooking.meetingNotes.action_items && selectedBooking.meetingNotes.action_items.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Action Items</h4>
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
                    <ul className="list-disc list-inside space-y-1">
                      {selectedBooking.meetingNotes.action_items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedBooking.meetingNotes.follow_up_required && selectedBooking.meetingNotes.follow_up_date && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Follow-up scheduled for {format(parseISO(selectedBooking.meetingNotes.follow_up_date), 'dd MMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentPTMBookings;
