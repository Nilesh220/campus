// ============================================================
// Pulse Feed Page
// ============================================================

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';

const FILTER_CHIPS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'confession', label: 'Confessions' },
  { id: 'study', label: 'Study' },
  { id: 'campus-vibe', label: 'Campus Vibe' },
  { id: 'lost-found', label: 'Lost & Found' },
  { id: 'meme', label: 'Memes' },
  { id: 'event', label: 'Events' },
];

export default function PulseFeed() {
  const { state, dispatch } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredPosts = state.posts.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'trending') return p.upvotes > 300;
    return p.category === activeFilter;
  });

  return (
    <div className="app-content">
      {/* Header */}
      <div className="feed-header">
        <h1 className="feed-title">Pulse Feed</h1>
        <p className="feed-subtitle">See what's buzzing on campus. Post anonymously or be yourself!</p>

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
        <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '1rem', background: 'var(--accent)', color: 'white' }}>
          <Plus size={18} />
        </div>
        <span className="placeholder-text">Share what's on your mind...</span>
        <span className="btn btn-primary btn-sm btn-pill">Post</span>
      </button>

      {/* Posts */}
      <div className="post-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <PostCard key={post.id} post={post} style={{ animationDelay: `${i * 0.05}s` }} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No posts yet</div>
            <div className="empty-state-desc">Be the first to share something in this category!</div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {state.showCreatePost && <CreatePostModal />}
    </div>
  );
}
