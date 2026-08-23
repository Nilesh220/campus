// ============================================================
// Sidebar Navigation Component
// ============================================================

import { useState } from 'react';
import {
  Flame, Shuffle, Users, Megaphone, MessageCircle,
  Settings, LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER } from '../../data/mockData';
import type { NavTab } from '../../types';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'feed', label: 'Pulse Feed', icon: <Flame size={20} /> },
  { id: 'match', label: 'Random Chat', icon: <Shuffle size={20} /> },
  { id: 'groups', label: 'Groups & Hubs', icon: <Users size={20} /> },
  { id: 'bulletin', label: 'Bulletin Board', icon: <Megaphone size={20} /> },
  { id: 'messages', label: 'Direct Messages', icon: <MessageCircle size={20} /> },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unreadDMs = state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${state.sidebarOpen ? 'visible' : ''}`}
        onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
      />

      <aside className={`sidebar ${state.sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-header">
          <span className="sidebar-brand">CampusSparks</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-label">Navigate</span>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${state.activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                dispatch({ type: 'SET_TAB', payload: item.id });
                dispatch({ type: 'CLOSE_SIDEBAR' });
              }}
            >
              {item.icon}
              {item.label}
              {item.id === 'messages' && unreadDMs > 0 && (
                <span className="item-badge">{unreadDMs}</span>
              )}
            </button>
          ))}

          <span className="sidebar-label" style={{ marginTop: 'auto' }}>
            {(state.currentUser?.isAdmin || state.currentUser?.email?.toLowerCase().includes('guptanilesh417') || state.currentUser?.displayName?.toLowerCase().includes('guptanilesh417')) ? 'Settings & Admin' : 'Settings'}
          </span>
          {(state.currentUser?.isAdmin || state.currentUser?.email?.toLowerCase().includes('guptanilesh417') || state.currentUser?.displayName?.toLowerCase().includes('guptanilesh417')) && (
            <button className="sidebar-item" onClick={() => dispatch({ type: 'TOGGLE_ADMIN' })}>
              <Settings size={20} />
              Admin Dashboard
            </button>
          )}
          <button className="sidebar-item" onClick={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}>
            <Settings size={20} />
            Preferences
          </button>
          <button
            className="sidebar-item"
            onClick={() => setShowLogoutConfirm(true)}
            style={{ color: 'var(--color-error)' }}
          >
            <LogOut size={20} />
            Log Out
          </button>
        </nav>

        {/* Footer - Current User */}
        <div className="sidebar-footer">
          <div
            className="user-avatar online-indicator"
            onClick={() => dispatch({ type: 'TOGGLE_PROFILE' })}
          >
            {(state.currentUser || CURRENT_USER).avatar}
          </div>
          <div className="sidebar-footer-info">
            <div className="sidebar-footer-name">{(state.currentUser || CURRENT_USER).displayName}</div>
            <div className="sidebar-footer-major">{(state.currentUser || CURRENT_USER).major} • {(state.currentUser || CURRENT_USER).graduationYear}</div>
          </div>
        </div>
      </aside>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" style={{ maxWidth: 380, padding: 24, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(199, 92, 92, 0.12)',
                color: 'var(--color-error)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <LogOut size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Log out of CampusSparks?
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              You will be signed out and returned to the campus landing page.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary btn-pill"
                style={{ flex: 1 }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-pill"
                style={{ flex: 1, background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                onClick={() => {
                  setShowLogoutConfirm(false);
                  dispatch({ type: 'LOGOUT_USER' });
                  dispatch({ type: 'CLOSE_SIDEBAR' });
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
