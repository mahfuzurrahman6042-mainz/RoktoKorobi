// OneSignal integration for push notifications
// Used for arrival alerts and blood request notifications

declare global {
  interface Window {
    OneSignal?: any;
  }
}

export interface NotificationData {
  type: 'donor_arrived' | 'blood_request' | 'donor_accepted' | 'reminder';
  requestId?: string;
  donorId?: string;
  message: string;
}

/**
 * Initialize OneSignal
 */
export function initOneSignal(appId: string) {
  if (typeof window === 'undefined' || !window.OneSignal) {
    // OneSignal not loaded
    return;
  }

  window.OneSignal.push(() => {
    window.OneSignal.init({
      appId: appId,
      notifyButton: {
        enable: false, // Disable default bell button
      },
      allowLocalhostAsSecureOrigin: true, // For development
    });
  });
}

/**
 * Subscribe user to notifications
 */
export async function subscribeToNotifications(userId: string) {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return;
  }

  window.OneSignal.push(() => {
    window.OneSignal.setExternalUserId(userId);
    window.OneSignal.registerForPushNotifications();
  });
}

/**
 * Send notification to specific user (via backend)
 * This is called from your API route, not client-side
 */
export async function sendNotificationToUser(
  userId: string,
  data: NotificationData,
  oneSignalAppId: string
) {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalAppId}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_external_user_ids: [userId],
        contents: {
          en: data.message,
        },
        data: data,
        headings: {
          en: getNotificationTitle(data.type),
        },
      }),
    });

    if (!response.ok) {
      // Failed to send notification
    }
  } catch (error) {
    // OneSignal error occurred
  }
}

/**
 * Send notification to all users (broadcast)
 */
export async function sendBroadcastNotification(
  data: NotificationData,
  oneSignalAppId: string
) {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalAppId}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        included_segments: ['All'],
        contents: {
          en: data.message,
        },
        data: data,
        headings: {
          en: getNotificationTitle(data.type),
        },
      }),
    });

    if (!response.ok) {
      // Failed to send broadcast
    }
  } catch (error) {
    // OneSignal error occurred
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'donor_arrived':
      return 'Donor Arrived!';
    case 'blood_request':
      return 'Urgent Blood Request';
    case 'donor_accepted':
      return 'Donor Accepted';
    case 'reminder':
      return 'Reminder';
    default:
      return 'RoktoKorobi';
  }
}

/**
 * Get notification permission status
 */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
