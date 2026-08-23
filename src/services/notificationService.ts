// ============================================================
// CampusSparks — Native Web Push & Browser Notifications Service
// Realtime browser alerts for DMs, Matches, Confessions & Polls
// ============================================================

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

class WebNotificationService {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
  }

  public getStatus(): NotificationPermissionStatus {
    try {
      if (typeof window === 'undefined' || !('Notification' in window) || typeof Notification === 'undefined') {
        return 'unsupported';
      }
      return (Notification.permission || 'unsupported') as NotificationPermissionStatus;
    } catch {
      return 'unsupported';
    }
  }

  public async requestPermission(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window) || typeof Notification === 'undefined') {
        return false;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.sendNotification('🎉 Notifications Enabled!', {
          body: 'You will now receive instant alerts for private messages, random match reveals & campus hot takes.',
          icon: '/icons/icon-192.png',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Notification permission request failed:', err);
      return false;
    }
  }

  public sendNotification(title: string, options?: NotificationOptions) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    try {
      // If service worker registration is available, use showNotification for better mobile background delivery
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
            ...options,
          } as any);
        });
      } else {
        // Fallback to standard window Notification
        const notification = new Notification(title, {
          icon: '/icons/icon-192.png',
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (err) {
      console.warn('Send notification error:', err);
    }
  }

  // Pre-configured notification triggers
  public notifyNewMessage(senderName: string, messageContent: string) {
    this.sendNotification(`💬 New message from ${senderName}`, {
      body: messageContent.length > 60 ? `${messageContent.substring(0, 57)}...` : messageContent,
      tag: 'dm-message',
    });
  }

  public notifyMatchFound(peerPseudonym: string) {
    this.sendNotification(`⚡ New Campus Match!`, {
      body: `You connected with ${peerPseudonym}! Tap to open your chat.`,
      tag: 'chat-match',
    });
  }

  public notifyRevealAccepted(peerName: string) {
    this.sendNotification(`🎉 Identity Revealed!`, {
      body: `${peerName} accepted your reveal request! You can now chat in private DMs.`,
      tag: 'reveal-accepted',
    });
  }

  public notifyPollVote(pollQuestion: string, totalVotes: number) {
    this.sendNotification(`🗳️ Campus Poll Update`, {
      body: `"${pollQuestion.substring(0, 45)}..." now has ${totalVotes} votes!`,
      tag: 'poll-vote',
    });
  }

  public notifyConfessionReaction(confessionSnippet: string, reactionEmoji: string) {
    this.sendNotification(`${reactionEmoji} New reaction on your confession`, {
      body: `"${confessionSnippet.substring(0, 50)}..."`,
      tag: 'confession-reaction',
    });
  }
}

export const notificationService = new WebNotificationService();
