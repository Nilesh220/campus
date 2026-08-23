// ============================================================
// Mobile Bottom Navigation
// Automatically hides inside active chat rooms for seamless keyboard typing
// ============================================================

import { Flame, Shuffle, Users, Megaphone, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { NavTab } from '../../types';

const TABS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'feed', label: 'Feed', icon: <Flame size={22} /> },
  { id: 'match', label: 'Random', icon: <Shuffle size={22} /> },
  { id: 'groups', label: 'Groups', icon: <Users size={22} /> },
  { id: 'bulletin', label: 'Bulletin', icon: <Megaphone size={22} /> },
  { id: 'messages', label: 'DMs', icon: <MessageCircle size={22} /> },
];

export default function MobileNav() {
  const { state, dispatch } = useApp();

  // Hide bottom tab bar during active chat sessions so keyboard attaches directly to the input box
  const isInsideActiveChat = Boolean(
    state.selectedGroupId ||
    (state.activeTab === 'match' && state.activeMatch?.status === 'chatting') ||
    (state.activeTab === 'messages' && state.activeConversationId)
  );

  if (isInsideActiveChat) {
    return null;
  }

  const unreadDMs = state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`mobile-nav-item ${state.activeTab === tab.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.id === 'messages' && unreadDMs > 0 && <span className="item-badge" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
