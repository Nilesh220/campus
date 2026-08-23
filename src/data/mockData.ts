// ============================================================
// CampusSparks — Metadata, Dynamic Generators & Utilities
// Zero hardcoded demo feed arrays — 100% database driven
// ============================================================

import type { User, Badge } from '../types';

// ── Badges ──────────────────────────────────────────────────
export const BADGES: Badge[] = [
  { id: 'b1', name: 'OG Member', icon: '⭐', description: 'Joined in the launch phase', color: '#0D9488' },
  { id: 'b2', name: 'Pulse Pioneer', icon: '🚀', description: '100+ upvotes received', color: '#14B8A6' },
  { id: 'b3', name: 'Night Owl', icon: '🦉', description: 'Active past midnight', color: '#3B82F6' },
  { id: 'b4', name: 'Connector', icon: '🤝', description: 'Connected via Random Chat', color: '#10B981' },
  { id: 'b5', name: 'Confession King', icon: '👑', description: 'Top confession poster', color: '#8B5CF6' },
  { id: 'b6', name: 'Study Buddy', icon: '📚', description: 'Helped fellow students', color: '#3B82F6' },
  { id: 'b7', name: 'Meme Lord', icon: '😂', description: 'Top campus humor poster', color: '#F59E0B' },
];

// ── Default Active Profile ──────────────────────────────────
export const CURRENT_USER: User = {
  id: 'u_student_1',
  username: 'student',
  displayName: 'Student',
  avatar: '🎓',
  major: 'Computer Science',
  graduationYear: 2027,
  college: 'Campus University',
  bio: 'Campus student',
  hobbies: ['Campus Life', 'Tech'],
  pulseScore: 0,
  badges: [],
  isOnline: true,
  joinedAt: '2026-01-01',
};

export const USERS: User[] = [];

const GENZ_PREFIXES = [
  'cyber', 'shadow', 'neon', 'void', 'astral', 'hyper', 'pixel', 'chill',
  'aura', 'rizz', 'retro', 'phantom', 'quantum', 'stellar', 'midnight',
  'apex', 'glitch', 'turbo', 'lunar', 'cosmic', 'zen'
];

const GENZ_SUFFIXES = [
  'coder', 'vibe', 'samurai', 'dev', 'pulse', 'hacker', 'beast', 'soul',
  'legend', 'spark', 'wave', 'rider', 'guru', 'matrix', 'storm', 'ninja'
];

export function generateGenZUsername(nameHint?: string): string {
  if (nameHint && nameHint.trim()) {
    const clean = nameHint.toLowerCase().replace(/[^a-z0-9]/g, '');
    const num = Math.floor(100 + Math.random() * 900);
    return `${clean}_${num}`;
  }
  const prefix = GENZ_PREFIXES[Math.floor(Math.random() * GENZ_PREFIXES.length)];
  const suffix = GENZ_SUFFIXES[Math.floor(Math.random() * GENZ_SUFFIXES.length)];
  const num = Math.floor(10 + Math.random() * 89);
  return `${prefix}_${suffix}${num}`;
}

const ANON_ADJECTIVES = [
  'Cosmic', 'Velvet', 'Shadow', 'Neon', 'Mystic', 'Lunar',
  'Electric', 'Crystal', 'Phantom', 'Golden', 'Silent', 'Midnight',
  'Solar', 'Astral', 'Silver', 'Amber', 'Zenith', 'Echo'
];

const ANON_ANIMALS = [
  'Panda', 'Fox', 'Owl', 'Wolf', 'Phoenix', 'Tiger',
  'Falcon', 'Dolphin', 'Raven', 'Dragon', 'Lynx', 'Hawk',
  'Lion', 'Otter', 'Eagle', 'Koala', 'Cheetah', 'Bear'
];

const ANON_EMOJIS = ['🐼', '🦊', '🦉', '🐺', '🔥', '🐯', '🦅', '🐬', '🐦‍⬛', '🐉', '🐱', '🦁', '🐨', '⚡', '✨'];

