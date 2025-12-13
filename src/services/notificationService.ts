import { supabase } from '@/lib/supabase';
import { AuthUser } from './auth.service';

export interface Notification {
  id: string;
  org_id: string;
  title: string;
  message: string;
  link?: string;
  notification_type?: string;
  created_by?: string;
  created_at: string;
}

export interface NotificationTarget {
  id: string;
  notification_id: string;
  target_type: string; // ROLE, BRANCH, COURSE, BATCH, TIE_UP_SCHOOL
  target_value?: string;
  target_name?: string;
  created_at: string;
}

export const notificationService = {
  async composeAndSendNotification(
    user: AuthUser,
    title: string,
    message: string,
    targets: Array<{ type: string; value?: string; name?: string }>,
    link?: string
  ): Promise<Notification> {
    // Create notification
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        org_id: user.orgId,
        title,
        message,
        link,
        notification_type: 'ANNOUNCEMENT',
        created_by: user.id,
      })
      .select()
      .single();

    if (notificationError) throw notificationError;

    // Add targets
    const targetInserts = targets.map(target => ({
      notification_id: notificationData.id,
      target_type: target.type,
      target_value: target.value,
      target_name: target.name,
    }));

    if (targetInserts.length > 0) {
      const { error: targetsError } = await supabase
        .from('notification_targets')
        .insert(targetInserts);

      if (targetsError) throw targetsError;
    }

    return notificationData;
  },

  async getNotifications(user: AuthUser, limit: number = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('org_id', user.orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getNotificationById(user: AuthUser, id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('org_id', user.orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getNotificationWithTargets(
    user: AuthUser,
    notificationId: string
  ): Promise<{ notification: Notification; targets: NotificationTarget[] } | null> {
    const notification = await notificationService.getNotificationById(user, notificationId);
    if (!notification) return null;

    const { data: targets, error } = await supabase
      .from('notification_targets')
      .select('*')
      .eq('notification_id', notificationId);

    if (error) throw error;

    return {
      notification,
      targets: targets || [],
    };
  },

  async searchNotifications(user: AuthUser, searchTerm: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('org_id', user.orgId)
      .or(`title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getNotificationHistory(
    user: AuthUser,
    filters?: {
      start_date?: string;
      end_date?: string;
      notification_type?: string;
    }
  ): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('org_id', user.orgId);

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters?.notification_type) {
      query = query.eq('notification_type', filters.notification_type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getNotificationStats(user: AuthUser | null): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    if (!user?.orgId) return { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data, error } = await supabase
      .from('notifications')
      .select('created_at', { count: 'exact' })
      .eq('org_id', user.orgId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      today: data?.filter((d: any) => new Date(d.created_at).getTime() >= today.getTime()).length || 0,
      thisWeek: data?.filter((d: any) => new Date(d.created_at).getTime() >= weekStart.getTime()).length || 0,
      thisMonth: data?.filter((d: any) => new Date(d.created_at).getTime() >= monthStart.getTime()).length || 0,
    };

    return stats;
  },

  async deleteNotification(user: AuthUser, id: string): Promise<void> {
    // Delete targets first (cascade should handle this, but being explicit)
    await supabase
      .from('notification_targets')
      .delete()
      .eq('notification_id', id);

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('org_id', user.orgId);

    if (error) throw error;
  },
};
