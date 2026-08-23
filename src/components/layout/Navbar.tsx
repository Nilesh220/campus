// ============================================================
// Navbar Component
// ============================================================

import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER } from '../../data/mockData';
import NotificationDropdown from '../shared/NotificationDropdown';

const TAB_TITLES: Record<string, string> = {
  feed: 'Pulse Feed',
  match: 'Random Chat',
  groups: 'Groups & Hubs',
  bulletin: 'Bulletin Board',
  messages: 'Direct Messages',
};

export default function Navbar() {
  const { state, dispatch } = useApp();

  const unreadNotifs = state.notifications.filter(n => !n.isRead).length;

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

        <span className="navbar-logo">UniPulse</span>
        <span className="navbar-title">{TAB_TITLES[state.activeTab]}</span>
      </div>

      <div className="navbar-right">
        {/* Search */}
        <div className="navbar-search">
          <Search size={16} />
          <input type="text" placeholder="Search posts, groups, people..." />
        </div>

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' })}
          title={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS' })}
          >
            <Bell size={20} />
            {unreadNotifs > 0 && <span className="badge-count">{unreadNotifs}</span>}
          </button>
          {state.showNotifications && <NotificationDropdown />}
        </div>

        {/* User Avatar */}
        <div
          className="user-avatar online-indicator"
          onClick={() => dispatch({ type: 'TOGGLE_PROFILE' })}
        >
          {CURRENT_USER.avatar}
        </div>
      </div>
    </header>
  );
}
