// ============================================================
// Post Card Component — Clean Lucide Icons & Responsive Design
// ============================================================

import { useState } from 'react';
import {
  ArrowBigUp, ArrowBigDown, MessageCircle, Share2,
  Ghost, BookOpen, Search, Zap, Megaphone, Smile, User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POST_CATEGORIES, USERS, CURRENT_USER } from '../../data/mockData';
import type { Post, PostCategory } from '../../types';

function getCategoryIcon(cat: PostCategory) {
  switch (cat) {
    case 'confession': return <Ghost size={13} />;
    case 'study': return <BookOpen size={13} />;
    case 'lost-found': return <Search size={13} />;
    case 'campus-vibe': return <Zap size={13} />;
    case 'event': return <Megaphone size={13} />;
    case 'meme': return <Smile size={13} />;
    default: return <Ghost size={13} />;
  }
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface PostCardProps {
  post: Post;
  style?: React.CSSProperties;
}

export default function PostCard({ post, style }: PostCardProps) {
  const { dispatch } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const category = POST_CATEGORIES[post.category] || POST_CATEGORIES['confession'];
  const author = post.isAnonymous
    ? null
    : (post.authorId === CURRENT_USER.id ? CURRENT_USER : USERS.find(u => u.id === post.authorId));

  const netVotes = post.upvotes - post.downvotes;

  const handleComment = () => {
    if (!commentText.trim()) return;
    dispatch({
      type: 'ADD_COMMENT',
      payload: { postId: post.id, content: commentText, isAnonymous: false },
    });
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <article className="post-card" style={style}>
      {/* Header */}
      <div className="post-header">
        <div
          className="post-avatar"
          style={{ background: post.isAnonymous ? category.color + '15' : 'var(--accent-bg-strong)', color: post.isAnonymous ? category.color : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {post.isAnonymous ? <Ghost size={18} /> : <User size={18} />}
        </div>
        <div className="post-meta">
          <div className="post-author">
            {post.isAnonymous ? post.anonymousName : (author?.displayName || 'Student')}
            {post.isAnonymous && <span className="anon-badge">Anonymous</span>}
          </div>
          <div className="post-timestamp">{timeAgo(post.createdAt)}</div>
        </div>
        <span
          className="post-category-tag"
          style={{ background: category.color + '15', color: category.color, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', fontWeight: 600 }}
        >
          {getCategoryIcon(post.category)} {category.label}
        </span>
      </div>

      {/* Content */}
      <p className="post-content">{post.content}</p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map(tag => (
            <span key={tag} className="post-tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        {/* Upvote */}
        <button
          className={`post-action-btn ${post.isUpvotedByUser ? 'upvoted' : ''}`}
          onClick={() => dispatch({ type: 'UPVOTE_POST', payload: post.id })}
          title="Upvote"
        >
          <ArrowBigUp size={18} />
        </button>

        <span className="vote-count" style={{
          color: netVotes > 0 ? 'var(--accent)' : netVotes < 0 ? 'var(--color-error)' : 'var(--text-tertiary)',
        }}>
          {netVotes}
        </span>

        {/* Downvote */}
        <button
          className={`post-action-btn ${post.isDownvotedByUser ? 'downvoted' : ''}`}
          onClick={() => dispatch({ type: 'DOWNVOTE_POST', payload: post.id })}
          title="Downvote"
        >
          <ArrowBigDown size={18} />
        </button>

        <div className="post-action-divider" />

        {/* Comment Toggle */}
        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <MessageCircle size={16} />
          <span style={{ fontSize: '0.78rem' }}>{post.comments?.length || 0}</span>
        </button>

        {/* Share */}
        <button
          className="post-action-btn"
          onClick={handleShare}
          title="Share Pulse"
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Share2 size={16} />
          {copiedLink && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>Copied!</span>}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12, marginTop: 12 }}>
          {/* Input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="comment-input"
              placeholder="Write a supportive reply..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
            />
            <button
              className="btn btn-primary btn-sm btn-pill"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              Reply
            </button>
          </div>

          {/* Comment List */}
          {post.comments && post.comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {post.comments.map(c => (
                <div key={c.id} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.isAnonymous ? c.anonymousName : 'Student'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '8px 0' }}>
              No comments yet. Start the conversation!
            </div>
          )}
        </div>
      )}
    </article>
  );
}
