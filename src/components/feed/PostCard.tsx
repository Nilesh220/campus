// ============================================================
// Post Card — Premium Social Feed Card (Threads / Reddit Style)
// ============================================================

import { useState } from 'react';
import {
  ArrowBigUp, ArrowBigDown, MessageCircle, Share2,
  Ghost, User, Flame, TrendingUp, Zap, BookOpen,
  Smile, Search, Megaphone, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POST_CATEGORIES, USERS } from '../../data/mockData';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
  style?: React.CSSProperties;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case 'confession': return <Ghost size={12} />;
    case 'campus-vibe': return <Zap size={12} />;
    case 'study': return <BookOpen size={12} />;
    case 'meme': return <Smile size={12} />;
    case 'lost-found': return <Search size={12} />;
    case 'event': return <Megaphone size={12} />;
    case 'trending': return <TrendingUp size={12} />;
    default: return <Flame size={12} />;
  }
}

export default function PostCard({ post, style }: PostCardProps) {
  const { dispatch } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const category = (POST_CATEGORIES as any)[post.category] || { label: 'General', color: '#5BB5A2', icon: 'Flame' };
  const author = USERS.find(u => u.id === post.authorId);
  const netVotes = post.upvotes - post.downvotes;

  const handleComment = () => {
    if (!commentText.trim()) return;
    dispatch({
      type: 'ADD_COMMENT',
      payload: {
        postId: post.id,
        content: commentText.trim(),
        isAnonymous: false,
      },
    });
    setCommentText('');
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(window.location.origin);
      }
    } catch (err) {
      console.warn('Clipboard notice:', err);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <article className="feed-post-card" style={style}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="feed-post-header">
        <div
          className="feed-post-avatar"
          style={{
            background: post.isAnonymous ? 'rgba(167, 139, 202, 0.15)' : 'var(--accent-bg-strong)',
            color: post.isAnonymous ? 'var(--cat-confession)' : 'var(--accent)',
          }}
        >
          {post.isAnonymous ? <Ghost size={20} /> : <User size={20} />}
        </div>

        <div className="feed-post-author-box">
          <div className="feed-post-name-row">
            <span className="feed-post-author-name">
              {post.isAnonymous ? post.anonymousName : (author?.displayName || 'Campus Student')}
            </span>
            {post.isAnonymous && (
              <span className="feed-anon-tag">Anonymous</span>
            )}
          </div>
          <span className="feed-post-time">{timeAgo(post.createdAt)}</span>
        </div>

        <span
          className="feed-category-pill"
          style={{
            background: `${category.color}15`,
            color: category.color,
            borderColor: `${category.color}30`,
          }}
        >
          {getCategoryIcon(post.category)}
          <span>{category.label}</span>
        </span>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="feed-post-body">
        <p>{post.content}</p>
      </div>

      {/* ── Tags ──────────────────────────────────────────── */}
      {post.tags && post.tags.length > 0 && (
        <div className="feed-post-tags">
          {post.tags.map(tag => (
            <span key={tag} className="feed-tag-pill">#{tag}</span>
          ))}
        </div>
      )}

      {/* ── Consolidated Action Bar ────────────────────────── */}
      <div className="feed-post-footer">
        {/* Vote Pill Container */}
        <div className="feed-vote-pill">
          <button
            className={`feed-vote-btn ${post.isUpvotedByUser ? 'active-up' : ''}`}
            onClick={() => dispatch({ type: 'UPVOTE_POST', payload: post.id })}
            title="Upvote"
          >
            <ArrowBigUp size={20} />
          </button>

          <span className={`feed-vote-count ${netVotes > 0 ? 'positive' : netVotes < 0 ? 'negative' : ''}`}>
            {netVotes}
          </span>

          <button
            className={`feed-vote-btn ${post.isDownvotedByUser ? 'active-down' : ''}`}
            onClick={() => dispatch({ type: 'DOWNVOTE_POST', payload: post.id })}
            title="Downvote"
          >
            <ArrowBigDown size={20} />
          </button>
        </div>

        {/* Comment Button */}
        <button
          className={`feed-footer-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={17} />
          <span>{post.comments?.length || 0}</span>
        </button>

        {/* Share Button */}
        <button
          className="feed-footer-btn share-btn"
          onClick={handleShare}
          title="Share Link"
        >
          {copiedLink ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Share2 size={16} />}
          <span>{copiedLink ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* ── Comments Drawer ─────────────────────────────────── */}
      {showComments && (
        <div className="feed-comments-box">
          <div className="feed-comment-input-row">
            <input
              type="text"
              placeholder="Drop a thought or reply..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              className="feed-comment-input"
            />
            <button
              className="btn btn-primary btn-sm btn-pill"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              Reply
            </button>
          </div>

          {post.comments && post.comments.length > 0 ? (
            <div className="feed-comments-list">
              {post.comments.map(c => {
                const commentAuthor = USERS.find(u => u.id === c.authorId);
                return (
                  <div key={c.id} className="feed-comment-item">
                    <div className="feed-comment-avatar">
                      {c.isAnonymous ? '👻' : '🎓'}
                    </div>
                    <div className="feed-comment-content">
                      <div className="feed-comment-header">
                        <span className="feed-comment-author">{c.isAnonymous ? 'Anonymous' : (commentAuthor?.displayName || 'Student')}</span>
                        <span className="feed-comment-time">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="feed-comment-text">{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="feed-comments-empty">No replies yet. Be the first to chime in!</div>
          )}
        </div>
      )}
    </article>
  );
}
