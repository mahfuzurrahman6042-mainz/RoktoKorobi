# Quick Start Guide - RoktoKorobi Blood Donation System

## Step 1: Environment Setup

### 1.1 Copy Environment File
```bash
cp .env.example .env.local
```

### 1.2 Configure Required Variables
Edit `.env.local` and set these REQUIRED values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Security (CRITICAL - MUST BE SET)
JWT_SECRET=your_super_secret_key_at_least_32_chars_long_12345678901234567890

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Step 2: Database Setup

### 2.1 Apply Database Schema
Run these SQL files in your Supabase SQL Editor in order:
1. `database/admin_system.sql`
2. `database/blog_schema.sql`
3. `database/performance_indexes.sql`

### 2.2 Create Storage Bucket
```sql
-- Create storage bucket for illustrations
INSERT INTO storage.buckets (id, name, public) 
VALUES ('roktokorobi-chitro', 'roktokorobi-chitro', true);
```

## Step 3: Install Dependencies
```bash
npm install
```

## Step 4: Start Development Server
```bash
npm run dev
```

## Step 5: Test Application

### 5.1 Verify App Starts
Visit: http://localhost:3000

### 5.2 Test Health Endpoint
Visit: http://localhost:3000/api/health

### 5.3 Test Registration
1. Go to http://localhost:3000/register
2. Fill out registration form
3. Verify account creation works

### 5.4 Test Login
1. Go to http://localhost:3000/login
2. Use registered credentials
3. Verify login works

## Troubleshooting

### App Won't Start
- Check if `.env.local` exists
- Verify `JWT_SECRET` is set
- Check Supabase credentials

### Database Errors
- Verify SQL scripts were applied
- Check Supabase connection
- Ensure storage bucket exists

### Authentication Issues
- Verify JWT_SECRET is 32+ characters
- Check Supabase auth settings
- Clear browser cookies

## Production Deployment

When ready for production:
1. Set `NODE_ENV=production`
2. Update `ALLOWED_ORIGIN` to your domain
3. Set real Supabase credentials
4. Run `npm run build`
5. Deploy to your hosting platform

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables
3. Ensure database schema is applied
4. Test with fresh browser session
