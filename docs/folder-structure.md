# Super Admin System Folder Structure

```
RedReach_v22_fixed/
├── app/
│   ├── (auth)/
│   │   ├── admin/
│   │   │   ├── register/
│   │   │   │   └── page.tsx              # Super Admin registration (hidden after first admin)
│   │   │   └── login/
│   │   │       └── page.tsx              # Admin login page
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── layout.tsx                     # Admin dashboard layout with sidebar
│   │   ├── page.tsx                      # Admin dashboard overview
│   │   ├── users/
│   │   │   ├── page.tsx                  # User management page
│   │   │   └── [userId]/
│   │   │       └── page.tsx              # User detail page
│   │   ├── roles/
│   │   │   ├── page.tsx                  # Role management page
│   │   │   └── [roleId]/
│   │   │       └── page.tsx              # Role detail page
│   │   ├── permissions/
│   │   │   └── page.tsx                  # Permissions management page
│   │   ├── blogs/
│   │   │   ├── page.tsx                  # Blog list and management
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Create new blog
│   │   │   └── [blogId]/
│   │   │       ├── page.tsx              # Blog edit page
│   │   │       └── preview/
│   │   │           └── page.tsx          # Blog preview page
│   │   ├── illustrations/
│   │   │   ├── page.tsx                  # Illustration management
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Upload new illustration
│   │   │   └── [illustrationId]/
│   │   │       └── page.tsx              # Illustration edit page
│   │   ├── testimonials/
│   │   │   ├── page.tsx                  # Testimonial approval queue
│   │   │   └── [testimonialId]/
│   │   │       └── page.tsx              # Testimonial detail page
│   │   ├── organizations/
│   │   │   ├── page.tsx                  # Organization management
│   │   │   └── [orgId]/
│   │   │       └── page.tsx              # Organization detail page
│   │   ├── hospitals/
│   │   │   ├── page.tsx                  # Hospital management
│   │   │   └── [hospitalId]/
│   │   │       └── page.tsx              # Hospital detail page
│   │   ├── campaigns/
│   │   │   ├── page.tsx                  # Campaign management
│   │   │   └── [campaignId]/
│   │   │       └── page.tsx              # Campaign detail page
│   │   ├── activity/
│   │   │   └── page.tsx                  # Activity logs viewer
│   │   └── settings/
│   │       └── page.tsx                  # System settings page
│   ├── api/
│   │   └── admin/
│   │       ├── auth/
│   │       │   └── route.ts              # Admin authentication endpoint
│   │       ├── users/
│   │       │   ├── route.ts              # User CRUD operations
│   │       │   ├── [userId]/
│   │       │   │   ├── route.ts          # User specific operations
│   │       │   │   ├── roles/
│   │       │   │   │   └── route.ts      # Assign/revoke roles
│   │       │   │   └── suspend/
│   │       │   │       └── route.ts      # Suspend/unsuspend user
│   │       ├── roles/
│   │       │   ├── route.ts              # Role CRUD operations
│   │       │   └── [roleId]/
│   │       │       ├── route.ts          # Role specific operations
│   │       │       └── permissions/
│   │       │           └── route.ts      # Manage role permissions
│   │       ├── permissions/
│   │       │   └── route.ts              # Permission management
│   │       ├── blogs/
│   │       │   ├── route.ts              # Blog CRUD operations
│   │       │   └── [blogId]/
│   │       │       └── route.ts          # Blog specific operations
│   │       ├── illustrations/
│   │       │   ├── route.ts              # Illustration CRUD operations
│   │       │   └── [illustrationId]/
│   │       │       └── route.ts          # Illustration specific operations
│   │       ├── testimonials/
│   │       │   ├── route.ts              # Testimonial operations
│   │       │   └── [testimonialId]/
│   │       │       └── route.ts          # Testimonial approval
│   │       ├── organizations/
│   │       │   ├── route.ts              # Organization CRUD
│   │       │   └── [orgId]/
│   │       │       └── route.ts          # Org specific operations
│   │       ├── hospitals/
│   │       │   ├── route.ts              # Hospital CRUD
│   │       │   └── [hospitalId]/
│   │       │       └── route.ts          # Hospital specific operations
│   │       ├── campaigns/
│   │       │   ├── route.ts              # Campaign CRUD
│   │       │   └── [campaignId]/
│   │       │       └── route.ts          # Campaign specific operations
│   │       ├── activity/
│   │       │   └── route.ts              # Activity log retrieval
│   │       └── settings/
│   │           └── route.ts              # System settings management
│   └── (main app pages continue...)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Supabase client
│   │   ├── server.ts                    # Supabase server client
│   │   ├── admin.ts                     # Admin-specific Supabase client
│   │   └── types.ts                     # Supabase type definitions
│   ├── auth/
│   │   ├── middleware.ts                # Authentication middleware
│   │   ├── permissions.ts               # Permission checking functions
│   │   └── rbac.ts                      # RBAC authorization logic
│   └── utils/
│       ├── logger.ts                    # Activity logging utility
│       └── validators.ts                # Input validation helpers
├── components/
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # Dashboard sidebar
│   │   │   ├── Header.tsx               # Dashboard header
│   │   │   └── AdminLayout.tsx         # Main layout wrapper
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx            # Statistics card
│   │   │   ├── ActivityChart.tsx        # Activity chart
│   │   │   └── RecentActivity.tsx       # Recent activity list
│   │   ├── users/
│   │   │   ├── UserTable.tsx            # Users data table
│   │   │   ├── UserFilters.tsx          # User filter controls
│   │   │   ├── UserRoleAssign.tsx      # Role assignment modal
│   │   │   ├── UserSuspendModal.tsx     # Suspension modal
│   │   │   └── UserDeleteModal.tsx      # Deletion confirmation
│   │   ├── roles/
│   │   │   ├── RoleTable.tsx            # Roles data table
│   │   │   ├── RolePermissions.tsx      # Permission toggle for role
│   │   │   └── CreateRoleModal.tsx      # Create role modal
│   │   ├── permissions/
│   │   │   ├── PermissionGrid.tsx       # Permission management grid
│   │   │   └── PermissionToggle.tsx     # Individual permission toggle
│   │   ├── blogs/
│   │   │   ├── BlogTable.tsx            # Blog posts table
│   │   │   ├── BlogEditor.tsx           # Rich text editor for blogs
│   │   │   ├── BlogPreview.tsx          # Blog preview component
│   │   │   └── ThumbnailUpload.tsx      # Image upload component
│   │   ├── illustrations/
│   │   │   ├── IllustrationGrid.tsx     # Illustrations grid
│   │   │   ├── UploadModal.tsx          # Upload modal
│   │   │   └── CategorySelector.tsx     # Category selection
│   │   ├── testimonials/
│   │   │   ├── TestimonialTable.tsx     # Testimonials queue
│   │   │   ├── ApprovalModal.tsx        # Approval/rejection modal
│   │   │   └── TestimonialCard.tsx      # Individual testimonial card
│   │   ├── organizations/
│   │   │   ├── OrgTable.tsx             # Organizations table
│   │   │   └── OrgForm.tsx             # Organization form
│   │   ├── hospitals/
│   │   │   ├── HospitalTable.tsx        # Hospitals table
│   │   │   └── HospitalForm.tsx         # Hospital form
│   │   ├── campaigns/
│   │   │   ├── CampaignTable.tsx        # Campaigns table
│   │   │   └── CampaignForm.tsx         # Campaign form
│   │   ├── activity/
│   │   │   ├── ActivityTable.tsx        # Activity logs table
│   │   │   └── ActivityFilters.tsx      # Filter controls
│   │   ├── settings/
│   │   │   ├── SettingsForm.tsx         # Settings form
│   │   │   └── SuperAdminToggle.tsx     # Super admin creation toggle
│   │   └── common/
│   │       ├── DataTable.tsx            # Reusable data table
│   │       ├── SearchBar.tsx            # Search bar component
│   │       ├── Pagination.tsx           # Pagination component
│   │       ├── Modal.tsx                # Reusable modal
│   │       ├── ConfirmDialog.tsx        # Confirmation dialog
│   │       ├── EmptyState.tsx           # Empty state component
│   │       ├── LoadingSkeleton.tsx      # Loading skeleton
│   │       └── Toast.tsx               # Toast notifications
│   └── (other app components continue...)
├── hooks/
│   ├── admin/
│   │   ├── useAuth.ts                   # Admin authentication hook
│   │   ├── usePermissions.ts            # Permission checking hook
│   │   ├── useUsers.ts                  # User management hook
│   │   ├── useRoles.ts                  # Role management hook
│   │   ├── useBlogs.ts                  # Blog management hook
│   │   ├── useTestimonials.ts          # Testimonial management hook
│   │   └── useActivityLogs.ts          # Activity logs hook
│   └── (other app hooks continue...)
├── server-actions/
│   ├── admin/
│   │   ├── auth.ts                      # Admin auth actions
│   │   ├── users.ts                     # User management actions
│   │   ├── roles.ts                     # Role management actions
│   │   ├── permissions.ts               # Permission management actions
│   │   ├── blogs.ts                     # Blog CRUD actions
│   │   ├── illustrations.ts             # Illustration actions
│   │   ├── testimonials.ts              # Testimonial actions
│   │   ├── organizations.ts             # Organization actions
│   │   ├── hospitals.ts                 # Hospital actions
│   │   ├── campaigns.ts                 # Campaign actions
│   │   ├── activity.ts                  # Activity logging actions
│   │   └── settings.ts                  # Settings actions
│   └── (other server actions continue...)
├── types/
│   ├── admin.ts                         # Admin-specific type definitions
│   ├── rbac.ts                          # RBAC type definitions
│   ├── database.ts                      # Database type definitions
│   └── (other type files continue...)
├── docs/
│   ├── database-schema.sql              # Database schema (already created)
│   ├── folder-structure.md             # This file
│   ├── api-routes.md                    # API routes documentation
│   └── security-guidelines.md           # Security best practices
└── (other project files...)
```

## Key Directories Explained

### `/app/admin/`
- Contains all Super Admin dashboard pages
- Protected by authentication and permission middleware
- Organized by feature (users, roles, blogs, etc.)

### `/app/api/admin/`
- Server-side API endpoints for admin operations
- All endpoints protected by RBAC
- Server Actions can be used as an alternative

### `/lib/auth/`
- Authentication middleware
- Permission checking utilities
- RBAC authorization logic

### `/lib/supabase/`
- Supabase client configurations
- Type definitions for database tables
- Admin-specific database client

### `/components/admin/`
- Reusable admin UI components
- Feature-specific components
- Common/shared components

### `/hooks/admin/`
- Custom React hooks for admin operations
- Data fetching and state management
- Permission checking hooks

### `/server-actions/admin/`
- Server Actions for admin operations
- Secure server-side functions
- Database operations

### `/types/`
- TypeScript type definitions
- Database types
- Admin-specific types
