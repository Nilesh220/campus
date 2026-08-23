// ============================================================
// Pulse Feed Page — Clean Professional Campus Stream
// ============================================================

import { useState } from 'react';
import {
  Plus, RefreshCw, Flame, TrendingUp, Ghost, Zap,
  BookOpen, Smile, Search, Megaphone, Sparkles
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
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredPosts = state.posts.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'trending') return p.upvotes > 15 || p.comments.length > 0;
    return p.category === activeFilter;
  });

  return (
    <div className="app-content" style={{ maxWidth: 760, margin: '0 auto', padding: '16px 12px' }}>
      {/* Header */}
      <div className="feed-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="feed-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={24} style={{ color: 'var(--accent)' }} /> Pulse Feed
            </h1>
            <p className="feed-subtitle">Live campus chatter. Share anonymously or post from your profile.</p>
          </div>
          <button
            className="btn btn-secondary btn-sm btn-pill"
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            {isRefreshing ? 'Syncing...' : 'Live Sync'}
          </button>
        </div>

        <div className="feed-filters" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {FILTER_CHIPS.map(chip => {
            const Icon = chip.icon;
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                className={`chip ${isActive ? 'active' : ''}`}
                onClick={() => setActiveFilter(chip.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <Icon size={14} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Post Trigger */}
      <button
        className="create-post-trigger"
        onClick={() => dispatch({ type: 'TOGGLE_CREATE_POST' })}
        style={{ width: '100%', borderRadius: 'var(--radius-lg)' }}
      >
        <div className="user-avatar" style={{ width: 36, height: 36, background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} />
        </div>
        <span className="placeholder-text">Share a thought, confession, question, or vibe...</span>
        <span className="btn btn-primary btn-sm btn-pill hide-mobile">Publish Pulse</span>
      </button>

      {/* Posts */}
      <div className="post-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <PostCard key={post.id} post={post} style={{ animationDelay: `${i * 0.05}s` }} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Sparkles size={28} />
            </div>
            <div className="empty-state-title">No pulses yet in this category</div>
            <div className="empty-state-desc">Be the first student to publish a post in this category!</div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {state.showCreatePost && <CreatePostModal />}
    </div>
  );
}
