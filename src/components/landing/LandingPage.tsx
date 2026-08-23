// ============================================================
// CampusSparks / UniPulse — Premium Student Landing Page
// ============================================================

import { useState } from 'react';
import {
  Sparkles, Flame, Shuffle, Users, Megaphone, Shield,
  ArrowRight, LogIn
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
            <span className="landing-brand-icon">⚡</span>
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
              Get Started <ArrowRight size={15} />
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
          <span className="landing-gradient-text">truly connects & talks.</span>
        </h1>

        <p className="landing-subtitle">
          Real-time anonymous student matching, unfiltered campus confessions, club hubs, and official bulletin boards — all encrypted in one seamless platform.
        </p>

        <div className="landing-cta-group">
          <button
            className="btn btn-primary btn-lg btn-pill"
            onClick={() => openAuth('signup')}
          >
            <Sparkles size={18} /> Join Your Campus Hub
          </button>
          <button
            className="btn btn-secondary btn-lg btn-pill"
            onClick={() => {
              onLogin({
                id: 'demo_student_guest',
                email: 'student@campus.edu',
                displayName: 'Student Guest',
                avatar: '🎓',
                major: 'Computer Science',
                graduationYear: 2027,
                college: 'Campus University',
                pulseScore: 120,
                isAdmin: false,
              });
            }}
          >
            ⚡ Instant Student Demo
          </button>
        </div>

        <div className="landing-social-proof">
          <div className="landing-stat">
            <span className="stat-val">&lt; 3s</span>
            <span className="stat-lbl">Random Matchmaking</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="stat-val">100%</span>
            <span className="stat-lbl">Anonymous & Ephemeral</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="stat-val">10,000+</span>
            <span className="stat-lbl">Concurrent Capacity</span>
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
            <div className="landing-card-icon" style={{ background: 'rgba(91, 181, 162, 0.15)', color: '#5BB5A2' }}>
              <Shuffle size={24} />
            </div>
            <h3 className="landing-card-title">Random 1-on-1 Chat</h3>
            <p className="landing-card-desc">
              Match instantly with real fellow students across departments. Built-in icebreakers, topic filters, real-time radar scanning, and optional anonymous pen-pal DMs.
            </p>
          </div>

          {/* Card 2: Pulse Feed */}
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: 'rgba(196, 149, 106, 0.15)', color: '#C4956A' }}>
              <Flame size={24} />
            </div>
            <h3 className="landing-card-title">Anonymous Pulse Feed</h3>
            <p className="landing-card-desc">
              Share confessions, campus hacks, exam questions, and memes without fear of judgment. Real-time upvoting and custom emoji reactions.
            </p>
          </div>

          {/* Card 3: Groups & Hubs */}
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: 'rgba(91, 142, 201, 0.15)', color: '#5B8EC9' }}>
              <Users size={24} />
            </div>
            <h3 className="landing-card-title">Clubs & Hostel Hubs</h3>
            <p className="landing-card-desc">
              Create and join departmental clubs, gaming arenas, hostel floors, and study circles with live group chat and pinned announcements.
            </p>
          </div>

          {/* Card 4: Bulletin Board */}
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: 'rgba(199, 125, 138, 0.15)', color: '#C77D8A' }}>
              <Megaphone size={24} />
            </div>
            <h3 className="landing-card-title">Live Bulletin Board</h3>
            <p className="landing-card-desc">
              Stay in the loop with TechFests, mid-semester exam schedules, open-mic nights, and hackathons with 1-tap RSVPs.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Privacy Banner */}
      <section className="landing-security">
        <div className="landing-security-box">
          <Shield size={28} className="landing-security-icon" />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Student Privacy & Safety First</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              All anonymous sessions never disclose your identity unless both sides explicitly consent. Powered by PostgreSQL Row Level Security.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© 2026 CampusSparks. Built for Indian & Global University Students.</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            className="landing-footer-link"
            style={{ fontWeight: 600, color: 'var(--accent)' }}
            onClick={() => {
              onLogin({
                id: 'admin_nilesh_gupta',
                username: 'guptanilesh417',
                email: 'guptanilesh417@gmail.com',
                displayName: 'Nilesh Gupta',
                avatar: '⚡',
                major: 'Computer Science & Engineering',
                graduationYear: 2026,
                college: 'Campus Lead University',
                pulseScore: 999,
                isAdmin: true,
              });
            }}
          >
            🛡️ Admin Portal (Nilesh Gupta)
          </button>
          <button className="landing-footer-link" onClick={() => openAuth('signin')}>Sign In</button>
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
