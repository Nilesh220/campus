// ============================================================
// User Profile Modal
// ============================================================

import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USERS, CURRENT_USER } from '../../data/mockData';

export default function UserProfileModal() {
  const { state, dispatch } = useApp();

  if (!state.showProfile || !state.profileUserId) return null;

  const activeUser = state.currentUser || CURRENT_USER;
  const user = (!state.profileUserId || state.profileUserId === activeUser.id || state.profileUserId === CURRENT_USER.id)
    ? activeUser
    : USERS.find(u => u.id === state.profileUserId) || activeUser;

  const badges = user.badges || [];
  const hobbies = user.hobbies || ['Coding', 'Music', 'Campus Life'];

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'TOGGLE_PROFILE', payload: null })}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        {/* Header BG */}
        <div className="profile-header-bg" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #A78BCA 100%)' }} />

        <div className="profile-modal-content">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-ring" />
            <div className="user-avatar xl" style={{ background: 'var(--bg-secondary)', position: 'relative', zIndex: 1 }}>
              {user.avatar || '🎓'}
            </div>
          </div>

          {/* Info */}
          <div className="profile-name">{user.displayName}</div>
          <div className="profile-username">@{user.username || user.email?.split('@')[0] || 'student'}</div>
          <div className="profile-bio">{user.bio || 'Building, learning & exploring campus life ☕'}</div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">{user.pulseScore || 100}</div>
              <div className="profile-stat-label">Pulse Score</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{badges.length}</div>
              <div className="profile-stat-label">Badges</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{user.graduationYear || 2027}</div>
              <div className="profile-stat-label">Grad Year</div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="profile-badges">
              {badges.map(b => (
                <span
                  key={b.id}
                  className="profile-badge"
                  style={{ background: b.color + '20', color: b.color }}
                  title={b.description}
                >
                  {b.icon} {b.name}
                </span>
              ))}
            </div>
          )}

          {/* Hobbies */}
          <div className="profile-hobbies">
            {hobbies.map(h => (
              <span key={h} className="chip">{h}</span>
            ))}
          </div>

          {/* Details */}
          <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
              🎓 {user.major}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
              🏫 {user.college}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              📅 Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          className="icon-btn"
          style={{ position: 'absolute', top: 12, right: 12, color: 'white' }}
          onClick={() => dispatch({ type: 'TOGGLE_PROFILE', payload: null })}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
