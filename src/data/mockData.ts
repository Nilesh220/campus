// ============================================================
// UniPulse — Metadata, Bot Personalities & Utilities
// Zero hardcoded demo feed arrays — 100% database driven
// ============================================================

import type { User, Badge } from '../types';

// ── Badges ──────────────────────────────────────────────────
export const BADGES: Badge[] = [
  { id: 'b1', name: 'OG Member', icon: '⭐', description: 'Joined in the launch phase', color: '#C4956A' },
  { id: 'b2', name: 'Pulse Pioneer', icon: '🚀', description: '100+ upvotes received', color: '#5BB5A2' },
  { id: 'b3', name: 'Night Owl', icon: '🦉', description: 'Active past midnight', color: '#5B8EC9' },
  { id: 'b4', name: 'Connector', icon: '🤝', description: 'Connected via Random Chat', color: '#4A9E7F' },
  { id: 'b5', name: 'Confession King', icon: '👑', description: 'Top confession poster', color: '#C77D8A' },
  { id: 'b6', name: 'Study Buddy', icon: '📚', description: 'Helped fellow students', color: '#5B8EC9' },
  { id: 'b7', name: 'Meme Lord', icon: '😂', description: 'Top campus humor poster', color: '#C4956A' },
];

// ── Default Active Profile ──────────────────────────────────
export const CURRENT_USER: User = {
  id: 'u1',
  username: 'campus_student',
  displayName: 'Student Pulse',
  avatar: '🎓',
  major: 'Computer Science',
  graduationYear: 2027,
  college: 'Campus University',
  bio: 'Building, learning & exploring campus life ☕',
  hobbies: ['Coding', 'Gaming', 'Coffee', 'Design'],
  pulseScore: 1240,
  badges: [BADGES[0], BADGES[1]],
  isOnline: true,
  joinedAt: '2026-01-10',
};

// ── Dynamic Bot Personalities for Random Chat ───────────────
export interface BotPeer {
  id: string;
  name: string;
  major: string;
  emoji: string;
  persona: string;
  responses: string[];
}

export const BOT_PEERS: BotPeer[] = [
  {
    id: 'bot_cs',
    name: 'Neon Coder',
    major: 'Computer Science',
    emoji: '💻',
    persona: 'DSA nerd, hackathon enthusiast, always caffeinated',
    responses: [
      "Haha totally! Currently debugging a React hook at 2 AM 😭",
      "Are you preparing for placements / internships too?",
      "Bro the Wi-Fi in the lab went down right in the middle of a push 💀",
      "Which language do you code in mainly? Python or TS?",
      "Honestly coffee is the only thing keeping my GPA alive ☕",
      "That's awesome! We should team up for the next hackathon 🔥",
      "Lmao yes! DP problems give me existential dread 🥲",
      "Gotta love when the code works and you have no idea why 🚀",
    ],
  },
  {
    id: 'bot_art',
    name: 'Velvet Artist',
    major: 'Design & Visual Media',
    emoji: '🎨',
    persona: 'Figma addict, aesthetic lover, chai drinker',
    responses: [
      "No way, I love that aesthetic! ✨",
      "I'm actually working on a typography project right now 🎨",
      "Chai from Gate 2 canteen hits so differently during rain ☕🌧️",
      "What music do you listen to while working? Need playlist recs!",
      "The architecture of the new library wing is honestly stunning 🏛️",
      "Haha that's so accurate! Design deadlines are wild 😭",
      "I swear Figma components have taken over my brain lol",
    ],
  },
  {
    id: 'bot_music',
    name: 'Lunar Beats',
    major: 'Music & Sound Engineering',
    emoji: '🎵',
    persona: 'Lo-fi producer, guitarist, late night vibe',
    responses: [
      "Yo! Just finished laying down a new guitar loop 🎸",
      "Are you going to the Open Mic this Friday at the amphitheater?",
      "That track you mentioned is fire 🔥 on repeat today",
      "Late night study playlist with lo-fi beats is pure therapy 🌙",
      "Hostel acoustic sessions hit so different at midnight ✨",
      "Haha true! The echo in the hostel staircase is studio quality 😂",
    ],
  },
  {
    id: 'bot_sports',
    name: 'Golden Runner',
    major: 'Sports Science',
    emoji: '⚡',
    persona: 'Gym early bird, cricket fan, high energy',
    responses: [
      "5 AM gym session was legendary today! 💪",
      "Who's watching the inter-hostel match this weekend? 🏏",
      "Mess food today was actually edible for once, miracle! 🤯",
      "Sports complex badminton courts are packed every evening 🏸",
      "Energy is everything on campus! Let's crush this semester 🔥",
    ],
  },
];

export const USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u2',
    username: 'priya_creates',
    displayName: 'Priya Patel',
    avatar: '🎨',
    major: 'Design & Visual Arts',
    graduationYear: 2026,
    college: 'Campus University',
    bio: 'UI/UX dreamer 🎨 | Chai > Coffee',
    hobbies: ['Design', 'Photography', 'Art'],
    pulseScore: 980,
    badges: [BADGES[0], BADGES[4]],
    isOnline: true,
    joinedAt: '2026-01-15',
  },
  {
    id: 'u3',
    username: 'rahul_beats',
    displayName: 'Rahul Verma',
    avatar: '🎸',
    major: 'Music Production',
    graduationYear: 2027,
    college: 'Campus University',
    bio: 'Guitar + Lo-fi beats 🎵',
    hobbies: ['Music', 'Skateboarding'],
    pulseScore: 760,
    badges: [BADGES[2], BADGES[3]],
    isOnline: false,
    joinedAt: '2026-02-01',
  },
];

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
  'confession': { label: 'Confession', icon: 'Ghost', color: '#A78BCA' },
  'study': { label: 'Study & Doubts', icon: 'BookOpen', color: '#5B8EC9' },
  'lost-found': { label: 'Lost & Found', icon: 'Search', color: '#C9943A' },
  'campus-vibe': { label: 'Campus Vibe', icon: 'Zap', color: '#4A9E7F' },
  'event': { label: 'Event', icon: 'Megaphone', color: '#C77D8A' },
  'meme': { label: 'Meme', icon: 'Smile', color: '#C4956A' },
};

export const ANNOUNCEMENT_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  'exam': { label: 'Examination', icon: 'FileText', color: '#C75C5C' },
  'fest': { label: 'Fest & Festival', icon: 'Sparkles', color: '#A78BCA' },
  'hackathon': { label: 'Hackathon', icon: 'Code', color: '#5BB5A2' },
  'club': { label: 'Club Activity', icon: 'Users', color: '#C77D8A' },
  'general': { label: 'General', icon: 'Bell', color: '#5B8EC9' },
  'sports': { label: 'Sports', icon: 'Trophy', color: '#4A9E7F' },
};
