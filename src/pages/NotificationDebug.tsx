import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Send, Shuffle } from 'lucide-react';

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1emaet';

interface NotificationPayload {
  school_token: string;
  title: string;
  body: string;
  user_ids: string[];
  image_url?: string;
  action_url?: string;
  priority?: string;
}

interface UserFCMData {
  user_id: string;
  email: string;
  name: string;
  fcm_token: string | null;
  platform: string | null;
  device_name: string | null;
  last_used_at: string | null;
  has_fcm: boolean;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  sent_count?: number;
  failed_count?: number;
  errors?: Record<string, string>;
}

export default function NotificationDebug() {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userIds, setUserIds] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [priority, setPriority] = useState('high');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NotificationResponse | null>(null);
  const [fcmData, setFcmData] = useState<UserFCMData[]>([]);
  const [currentUserFCM, setCurrentUserFCM] = useState<UserFCMData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Random sample data for testing
  const sampleData = [
    {
      title: 'Assignment Submitted',
      body: 'Your assignment has been submitted successfully. Please review the feedback from your teacher.',
      imageUrl: 'https://via.placeholder.com/200?text=Assignment',
      actionUrl: '/assignments',
    },
    {
      title: 'Exam Schedule Released',
      body: 'The exam schedule for Q3 has been released. Check your dashboard for details.',
      imageUrl: 'https://via.placeholder.com/200?text=Exam',
      actionUrl: '/exams',
    },
    {
      title: 'Fee Payment Reminder',
      body: 'Your fee payment is due on 15th January 2026. Please complete the payment to avoid late fees.',
      imageUrl: 'https://via.placeholder.com/200?text=Fee',
      actionUrl: '/fees',
    },
    {
      title: 'Class Meeting Scheduled',
      body: 'Parent-Teacher Meeting scheduled for 20th January 2026 at 3:00 PM. Book your slot now.',
      imageUrl: 'https://via.placeholder.com/200?text=Meeting',
      actionUrl: '/ptm',
    },
    {
      title: 'Certificate Available',
      body: 'Your bonafide certificate is ready for download from the portal.',
      imageUrl: 'https://via.placeholder.com/200?text=Certificate',
      actionUrl: '/certificates',
    },
  ];

  // Fetch current user's FCM token on mount
  useEffect(() => {
    if (userProfile?.id) {
      fetchCurrentUserFCM();
    }
  }, [userProfile?.id]);

  const fetchCurrentUserFCM = async () => {
    if (!userProfile?.id) return;
    
    try {
      const { data, error: err } = await supabase
        .from(`fcm_tokens_${INDEX_TOKEN}`)
        .select('*')
        .eq('user_id', userProfile.id)
        .order('last_used_at', { ascending: false })
        .limit(1)
        .single();

      if (err && err.code !== 'PGRST116') {
        console.error('Error fetching FCM:', err);
        return;
      }

      if (data) {
        setCurrentUserFCM({
          user_id: data.user_id,
          email: userProfile.email || 'N/A',
          name: userProfile.full_name || 'Current User',
          fcm_token: data.fcm_token,
          platform: data.platform,
          device_name: data.device_name,
          last_used_at: data.last_used_at,
          has_fcm: !!data.fcm_token,
        });
      } else {
        setCurrentUserFCM({
          user_id: userProfile.id,
          email: userProfile.email || 'N/A',
          name: userProfile.full_name || 'Current User',
          fcm_token: null,
          platform: null,
          device_name: null,
          last_used_at: null,
          has_fcm: false,
        });
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fillRandomData = () => {
    const sample = sampleData[Math.floor(Math.random() * sampleData.length)];
    setTitle(sample.title);
    setBody(sample.body);
    setImageUrl(sample.imageUrl);
    setActionUrl(sample.actionUrl);
    setPriority(['high', 'normal', 'low'][Math.floor(Math.random() * 3)]);
    setSuccess('Form filled with sample data!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const fetchUsersFCMData = async (userIdList: string[]) => {
    if (userIdList.length === 0) {
      setError('Please enter at least one user ID');
      return [];
    }

    try {
      const { data, error: err } = await supabase
        .from(`fcm_tokens_${INDEX_TOKEN}`)
        .select('id, user_id, fcm_token, platform, device_name, last_used_at')
        .in('user_id', userIdList);

      if (err) {
        console.error('Error fetching users FCM:', err);
        setError(`Error fetching user data: ${err.message}`);
        return [];
      }

      // Get user details from users table
      const { data: userData, error: userErr } = await supabase
        .from(`users_${INDEX_TOKEN}`)
        .select('id, email, full_name')
        .in('id', userIdList);

      if (userErr) {
        console.error('Error fetching users:', userErr);
      }

      const enrichedData: UserFCMData[] = userIdList.map((userId) => {
        const fcmRecord = data?.find((d) => d.user_id === userId);
        const userRecord = userData?.find((u) => u.id === userId);

        return {
          user_id: userId,
          email: userRecord?.email || 'Unknown',
          name: userRecord?.full_name || 'Unknown User',
          fcm_token: fcmRecord?.fcm_token || null,
          platform: fcmRecord?.platform || null,
          device_name: fcmRecord?.device_name || null,
          last_used_at: fcmRecord?.last_used_at || null,
          has_fcm: !!fcmRecord?.fcm_token,
        };
      });

      setFcmData(enrichedData);
      return enrichedData;
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch user data');
      return [];
    }
  };

  const sendNotification = async () => {
    setError('');
    setSuccess('');
    setResponse(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!body.trim()) {
      setError('Message body is required');
      return;
    }
    if (!userIds.trim()) {
      setError('At least one user ID is required');
      return;
    }

    const userIdList = userIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (userIdList.length === 0) {
      setError('Invalid user IDs format');
      return;
    }

    // Fetch FCM data for all users
    const usersData = await fetchUsersFCMData(userIdList);

    // Check if any user has FCM token
    const usersWithFCM = usersData.filter((u) => u.has_fcm);
    if (usersWithFCM.length === 0) {
      setError(
        'None of the selected users have FCM tokens registered. They need to log in and initialize push notifications first.'
      );
      return;
    }

    setLoading(true);

    try {
      // Get school_token from user's index_token
      const school_token = userProfile?.index_token;
      
      if (!school_token) {
        setError('Unable to determine school token. Please try logging in again.');
        return;
      }

      // Call the edge function
      const payload: NotificationPayload = {
        school_token,
        title: title.trim(),
        body: body.trim(),
        user_ids: userIdList,
        priority,
      };

      if (imageUrl.trim()) {
        payload.image_url = imageUrl.trim();
      }
      if (actionUrl.trim()) {
        payload.action_url = actionUrl.trim();
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        'send-notification',
        {
          body: payload,
        }
      );

      if (fnError) {
        setError(`Function error: ${fnError.message}`);
        setResponse({
          success: false,
          message: fnError.message,
        });
        return;
      }

      const result: NotificationResponse = data;
      setResponse(result);

      if (result.success) {
        setSuccess(
          `Notification sent successfully! Sent: ${result.sent_count}, Failed: ${result.failed_count}`
        );
        // Clear form
        setTitle('');
        setBody('');
        setUserIds('');
        setImageUrl('');
        setActionUrl('');
        setPriority('high');
        setFcmData([]);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to send notification: ${errMsg}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Notification Debug Center</h1>
          <p className="text-slate-400 mt-2">Test and debug push notifications for your users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Send Test Notification</CardTitle>
                <CardDescription className="text-slate-400">Fill in the notification details and select users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Messages */}
                {error && (
                  <Alert className="bg-red-950 border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-950 border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-200">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Notification Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Assignment Submitted"
                    className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Message Body *
                  </label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="e.g., Your assignment has been submitted successfully"
                    rows={4}
                    className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* User IDs Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    User IDs (comma-separated) *
                  </label>
                  <Textarea
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                    placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000, 550e8400-e29b-41d4-a716-446655440001"
                    rows={3}
                    className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Paste UUIDs separated by commas. The notification will only be sent to users who have
                    registered FCM tokens.
                  </p>
                </div>

                {/* Image URL Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Image URL (optional)
                  </label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Action URL Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Action URL (optional)
                  </label>
                  <Input
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="/assignments or /dashboard"
                    className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Priority Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={fillRandomData}
                    variant="outline"
                    className="flex items-center gap-2 border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    <Shuffle className="h-4 w-4" />
                    Fill Random Data
                  </Button>
                  <Button
                    onClick={sendNotification}
                    disabled={loading}
                    className="flex items-center gap-2 flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                </div>

                {/* Response */}
                {response && (
                  <Alert
                    className={
                      response.success
                        ? 'bg-blue-950 border-blue-800'
                        : 'bg-orange-950 border-orange-800'
                    }
                  >
                    <AlertCircle
                      className={`h-4 w-4 ${
                        response.success ? 'text-blue-400' : 'text-orange-400'
                      }`}
                    />
                    <AlertDescription
                      className={response.success ? 'text-blue-200' : 'text-orange-200'}
                    >
                      <div className="font-semibold">{response.message}</div>
                      {response.sent_count !== undefined && (
                        <div className="mt-1 text-sm">
                          Sent: {response.sent_count} | Failed: {response.failed_count}
                        </div>
                      )}
                      {response.errors && Object.keys(response.errors).length > 0 && (
                        <div className="mt-2 text-sm">
                          <strong>Errors:</strong>
                          {Object.entries(response.errors).map(([userId, error]) => (
                            <div key={userId} className="ml-2">
                              {userId}: {error}
                            </div>
                          ))}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - FCM Status */}
          <div className="space-y-6">
            {/* Current User FCM Status */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Your FCM Status</CardTitle>
                <CardDescription className="text-slate-400">Current device registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUserFCM ? (
                  <>
                    <div>
                      <div className="text-sm text-slate-400">Name</div>
                      <div className="font-medium text-white">{currentUserFCM.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="font-medium text-slate-200 text-sm break-all">
                        {currentUserFCM.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">FCM Token Status</div>
                      <div className="flex items-center gap-2 mt-1">
                        {currentUserFCM.has_fcm ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="font-medium text-green-400">Registered</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-orange-400" />
                            <span className="font-medium text-orange-400">Not Registered</span>
                          </>
                        )}
                      </div>
                    </div>
                    {currentUserFCM.has_fcm && (
                      <>
                        <div>
                          <div className="text-sm text-slate-400">Platform</div>
                          <div className="font-medium text-white capitalize">
                            {currentUserFCM.platform}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Device</div>
                          <div className="font-medium text-slate-200 text-sm">
                            {currentUserFCM.device_name || 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Last Used</div>
                          <div className="font-medium text-slate-200 text-sm">
                            {currentUserFCM.last_used_at
                              ? new Date(currentUserFCM.last_used_at).toLocaleString()
                              : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Token (truncated)</div>
                          <div className="font-mono text-xs text-slate-300 break-all bg-slate-800 p-2 rounded">
                            {currentUserFCM.fcm_token?.substring(0, 20)}...
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-slate-400 text-sm">Loading...</div>
                )}
              </CardContent>
            </Card>

            {/* Selected Users FCM Data */}
            {fcmData.length > 0 && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Selected Users FCM Status</CardTitle>
                  <CardDescription className="text-slate-400">{fcmData.length} users checked</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fcmData.map((userData) => (
                      <div key={userData.user_id} className="p-3 border border-slate-700 rounded-lg bg-slate-800">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm text-white">
                              {userData.name}
                            </div>
                            <div className="text-xs text-slate-400">{userData.email}</div>
                            <div className="text-xs text-slate-500 font-mono mt-1">
                              {userData.user_id}
                            </div>
                          </div>
                          {userData.has_fcm ? (
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        {userData.has_fcm && (
                          <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
                            <div>{userData.platform && `Platform: ${userData.platform}`}</div>
                            <div>
                              {userData.device_name && `Device: ${userData.device_name}`}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
