// ============================================================
// Create Group Modal — Campus Hub Creation
// ============================================================

import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseService } from '../../services/supabaseService';
import type { Group } from '../../types';

const CATEGORIES = [
  { id: 'academic', label: '🎓 Academic' },
  { id: 'hobby', label: '🎯 Hobby' },
  { id: 'campus-life', label: '🏠 Campus Life' },
  { id: 'sports', label: '🏆 Sports' },
];

const GRADIENTS = [
  'linear-gradient(135deg, #C4956A, #5BB5A2)',
  'linear-gradient(135deg, #5B8EC9, #C4956A)',
  'linear-gradient(135deg, #A78BCA, #C77D8A)',
  'linear-gradient(135deg, #4A9E7F, #5B8EC9)',
  'linear-gradient(135deg, #C75C5C, #C9943A)',
];

const ICONS = ['💻', '🎨', '🎵', '🏠', '🎮', '🏏', '📚', '⚡', '🤖', '📸', '🍿', '☕'];

export default function CreateGroupModal() {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('academic');
  const [icon, setIcon] = useState('💻');
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState('');
  const [upcomingEvent, setUpcomingEvent] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const groupPayload: Partial<Group> = {
      name,
      description,
      category,
      icon,
      coverGradient: gradient,
      pinnedAnnouncement: pinnedAnnouncement.trim() || null,
      upcomingEvent: upcomingEvent.trim() || null,
    };

    const created = await SupabaseService.createGroup(groupPayload);
    if (created) {
      dispatch({ type: 'ADD_GROUP', payload: created });
    } else {
      dispatch({
        type: 'ADD_GROUP',
        payload: {
          id: `g${Date.now()}`,
          name,
          description,
          category,
          icon,
          coverGradient: gradient,
          memberCount: 1,
          isJoined: true,
          isPrivate: false,
          tags: [],
          recentMessages: [],
          pinnedAnnouncement: pinnedAnnouncement.trim() || null,
          upcomingEvent: upcomingEvent.trim() || null,
          createdAt: new Date().toISOString(),
        },
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create Campus Hub</span>
          <button className="icon-btn" onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Icon & Cover Preview */}
          <div
            style={{
              height: 90,
              borderRadius: 'var(--radius-md)',
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              marginBottom: 'var(--space-xl)',
            }}
          >
            {icon}
          </div>

          {/* Group Icon & Cover Gradient Selector */}
          <div className="form-group">
            <label className="form-label">Cover Theme</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGradient(g)}
                  style={{
                    height: 24,
                    flex: 1,
                    borderRadius: 'var(--radius-sm)',
                    background: g,
                    border: gradient === g ? '2px solid var(--text-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <label className="form-label">Hub Icon</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  style={{
                    fontSize: '1.3rem',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: icon === ic ? 'var(--accent-bg-strong)' : 'var(--bg-tertiary)',
                    border: icon === ic ? '1.5px solid var(--accent)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Group Name */}
          <div className="form-group">
            <label className="form-label">Hub Name</label>
            <input
              type="text"
              className="comment-input"
              placeholder="e.g. AI & Robotics Club"
              value={name}
              onChange={e => setName(e.target.value)}
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
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              placeholder="What is this hub about? Who should join?"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Upcoming Event (optional) */}
          <div className="form-group">
            <label className="form-label">Upcoming Event (Optional)</label>
            <input
              type="text"
              className="comment-input"
              placeholder="e.g. Intro Meeting — Friday 5 PM"
              value={upcomingEvent}
              onChange={e => setUpcomingEvent(e.target.value)}
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          {/* Pinned Note (optional) */}
          <div className="form-group">
            <label className="form-label">Pinned Note (Optional)</label>
            <input
              type="text"
              className="comment-input"
              placeholder="e.g. Join our Discord for weekly sessions"
              value={pinnedAnnouncement}
              onChange={e => setPinnedAnnouncement(e.target.value)}
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-pill"
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{ opacity: name.trim() ? 1 : 0.5 }}
          >
            Create Hub
          </button>
        </div>
      </div>
    </div>
  );
}
