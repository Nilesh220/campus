// ============================================================
// Bulletin Board — Campus Announcements
// Professional Lucide Icons & Responsive Design
// ============================================================

import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, User, Timer, Plus, Megaphone,
  Pin, Check, Sparkles, FileText, Code, Users, Bell, Trophy
} from 'lucide-react';
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

function getCategoryIcon(cat: string) {
  switch (cat) {
    case 'exam': return <FileText size={13} />;
    case 'fest': return <Sparkles size={13} />;
    case 'hackathon': return <Code size={13} />;
    case 'club': return <Users size={13} />;
    case 'sports': return <Trophy size={13} />;
    default: return <Bell size={13} />;
  }
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Event started'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setTimeLeft(`${d}d ${h}h left`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m left`);
      else setTimeLeft(`${m}m left`);
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

  const isAdmin = state.currentUser?.isAdmin || state.currentUser?.email === 'guptanilesh417@gmail.com';

  const filtered = state.announcements.filter(a =>
    filter === 'all' ? true : a.category === filter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="app-content" style={{ maxWidth: 760, margin: '0 auto', padding: '16px 12px' }}>
      <div className="feed-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="feed-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Megaphone size={24} style={{ color: 'var(--accent)' }} /> Bulletin Board
          </h1>
          <p className="feed-subtitle">Official campus announcements, fests, exams, and event schedules.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary btn-pill btn-sm"
            onClick={() => dispatch({ type: 'TOGGLE_CREATE_ANNOUNCEMENT' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Post Announcement
          </button>
        )}
      </div>

      <div className="feed-filters" style={{ marginBottom: 20 }}>
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
          <div className="empty-state-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Megaphone size={28} />
          </div>
          <div className="empty-state-title">No Official Announcements Posted</div>
          <div className="empty-state-desc">Official campus fests, exam notices, and university events will appear here.</div>
          {isAdmin && (
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
  const cat = ANNOUNCEMENT_CATEGORIES[a.category] || ANNOUNCEMENT_CATEGORIES['general'];
  const countdown = useCountdown(a.date);

  const handleRsvp = (status: RSVPStatus) => {
    const newStatus = a.userRsvp === status ? null : status;
    dispatch({ type: 'RSVP_ANNOUNCEMENT', payload: { id: a.id, status: newStatus as any } });
  };

  return (
    <div
      className={`announcement-card ${a.isPinned ? 'pinned' : ''}`}
      style={{ animationDelay: `${index * 0.05}s`, borderRadius: 'var(--radius-lg)' }}
    >
      <div className="announcement-header">
        <span
          className="announcement-category"
          style={{ background: cat.color + '15', color: cat.color, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', fontWeight: 600 }}
        >
          {getCategoryIcon(a.category)} {cat.label}
        </span>
        {a.isPinned && (
          <span className="announcement-pinned" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Pin size={12} /> Pinned
          </span>
        )}
      </div>

      <div className="announcement-body">
        {/* Countdown */}
        {countdown && (
          <div className="announcement-countdown" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', background: 'var(--bg-tertiary)', color: 'var(--accent)', marginBottom: 8, fontWeight: 600 }}>
            <Timer size={12} /> {countdown}
          </div>
        )}

        <h3 className="announcement-title" style={{ fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 6px' }}>{a.title}</h3>
        <p className="announcement-desc" style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{a.description}</p>

        {/* Meta */}
        <div className="announcement-meta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '10px 0' }}>
          <span className="announcement-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <Calendar size={13} /> {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="announcement-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <MapPin size={13} /> {a.location}
          </span>
          <span className="announcement-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            <User size={13} /> {a.organizer}
          </span>
        </div>

        {/* Tags */}
        {a.tags && a.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {a.tags.map(t => (
              <span key={t} className="post-tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="announcement-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10, marginTop: 10 }}>
        <div className="rsvp-buttons" style={{ display: 'flex', gap: 8 }}>
          <button
            className={`rsvp-btn ${a.userRsvp === 'going' ? 'active-going' : ''}`}
            onClick={() => handleRsvp('going')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', padding: '5px 12px' }}
          >
            <Check size={13} /> Going {a.rsvpCount > 0 ? `(${a.rsvpCount})` : ''}
          </button>
          <button
            className={`rsvp-btn ${a.userRsvp === 'interested' ? 'active-interested' : ''}`}
            onClick={() => handleRsvp('interested')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', padding: '5px 12px' }}
          >
            <Sparkles size={13} /> Interested {a.interestedCount > 0 ? `(${a.interestedCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
