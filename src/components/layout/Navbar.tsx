// ============================================================
// CampusSparks — Navigation Bar
// Professional Lucide Icons, Search & Responsive Header
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Sun, Moon, UserPlus, Check, X, User as UserIcon, Users as UsersIcon, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER, USERS } from '../../data/mockData';
import NotificationDropdown from '../shared/NotificationDropdown';
import type { User, DirectConversation } from '../../types';

const TAB_TITLES: Record<string, string> = {
  feed: 'Pulse Feed',
  match: 'Random Chat',
  groups: 'Groups & Hubs',
  bulletin: 'Bulletin Board',
  messages: 'Direct Messages',
};

export default function Navbar() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = state.notifications.filter(n => !n.isRead).length;
  const currentUser = state.currentUser || CURRENT_USER;

  // Search Results
  const matchedUsers = USERS.filter(u => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().replace(/^@/, '');
    return u.username.toLowerCase().includes(q) ||
           u.displayName.toLowerCase().includes(q) ||
           u.major.toLowerCase().includes(q);
  });

  const matchedGroups = state.groups.filter(g => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendFriendRequest = (user: User) => {
    setSentRequests(prev => [...prev, user.id]);

    // Create a new direct message conversation with friend request indicator
    const newConv: DirectConversation = {
      id: `conv_${user.id}_${Date.now()}`,
      participantId: user.id,
      messages: [
        {
          id: `dm_${Date.now()}`,
          senderId: currentUser.id,
          content: `Hey @${user.username}! Friend request sent from ${currentUser.displayName}`,
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ],
      lastMessage: `Friend request sent to @${user.username}`,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };

    dispatch({
      type: 'SELECT_CONVERSATION',
      payload: newConv.id,
    });
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Mobile menu button */}
        <button
          className="icon-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={22} />
        </button>
        <style>{`
          @media (max-width: 1024px) {
            #mobile-menu-btn { display: flex !important; }
          }
        `}</style>

        <span className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={18} style={{ color: 'var(--accent)' }} /> CampusSparks
        </span>
        <span className="navbar-title">{TAB_TITLES[state.activeTab] || 'CampusSparks'}</span>
      </div>

      <div className="navbar-right">
        {/* Global Live Search */}
        <div className="navbar-search" ref={searchRef} style={{ position: 'relative' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search @username, hubs, major..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />
          {searchQuery && (
            <button
              className="icon-btn"
              style={{ width: 20, height: 20, padding: 0 }}
              onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
            >
              <X size={13} />
            </button>
          )}

          {/* Search Dropdown Popup */}
          {showSearchResults && searchQuery.trim() && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 320,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px',
                zIndex: 110,
                maxHeight: 380,
                overflowY: 'auto',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Users Header */}
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserIcon size={12} /> Students & Peers ({matchedUsers.length})
              </div>

              {matchedUsers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {matchedUsers.map(user => {
                    const isRequested = sentRequests.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-tertiary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                            {user.displayName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {user.displayName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>
                              @{user.username}
                            </div>
                          </div>
                        </div>

                        <button
                          className={`btn btn-sm btn-pill ${isRequested ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                          onClick={() => handleSendFriendRequest(user)}
                        >
                          {isRequested ? (
                            <>
                              <Check size={12} /> Sent
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} /> Request
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                  No students found matching "@{searchQuery}"
                </div>
              )}

              {/* Groups Header */}
              {matchedGroups.length > 0 && (
                <>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <UsersIcon size={12} /> Campus Hubs ({matchedGroups.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matchedGroups.map(group => (
                      <div
                        key={group.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          dispatch({ type: 'SET_TAB', payload: 'groups' });
                          dispatch({ type: 'SELECT_GROUP', payload: group.id });
                          setShowSearchResults(false);
                        }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UsersIcon size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {group.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                            {group.memberCount} members • {group.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' })}
          title={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {state.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS' })}
          >
            <Bell size={18} />
            {unreadNotifs > 0 && <span className="badge-count">{unreadNotifs}</span>}
          </button>
          {state.showNotifications && <NotificationDropdown />}
        </div>

        {/* User Avatar */}
        <div
          className="user-avatar online-indicator"
          onClick={() => dispatch({ type: 'TOGGLE_PROFILE' })}
          style={{ cursor: 'pointer', background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Open Profile"
        >
          <UserIcon size={18} />
        </div>
      </div>
    </header>
  );
}
