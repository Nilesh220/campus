// ============================================================
// Groups & Campus Hubs — Mobile-First Community & Chat Rooms
// Member Counter, Participants Roster & Realtime Group Chat
// ============================================================

import { useState } from 'react';
import {
  Users, MessageCircle, Pin, Calendar, Plus,
  ArrowLeft, Send, Compass, UserPlus, Check, X, Search, ShieldCheck, MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USERS, CURRENT_USER } from '../../data/mockData';
import CreateGroupModal from './CreateGroupModal';
import type { Group, User } from '../../types';

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
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const filteredGroups = state.groups.filter(g =>
    filter === 'all' ? true : g.category === filter
  );

  const selectedGroup = state.groups.find(g => g.id === state.selectedGroupId);
  const me = state.currentUser || CURRENT_USER;

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

  // Generate participant list for selected group
  const getGroupParticipants = (group: Group): (User & { role: string })[] => {
    // Seed participants from USERS
    const hash = group.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = Math.min(group.memberCount, USERS.length);
    const startIdx = hash % Math.max(1, USERS.length - count);
    const sampled = USERS.slice(startIdx, startIdx + count);

    // Add current user if joined
    const list: (User & { role: string })[] = [];
    if (group.isJoined) {
      list.push({ ...me, role: 'Member' });
    }

    sampled.forEach((u, i) => {
      if (u.id !== me.id) {
        list.push({
          ...u,
          role: i === 0 ? 'Lead Organizer' : i === 1 ? 'Core Contributor' : 'Member',
        });
      }
    });

    return list;
  };

  // ── 1. Active Hub Detail & Chat View ───────────────────────
  if (selectedGroup) {
    const group = selectedGroup;
    const participants = getGroupParticipants(group);
    const filteredParticipants = participants.filter(p => {
      if (!memberSearchQuery.trim()) return true;
      const q = memberSearchQuery.toLowerCase();
      return p.displayName.toLowerCase().includes(q) ||
             p.username.toLowerCase().includes(q) ||
             p.major.toLowerCase().includes(q);
    });

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
          
          {/* Interactive Member Counter Badge */}
          <button
            className="group-nav-members-btn"
            onClick={() => setShowMembersModal(true)}
            title="Click to view all project members & participants"
          >
            <Users size={14} />
            <span>{group.memberCount} members</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="group-hero-banner">
          <div className="group-hero-icon">
            <Users size={24} />
          </div>
          <div className="group-hero-info">
            <h2>{group.name}</h2>
            <p>{group.description}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {group.upcomingEvent && (
                <div className="group-hero-event">
                  <Calendar size={14} /> <span>{group.upcomingEvent}</span>
                </div>
              )}
              
              {/* Member Counter & Roster Trigger Button */}
              <button
                className="group-members-pill-btn"
                onClick={() => setShowMembersModal(true)}
              >
                <Users size={13} />
                <span>View {group.memberCount} Participants</span>
              </button>

              <button
                className={`btn btn-sm btn-pill ${group.isJoined ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => dispatch({ type: 'JOIN_GROUP', payload: group.id })}
              >
                {group.isJoined ? <><Check size={14} /> Joined</> : <><UserPlus size={14} /> Join Hub</>}
              </button>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={16} />
              <span>Live Hub Discussion</span>
            </div>
            <button
              className="btn btn-ghost btn-xs btn-pill"
              onClick={() => setShowMembersModal(true)}
              style={{ fontSize: '0.74rem', padding: '3px 10px' }}
            >
              👥 {group.memberCount} Online Participants
            </button>
          </div>

          <div className="group-chat-messages">
            {group.recentMessages && group.recentMessages.length > 0 ? (
              group.recentMessages.map(msg => (
                <div key={msg.id} className="group-msg-item">
                  <div className="group-msg-avatar">
                    {msg.senderAvatar || '🎓'}
                  </div>
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

        {/* ── Participants / Project Member Counter Modal ────── */}
        {showMembersModal && (
          <div className="modal-backdrop" onClick={() => setShowMembersModal(false)}>
            <div className="modal project-members-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{group.name}</h2>
                  <span className="members-modal-subtitle">
                    👥 Total Participants: <strong>{group.memberCount} members</strong>
                  </span>
                </div>
                <button className="icon-btn" onClick={() => setShowMembersModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '14px 0 6px' }}>
                {/* Search in Members */}
                <div className="members-search-box">
                  <Search size={16} className="members-search-icon" />
                  <input
                    type="text"
                    placeholder="Search participants by name or major..."
                    value={memberSearchQuery}
                    onChange={e => setMemberSearchQuery(e.target.value)}
                    className="members-search-input"
                  />
                  {memberSearchQuery && (
                    <button className="icon-btn btn-xs" onClick={() => setMemberSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Member Roster List */}
                <div className="members-roster-list">
                  {filteredParticipants.map((member) => (
                    <div key={member.id} className="member-roster-item">
                      <div className="member-roster-avatar">
                        {member.avatar || '🎓'}
                        <span className="member-online-dot" />
                      </div>
                      
                      <div className="member-roster-info">
                        <div className="member-roster-name-row">
                          <span className="member-roster-name">{member.displayName}</span>
                          <span className={`member-role-badge ${member.role === 'Lead Organizer' ? 'lead' : ''}`}>
                            {member.role === 'Lead Organizer' && <ShieldCheck size={11} />}
                            {member.role}
                          </span>
                        </div>
                        <div className="member-roster-sub">
                          @{member.username} • {member.major} ({member.graduationYear || 2027})
                        </div>
                      </div>

                      {member.id !== me.id && (
                        <button
                          className="btn btn-ghost btn-xs btn-pill"
                          onClick={() => {
                            setShowMembersModal(false);
                            dispatch({ type: 'SELECT_CONVERSATION', payload: member.id });
                            dispatch({ type: 'SET_TAB', payload: 'messages' });
                          }}
                          title={`Direct Message ${member.displayName}`}
                        >
                          <MessageSquare size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  {filteredParticipants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-tertiary)' }}>
                      No participants matching "{memberSearchQuery}"
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="members-modal-footer">
                  <button
                    className={`btn btn-sm btn-pill ${group.isJoined ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => dispatch({ type: 'JOIN_GROUP', payload: group.id })}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {group.isJoined ? <><Check size={15} /> Joined ({group.memberCount} Members)</> : <><UserPlus size={15} /> Join Project ({group.memberCount} Members)</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
              <div className="group-card-cover">
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
