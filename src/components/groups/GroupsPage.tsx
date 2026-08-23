// ============================================================
// Groups & Campus Hubs — Mobile-First Community & Chat Rooms
// ============================================================

import { useState } from 'react';
import {
  Users, MessageCircle, Pin, Calendar, Plus,
  ArrowLeft, Send, Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CreateGroupModal from './CreateGroupModal';

const GROUP_FILTERS = [
  { id: 'all', label: 'All Hubs' },
  { id: 'academic', label: 'Academic' },
  { id: 'club', label: 'Clubs' },
  { id: 'campus-life', label: 'Campus Life' },
  { id: 'hobby', label: 'Hobbies & Gaming' },
  { id: 'sports', label: 'Sports' },
];

export default function GroupsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [chatText, setChatText] = useState('');

  const filteredGroups = state.groups.filter(g =>
    filter === 'all' ? true : g.category === filter
  );

  const selectedGroup = state.groups.find(g => g.id === state.selectedGroupId);

  const handleSendMessage = () => {
    if (!chatText.trim() || !selectedGroup) return;
    dispatch({
      type: 'SEND_GROUP_MESSAGE',
      payload: {
        groupId: selectedGroup.id,
        content: chatText.trim(),
      },
    });
    setChatText('');
  };

  // ── 1. Active Hub Detail & Chat View ───────────────────────
  if (selectedGroup) {
    const group = selectedGroup;

    return (
      <div className="group-detail-container">
        {/* Top Sticky Header */}
        <div className="group-detail-nav">
          <button
            className="btn btn-ghost btn-sm btn-pill"
            onClick={() => dispatch({ type: 'SELECT_GROUP', payload: null })}
          >
            <ArrowLeft size={16} /> Hubs
          </button>
          <span className="group-nav-title">{group.name}</span>
          <span className="group-nav-members">{group.memberCount} members</span>
        </div>

        {/* Hero Card */}
        <div className="group-hero-banner" style={{ background: group.coverGradient }}>
          <div className="group-hero-icon">
            <Users size={24} />
          </div>
          <div className="group-hero-info">
            <h2>{group.name}</h2>
            <p>{group.description}</p>
            {group.upcomingEvent && (
              <div className="group-hero-event">
                <Calendar size={14} /> <span>{group.upcomingEvent}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pinned Announcement */}
        {group.pinnedAnnouncement && (
          <div className="group-pinned-box">
            <Pin size={15} className="group-pinned-icon" />
            <div>
              <span className="group-pinned-label">Pinned Announcement</span>
              <p>{group.pinnedAnnouncement}</p>
            </div>
          </div>
        )}

        {/* Full-Height Chat Stream */}
        <div className="group-chat-card">
          <div className="group-chat-header">
            <MessageCircle size={16} />
            <span>Live Hub Chat</span>
          </div>

          <div className="group-chat-messages">
            {group.recentMessages && group.recentMessages.length > 0 ? (
              group.recentMessages.map(msg => (
                <div key={msg.id} className="group-msg-item">
                  <div className="group-msg-avatar">🎓</div>
                  <div className="group-msg-body">
                    <div className="group-msg-meta">
                      <span className="group-msg-author">{msg.senderName}</span>
                      <span className="group-msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="group-msg-content">{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="group-chat-empty">
                No messages yet. Say hello to fellow members!
              </div>
            )}
          </div>

          {/* Sticky Input Bar */}
          <div className="group-chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder={`Message ${group.name}...`}
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="btn btn-primary btn-pill btn-sm"
              onClick={handleSendMessage}
              disabled={!chatText.trim()}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Groups Hub Stream (Zero-Scroll Mobile List) ─────────
  return (
    <div className="groups-hub-container">
      {/* Header */}
      <div className="groups-header-row">
        <div>
          <h1 className="groups-title">
            <Compass size={22} style={{ color: 'var(--accent)' }} /> Campus Hubs
          </h1>
          <p className="groups-subtitle">Join student-run clubs, sports, and department groups.</p>
        </div>
        <button
          className="btn btn-primary btn-pill btn-sm"
          onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}
        >
          <Plus size={15} /> Create Hub
        </button>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="groups-filter-scroll">
        {GROUP_FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Group Cards Grid */}
      {filteredGroups.length > 0 ? (
        <div className="groups-cards-grid">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className="group-card-modern"
              onClick={() => dispatch({ type: 'SELECT_GROUP', payload: group.id })}
            >
              <div className="group-card-cover" style={{ background: group.coverGradient }}>
                <Users size={24} />
              </div>
              <div className="group-card-body">
                <div className="group-card-header">
                  <h3 className="group-card-name">{group.name}</h3>
                  <span className="group-card-count">{group.memberCount} members</span>
                </div>
                <p className="group-card-desc">{group.description}</p>
                <div className="group-card-action">
                  <span className="group-enter-badge">Enter Hub Chat →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="feed-empty-state">
          <div className="feed-empty-icon">
            <Users size={28} />
          </div>
          <h3>No Campus Hubs Found</h3>
          <p>Be the first student to create a hub on campus!</p>
          <button
            className="btn btn-primary btn-pill"
            style={{ marginTop: 14 }}
            onClick={() => dispatch({ type: 'TOGGLE_CREATE_GROUP' })}
          >
            <Plus size={16} /> Create First Hub
          </button>
        </div>
      )}

      {/* Create Modal */}
      {state.showCreateGroup && <CreateGroupModal />}
    </div>
  );
}