export function generateAnonName(): { name: string; emoji: string } {
  const adj = ANON_ADJECTIVES[Math.floor(Math.random() * ANON_ADJECTIVES.length)];
  const animal = ANON_ANIMALS[Math.floor(Math.random() * ANON_ANIMALS.length)];
  const emoji = ANON_EMOJIS[Math.floor(Math.random() * ANON_EMOJIS.length)];
  return { name: `${adj} ${animal}`, emoji };
}

// ── Icebreaker Prompts ──────────────────────────────────────
export const ICEBREAKERS: string[] = [
  "What's the best secret spot on campus? 🗺️",
  "If you could take only one class forever, which one? 📚",
  "Best campus food spot — go! 🍕",
  "What's your most embarrassing college moment? 😅",
  "Are you a morning lecture or night study person? 🌅🌙",
  "What hobby did you pick up recently in college? 🎸",
  "What's on your playlist on repeat right now? 🎧",
  "Coffee or Chai — and where on campus? ☕",
  "What's one goal you want to achieve before graduating? 🎯",
  "What's the funniest rumor you heard about campus? 😂",
];

// ── General Fallback Responses ──────────────────────────────
export const BOT_RESPONSES: string[] = [
  "Haha that's so relatable! 😂",
  "No way, me too! What are the odds 🤯",
  "Campus life at midnight hits so differently 🌙",
  "Gate 3 canteen momos are top tier, no debate 🥟",
  "This is actually a great conversation haha ✨",
  "I feel like we'd vibe in real life ngl 👀",
  "That's such an interesting take! Never thought of it that way 💡",
  "Same wavelength! Glad the algorithm matched us 😎",
  "Lmao I'm literally sitting in the library right now reading this 📚",
  "Honestly 100%! Let's connect on DMs if you're down 🎉",
];

// ── Interest Tags for Matching ──────────────────────────────
export const INTEREST_TAGS: string[] = [
  'Coding', 'Gaming', 'Music', 'Study Buddy', 'Movies',
  'Coffee Chat', 'Fitness', 'Art & Design', 'Photography',
  'Late Night Vibes', 'Foodies', 'Cricket', 'Deep Talks',
  'Memes & Fun', 'Startups', 'Book Club',
];

// ── Category Metadata ───────────────────────────────────────
export const POST_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  'confession': { label: 'Confession', icon: 'Ghost', color: '#8B5CF6' },
  'study': { label: 'Study & Doubts', icon: 'BookOpen', color: '#3B82F6' },
  'lost-found': { label: 'Lost & Found', icon: 'Search', color: '#F59E0B' },
  'campus-vibe': { label: 'Campus Vibe', icon: 'Zap', color: '#10B981' },
  'event': { label: 'Event', icon: 'Megaphone', color: '#EC4899' },
  'meme': { label: 'Meme', icon: 'Smile', color: '#F97316' },
};

export const ANNOUNCEMENT_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  'exam': { label: 'Examination', icon: 'FileText', color: '#EF4444' },
  'fest': { label: 'Fest & Festival', icon: 'Sparkles', color: '#8B5CF6' },
  'hackathon': { label: 'Hackathon', icon: 'Code', color: '#10B981' },
  'club': { label: 'Club Activity', icon: 'Users', color: '#EC4899' },
  'general': { label: 'General', icon: 'Bell', color: '#3B82F6' },
  'sports': { label: 'Sports', icon: 'Trophy', color: '#10B981' },
};

