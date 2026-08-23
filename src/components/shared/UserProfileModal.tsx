// ============================================================
// User Profile Modal — Clean Lucide Icons & Responsive Design
// ============================================================

import { X, GraduationCap, Building2, Calendar, User, Award } from 'lucide-react';
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
      <div className="modal" style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header BG */}
        <div className="profile-header-bg" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)', height: 80 }} />

        <div className="profile-modal-content" style={{ padding: '0 24px 24px' }}>
          {/* Avatar */}
          <div className="profile-avatar-wrapper" style={{ marginTop: -40, marginBottom: 12 }}>
            <div className="profile-avatar-ring" />
            <div className="user-avatar xl" style={{ background: 'var(--bg-secondary)', color: 'var(--accent)', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={36} />
            </div>
          </div>

          {/* Info */}
          <div className="profile-name" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.displayName}</div>
          <div className="profile-username" style={{ color: 'var(--accent)', fontWeight: 600 }}>@{user.username || user.email?.split('@')[0] || 'student'}</div>
          <div className="profile-bio" style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.bio || 'Building, learning and exploring campus life'}</div>

          {/* Stats */}
          <div className="profile-stats" style={{ display: 'flex', justifyContent: 'space-around', margin: '18px 0', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div className="profile-stat" style={{ textAlign: 'center' }}>
              <div className="profile-stat-value" style={{ fontWeight: 800, color: 'var(--accent)' }}>{user.pulseScore || 100}</div>
              <div className="profile-stat-label" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Pulse Score</div>
            </div>
            <div className="profile-stat" style={{ textAlign: 'center' }}>
              <div className="profile-stat-value" style={{ fontWeight: 800 }}>{badges.length}</div>
              <div className="profile-stat-label" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Badges</div>
            </div>
            <div className="profile-stat" style={{ textAlign: 'center' }}>
              <div className="profile-stat-value" style={{ fontWeight: 800 }}>{user.graduationYear || 2027}</div>
              <div className="profile-stat-label" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Grad Year</div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="profile-badges" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
              {badges.map(b => (
                <span
                  key={b.id}
                  className="profile-badge"
                  style={{ background: b.color + '20', color: b.color, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600 }}
                  title={b.description}
                >
                  <Award size={12} /> {b.name}
                </span>
              ))}
            </div>
          )}

          {/* Hobbies */}
          <div className="profile-hobbies" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
            {hobbies.map(h => (
              <span key={h} className="chip" style={{ fontSize: '0.75rem' }}>{h}</span>
            ))}
          </div>

          {/* Details */}
          <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-light)', paddingTop: 14 }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={16} style={{ color: 'var(--accent)' }} /> {user.major}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={16} style={{ color: 'var(--accent)' }} /> {user.college}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} style={{ color: 'var(--accent)' }} /> Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          className="icon-btn"
          style={{ position: 'absolute', top: 12, right: 12, color: 'white', background: 'rgba(0,0,0,0.3)' }}
          onClick={() => dispatch({ type: 'TOGGLE_PROFILE', payload: null })}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
