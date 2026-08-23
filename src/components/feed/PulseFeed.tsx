// ============================================================
// Pulse Feed Page — Premium Consumer-Grade Campus Stream
// ============================================================

import { useState } from 'react';
import {
  Sparkles, RefreshCw, Flame, TrendingUp, Ghost, Zap,
  BookOpen, Smile, Search, Megaphone, Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseService } from '../../services/supabaseService';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';

const FILTER_CHIPS = [
  { id: 'all', label: 'All', icon: Flame },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'confession', label: 'Confessions', icon: Ghost },
  { id: 'campus-vibe', label: 'Campus Vibes', icon: Zap },
  { id: 'study', label: 'Study & Doubts', icon: BookOpen },
  { id: 'meme', label: 'Memes & Fun', icon: Smile },
  { id: 'lost-found', label: 'Lost & Found', icon: Search },
  { id: 'event', label: 'Events', icon: Megaphone },
];

export default function PulseFeed() {
  const { state, dispatch } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshFeed = async () => {
    setIsRefreshing(true);
    const livePosts = await SupabaseService.fetchPosts();
    if (livePosts.length > 0) {
      dispatch({ type: 'SET_POSTS', payload: livePosts });
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredPosts = state.posts.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'trending') return p.upvotes > 15 || p.comments.length > 0;
    return p.category === activeFilter;
  });

  const currentUser = state.currentUser;

  return (
    <div className="feed-container">
      {/* ── Top Header ────────────────────────────────────── */}
      <div className="feed-hero-header">
        <div className="feed-hero-text">
          <div className="feed-hero-title-row">
            <h1 className="feed-hero-title">Pulse Feed</h1>
            <button
              className={`feed-sync-btn ${isRefreshing ? 'spinning' : ''}`}
              onClick={handleRefreshFeed}
              disabled={isRefreshing}
              title="Sync Live Stream"
            >
              <RefreshCw size={15} />
              <span>{isRefreshing ? 'Syncing' : 'Live Sync'}</span>
            </button>
          </div>
          <p className="feed-hero-subtitle">
            Realtime campus thoughts, anonymous confessions & updates.
          </p>
        </div>

        {/* ── Category Filter Pills ─────────────────────────── */}
        <div className="feed-filter-scroll">
          {FILTER_CHIPS.map(chip => {
            const Icon = chip.icon;
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                className={`filter-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveFilter(chip.id)}
              >
                <Icon size={14} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sleek Composer Card ───────────────────────────── */}
      <div
        className="feed-composer-card"
        onClick={() => dispatch({ type: 'TOGGLE_CREATE_POST' })}
      >
        <div className="composer-avatar">
          {currentUser?.avatar || '🎓'}
        </div>
        <div className="composer-input-fake">
          <span>What's happening on campus?</span>
        </div>
        <button className="composer-action-btn">
          <Plus size={16} />
          <span>Post</span>
        </button>
      </div>

      {/* ── Posts Stream ──────────────────────────────────── */}
      <div className="feed-stream">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <PostCard key={post.id} post={post} style={{ animationDelay: `${i * 0.04}s` }} />
          ))
        ) : (
          <div className="feed-empty-state">
            <div className="feed-empty-icon">
              <Sparkles size={28} />
            </div>
            <h3>No pulses in this category yet</h3>
            <p>Be the first student to drop a confession or thought!</p>
            <button
              className="btn btn-primary btn-pill"
              onClick={() => dispatch({ type: 'TOGGLE_CREATE_POST' })}
              style={{ marginTop: 14 }}
            >
              <Plus size={16} /> Create First Pulse
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {state.showCreatePost && <CreatePostModal />}
    </div>
  );
}
