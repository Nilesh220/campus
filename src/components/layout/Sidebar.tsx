// ============================================================
// Sidebar Navigation Component
// ============================================================

import { useState, useEffect } from 'react';
import {
  Flame, Shuffle, Users, Megaphone, MessageCircle,
  Settings, LogOut, ShieldCheck, User, Sparkles, Vote, Ghost, Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';
import type { NavTab } from '../../types';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'feed', label: 'Pulse Feed', icon: <Flame size={19} /> },
  { id: 'polls', label: 'Polls & Hot Takes', icon: <Vote size={19} /> },
  { id: 'confessions', label: 'Confessions Wall', icon: <Ghost size={19} /> },
  { id: 'match', label: 'Random Chat', icon: <Shuffle size={19} /> },
  { id: 'groups', label: 'Groups & Hubs', icon: <Users size={19} /> },
  { id: 'bulletin', label: 'Bulletin Board', icon: <Megaphone size={19} /> },
  { id: 'messages', label: 'Direct Messages', icon: <MessageCircle size={19} /> },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unreadDMs = state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const currentUser = state.currentUser || CURRENT_USER;
  const isAdmin = currentUser.isAdmin || currentUser.email?.toLowerCase().includes('guptanilesh417');

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install CampusSparks:\n• On iPhone: Tap Share -> Add to Home Screen\n• On Android/Chrome: Tap Menu -> Install App');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${state.sidebarOpen ? 'visible' : ''}`}
        onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
      />

      <aside className={`sidebar ${state.sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} style={{ color: 'var(--accent)' }} />
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
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
              {item.badge && (
                <span className="sidebar-nav-chip">{item.badge}</span>
              )}
              {item.id === 'messages' && unreadDMs > 0 && (
                <span className="item-badge">{unreadDMs}</span>
              )}
            </button>
          ))}

          {/* Web Push Notification Enable Prompt */}
          {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
            <button
              className="sidebar-item"
              onClick={() => notificationService.requestPermission()}
              style={{ color: 'var(--accent)', fontWeight: 600 }}
            >
              <Bell size={19} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>Enable Push Alerts</span>
            </button>
          )}

          {/* PWA Install Banner Button */}
          {!isInstalled && (
            <button
              className="sidebar-item pwa-install-sidebar-btn"
              onClick={handleInstallClick}
              style={{
                marginTop: 8,
                background: 'var(--accent-bg-strong)',
                color: 'var(--accent)',
                fontWeight: 700,
                border: '1px dashed var(--accent)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>Install App</span>
              <span className="sidebar-nav-chip" style={{ background: 'var(--accent)', color: 'white', fontSize: '0.65rem' }}>PWA</span>
            </button>
          )}

          <span className="sidebar-label" style={{ marginTop: 'auto' }}>
            {isAdmin ? 'Management' : 'Settings'}
          </span>
          {isAdmin && (
            <button className="sidebar-item" onClick={() => dispatch({ type: 'TOGGLE_ADMIN' })}>
              <ShieldCheck size={19} style={{ color: 'var(--accent)' }} />
              Admin Portal
            </button>
          )}
          <button className="sidebar-item" onClick={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}>
            <Settings size={19} />
            Preferences
          </button>
          <button
            className="sidebar-item"
            onClick={() => setShowLogoutConfirm(true)}
            style={{ color: 'var(--color-error)' }}
          >
            <LogOut size={19} />
            Log Out
          </button>
        </nav>

        {/* Footer - Current User */}
        <div className="sidebar-footer">
          <div
            className="user-avatar online-indicator"
            onClick={() => dispatch({ type: 'TOGGLE_PROFILE' })}
            style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <User size={18} />
          </div>
          <div className="sidebar-footer-info" onClick={() => dispatch({ type: 'TOGGLE_PROFILE' })} style={{ cursor: 'pointer' }}>
            <div className="sidebar-footer-name">{currentUser.displayName}</div>
            <div className="sidebar-footer-major">
              @{currentUser.username || currentUser.email?.split('@')[0] || 'student'} • {currentUser.major}
            </div>
          </div>
        </div>
      </aside>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" style={{ maxWidth: 380, padding: 24, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(199, 92, 92, 0.15)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <LogOut size={24} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Confirm Log Out
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>
              Are you sure you want to end your active session on CampusSparks?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-pill" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-pill"
                style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)', color: 'white' }}
                onClick={() => {
                  setShowLogoutConfirm(false);
                  dispatch({ type: 'LOGOUT_USER' });
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
