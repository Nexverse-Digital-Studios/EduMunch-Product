/**
 * PTM Dashboard - Main PTM Management Page (Admin/Staff)
 * ========================================================
 * Shows overview, scheduled PTMs, and pending requests
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModulePermissions } from '@/contexts/PermissionContext';
import { useAuth } from '@/contexts/AuthContext';
import { PTMSlotWithDetails, PTMBookingWithDetails, PTMStats } from '@/types/ptm';
import { getPTMSlots, getPTMBookings, getPTMStats, getClassesList } from '@/services/ptm';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';

// Demo data for when Supabase is not configured
const demoStats: PTMStats = {
  total_slots: 48,
  available_slots: 12,
  booked_slots: 28,
  completed_meetings: 8,
  pending_requests: 5,
  no_shows: 2,
  upcoming_meetings: 20,
};

const demoSlots: PTMSlotWithDetails[] = [
  {
    id: '1',
    teacher_id: 't1',
    ptm_date: '2026-01-15',
    start_time: '09:00:00',
    end_time: '13:00:00',
    slot_duration_minutes: 15,
    max_bookings: 1,
    location: 'Room 101',
    is_online: false,
    meeting_link: null,
    status: 'Available',
    notes: 'Class 10 PTM - January',
    is_bulk_scheduled: true,
    class_id: 'c1',
    batch_id: 'b1',
    created_at: '2026-01-07',
    updated_at: '2026-01-07',
    teacher: { id: 't1', first_name: 'Rajesh', last_name: 'Kumar', employee_code: 'TCH001', user_id: 'u1' },
    class: { id: 'c1', class_name: 'Class 10', class_code: 'X' },
  },
  {
    id: '2',
    teacher_id: 't2',
    ptm_date: '2026-01-15',
    start_time: '09:00:00',
    end_time: '13:00:00',
    slot_duration_minutes: 15,
    max_bookings: 1,
    location: 'Room 102',
    is_online: false,
    meeting_link: null,
    status: 'Booked',
    notes: 'Class 10 PTM - January',
    is_bulk_scheduled: true,
    class_id: 'c1',
    batch_id: 'b1',
    created_at: '2026-01-07',
    updated_at: '2026-01-07',
    teacher: { id: 't2', first_name: 'Priya', last_name: 'Sharma', employee_code: 'TCH002', user_id: 'u2' },
    class: { id: 'c1', class_name: 'Class 10', class_code: 'X' },
  },
  {
    id: '3',
    teacher_id: 't3',
    ptm_date: '2026-01-20',
    start_time: '10:00:00',
    end_time: '14:00:00',
    slot_duration_minutes: 20,
    max_bookings: 1,
    location: null,
    is_online: true,
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    status: 'Requested',
    notes: 'Parent Request: Discuss academic performance',
    is_bulk_scheduled: false,
    class_id: null,
    batch_id: null,
    created_at: '2026-01-06',
    updated_at: '2026-01-06',
    teacher: { id: 't3', first_name: 'Amit', last_name: 'Patel', employee_code: 'TCH003', user_id: 'u3' },
  },
];

const demoBookings: PTMBookingWithDetails[] = [
  {
    id: 'b1',
    slot_id: '2',
    student_id: 's1',
    parent_user_id: 'p1',
    booking_date: '2026-01-08',
    meeting_purpose: 'Discuss mid-term results',
    topics_to_discuss: ['Academic performance', 'Attendance'],
    status: 'Confirmed',
    cancellation_reason: null,
    cancelled_at: null,
    reminder_sent: false,
    reminder_sent_at: null,
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2026-01-08',
    updated_at: '2026-01-08',
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
    slot_id: '3',
    student_id: 's2',
    parent_user_id: 'p2',
    booking_date: '2026-01-06',
    meeting_purpose: 'Discuss behavioral concerns',
    topics_to_discuss: ['Behavior in class', 'Homework completion'],
    status: 'Pending',
    cancellation_reason: null,
    cancelled_at: null,
    reminder_sent: false,
    reminder_sent_at: null,
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2026-01-06',
    updated_at: '2026-01-06',
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

const PTMDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { canCreate, canUpdate } = useModulePermissions('ptm');
  const { userProfile } = useAuth();

  const [stats, setStats] = useState<PTMStats>(demoStats);
  const [slots, setSlots] = useState<PTMSlotWithDetails[]>(demoSlots);
  const [bookings, setBookings] = useState<PTMBookingWithDetails[]>(demoBookings);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, slotsData, bookingsData, classesData] = await Promise.all([
        getPTMStats(),
        getPTMSlots(),
        getPTMBookings(),
        getClassesList(),
      ]);
      
      if (statsData.total_slots > 0) setStats(statsData);
      if (slotsData.length > 0) setSlots(slotsData);
      if (bookingsData.length > 0) setBookings(bookingsData);
      if (classesData.length > 0) setClasses(classesData);
    } catch (error) {
      console.error('Error loading PTM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const pendingRequests = bookings.filter(b => b.status === 'Pending');
  const upcomingMeetings = bookings.filter(b => 
    b.status === 'Confirmed' && 
    b.slot?.ptm_date && 
    (isAfter(parseISO(b.slot.ptm_date), new Date()) || isToday(parseISO(b.slot.ptm_date)))
  );

  const filteredSlots = slots.filter(slot => {
    const matchesSearch = 
      slot.teacher?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.teacher?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.class?.class_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterClass === 'all' || slot.class_id === filterClass;
    const matchesStatus = filterStatus === 'all' || slot.status === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      'Available': { variant: 'secondary', label: 'Available' },
      'Booked': { variant: 'default', label: 'Booked' },
      'Completed': { variant: 'outline', label: 'Completed' },
      'Cancelled': { variant: 'destructive', label: 'Cancelled' },
      'Requested': { variant: 'secondary', label: 'Pending Approval' },
      'Pending': { variant: 'secondary', label: 'Pending' },
      'Confirmed': { variant: 'default', label: 'Confirmed' },
      'Rejected': { variant: 'destructive', label: 'Rejected' },
      'No Show': { variant: 'destructive', label: 'No Show' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parent Teacher Meetings</h1>
          <p className="text-muted-foreground">Manage PTM schedules, requests, and bookings</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/ptm/schedule')} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Schedule PTM
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_slots}</p>
                <p className="text-xs text-muted-foreground">Total Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.available_slots}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.booked_slots}</p>
                <p className="text-xs text-muted-foreground">Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming_meetings}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending_requests}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed_meetings}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.no_shows}</p>
                <p className="text-xs text-muted-foreground">No Shows</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Pending Requests Alert */}
      {pendingRequests.length > 0 && canUpdate && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    {pendingRequests.length} Pending PTM Request{pendingRequests.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Parents have requested meetings that need your approval
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                onClick={() => navigate('/ptm/requests')}
              >
                Review Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="slots"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            All Slots ({slots.length})
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Bookings ({bookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                <CardDescription>Next scheduled PTM sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMeetings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {booking.student?.first_name} {booking.student?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Parent: {booking.parent?.first_name} {booking.parent?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Teacher: {booking.slot?.teacher?.first_name} {booking.slot?.teacher?.last_name}
                      </p>
                      <p className="text-xs text-primary mt-1">
                        {booking.slot?.ptm_date && format(parseISO(booking.slot.ptm_date), 'MMM dd, yyyy')} at{' '}
                        {booking.slot?.start_time && formatTime(booking.slot.start_time)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
                {upcomingMeetings.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No upcoming meetings</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent PTM Slots</CardTitle>
                <CardDescription>Recently scheduled PTM slots</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {slots.slice(0, 5).map((slot) => (
                  <div key={slot.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {slot.teacher?.first_name} {slot.teacher?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {slot.class?.class_name || 'Individual Request'}
                      </p>
                      <p className="text-xs text-primary mt-1">
                        {format(parseISO(slot.ptm_date), 'MMM dd, yyyy')} • {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.is_online ? '🌐 Online' : `📍 ${slot.location || 'TBD'}`}
                      </p>
                    </div>
                    {getStatusBadge(slot.status)}
                  </div>
                ))}
                {slots.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No PTM slots scheduled</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Slots Tab */}
        <TabsContent value="slots" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by teacher name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Requested">Pending Approval</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Slots List */}
          <div className="space-y-3">
            {filteredSlots.map((slot) => (
              <Card key={slot.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {slot.teacher?.first_name} {slot.teacher?.last_name}
                          <span className="text-muted-foreground font-normal ml-2">
                            ({slot.teacher?.employee_code})
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {slot.class?.class_name || 'Individual Request'} • {slot.slot_duration_minutes} min slots
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {format(parseISO(slot.ptm_date), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {slot.is_online ? '🌐 Online Meeting' : `📍 ${slot.location || 'Location TBD'}`}
                          {slot.is_bulk_scheduled && ' • Bulk Scheduled'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(slot.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredSlots.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No PTM slots found matching your filters
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-6 space-y-4">
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {booking.student?.first_name} {booking.student?.last_name}
                          <span className="text-muted-foreground font-normal ml-2">
                            ({booking.student?.admission_number})
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.student?.class?.class_name} - {booking.student?.section?.section_name}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">Parent:</span>{' '}
                          {booking.parent?.first_name} {booking.parent?.last_name}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Teacher:</span>{' '}
                          {booking.slot?.teacher?.first_name} {booking.slot?.teacher?.last_name}
                        </p>
                        {booking.meeting_purpose && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            <span className="font-medium">Purpose:</span> {booking.meeting_purpose}
                          </p>
                        )}
                        {booking.slot && (
                          <p className="text-xs text-primary mt-2">
                            {format(parseISO(booking.slot.ptm_date), 'MMM dd, yyyy')} at{' '}
                            {formatTime(booking.slot.start_time)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(booking.status)}
                      <p className="text-xs text-muted-foreground">
                        Booked: {format(parseISO(booking.booking_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {bookings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No bookings found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PTMDashboard;
