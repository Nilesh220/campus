// ============================================================
// CampusSparks — Premium Student Landing Page
// Clean Professional Lucide Icons & Responsive Mobile Design
// ============================================================

import { useState } from 'react';
import {
  Sparkles, Flame, Shuffle, Users, Megaphone,
  LogIn, ShieldCheck, Lock
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';

export default function LandingPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="landing-page">
      {/* Top Landing Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-content">
          <div className="landing-brand">
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <span>CampusSparks</span>
          </div>

          <div className="landing-nav-actions">
            <button
              className="btn btn-ghost btn-sm btn-pill"
              onClick={() => openAuth('signin')}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              className="btn btn-primary btn-sm btn-pill"
              onClick={() => openAuth('signup')}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-badge">
          <Sparkles size={14} />
          <span>The 100% Student-Only Campus Network</span>
        </div>

        <h1 className="landing-title">
          Where your campus <br />
          <span className="landing-accent-text">truly connects & talks.</span>
        </h1>

        <p className="landing-subtitle">
          Real-time anonymous student matching, unfiltered campus confessions, club hubs, and official bulletin boards — all encrypted in one seamless platform.
        </p>

        <div className="landing-cta-group">
          <button
            className="btn btn-primary btn-lg btn-pill"
            onClick={() => openAuth('signup')}
          >
            <Sparkles size={18} /> Create Student Account
          </button>
          <button
            className="btn btn-secondary btn-lg btn-pill"
            onClick={() => openAuth('signin')}
          >
            Sign In to Account
          </button>
        </div>

        <div className="landing-social-proof">
          <div className="landing-stat">
            <span className="stat-val">&lt; 2s</span>
            <span className="stat-lbl">Instant Matchmaking</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="stat-val">100%</span>
            <span className="stat-lbl">Anonymous & Private</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="stat-val">Campus</span>
            <span className="stat-lbl">Student Network</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="landing-features">
        <div className="landing-section-header">
          <span className="landing-section-tag">Core Capabilities</span>
          <h2 className="landing-section-title">Everything student life needs, unified.</h2>
        </div>

        <div className="landing-grid">
          {/* Card 1: Random Chat */}
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}>
              <Shuffle size={24} />
            </div>
            <h3 className="landing-card-title">Random 1-on-1 Chat</h3>
            <p className="landing-card-desc">
              Match instantly with real fellow students across departments. Built-in icebreakers, topic filters, live matching, and optional anonymous pen-pal DMs.
            </p>
          </div>

          {/* Card 2: Pulse Feed */}
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}>
              <Flame size={24} />
            </div>
            <h3 className="landing-card-title">Anonymous Pulse Feed</h3>
            <p className="landing-card-desc">
              Share confessions, campus questions, exam tips, and moments with zero judgment. Real-time upvoting and community interactions.
            </p>
          </div>

          {/* Card 3: Groups & Hubs */}
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}>
              <Users size={24} />
            </div>
            <h3 className="landing-card-title">Clubs & Hostel Hubs</h3>
            <p className="landing-card-desc">
              Create and join departmental clubs, gaming arenas, hostel floors, and study circles with live group chat and pinned announcements.
            </p>
          </div>

          {/* Card 4: Bulletin Board */}
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}>
              <Megaphone size={24} />
            </div>
            <h3 className="landing-card-title">Live Bulletin Board</h3>
            <p className="landing-card-desc">
              Stay in the loop with college fests, mid-semester exam schedules, open-mic nights, and hackathons with 1-tap RSVPs.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Verification Banner */}
      <section className="landing-security">
        <div className="landing-security-box">
          <ShieldCheck size={36} className="landing-security-icon" />
          <div className="landing-security-text">
            <h3>Verified Campus Inboxes Only</h3>
            <p>
              Every student confirms their college email domain (.edu, .ac.in, etc.) or PIN. No random outside spammers, no bots, completely private to universities.
            </p>
          </div>
          <button
            className="btn btn-secondary btn-pill btn-sm"
            onClick={() => openAuth('signup')}
          >
            <Lock size={14} /> Verify Student ID
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} style={{ color: 'var(--accent)' }} />
          <span>© 2026 CampusSparks. Built for university students worldwide.</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#privacy" className="landing-footer-link">Privacy Policy</a>
          <a href="#terms" className="landing-footer-link">Community Guidelines</a>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setShowAuthModal(false);
            onLogin(user);
          }}
        />
      )}
    </div>
  );
}
