// ============================================================
// UniPulse — App Context (Global State Management)
// Connected with Supabase Backend with Realtime Support
// ============================================================

import { createContext, useContext, useReducer, type ReactNode, useEffect } from 'react';
import type {
  Post, Group, Announcement, DirectConversation,
  Notification, AnonMatch, NavTab, ThemeMode,
  ReactionType, RSVPStatus, PostCategory, ChatMessage, GroupMessage, User,
  Poll, Confession,
} from '../types';
import {
  CURRENT_USER, USERS, generateAnonName,
} from '../data/mockData';
import { SupabaseService } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ── State ───────────────────────────────────────────────────
interface AppState {
  currentUser: User | null;
  theme: ThemeMode;
  activeTab: NavTab;
  posts: Post[];
  groups: Group[];
  announcements: Announcement[];
  polls: Poll[];
  confessions: Confession[];
  conversations: DirectConversation[];
  notifications: Notification[];
  activeMatch: AnonMatch | null;
  sidebarOpen: boolean;
  showCreatePost: boolean;
  showCreateGroup: boolean;
  showCreateAnnouncement: boolean;
  showNotifications: boolean;
  showProfile: boolean;
  showPreferences: boolean;
  showAdmin: boolean;
  selectedGroupId: string | null;
  activeConversationId: string | null;
  profileUserId: string | null;
  isLoading: boolean;
}

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('campussparks_session_user') || localStorage.getItem('unipulse_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed) {
      const isNilesh = parsed.email?.toLowerCase().includes('guptanilesh417') ||
                       parsed.displayName?.toLowerCase().includes('guptanilesh417') ||
                       parsed.username?.toLowerCase().includes('guptanilesh417') ||
                       parsed.isAdmin === true;
      return { ...parsed, isAdmin: isNilesh };
    }
    return null;
  } catch {
    return null;
  }
};

const parsedUser = getStoredUser();

const savedConvs = typeof window !== 'undefined' ? localStorage.getItem('unipulse_conversations') : null;
let parsedConvs: DirectConversation[] = [];
try {
  if (savedConvs) {
    parsedConvs = JSON.parse(savedConvs);
  }
} catch {
  parsedConvs = [];
}

// Complete purge of any previous demo data
if (typeof window !== 'undefined') {
  try {
    const rawPolls = localStorage.getItem('campussparks_polls');
    if (rawPolls && (rawPolls.includes('poll_1') || rawPolls.includes('poll_2') || rawPolls.includes('poll_3') || rawPolls.includes('attendance') || rawPolls.includes('canteen'))) {
      localStorage.removeItem('campussparks_polls');
    }
  } catch {}

  try {
    const rawConf = localStorage.getItem('campussparks_confessions');
    if (rawConf && (rawConf.includes('cat memes') || rawConf.includes('green hoodie') || rawConf.includes('conf_1') || rawConf.includes('conf_2') || rawConf.includes('conf_3') || rawConf.includes('conf_4') || rawConf.includes('Midnight Phoenix') || rawConf.includes('Library Ghost') || rawConf.includes('Hostel 4 Ninja') || rawConf.includes('Chai Enthusiast'))) {
      localStorage.removeItem('campussparks_confessions');
    }
  } catch {}
}

const savedPolls = typeof window !== 'undefined' ? localStorage.getItem('campussparks_polls') : null;
let initialPollsData: Poll[] = [];
try {
  if (savedPolls) {
    initialPollsData = (JSON.parse(savedPolls) as Poll[]).filter(p => 
      !p.id.startsWith('poll_1') && 
      !p.id.startsWith('poll_2') && 
      !p.id.startsWith('poll_3') && 
      !p.question?.toLowerCase().includes('attendance') &&
      !p.question?.toLowerCase().includes('canteen')
    );
  }
} catch {
  initialPollsData = [];
}

