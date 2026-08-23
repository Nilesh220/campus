// ============================================================
// Sidebar Navigation Component
// ============================================================

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
          <span className="sidebar-brand">UniPulse</span>
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

          <span className="sidebar-label" style={{ marginTop: 'auto' }}>Settings & Admin</span>
          <button className="sidebar-item" onClick={() => dispatch({ type: 'TOGGLE_ADMIN' })}>
            <Settings size={20} />
            Admin Dashboard
          </button>
          <button className="sidebar-item" onClick={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}>
            <Settings size={20} />
            Preferences
          </button>
          <button
            className="sidebar-item"
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                dispatch({ type: 'LOGOUT_USER' });
              }
            }}
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
    </>
  );
}
