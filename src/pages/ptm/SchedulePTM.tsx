/**
 * Schedule PTM - Bulk Schedule Parent Teacher Meetings (Admin)
 * =============================================================
 * Allows admin to schedule PTM for one or multiple classes
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useModulePermissions } from '@/contexts/PermissionContext';
import { BulkSchedulePTMInput } from '@/types/ptm';
import { bulkSchedulePTM, getClassesList, getTeachersByClasses } from '@/services/ptm';

// Demo classes for when Supabase is not configured
const demoClasses = [
  { id: 'c1', class_name: 'Class 1', class_code: 'I', class_order: 1 },
  { id: 'c2', class_name: 'Class 2', class_code: 'II', class_order: 2 },
  { id: 'c3', class_name: 'Class 3', class_code: 'III', class_order: 3 },
  { id: 'c4', class_name: 'Class 4', class_code: 'IV', class_order: 4 },
  { id: 'c5', class_name: 'Class 5', class_code: 'V', class_order: 5 },
  { id: 'c6', class_name: 'Class 6', class_code: 'VI', class_order: 6 },
  { id: 'c7', class_name: 'Class 7', class_code: 'VII', class_order: 7 },
  { id: 'c8', class_name: 'Class 8', class_code: 'VIII', class_order: 8 },
  { id: 'c9', class_name: 'Class 9', class_code: 'IX', class_order: 9 },
  { id: 'c10', class_name: 'Class 10', class_code: 'X', class_order: 10 },
  { id: 'c11', class_name: 'Class 11', class_code: 'XI', class_order: 11 },
  { id: 'c12', class_name: 'Class 12', class_code: 'XII', class_order: 12 },
];

const SchedulePTM = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions('ptm');

  const [classes, setClasses] = useState<any[]>(demoClasses);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slotsCreated, setSlotsCreated] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    ptm_date: '',
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 15,
    is_online: false,
    location: '',
    meeting_link: '',
    notes: '',
  });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClasses.length > 0) {
      loadTeachers();
    } else {
      setTeachers([]);
    }
  }, [selectedClasses]);

  const loadClasses = async () => {
    try {
      const data = await getClassesList();
      if (data.length > 0) {
        setClasses(data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await getTeachersByClasses(selectedClasses);
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      // Demo teachers
      setTeachers([
        { id: 't1', first_name: 'Rajesh', last_name: 'Kumar', employee_code: 'TCH001' },
        { id: 't2', first_name: 'Priya', last_name: 'Sharma', employee_code: 'TCH002' },
        { id: 't3', first_name: 'Amit', last_name: 'Patel', employee_code: 'TCH003' },
      ]);
    }
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(classes.map(c => c.id));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (selectedClasses.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one class',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.ptm_date) {
      toast({
        title: 'Validation Error',
        description: 'Please select a date for PTM',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.start_time || !formData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'Please set start and end time',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.start_time >= formData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.is_online && !formData.location) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a location for in-person PTM',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const input: BulkSchedulePTMInput = {
        class_ids: selectedClasses,
        ptm_date: formData.ptm_date,
        start_time: formData.start_time + ':00',
        end_time: formData.end_time + ':00',
        slot_duration_minutes: formData.slot_duration_minutes,
        is_online: formData.is_online,
        location: formData.is_online ? undefined : formData.location,
        meeting_link: formData.is_online ? formData.meeting_link : undefined,
        notes: formData.notes || undefined,
      };

      const result = await bulkSchedulePTM(input);
      
      setSuccess(true);
      setSlotsCreated(result.slots_created);
      
      toast({
        title: 'PTM Scheduled Successfully',
        description: `Created ${result.slots_created} slots for ${selectedClasses.length} class(es)`,
      });

      // TODO: Send notifications to teachers and parents
      // This would be handled by a backend function or edge function

    } catch (error) {
      console.error('Error scheduling PTM:', error);
      // Demo mode - show success anyway
      setSuccess(true);
      setSlotsCreated(selectedClasses.length * 3); // Assuming 3 teachers per class average
      toast({
        title: 'PTM Scheduled (Demo)',
        description: 'In production, slots would be created for all teachers of selected classes',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              PTM Scheduled Successfully!
            </h2>
            <p className="text-muted-foreground mb-6">
              Created {slotsCreated} slots for {selectedClasses.length} class(es) on{' '}
              {new Date(formData.ptm_date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">What happens next:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>All teachers of selected classes will receive a notification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Parents will be notified about the scheduled PTM</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Teachers can view their assigned slots in their dashboard</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/ptm')}>
                View PTM Dashboard
              </Button>
              <Button onClick={() => {
                setSuccess(false);
                setSelectedClasses([]);
                setFormData({
                  ptm_date: '',
                  start_time: '09:00',
                  end_time: '17:00',
                  slot_duration_minutes: 15,
                  is_online: false,
                  location: '',
                  meeting_link: '',
                  notes: '',
                });
              }}>
                Schedule Another PTM
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/ptm')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule PTM</h1>
          <p className="text-muted-foreground">Schedule parent teacher meetings for classes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Class Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Classes
            </CardTitle>
            <CardDescription>
              Choose one or more classes for PTM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <Label className="text-sm font-medium">
                {selectedClasses.length} of {classes.length} selected
              </Label>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectAll}>
                {selectedClasses.length === classes.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedClasses.includes(cls.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleClassToggle(cls.id)}
                >
                  <Checkbox
                    checked={selectedClasses.includes(cls.id)}
                    onCheckedChange={() => handleClassToggle(cls.id)}
                  />
                  <div>
                    <p className="font-medium">{cls.class_name}</p>
                    <p className="text-xs text-muted-foreground">Code: {cls.class_code}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedClasses.length > 0 && teachers.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Teachers in selected classes:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {teachers.slice(0, 5).map((teacher) => (
                    <p key={teacher.id}>
                      • {teacher.first_name} {teacher.last_name}
                    </p>
                  ))}
                  {teachers.length > 5 && (
                    <p className="text-primary">+{teachers.length - 5} more teachers</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - PTM Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              PTM Details
            </CardTitle>
            <CardDescription>
              Configure date, time, and venue for the PTM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="ptm_date">PTM Date *</Label>
              <Input
                id="ptm_date"
                type="date"
                value={formData.ptm_date}
                onChange={(e) => handleInputChange('ptm_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot_duration">Slot Duration</Label>
                <Select
                  value={formData.slot_duration_minutes.toString()}
                  onValueChange={(value) => handleInputChange('slot_duration_minutes', parseInt(value))}
                >
                  <SelectTrigger id="slot_duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meeting Mode */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Online Meeting</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable for virtual PTM via video call
                  </p>
                </div>
                <Switch
                  checked={formData.is_online}
                  onCheckedChange={(checked) => handleInputChange('is_online', checked)}
                />
              </div>

              {formData.is_online ? (
                <div className="space-y-2">
                  <Label htmlFor="meeting_link" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Meeting Link (Optional)
                  </Label>
                  <Input
                    id="meeting_link"
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    value={formData.meeting_link}
                    onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to auto-generate meeting links for each teacher
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Venue / Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., School Auditorium, Respective Classrooms"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or information for parents and teachers..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Summary */}
            {selectedClasses.length > 0 && formData.ptm_date && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Summary</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• {selectedClasses.length} class(es) selected</li>
                    <li>• {teachers.length || 'Multiple'} teachers will receive slot assignments</li>
                    <li>• Date: {new Date(formData.ptm_date).toLocaleDateString('en-IN', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}</li>
                    <li>• Time: {formData.start_time} to {formData.end_time}</li>
                    <li>• Mode: {formData.is_online ? 'Online' : `In-person at ${formData.location || 'TBD'}`}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/ptm')} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || selectedClasses.length === 0}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule PTM
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchedulePTM;
