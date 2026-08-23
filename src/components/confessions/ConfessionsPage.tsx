// ============================================================
// CampusSparks — Anonymous Confessions & Secrets Wall
// 100% Anonymous student confessions, spicy reactions & upvotes
// ============================================================

import { useState } from 'react';
import {
  Ghost, Plus, Sparkles,
  ArrowBigUp, ArrowBigDown, MessageCircle,
  Share2, Shield, X, Dices, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAnonName } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';
import type { Confession } from '../../types';

const CONFESSION_FILTERS = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'newest', label: '✨ Newest' },
  { id: 'upvoted', label: '💥 Top Rated' },
  { id: 'crush', label: '👀 Crushes & Dating' },
  { id: 'hostel', label: '🌙 Late Night & Hostel' },
];

const AVAILABLE_REACTIONS = [
  { emoji: '👀', label: 'Eyes' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '🍿', label: 'Popcorn' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
];

export default function ConfessionsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('trending');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sorting and filtering
  let confessions = [...state.confessions];
  if (filter === 'trending') {
    confessions.sort((a, b) => (b.upvotes + Object.values(b.reactions).reduce((s, v) => s + v, 0)) - (a.upvotes + Object.values(a.reactions).reduce((s, v) => s + v, 0)));
  } else if (filter === 'newest') {
    confessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (filter === 'upvoted') {
    confessions.sort((a, b) => b.upvotes - a.upvotes);
  } else if (filter === 'crush') {
    confessions = confessions.filter(c => c.tags.some(t => t.toLowerCase().includes('crush') || t.toLowerCase().includes('dating') || t.toLowerCase().includes('love')));
  } else if (filter === 'hostel') {
    confessions = confessions.filter(c => c.tags.some(t => t.toLowerCase().includes('hostel') || t.toLowerCase().includes('latenight') || t.toLowerCase().includes('night')));
  }

  const handleUpvote = (id: string) => {
    dispatch({ type: 'UPVOTE_CONFESSION', payload: id });
  };

  const handleDownvote = (id: string) => {
    dispatch({ type: 'DOWNVOTE_CONFESSION', payload: id });
  };

  const handleReaction = (confessionId: string, reaction: string, content: string) => {
    dispatch({
      type: 'REACT_CONFESSION',
      payload: { confessionId, reaction },
    });
    notificationService.notifyConfessionReaction(content, reaction);
  };

  const handleShare = (confession: Confession) => {
    if (navigator.share) {
      navigator.share({
        title: 'CampusSparks Anonymous Confession',
        text: `"${confession.content}" — via CampusSparks`,
        url: window.location.origin,
      }).catch(() => {});
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(`"${confession.content}" — https://campussparks.com`);
      setCopiedId(confession.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="confessions-page-container">
      {/* Hero Header */}
      <div className="confessions-hero-banner">
        <div className="confessions-hero-icon">
          <Ghost size={28} />
        </div>
        <div className="confessions-hero-content">
          <div className="confessions-hero-badge">
            <Sparkles size={13} />
            <span>100% Anonymous & Untraceable</span>
          </div>
          <h1>Campus Confessions & Secrets Wall</h1>
          <p>Unfiltered campus stories, secret crushes, hostel confessions, and midnight thoughts.</p>
        </div>
        <button
          className="btn btn-primary btn-pill btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} /> Drop Confession 🤫
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="confessions-filter-scroll">
        {CONFESSION_FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Confessions Stream */}
      <div className="confessions-grid">
        {confessions.map((confession, index) => (
          <div key={confession.id} className="confession-card">
            {/* Card Header */}
            <div className="confession-card-header">
              <div className="confession-author-info">
                <span className="confession-avatar">{confession.emoji}</span>
                <div>
                  <span className="confession-author-name">{confession.pseudonym}</span>
                  <span className="confession-time">
                    {new Date(confession.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {confession.college || 'Campus'}
                  </span>
                </div>
              </div>

              <div className="confession-rank-tag">
                #{index + 1}
              </div>
            </div>

            {/* Content */}
            <p className="confession-content">
              "{confession.content}"
            </p>

            {/* Tags */}
            {confession.tags && confession.tags.length > 0 && (
              <div className="confession-tags-row">
                {confession.tags.map(t => (
                  <span key={t} className="confession-tag-chip">#{t}</span>
                ))}
              </div>
            )}

            {/* Reaction Bar */}
            <div className="confession-reaction-strip">
              {AVAILABLE_REACTIONS.map(({ emoji, label }) => {
                const count = confession.reactions?.[emoji] || 0;
                const isSelected = confession.userReaction === emoji;

                return (
                  <button
                    key={emoji}
                    className={`confession-react-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleReaction(confession.id, emoji, confession.content)}
                    title={`React with ${label}`}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span className="react-count">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="confession-card-footer">
              <div className="confession-vote-group">
                <button
                  className={`vote-action-btn ${confession.isUpvoted ? 'active-up' : ''}`}
                  onClick={() => handleUpvote(confession.id)}
                  title="Upvote confession"
                >
                  <ArrowBigUp size={20} />
                  <span>{confession.upvotes}</span>
                </button>
                <button
                  className={`vote-action-btn ${confession.isDownvoted ? 'active-down' : ''}`}
                  onClick={() => handleDownvote(confession.id)}
                  title="Downvote confession"
                >
                  <ArrowBigDown size={20} />
                </button>
              </div>

              <div className="confession-footer-right">
                <button className="confession-comments-btn">
                  <MessageCircle size={15} />
                  <span>{confession.commentsCount} replies</span>
                </button>

                <button
                  className="icon-btn btn-xs"
                  onClick={() => handleShare(confession)}
                  title="Share Confession"
                >
                  {copiedId === confession.id ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Share2 size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {confessions.length === 0 && (
          <div className="feed-empty-state" style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-medium)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(139, 92, 246, 0.14)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
              🤫
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px' }}>The Confessions Wall is Fresh & Clean</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Spill the tea, hostel secrets, library crushes, or exam panic completely anonymously. Your identity is 100% untraceable.
            </p>
            <button
              className="btn btn-primary btn-pill"
              style={{ padding: '10px 24px', fontSize: '0.92rem', fontWeight: 700 }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} /> Drop First Anonymous Confession 🤫
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateConfessionModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

// ── Create Confession Modal Component ───────────────────────
function CreateConfessionModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [content, setContent] = useState('');
  const [anonName, setAnonName] = useState(() => generateAnonName());
  const [selectedTags, setSelectedTags] = useState<string[]>(['CampusLife']);
  const [customTagInput, setCustomTagInput] = useState('');

  const PRESET_TAGS = ['Crush', 'HostelLife', 'Exams', 'Professors', 'Gossip', 'NightVibes', 'Food'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim().replace(/^#/, '');
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
    }
    setCustomTagInput('');
  };

  const handleRerollName = () => {
    setAnonName(generateAnonName());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newConfession: Confession = {
      id: `conf_${Date.now()}`,
      content: content.trim(),
      pseudonym: anonName.name,
      emoji: anonName.emoji,
      upvotes: 1,
      downvotes: 0,
      reactions: { '🔥': 1 },
      userReaction: '🔥',
      isUpvoted: true,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      college: state.currentUser?.college || 'Campus University',
      tags: selectedTags,
    };

    dispatch({ type: 'ADD_CONFESSION', payload: newConfession });
    notificationService.sendNotification('🤫 Confession Published Anonymously!', {
      body: `Your confession was posted as "${anonName.name}"!`,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ghost size={20} style={{ color: 'var(--color-category-confession)' }} />
            <h2>Drop Anonymous Confession</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Pseudonym Generator Bar */}
          <div className="confession-pseudonym-picker">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="confession-avatar">{anonName.emoji}</span>
              <div>
                <span className="pseudonym-label">Posting anonymously as:</span>
                <div className="pseudonym-display-name">{anonName.name}</div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-xs btn-pill"
              onClick={handleRerollName}
              title="Roll a different pseudonym"
            >
              <Dices size={14} /> Reroll Alias
            </button>
          </div>

          {/* Text Area */}
          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Your Secret / Confession *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Spill the tea... What happened in the library, hostel, or canteen? (100% anonymous)"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              maxLength={800}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              <span>Names of real individuals should not be harassed or targeted.</span>
              <span>{content.length}/800</span>
            </div>
          </div>

          {/* Preset Tags */}
          <div className="form-group">
            <label className="form-label">Tags (Select all that apply)</label>
            <div className="confession-tags-picker">
              {PRESET_TAGS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`tag-chip ${selectedTags.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleTag(t)}
                >
                  #{t}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                placeholder="Custom tag (e.g. MechanicalBatch)..."
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-pill"
                onClick={handleAddCustomTag}
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="confession-safety-box">
            <Shield size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>
              Your identity is cryptographically separated from your post. Respect campus community guidelines.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary btn-pill" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-pill"
              style={{ flex: 1 }}
              disabled={!content.trim()}
            >
              Post Secret 🤫
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
