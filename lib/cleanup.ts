// Cleanup utilities for free tier cost optimization

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration
const CLEANUP_CONFIG = {
  COMPLETED_REQUESTS_DAYS: 30, // Delete completed requests after 30 days
  OLD_LOGS_DAYS: 7, // Keep logs for 7 days
  CANCELLED_REQUESTS_DAYS: 7, // Delete cancelled requests after 7 days
};

/**
 * Delete completed blood requests older than specified days
 */
export async function cleanupOldBloodRequests() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.COMPLETED_REQUESTS_DAYS);

    const { error } = await supabase
      .from('blood_requests')
      .delete()
      .in('status', ['completed', 'cancelled'])
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error cleaning up old blood requests:', error);
      return { success: false, error: error.message };
    }

    console.log(`Cleaned up blood requests older than ${CLEANUP_CONFIG.COMPLETED_REQUESTS_DAYS} days`);
    return { success: true };
  } catch (error) {
    console.error('Error in cleanupOldBloodRequests:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Clean up old audit logs (if audit log table exists)
 */
export async function cleanupOldLogs() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.OLD_LOGS_DAYS);

    // This assumes an audit_logs table exists - adjust as needed
    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      // If table doesn't exist, that's okay
      if (error.code === '42P01') {
        console.log('Audit logs table does not exist, skipping log cleanup');
        return { success: true, skipped: true };
      }
      console.error('Error cleaning up old logs:', error);
      return { success: false, error: error.message };
    }

    console.log(`Cleaned up logs older than ${CLEANUP_CONFIG.OLD_LOGS_DAYS} days`);
    return { success: true };
  } catch (error) {
    console.error('Error in cleanupOldLogs:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Clean up expired session tokens from database
 */
export async function cleanupExpiredSessions() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24); // Sessions older than 24 hours

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      // If table doesn't exist, that's okay
      if (error.code === '42P01') {
        console.log('User sessions table does not exist, skipping session cleanup');
        return { success: true, skipped: true };
      }
      console.error('Error cleaning up expired sessions:', error);
      return { success: false, error: error.message };
    }

    console.log('Cleaned up expired sessions');
    return { success: true };
  } catch (error) {
    console.error('Error in cleanupExpiredSessions:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Run all cleanup tasks
 */
export async function runAllCleanupTasks() {
  const results = {
    bloodRequests: await cleanupOldBloodRequests(),
    logs: await cleanupOldLogs(),
    sessions: await cleanupExpiredSessions(),
  };

  const allSuccess = Object.values(results).every(r => r.success);
  
  console.log('Cleanup tasks completed:', results);
  return { success: allSuccess, results };
}
