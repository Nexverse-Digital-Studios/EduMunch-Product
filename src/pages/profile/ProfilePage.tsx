/**
 * Profile Page - User Profile Management
 *
 * Features:
 * - Profile information display (from Supabase Auth + users table)
 * - Password change (Supabase Auth)
 * - Notification preferences
 *
 * Supabase Tables:
 * - users_1EMAET: User profile data
 * - user_role_mappings_1EMAET: User role assignments
 */
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { useToast } from "@/hooks/use-toast";
import {
  UserProfile,
  ProfileFormData,
  PasswordFormData,
  NotificationSettings,
  ProfileCard,
  ProfileForm,
  SecurityTab,
  NotificationsTab,
} from "./components";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || "1emaet";

export const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // TRACE: Profile component mounted
  useEffect(() => {
    console.log("[Profile] Component mounted, auth user:", user?.id);
  }, []);

  // Fetch user profile from database
  console.log(
    "[Profile] Rendering with user:",
    user?.id,
    "enabled:",
    !!user?.id
  );
  const { data: userProfiles = [], isLoading: profileLoading } =
    useSupabaseTable<UserProfile>(`users_${INDEX_TOKEN}`, {
      select: "*",
      filters: user?.id ? { id: user.id } : {},
      enabled: !!user?.id,
    });

  const userProfile = userProfiles[0];

  console.log("[Profile] Profile data loaded:", {
    isLoading: profileLoading,
    dataLength: userProfiles.length,
    hasProfile: !!userProfile,
  });

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    phone: "",
    department: "Administration",
    designation: "System Administrator",
    joinDate: "",
    branch: "Head Office",
  });

  // Update form when profile loads
  useEffect(() => {
    if (userProfile) {
      setProfileData((prev) => ({
        ...prev,
        fullName: userProfile.full_name || "",
        email: userProfile.email || user?.email || "",
        phone: userProfile.phone_number || "",
        joinDate: userProfile.created_at?.split("T")[0] || "",
      }));
    } else if (user) {
      setProfileData((prev) => ({
        ...prev,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "User",
      }));
    }
  }, [userProfile, user]);

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    attendanceAlerts: true,
    paymentReminders: true,
    systemUpdates: false,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user profile in database
      const { error } = await supabase
        .from(`users_${INDEX_TOKEN}`)
        .update({
          full_name: profileData.fullName,
          phone_number: profileData.phone,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <ProfileCard profileData={profileData} />
            <ProfileForm
              profileData={profileData}
              onProfileChange={(data) =>
                setProfileData((prev) => ({ ...prev, ...data }))
              }
              onSubmit={handleProfileUpdate}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecurityTab
            passwordData={passwordData}
            onPasswordChange={(data) =>
              setPasswordData((prev) => ({ ...prev, ...data }))
            }
            onSubmit={handlePasswordChange}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab
            notifications={notifications}
            onToggle={handleNotificationToggle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
