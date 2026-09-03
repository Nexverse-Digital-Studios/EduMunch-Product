/**
 * Teacher PTM Schedule - View Assigned PTM Slots (Teacher)
 * ==========================================================
 * Shows teachers their assigned PTM slots and scheduled meetings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  GraduationCap,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PTMSlotWithDetails, PTMBookingWithDetails, MeetingNotesInput } from '@/types/ptm';
import { getPTMSlots, getPTMBookings, createMeetingNotes } from '@/services/ptm';
import { format, parseISO, isToday, isBefore, isAfter, addDays, startOfWeek, endOfWeek } from 'date-fns';

// Demo data
const demoSlots: PTMSlotWithDetails[] = [
  {
    id: 'slot1',
    teacher_id: 't1',
    ptm_date: '2026-01-15',
    start_time: '09:00:00',
    end_time: '13:00:00',
    slot_duration_minutes: 15,
    max_bookings: 1,
    location: 'Room 101',
    is_online: false,
    meeting_link: null,
    status: 'Booked',
    notes: 'Class 10 PTM - January',
    is_bulk_scheduled: true,
    class_id: 'c1',
    batch_id: 'b1',
    created_at: '2026-01-07',
    updated_at: '2026-01-07',
    class: { id: 'c1', class_name: 'Class 10', class_code: 'X' },
  },
  {
    id: 'slot2',
    teacher_id: 't1',
    ptm_date: '2026-01-20',
    start_time: '10:00:00',
    end_time: '10:30:00',
    slot_duration_minutes: 30,
    max_bookings: 1,
    location: null,
    is_online: true,
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    status: 'Booked',
    notes: 'Parent Request',
    is_bulk_scheduled: false,
    class_id: null,
    batch_id: null,
    created_at: '2026-01-06',
    updated_at: '2026-01-06',
  },
];

const demoBookings: PTMBookingWithDetails[] = [
  {
    id: 'b1',
    slot_id: 'slot1',
    student_id: 's1',
    parent_user_id: 'p1',
    booking_date: '2026-01-08',
    meeting_purpose: 'Discuss mid-term results and academic progress',
    topics_to_discuss: ['Academic performance', 'Attendance', 'Extra-curricular'],
    status: 'Confirmed',
    cancellation_reason: null,
    cancelled_at: null,
    reminder_sent: true,
    reminder_sent_at: null,
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2026-01-08',
    updated_at: '2026-01-08',
    slot: demoSlots[0],
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
    id: 'b2',
    slot_id: 'slot2',
    student_id: 's2',
    parent_user_id: 'p2',
    booking_date: '2026-01-06',
    meeting_purpose: 'Discuss behavioral concerns and improvement plan',
    topics_to_discuss: ['Behavior', 'Discipline', 'Homework'],
    status: 'Confirmed',
    cancellation_reason: null,
    cancelled_at: null,
    reminder_sent: false,
    reminder_sent_at: null,
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2026-01-06',
    updated_at: '2026-01-06',
    slot: demoSlots[1],
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
];

const TeacherPTMSchedule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [slots, setSlots] = useState<PTMSlotWithDetails[]>(demoSlots);
  const [bookings, setBookings] = useState<PTMBookingWithDetails[]>(demoBookings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Meeting notes dialog
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PTMBookingWithDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notesForm, setNotesForm] = useState<MeetingNotesInput>({
    booking_id: '',
    discussion_points: '',
    student_strengths: '',
    areas_of_improvement: '',
    behavioral_observations: '',
    academic_concerns: '',
    action_items: [],
    follow_up_required: false,
    follow_up_date: '',
    teacher_recommendations: '',
    parent_feedback: '',
    meeting_duration_minutes: 30,
  });
  const [newActionItem, setNewActionItem] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In production, filter by teacher_id
      const [slotsData, bookingsData] = await Promise.all([
        getPTMSlots(),
        getPTMBookings(),
      ]);
      
      if (slotsData.length > 0) setSlots(slotsData);
      if (bookingsData.length > 0) setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const upcomingBookings = bookings.filter(b => 
    b.status === 'Confirmed' && 
    b.slot?.ptm_date && 
    (isAfter(parseISO(b.slot.ptm_date), today) || isToday(parseISO(b.slot.ptm_date)))
  );
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const todayBookings = bookings.filter(b => 
    b.status === 'Confirmed' && 
    b.slot?.ptm_date && 
    isToday(parseISO(b.slot.ptm_date))
  );

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const openNotesDialog = (booking: PTMBookingWithDetails) => {
    setSelectedBooking(booking);
    setNotesForm({
      booking_id: booking.id,
      discussion_points: '',
      student_strengths: '',
      areas_of_improvement: '',
      behavioral_observations: '',
      academic_concerns: '',
      action_items: [],
      follow_up_required: false,
      follow_up_date: '',
      teacher_recommendations: '',
      parent_feedback: '',
      meeting_duration_minutes: 30,
    });
    setNotesDialogOpen(true);
  };

  const handleNotesInputChange = (field: string, value: any) => {
    setNotesForm(prev => ({ ...prev, [field]: value }));
  };

  const addActionItem = () => {
    if (newActionItem.trim()) {
      setNotesForm(prev => ({
        ...prev,
        action_items: [...(prev.action_items || []), newActionItem.trim()],
      }));
      setNewActionItem('');
    }
  };

  const removeActionItem = (index: number) => {
    setNotesForm(prev => ({
      ...prev,
      action_items: prev.action_items?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitNotes = async () => {
    if (!selectedBooking || !notesForm.discussion_points.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter the discussion points',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await createMeetingNotes(
        notesForm,
        selectedBooking.slot?.teacher_id || '',
        selectedBooking.student_id,
        user?.id || ''
      );
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status: 'Completed' as const }
          : b
      ));
      
      toast({
        title: 'Meeting Notes Saved',
        description: 'The meeting has been marked as completed.',
      });
      
      setNotesDialogOpen(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      // Demo mode
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status: 'Completed' as const }
          : b
      ));
      toast({
        title: 'Meeting Notes Saved (Demo)',
        description: 'In production, notes would be saved to the database.',
      });
      setNotesDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const BookingCard = ({ booking, showNotesButton = false }: { booking: PTMBookingWithDetails; showNotesButton?: boolean }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Student Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {booking.student?.first_name} {booking.student?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.student?.class?.class_name} - {booking.student?.section?.section_name} • {booking.student?.admission_number}
                </p>
              </div>
            </div>

            {/* Parent Info */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Parent: {booking.parent?.first_name} {booking.parent?.last_name}</span>
              <span className="text-muted-foreground">({booking.parent?.phone})</span>
            </div>

            {/* Schedule */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {booking.slot?.ptm_date && format(parseISO(booking.slot.ptm_date), 'EEEE, MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.slot?.start_time && formatTime(booking.slot.start_time)}
                </span>
              </div>
              {booking.slot?.is_online ? (
                <Badge variant="secondary" className="gap-1">
                  <Video className="h-3 w-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.slot?.location || 'In-person'}
                </Badge>
              )}
            </div>

            {/* Purpose */}
            {booking.meeting_purpose && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Purpose</p>
                <p className="text-sm">{booking.meeting_purpose}</p>
                {booking.topics_to_discuss && booking.topics_to_discuss.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {booking.topics_to_discuss.map((topic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2">
            {booking.status === 'Completed' ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Clock className="h-3 w-3 mr-1" />
                Scheduled
              </Badge>
            )}
            
            {showNotesButton && booking.status === 'Confirmed' && (
              <Button size="sm" onClick={() => openNotesDialog(booking)}>
                <FileText className="h-4 w-4 mr-2" />
                Add Notes
              </Button>
            )}
            
            {booking.slot?.is_online && booking.slot?.meeting_link && (
              <Button size="sm" variant="outline" asChild>
                <a href={booking.slot.meeting_link} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meet
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My PTM Schedule</h1>
        <p className="text-muted-foreground">View your scheduled parent-teacher meetings</p>
      </div>

      {/* Today's Highlight */}
      {todayBookings.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Today's Meetings
            </CardTitle>
            <CardDescription>
              You have {todayBookings.length} meeting{todayBookings.length > 1 ? 's' : ''} scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showNotesButton />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="upcoming"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Completed ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger
            value="slots"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            My Slots ({slots.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Upcoming Meetings</h3>
                <p className="text-muted-foreground">You don't have any scheduled PTM meetings coming up</p>
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showNotesButton />
            ))
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No completed meetings yet
              </CardContent>
            </Card>
          ) : (
            completedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        {/* Slots */}
        <TabsContent value="slots" className="mt-6 space-y-4">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-semibold">
                        {format(parseISO(slot.ptm_date), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      <div>
                        {slot.slot_duration_minutes} min slots
                      </div>
                      {slot.class && (
                        <Badge variant="outline">{slot.class.class_name}</Badge>
                      )}
                      {slot.is_online ? (
                        <span className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {slot.location || 'In-person'}
                        </span>
                      )}
                    </div>
                    {slot.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{slot.notes}</p>
                    )}
                  </div>
                  <Badge 
                    variant={slot.status === 'Booked' ? 'default' : slot.status === 'Available' ? 'secondary' : 'outline'}
                  >
                    {slot.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {slots.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No PTM slots assigned to you yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Meeting Notes</DialogTitle>
            <DialogDescription>
              Record the discussion points and feedback from the PTM
              {selectedBooking && (
                <span className="block mt-1">
                  Student: {selectedBooking.student?.first_name} {selectedBooking.student?.last_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Discussion Points */}
            <div className="space-y-2">
              <Label htmlFor="discussion_points">Discussion Points *</Label>
              <Textarea
                id="discussion_points"
                placeholder="What was discussed in the meeting..."
                value={notesForm.discussion_points}
                onChange={(e) => handleNotesInputChange('discussion_points', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Student Strengths */}
              <div className="space-y-2">
                <Label htmlFor="student_strengths">Student Strengths</Label>
                <Textarea
                  id="student_strengths"
                  placeholder="Areas where the student excels..."
                  value={notesForm.student_strengths}
                  onChange={(e) => handleNotesInputChange('student_strengths', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Areas of Improvement */}
              <div className="space-y-2">
                <Label htmlFor="areas_of_improvement">Areas of Improvement</Label>
                <Textarea
                  id="areas_of_improvement"
                  placeholder="Areas that need work..."
                  value={notesForm.areas_of_improvement}
                  onChange={(e) => handleNotesInputChange('areas_of_improvement', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Behavioral Observations */}
            <div className="space-y-2">
              <Label htmlFor="behavioral_observations">Behavioral Observations</Label>
              <Textarea
                id="behavioral_observations"
                placeholder="Notes on student's behavior in class..."
                value={notesForm.behavioral_observations}
                onChange={(e) => handleNotesInputChange('behavioral_observations', e.target.value)}
                rows={2}
              />
            </div>

            {/* Academic Concerns */}
            <div className="space-y-2">
              <Label htmlFor="academic_concerns">Academic Concerns</Label>
              <Textarea
                id="academic_concerns"
                placeholder="Any academic issues to address..."
                value={notesForm.academic_concerns}
                onChange={(e) => handleNotesInputChange('academic_concerns', e.target.value)}
                rows={2}
              />
            </div>

            {/* Action Items */}
            <div className="space-y-2">
              <Label>Action Items</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an action item..."
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
                />
                <Button type="button" variant="outline" onClick={addActionItem}>
                  Add
                </Button>
              </div>
              {notesForm.action_items && notesForm.action_items.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {notesForm.action_items.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActionItem(idx)}
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <Label htmlFor="teacher_recommendations">Teacher Recommendations</Label>
              <Textarea
                id="teacher_recommendations"
                placeholder="Your recommendations for the student..."
                value={notesForm.teacher_recommendations}
                onChange={(e) => handleNotesInputChange('teacher_recommendations', e.target.value)}
                rows={2}
              />
            </div>

            {/* Parent Feedback */}
            <div className="space-y-2">
              <Label htmlFor="parent_feedback">Parent Feedback</Label>
              <Textarea
                id="parent_feedback"
                placeholder="Feedback received from parent..."
                value={notesForm.parent_feedback}
                onChange={(e) => handleNotesInputChange('parent_feedback', e.target.value)}
                rows={2}
              />
            </div>

            {/* Follow-up */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="follow_up_required"
                  checked={notesForm.follow_up_required}
                  onCheckedChange={(checked) => handleNotesInputChange('follow_up_required', checked)}
                />
                <Label htmlFor="follow_up_required">Follow-up Required</Label>
              </div>
              {notesForm.follow_up_required && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="follow_up_date">Date:</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={notesForm.follow_up_date}
                    onChange={(e) => handleNotesInputChange('follow_up_date', e.target.value)}
                    className="w-auto"
                  />
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <Label htmlFor="meeting_duration">Meeting Duration:</Label>
              <Input
                id="meeting_duration"
                type="number"
                value={notesForm.meeting_duration_minutes}
                onChange={(e) => handleNotesInputChange('meeting_duration_minutes', parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitNotes} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Save & Complete Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherPTMSchedule;
