// ============================================================
// Random Student Chat — High-Capacity 1-on-1 Campus Matchmaking
// Mobile-First Zero-Scroll Ergonomics & Scalable WebSockets
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, UserPlus, SkipForward, X, Zap, Shield,
  MessageSquareQuote, RotateCcw, Copy, Check,
  User, CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTEREST_TAGS, ICEBREAKERS, CURRENT_USER, generateAnonName } from '../../data/mockData';
import { supabase } from '../../lib/supabase';
import type { ChatMessage, AnonMatch } from '../../types';

const SEARCHING_TIPS = [
  'Scanning active student hubs across universities...',
  'Select interest vibes to match with similar students.',
  'Your identity stays 100% anonymous until both sides choose to reveal.',
  'Matching you with a student from another university...',
];

const QUICK_STARTERS = [
  'What major & uni are you in?',
  'Best food spot on campus?',
  'Studying or procrastinating?',
  'What music are you listening to?',
];

export default function RandomChat() {
  const { state, dispatch } = useApp();
  const { activeMatch } = state;
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [peerRevealRequested, setPeerRevealRequested] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lobbyChannelRef = useRef<any>(null);
  const roomChannelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  const isMatchingRef = useRef(false);
  const claimedPeersRef = useRef<Set<string>>(new Set());

  const me = state.currentUser || CURRENT_USER;
  const mySessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`).current;
  const myAnonProfile = useRef(generateAnonName()).current;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMatch?.messages, scrollToBottom]);

  // Rotate tips when searching
  useEffect(() => {
    if (!activeMatch || activeMatch.status !== 'searching') return;
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % SEARCHING_TIPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [activeMatch?.status]);

  // Clean up channels on unmount
  useEffect(() => {
    return () => {
      if (lobbyChannelRef.current) supabase.removeChannel(lobbyChannelRef.current);
      if (roomChannelRef.current) supabase.removeChannel(roomChannelRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, []);

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Join a dedicated 1-on-1 room
  const joinChatRoom = useCallback((roomId: string, peerId: string, peerPseudonym: string, peerEmoji: string) => {
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }

    if (lobbyChannelRef.current) {
      supabase.removeChannel(lobbyChannelRef.current);
      lobbyChannelRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    const matchedState: AnonMatch = {
      id: roomId,
      peerId,
      peerPseudonym,
      peerEmoji,
      matchedAt: new Date().toISOString(),
      interestTags: selectedInterests,
      status: 'chatting',
      messages: [
        {
          id: `sys_${Date.now()}`,
          senderId: 'system',
          content: `⚡ Connected with ${peerPseudonym}! You are both 100% anonymous.`,
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ],
      revealRequestSent: false,
      revealRequestReceived: false,
    };

    dispatch({ type: 'MATCH_FOUND', payload: matchedState });

    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'CHAT_MSG' }, ({ payload }: { payload: any }) => {
        dispatch({
          type: 'RECEIVE_CHAT_MESSAGE',
          payload: {
            id: payload.id || `msg_${Date.now()}`,
            senderId: payload.senderId,
            content: payload.content,
            timestamp: payload.timestamp || new Date().toISOString(),
            type: payload.type || 'text',
          },
        });
      })
      .on('broadcast', { event: 'REVEAL_REQUEST' }, () => {
        setPeerRevealRequested(true);
      })
      .on('broadcast', { event: 'REVEAL_ACCEPTED' }, () => {
        dispatch({ type: 'ACCEPT_REVEAL' });
      })
      .on('broadcast', { event: 'PEER_LEFT' }, () => {
        dispatch({
          type: 'RECEIVE_CHAT_MESSAGE',
          payload: {
            id: `sys_left_${Date.now()}`,
            senderId: 'system',
            content: 'Peer has left the chat session.',
            timestamp: new Date().toISOString(),
            type: 'system',
          },
        });
      })
      .subscribe();

    roomChannelRef.current = channel;
  }, [dispatch]);

  // Master Matchmaking Engine
  const handleStartMatch = useCallback(() => {
    isMatchingRef.current = false;
    claimedPeersRef.current.clear();
    setPeerRevealRequested(false);

    if (lobbyChannelRef.current) {
      supabase.removeChannel(lobbyChannelRef.current);
      lobbyChannelRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    dispatch({ type: 'START_MATCHING' });

    const lobbyName = 'campus_roulette_lobby';
    const lobby = supabase.channel(lobbyName, {
      config: { broadcast: { self: false } },
    });

    const attemptPairing = (peerSessionId: string, peerPseudonym: string, peerEmoji: string) => {
      if (isMatchingRef.current) return;
      if (peerSessionId === mySessionId) return;
      if (claimedPeersRef.current.has(peerSessionId)) return;

      const myTurnToPropose = mySessionId > peerSessionId;

      if (myTurnToPropose) {
        isMatchingRef.current = true;
        claimedPeersRef.current.add(peerSessionId);
        const uniqueRoomId = `room_${[mySessionId, peerSessionId].sort().join('_')}`;

        lobby.send({
          type: 'broadcast',
          event: 'MATCH_INVITE',
          payload: {
            targetSessionId: peerSessionId,
            senderSessionId: mySessionId,
            senderPseudonym: myAnonProfile.name,
            senderEmoji: myAnonProfile.emoji,
            roomId: uniqueRoomId,
          },
        });

        joinChatRoom(uniqueRoomId, peerSessionId, peerPseudonym, peerEmoji);
      }
    };

    lobby
      .on('broadcast', { event: 'LOOKING_FOR_CHAT' }, ({ payload }: { payload: any }) => {
        if (!payload || payload.senderSessionId === mySessionId) return;
        attemptPairing(payload.senderSessionId, payload.senderPseudonym, payload.senderEmoji);
      })
      .on('broadcast', { event: 'MATCH_INVITE' }, ({ payload }: { payload: any }) => {
        if (!payload || payload.targetSessionId !== mySessionId) return;
        if (isMatchingRef.current) return;

        isMatchingRef.current = true;
        joinChatRoom(payload.roomId, payload.senderSessionId, payload.senderPseudonym, payload.senderEmoji);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          const broadcastPresence = () => {
            lobby.send({
              type: 'broadcast',
              event: 'LOOKING_FOR_CHAT',
              payload: {
                senderSessionId: mySessionId,
                senderPseudonym: myAnonProfile.name,
                senderEmoji: myAnonProfile.emoji,
                interests: selectedInterests,
              },
            });
          };

          broadcastPresence();
          heartbeatIntervalRef.current = setInterval(broadcastPresence, 1800);
        }
      });

    lobbyChannelRef.current = lobby;
  }, [mySessionId, myAnonProfile, selectedInterests, dispatch, joinChatRoom]);

  const handleCancelSearch = () => {
    if (lobbyChannelRef.current) {
      supabase.removeChannel(lobbyChannelRef.current);
      lobbyChannelRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    dispatch({ type: 'END_CHAT' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || !activeMatch || !roomChannelRef.current) return;

    const msgId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      senderId: mySessionId,
      content: text,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: text });
    if (!textToSend) setChatInput('');

    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'CHAT_MSG',
      payload: newMsg,
    });
  };

  const handleNewIcebreaker = () => {
    if (!roomChannelRef.current || !activeMatch) return;
    const q = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    const msg: ChatMessage = {
      id: `ice_${Date.now()}`,
      senderId: 'system',
      content: q,
      timestamp: new Date().toISOString(),
      type: 'icebreaker',
    };
    dispatch({ type: 'RECEIVE_CHAT_MESSAGE', payload: msg });
    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'CHAT_MSG',
      payload: msg,
    });
  };

  const handleSendRevealRequest = () => {
    if (!roomChannelRef.current || !activeMatch) return;
    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'REVEAL_REQUEST',
      payload: { senderSessionId: mySessionId },
    });
    dispatch({ type: 'SEND_REVEAL_REQUEST' });
    setShowRevealModal(false);
  };

  const handleAcceptPeerReveal = () => {
    if (!roomChannelRef.current || !activeMatch) return;
    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'REVEAL_ACCEPTED',
      payload: { senderSessionId: mySessionId },
    });
    dispatch({ type: 'ACCEPT_REVEAL' });
    setPeerRevealRequested(false);
  };

  const handleSkip = () => {
    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'PEER_LEFT',
        payload: { sessionId: mySessionId },
      });
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }
    dispatch({ type: 'SKIP_MATCH' });
    handleStartMatch();
  };

  const handleCopyInviteLink = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(window.location.origin);
      }
    } catch (err) {
      console.warn('Clipboard copy notice:', err);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // ── 1. Idle / Search State (Zero-Scroll Mobile Layout) ──────
  if (!activeMatch || activeMatch.status === 'searching') {
    const isSearching = activeMatch?.status === 'searching';

    return (
      <div className="roulette-screen-container">
        <div className="roulette-compact-card">
          {/* Status Badge */}
          <div className="roulette-status-badge">
            <span className={`roulette-status-dot ${isSearching ? 'pulsing' : ''}`} />
            <span>{isSearching ? 'Live Matchmaking Active' : '100% Anonymous & Private'}</span>
          </div>

          {/* Compact Radar */}
          <div className={`roulette-mini-radar ${isSearching ? 'searching' : ''}`}>
            <div className="mini-radar-ring ring-1" />
            <div className="mini-radar-ring ring-2" />
            {isSearching && <div className="mini-radar-sweep" />}
            <div className="mini-radar-center">
              {isSearching ? <Zap size={22} className="spin" /> : <Sparkles size={22} />}
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="roulette-compact-title">
            {isSearching ? 'Matching with a student...' : 'Random Student Chat'}
          </h1>
          <p className="roulette-compact-desc">
            {isSearching
              ? SEARCHING_TIPS[tipIndex]
              : 'Chat 1-on-1 anonymously in real-time with students across universities.'}
          </p>

          {/* ── BIG PRIMARY CTA BUTTON (Immediately visible in 1 tap!) ── */}
          {!isSearching ? (
            <div className="roulette-cta-wrapper">
              <button
                className="roulette-master-btn"
                onClick={() => handleStartMatch()}
              >
                <Sparkles size={20} />
                <span>Start Random Chat</span>
              </button>
            </div>
          ) : (
            <div className="roulette-searching-actions">
              <button className="btn btn-secondary btn-pill btn-sm" onClick={handleCancelSearch}>
                <RotateCcw size={15} /> Cancel Search
              </button>
              <button className="btn btn-ghost btn-pill btn-sm" onClick={handleCopyInviteLink}>
                {copiedLink ? <><Check size={14} /> Link Copied!</> : <><Copy size={14} /> Share Invite Link</>}
              </button>
            </div>
          )}

          {/* ── Single-Row Horizontal Vibe Scroller ── */}
          {!isSearching && (
            <div className="roulette-vibes-section">
              <div className="roulette-vibes-header">
                <span>Filter by topic vibe (optional):</span>
                {selectedInterests.length > 0 && (
                  <button onClick={() => setSelectedInterests([])} className="roulette-clear-btn">
                    Clear ({selectedInterests.length})
                  </button>
                )}
              </div>

              <div className="roulette-vibes-scroll">
                {INTEREST_TAGS.map(tag => (
                  <button
                    key={tag}
                    className={`vibe-chip ${selectedInterests.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleInterest(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="roulette-security-footer">
            <Shield size={13} />
            <span>Encrypted live session. Zero personal data shared.</span>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Revealed State ─────────────────────────────────────
  if (activeMatch.status === 'revealed') {
    return (
      <div className="roulette-screen-container">
        <div className="roulette-compact-card" style={{ padding: '32px 20px' }}>
          <div className="revealed-hero-avatar" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', margin: '0 auto 16px' }}>
            <CheckCircle2 size={42} />
          </div>
          <h2 className="match-title">You are now connected!</h2>
          <p className="match-subtitle" style={{ margin: '8px 0 20px' }}>
            <strong>{activeMatch.peerPseudonym}</strong> and you have exchanged identities. You can now chat anytime directly in your messages.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn btn-primary btn-pill"
              onClick={() => {
                dispatch({ type: 'END_CHAT' });
                dispatch({ type: 'SET_TAB', payload: 'messages' });
              }}
            >
              Open Direct Messages
            </button>
            <button
              className="btn btn-secondary btn-pill"
              onClick={() => {
                dispatch({ type: 'END_CHAT' });
                handleStartMatch();
              }}
            >
              Next Random Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. Full-Screen Chatting State ─────────────────────────
  return (
    <div className="roulette-chat-fullscreen">
      <div className="chat-room">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="user-avatar" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <User size={18} />
            </div>
            <div>
              <div className="chat-pseudonym">
                {activeMatch.peerPseudonym}
                <span className="chat-anon-tag">Online Peer</span>
              </div>
              <div className="chat-pseudonym-sub">● Connected Live & Private</div>
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
              <span className="hide-mobile">{activeMatch.revealRequestSent ? 'Request Sent' : 'Reveal Identity'}</span>
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
              onClick={() => {
                if (roomChannelRef.current) {
                  roomChannelRef.current.send({
                    type: 'broadcast',
                    event: 'PEER_LEFT',
                    payload: { sessionId: mySessionId },
                  });
                  supabase.removeChannel(roomChannelRef.current);
                  roomChannelRef.current = null;
                }
                dispatch({ type: 'END_CHAT' });
              }}
              title="Leave chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Incoming Reveal Request Banner */}
        {peerRevealRequested && (
          <div style={{
            padding: '10px 16px',
            background: 'var(--accent-bg-strong)',
            borderBottom: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              <strong>{activeMatch.peerPseudonym}</strong> requested to reveal profiles!
            </div>
            <button className="btn btn-sm btn-primary btn-pill" onClick={handleAcceptPeerReveal}>
              Accept & Reveal
            </button>
          </div>
        )}

        {/* Messages Feed */}
        <div className="chat-messages">
          {activeMatch.messages.map(msg => {
            const isSentByMe = msg.senderId === mySessionId || msg.senderId === me.id;
            return (
              <div
                key={msg.id}
                className={`chat-bubble ${
                  msg.type === 'system' ? 'system' :
                  msg.type === 'icebreaker' ? 'icebreaker' :
                  isSentByMe ? 'sent' : 'received'
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
            );
          })}

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
            placeholder="Type a message (Press Enter)..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!chatInput.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Reveal Modal */}
      {showRevealModal && (
        <div className="modal-backdrop" onClick={() => setShowRevealModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect with Peer</h2>
              <button className="icon-btn" onClick={() => setShowRevealModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                Choose how you would like to stay in touch:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  className="btn btn-primary btn-pill"
                  onClick={handleSendRevealRequest}
                  style={{ padding: '12px 18px', width: '100%', justifyContent: 'center' }}
                >
                  <UserPlus size={16} /> Reveal Real Profile & Add as Friend
                </button>
                <button
                  className="btn btn-secondary btn-pill"
                  onClick={() => {
                    setShowRevealModal(false);
                    dispatch({ type: 'CONNECT_ANONYMOUSLY' });
                  }}
                  style={{ padding: '12px 18px', width: '100%', justifyContent: 'center' }}
                >
                  <Shield size={16} /> Stay Anonymous & Continue in Private DMs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
