// ============================================================
// Auth Modal — Sign In & Student Registration with Email Validation
// Real Supabase Email Confirmation & Verification Flow
// ============================================================

import { useState } from 'react';
import {
  Sparkles, ArrowRight, Mail, Lock, User, X,
  AtSign, Dices, MailCheck, RotateCcw, AlertCircle, Check, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CURRENT_USER, generateGenZUsername } from '../../data/mockData';

const AVATARS = ['🎓', '👨‍💻', '🎨', '🎵', '⚡', '🤖', '📸', '🏋️', '🔬', '💡', '👾', '✨'];

const MAJORS = [
  'Computer Science', 'Design & Visual Arts', 'Music & Media',
  'Mechanical Eng.', 'Electronics & Comms', 'Business & Mgmt',
  'Civil Eng.', 'Biotechnology', 'Psychology', 'Economics'
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthModalProps {
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ initialMode = 'signup', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [view, setView] = useState<'form' | 'verify-email'>('form');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState(() => generateGenZUsername());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [major, setMajor] = useState(MAJORS[0]);
  const [gradYear, setGradYear] = useState('2027');
  const [avatar, setAvatar] = useState('🎓');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const handleShuffleUsername = () => {
    setUsername(generateGenZUsername(displayName));
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (resendCooldown > 0 || !targetEmail) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setResendSuccess(true);
        setResendCooldown(45);
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend confirmation email.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setUnconfirmedEmail(null);

    const inputVal = (mode === 'signup' ? email : emailOrUsername).trim().toLowerCase();
    const cleanUsername = (username.trim() || generateGenZUsername(displayName)).replace(/^@/, '').toLowerCase();

    // 1. Strict Email Format Validation
    if (mode === 'signup') {
      if (!EMAIL_REGEX.test(inputVal)) {
        setErrorMsg('Please enter a valid email address with a domain (e.g. name@campus.edu or name@gmail.com)');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
    }

    const isNilesh = inputVal.includes('guptanilesh417') ||
                     cleanUsername.includes('guptanilesh417') ||
                     displayName.toLowerCase().includes('guptanilesh417') ||
                     inputVal.includes('admin');

    const resolvedEmail = inputVal.includes('@') && inputVal.includes('.')
      ? inputVal
      : `${inputVal.replace(/[^a-z0-9_]/g, '') || cleanUsername}@campus.edu`;

    const finalUsername = mode === 'signup' ? cleanUsername : (inputVal.replace('@', '').split('@')[0] || 'student');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: resolvedEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: displayName.trim() || finalUsername,
              username: finalUsername,
              major,
              graduation_year: parseInt(gradYear),
              avatar,
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            setErrorMsg('This email is already registered. Please switch to Sign In.');
          } else {
            setErrorMsg(error.message);
          }
        } else if (data.user) {
          // If email confirmation is required (no active session returned immediately)
          if (!data.session) {
            setPendingVerificationEmail(resolvedEmail);
            setView('verify-email');
          } else {
            // Direct login if email confirmation is disabled on Supabase
            onSuccess({
              id: data.user.id,
              username: finalUsername,
              email: data.user.email,
              displayName: displayName.trim() || finalUsername,
              avatar,
              major,
              graduationYear: parseInt(gradYear),
              college: 'Campus University',
              bio: 'Campus student ready to explore',
              hobbies: ['Campus Life', 'Study'],
              badges: [],
              isOnline: true,
              joinedAt: new Date().toISOString(),
              pulseScore: 100,
              isAdmin: isNilesh,
            });
          }
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Your email address has not been verified yet. Please check your inbox for the confirmation link.');
            setUnconfirmedEmail(resolvedEmail);
          } else if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. Please check and try again.');
          } else {
            setErrorMsg(error.message);
          }
        } else if (data.user) {
          onSuccess({
            id: data.user.id,
            username: data.user.user_metadata?.username || finalUsername,
            email: data.user.email,
            displayName: data.user.user_metadata?.display_name || CURRENT_USER.displayName,
            avatar: data.user.user_metadata?.avatar || CURRENT_USER.avatar,
            major: data.user.user_metadata?.major || CURRENT_USER.major,
            graduationYear: data.user.user_metadata?.graduation_year || 2027,
            college: 'Campus University',
            bio: data.user.user_metadata?.bio || 'Campus student',
            hobbies: data.user.user_metadata?.hobbies || ['Campus Life'],
            badges: [],
            isOnline: true,
            joinedAt: data.user.created_at || new Date().toISOString(),
            pulseScore: 150,
            isAdmin: isNilesh,
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    onSuccess({
      id: 'demo_guest_1',
      username: 'guest_student',
      displayName: 'Guest Student',
      avatar: '🎓',
      email: 'guest@campus.edu',
      major: 'Computer Science',
      graduationYear: 2027,
      college: 'Campus University',
      bio: 'Exploring campus demo',
      hobbies: ['Coding', 'Campus Life'],
      badges: [],
      isOnline: true,
      joinedAt: new Date().toISOString(),
      pulseScore: 100,
      isAdmin: false,
    });
  };

  // ── Verification Email Sent Screen ────────────────────────────
  if (view === 'verify-email') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal auth-card" style={{ maxWidth: 440, textAlign: 'center', padding: 28 }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-bg-strong)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MailCheck size={32} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Check your email!
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            We've sent a verification link to:<br />
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{pendingVerificationEmail}</strong>
          </p>

          <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 20, textAlign: 'left' }}>
            💡 Click the link in your email to verify your student account. Once clicked, you can return here and sign in.
          </div>

          {resendSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--accent)', fontSize: '0.82rem', marginBottom: 12 }}>
              <Check size={14} /> Verification email resent successfully!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary btn-pill"
              onClick={() => {
                setView('form');
                setMode('signin');
                setEmailOrUsername(pendingVerificationEmail);
              }}
            >
              Continue to Sign In <ArrowRight size={15} />
            </button>

            <button
              className="btn btn-secondary btn-pill btn-sm"
              onClick={() => handleResendVerification(pendingVerificationEmail)}
              disabled={resendCooldown > 0}
            >
              <RotateCcw size={13} />
              {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend Verification Email'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Auth Form ────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal auth-card" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge" style={{ background: 'var(--accent-bg-strong)', color: 'var(--accent)' }}>
            <Sparkles size={22} />
          </div>
          <h2 className="auth-brand">CampusSparks</h2>
          <p className="auth-tagline">Where campus connects, matches & vibes</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setErrorMsg(null); setUnconfirmedEmail(null); }}
          >
            Create Account
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setErrorMsg(null); setUnconfirmedEmail(null); }}
          >
            Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" style={{ background: 'rgba(199, 92, 92, 0.12)', border: '1px solid var(--color-error)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div>{errorMsg}</div>
                {unconfirmedEmail && (
                  <button
                    type="button"
                    onClick={() => handleResendVerification(unconfirmedEmail)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', padding: '4px 0 0', fontSize: '0.78rem', fontWeight: 600, display: 'block' }}
                  >
                    Resend verification link to {unconfirmedEmail}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          {mode === 'signup' ? (
            <>
              {/* Avatar Picker */}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>Choose Avatar</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      style={{
                        fontSize: '1.2rem',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: avatar === av ? 'var(--accent-bg-strong)' : 'var(--bg-tertiary)',
                        border: avatar === av ? '1.5px solid var(--accent)' : '1px solid var(--border-light)',
                        cursor: 'pointer',
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name & Username */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>Display Name</label>
                  <div className="auth-input-wrapper">
                    <User size={15} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arjun Sharma"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontSize: '0.74rem' }}>Username</label>
                    <button
                      type="button"
                      onClick={handleShuffleUsername}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 2, padding: 0 }}
                      title="Generate cool username"
                    >
                      <Dices size={12} /> Suggest
                    </button>
                  </div>
                  <div className="auth-input-wrapper">
                    <AtSign size={15} />
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    />
                  </div>
                </div>
              </div>

              {/* Student Email */}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>
                  Student / University Email
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={15} />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu or name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  A confirmation email will be sent to verify your student status.
                </div>
              </div>

              {/* Major & Graduation Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>Major</label>
                  <select
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    className="auth-select"
                  >
                    {MAJORS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>Grad Year</label>
                  <select
                    value={gradYear}
                    onChange={e => setGradYear(e.target.value)}
                    className="auth-select"
                  >
                    {['2025', '2026', '2027', '2028', '2029'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>Password (min 6 chars)</label>
                <div className="auth-input-wrapper">
                  <Lock size={15} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sign In Form */}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>
                  Email or Username
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={15} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@gmail.com or @username"
                    value={emailOrUsername}
                    onChange={e => setEmailOrUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={15} />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-pill"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Student Account' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or explore first</span>
        </div>

        {/* Instant Demo */}
        <button
          type="button"
          className="btn btn-secondary btn-pill"
          style={{ width: '100%', fontSize: '0.84rem' }}
          onClick={handleGuestEntry}
        >
          Instant Demo as Student Guest
        </button>

        {/* Security Note */}
        <div className="auth-security-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
          <span>Encrypted student authentication. Your privacy is protected.</span>
        </div>
      </div>
    </div>
  );
}
