import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, User, Ghost } from 'lucide-react';
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
            major: 'Anonymous Connection',
            isOnline: true,
          }
        : USERS.find(u => u.id === activeConv.participantId) || {
            id: activeConv.participantId,
            displayName: 'Campus Student',
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
    <div className="app-content" style={{ maxWidth: 920, padding: '16px 12px', margin: '0 auto' }}>
      <div style={{ paddingBottom: 16 }}>
        <h1 className="feed-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={24} style={{ color: 'var(--accent)' }} /> Direct Messages
        </h1>
        <p className="feed-subtitle">Private chats with your campus friends and anonymous connections.</p>
      </div>

      <div className="dm-layout">
        {/* Contacts List */}
        <div className="dm-contacts">
          <div className="dm-contacts-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageCircle size={16} /> Conversations ({state.conversations.length})
          </div>
          {state.conversations.length > 0 ? (
            state.conversations.map(conv => {
              const isAnon = conv.isAnonymous;
              const name = isAnon ? (conv.peerPseudonym || 'Anonymous Peer') : (USERS.find(u => u.id === conv.participantId)?.displayName || 'Campus Student');

              return (
                <div
                  key={conv.id}
                  className={`dm-contact-item ${state.activeConversationId === conv.id ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SELECT_CONVERSATION', payload: conv.id })}
                >
                  <div
                    className="user-avatar"
                    style={{
                      background: isAnon ? 'rgba(167, 139, 202, 0.15)' : 'var(--accent-bg-strong)',
                      color: isAnon ? '#A78BCA' : 'var(--accent)',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isAnon ? <Ghost size={20} /> : <User size={20} />}
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
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.84rem' }}>
              No direct messages yet. Connect with classmates in Random Chat!
            </div>
          )}
        </div>

        {/* Active Conversation Room */}
        <div className="dm-chat">
          {activeConv && activeParticipant ? (
            <>
              {/* Header */}
              <div className="dm-chat-header">
                <div
                  className="user-avatar"
                  style={{
                    background: activeConv.isAnonymous ? 'rgba(167, 139, 202, 0.15)' : 'var(--accent-bg-strong)',
                    color: activeConv.isAnonymous ? '#A78BCA' : 'var(--accent)',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeConv.isAnonymous ? <Ghost size={18} /> : <User size={18} />}
                </div>
                <div>
                  <div className="dm-chat-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {activeParticipant.displayName}
                    {activeConv.isAnonymous ? (
                      <span className="anon-badge">Anonymous Connection</span>
                    ) : (
                      <span className="anon-badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>Campus Peer</span>
                    )}
                  </div>
                  <div className="dm-chat-status">
                    {activeParticipant.major}
                  </div>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="chat-messages">
                {activeConv.messages.map(msg => {
                  const me = state.currentUser || CURRENT_USER;
                  const isSentByMe = msg.senderId === me.id;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      <div>{msg.content}</div>
                      <div className="chat-bubble-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
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
                  style={{ opacity: dmInput.trim() ? 1 : 0.4 }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="dm-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 320 }}>
              <div className="dm-empty-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MessageCircle size={32} />
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Select a Conversation</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)' }}>Choose a conversation from the left to start messaging.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
