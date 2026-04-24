// Anomaly detection for suspicious behavior patterns
// Tracks various metrics to detect unusual activity

interface UserActivity {
  userId: string;
  loginAttempts: number;
  failedAttempts: number;
  lastLoginTime: number;
  lastFailedTime: number;
  unusualLogins: number;
}

const userActivityMap = new Map<string, UserActivity>();

export function trackUserActivity(userId: string, success: boolean): void {
  const now = Date.now();
  let activity = userActivityMap.get(userId);

  if (!activity) {
    activity = {
      userId,
      loginAttempts: 0,
      failedAttempts: 0,
      lastLoginTime: 0,
      lastFailedTime: 0,
      unusualLogins: 0,
    };
    userActivityMap.set(userId, activity);
  }

  if (success) {
    activity.loginAttempts++;
    activity.lastLoginTime = now;
  } else {
    activity.failedAttempts++;
    activity.lastFailedTime = now;
  }
}

export function detectAnomalies(userId: string): {
  hasAnomaly: boolean;
  reasons: string[];
} {
  const activity = userActivityMap.get(userId);
  const reasons: string[] = [];

  if (!activity) {
    return { hasAnomaly: false, reasons };
  }

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Check for high failure rate
  if (activity.failedAttempts > 5 && activity.lastFailedTime > oneHourAgo) {
    reasons.push('High number of failed login attempts in last hour');
  }

  // Check for rapid successive logins
  if (activity.loginAttempts > 10 && activity.lastLoginTime > oneHourAgo) {
    reasons.push('Unusual number of login attempts in last hour');
  }

  // Check for failed login after recent success
  if (activity.lastFailedTime > activity.lastLoginTime && 
      activity.lastFailedTime - activity.lastLoginTime < 5 * 60 * 1000) {
    reasons.push('Failed login shortly after successful login');
  }

  return {
    hasAnomaly: reasons.length > 0,
    reasons,
  };
}

export function isSuspiciousActivity(userId: string): boolean {
  const { hasAnomaly } = detectAnomalies(userId);
  return hasAnomaly;
}

// Cleanup old activity records periodically
setInterval(() => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  for (const [userId, activity] of userActivityMap.entries()) {
    if (activity.lastLoginTime < oneDayAgo && activity.lastFailedTime < oneDayAgo) {
      userActivityMap.delete(userId);
    }
  }
}, 60 * 60 * 1000); // Run every hour
