// @ts-nocheck - Supabase RPC type inference issues with Database types
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient, getCurrentAdminUser } from '@/lib/supabase/admin';

/**
 * Middleware to protect admin routes
 * Checks if user is authenticated and has admin access
 */
export async function adminAuthMiddleware(request: NextRequest) {
  const supabase = await createAdminClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    // Redirect to admin login if not authenticated
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has any admin role
  const adminUser = await getCurrentAdminUser();
  
  if (!adminUser || adminUser.roles.length === 0) {
    // User is authenticated but has no admin role
    const unauthorizedUrl = new URL('/unauthorized', request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Check if user account is suspended
  if (adminUser.profile && adminUser.profile.is_suspended) {
    const suspendedUrl = new URL('/suspended', request.url);
    return NextResponse.redirect(suspendedUrl);
  }

  return NextResponse.next();
}

/**
 * Middleware to protect Super Admin only routes
 * Checks if user has Super Admin role
 */
export async function superAdminAuthMiddleware(request: NextRequest) {
  const adminUser = await getCurrentAdminUser();
  
  if (!adminUser) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const hasSuperAdminRole = adminUser.roles.some(
    role => role.name === 'super_admin' && role.is_active
  );

  if (!hasSuperAdminRole) {
    const unauthorizedUrl = new URL('/admin/unauthorized', request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

/**
 * Middleware to check specific permission
 */
export async function permissionMiddleware(request: NextRequest, requiredPermission: string) {
  const adminUser = await getCurrentAdminUser();
  
  if (!adminUser) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .rpc('user_has_permission', {
      p_user_id: adminUser.user.id,
      p_permission_name: requiredPermission
    });

  if (error || !data) {
    const unauthorizedUrl = new URL('/admin/unauthorized', request.url);
    unauthorizedUrl.searchParams.set('permission', requiredPermission);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}
