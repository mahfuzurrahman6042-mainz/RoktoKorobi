# RedReach - Blood Donation PWA

A Progressive Web Application (PWA) for blood donation management that connects blood donors with those in need.

## Features

- **Donor Registration**: Register as a blood donor with complete profile information
- **Blood Requests**: Submit urgent blood requests with location and urgency details
- **Donor Search**: Find blood donors near you with filtering by blood group and location
- **Eligibility Checking**: Check if you're eligible to donate based on last donation date
- **PWA Support**: Works offline and can be installed on mobile devices
- **Real-time Updates**: Built with React Query for efficient data management

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **State Management**: TanStack React Query v5
- **Storage**: AWS S3/R2 for file uploads
- **PWA**: Service Worker, Manifest, Offline support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project set up
- Git (optional)

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd c:\Users\Mahfuzur Rahman\Downloads\RedReach_v22_fixed
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```

4. **Set up Supabase database**:
   - Run the SQL schema from `database/schema_v22_hardened.sql`
   - Create the required tables and functions in your Supabase project

### Running the App

**Development mode**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production build**:
```bash
npm run build
npm start
```

## Database Schema

The application uses the following main tables:

- `profiles`: Donor registration information
- `blood_requests`: Blood donation requests
- `donations`: Donation records
- `notifications`: System notifications

See `database/schema_v22_hardened.sql` for the complete schema including stored functions.

## PWA Features

- **Offline Support**: Works without internet connection using service worker
- **Installable**: Can be installed as a mobile app
- **Push Notifications**: Ready for notification integration
- **App Shortcuts**: Quick access to key features

## Pages

- **Home** (`/`): Landing page with navigation to all features
- **Register** (`/register`): Donor registration form
- **Request** (`/request`): Blood request submission
- **Donors** (`/donors`): Search and filter donors
- **Eligibility** (`/eligibility`): Check donation eligibility

## API Routes

- `/api/upload/r2`: File upload to R2 storage

## Hooks

- `useOfflineQueue`: Queue operations for offline support
- `useGeolocationBatch`: Batch geolocation updates
- `useEligibility`: Check donor eligibility status
- `useDonors`: Fetch and filter donors
- `useUserProfile`: Get user profile data

## Testing

```bash
npm test
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Digital Ocean App Platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
