// ============================================================
// Groups & Campus Hubs Page — Live Supabase Connected
// ============================================================

import { useState } from 'react';
import { Users, Pin, Calendar, MessageCircle, ArrowLeft, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CreateGroupModal from './CreateGroupModal';
import type { Group } from '../../types';

const GROUP_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'academic', label: 'Academic' },
  { id: 'hobby', label: 'Hobby' },
  { id: 'campus-life', label: 'Campus Life' },
  { id: 'sports', label: 'Sports' },
];

export default function GroupsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [chatText, setChatText] = useState('');

  const filteredGroups = state.groups.filter(g =>
    filter === 'all' ? true : g.category === filter
  );

  // ── Group Detail View ───────────────────────────────────
  if (state.selectedGroupId) {
    const group = state.groups.find(g => g.id === state.selectedGroupId);
    if (!group) return null;

    const handleSendMessage = () => {
      if (!chatText.trim()) return;
      dispatch({
        type: 'SEND_GROUP_MESSAGE',
        payload: { groupId: group.id, content: chatText },
      });
      setChatText('');
    };

    return (
      <div className="app-content">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => dispatch({ type: 'SELECT_GROUP', payload: null })}
          style={{ marginBottom: 16 }}
        >
          <ArrowLeft size={16} /> Back to Hubs
        </button>

        {/* Group Header */}
        <div className="group-detail-header" style={{ background: group.coverGradient }}>
          <div className="group-detail-content">
            <div className="group-detail-icon">{group.icon}</div>
            <h1 className="group-detail-name">{group.name}</h1>
            <p className="group-detail-desc">{group.description}</p>
            <div className="group-detail-stats">
              <div className="group-detail-stat">
                <Users size={16} /> {group.memberCount} members
              </div>
              {group.upcomingEvent && (
                <div className="group-detail-stat">
                  <Calendar size={16} /> {group.upcomingEvent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pinned Announcement */}
        {group.pinnedAnnouncement && (
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Pin size={16} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-error)', marginBottom: 4 }}>Pinned</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{group.pinnedAnnouncement}</div>
            </div>
          </div>
        )}

        {/* Group Chat */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <MessageCircle size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Hub Chat</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
            {group.recentMessages && group.recentMessages.length > 0 ? group.recentMessages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem', background: 'var(--accent-bg-strong)', flexShrink: 0 }}>
                  {msg.senderAvatar || '🎓'}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {msg.senderName}
                    <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 8, fontSize: '0.72rem' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{msg.content}</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                No messages yet. Be the first to say hi to the hub! 👋
              </div>
            )}
          </div>

          {/* Input */}
          <div className="comment-input-wrapper" style={{ marginTop: 16 }}>
            <input
              type="text"
              className="comment-input"
              placeholder={`Message ${group.name}...`}
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="btn btn-primary btn-sm btn-pill"
              onClick={handleSendMessage}
              disabled={!chatText.trim()}
              style={{ opacity: chatText.trim() ? 1 : 0.5 }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Groups Grid View ────────────────────────────────────
  return (
    <div className="app-content" style={{ maxWidth: 860 }}>
      <div className="feed-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="feed-title">Groups & Campus Hubs</h1>
          <p className="feed-subtitle">Join student-run clubs, connect with your cohort, and organize activities.</p>
        </div>
        <button
          className="btn btn-primary btn-pill btn-sm"
          onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}
        >
          <Plus size={16} />
          Create Hub
        </button>
      </div>

      <div className="feed-filters" style={{ marginBottom: 'var(--space-2xl)' }}>
        {GROUP_FILTERS.map(f => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredGroups.length > 0 ? (
        <div className="groups-grid">
          {filteredGroups.map((group, i) => (
            <GroupCard key={group.id} group={group} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No Campus Hubs Found</div>
          <div className="empty-state-desc">Be the first to create a student hub on your campus!</div>
          <button
            className="btn btn-primary btn-pill"
            style={{ marginTop: 16 }}
            onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}
          >
            <Plus size={16} /> Create First Hub
          </button>
        </div>
      )}

      {/* Modal */}
      {state.showCreateGroup && <CreateGroupModal />}
    </div>
  );
}

function GroupCard({ group, index }: { group: Group; index: number }) {
  const { dispatch } = useApp();

  return (
    <div
      className="group-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => dispatch({ type: 'SELECT_GROUP', payload: group.id })}
    >
      <div className="group-cover" style={{ background: group.coverGradient }}>
        {group.icon}
      </div>
      <div className="group-info">
        <div className="group-name">{group.name}</div>
        <div className="group-desc">{group.description}</div>
      </div>
      {group.tags && group.tags.length > 0 && (
        <div className="group-tags">
          {group.tags.slice(0, 3).map(t => (
            <span key={t} className="group-tag">{t}</span>
          ))}
        </div>
      )}
      <div className="group-footer">
        <div className="group-members">
          <Users size={14} /> {group.memberCount} members
        </div>
        <button
          className={`group-join-btn ${group.isJoined ? 'joined' : 'join'}`}
          onClick={e => {
            e.stopPropagation();
            dispatch({ type: 'JOIN_GROUP', payload: group.id });
          }}
        >
          {group.isJoined ? '✓ Joined' : '+ Join'}
        </button>
      </div>
    </div>
  );
}
