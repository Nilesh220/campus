// ============================================================
// UniPulse — Comprehensive Supabase Backend Service
// Full persistence for Feed, Groups, Announcements & DMs
// ============================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Post, Group, Announcement, PostCategory, ReactionType,
  GroupMessage,
} from '../types';

export const SupabaseService = {
  // ── 1. POSTS & FEED ─────────────────────────────────────────

  async fetchPosts(): Promise<Post[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          comments (*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        content: item.content,
        category: (item.category as PostCategory) || 'confession',
        tags: item.tags || [],
        authorId: item.author_id || null,
        anonymousName: item.anonymous_name || 'Anonymous',
        anonymousEmoji: item.anonymous_emoji || '🎭',
        isAnonymous: item.is_anonymous ?? true,
        upvotes: item.upvotes || 0,
        downvotes: item.downvotes || 0,
        reactions: item.reactions || { '🔥': 0, '💀': 0, '❤️': 0, '💡': 0, '😭': 0, '😂': 0 },
        comments: (item.comments || []).map((c: any) => ({
          id: c.id,
          postId: c.post_id,
          content: c.content,
          authorId: c.author_id,
          anonymousName: c.anonymous_name || 'Anonymous',
          isAnonymous: c.is_anonymous ?? true,
          upvotes: c.upvotes || 0,
          createdAt: c.created_at,
          replies: [],
        })),
        createdAt: item.created_at,
        isUpvotedByUser: false,
        isDownvotedByUser: false,
        userReactions: [],
      }));
    } catch (err) {
      console.warn('fetchPosts error:', err);
      return [];
    }
  },

  async createPost(post: Post): Promise<Post | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: post.content,
          category: post.category,
          tags: post.tags,
          is_anonymous: post.isAnonymous,
          anonymous_name: post.anonymousName,
          anonymous_emoji: post.anonymousEmoji,
          upvotes: 0,
          downvotes: 0,
          reactions: post.reactions,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        ...post,
        id: data.id,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('createPost error:', err);
      return null;
    }
  },

  async updateVotes(postId: string, upvotes: number, downvotes: number): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('posts').update({ upvotes, downvotes }).eq('id', postId);
    } catch (err) {
      console.warn('updateVotes error:', err);
    }
  },

  async updateReactions(postId: string, reactions: Record<ReactionType, number>): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('posts').update({ reactions }).eq('id', postId);
    } catch (err) {
      console.warn('updateReactions error:', err);
    }
  },

  async addComment(postId: string, content: string, isAnonymous: boolean, anonName: string, authorId?: string | null): Promise<any> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          content,
          is_anonymous: isAnonymous,
          anonymous_name: anonName,
          author_id: authorId || null,
        })
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (err) {
      console.warn('addComment error:', err);
      return null;
    }
  },

  // ── 2. GROUPS & HUBS ─────────────────────────────────────────

  async fetchGroups(): Promise<Group[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_messages (*)
        `)
        .order('member_count', { ascending: false });

      if (error || !data) return [];

      return data.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        category: g.category || 'academic',
        icon: g.icon || '👥',
        coverGradient: g.cover_gradient || 'linear-gradient(135deg, #C4956A, #5BB5A2)',
        memberCount: g.member_count || 1,
        isJoined: false,
        isPrivate: g.is_private || false,
        tags: [],
        recentMessages: (g.group_messages || []).map((m: any) => ({
          id: m.id,
          groupId: m.group_id,
          senderId: m.sender_id,
          senderName: m.sender_name || 'Student',
          senderAvatar: m.sender_avatar || '🎓',
          content: m.content,
          timestamp: m.created_at,
        })),
        pinnedAnnouncement: g.pinned_announcement,
        upcomingEvent: g.upcoming_event,
        createdAt: g.created_at,
      }));
    } catch (err) {
      console.warn('fetchGroups error:', err);
      return [];
    }
  },

  async createGroup(group: Partial<Group>): Promise<Group | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: group.name,
          description: group.description,
          category: group.category || 'academic',
          icon: group.icon || '👥',
          cover_gradient: group.coverGradient || 'linear-gradient(135deg, #C4956A, #5BB5A2)',
          member_count: 1,
          pinned_announcement: group.pinnedAnnouncement,
          upcoming_event: group.upcomingEvent,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        icon: data.icon,
        coverGradient: data.cover_gradient,
        memberCount: 1,
        isJoined: true,
        isPrivate: false,
        tags: group.tags || [],
        recentMessages: [],
        pinnedAnnouncement: data.pinned_announcement,
        upcomingEvent: data.upcoming_event,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('createGroup error:', err);
      return null;
    }
  },

  async sendGroupMessage(groupId: string, senderName: string, senderAvatar: string, content: string): Promise<GroupMessage | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_name: senderName,
          sender_avatar: senderAvatar,
          content,
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        groupId: data.group_id,
        senderId: data.sender_id || '',
        senderName: data.sender_name,
        senderAvatar: data.sender_avatar,
        content: data.content,
        timestamp: data.created_at,
      };
    } catch (err) {
      console.warn('sendGroupMessage error:', err);
      return null;
    }
  },

  // ── 3. ANNOUNCEMENTS & BULLETIN ─────────────────────────────

  async fetchAnnouncements(): Promise<Announcement[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category || 'general',
        date: a.date,
        location: a.location || 'Campus',
        organizer: a.organizer || 'Student Council',
        rsvpCount: a.rsvp_count || 0,
        interestedCount: a.interested_count || 0,
        userRsvp: null,
        tags: a.tags || [],
        isPinned: a.is_pinned || false,
        createdAt: a.created_at,
        coverGradient: a.cover_gradient || 'linear-gradient(135deg, #5B8EC9, #C4956A)',
      }));
    } catch (err) {
      console.warn('fetchAnnouncements error:', err);
      return [];
    }
  },

  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: announcement.title,
          description: announcement.description,
          category: announcement.category || 'general',
          date: announcement.date || new Date(Date.now() + 7 * 86400000).toISOString(),
          location: announcement.location || 'Campus',
          organizer: announcement.organizer || 'Student Council',
          cover_gradient: announcement.coverGradient || 'linear-gradient(135deg, #5B8EC9, #C4956A)',
          is_pinned: announcement.isPinned || false,
          tags: announcement.tags || [],
        })
        .select()
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        location: data.location,
        organizer: data.organizer,
        rsvpCount: 0,
        interestedCount: 0,
        userRsvp: null,
        tags: data.tags || [],
        isPinned: data.is_pinned,
        createdAt: data.created_at,
        coverGradient: data.cover_gradient,
      };
    } catch (err) {
      console.warn('createAnnouncement error:', err);
      return null;
    }
  },

  async updateRSVP(announcementId: string, rsvpCount: number, interestedCount: number): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase
        .from('announcements')
        .update({ rsvp_count: rsvpCount, interested_count: interestedCount })
        .eq('id', announcementId);
    } catch (err) {
      console.warn('updateRSVP error:', err);
    }
  },

  // ── 4. REALTIME SUBSCRIPTIONS ───────────────────────────────

  subscribeToNewPosts(onNewPost: (post: Post) => void) {
    if (!isSupabaseConfigured) return () => {};

    try {
      const channel = supabase
        .channel('realtime:posts')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'posts' },
          payload => {
            const row = payload.new as any;
            if (row) {
              onNewPost({
                id: row.id,
                content: row.content,
                category: row.category || 'confession',
                tags: row.tags || [],
                authorId: row.author_id || null,
                anonymousName: row.anonymous_name || 'Anonymous',
                anonymousEmoji: row.anonymous_emoji || '🎭',
                isAnonymous: row.is_anonymous ?? true,
                upvotes: row.upvotes || 0,
                downvotes: row.downvotes || 0,
                reactions: row.reactions || { '🔥': 0, '💀': 0, '❤️': 0, '💡': 0, '😭': 0, '😂': 0 },
                comments: [],
                createdAt: row.created_at,
                isUpvotedByUser: false,
                isDownvotedByUser: false,
                userReactions: [],
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('subscribeToNewPosts error:', err);
      return () => {};
    }
  },

  subscribeToGroupMessages(groupId: string, onNewMessage: (msg: GroupMessage) => void) {
    if (!isSupabaseConfigured) return () => {};

    try {
      const channel = supabase
        .channel(`realtime:group_messages:${groupId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
          payload => {
            const row = payload.new as any;
            if (row) {
              onNewMessage({
                id: row.id,
                groupId: row.group_id,
                senderId: row.sender_id || '',
                senderName: row.sender_name || 'Student',
                senderAvatar: row.sender_avatar || '🎓',
                content: row.content,
                timestamp: row.created_at,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('subscribeToGroupMessages error:', err);
      return () => {};
    }
  },
};
