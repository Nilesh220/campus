// ============================================================
// Groups & Campus Hubs Page — Professional Icons & Responsive Design
// ============================================================

import { useState } from 'react';
import { Users, Pin, Calendar, MessageCircle, ArrowLeft, Plus, Send, Compass } from 'lucide-react';
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
      <div className="app-content" style={{ maxWidth: 860, margin: '0 auto', padding: '16px 12px' }}>
        <button
          className="btn btn-ghost btn-sm btn-pill"
          onClick={() => dispatch({ type: 'SELECT_GROUP', payload: null })}
          style={{ marginBottom: 16 }}
        >
          <ArrowLeft size={16} /> Back to Hubs
        </button>

        {/* Group Header */}
        <div className="group-detail-header" style={{ background: group.coverGradient, borderRadius: 'var(--radius-lg)', padding: '28px 24px', color: 'white', marginBottom: 20 }}>
          <div className="group-detail-content">
            <div className="group-detail-icon" style={{ background: 'rgba(255,255,255,0.2)', width: 52, height: 52, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Users size={28} />
            </div>
            <h1 className="group-detail-name" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{group.name}</h1>
            <p className="group-detail-desc" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 600, fontSize: '0.9rem' }}>{group.description}</p>
            <div className="group-detail-stats" style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.82rem' }}>
              <div className="group-detail-stat" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} /> {group.memberCount} members
              </div>
              {group.upcomingEvent && (
                <div className="group-detail-stat" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} /> {group.upcomingEvent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pinned Announcement */}
        {group.pinnedAnnouncement && (
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
            <Pin size={16} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-error)', marginBottom: 2 }}>Pinned Announcement</div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{group.pinnedAnnouncement}</div>
            </div>
          </div>
        )}

        {/* Group Chat */}
        <div className="card" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <MessageCircle size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Hub Group Chat</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto', marginBottom: 16 }}>
            {group.recentMessages && group.recentMessages.length > 0 ? group.recentMessages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem', background: 'var(--accent-bg-strong)', color: 'var(--accent)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {msg.senderName}
                    <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 8, fontSize: '0.72rem' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '0.84rem' }}>
                No messages in this hub yet. Say hello to fellow members!
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="chat-input"
              placeholder={`Message ${group.name}...`}
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              style={{ flex: 1, borderRadius: 'var(--radius-md)', padding: '10px 14px' }}
            />
            <button
              className="btn btn-primary btn-pill btn-sm"
              onClick={handleSendMessage}
              disabled={!chatText.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={15} /> Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Groups Grid View ────────────────────────────────────
  return (
    <div className="app-content" style={{ maxWidth: 860, margin: '0 auto', padding: '16px 12px' }}>
      <div className="feed-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="feed-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={24} style={{ color: 'var(--accent)' }} /> Groups & Campus Hubs
          </h1>
          <p className="feed-subtitle">Join student-run clubs, connect with your department, and organize activities.</p>
        </div>
        <button
          className="btn btn-primary btn-pill btn-sm"
          onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Create Hub
        </button>
      </div>

      <div className="feed-filters" style={{ marginBottom: 20 }}>
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
          <div className="empty-state-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Users size={28} />
          </div>
          <div className="empty-state-title">No Campus Hubs Found</div>
          <div className="empty-state-desc">Be the first student to create a hub on your campus!</div>
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
      style={{ animationDelay: `${index * 0.06}s`, borderRadius: 'var(--radius-lg)' }}
      onClick={() => dispatch({ type: 'SELECT_GROUP', payload: group.id })}
    >
      <div className="group-cover" style={{ background: group.coverGradient, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <Users size={32} />
      </div>
      <div className="group-info" style={{ padding: '14px' }}>
        <div className="group-name" style={{ fontSize: '1rem', fontWeight: 700 }}>{group.name}</div>
        <div className="group-desc" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{group.description}</div>
      </div>
      {group.tags && group.tags.length > 0 && (
        <div className="group-tags" style={{ padding: '0 14px' }}>
          {group.tags.slice(0, 3).map(t => (
            <span key={t} className="group-tag">#{t}</span>
          ))}
        </div>
      )}
      <div className="group-footer" style={{ padding: '12px 14px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="group-members" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={14} /> {group.memberCount} members
        </div>
        <button
          className={`group-join-btn ${group.isJoined ? 'joined' : 'join'}`}
          onClick={e => {
            e.stopPropagation();
            dispatch({ type: 'JOIN_GROUP', payload: group.id });
          }}
          style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', padding: '4px 10px' }}
        >
          {group.isJoined ? 'Joined' : 'Join'}
        </button>
      </div>
    </div>
  );
}