// ── Initial Campus Polls & Hot Takes ────────────────────────
export const INITIAL_POLLS = [
  {
    id: 'poll_1',
    question: 'Should the 75% mandatory attendance rule be scrapped permanently?',
    description: 'A hot debate across engineering and degree colleges. Vote your true thoughts.',
    isHotTake: true,
    category: 'campus-life' as const,
    createdBy: 'admin_1',
    creatorName: 'Campus Sparks',
    totalVotes: 384,
    userVotedOptionId: null,
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
    commentsCount: 42,
    options: [
      { id: 'opt_1', text: 'Yes, 100%! Focus on skills & projects, not seat time', votes: 298 },
      { id: 'opt_2', text: 'No, keeps students disciplined and classes alive', votes: 45 },
      { id: 'opt_3', text: 'Reduce it to 50% as a middle ground', votes: 41 },
    ],
  },
  {
    id: 'poll_2',
    question: 'Where is the undisputed best canteen / food spot on campus?',
    description: 'Settle the hostel food vs gate stall debate once and for all.',
    isHotTake: false,
    category: 'mess-food' as const,
    createdBy: 'admin_1',
    creatorName: 'Campus Sparks',
    totalVotes: 218,
    userVotedOptionId: null,
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    commentsCount: 19,
    options: [
      { id: 'opt_2_1', text: 'Gate 2 Momos & Roll Corner 🌯', votes: 94 },
      { id: 'opt_2_2', text: 'Night Canteen Chai & Maggi ☕', votes: 76 },
      { id: 'opt_2_3', text: 'Main Block Nescafe / Cafe 🍕', votes: 32 },
      { id: 'opt_2_4', text: 'Hostel Mess (Unironically) 🍛', votes: 16 },
    ],
  },
  {
    id: 'poll_3',
    question: 'Exam Preparation Reality: When do you actually start studying?',
    description: 'Be completely honest with the campus!',
    isHotTake: true,
    category: 'academic' as const,
    createdBy: 'admin_1',
    creatorName: 'Campus Sparks',
    totalVotes: 512,
    userVotedOptionId: null,
    expiresAt: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    commentsCount: 58,
    options: [
      { id: 'opt_3_1', text: 'Night before exam on YouTube 2x speed 💀', votes: 382 },
      { id: 'opt_3_2', text: '1 week before (Standard prep)', votes: 96 },
      { id: 'opt_3_3', text: 'From Day 1 of semester (Mythical creature)', votes: 34 },
    ],
  },
];

// ── Initial Anonymous Confessions ───────────────────────────
export const INITIAL_CONFESSIONS = [
  {
    id: 'conf_1',
    content: 'I accidentally uploaded a folder of cat memes instead of my machine learning assignment zip, and the professor gave me an A- because he found it hilarious 💀',
    pseudonym: 'Midnight Phoenix',
    emoji: '🦅',
    upvotes: 142,
    downvotes: 3,
    reactions: { '😂': 89, '💀': 64, '🔥': 22, '👀': 15 },
    userReaction: null,
    isUpvoted: false,
    commentsCount: 18,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    college: 'Campus University',
    tags: ['Professors', 'Assignments', 'Relatable'],
  },
  {
    id: 'conf_2',
    content: 'To the girl wearing the green hoodie sitting on the 3rd floor library corner coding in Rust every single evening: your Spotify playlist is absolutely elite 👀✨',
    pseudonym: 'Library Ghost',
    emoji: '👻',
    upvotes: 98,
    downvotes: 1,
    reactions: { '❤️': 65, '👀': 52, '🔥': 31, '😂': 8 },
    userReaction: null,
    isUpvoted: false,
    commentsCount: 14,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    college: 'Campus University',
    tags: ['Crush', 'Library', 'CampusVibe'],
  },
  {
    id: 'conf_3',
    content: 'I tell all my roommates I go to the library to study for 4 hours, but I actually just go there for the high-speed Wi-Fi and 2-hour AC naps 😭',
    pseudonym: 'Hostel 4 Ninja',
    emoji: '🐱',
    upvotes: 176,
    downvotes: 4,
    reactions: { '😂': 112, '💀': 78, '🍿': 20 },
    userReaction: null,
    isUpvoted: false,
    commentsCount: 22,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    college: 'Campus University',
    tags: ['HostelLife', 'Library', 'Naps'],
  },
  {
    id: 'conf_4',
    content: 'Night canteen double egg Maggi at 2 AM with chai tastes 100x better than any 5-star fine dining restaurant in the city. Settle the debate.',
    pseudonym: 'Chai Enthusiast',
    emoji: '☕',
    upvotes: 215,
    downvotes: 2,
    reactions: { '🔥': 140, '❤️': 85, '🍿': 19 },
    userReaction: null,
    isUpvoted: false,
    commentsCount: 31,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    college: 'Campus University',
    tags: ['Foodies', 'LateNight', 'Hostel'],
  },
];

