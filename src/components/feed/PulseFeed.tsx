import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseService } from '../../services/supabaseService';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';

const FILTER_CHIPS: { id: string; label: string }[] = [
  { id: 'all', label: '🔥 All' },
  { id: 'trending', label: '⚡ Trending' },
  { id: 'confession', label: '🎭 Confessions' },
  { id: 'campus-vibe', label: '✨ Campus Vibes' },
  { id: 'study', label: '📚 Study & Doubts' },
  { id: 'meme', label: '😂 Memes' },
  { id: 'lost-found', label: '🔍 Lost & Found' },
  { id: 'event', label: '📢 Events' },
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
    if (activeFilter === 'trending') return p.upvotes > 20 || p.comments.length > 0;
    return p.category === activeFilter;
  });

  return (
    <div className="app-content">
      {/* Header */}
      <div className="feed-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="feed-title">Pulse Feed 🔥</h1>
            <p className="feed-subtitle">Real-time campus chatter. Spill the tea anonymously or rep your profile! ✨</p>
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

        <div className="feed-filters">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.id}
              className={`chip ${activeFilter === chip.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post Trigger */}
      <button
        className="create-post-trigger"
        onClick={() => dispatch({ type: 'TOGGLE_CREATE_POST' })}
      >
        <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '1rem', background: 'linear-gradient(135deg, #C4956A 0%, #A78BCA 100%)', color: 'white' }}>
          <Plus size={18} />
        </div>
        <span className="placeholder-text">Spill the tea ☕, drop a confession, or vibe...</span>
        <span className="btn btn-primary btn-sm btn-pill">Post Pulse</span>
      </button>

      {/* Posts */}
      <div className="post-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <PostCard key={post.id} post={post} style={{ animationDelay: `${i * 0.05}s` }} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">✨</div>
            <div className="empty-state-title">No pulses yet in this category</div>
            <div className="empty-state-desc">Be the main character and share the first pulse! 🚀</div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {state.showCreatePost && <CreatePostModal />}
    </div>
  );
}
