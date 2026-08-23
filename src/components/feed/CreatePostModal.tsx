// ============================================================
// Create Post Modal
// ============================================================

import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POST_CATEGORIES } from '../../data/mockData';
import type { PostCategory } from '../../types';

export default function CreatePostModal() {
  const { dispatch } = useApp();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('confession');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const t = tagInput.trim().replace('#', '');
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    dispatch({
      type: 'ADD_POST',
      payload: { content, category, tags, isAnonymous },
    });
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'TOGGLE_CREATE_POST' })}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create a Pulse</span>
          <button className="icon-btn" onClick={() => dispatch({ type: 'TOGGLE_CREATE_POST' })}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Anonymous Toggle */}
          <div className="form-group">
            <div className="form-row">
              <label className="form-label" style={{ margin: 0 }}>
                {isAnonymous ? <><EyeOff size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Post Anonymously</> : <><Eye size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Post as Yourself</>}
              </label>
              <button
                className={`toggle ${isAnonymous ? 'active' : ''}`}
                onClick={() => setIsAnonymous(!isAnonymous)}
              />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              {isAnonymous ? 'Your identity will be hidden. A fun pseudonym will be assigned.' : 'Your name and avatar will be visible.'}
            </p>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(POST_CATEGORIES).map(([key, val]) => (
                <button
                  key={key}
                  className={`chip ${category === key ? 'active' : ''}`}
                  onClick={() => setCategory(key as PostCategory)}
                >
                  {val.icon} {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label">What's on your mind?</label>
            <textarea
              className="textarea"
              placeholder="Share a confession, ask a question, or spread the vibes..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                className="comment-input"
                placeholder="Add a tag (e.g. HostelLife)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                style={{ borderRadius: 'var(--radius-md)' }}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleAddTag}>Add</button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map(t => (
                  <span key={t} className="post-tag" onClick={() => setTags(tags.filter(x => x !== t))} style={{ cursor: 'pointer' }}>
                    #{t} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'TOGGLE_CREATE_POST' })}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-pill"
            onClick={handleSubmit}
            disabled={!content.trim()}
            style={{ opacity: content.trim() ? 1 : 0.5 }}
          >
            🚀 Publish Pulse
          </button>
        </div>
      </div>
    </div>
  );
}
