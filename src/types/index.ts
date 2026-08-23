// ============================================================
// UniPulse — Core Type Definitions
// ============================================================

export type ThemeMode = 'light' | 'dark';

export type PostCategory = 'confession' | 'study' | 'lost-found' | 'campus-vibe' | 'event' | 'meme';

export type ReactionType = '🔥' | '💀' | '❤️' | '💡' | '😭' | '😂';

export type AnnouncementCategory = 'exam' | 'fest' | 'hackathon' | 'club' | 'general' | 'sports';

export type RSVPStatus = 'going' | 'interested' | 'not-going' | null;

export type MatchStatus = 'idle' | 'searching' | 'matched' | 'chatting' | 'reveal-pending' | 'revealed';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  major: string;
  graduationYear: number;
  college: string;
  bio: string;
  hobbies: string[];
  pulseScore: number;
  badges: Badge[];
  isOnline: boolean;
  joinedAt: string;
  email?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Post {
  id: string;
  content: string;
  category: PostCategory;
  tags: string[];
  authorId: string | null; // null = anonymous
  anonymousName: string;
  anonymousEmoji: string;
  isAnonymous: boolean;
  upvotes: number;
  downvotes: number;
  reactions: Record<ReactionType, number>;
  comments: Comment[];
  createdAt: string;
  isUpvotedByUser: boolean;
  isDownvotedByUser: boolean;
  userReactions: ReactionType[];
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string | null;
  anonymousName: string;
  isAnonymous: boolean;
  upvotes: number;
  createdAt: string;
  replies: Comment[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isIcebreaker?: boolean;
  type: 'text' | 'icebreaker' | 'system' | 'reveal-request' | 'reaction';
  delivered?: boolean;
}

export interface AnonMatch {
  id: string;
  peerId: string;
  peerPseudonym: string;
  peerEmoji: string;
  matchedAt: string;
  interestTags: string[];
  messages: ChatMessage[];
  status: MatchStatus;
  revealRequestSent: boolean;
  revealRequestReceived: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'hobby' | 'campus-life' | 'sports';
  coverGradient: string;
  icon: string;
  memberCount: number;
  isJoined: boolean;
  isPrivate: boolean;
  tags: string[];
  recentMessages: GroupMessage[];
  pinnedAnnouncement: string | null;
  upcomingEvent: string | null;
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  date: string;
  location: string;
  organizer: string;
  rsvpCount: number;
  interestedCount: number;
  userRsvp: RSVPStatus;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  coverGradient: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  matchId: string;
  sentAt: string;
}

export interface DirectConversation {
  id: string;
  participantId: string;
  isAnonymous?: boolean;
  peerPseudonym?: string;
  peerEmoji?: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'upvote' | 'comment' | 'friend-request' | 'match' | 'group-invite' | 'announcement' | 'poll' | 'confession';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// ── Polls & Hot Takes ───────────────────────────────────────
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId: string | null;
  createdBy: string;
  creatorName: string;
  expiresAt: string;
  createdAt: string;
  isHotTake?: boolean;
  category: 'academic' | 'campus-life' | 'mess-food' | 'general' | 'drama';
  commentsCount: number;
}

// ── Anonymous Confessions & Secrets ─────────────────────────
export interface Confession {
  id: string;
  content: string;
  pseudonym: string;
  emoji: string;
  upvotes: number;
  downvotes: number;
  reactions: Record<string, number>;
  userReaction?: string | null;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  commentsCount: number;
  createdAt: string;
  college?: string;
  tags: string[];
  isFlagged?: boolean;
}

// Navigation
export type NavTab = 'feed' | 'polls' | 'confessions' | 'match' | 'groups' | 'bulletin' | 'messages' | 'admin';

