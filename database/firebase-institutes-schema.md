# Firebase Realtime Database Structure for Partner Institute System

This document describes the Firebase Realtime Database structure for the partner institute system in RedReach.

## Database Structure

```
/
├── users/
│   └── {userId}/
│       ├── name: string
│       ├── email: string
│       ├── phone: string
│       ├── bloodGroup: string (A+, A-, B+, B-, AB+, AB-, O+, O-)
│       ├── dateOfBirth: string (ISO date)
│       ├── district: string
│       ├── location: string
│       ├── weight: number
│       ├── isDonor: boolean
│       ├── role: string (user, admin, super_admin, org_advocate, banned)
│       ├── totalDonations: number
│       ├── instituteId: string (NEW - partner institute ID)
│       ├── studentId: string (NEW - student ID from institute)
│       ├── instituteVerified: boolean (NEW - verified by institute admin)
│       ├── createdAt: string (ISO timestamp)
│       └── updatedAt: string (ISO timestamp)
├── partnerInstitutes/
│   └── {instituteId}/
│       ├── name: string
│       ├── type: string (school, college, university, ngo, corporate)
│       ├── contactPerson: string
│       ├── email: string
│       ├── phone: string
│       ├── address: string
│       ├── district: string
│       ├── licenseNumber: string
│       ├── status: string (pending, approved, rejected, suspended)
│       ├── referralCode: string (8-character unique code)
│       ├── adminUserId: string (Firebase Auth UID of institute admin)
│       ├── totalDonors: number
│       ├── totalDonations: number
│       ├── createdAt: string (ISO timestamp)
│       └── updatedAt: string (ISO timestamp)
├── instituteStats/
│   └── {instituteId}/
│       └── {month}/ (format: YYYY-MM)
│           ├── newDonors: number
│           ├── totalDonations: number
│           ├── bloodRequestsCreated: number
│           └── createdAt: string (ISO timestamp)
├── instituteNotifications/
│   └── {notificationId}/
│       ├── instituteId: string
│       ├── title: string
│       ├── message: string
│       ├── type: string (info, success, warning, urgent)
│       ├── isRead: boolean
│       └── createdAt: string (ISO timestamp)
└── bloodRequests/ (existing - unchanged)
    └── {requestId}/
        └── ... (existing structure)
```

## Data Relationships

### User to Institute
- `users/{userId}.instituteId` → references `partnerInstitutes/{instituteId}`
- When a user registers with a referral code, they are linked to an institute
- Institute admin can verify students by updating `instituteVerified` field

### Institute to Admin
- `partnerInstitutes/{instituteId}.adminUserId` → references Firebase Auth user
- Institute admin has role 'admin' in their user profile

### Institute Stats
- `instituteStats/{instituteId}/{month}` stores monthly statistics
- Aggregated from user donations and blood requests

## Indexes for Querying

Firebase Realtime Database doesn't require explicit indexes, but efficient queries should use:
- Query by status: `partnerInstitutes` ordered by `status`
- Query by district: `partnerInstitutes` ordered by `district`
- Query by institute: `users` ordered by `instituteId`

## Security Rules

See `database.rules.json` for the complete security rules configuration.

## Migration Notes

When migrating from the existing system:
1. Add new fields to existing user documents (`instituteId`, `studentId`, `instituteVerified`)
2. Create `partnerInstitutes` collection
3. Create `instituteStats` collection
4. Create `instituteNotifications` collection
5. Update Firebase Auth custom claims for role management
