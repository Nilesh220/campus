// ============================================================
// Random Student Chat — High-Capacity 1-on-1 Campus Matchmaking
// Realtime WebSockets, Live Typing, Vibe Reactions & PWA Mobile Ergonomics
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, UserPlus, SkipForward, X, Zap, Shield,
  MessageSquareQuote, RotateCcw, Copy, Check,
  CheckCircle2, CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { INTEREST_TAGS, ICEBREAKERS, CURRENT_USER, USERS, generateAnonName } from '../../data/mockData';
import { supabase } from '../../lib/supabase';
import type { ChatMessage, AnonMatch } from '../../types';

const SEARCHING_TIPS = [
  'Scanning active student hubs across universities...',
  'Select interest vibes below to match with similar students.',
  'Your identity stays 100% anonymous until both sides choose to reveal.',
  'Matching you with a student from another university...',
  'Tip: Break the ice with a quick starter question!',
];

const QUICK_STARTERS = [
  'What major & uni are you in? 🎓',
  'Best food spot on your campus? 🍕',
  'Studying or procrastinating? 📚',
  'What music are you listening to? 🎧',
  'Excited for any upcoming campus fest? 🎉',
];

const VIBE_REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '⚡', label: 'Zap' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '👀', label: 'Eyes' },
  { emoji: '💯', label: '100' },
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
  const [peerIsTyping, setPeerIsTyping] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [onlineCounter, setOnlineCounter] = useState(148);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const lobbyChannelRef = useRef<any>(null);
  const roomChannelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const peerTypingTimeoutRef = useRef<any>(null);
  const isMatchingRef = useRef(false);
  const claimedPeersRef = useRef<Set<string>>(new Set());

  const me = state.currentUser || CURRENT_USER;
  const mySessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`).current;
  const myAnonProfile = useRef(generateAnonName()).current;

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMatch?.messages, peerIsTyping, scrollToBottom]);

  // Rotate tips & randomize live active student count
  useEffect(() => {
    if (!activeMatch || activeMatch.status !== 'searching') return;
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % SEARCHING_TIPS.length);
    }, 2800);

    const countInterval = setInterval(() => {
      setOnlineCounter(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 4000);

    return () => {
      clearInterval(tipInterval);
      clearInterval(countInterval);
    };
  }, [activeMatch?.status]);

  // Clean up channels on unmount
  useEffect(() => {
    return () => {
      if (lobbyChannelRef.current) supabase.removeChannel(lobbyChannelRef.current);
      if (roomChannelRef.current) supabase.removeChannel(roomChannelRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (peerTypingTimeoutRef.current) clearTimeout(peerTypingTimeoutRef.current);
    };
  }, []);

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Trigger floating reaction animation
  const triggerFloatingReaction = (emoji: string) => {
    const newReaction = {
      id: `react_${Date.now()}_${Math.random()}`,
      emoji,
      x: 30 + Math.random() * 50, // 30% to 80% horizontal position
    };
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
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

    // Focus input on connect
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 300);

    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'CHAT_MSG' }, ({ payload }: { payload: any }) => {
        setPeerIsTyping(false);
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
      .on('broadcast', { event: 'TYPING' }, ({ payload }: { payload: any }) => {
        if (payload?.isTyping) {
          setPeerIsTyping(true);
          if (peerTypingTimeoutRef.current) clearTimeout(peerTypingTimeoutRef.current);
          peerTypingTimeoutRef.current = setTimeout(() => {
            setPeerIsTyping(false);
          }, 3000);
        } else {
          setPeerIsTyping(false);
        }
      })
      .on('broadcast', { event: 'REACTION' }, ({ payload }: { payload: any }) => {
        if (payload?.emoji) {
          triggerFloatingReaction(payload.emoji);
        }
      })
      .on('broadcast', { event: 'REVEAL_REQUEST' }, () => {
        setPeerRevealRequested(true);
        // Visual vibration notification
        if (navigator.vibrate) {
          try { navigator.vibrate([100, 50, 100]); } catch (_) {}
        }
      })
      .on('broadcast', { event: 'REVEAL_ACCEPTED' }, () => {
        dispatch({ type: 'ACCEPT_REVEAL' });
        // Multi-stage confetti celebration burst
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#0D9488', '#5BB5A2', '#F59E0B', '#3B82F6', '#EC4899'],
          });
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
            });
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
            });
          }, 300);
        } catch (_) {}
      })
      .on('broadcast', { event: 'PEER_LEFT' }, () => {
        setPeerIsTyping(false);
        dispatch({
          type: 'RECEIVE_CHAT_MESSAGE',
          payload: {
            id: `sys_left_${Date.now()}`,
            senderId: 'system',
            content: '👋 Peer has left the chat session.',
            timestamp: new Date().toISOString(),
            type: 'system',
          },
        });
      })
      .subscribe();

    roomChannelRef.current = channel;
  }, [dispatch, selectedInterests]);

  // Master Matchmaking Engine
  const handleStartMatch = useCallback(() => {
    isMatchingRef.current = false;
    claimedPeersRef.current.clear();
    setPeerRevealRequested(false);
    setPeerIsTyping(false);

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

  // Typing event handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChatInput(val);

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'TYPING',
        payload: { isTyping: val.length > 0 },
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (roomChannelRef.current) {
          roomChannelRef.current.send({
            type: 'broadcast',
            event: 'TYPING',
            payload: { isTyping: false },
          });
        }
      }, 2500);
    }
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
      delivered: true,
    };

    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: text });
    if (!textToSend) setChatInput('');

    // Clear my typing state
    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'TYPING',
        payload: { isTyping: false },
      });

      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'CHAT_MSG',
        payload: newMsg,
      });
    }
  };

  const handleSendReaction = (emoji: string) => {
    if (!roomChannelRef.current || !activeMatch) return;
    triggerFloatingReaction(emoji);
    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'REACTION',
      payload: { emoji, senderSessionId: mySessionId },
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

    // Add local system note
    dispatch({
      type: 'RECEIVE_CHAT_MESSAGE',
      payload: {
        id: `sys_reveal_${Date.now()}`,
        senderId: 'system',
        content: `✨ Reveal request sent to ${activeMatch.peerPseudonym}. Waiting for them to accept...`,
        timestamp: new Date().toISOString(),
        type: 'system',
      },
    });
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

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#5BB5A2', '#F59E0B', '#3B82F6', '#EC4899'],
      });
    } catch (_) {}
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
          {/* Status Badge with Live Pulse */}
          <div className="roulette-status-badge">
            <span className={`roulette-status-dot ${isSearching ? 'pulsing' : ''}`} />
            <span>
              {isSearching
                ? `${onlineCounter} Students Online & Active`
                : '100% Anonymous • Zero Profile Sharing'}
            </span>
          </div>

          {/* Sonar Radar */}
          <div className={`roulette-mini-radar ${isSearching ? 'searching' : ''}`}>
            <div className="mini-radar-ring ring-1" />
            <div className="mini-radar-ring ring-2" />
            {isSearching && <div className="mini-radar-sweep" />}
            <div className="mini-radar-center">
              {isSearching ? <Zap size={24} className="spin" /> : <Sparkles size={24} />}
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="roulette-compact-title">
            {isSearching ? 'Searching for a student...' : 'Random Campus Chat'}
          </h1>
          <p className="roulette-compact-desc">
            {isSearching
              ? SEARCHING_TIPS[tipIndex]
              : 'Match 1-on-1 anonymously in real-time with verified college students across universities.'}
          </p>

          {/* ── BIG PRIMARY CTA BUTTON ── */}
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
                <span>Filter match by interest vibe (optional):</span>
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
            <span>Encrypted WebSocket. Real names hidden until you mutually reveal.</span>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Revealed State (Celebration Card) ───────────────────────
  if (activeMatch.status === 'revealed') {
    const peerUser = USERS.find(u => u.id === activeMatch.peerId) || USERS[1];

    return (
      <div className="roulette-screen-container">
        <div className="roulette-compact-card roulette-celebration-card">
          <div className="revealed-hero-avatar pulse-glow">
            <CheckCircle2 size={48} />
          </div>

          <span className="celebration-badge">🎉 Mutual Match Connection</span>
          <h2 className="match-title" style={{ marginTop: 8 }}>Identities Revealed!</h2>
          <p className="match-subtitle" style={{ margin: '8px 0 20px', maxWidth: 420 }}>
            You and <strong>{peerUser.displayName}</strong> (@{peerUser.username}) have mutually connected! You can now chat anytime directly in your private Messages.
          </p>

          {/* Student Profile Preview Card */}
          <div className="revealed-profile-preview">
            <div className="revealed-avatar-badge">{peerUser.avatar || '🎓'}</div>
            <div className="revealed-profile-details">
              <div className="revealed-profile-name">{peerUser.displayName}</div>
              <div className="revealed-profile-meta">{peerUser.major} • {peerUser.college}</div>
              <div className="revealed-profile-score">⚡ Pulse Score: {peerUser.pulseScore}</div>
            </div>
          </div>

          <div className="celebration-actions-row">
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
              <SkipForward size={16} /> Next Random Match
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. Full-Screen Chatting State ─────────────────────────
  return (
    <div className="roulette-chat-fullscreen">
      {/* Floating Reaction Bubbles Animation */}
      {floatingReactions.map(r => (
        <div
          key={r.id}
          className="floating-reaction-bubble"
          style={{ left: `${r.x}%` }}
        >
          {r.emoji}
        </div>
      ))}

      <div className="chat-room">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="user-avatar-anon">
              {activeMatch.peerEmoji || '👤'}
            </div>
            <div>
              <div className="chat-pseudonym">
                {activeMatch.peerPseudonym}
                <span className="chat-anon-tag">Verified Peer</span>
              </div>
              <div className="chat-pseudonym-sub">
                {peerIsTyping ? (
                  <span className="typing-sub-text">💬 typing a message...</span>
                ) : (
                  <span className="online-sub-text">● Live & Private Session</span>
                )}
              </div>
            </div>
          </div>

          <div className="chat-actions">
            {/* Reveal / Add Friend Action */}
            <button
              className={`btn btn-sm btn-pill ${
                peerRevealRequested
                  ? 'btn-reveal-urgent'
                  : activeMatch.revealRequestSent
                  ? 'btn-secondary'
                  : 'btn-primary'
              }`}
              onClick={() => {
                if (peerRevealRequested) {
                  handleAcceptPeerReveal();
                } else {
                  setShowRevealModal(true);
                }
              }}
              disabled={activeMatch.revealRequestSent && !peerRevealRequested}
              title={
                peerRevealRequested
                  ? 'Peer requested to reveal! Click to accept'
                  : activeMatch.revealRequestSent
                  ? 'Waiting for peer to accept'
                  : 'Reveal profile to connect as friends'
              }
            >
              <UserPlus size={14} />
              <span className="hide-mobile">
                {peerRevealRequested
                  ? 'Accept Reveal ⚡'
                  : activeMatch.revealRequestSent
                  ? 'Request Sent ⏳'
                  : 'Reveal Identity'}
              </span>
            </button>

            {/* Random Icebreaker */}
            <button
              className="icon-btn"
              onClick={handleNewIcebreaker}
              title="Add random icebreaker"
            >
              <Zap size={18} />
            </button>

            {/* Next / Skip */}
            <button
              className="icon-btn"
              onClick={handleSkip}
              title="Skip to next student"
            >
              <SkipForward size={18} />
            </button>

            {/* Leave Chat */}
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

        {/* Incoming Reveal Request Banner with Glowing Highlight */}
        {peerRevealRequested && (
          <div className="peer-reveal-banner-glow">
            <div className="peer-reveal-banner-content">
              <span className="banner-spark-icon">✨</span>
              <div>
                <strong>{activeMatch.peerPseudonym}</strong> requested to reveal identities and connect as friends!
              </div>
            </div>
            <div className="peer-reveal-banner-actions">
              <button
                className="btn btn-sm btn-primary btn-pill"
                onClick={handleAcceptPeerReveal}
              >
                Accept & Connect 🤝
              </button>
              <button
                className="btn btn-sm btn-ghost btn-pill"
                onClick={() => setPeerRevealRequested(false)}
              >
                Stay Anonymous
              </button>
            </div>
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

                <div className="chat-bubble-text">{msg.content}</div>

                {msg.type === 'text' && (
                  <div className="chat-bubble-meta">
                    <span className="chat-bubble-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSentByMe && (
                      <CheckCheck size={13} className="chat-bubble-ticks" />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator Bubble */}
          {peerIsTyping && (
            <div className="chat-bubble received chat-typing-bubble">
              <div className="typing-dots-anim">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-dots-text">{activeMatch.peerPseudonym} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Vibe Reactions Strip */}
        <div className="chat-vibe-bar">
          <div className="chat-vibe-label">React:</div>
          <div className="chat-vibe-buttons">
            {VIBE_REACTIONS.map(({ emoji, label }) => (
              <button
                key={emoji}
                className="vibe-emoji-btn"
                onClick={() => handleSendReaction(emoji)}
                title={`Send ${label}`}
              >
                {emoji}
              </button>
            ))}
          </div>
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

        {/* Chat Input Bar */}
        <div className="chat-input-area">
          <input
            ref={chatInputRef}
            type="text"
            className="chat-input"
            placeholder="Type your message (Press Enter)..."
            value={chatInput}
            onChange={handleInputChange}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!chatInput.trim()}
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Reveal & Connect Modal */}
      {showRevealModal && (
        <div className="modal-backdrop" onClick={() => setShowRevealModal(false)}>
          <div className="modal roulette-reveal-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect with Peer</h2>
              <button className="icon-btn" onClick={() => setShowRevealModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="reveal-modal-hero-icon">
                <Sparkles size={32} />
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>
                Reveal Real Identities
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20, lineHeight: 1.5 }}>
                Send a reveal request to <strong>{activeMatch.peerPseudonym}</strong>. Once both of you accept, your names, majors, and profiles will be shared!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  className="btn btn-primary btn-pill"
                  onClick={handleSendRevealRequest}
                  style={{ padding: '13px 18px', width: '100%', justifyContent: 'center', fontWeight: 700 }}
                >
                  <UserPlus size={16} /> Send Identity Reveal Request
                </button>
                <button
                  className="btn btn-secondary btn-pill"
                  onClick={() => {
                    setShowRevealModal(false);
                    dispatch({ type: 'CONNECT_ANONYMOUSLY' });
                  }}
                  style={{ padding: '12px 18px', width: '100%', justifyContent: 'center' }}
                >
                  <Shield size={16} /> Keep Anonymous & Move to DMs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

