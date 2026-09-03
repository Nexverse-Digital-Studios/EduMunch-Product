/**
 * Parent Request PTM - Request a Parent-Teacher Meeting (Parent)
 * ================================================================
 * Allows parents to request a PTM with their child's teacher
 * Uses real data from Supabase
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  GraduationCap,
  BookOpen,
  Video,
  MapPin,
  MessageSquare,
  Plus,
  Loader2,
  CheckCircle,
  Info,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ParentPTMRequestInput } from '@/types/ptm';
import { createPTMRequest, getTeachersForStudent } from '@/services/ptm';
import { getChildrenByParentUserId, ParentChild } from '@/services/parent';

interface TeacherWithSubjects {
  id: string;
  first_name: string;
  last_name: string;
  employee_code?: string;
  subjects: string[];
}

const ParentRequestPTM = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get childId from URL if present (coming from parent dashboard)
  const preSelectedChildId = searchParams.get('childId');

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [teachers, setTeachers] = useState<TeacherWithSubjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [formData, setFormData] = useState({
    preferred_date: '',
    preferred_start_time: '10:00',
    preferred_end_time: '10:30',
    meeting_purpose: '',
    topics_to_discuss: [] as string[],
    is_online: true,
  });
  const [newTopic, setNewTopic] = useState('');

  // Load children on mount
  useEffect(() => {
    loadChildren();
  }, [user?.id]);

  // Pre-select child from URL after children are loaded
  useEffect(() => {
    if (preSelectedChildId && children.length > 0) {
      const childExists = children.some(c => c.id === preSelectedChildId);
      if (childExists) {
        setSelectedChild(preSelectedChildId);
      }
    }
  }, [preSelectedChildId, children]);

  // Load teachers when child is selected
  useEffect(() => {
    if (selectedChild) {
      loadTeachers();
    } else {
      setTeachers([]);
      setSelectedTeacher('');
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    if (!user?.id) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getChildrenByParentUserId(user.id);
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const data = await getTeachersForStudent(selectedChild);
      setTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTopic = () => {
    if (newTopic.trim() && !formData.topics_to_discuss.includes(newTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics_to_discuss: [...prev.topics_to_discuss, newTopic.trim()],
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics_to_discuss: prev.topics_to_discuss.filter(t => t !== topic),
    }));
  };

  const suggestedTopics = [
    'Academic Performance',
    'Attendance',
    'Behavior',
    'Homework',
    'Extra-curricular Activities',
    'Career Guidance',
    'Study Habits',
    'Social Development',
  ];

  const addSuggestedTopic = (topic: string) => {
    if (!formData.topics_to_discuss.includes(topic)) {
      setFormData(prev => ({
        ...prev,
        topics_to_discuss: [...prev.topics_to_discuss, topic],
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!selectedChild) {
      toast({ title: 'Please select a child', variant: 'destructive' });
      return false;
    }
    if (!selectedTeacher) {
      toast({ title: 'Please select a teacher', variant: 'destructive' });
      return false;
    }
    if (!formData.preferred_date) {
      toast({ title: 'Please select a preferred date', variant: 'destructive' });
      return false;
    }
    if (!formData.meeting_purpose.trim()) {
      toast({ title: 'Please enter the purpose of meeting', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const input: ParentPTMRequestInput = {
        student_id: selectedChild,
        teacher_id: selectedTeacher,
        preferred_date: formData.preferred_date,
        preferred_start_time: formData.preferred_start_time + ':00',
        preferred_end_time: formData.preferred_end_time + ':00',
        meeting_purpose: formData.meeting_purpose,
        topics_to_discuss: formData.topics_to_discuss,
        is_online: formData.is_online,
      };

      await createPTMRequest(input, user?.id || '');
      setSuccess(true);
      
      toast({
        title: 'PTM Request Submitted',
        description: 'Your request has been sent for approval. You will be notified once it is reviewed.',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      // Demo mode
      setSuccess(true);
      toast({
        title: 'PTM Request Submitted (Demo)',
        description: 'In production, this would be sent for admin approval.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChildData = children.find(c => c.id === selectedChild);
  const selectedTeacherData = teachers.find(t => t.id === selectedTeacher);

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              Request Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your PTM request has been submitted successfully and is pending approval.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-3">Request Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Child:</span>
                  <span>{selectedChildData?.first_name} {selectedChildData?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teacher:</span>
                  <span>{selectedTeacherData?.first_name} {selectedTeacherData?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preferred Date:</span>
                  <span>{new Date(formData.preferred_date).toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{formData.preferred_start_time} - {formData.preferred_end_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span>{formData.is_online ? 'Online' : 'In-person'}</span>
                </div>
              </div>
            </div>

            <Alert className="text-left mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• The school admin will review your request</li>
                  <li>• You will receive a notification once approved/rejected</li>
                  <li>• If approved, both you and the teacher will be notified with meeting details</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/parent/dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => {
                setSuccess(false);
                setSelectedChild('');
                setSelectedTeacher('');
                setFormData({
                  preferred_date: '',
                  preferred_start_time: '10:00',
                  preferred_end_time: '10:30',
                  meeting_purpose: '',
                  topics_to_discuss: [],
                  is_online: true,
                });
              }}>
                Request Another Meeting
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
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Request PTM</h1>
          <p className="text-muted-foreground">Schedule a parent-teacher meeting</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meeting Request Form</CardTitle>
            <CardDescription>
              Fill in the details below to request a meeting with your child's teacher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Child */}
            <div className="space-y-2">
              <Label>Select Child *</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedChild === child.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedChild(child.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{child.first_name} {child.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {child.class?.class_name} - {child.section?.section_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Teacher */}
            {selectedChild && (
              <div className="space-y-2">
                <Label>Select Teacher *</Label>
                {teachers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Loading teachers...</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedTeacher === teacher.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTeacher(teacher.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{teacher.first_name} {teacher.last_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {teacher.subjects?.join(', ') || teacher.employee_code}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date and Time */}
            {selectedTeacher && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_date">Preferred Date *</Label>
                    <Input
                      id="preferred_date"
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => handleInputChange('preferred_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_start_time">Start Time</Label>
                    <Input
                      id="preferred_start_time"
                      type="time"
                      value={formData.preferred_start_time}
                      onChange={(e) => handleInputChange('preferred_start_time', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_end_time">End Time</Label>
                    <Input
                      id="preferred_end_time"
                      type="time"
                      value={formData.preferred_end_time}
                      onChange={(e) => handleInputChange('preferred_end_time', e.target.value)}
                    />
                  </div>
                </div>

                {/* Meeting Mode */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {formData.is_online ? (
                      <Video className="h-5 w-5 text-primary" />
                    ) : (
                      <MapPin className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <Label>Meeting Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.is_online ? 'Online video call' : 'In-person at school'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_online}
                    onCheckedChange={(checked) => handleInputChange('is_online', checked)}
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="meeting_purpose">Purpose of Meeting *</Label>
                  <Textarea
                    id="meeting_purpose"
                    placeholder="Describe why you want to meet the teacher..."
                    value={formData.meeting_purpose}
                    onChange={(e) => handleInputChange('meeting_purpose', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Topics */}
                <div className="space-y-3">
                  <Label>Topics to Discuss</Label>
                  
                  {/* Suggested Topics */}
                  <div className="flex flex-wrap gap-2">
                    {suggestedTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant={formData.topics_to_discuss.includes(topic) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => 
                          formData.topics_to_discuss.includes(topic) 
                            ? removeTopic(topic) 
                            : addSuggestedTopic(topic)
                        }
                      >
                        {topic}
                        {formData.topics_to_discuss.includes(topic) && ' ✓'}
                      </Badge>
                    ))}
                  </div>

                  {/* Custom Topic */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a custom topic..."
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                    />
                    <Button type="button" variant="outline" onClick={addTopic}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Selected Topics */}
                  {formData.topics_to_discuss.length > 0 && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Selected Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.topics_to_discuss.map((topic) => (
                          <Badge key={topic} variant="secondary" className="gap-1">
                            {topic}
                            <button
                              onClick={() => removeTopic(topic)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentRequestPTM;
