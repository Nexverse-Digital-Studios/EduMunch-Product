import { supabase } from "@/lib/supabase";
import { AuthUser } from "./auth.service";

export interface Topic {
  id: string;
  org_id: string;
  subject_id: string;
  parent_topic_id?: string;
  topic_name: string;
  topic_number?: string;
  description?: string;
  topic_order?: number;
  created_at: string;
}

export interface TopicContent {
  id: string;
  org_id: string;
  topic_id: string;
  content_title: string;
  content_type: string;
  content_url?: string;
  file_path?: string;
  created_at: string;
}

export const topicService = {
  // Get all topics for a subject
  async getTopicsBySubject(user: AuthUser | null, subjectId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("subject_id", subjectId)
      .eq("parent_topic_id", null)
      .order("topic_order", { ascending: true });

    return { data, error };
  },

  // Get subtopics
  async getSubtopics(user: AuthUser | null, parentTopicId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("parent_topic_id", parentTopicId)
      .order("topic_order", { ascending: true });

    return { data, error };
  },

  // Get single topic
  async getTopicById(user: AuthUser | null, topicId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("id", topicId)
      .eq("org_id", user.orgId)
      .single();

    return { data, error };
  },

  // Create new topic
  async createTopic(
    user: AuthUser | null,
    topic: Omit<Topic, "id" | "org_id" | "created_at">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topics")
      .insert([
        {
          ...topic,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update topic
  async updateTopic(
    user: AuthUser | null,
    topicId: string,
    updates: Partial<Topic>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topics")
      .update(updates)
      .eq("id", topicId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete topic (cascade delete subtopics and content)
  async deleteTopic(user: AuthUser | null, topicId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    // Delete content first
    await supabase
      .from("topic_content")
      .delete()
      .eq("topic_id", topicId)
      .eq("org_id", user.orgId);

    // Delete subtopics recursively would need function, for now delete direct subtopics
    const subtopics = await supabase
      .from("topics")
      .select("id")
      .eq("parent_topic_id", topicId)
      .eq("org_id", user.orgId);

    if (subtopics.data) {
      for (const sub of subtopics.data) {
        await this.deleteTopic(user, sub.id);
      }
    }

    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Get content for a topic
  async getTopicContent(user: AuthUser | null, topicId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topic_content")
      .select("*")
      .eq("topic_id", topicId)
      .eq("org_id", user.orgId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Add content to topic
  async addTopicContent(
    user: AuthUser | null,
    content: Omit<TopicContent, "id" | "org_id" | "created_at">
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topic_content")
      .insert([
        {
          ...content,
          org_id: user.orgId,
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update content
  async updateTopicContent(
    user: AuthUser | null,
    contentId: string,
    updates: Partial<TopicContent>
  ) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topic_content")
      .update(updates)
      .eq("id", contentId)
      .eq("org_id", user.orgId)
      .select()
      .single();

    return { data, error };
  },

  // Delete content
  async deleteTopicContent(user: AuthUser | null, contentId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { error } = await supabase
      .from("topic_content")
      .delete()
      .eq("id", contentId)
      .eq("org_id", user.orgId);

    return { data: null, error };
  },

  // Get complete hierarchy for a subject
  async getCompleteHierarchy(user: AuthUser | null, subjectId: string) {
    if (!user?.orgId) return { data: null, error: "No organization" };

    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("org_id", user.orgId)
      .eq("subject_id", subjectId)
      .order("topic_order", { ascending: true });

    // Build hierarchy
    const hierarchy: any[] = [];
    const mapById: { [key: string]: any } = {};

    data?.forEach((topic: any) => {
      mapById[topic.id] = { ...topic, children: [] };
    });

    data?.forEach((topic: any) => {
      if (topic.parent_topic_id && mapById[topic.parent_topic_id]) {
        mapById[topic.parent_topic_id].children.push(mapById[topic.id]);
      } else if (!topic.parent_topic_id) {
        hierarchy.push(mapById[topic.id]);
      }
    });

    return { data: hierarchy, error };
  },
};
