// ============================================================
// Mobile History & Back Button Interceptor
// Prevents accidentally exiting the app on phone back gesture
// ============================================================

import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export function useMobileHistory() {
  const { state, dispatch } = useApp();
  const isNavigatingBackRef = useRef(false);

  // Track active overlay/modal state
  const hasActiveOverlay = Boolean(
    state.sidebarOpen ||
    state.showCreatePost ||
    state.showCreateGroup ||
    state.showCreateAnnouncement ||
    state.showNotifications ||
    state.showProfile ||
    state.showPreferences ||
    state.showAdmin ||
    state.selectedGroupId ||
    state.activeConversationId
  );

  // 1. Push history state when an overlay opens
  useEffect(() => {
    if (hasActiveOverlay) {
      if (!isNavigatingBackRef.current) {
        window.history.pushState({ overlay: true }, '');
      }
      isNavigatingBackRef.current = false;
    }
  }, [hasActiveOverlay]);

  // 2. Track tab changes in history
  useEffect(() => {
    if (!hasActiveOverlay && state.activeTab) {
      const currentHash = window.location.hash.replace(/^#/, '');
      if (currentHash !== state.activeTab) {
        window.history.pushState({ tab: state.activeTab }, '', `#${state.activeTab}`);
      }
    }
  }, [state.activeTab, hasActiveOverlay]);

  // 3. Listen to popstate (Hardware / Swipe Back Button)
  useEffect(() => {
    const handlePopState = (_e: PopStateEvent) => {
      isNavigatingBackRef.current = true;

      // Close open modals / overlays first instead of leaving the site
      if (state.sidebarOpen) {
        dispatch({ type: 'CLOSE_SIDEBAR' });
        return;
      }
      if (state.showPreferences) {
        dispatch({ type: 'TOGGLE_PREFERENCES' });
        return;
      }
      if (state.showProfile) {
        dispatch({ type: 'TOGGLE_PROFILE', payload: null });
        return;
      }
      if (state.showCreatePost) {
        dispatch({ type: 'TOGGLE_CREATE_POST' });
        return;
      }
      if (state.showCreateGroup) {
        dispatch({ type: 'TOGGLE_CREATE_GROUP' });
        return;
      }
      if (state.showCreateAnnouncement) {
        dispatch({ type: 'TOGGLE_CREATE_ANNOUNCEMENT' });
        return;
      }
      if (state.showAdmin) {
        dispatch({ type: 'TOGGLE_ADMIN' });
        return;
      }
      if (state.activeConversationId) {
        dispatch({ type: 'SELECT_CONVERSATION', payload: null });
        return;
      }
      if (state.selectedGroupId) {
        dispatch({ type: 'SELECT_GROUP', payload: null });
        return;
      }

      // If no overlay is open and user is on a secondary tab, return to feed tab
      if (state.activeTab !== 'feed') {
        dispatch({ type: 'SET_TAB', payload: 'feed' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    state.sidebarOpen,
    state.showPreferences,
    state.showProfile,
    state.showCreatePost,
    state.showCreateGroup,
    state.showCreateAnnouncement,
    state.showAdmin,
    state.activeConversationId,
    state.selectedGroupId,
    state.activeTab,
    dispatch,
  ]);
}
