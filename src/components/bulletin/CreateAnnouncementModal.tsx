// ============================================================
// Create Announcement Modal — Campus Bulletin
// ============================================================

import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseService } from '../../services/supabaseService';
import type { Announcement } from '../../types';

const CATEGORIES = [
  { id: 'general', label: '📋 General' },
  { id: 'fest', label: '🎉 Fest' },
  { id: 'exam', label: '📝 Exam' },
  { id: 'hackathon', label: '💡 Hackathon' },
  { id: 'club', label: '🎤 Club' },
  { id: 'sports', label: '🏆 Sports' },
];

export default function CreateAnnouncementModal() {
  const { dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('general');
  const [location, setLocation] = useState('Campus');
  const [organizer, setOrganizer] = useState('Student Council');
  const [date, setDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  const handleAddTag = () => {
    const t = tagInput.trim().replace('#', '');
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    const payload: Partial<Announcement> = {
      title,
      description,
      category,
      location,
      organizer,
      date: new Date(date).toISOString(),
      tags,
      isPinned,
    };

    const created = await SupabaseService.createAnnouncement(payload);
    if (created) {
      dispatch({ type: 'ADD_ANNOUNCEMENT', payload: created });
    } else {
      dispatch({
        type: 'ADD_ANNOUNCEMENT',
        payload: {
          id: `a${Date.now()}`,
          title,
          description,
          category,
          date: new Date(date).toISOString(),
          location,
          organizer,
          rsvpCount: 0,
          interestedCount: 0,
          userRsvp: null,
          tags,
          isPinned,
          coverGradient: 'linear-gradient(135deg, #5B8EC9, #C4956A)',
          createdAt: new Date().toISOString(),
        },
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'TOGGLE_CREATE_ANNOUNCEMENT' })}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Post Campus Announcement</span>
          <button className="icon-btn" onClick={() => dispatch({ type: 'TOGGLE_CREATE_ANNOUNCEMENT' })}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              className="comment-input"
              placeholder="e.g. Annual Campus Hackathon 2026 🚀"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`chip ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Details</label>
            <textarea
              className="textarea"
              placeholder="Provide all essential details, schedule, requirements..."
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Date & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="comment-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="comment-input"
                placeholder="e.g. Block D Hall 3"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>

          {/* Organizer & Pin */}
          <div className="form-group">
            <label className="form-label">Organizer / Club</label>
            <input
              type="text"
              className="comment-input"
              placeholder="e.g. Cultural Committee"
              value={organizer}
              onChange={e => setOrganizer(e.target.value)}
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', cursor: 'pointer', marginTop: 8, color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} />
              📌 Pin this announcement at the top of the board
            </label>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                className="comment-input"
                placeholder="e.g. Hackathon"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                style={{ borderRadius: 'var(--radius-md)' }}
              />
              <button className="btn btn-secondary btn-sm" type="button" onClick={handleAddTag}>Add</button>
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
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'TOGGLE_CREATE_ANNOUNCEMENT' })}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-pill"
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim()}
            style={{ opacity: title.trim() && description.trim() ? 1 : 0.5 }}
          >
            Publish Announcement
          </button>
        </div>
      </div>
    </div>
  );
}
