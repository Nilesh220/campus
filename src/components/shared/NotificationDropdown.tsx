// ============================================================
// Notification Dropdown
// ============================================================

import { useApp } from '../../context/AppContext';
import { useEffect, useRef } from 'react';

const NOTIF_ICONS: Record<string, { bg: string; icon: string }> = {
  upvote: { bg: 'var(--accent-bg)', icon: '🔥' },
  comment: { bg: 'var(--bg-tertiary)', icon: '💬' },
  'friend-request': { bg: 'var(--bg-tertiary)', icon: '🤝' },
  match: { bg: 'var(--accent-bg)', icon: '🎰' },
  'group-invite': { bg: 'var(--bg-tertiary)', icon: '👥' },
  announcement: { bg: 'var(--bg-tertiary)', icon: '📢' },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationDropdown() {
  const { state, dispatch } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
      }
    }
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [dispatch]);

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-header">
        <span className="notif-title">Notifications</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => dispatch({ type: 'MARK_NOTIFICATIONS_READ' })}
        >
          Mark all read
        </button>
      </div>
      {state.notifications.map(n => {
        const style = NOTIF_ICONS[n.type] || NOTIF_ICONS.announcement;
        return (
          <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
            <div className="notif-icon" style={{ background: style.bg }}>
              {style.icon}
            </div>
            <div className="notif-content">
              <div className="notif-content-title">{n.title}</div>
              <div className="notif-content-message">{n.message}</div>
            </div>
            <span className="notif-time">{timeAgo(n.timestamp)}</span>
          </div>
        );
      })}
    </div>
  );
}
