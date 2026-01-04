/**
 * Settings Page - System Configuration & Preferences
 *
 * Features:
 * - General Settings (School info, branding)
 * - Academic Settings (Year, grading system)
 * - Notification Settings
 * - Security Settings
 * - Integration Settings
 * - Sidebar Configuration (local preferences)
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  Settings,
  School,
  GraduationCap,
  Bell,
  Shield,
  Plug,
  Save,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Palette,
  Users,
  FileText,
  Database,
  Key,
  Lock,
  Smartphone,
  CreditCard,
  MessageSquare,
  Video,
  Cloud,
  PanelLeft,
} from "lucide-react";
import { SidebarConfigTab } from "./tabs/SidebarConfigTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Demo data for settings
const schoolInfo = {
  name: "EduMunch International School",
  shortName: "EMS",
  email: "admin@edumunch.edu",
  phone: "+91 9876543210",
  website: "www.edumunch.edu",
  address: "123 Education Lane, Knowledge City, State - 400001",
  principalName: "Dr. Rajesh Kumar",
  establishedYear: "2010",
  affiliationNo: "CBSE/AFF/1234567",
  schoolCode: "12345",
};

const academicSettings = {
  currentYear: "2025-26",
  startMonth: "April",
  gradingSystem: "CBSE",
  passingPercentage: "33",
  maxWorkingDays: "220",
  periodsPerDay: "8",
  periodDuration: "45",
};

const integrations = [
  { id: "sms", name: "SMS Gateway", provider: "Twilio", status: "connected", icon: Smartphone },
  { id: "payment", name: "Payment Gateway", provider: "Razorpay", status: "connected", icon: CreditCard },
  { id: "email", name: "Email Service", provider: "SendGrid", status: "connected", icon: Mail },
  { id: "video", name: "Video Conferencing", provider: "Zoom", status: "not_connected", icon: Video },
  { id: "storage", name: "Cloud Storage", provider: "AWS S3", status: "connected", icon: Cloud },
  { id: "whatsapp", name: "WhatsApp Business", provider: "Meta", status: "not_connected", icon: MessageSquare },
];

export const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Form states
  const [schoolData, setSchoolData] = useState(schoolInfo);
  const [academicData, setAcademicData] = useState(academicSettings);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    attendanceAlerts: true,
    feeReminders: true,
    examNotifications: true,
    holidayAlerts: true,
    parentAppNotifications: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    minPasswordLength: "8",
    requireSpecialChars: true,
    loginAttempts: "5",
  });

  const handleSave = (section: string) => {
    toast({
      title: "Settings saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your school's configuration and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0 flex-wrap">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <School className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="academic"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="sidebar"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
          >
            <PanelLeft className="h-4 w-4" />
            Configure Sidebar
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Basic information about your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                  <School className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={schoolData.name}
                    onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name / Abbreviation</Label>
                  <Input
                    id="shortName"
                    value={schoolData.shortName}
                    onChange={(e) => setSchoolData({ ...schoolData, shortName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={schoolData.email}
                      onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={schoolData.phone}
                      onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      className="pl-10"
                      value={schoolData.website}
                      onChange={(e) => setSchoolData({ ...schoolData, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principal">Principal Name</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="principal"
                      className="pl-10"
                      value={schoolData.principalName}
                      onChange={(e) => setSchoolData({ ...schoolData, principalName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-10 min-h-[80px]"
                      value={schoolData.address}
                      onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="affiliation"
                      className="pl-10"
                      value={schoolData.affiliationNo}
                      onChange={(e) => setSchoolData({ ...schoolData, affiliationNo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">School Code</Label>
                  <div className="relative">
                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schoolCode"
                      className="pl-10"
                      value={schoolData.schoolCode}
                      onChange={(e) => setSchoolData({ ...schoolData, schoolCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("General")} className="bg-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Branding Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding & Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your school portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-primary border" />
                    <Input value="#6366f1" className="flex-1" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-secondary border" />
                    <Input value="#f1f5f9" className="flex-1" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-accent border" />
                    <Input value="#e0e7ff" className="flex-1" readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Settings Tab */}
        <TabsContent value="academic" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Year Settings
              </CardTitle>
              <CardDescription>
                Configure your academic year and session details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Current Academic Year</Label>
                  <Select value={academicData.currentYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2026-27">2026-27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Session Start Month</Label>
                  <Select value={academicData.startMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grading System</Label>
                  <Select value={academicData.gradingSystem}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE Grading</SelectItem>
                      <SelectItem value="ICSE">ICSE Grading</SelectItem>
                      <SelectItem value="State">State Board</SelectItem>
                      <SelectItem value="IB">IB System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Passing Percentage</Label>
                  <Input
                    type="number"
                    value={academicData.passingPercentage}
                    onChange={(e) => setAcademicData({ ...academicData, passingPercentage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Working Days/Year</Label>
                  <Input
                    type="number"
                    value={academicData.maxWorkingDays}
                    onChange={(e) => setAcademicData({ ...academicData, maxWorkingDays: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timetable Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Periods Per Day</Label>
                    <Input
                      type="number"
                      value={academicData.periodsPerDay}
                      onChange={(e) => setAcademicData({ ...academicData, periodsPerDay: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={academicData.periodDuration}
                      onChange={(e) => setAcademicData({ ...academicData, periodDuration: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Academic")} className="bg-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, smsNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Browser and mobile push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Alert Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Attendance Alerts</p>
                      <p className="text-sm text-muted-foreground">Notify parents about student attendance</p>
                    </div>
                    <Switch
                      checked={notifications.attendanceAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, attendanceAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Fee Reminders</p>
                      <p className="text-sm text-muted-foreground">Send fee due date reminders</p>
                    </div>
                    <Switch
                      checked={notifications.feeReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, feeReminders: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Exam Notifications</p>
                      <p className="text-sm text-muted-foreground">Exam schedules and result announcements</p>
                    </div>
                    <Switch
                      checked={notifications.examNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, examNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Holiday Alerts</p>
                      <p className="text-sm text-muted-foreground">Holiday and event announcements</p>
                    </div>
                    <Switch
                      checked={notifications.holidayAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, holidayAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">Parent App Notifications</p>
                      <p className="text-sm text-muted-foreground">Notifications to parent mobile app</p>
                    </div>
                    <Switch
                      checked={notifications.parentAppNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, parentAppNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Notification")} className="bg-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSecurity({ ...security, twoFactorAuth: checked })
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Session Timeout (minutes)
                  </Label>
                  <Select
                    value={security.sessionTimeout}
                    onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Password Expiry (days)
                  </Label>
                  <Select
                    value={security.passwordExpiry}
                    onValueChange={(value) => setSecurity({ ...security, passwordExpiry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={security.minPasswordLength}
                    onChange={(e) => setSecurity({ ...security, minPasswordLength: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={security.loginAttempts}
                    onChange={(e) => setSecurity({ ...security, loginAttempts: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <p className="font-medium">Require Special Characters</p>
                  <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                </div>
                <Switch
                  checked={security.requireSpecialChars}
                  onCheckedChange={(checked) =>
                    setSecurity({ ...security, requireSpecialChars: checked })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Security")} className="bg-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Third-Party Integrations
              </CardTitle>
              <CardDescription>
                Manage connections with external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <integration.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">{integration.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={integration.status === "connected" ? "default" : "secondary"}
                        className={
                          integration.status === "connected"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {integration.status === "connected" ? "Connected" : "Not Connected"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        {integration.status === "connected" ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sidebar Configuration Tab */}
        <TabsContent value="sidebar" className="mt-6">
          <SidebarConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
