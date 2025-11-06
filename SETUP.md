# Locom Setup Guide

This guide will help you set up Locom on your local machine or deploy it to production.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize (this takes a few minutes)

### 3. Configure Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the contents of `supabase/schema.sql` to create all tables, policies, and triggers
3. Run the contents of `supabase/storage.sql` to create storage buckets

### 4. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Get your Supabase credentials from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (keep this secret!)

### 5. Configure Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
6. In Supabase Dashboard, go to **Authentication → Providers**
7. Enable Google provider and add your Client ID and Secret

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and you should see the login page!

## Database Schema

The application uses the following main tables:

- **profiles** - User profile information
- **posts** - Feed posts, marketplace listings, and events
- **comments** - Comments on posts
- **neighborhoods** - Predefined neighborhood data (optional)

## Storage Buckets

Two storage buckets are created:

- **avatars** - User profile pictures
- **post-images** - Images attached to posts

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment

1. Make sure to run the SQL scripts in your production Supabase project
2. Update Google OAuth redirect URIs to include your production domain
3. Test the authentication flow

## Troubleshooting

### Authentication Issues

- Make sure your Supabase project is active
- Check that environment variables are set correctly
- Verify Google OAuth credentials if using Google login

### Database Issues

- Ensure all SQL scripts have been run successfully
- Check Row Level Security (RLS) policies are enabled
- Verify triggers are created (for auto profile creation)

### Image Upload Issues

- Verify storage buckets are created
- Check storage policies allow uploads
- Ensure file size limits are appropriate in Supabase settings

## Need Help?

Check the main README.md for more detailed information about features and architecture.

