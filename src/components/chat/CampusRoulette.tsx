// ============================================================
// Random Chat — Anonymous 1-on-1 Campus Matching with Smart Bots
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, UserPlus, SkipForward, X, Zap, Shield, MessageSquareQuote, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { INTEREST_TAGS, ICEBREAKERS, CURRENT_USER, BOT_PEERS, generateAnonName } from '../../data/mockData';
import type { ChatMessage, AnonMatch } from '../../types';

const SEARCHING_TIPS = [
  'Searching through active campus dorms & departments...',
  'Tip: You can ask for an icebreaker prompt anytime during chat!',
  'Your identity stays 100% anonymous until both sides agree to reveal.',
  'Finding a fellow student with matching interests...',
];

const QUICK_STARTERS = [
  'What major are you?',
  'Best food spot on campus?',
  'Studying or procrastinating rn?',
  'What music are you listening to?',
];

export default function RandomChat() {
  const { state, dispatch } = useApp();
  const { activeMatch } = state;
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const currentBotPeerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMatch?.messages, scrollToBottom]);

  // Cycle tips while searching
  useEffect(() => {
    if (activeMatch?.status === 'searching') {
      const interval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % SEARCHING_TIPS.length);
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [activeMatch?.status]);

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // ── Matchmaking Logic (Realtime or Smart Fallback Bot) ──────
  const handleStartMatch = () => {
    dispatch({ type: 'START_MATCHING' });

    // Match within 2.5 seconds with live student or dynamic bot peer
    const delay = 2200 + Math.random() * 1000;
    setTimeout(() => {
      const anon = generateAnonName();
      const botPeer = BOT_PEERS[Math.floor(Math.random() * BOT_PEERS.length)];
      currentBotPeerRef.current = botPeer;

      const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

      const match: AnonMatch = {
        id: `match_${Date.now()}`,
        peerId: botPeer.id,
        peerPseudonym: anon.name,
        peerEmoji: botPeer.emoji || anon.emoji,
        matchedAt: new Date().toISOString(),
        interestTags: selectedInterests.length > 0 ? selectedInterests : ['General Campus Chat'],
        messages: [
          {
            id: `sys_${Date.now()}`,
            senderId: 'system',
            content: `Connected with ${anon.name} ${botPeer.emoji}`,
            timestamp: new Date().toISOString(),
            type: 'system',
          },
          {
            id: `ice_${Date.now()}`,
            senderId: 'system',
            content: icebreaker,
            timestamp: new Date().toISOString(),
            type: 'icebreaker',
            isIcebreaker: true,
          },
        ],
        status: 'chatting',
        revealRequestSent: false,
        revealRequestReceived: false,
      };

      dispatch({ type: 'MATCH_FOUND', payload: match });
    }, delay);
  };

  const handleCancelSearch = () => {
    dispatch({ type: 'END_CHAT' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || !activeMatch) return;

    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: text });
    if (!textToSend) setChatInput('');

    // Trigger smart bot reply
    setIsTyping(true);
    const typingDelay = 1200 + Math.random() * 1500;

    setTimeout(() => {
      setIsTyping(false);
      const bot = currentBotPeerRef.current || BOT_PEERS[0];
      const botReply = bot.responses[Math.floor(Math.random() * bot.responses.length)];

      const msg: ChatMessage = {
        id: `m_reply_${Date.now()}`,
        senderId: activeMatch.peerId,
        content: botReply,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      dispatch({ type: 'RECEIVE_CHAT_MESSAGE', payload: msg });
    }, typingDelay);
  };

  const handleReveal = () => {
    dispatch({ type: 'SEND_REVEAL_REQUEST' });
    setShowRevealModal(false);

    // Bot accepts reveal after 1.8s
    setTimeout(() => {
      dispatch({ type: 'ACCEPT_REVEAL' });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C4956A', '#5BB5A2', '#5B8EC9', '#E8E4DF'],
      });
    }, 1800);
  };

  const handleNewIcebreaker = () => {
    const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    const msg: ChatMessage = {
      id: `ice_${Date.now()}`,
      senderId: 'system',
      content: icebreaker,
      timestamp: new Date().toISOString(),
      type: 'icebreaker',
      isIcebreaker: true,
    };
    dispatch({ type: 'RECEIVE_CHAT_MESSAGE', payload: msg });
  };

  const handleSkip = () => {
    dispatch({ type: 'SKIP_MATCH' });
    handleStartMatch();
  };

  // ── Idle / Search State ─────────────────────────────────
  if (!activeMatch || activeMatch.status === 'searching') {
    const isSearching = activeMatch?.status === 'searching';

    return (
      <div className="app-content" style={{ maxWidth: 720 }}>
        <div className="match-container">
          {/* Status Header Badge */}
          <div className="match-badge-pill">
            <span className="dot" />
            <span>{isSearching ? 'Live Campus Matchmaking' : '100% Anonymous & Ephemeral'}</span>
          </div>

          {/* Radar Animation Area */}
          <div className={`match-radar ${isSearching ? 'active-searching' : ''}`}>
            <div className="radar-circle" />
            <div className="radar-circle" />
            <div className="radar-circle" />
            <div className="radar-circle" />
            {isSearching && (
              <>
                <div className="radar-sweep" />
                <div className="radar-dot" style={{ top: '28%', left: '62%', animationDelay: '0.3s' }} />
                <div className="radar-dot" style={{ top: '68%', left: '32%', animationDelay: '1.1s' }} />
                <div className="radar-dot" style={{ top: '42%', left: '76%', animationDelay: '0.7s' }} />
              </>
            )}
            <div className="radar-center">
              {isSearching ? (
                <span className="radar-icon-spin">⚡</span>
              ) : (
                <span>💬</span>
              )}
            </div>
          </div>

          <h1 className="match-title">
            {isSearching ? 'Connecting with a peer...' : 'Random Student Chat'}
          </h1>
          <p className="match-subtitle">
            {isSearching
              ? SEARCHING_TIPS[tipIndex]
              : 'Chat 1-on-1 anonymously with fellow students across campus. Zero personal data shared unless you both choose to reveal your profiles.'}
          </p>

          {/* Live Activity Row */}
          <div className="match-stats-row">
            <div className="match-stat-item">
              <span className="match-stat-num">Active</span>
              <span className="match-stat-lbl">Campus Rooms</span>
            </div>
            <div className="match-stat-divider" />
            <div className="match-stat-item">
              <span className="match-stat-num">&lt; 5s</span>
              <span className="match-stat-lbl">Instant Match</span>
            </div>
            <div className="match-stat-divider" />
            <div className="match-stat-item">
              <span className="match-stat-num">Private</span>
              <span className="match-stat-lbl">Auto-Deletes</span>
            </div>
          </div>

          {/* Interest Tags */}
          {!isSearching ? (
            <div className="match-filter-box">
              <div className="match-filter-header">
                <span>Choose topic or vibe (optional):</span>
                {selectedInterests.length > 0 && (
                  <button
                    className="match-clear-btn"
                    onClick={() => setSelectedInterests([])}
                  >
                    Clear ({selectedInterests.length})
                  </button>
                )}
              </div>

              <div className="match-interest-picker">
                {INTEREST_TAGS.map(tag => (
                  <button
                    key={tag}
                    className={`chip ${selectedInterests.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleInterest(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="match-actions-row">
                <button className="btn btn-primary btn-lg btn-pill" onClick={handleStartMatch}>
                  <Sparkles size={18} />
                  Start Random Chat
                </button>
              </div>

              <div className="match-safety-note">
                <Shield size={14} />
                <span>Encrypted session. Be respectful to fellow students.</span>
              </div>
            </div>
          ) : (
            <div className="match-searching-controls">
              <button className="btn btn-secondary btn-pill" onClick={handleCancelSearch}>
                <RotateCcw size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Revealed State ──────────────────────────────────────
  if (activeMatch.status === 'revealed') {
    return (
      <div className="app-content" style={{ maxWidth: 600 }}>
        <div className="match-container" style={{ minHeight: '55vh' }}>
          <div className="revealed-hero-avatar">
            <span className="revealed-emoji">🤝</span>
          </div>
          <h2 className="match-title">You're now connected!</h2>
          <p className="match-subtitle">
            <strong>{activeMatch.peerPseudonym}</strong> and you have exchanged identities. You can now chat anytime directly in your messages.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              className="btn btn-primary btn-pill"
              onClick={() => {
                dispatch({ type: 'END_CHAT' });
                dispatch({ type: 'SET_TAB', payload: 'messages' });
              }}
            >
              💬 Open Direct Messages
            </button>
            <button
              className="btn btn-secondary btn-pill"
              onClick={() => {
                dispatch({ type: 'END_CHAT' });
                handleStartMatch();
              }}
            >
              ⚡ Next Random Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Chatting State ──────────────────────────────────────
  return (
    <div className="app-content" style={{ maxWidth: 680 }}>
      <div className="chat-room">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="user-avatar" style={{ background: 'var(--accent-bg-strong)', width: 40, height: 40, fontSize: '1.2rem' }}>
              {activeMatch.peerEmoji}
            </div>
            <div>
              <div className="chat-pseudonym">
                {activeMatch.peerPseudonym}
                <span className="chat-anon-tag">Anonymous</span>
              </div>
              <div className="chat-pseudonym-sub">Random 1-on-1 Session</div>
            </div>
          </div>
          <div className="chat-actions">
            <button
              className={`btn btn-sm btn-pill ${activeMatch.revealRequestSent ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setShowRevealModal(true)}
              disabled={activeMatch.revealRequestSent}
              style={{ opacity: activeMatch.revealRequestSent ? 0.7 : 1 }}
            >
              <UserPlus size={14} />
              {activeMatch.revealRequestSent ? 'Request Sent' : 'Reveal Identity'}
            </button>
            <button
              className="icon-btn"
              onClick={handleNewIcebreaker}
              title="Add random icebreaker"
            >
              <Zap size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={handleSkip}
              title="Skip to next person"
            >
              <SkipForward size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={() => dispatch({ type: 'END_CHAT' })}
              title="Leave chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="chat-messages">
          {activeMatch.messages.map(msg => (
            <div
              key={msg.id}
              className={`chat-bubble ${
                msg.type === 'system' ? 'system' :
                msg.type === 'icebreaker' ? 'icebreaker' :
                msg.senderId === CURRENT_USER.id ? 'sent' : 'received'
              }`}
            >
              {msg.type === 'icebreaker' && (
                <div className="chat-bubble-icebreaker-title">
                  <MessageSquareQuote size={14} /> Icebreaker Question
                </div>
              )}
              <div>{msg.content}</div>
              {msg.type === 'text' && (
                <div className="chat-bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters */}
        <div className="chat-quick-starters">
          {QUICK_STARTERS.map((starter, i) => (
            <button
              key={i}
              className="chat-quick-pill"
              onClick={() => handleSendMessage(starter)}
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message (Press Enter to send)..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!chatInput.trim()}
            style={{ opacity: chatInput.trim() ? 1 : 0.4 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Connection & Reveal Choice Modal */}
      {showRevealModal && (
        <div className="modal-overlay" onClick={() => setShowRevealModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="reveal-modal-content">
              <div className="reveal-avatar-wrapper">
                <div className="reveal-avatar-ring" />
                <div className="reveal-avatar">
                  {activeMatch.peerEmoji}
                </div>
              </div>

              <div className="reveal-title">Stay Connected?</div>
              <div className="reveal-subtitle">
                Choose how you'd like to stay in touch with <strong>{activeMatch.peerPseudonym}</strong>:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 14 }}>
                <button
                  className="btn btn-secondary btn-pill"
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: 'var(--accent)' }}
                  onClick={() => {
                    setShowRevealModal(false);
                    dispatch({ type: 'CONNECT_ANONYMOUSLY' });
                  }}
                >
                  <span>🎭</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Chat Anonymously in DMs</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Keep identities 100% private. Chat as {activeMatch.peerPseudonym}</div>
                  </div>
                </button>

                <button
                  className="btn btn-primary btn-pill"
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleReveal}
                >
                  <UserPlus size={16} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Reveal Full Profiles</div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>Exchange real names ({CURRENT_USER.displayName}) & college profiles</div>
                  </div>
                </button>

                <button
                  className="btn btn-ghost btn-pill btn-sm"
                  onClick={() => setShowRevealModal(false)}
                  style={{ marginTop: 4 }}
                >
                  Stay in this session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
