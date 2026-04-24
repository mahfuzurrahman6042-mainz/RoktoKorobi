import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  details?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: entry.user_id,
      user_email: entry.user_email,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      success: entry.success,
      details: entry.details,
    });
  } catch (error) {
    // Fail silently - don't break application if logging fails
  }
}

export async function logSecurityEvent(
  action: string,
  resourceType: string,
  resourceId?: string,
  userId?: string,
  userEmail?: string,
  ipAddress?: string,
  success: boolean = true,
  details?: string
): Promise<void> {
  await logAuditEvent({
    user_id: userId,
    user_email: userEmail,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: ipAddress,
    success,
    details,
  });
}
