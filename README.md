# রক্তকরবী (RoktoKorobi) - Blood Donation Platform

A modern blood donation platform connecting donors with those in need. Built with Next.js, Firebase, and TypeScript.

## Features

### For Donors
- **User Registration**: Sign up as a blood donor with detailed profile
- **Blood Requests**: Submit emergency blood requests
- **Donor Search**: Find donors by blood group and location
- **Eligibility Check**: Quick eligibility checker for blood donation
- **Dashboard**: Personal dashboard with donation history and stats
- **Profile Management**: Update personal information and donation history

### For Recipients
- **Emergency Requests**: Submit urgent blood requests with urgency levels
- **Real-time Updates**: Get notified when donors respond
- **Location-based Search**: Find donors in your area

### For Admins
- **User Management**: Manage donor accounts and verification
- **Hospital Management**: Add and manage hospital information
- **Content Management**: Manage blog posts, testimonials, and illustrations
- **Activity Monitoring**: Track platform activity and requests

## Tech Stack

- **Framework**: Next.js 16.2.4
- **Language**: TypeScript 5.2.2
- **Styling**: TailwindCSS 3.3.3
- **Backend**: Firebase (Authentication, Realtime Database)
- **Icons**: Lucide React
- **Maps**: Leaflet (for Bangladesh map)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (free tier works)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RedReach_v22_fixed
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create a new project
3. Enable the following services:

**Authentication**
- Go to Authentication → Sign-in method
- Enable "Email/Password"
- (Optional) Enable email verification

**Realtime Database**
- Go to Realtime Database → Create Database
- Choose "Start in test mode" (update rules later)
- Note your database URL

**Storage** (Optional, for profile pictures)
- Go to Storage → Get Started
- Set up security rules

#### Get Firebase Configuration

1. Go to Project Settings → General → Your apps
2. Click the web icon (</>)
3. Register app (nickname: "RoktoKorobi")
4. Copy the firebaseConfig object

### 4. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase Configuration (Optional - if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security Configuration
CSRF_SECRET=generate_a_random_secret_here

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Security Rules

### Authentication Rules
For production, set these rules in Firebase Console → Authentication → Sign-in method:

- Enable email verification (recommended)
- Set up email templates for verification and password reset

### Database Rules
Update Realtime Database rules in Firebase Console:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "bloodRequests": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$requestId": {
        ".validate": "newData.hasChild('patientName') && newData.hasChild('bloodType')"
      }
    },
    "donors": {
      ".read": true,
      ".write": "auth != null"
    },
    "hospitals": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Seeding Initial Data

Run the seed script to add initial hospitals and sample data:

```bash
npm run seed
# or
node scripts/seed.js
```

This will add:
- Sample hospitals in major Bangladesh cities
- Sample blog posts
- Sample testimonials
- Sample illustrations

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
# The output will be in .next/standalone
```

## Project Structure

```
RedReach_v22_fixed/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── dashboard/           # User dashboard
│   ├── profile/             # Profile management
│   ├── request/             # Blood request form
│   ├── donor-search/        # Donor search
│   ├── eligibility/         # Eligibility checker
│   └── admin/               # Admin pages
├── components/              # Reusable components
│   ├── DonorSearchSection/
│   ├── SocialShare/
│   └── CalendarIntegration/
├── lib/                     # Utility functions
│   └── firebase.ts         # Firebase configuration
├── public/                  # Static assets
├── scripts/                 # Utility scripts
│   └── seed.js              # Database seeding
├── .env.example            # Environment variables template
├── .env.local              # Your actual environment variables (not in git)
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # TailwindCSS configuration
└── package.json            # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data

## Language Support

The platform supports:
- English (en)
- Bengali (bn)

Language toggle is available in the navigation bar and persists via localStorage.

## Troubleshooting

### Firebase Authentication Not Working
- Verify all environment variables are set correctly
- Check Firebase Console that Authentication is enabled
- Ensure email/password sign-in method is enabled

### Database Errors
- Verify Realtime Database is created in Firebase Console
- Check database URL in environment variables
- Review security rules in Firebase Console

### Build Errors
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`
- Check Node.js version (requires 18+)

### Map Not Loading
- Check BangladeshMap component is properly imported
- Verify Leaflet CSS is included
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Firebase](https://firebase.google.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
