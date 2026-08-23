// ============================================================
// Bulletin Board — Campus Announcements (Supabase Connected)
// ============================================================

import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Timer, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ANNOUNCEMENT_CATEGORIES } from '../../data/mockData';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import type { Announcement, RSVPStatus } from '../../types';

const BULLETIN_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'fest', label: 'Fests' },
  { id: 'exam', label: 'Exams' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'club', label: 'Clubs' },
  { id: 'sports', label: 'Sports' },
];

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Event started'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function BulletinBoard() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = state.announcements.filter(a =>
    filter === 'all' ? true : a.category === filter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="app-content" style={{ maxWidth: 720 }}>
      <div className="feed-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="feed-title">Bulletin Board</h1>
          <p className="feed-subtitle">Official campus announcements, fests, exams, and event schedules.</p>
        </div>
        {(state.currentUser?.isAdmin || state.currentUser?.email === 'guptanilesh417@gmail.com') && (
          <button
            className="btn btn-primary btn-pill btn-sm"
            onClick={() => dispatch({ type: 'TOGGLE_CREATE_ANNOUNCEMENT' })}
          >
            <Plus size={16} />
            Post Announcement
          </button>
        )}
      </div>

      <div className="feed-filters" style={{ marginBottom: 'var(--space-2xl)' }}>
        {BULLETIN_FILTERS.map(f => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sorted.length > 0 ? (
        <div className="announcement-list">
          {sorted.map((a, i) => (
            <AnnouncementCard key={a.id} announcement={a} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📢</div>
          <div className="empty-state-title">No Official Announcements Posted</div>
          <div className="empty-state-desc">Official campus fests, exam notices, and university events will appear here.</div>
          {(state.currentUser?.isAdmin || state.currentUser?.email === 'guptanilesh417@gmail.com') && (
            <button
              className="btn btn-primary btn-pill"
              style={{ marginTop: 16 }}
              onClick={() => dispatch({ type: 'TOGGLE_CREATE_ANNOUNCEMENT' })}
            >
              <Plus size={16} /> Post First Announcement
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {state.showCreateAnnouncement && <CreateAnnouncementModal />}
    </div>
  );
}

function AnnouncementCard({ announcement: a, index }: { announcement: Announcement; index: number }) {
  const { dispatch } = useApp();
  const countdown = useCountdown(a.date);
  const cat = ANNOUNCEMENT_CATEGORIES[a.category] || { label: 'General', icon: '📋', color: '#5B8EC9' };

  const handleRsvp = (status: RSVPStatus) => {
    dispatch({ type: 'RSVP_ANNOUNCEMENT', payload: { id: a.id, status } });
  };

  return (
    <div className="announcement-card" style={{ animationDelay: `${index * 0.06}s` }}>
      {/* Cover */}
      <div className="announcement-cover" style={{ background: a.coverGradient }}>
        <span className="announcement-cover-icon">{cat.icon}</span>
        {a.isPinned && <span className="announcement-pinned">📌 Pinned</span>}
      </div>

      <div className="announcement-body">
        {/* Countdown */}
        {countdown && (
          <div className="announcement-countdown">
            <Timer size={12} />
            {countdown}
          </div>
        )}

        <h3 className="announcement-title">{a.title}</h3>
        <p className="announcement-desc">{a.description}</p>

        {/* Meta */}
        <div className="announcement-meta">
          <span className="announcement-meta-item">
            <Calendar size={14} /> {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="announcement-meta-item">
            <MapPin size={14} /> {a.location}
          </span>
          <span className="announcement-meta-item">
            <User size={14} /> {a.organizer}
          </span>
        </div>

        {/* Tags */}
        {a.tags && a.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {a.tags.map(t => (
              <span key={t} className="post-tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="announcement-footer">
        <div className="rsvp-buttons">
          <button
            className={`rsvp-btn ${a.userRsvp === 'going' ? 'active-going' : ''}`}
            onClick={() => handleRsvp('going')}
          >
            ✅ Going {a.rsvpCount > 0 ? `(${a.rsvpCount})` : ''}
          </button>
          <button
            className={`rsvp-btn ${a.userRsvp === 'interested' ? 'active-interested' : ''}`}
            onClick={() => handleRsvp('interested')}
          >
            ⭐ Interested {a.interestedCount > 0 ? `(${a.interestedCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