const savedConfessions = typeof window !== 'undefined' ? localStorage.getItem('campussparks_confessions') : null;
let initialConfessionsData: Confession[] = [];
try {
  if (savedConfessions) {
    initialConfessionsData = (JSON.parse(savedConfessions) as Confession[]).filter(c => 
      !c.id.startsWith('conf_1') && 
      !c.id.startsWith('conf_2') && 
      !c.id.startsWith('conf_3') && 
      !c.id.startsWith('conf_4') && 
      !c.content?.toLowerCase().includes('cat memes') && 
      !c.content?.toLowerCase().includes('green hoodie') &&
      !c.pseudonym?.toLowerCase().includes('midnight phoenix') &&
      !c.pseudonym?.toLowerCase().includes('library ghost')
    );
  }
} catch {
  initialConfessionsData = [];
}

const initialState: AppState = {
  currentUser: parsedUser,
  theme: (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
  activeTab: 'feed',
  posts: [],
  groups: [],
  announcements: [],
  polls: initialPollsData,
  confessions: initialConfessionsData,
  conversations: parsedConvs,
  notifications: [],
  activeMatch: null,
  sidebarOpen: false,
  showCreatePost: false,
  showCreateGroup: false,
  showCreateAnnouncement: false,
  showNotifications: false,
  showProfile: false,
  showPreferences: false,
  showAdmin: false,
  selectedGroupId: null,
  activeConversationId: null,
  profileUserId: null,
  isLoading: true,
};

// ── Actions ─────────────────────────────────────────────────
type Action =
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_TAB'; payload: NavTab }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'TOGGLE_CREATE_POST' }
  | { type: 'TOGGLE_CREATE_GROUP' }
  | { type: 'TOGGLE_CREATE_ANNOUNCEMENT' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'TOGGLE_PROFILE'; payload?: string | null }
  | { type: 'TOGGLE_PREFERENCES' }
  | { type: 'TOGGLE_ADMIN' }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_REALTIME_POST'; payload: Post }
  | { type: 'ADD_POST'; payload: { content: string; category: PostCategory; tags: string[]; isAnonymous: boolean } }
  | { type: 'UPVOTE_POST'; payload: string }
  | { type: 'DOWNVOTE_POST'; payload: string }
  | { type: 'REACT_TO_POST'; payload: { postId: string; reaction: ReactionType } }
  | { type: 'ADD_COMMENT'; payload: { postId: string; content: string; isAnonymous: boolean } }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'JOIN_GROUP'; payload: string }
  | { type: 'SELECT_GROUP'; payload: string | null }
  | { type: 'SEND_GROUP_MESSAGE'; payload: { groupId: string; content: string } }
  | { type: 'ADD_REALTIME_GROUP_MESSAGE'; payload: GroupMessage }
  | { type: 'SET_ANNOUNCEMENTS'; payload: Announcement[] }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'RSVP_ANNOUNCEMENT'; payload: { id: string; status: RSVPStatus } }
  | { type: 'VOTE_POLL'; payload: { pollId: string; optionId: string } }
  | { type: 'CREATE_POLL'; payload: Poll }
  | { type: 'DELETE_POLL'; payload: string }
  | { type: 'ADD_CONFESSION'; payload: Confession }
  | { type: 'REACT_CONFESSION'; payload: { confessionId: string; reaction: string } }
  | { type: 'UPVOTE_CONFESSION'; payload: string }
  | { type: 'DOWNVOTE_CONFESSION'; payload: string }
  | { type: 'DELETE_CONFESSION'; payload: string }
  | { type: 'START_MATCHING' }
  | { type: 'MATCH_FOUND'; payload: AnonMatch }
  | { type: 'SEND_CHAT_MESSAGE'; payload: string }
  | { type: 'RECEIVE_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SEND_REVEAL_REQUEST' }
  | { type: 'ACCEPT_REVEAL' }
  | { type: 'CONNECT_ANONYMOUSLY' }
  | { type: 'SKIP_MATCH' }
  | { type: 'END_CHAT' }
  | { type: 'SELECT_CONVERSATION'; payload: string | null }
  | { type: 'SEND_DM'; payload: { conversationId: string; content: string } }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'SET_LOADING'; payload: boolean };

