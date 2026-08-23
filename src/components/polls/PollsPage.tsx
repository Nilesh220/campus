// ============================================================
// CampusSparks — Daily Campus Polls & Hot Takes
// Real-time student voting, percentage bars & debate discussions
// ============================================================

import { useState } from 'react';
import {
  Vote, Flame, Plus, CheckCircle2, Clock, Sparkles,
  BarChart3, MessageSquare, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/notificationService';
import type { Poll } from '../../types';

const POLL_FILTERS = [
  { id: 'all', label: '🔥 All Polls' },
  { id: 'hottakes', label: '⚡ Hot Takes' },
  { id: 'campus-life', label: '🏫 Campus Life' },
  { id: 'mess-food', label: '🍕 Food & Mess' },
  { id: 'academic', label: '📚 Exams & Academics' },
];

export default function PollsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter polls
  const filteredPolls = (state.polls || []).filter(p => {
    if (!p) return false;
    if (filter === 'all') return true;
    if (filter === 'hottakes') return Boolean(p.isHotTake);
    return p.category === filter;
  });

  const handleVote = (pollId: string, optionId: string, pollQuestion: string) => {
    dispatch({
      type: 'VOTE_POLL',
      payload: { pollId, optionId },
    });
    // Send feedback notification
    notificationService.sendNotification('🗳️ Vote Recorded!', {
      body: `Your vote on "${pollQuestion.substring(0, 40)}..." has been counted!`,
    });
  };

  return (
    <div className="polls-page-container">
      {/* Hero Header */}
      <div className="polls-hero-banner">
        <div className="polls-hero-icon">
          <Vote size={26} />
        </div>
        <div className="polls-hero-content">
          <div className="polls-hero-badge">
            <Sparkles size={13} />
            <span>Campus Daily Voice</span>
          </div>
          <h1>Daily Campus Polls & Hot Takes</h1>
          <p>Vote on burning campus debates, canteen food rankings & exam realities. 100% anonymous voting.</p>
        </div>
        <button
          className="btn btn-primary btn-pill btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} /> Create Poll
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="polls-filter-scroll">
        {POLL_FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Polls Feed */}
      <div className="polls-grid">
        {filteredPolls.map(poll => {
          const hasVoted = poll.userVotedOptionId !== null;
          const totalVotes = Math.max(1, poll.totalVotes);

          return (
            <div key={poll.id} className={`poll-card ${poll.isHotTake ? 'hot-take-card' : ''}`}>
              {/* Card Header */}
              <div className="poll-card-header">
                <div className="poll-tags-row">
                  {poll.isHotTake && (
                    <span className="poll-hot-badge">
                      <Flame size={12} /> HOT TAKE
                    </span>
                  )}
                  <span className="poll-category-tag">{poll.category}</span>
                </div>
                <div className="poll-expiry-badge">
                  <Clock size={12} />
                  <span>24h Active</span>
                </div>
              </div>

              {/* Question & Description */}
              <h2 className="poll-question">{poll.question}</h2>
              {poll.description && (
                <p className="poll-description">{poll.description}</p>
              )}

              {/* Options List */}
              <div className="poll-options-list">
                {poll.options.map(option => {
                  const isSelected = poll.userVotedOptionId === option.id;
                  const percentage = Math.round((option.votes / totalVotes) * 100);

                  return (
                    <button
                      key={option.id}
                      className={`poll-option-item ${isSelected ? 'selected' : ''} ${hasVoted ? 'voted-state' : ''}`}
                      onClick={() => handleVote(poll.id, option.id, poll.question)}
                    >
                      {/* Animated Percentage Bar fill when voted */}
                      {hasVoted && (
                        <div
                          className="poll-option-progress-bar"
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      <div className="poll-option-inner">
                        <div className="poll-option-label">
                          {isSelected && <CheckCircle2 size={16} className="poll-selected-icon" />}
                          <span>{option.text}</span>
                        </div>

                        {hasVoted ? (
                          <div className="poll-option-meta">
                            <span className="poll-option-percent">{percentage}%</span>
                            <span className="poll-option-votes">({option.votes})</span>
                          </div>
                        ) : (
                          <span className="poll-vote-prompt">Vote</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Meta */}
              <div className="poll-card-footer">
                <div className="poll-votes-counter">
                  <BarChart3 size={14} />
                  <span><strong>{poll.totalVotes}</strong> students voted</span>
                </div>
                {!hasVoted && (
                  <span className="poll-locked-hint">
                    🔒 Vote to see live percentage breakdown
                  </span>
                )}
                <div className="poll-comments-badge">
                  <MessageSquare size={13} />
                  <span>{poll.commentsCount} comments</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPolls.length === 0 && (
          <div className="feed-empty-state" style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-medium)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
              🗳️
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px' }}>No Active Campus Polls Right Now</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Be the first to launch a campus debate, canteen food ranking, or hot take for fellow students to vote on!
            </p>
            <button
              className="btn btn-primary btn-pill"
              style={{ padding: '10px 24px', fontSize: '0.92rem', fontWeight: 700 }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} /> Create First Campus Poll 🚀
            </button>
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <CreatePollModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

// ── Create Poll Modal Component ─────────────────────────────
function CreatePollModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [isHotTake, setIsHotTake] = useState(false);
  const [category, setCategory] = useState<'academic' | 'campus-life' | 'mess-food' | 'general' | 'drama'>('campus-life');
  const [options, setOptions] = useState<string[]>(['', '']);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(o => !o.trim())) return;

    const newPoll: Poll = {
      id: `poll_${Date.now()}`,
      question: question.trim(),
      description: description.trim() || undefined,
      isHotTake,
      category,
      createdBy: state.currentUser?.id || 'u_student',
      creatorName: state.currentUser?.displayName || 'Anonymous Student',
      totalVotes: 0,
      userVotedOptionId: null,
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdAt: new Date().toISOString(),
      commentsCount: 0,
      options: options.map((opt, i) => ({
        id: `opt_${Date.now()}_${i}`,
        text: opt.trim(),
        votes: 0,
      })),
    };

    dispatch({ type: 'CREATE_POLL', payload: newPoll });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Vote size={20} style={{ color: 'var(--accent)' }} />
            <h2>Create Campus Poll</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Question Input */}
          <div className="form-group">
            <label className="form-label">Poll Question *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Is 85% attendance actually necessary?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Context / Subtext (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Add background context or why you're asking..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Category & Hot Take */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
              >
                <option value="campus-life">Campus Life</option>
                <option value="mess-food">Food & Mess</option>
                <option value="academic">Academics & Exams</option>
                <option value="drama">Drama & Gossip</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="form-label">Hot Take Tag</label>
              <button
                type="button"
                className={`btn btn-sm btn-pill ${isHotTake ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', height: 38, justifyContent: 'center' }}
                onClick={() => setIsHotTake(!isHotTake)}
              >
                <Flame size={14} /> {isHotTake ? '🔥 Marked as Hot Take' : 'Standard Poll'}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="form-group">
            <label className="form-label">Voting Options (Min 2, Max 5)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Option ${idx + 1}...`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="icon-btn btn-xs"
                      onClick={() => handleRemoveOption(idx)}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-pill"
                onClick={handleAddOption}
                style={{ marginTop: 8 }}
              >
                <Plus size={13} /> Add Another Option
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary btn-pill" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-pill"
              style={{ flex: 1 }}
              disabled={!question.trim() || options.some(o => !o.trim())}
            >
              Publish Poll 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
