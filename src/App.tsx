import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import PulseFeed from './components/feed/PulseFeed';
import PollsPage from './components/polls/PollsPage';
import ConfessionsPage from './components/confessions/ConfessionsPage';
import CampusRoulette from './components/chat/CampusRoulette';
import GroupsPage from './components/groups/GroupsPage';
import BulletinBoard from './components/bulletin/BulletinBoard';
import DirectMessages from './components/network/DirectMessages';
import UserProfileModal from './components/shared/UserProfileModal';
import PreferencesModal from './components/shared/PreferencesModal';
import AdminDashboard from './components/admin/AdminDashboard';
import LandingPage from './components/landing/LandingPage';
import { useMobileHistory } from './hooks/useMobileHistory';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CampusSparks caught runtime error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('campussparks_polls');
      localStorage.removeItem('campussparks_confessions');
    } catch {}
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          background: '#0F172A',
          color: '#FFFFFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Restoring CampusSparks
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: 380, marginBottom: 24, lineHeight: 1.5 }}>
            A temporary render glitch occurred. Tap below to reload fresh.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: '#0D9488',
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 28px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
            }}
          >
            Reload CampusSparks 🔄
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { state, dispatch } = useApp();
  useMobileHistory();

  // Listen to hash changes for deep linking (e.g. #polls, #confessions, #admin)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['feed', 'polls', 'confessions', 'match', 'groups', 'bulletin', 'messages', 'admin'].includes(hash)) {
        dispatch({ type: 'SET_TAB', payload: hash as any });
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [dispatch]);

  if (!state.currentUser) {
    return <LandingPage onLogin={(user) => dispatch({ type: 'LOGIN_USER', payload: user })} />;
  }

  const renderPage = () => {
    switch (state.activeTab) {
      case 'feed': return <PulseFeed />;
      case 'polls': return <PollsPage />;
      case 'confessions': return <ConfessionsPage />;
      case 'match': return <CampusRoulette />;
      case 'groups': return <GroupsPage />;
      case 'bulletin': return <BulletinBoard />;
      case 'messages': return <DirectMessages />;
      case 'admin': return <AdminDashboard onClose={() => dispatch({ type: 'SET_TAB', payload: 'feed' })} />;
      default: return <PulseFeed />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar />
      <main className="app-main">
        {renderPage()}
      </main>
      <MobileNav />
      <UserProfileModal />
      <PreferencesModal />
      {state.showAdmin && <AdminDashboard onClose={() => dispatch({ type: 'TOGGLE_ADMIN' })} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

