// ============================================================
// UniPulse — App Context (Global State Management)
// Connected with Supabase Backend with Realtime Support
// ============================================================

import { createContext, useContext, useReducer, type ReactNode, useCallback, useEffect } from 'react';
import type {
  Post, Group, Announcement, DirectConversation,
  Notification, AnonMatch, NavTab, ThemeMode,
  ReactionType, RSVPStatus, PostCategory, ChatMessage, GroupMessage, User,
} from '../types';
import {
  CURRENT_USER, USERS, generateAnonName, BOT_RESPONSES, ICEBREAKERS,
} from '../data/mockData';
import { SupabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

// ── State ───────────────────────────────────────────────────
interface AppState {
  currentUser: User | null;
  theme: ThemeMode;
  activeTab: NavTab;
  posts: Post[];
  groups: Group[];
  announcements: Announcement[];
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

const savedUser = typeof window !== 'undefined' ? localStorage.getItem('unipulse_user') : null;

const initialState: AppState = {
  currentUser: savedUser ? JSON.parse(savedUser) : null,
  theme: (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
  activeTab: 'feed',
  posts: [],
  groups: [],
  announcements: [],
  conversations: [],
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

    case 'LOGIN_USER':
      if (typeof window !== 'undefined') localStorage.setItem('unipulse_user', JSON.stringify(action.payload));
      return { ...state, currentUser: action.payload };

    case 'LOGOUT_USER':
      if (typeof window !== 'undefined') localStorage.removeItem('unipulse_user');
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
      const newPost: Post = {
        id: `p${Date.now()}`,
        content: action.payload.content,
        category: action.payload.category,
        tags: action.payload.tags,
        authorId: action.payload.isAnonymous ? null : CURRENT_USER.id,
        anonymousName: action.payload.isAnonymous ? anon.name : CURRENT_USER.displayName,
        anonymousEmoji: action.payload.isAnonymous ? anon.emoji : CURRENT_USER.avatar,
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
      const newComment = {
        id: `c${Date.now()}`,
        postId: action.payload.postId,
        content: action.payload.content,
        authorId: action.payload.isAnonymous ? null : CURRENT_USER.id,
        anonymousName: action.payload.isAnonymous ? anon.name : CURRENT_USER.displayName,
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
      const newMsg: GroupMessage = {
        id: `gm${Date.now()}`,
        groupId: action.payload.groupId,
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.displayName,
        senderAvatar: CURRENT_USER.avatar,
        content: action.payload.content,
        timestamp: new Date().toISOString(),
      };
      SupabaseService.sendGroupMessage(action.payload.groupId, CURRENT_USER.displayName, CURRENT_USER.avatar, action.payload.content);
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
      const msg: ChatMessage = {
        id: `m${Date.now()}`,
        senderId: CURRENT_USER.id,
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
      const peer = USERS.find(u => u.id === state.activeMatch!.peerId) || USERS[1];
      const newConv: DirectConversation = {
        id: `dc${Date.now()}`,
        participantId: peer.id,
        messages: [
          { id: `dm${Date.now()}`, senderId: peer.id, content: `Hey ${CURRENT_USER.displayName}! Great connecting on Campus Roulette! 🎉`, timestamp: new Date().toISOString(), type: 'text' },
        ],
        lastMessage: `Hey ${CURRENT_USER.displayName}! Great connecting on Campus Roulette! 🎉`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      };
      return {
        ...state,
        activeMatch: { ...state.activeMatch, status: 'revealed' },
        conversations: [newConv, ...state.conversations],
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
      return {
        ...state,
        activeMatch: null,
        activeTab: 'messages',
        activeConversationId: newConv.id,
        conversations: [newConv, ...state.conversations],
      };
    }

    case 'SKIP_MATCH':
    case 'END_CHAT':
      return { ...state, activeMatch: null };

    // ── Direct Messages
    case 'SELECT_CONVERSATION':
      return {
        ...state,
        activeConversationId: action.payload,
        conversations: state.conversations.map(c =>
          c.id === action.payload ? { ...c, unreadCount: 0 } : c
        ),
      };

    case 'SEND_DM': {
      const msg: ChatMessage = {
        id: `dm${Date.now()}`,
        senderId: CURRENT_USER.id,
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId
            ? { ...c, messages: [...c.messages, msg], lastMessage: action.payload.content, lastMessageAt: new Date().toISOString() }
            : c
        ),
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
  startRandomMatch: (interests: string[]) => void;
  sendBotResponse: () => void;
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

    return () => {
      unsubPosts();
    };
  }, []);

  const startRandomMatch = useCallback((interests: string[]) => {
    dispatch({ type: 'START_MATCHING' });

    const delay = 2000 + Math.random() * 2000;
    setTimeout(() => {
      const anon = generateAnonName();
      const peer = USERS[Math.floor(Math.random() * (USERS.length - 1)) + 1];
      const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

      const match: AnonMatch = {
        id: `match${Date.now()}`,
        peerId: peer.id,
        peerPseudonym: anon.name,
        peerEmoji: anon.emoji,
        matchedAt: new Date().toISOString(),
        interestTags: interests,
        messages: [
          { id: `sys${Date.now()}`, senderId: 'system', content: `Connected with ${anon.name} ${anon.emoji}`, timestamp: new Date().toISOString(), type: 'system' },
          { id: `ice${Date.now()}`, senderId: 'system', content: icebreaker, timestamp: new Date().toISOString(), type: 'icebreaker', isIcebreaker: true },
        ],
        status: 'chatting',
        revealRequestSent: false,
        revealRequestReceived: false,
      };

      dispatch({ type: 'MATCH_FOUND', payload: match });
    }, delay);
  }, []);

  const sendBotResponse = useCallback(() => {
    const delay = 1400 + Math.random() * 2000;
    setTimeout(() => {
      if (!state.activeMatch || state.activeMatch.status !== 'chatting') return;
      const response = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      const msg: ChatMessage = {
        id: `bot${Date.now()}`,
        senderId: state.activeMatch.peerId,
        content: response,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      dispatch({ type: 'RECEIVE_CHAT_MESSAGE', payload: msg });
    }, delay);
  }, [state.activeMatch]);

  return (
    <AppContext.Provider value={{ state, dispatch, startRandomMatch, sendBotResponse }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