// ── Reducer ─────────────────────────────────────────────────
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'LOGIN_USER': {
      const isNileshAdmin = action.payload.email?.toLowerCase().includes('guptanilesh417') ||
                           action.payload.displayName?.toLowerCase().includes('guptanilesh417') ||
                           action.payload.username?.toLowerCase().includes('guptanilesh417') ||
                           action.payload.isAdmin === true;
      const user = { ...action.payload, isAdmin: isNileshAdmin };
      if (typeof window !== 'undefined') {
        localStorage.setItem('campussparks_session_user', JSON.stringify(user));
        localStorage.setItem('unipulse_user', JSON.stringify(user));
      }
      return { ...state, currentUser: user };
    }

    case 'LOGOUT_USER':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('campussparks_session_user');
        localStorage.removeItem('unipulse_user');
      }
      try {
        supabase.auth.signOut().catch(() => {});
      } catch (_) {}
      return { ...state, currentUser: null, activeMatch: null, activeConversationId: null, selectedGroupId: null };

    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.payload,
        selectedGroupId: null,
        activeConversationId: null,
        showNotifications: false,
        showProfile: false,
      };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false };

    case 'TOGGLE_CREATE_POST':
      return { ...state, showCreatePost: !state.showCreatePost };

    case 'TOGGLE_CREATE_GROUP':
      return { ...state, showCreateGroup: !state.showCreateGroup };

    case 'TOGGLE_CREATE_ANNOUNCEMENT':
      return { ...state, showCreateAnnouncement: !state.showCreateAnnouncement };

    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, showNotifications: !state.showNotifications, showProfile: false };

    case 'TOGGLE_PREFERENCES':
      return { ...state, showPreferences: !state.showPreferences };

    case 'TOGGLE_ADMIN':
      return { ...state, showAdmin: !state.showAdmin };

    case 'TOGGLE_PROFILE':
      return {
        ...state,
        profileUserId: action.payload !== undefined ? action.payload : (state.showProfile ? null : CURRENT_USER.id),
        showProfile: action.payload !== undefined ? !!action.payload : !state.showProfile,
        showNotifications: false,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    // ── Posts
    case 'SET_POSTS':
      return { ...state, posts: action.payload, isLoading: false };

    case 'ADD_REALTIME_POST':
      if (state.posts.some(p => p.id === action.payload.id)) return state;
      return { ...state, posts: [action.payload, ...state.posts] };

    case 'ADD_POST': {
      const anon = generateAnonName();
      const me = state.currentUser || CURRENT_USER;
      const newPost: Post = {
        id: `p${Date.now()}`,
        content: action.payload.content,
        category: action.payload.category,
        tags: action.payload.tags,
        authorId: action.payload.isAnonymous ? null : me.id,
        anonymousName: action.payload.isAnonymous ? anon.name : me.displayName,
        anonymousEmoji: action.payload.isAnonymous ? anon.emoji : me.avatar,
        isAnonymous: action.payload.isAnonymous,
        upvotes: 0,
        downvotes: 0,
        reactions: { '🔥': 0, '💀': 0, '❤️': 0, '💡': 0, '😭': 0, '😂': 0 },
        comments: [],
        createdAt: new Date().toISOString(),
        isUpvotedByUser: false,
        isDownvotedByUser: false,
        userReactions: [],
      };
      SupabaseService.createPost(newPost);
      return { ...state, posts: [newPost, ...state.posts], showCreatePost: false };
    }

    case 'UPVOTE_POST':
      return {
        ...state,
        posts: state.posts.map(p => {
          if (p.id !== action.payload) return p;
          const upvotes = p.isUpvotedByUser ? p.upvotes - 1 : p.upvotes + 1;
          const downvotes = p.isDownvotedByUser ? p.downvotes - 1 : p.downvotes;
          SupabaseService.updateVotes(p.id, upvotes, downvotes);
          if (p.isUpvotedByUser) return { ...p, upvotes, isUpvotedByUser: false };
          return {
            ...p,
            upvotes,
            downvotes,
            isUpvotedByUser: true,
            isDownvotedByUser: false,
          };
        }),
      };

    case 'DOWNVOTE_POST':
      return {
        ...state,
        posts: state.posts.map(p => {
          if (p.id !== action.payload) return p;
          const downvotes = p.isDownvotedByUser ? p.downvotes - 1 : p.downvotes + 1;
          const upvotes = p.isUpvotedByUser ? p.upvotes - 1 : p.upvotes;
          SupabaseService.updateVotes(p.id, upvotes, downvotes);
          if (p.isDownvotedByUser) return { ...p, downvotes, isDownvotedByUser: false };
          return {
            ...p,
            downvotes,
            upvotes,
            isDownvotedByUser: true,
            isUpvotedByUser: false,
          };
        }),
      };

    case 'REACT_TO_POST':
      return {
        ...state,
        posts: state.posts.map(p => {
          if (p.id !== action.payload.postId) return p;
          const { reaction } = action.payload;
          const hasReacted = p.userReactions.includes(reaction);
          const newReactions = { ...p.reactions, [reaction]: Math.max(0, p.reactions[reaction] + (hasReacted ? -1 : 1)) };
          SupabaseService.updateReactions(p.id, newReactions);
          return {
            ...p,
            reactions: newReactions,
            userReactions: hasReacted
              ? p.userReactions.filter(r => r !== reaction)
              : [...p.userReactions, reaction],
          };
        }),
      };

    case 'ADD_COMMENT': {
      const anon = generateAnonName();
      const me = state.currentUser || CURRENT_USER;
      const newComment = {
        id: `c${Date.now()}`,
        postId: action.payload.postId,
        content: action.payload.content,
        authorId: action.payload.isAnonymous ? null : me.id,
        anonymousName: action.payload.isAnonymous ? anon.name : me.displayName,
        isAnonymous: action.payload.isAnonymous,
        upvotes: 0,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      SupabaseService.addComment(
        action.payload.postId,
        action.payload.content,
        action.payload.isAnonymous,
        newComment.anonymousName,
        newComment.authorId
      );
      return {
        ...state,
        posts: state.posts.map(p => {
          if (p.id !== action.payload.postId) return p;
          return { ...p, comments: [...p.comments, newComment] };
        }),
      };
    }

    // ── Groups
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };

    case 'ADD_GROUP':
      return { ...state, groups: [action.payload, ...state.groups], showCreateGroup: false };

    case 'JOIN_GROUP':
      return {
        ...state,
        groups: state.groups.map(g =>
          g.id === action.payload
            ? { ...g, isJoined: !g.isJoined, memberCount: g.isJoined ? Math.max(1, g.memberCount - 1) : g.memberCount + 1 }
            : g
        ),
      };

    case 'SELECT_GROUP':
      return { ...state, selectedGroupId: action.payload };

    case 'SEND_GROUP_MESSAGE': {
      const me = state.currentUser || CURRENT_USER;
      const newMsg: GroupMessage = {
        id: `gm${Date.now()}`,
        groupId: action.payload.groupId,
        senderId: me.id,
        senderName: me.displayName,
        senderAvatar: me.avatar,
        content: action.payload.content,
        timestamp: new Date().toISOString(),
      };
      SupabaseService.sendGroupMessage(action.payload.groupId, me.displayName, me.avatar, action.payload.content);
      return {
        ...state,
        groups: state.groups.map(g =>
          g.id === action.payload.groupId
            ? { ...g, recentMessages: [...g.recentMessages, newMsg] }
            : g
        ),
      };
    }

    case 'ADD_REALTIME_GROUP_MESSAGE':
      return {
        ...state,
        groups: state.groups.map(g =>
          g.id === action.payload.groupId
            ? {
                ...g,
                recentMessages: g.recentMessages.some(m => m.id === action.payload.id)
                  ? g.recentMessages
                  : [...g.recentMessages, action.payload],
              }
            : g
        ),
      };

    // ── Announcements
    case 'SET_ANNOUNCEMENTS':
      return { ...state, announcements: action.payload };

    case 'ADD_ANNOUNCEMENT':
      return { ...state, announcements: [action.payload, ...state.announcements], showCreateAnnouncement: false };

    case 'RSVP_ANNOUNCEMENT':
      return {
        ...state,
        announcements: state.announcements.map(a => {
          if (a.id !== action.payload.id) return a;
          const prevStatus = a.userRsvp;
          const newStatus = action.payload.status === prevStatus ? null : action.payload.status;
          let rsvpCount = a.rsvpCount;
          let interestedCount = a.interestedCount;
          if (prevStatus === 'going') rsvpCount--;
          if (prevStatus === 'interested') interestedCount--;
          if (newStatus === 'going') rsvpCount++;
          if (newStatus === 'interested') interestedCount++;
          SupabaseService.updateRSVP(a.id, rsvpCount, interestedCount);
          return { ...a, userRsvp: newStatus, rsvpCount, interestedCount };
        }),
      };

    // ── Campus Polls & Hot Takes
    case 'VOTE_POLL': {
      const updatedPolls = state.polls.map(p => {
        if (p.id !== action.payload.pollId) return p;
        if (p.userVotedOptionId === action.payload.optionId) return p; // already voted for this option

        const hadPreviousVote = p.userVotedOptionId !== null;
        const updatedOptions = p.options.map(opt => {
          if (opt.id === action.payload.optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          if (hadPreviousVote && opt.id === p.userVotedOptionId) {
            return { ...opt, votes: Math.max(0, opt.votes - 1) };
          }
          return opt;
        });

        return {
          ...p,
          options: updatedOptions,
          totalVotes: hadPreviousVote ? p.totalVotes : p.totalVotes + 1,
          userVotedOptionId: action.payload.optionId,
        };
      });
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_polls', JSON.stringify(updatedPolls));
      return { ...state, polls: updatedPolls };
    }

    case 'CREATE_POLL': {
      const updatedPolls = [action.payload, ...state.polls];
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_polls', JSON.stringify(updatedPolls));
      return { ...state, polls: updatedPolls };
    }

    case 'DELETE_POLL': {
      const updatedPolls = state.polls.filter(p => p.id !== action.payload);
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_polls', JSON.stringify(updatedPolls));
      return { ...state, polls: updatedPolls };
    }

    // ── Anonymous Confessions & Secrets
    case 'ADD_CONFESSION': {
      const updatedConfessions = [action.payload, ...state.confessions];
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_confessions', JSON.stringify(updatedConfessions));
      return { ...state, confessions: updatedConfessions };
    }

    case 'REACT_CONFESSION': {
      const updatedConfessions = state.confessions.map(c => {
        if (c.id !== action.payload.confessionId) return c;
        const currentReactions = { ...c.reactions };
        const emoji = action.payload.reaction;
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        return {
          ...c,
          reactions: currentReactions,
          userReaction: emoji,
        };
      });
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_confessions', JSON.stringify(updatedConfessions));
      return { ...state, confessions: updatedConfessions };
    }

    case 'UPVOTE_CONFESSION': {
      const updatedConfessions = state.confessions.map(c => {
        if (c.id !== action.payload) return c;
        const isUp = c.isUpvoted;
        return {
          ...c,
          upvotes: isUp ? Math.max(0, c.upvotes - 1) : c.upvotes + 1,
          isUpvoted: !isUp,
          isDownvoted: false,
        };
      });
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_confessions', JSON.stringify(updatedConfessions));
      return { ...state, confessions: updatedConfessions };
    }

    case 'DOWNVOTE_CONFESSION': {
      const updatedConfessions = state.confessions.map(c => {
        if (c.id !== action.payload) return c;
        const isDown = c.isDownvoted;
        return {
          ...c,
          downvotes: isDown ? Math.max(0, c.downvotes - 1) : c.downvotes + 1,
          isDownvoted: !isDown,
          isUpvoted: false,
        };
      });
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_confessions', JSON.stringify(updatedConfessions));
      return { ...state, confessions: updatedConfessions };
    }

    case 'DELETE_CONFESSION': {
      const updatedConfessions = state.confessions.filter(c => c.id !== action.payload);
      if (typeof window !== 'undefined') localStorage.setItem('campussparks_confessions', JSON.stringify(updatedConfessions));
      return { ...state, confessions: updatedConfessions };
    }

    // ── Campus Roulette
    case 'START_MATCHING':
      return {
        ...state,
        activeMatch: {
          id: 'searching',
          peerId: '',
          peerPseudonym: '',
          peerEmoji: '',
          matchedAt: '',
          interestTags: [],
          messages: [],
          status: 'searching',
          revealRequestSent: false,
          revealRequestReceived: false,
        },
      };

    case 'MATCH_FOUND':
      return { ...state, activeMatch: action.payload };

    case 'SEND_CHAT_MESSAGE': {
      if (!state.activeMatch) return state;
      const me = state.currentUser || CURRENT_USER;
      const msg: ChatMessage = {
        id: `m${Date.now()}`,
        senderId: me.id,
        content: action.payload,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      return {
        ...state,
        activeMatch: {
          ...state.activeMatch,
          messages: [...state.activeMatch.messages, msg],
        },
      };
    }

    case 'RECEIVE_CHAT_MESSAGE': {
      if (!state.activeMatch) return state;
      return {
        ...state,
        activeMatch: {
          ...state.activeMatch,
          messages: [...state.activeMatch.messages, action.payload],
        },
      };
    }

    case 'SEND_REVEAL_REQUEST':
      if (!state.activeMatch) return state;
      return {
        ...state,
        activeMatch: { ...state.activeMatch, revealRequestSent: true, status: 'reveal-pending' },
      };

    case 'ACCEPT_REVEAL': {
      if (!state.activeMatch) return state;
      const me = state.currentUser || CURRENT_USER;
      const peer = USERS.find(u => u.id === state.activeMatch!.peerId) || USERS[1];
      const newConv: DirectConversation = {
        id: `dc_${peer.id}_${Date.now()}`,
        participantId: peer.id,
        messages: [
          { id: `dm_${Date.now()}`, senderId: peer.id, content: `Hey ${me.displayName}! Great connecting on Campus Roulette! 🎉`, timestamp: new Date().toISOString(), type: 'text' },
        ],
        lastMessage: `Hey ${me.displayName}! Great connecting on Campus Roulette! 🎉`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      };
      const updatedConvs = [newConv, ...state.conversations];
      if (typeof window !== 'undefined') localStorage.setItem('unipulse_conversations', JSON.stringify(updatedConvs));
      return {
        ...state,
        activeMatch: { ...state.activeMatch, status: 'revealed' },
        conversations: updatedConvs,
      };
    }

    case 'CONNECT_ANONYMOUSLY': {
      if (!state.activeMatch) return state;
      const newConv: DirectConversation = {
        id: `dc_anon_${Date.now()}`,
        participantId: state.activeMatch.peerId,
        isAnonymous: true,
        peerPseudonym: state.activeMatch.peerPseudonym,
        peerEmoji: state.activeMatch.peerEmoji,
        messages: [
          ...state.activeMatch.messages.filter(m => m.type === 'text'),
          {
            id: `dm_${Date.now()}`,
            senderId: state.activeMatch.peerId,
            content: `Connected anonymously! You can keep chatting privately right here anytime 🔒`,
            timestamp: new Date().toISOString(),
            type: 'text',
          },
        ],
        lastMessage: `Connected anonymously! You can keep chatting privately right here anytime 🔒`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      };
      const updatedConvs = [newConv, ...state.conversations];
      if (typeof window !== 'undefined') localStorage.setItem('unipulse_conversations', JSON.stringify(updatedConvs));
      return {
        ...state,
        activeMatch: null,
        activeTab: 'messages',
        activeConversationId: newConv.id,
        conversations: updatedConvs,
      };
    }

    case 'SKIP_MATCH':
    case 'END_CHAT':
      return { ...state, activeMatch: null };

    // ── Direct Messages
    case 'SELECT_CONVERSATION': {
      const updatedConvs = state.conversations.map(c =>
        c.id === action.payload ? { ...c, unreadCount: 0 } : c
      );
      if (typeof window !== 'undefined') localStorage.setItem('unipulse_conversations', JSON.stringify(updatedConvs));
      return {
        ...state,
        activeConversationId: action.payload,
        conversations: updatedConvs,
      };
    }

    case 'SEND_DM': {
      const me = state.currentUser || CURRENT_USER;
      const msg: ChatMessage = {
        id: `dm_${Date.now()}`,
        senderId: me.id,
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      const updatedConvs = state.conversations.map(c =>
        c.id === action.payload.conversationId
          ? { ...c, messages: [...c.messages, msg], lastMessage: action.payload.content, lastMessageAt: new Date().toISOString() }
          : c
      );
      if (typeof window !== 'undefined') localStorage.setItem('unipulse_conversations', JSON.stringify(updatedConvs));
      return {
        ...state,
        conversations: updatedConvs,
      };
    }

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      };

    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Load all live Supabase data on mount
  useEffect(() => {
    async function loadAllData() {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (isSupabaseConfigured) {
        const [posts, groups, announcements] = await Promise.all([
          SupabaseService.fetchPosts(),
          SupabaseService.fetchGroups(),
          SupabaseService.fetchAnnouncements(),
        ]);

        dispatch({ type: 'SET_POSTS', payload: posts });
        dispatch({ type: 'SET_GROUPS', payload: groups });
        dispatch({ type: 'SET_ANNOUNCEMENTS', payload: announcements });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    loadAllData();

    // Subscribe to realtime posts
    const unsubPosts = SupabaseService.subscribeToNewPosts(newPost => {
      dispatch({ type: 'ADD_REALTIME_POST', payload: newPost });
    });

    // Auto-restore session from Supabase on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const isNilesh = session.user.email?.toLowerCase().includes('guptanilesh417') ||
                           profile?.username?.toLowerCase().includes('guptanilesh417');

          dispatch({
            type: 'LOGIN_USER',
            payload: {
              id: session.user.id,
              username: profile?.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'student',
              email: session.user.email || profile?.email || '',
              displayName: profile?.display_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Campus Student',
              avatar: profile?.avatar || session.user.user_metadata?.avatar || '🎓',
              major: profile?.major || session.user.user_metadata?.major || 'Computer Science',
              graduationYear: profile?.graduation_year || session.user.user_metadata?.graduation_year || 2027,
              college: profile?.college || 'Campus University',
              bio: profile?.bio || 'Campus student',
              hobbies: profile?.hobbies || ['Campus Life'],
              badges: [],
              isOnline: true,
              joinedAt: profile?.created_at || session.user.created_at || new Date().toISOString(),
              pulseScore: profile?.pulse_score || 100,
              isAdmin: isNilesh,
              isVerified: true,
            },
          });
        } catch (_) {}
      }
    });

    // Listen for auth state changes (Magic link, OTP confirmation, password login, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (['SIGNED_IN', 'INITIAL_SESSION', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event) && session?.user) {
        const u = session.user;
        const isNilesh = u.email?.toLowerCase().includes('guptanilesh417');

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();

          dispatch({
            type: 'LOGIN_USER',
            payload: {
              id: u.id,
              username: profile?.username || u.user_metadata?.username || u.email?.split('@')[0] || 'student',
              email: u.email || profile?.email || '',
              displayName: profile?.display_name || u.user_metadata?.display_name || u.email?.split('@')[0] || 'Campus Student',
              avatar: profile?.avatar || u.user_metadata?.avatar || '🎓',
              major: profile?.major || u.user_metadata?.major || 'Computer Science',
              graduationYear: profile?.graduation_year || u.user_metadata?.graduation_year || 2027,
              college: profile?.college || 'Campus University',
              bio: profile?.bio || 'Campus student',
              hobbies: profile?.hobbies || ['Campus Life'],
              badges: [],
              isOnline: true,
              joinedAt: profile?.created_at || u.created_at || new Date().toISOString(),
              pulseScore: profile?.pulse_score || 100,
              isAdmin: isNilesh,
              isVerified: true,
            },
          });
        } catch (_) {}
      }
    });

    return () => {
      unsubPosts();
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
