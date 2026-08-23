// ============================================================
// Post Card Component
// ============================================================

import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POST_CATEGORIES, USERS, CURRENT_USER } from '../../data/mockData';
import type { Post, ReactionType } from '../../types';

const REACTIONS: ReactionType[] = ['🔥', '💀', '❤️', '💡', '😭', '😂'];

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

  const category = POST_CATEGORIES[post.category];
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

  return (
    <article className="post-card" style={style}>
      {/* Header */}
      <div className="post-header">
        <div
          className="post-avatar"
          style={{ background: post.isAnonymous ? category.color + '15' : 'var(--accent-bg-strong)' }}
        >
          {post.isAnonymous ? post.anonymousEmoji : author?.avatar}
        </div>
        <div className="post-meta">
          <div className="post-author">
            {post.isAnonymous ? post.anonymousName : author?.displayName}
            {post.isAnonymous && <span className="anon-badge">Anonymous</span>}
          </div>
          <div className="post-timestamp">{timeAgo(post.createdAt)}</div>
        </div>
        <span
          className="post-category-tag"
          style={{ background: category.color + '15', color: category.color }}
        >
          {category.icon} {category.label}
        </span>
      </div>

      {/* Content */}
      <p className="post-content">{post.content}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
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
        >
          <ArrowBigDown size={18} />
        </button>

        {/* Comment */}
        <button
          className={`post-action-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>{post.comments.length}</span>
        </button>

        {/* Share */}
        <button className="post-action-btn">
          <Share2 size={18} />
        </button>

        {/* Reactions */}
        <div className="reaction-bar">
          {REACTIONS.map(r => (
            <button
              key={r}
              className={`reaction-btn ${post.userReactions.includes(r) ? 'reacted' : ''}`}
              onClick={() => dispatch({ type: 'REACT_TO_POST', payload: { postId: post.id, reaction: r } })}
            >
              <span>{r}</span>
              {post.reactions[r] > 0 && (
                <span className="reaction-count">{post.reactions[r]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {post.comments.map(comment => {
            const commentAuthor = comment.isAnonymous
              ? null
              : (comment.authorId === CURRENT_USER.id ? CURRENT_USER : USERS.find(u => u.id === comment.authorId));
            return (
              <div key={comment.id}>
                <div className="comment-item">
                  <div className="comment-avatar">
                    {comment.isAnonymous ? '🎭' : commentAuthor?.avatar || '👤'}
                  </div>
                  <div className="comment-body">
                    <div className="comment-author">
                      {comment.isAnonymous ? comment.anonymousName : commentAuthor?.displayName || 'Unknown'}
                      {comment.isAnonymous && (
                        <span style={{
                          fontSize: '0.65rem', padding: '1px 6px',
                          borderRadius: 'var(--radius-pill)', background: 'var(--accent-bg)',
                          color: 'var(--accent)', marginLeft: 6, fontWeight: 600,
                        }}>Anon</span>
                      )}
                    </div>
                    <div className="comment-text">{comment.content}</div>
                    <div className="comment-meta">
                      <span>{timeAgo(comment.createdAt)}</span>
                      <span>▲ {comment.upvotes}</span>
                      <button style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>Reply</button>
                    </div>
                  </div>
                </div>
                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map(reply => {
                      const replyAuthor = reply.isAnonymous
                        ? null
                        : (reply.authorId === CURRENT_USER.id ? CURRENT_USER : USERS.find(u => u.id === reply.authorId));
                      return (
                        <div key={reply.id} className="comment-item">
                          <div className="comment-avatar">
                            {reply.isAnonymous ? '🎭' : replyAuthor?.avatar || '👤'}
                          </div>
                          <div className="comment-body">
                            <div className="comment-author">
                              {reply.isAnonymous ? reply.anonymousName : replyAuthor?.displayName || 'Unknown'}
                            </div>
                            <div className="comment-text">{reply.content}</div>
                            <div className="comment-meta">
                              <span>{timeAgo(reply.createdAt)}</span>
                              <span>▲ {reply.upvotes}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Comment */}
          <div className="comment-input-wrapper">
            <div className="comment-avatar" style={{ background: 'var(--accent-bg-strong)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              {CURRENT_USER.avatar}
            </div>
            <input
              type="text"
              className="comment-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
            />
            <button
              className="btn btn-primary btn-sm btn-pill"
              onClick={handleComment}
              disabled={!commentText.trim()}
              style={{ opacity: commentText.trim() ? 1 : 0.5 }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
