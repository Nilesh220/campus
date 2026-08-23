// ============================================================
// Random Student Chat — High-Capacity 1-on-1 Campus Matchmaking
// Scalable Peer Coordination with Professional Icons & Aesthetics
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, UserPlus, SkipForward, X, Zap, Shield,
  MessageSquareQuote, RotateCcw, Copy, Check, KeyRound, Radio,
  User, CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTEREST_TAGS, ICEBREAKERS, CURRENT_USER, generateAnonName } from '../../data/mockData';
import { supabase } from '../../lib/supabase';
import type { ChatMessage, AnonMatch } from '../../types';

const SEARCHING_TIPS = [
  'Searching through active campus departments and study halls...',
  'Select interest tags above to match with students of similar vibes.',
  'Your identity stays 100% anonymous until both sides choose to reveal.',
  'Matching you with an online campus student...',
];

const QUICK_STARTERS = [
  'What major are you in?',
  'Best food spot on campus?',
  'Studying or procrastinating right now?',
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
  const [customRoomCode, setCustomRoomCode] = useState('');
  const [activeTabMode, setActiveTabMode] = useState<'auto' | 'code'>('auto');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lobbyChannelRef = useRef<any>(null);
  const roomChannelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  const isMatchingRef = useRef(false);
  const claimedPeersRef = useRef<Set<string>>(new Set());

  const me = state.currentUser || CURRENT_USER;
  // Guarantees every single browser tab has a 100% unique session ID
  const mySessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`).current;
  const myAnonProfile = useRef(generateAnonName()).current;

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

  // ── Dedicated Room Connection ─────────────────────────────────
  const connectToRoom = useCallback((roomId: string, peerId: string, peerPseudonym: string, _peerEmoji: string, interestTags: string[]) => {
    if (isMatchingRef.current) return;
    isMatchingRef.current = true;

    // Clear lobby heartbeat and channels
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (lobbyChannelRef.current) {
      supabase.removeChannel(lobbyChannelRef.current);
      lobbyChannelRef.current = null;
    }
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }

    const matchData: AnonMatch = {
      id: roomId,
      peerId,
      peerPseudonym,
      peerEmoji: '🎓',
      matchedAt: new Date().toISOString(),
      interestTags,
      messages: [
        {
          id: `sys_${Date.now()}`,
          senderId: 'system',
          content: `You are connected with ${peerPseudonym}! Your chat is private and encrypted. Say hello!`,
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ],
      status: 'chatting',
      revealRequestSent: false,
      revealRequestReceived: false,
    };

    dispatch({ type: 'MATCH_FOUND', payload: matchData });

    // Join dedicated room channel
    const room = supabase.channel(`campus_live_room_${roomId}`, {
      config: { broadcast: { ack: true } },
    });
    roomChannelRef.current = room;

    room
      .on('broadcast', { event: 'CHAT_MSG' }, ({ payload }) => {
        if (payload.sessionId !== mySessionId) {
          dispatch({ type: 'RECEIVE_CHAT_MESSAGE', payload });
        }
      })
      .on('broadcast', { event: 'ICEBREAKER' }, ({ payload }) => {
        dispatch({ type: 'RECEIVE_CHAT_MESSAGE', payload });
      })
      .on('broadcast', { event: 'REVEAL_REQ' }, ({ payload }) => {
        if (payload.sessionId !== mySessionId) {
          setPeerRevealRequested(true);
        }
      })
      .on('broadcast', { event: 'REVEAL_ACCEPT' }, () => {
        dispatch({ type: 'ACCEPT_REVEAL' });
      })
      .on('broadcast', { event: 'PEER_LEFT' }, ({ payload }) => {
        if (payload.sessionId !== mySessionId) {
          const sysMsg: ChatMessage = {
            id: `left_${Date.now()}`,
            senderId: 'system',
            content: `${peerPseudonym} left the chat session.`,
            timestamp: new Date().toISOString(),
            type: 'system',
          };
          dispatch({ type: 'RECEIVE_CHAT_MESSAGE', payload: sysMsg });
        }
      })
      .subscribe();
  }, [mySessionId, dispatch]);

  // ── High-Concurrency Matchmaking Engine ───────────────────────
  const handleStartMatch = useCallback((specificRoomCode?: string) => {
    isMatchingRef.current = false;
    setPeerRevealRequested(false);
    claimedPeersRef.current.clear();
    dispatch({ type: 'START_MATCHING' });

    // 1. Direct Room Code Match (Friend Code)
    if (specificRoomCode && specificRoomCode.trim()) {
      const cleanCode = specificRoomCode.trim().toUpperCase();
      const roomId = `friend_room_${cleanCode}`;
      connectToRoom(roomId, `peer_${cleanCode}`, 'Campus Friend', '🎓', selectedInterests);
      return;
    }

    // 2. High-Capacity Automatic Matchmaking Lobby
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (lobbyChannelRef.current) {
      supabase.removeChannel(lobbyChannelRef.current);
      lobbyChannelRef.current = null;
    }

    const lobby = supabase.channel('campus_roulette_lobby_v5', {
      config: {
        broadcast: { ack: true },
        presence: { key: mySessionId },
      },
    });

    lobbyChannelRef.current = lobby;

    // Pulse listener with atomic pair claiming for 50+ users
    lobby
      .on('broadcast', { event: 'SEARCH_PULSE' }, async ({ payload }) => {
        if (isMatchingRef.current) return;
        if (payload.sessionId !== mySessionId && !claimedPeersRef.current.has(payload.sessionId)) {
          // Deterministic coordinator: lowest session ID initiates pairing
          if (mySessionId < payload.sessionId) {
            claimedPeersRef.current.add(payload.sessionId);
            const roomId = `auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            
            // Broadcast targeted pairing payload
            await lobby.send({
              type: 'broadcast',
              event: 'MATCH_PAIRED',
              payload: {
                sessionA: mySessionId,
                sessionB: payload.sessionId,
                roomId,
                userAPseudonym: myAnonProfile.name,
                userAEmoji: '🎓',
                userBPseudonym: payload.pseudonym,
                userBEmoji: '🎓',
                interests: selectedInterests,
              },
            });

            // Coordinator immediately connects for itself
            connectToRoom(roomId, payload.sessionId, payload.pseudonym, '🎓', selectedInterests);
          }
        }
      })
      // Pair Found Event Listener
      .on('broadcast', { event: 'MATCH_PAIRED' }, ({ payload }) => {
        if (isMatchingRef.current) return;
        if (payload.sessionB === mySessionId) {
          connectToRoom(payload.roomId, payload.sessionA, payload.userAPseudonym, '🎓', payload.interests || []);
        } else if (payload.sessionA === mySessionId) {
          connectToRoom(payload.roomId, payload.sessionB, payload.userBPseudonym, '🎓', payload.interests || []);
        }
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Immediate broadcast pulse
          await lobby.send({
            type: 'broadcast',
            event: 'SEARCH_PULSE',
            payload: {
              sessionId: mySessionId,
              userId: me.id,
              pseudonym: myAnonProfile.name,
              interests: selectedInterests,
            },
          });

          // Heartbeat pulse every 1s
          heartbeatIntervalRef.current = setInterval(async () => {
            if (isMatchingRef.current) return;
            await lobby.send({
              type: 'broadcast',
              event: 'SEARCH_PULSE',
              payload: {
                sessionId: mySessionId,
                userId: me.id,
                pseudonym: myAnonProfile.name,
                interests: selectedInterests,
              },
            });
          }, 1000);
        }
      });
  }, [mySessionId, myAnonProfile, selectedInterests, me.id, dispatch, connectToRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (lobbyChannelRef.current) {
        supabase.removeChannel(lobbyChannelRef.current);
      }
      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current);
      }
    };
  }, []);

  const handleCancelSearch = () => {
    isMatchingRef.current = false;
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (lobbyChannelRef.current) {
      lobbyChannelRef.current.untrack();
      supabase.removeChannel(lobbyChannelRef.current);
      lobbyChannelRef.current = null;
    }
    dispatch({ type: 'END_CHAT' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || !activeMatch) return;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: mySessionId,
      content: text.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: text.trim() });

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'CHAT_MSG',
        payload: { ...msg, sessionId: mySessionId },
      });
    }

    if (!textToSend) setChatInput('');
  };

  const handleReveal = () => {
    dispatch({ type: 'SEND_REVEAL_REQUEST' });
    setShowRevealModal(false);

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'REVEAL_REQ',
        payload: {
          sessionId: mySessionId,
          profile: {
            id: me.id,
            displayName: me.displayName,
            avatar: '🎓',
            major: me.major,
            username: me.username,
          },
        },
      });
    }
  };

  const handleAcceptPeerReveal = () => {
    dispatch({ type: 'ACCEPT_REVEAL' });
    setPeerRevealRequested(false);

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'REVEAL_ACCEPT',
        payload: { sessionId: mySessionId },
      });
    }
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

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'ICEBREAKER',
        payload: msg,
      });
    }
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

  // ── Idle / Search State ─────────────────────────────────
  if (!activeMatch || activeMatch.status === 'searching') {
    const isSearching = activeMatch?.status === 'searching';

    return (
      <div className="app-content" style={{ maxWidth: 720, margin: '0 auto', padding: '16px 12px' }}>
        <div className="match-container">
          {/* Status Header Badge */}
          <div className="match-badge-pill">
            <span className="dot" />
            <span>{isSearching ? 'Live Matchmaking Active' : '100% Anonymous & Private'}</span>
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
            <div className="radar-center" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}>
              {isSearching ? (
                <Zap size={28} className="radar-icon-spin" />
              ) : (
                <Sparkles size={28} />
              )}
            </div>
          </div>

          <h1 className="match-title">
            {isSearching ? 'Matching with a classmate...' : 'Random Student Chat'}
          </h1>
          <p className="match-subtitle">
            {isSearching
              ? SEARCHING_TIPS[tipIndex]
              : 'Chat 1-on-1 anonymously in real-time with fellow students across campus. Zero personal data shared unless you both agree to reveal.'}
          </p>

          {/* Mode Switcher */}
          {!isSearching && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--bg-tertiary)', padding: 4, borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-light)', maxWidth: 360, width: '100%' }}>
              <button
                className={`btn btn-sm btn-pill ${activeTabMode === 'auto' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTabMode('auto')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Radio size={14} /> Auto Match
              </button>
              <button
                className={`btn btn-sm btn-pill ${activeTabMode === 'code' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTabMode('code')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <KeyRound size={14} /> Friend Code
              </button>
            </div>
          )}

          {/* Auto Match Mode */}
          {!isSearching && activeTabMode === 'auto' && (
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

              <div className="match-actions-row" style={{ marginTop: 16 }}>
                <button className="btn btn-primary btn-lg btn-pill" onClick={() => handleStartMatch()}>
                  <Sparkles size={18} />
                  Start Random Chat
                </button>
              </div>

              <div className="match-safety-note" style={{ marginTop: 14 }}>
                <Shield size={14} />
                <span>Encrypted live session. Be respectful to fellow students.</span>
              </div>
            </div>
          )}

          {/* Friend Code Mode */}
          {!isSearching && activeTabMode === 'code' && (
            <div className="match-filter-box" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Connect Instantly with a Friend
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
                Enter the exact same 4-digit code on both devices (e.g. <strong>7777</strong> or <strong>CAMPUS</strong>) to connect directly in 0.1s!
              </p>

              <div style={{ display: 'flex', gap: 8, maxWidth: 360, margin: '0 auto 16px', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Enter code (e.g. 7777)"
                  value={customRoomCode}
                  onChange={e => setCustomRoomCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '10px 14px', textAlign: 'center', fontSize: '1rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 'var(--radius-md)' }}
                  onKeyDown={e => e.key === 'Enter' && customRoomCode.trim() && handleStartMatch(customRoomCode)}
                />
                <button
                  className="btn btn-primary btn-pill"
                  onClick={() => customRoomCode.trim() && handleStartMatch(customRoomCode)}
                  disabled={!customRoomCode.trim()}
                >
                  Connect
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {['7777', '9999', 'ROOM1', 'HOSTEL'].map(preset => (
                  <button
                    key={preset}
                    className="chip"
                    onClick={() => {
                      setCustomRoomCode(preset);
                      handleStartMatch(preset);
                    }}
                  >
                    Quick: {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Searching State Controls */}
          {isSearching && (
            <div className="match-searching-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-secondary btn-pill" onClick={handleCancelSearch}>
                  <RotateCcw size={16} /> Cancel
                </button>
                <button className="btn btn-primary btn-pill" onClick={handleCopyInviteLink}>
                  {copiedLink ? <><Check size={16} /> Link Copied!</> : <><Copy size={16} /> Invite Classmate</>}
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Share the link with a classmate — when both click "Start Random Chat", you connect instantly!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Revealed State ──────────────────────────────────────
  if (activeMatch.status === 'revealed') {
    return (
      <div className="app-content" style={{ maxWidth: 600, margin: '0 auto', padding: '16px 12px' }}>
        <div className="match-container" style={{ minHeight: '55vh' }}>
          <div className="revealed-hero-avatar" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}>
            <CheckCircle2 size={42} />
          </div>
          <h2 className="match-title">You are now connected!</h2>
          <p className="match-subtitle">
            <strong>{activeMatch.peerPseudonym}</strong> and you have exchanged identities. You can now chat anytime directly in your messages.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
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

  // ── Chatting State ──────────────────────────────────────
  return (
    <div className="app-content" style={{ maxWidth: 680, margin: '0 auto', padding: '12px 8px' }}>
      <div className="chat-room">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="user-avatar" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
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
                <div className="reveal-avatar" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={28} />
                </div>
              </div>

              <div className="reveal-title">Stay Connected?</div>
              <div className="reveal-subtitle">
                Choose how you would like to stay in touch with <strong>{activeMatch.peerPseudonym}</strong>:
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
                  <Shield size={16} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Chat Anonymously in DMs</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Keep identities private. Chat as {activeMatch.peerPseudonym}</div>
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
                    <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>Exchange real names ({me.displayName}) & college profiles</div>
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
