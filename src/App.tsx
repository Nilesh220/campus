// ============================================================
// UniPulse — Main App Component
// ============================================================

import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import PulseFeed from './components/feed/PulseFeed';
import CampusRoulette from './components/chat/CampusRoulette';
import GroupsPage from './components/groups/GroupsPage';
import BulletinBoard from './components/bulletin/BulletinBoard';
import DirectMessages from './components/network/DirectMessages';
import UserProfileModal from './components/shared/UserProfileModal';
import PreferencesModal from './components/shared/PreferencesModal';
import AdminDashboard from './components/admin/AdminDashboard';
import LandingPage from './components/landing/LandingPage';
import { useMobileHistory } from './hooks/useMobileHistory';

function AppContent() {
  const { state, dispatch } = useApp();
  useMobileHistory();

  if (!state.currentUser) {
    return <LandingPage onLogin={(user) => dispatch({ type: 'LOGIN_USER', payload: user })} />;
  }

  const renderPage = () => {
    switch (state.activeTab) {
      case 'feed': return <PulseFeed />;
      case 'match': return <CampusRoulette />;
      case 'groups': return <GroupsPage />;
      case 'bulletin': return <BulletinBoard />;
      case 'messages': return <DirectMessages />;
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
