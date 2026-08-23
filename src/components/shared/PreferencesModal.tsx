// ============================================================
// Preferences Modal — Settings & Customization
// ============================================================

import { X, Sun, Moon, Bell, BellOff, Shield, Eye, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER } from '../../data/mockData';
import { useState } from 'react';

export default function PreferencesModal() {
  const { state, dispatch } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dmNotifications, setDmNotifications] = useState(true);
  const [anonymousDefault, setAnonymousDefault] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  if (!state.showPreferences) return null;

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Preferences</span>
          <button className="icon-btn" onClick={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Profile Section */}
          <div className="prefs-section">
            <div className="prefs-section-title">Profile</div>
            <div className="prefs-profile-card">
              <div className="user-avatar lg" style={{ background: 'var(--accent-bg-strong)' }}>
                {CURRENT_USER.avatar}
              </div>
              <div className="prefs-profile-info">
                <div className="prefs-profile-name">{CURRENT_USER.displayName}</div>
                <div className="prefs-profile-detail">{CURRENT_USER.major} • Class of {CURRENT_USER.graduationYear}</div>
                <div className="prefs-profile-detail">{CURRENT_USER.college}</div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="prefs-section">
            <div className="prefs-section-title">
              <Palette size={15} />
              Appearance
            </div>
            <div className="prefs-row">
              <div className="prefs-row-info">
                <div className="prefs-row-label">Theme</div>
                <div className="prefs-row-desc">Switch between light and dark mode</div>
              </div>
              <div className="prefs-theme-toggle">
                <button
                  className={`prefs-theme-btn ${state.theme === 'light' ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}
                >
                  <Sun size={14} />
                  Light
                </button>
                <button
                  className={`prefs-theme-btn ${state.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
                >
                  <Moon size={14} />
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="prefs-section">
            <div className="prefs-section-title">
              <Bell size={15} />
              Notifications
            </div>
            <div className="prefs-row">
              <div className="prefs-row-info">
                <div className="prefs-row-label">
                  {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                  Push Notifications
                </div>
                <div className="prefs-row-desc">Get notified about upvotes, comments, and matches</div>
              </div>
              <button
                className={`toggle ${notificationsEnabled ? 'active' : ''}`}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              />
            </div>
            <div className="prefs-row">
              <div className="prefs-row-info">
                <div className="prefs-row-label">DM Notifications</div>
                <div className="prefs-row-desc">Sound alerts for new direct messages</div>
              </div>
              <button
                className={`toggle ${dmNotifications ? 'active' : ''}`}
                onClick={() => setDmNotifications(!dmNotifications)}
              />
            </div>
          </div>

          {/* Privacy Section */}
          <div className="prefs-section">
            <div className="prefs-section-title">
              <Shield size={15} />
              Privacy
            </div>
            <div className="prefs-row">
              <div className="prefs-row-info">
                <div className="prefs-row-label">
                  <Eye size={14} />
                  Show Online Status
                </div>
                <div className="prefs-row-desc">Let others see when you're active</div>
              </div>
              <button
                className={`toggle ${showOnlineStatus ? 'active' : ''}`}
                onClick={() => setShowOnlineStatus(!showOnlineStatus)}
              />
            </div>
            <div className="prefs-row">
              <div className="prefs-row-info">
                <div className="prefs-row-label">Default to Anonymous</div>
                <div className="prefs-row-desc">Post anonymously by default</div>
              </div>
              <button
                className={`toggle ${anonymousDefault ? 'active' : ''}`}
                onClick={() => setAnonymousDefault(!anonymousDefault)}
              />
            </div>
          </div>

          {/* About Section */}
          <div className="prefs-section" style={{ borderBottom: 'none' }}>
            <div className="prefs-section-title">About</div>
            <div className="prefs-about">
              <div className="prefs-about-row">
                <span>Version</span>
                <span style={{ color: 'var(--text-tertiary)' }}>2.0.0</span>
              </div>
              <div className="prefs-about-row">
                <span>Pulse Score</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{CURRENT_USER.pulseScore}</span>
              </div>
              <div className="prefs-about-row">
                <span>Member Since</span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(CURRENT_USER.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
