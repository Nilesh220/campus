// ============================================================
// Direct Messages — Identified & Anonymous Friends
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USERS, CURRENT_USER } from '../../data/mockData';

export default function DirectMessages() {
  const { state, dispatch } = useApp();
  const [dmInput, setDmInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
  const activeParticipant = activeConv
    ? (activeConv.isAnonymous
        ? {
            id: activeConv.participantId,
            displayName: activeConv.peerPseudonym || 'Anonymous Peer',
            avatar: activeConv.peerEmoji || '🎭',
            major: 'Anonymous Connection',
            isOnline: true,
          }
        : USERS.find(u => u.id === activeConv.participantId) || {
            id: activeConv.participantId,
            displayName: 'Campus Student',
            avatar: '🎓',
            major: 'Student',
            isOnline: true,
          })
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = () => {
    if (!dmInput.trim() || !activeConv) return;
    dispatch({ type: 'SEND_DM', payload: { conversationId: activeConv.id, content: dmInput } });
    setDmInput('');
  };

  return (
    <div className="app-content" style={{ maxWidth: 860, padding: 0 }}>
      <div style={{ padding: 'var(--space-2xl) var(--space-lg) var(--space-sm)' }}>
        <h1 className="feed-title">Direct Messages</h1>
        <p className="feed-subtitle">Private chats with your identified campus friends & anonymous connections.</p>
      </div>

      <div className="dm-layout" style={{ margin: '0 var(--space-lg)' }}>
        {/* Contacts List */}
        <div className="dm-contacts">
          <div className="dm-contacts-header">💬 Conversations ({state.conversations.length})</div>
          {state.conversations.length > 0 ? (
            state.conversations.map(conv => {
              const isAnon = conv.isAnonymous;
              const name = isAnon ? (conv.peerPseudonym || 'Anonymous Peer') : (USERS.find(u => u.id === conv.participantId)?.displayName || 'Campus Student');
              const avatar = isAnon ? (conv.peerEmoji || '🎭') : (USERS.find(u => u.id === conv.participantId)?.avatar || '🎓');

              return (
                <div
                  key={conv.id}
                  className={`dm-contact-item ${state.activeConversationId === conv.id ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SELECT_CONVERSATION', payload: conv.id })}
                >
                  <div
                    className="user-avatar"
                    style={{
                      background: 'var(--accent-bg-strong)',
                      width: 40,
                      height: 40,
                      fontSize: '1.1rem',
                    }}
                  >
                    {avatar}
                  </div>
                  <div className="dm-contact-info">
                    <div className="dm-contact-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {name}
                      {isAnon && (
                        <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 'var(--radius-pill)', background: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 600 }}>
                          Anon
                        </span>
                      )}
                    </div>
                    <div className="dm-contact-last">{conv.lastMessage}</div>
                  </div>
                  <div className="dm-contact-meta">
                    <span className="dm-contact-time">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {conv.unreadCount > 0 && <span className="dm-unread">{conv.unreadCount}</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No direct messages yet. Connect with someone through Random Chat! 💬
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="dm-chat">
          {activeConv && activeParticipant ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <div
                    className="user-avatar"
                    style={{ background: 'var(--accent-bg-strong)', width: 36, height: 36, fontSize: '1rem' }}
                  >
                    {activeParticipant.avatar}
                  </div>
                  <div>
                    <div className="chat-pseudonym">
                      {activeParticipant.displayName}
                      {activeConv.isAnonymous && (
                        <span className="chat-anon-tag">100% Private & Anonymous</span>
                      )}
                    </div>
                    <div className="chat-pseudonym-sub">
                      {activeConv.isAnonymous
                        ? 'Anonymous Direct Message Session'
                        : `🟢 Online • ${activeParticipant.major}`}
                    </div>
                  </div>
                </div>
                {!activeConv.isAnonymous && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => dispatch({ type: 'TOGGLE_PROFILE', payload: activeParticipant.id })}
                  >
                    View Profile
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {activeConv.messages.map(msg => {
                  const isSentByMe = msg.senderId === (state.currentUser || CURRENT_USER).id;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      {msg.content}
                      <div className="chat-bubble-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder={`Message ${activeParticipant.displayName}...`}
                  value={dmInput}
                  onChange={e => setDmInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSend}
                  disabled={!dmInput.trim()}
                  style={{ opacity: dmInput.trim() ? 1 : 0.5 }}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="dm-empty">
              <div className="dm-empty-icon">💬</div>
              <p>Select a conversation or connect through Random Chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
