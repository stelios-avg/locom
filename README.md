# Locom - Local Community Platform

Locom is a full-stack web application connecting people who live in the same area in Cyprus. Users can share local news, post small ads, organize events, and find trusted neighbors or professionals.

## Features

- 🔐 **Authentication** - Sign up/login with email or Google OAuth
- 📱 **Neighborhood Feed** - Share updates, events, or requests with your neighbors
- 📍 **Geo-based Filtering** - Posts are visible only to users within a selected radius
- 👤 **User Profiles** - Name, picture, bio, and neighborhood information
- 🛍️ **Mini Marketplace** - Buy and sell second-hand items or local services
- 📅 **Event Board** - Discover and organize local gatherings
- 🛡️ **Admin Panel** - Moderate posts and manage the community

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage)
- **Styling:** Tailwind CSS with custom design system
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Date Handling:** date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier works)

### Setup Instructions

1. **Clone or navigate to the project:**
   ```bash
   cd locom
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase:**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for your project to be ready

4. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```
   - You can find these in your Supabase project settings → API

5. **Set up the database:**
   - In Supabase Dashboard, go to SQL Editor
   - Run the SQL from `supabase/schema.sql` to create tables and policies
   - Run the SQL from `supabase/storage.sql` to create storage buckets

6. **Configure Authentication:**
   - In Supabase Dashboard, go to Authentication → Providers
   - Enable Email provider (already enabled by default)
   - Enable Google OAuth:
     - Add your Google OAuth credentials (Client ID and Secret)
     - Add `http://localhost:3000/auth/callback` to Redirect URLs (for development)
     - Add your production URL to Redirect URLs (for production)

7. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
locom/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── marketplace/       # Marketplace page
│   ├── events/            # Events page
│   ├── profile/           # User profile pages
│   └── post/              # Post detail pages
├── components/            # React components
│   ├── auth/             # Auth components
│   └── ...                # Other components
├── lib/                   # Utility libraries
│   └── supabase/         # Supabase client setup
├── types/                 # TypeScript type definitions
├── utils/                # Utility functions
├── supabase/             # Database and storage SQL
└── public/               # Static assets
```

## Environment Variables

Make sure to set up these environment variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Optional, for enhanced location features

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

The app will automatically build and deploy on every push to your main branch.

### Database Setup in Production

Make sure to run the SQL scripts (`supabase/schema.sql` and `supabase/storage.sql`) in your Supabase production project as well.

## Features in Detail

### Authentication
- Email/password authentication
- Google OAuth integration
- Automatic profile creation on signup

### Neighborhood Feed
- Create posts with text, images, and location
- View posts within a configurable radius (1-20km)
- Comment on posts
- Real-time updates

### Marketplace
- Create listings with price and category
- Filter by category
- Browse second-hand items and services

### Events
- Create events with date, time, and location
- Filter by upcoming/past events
- Discover local gatherings

### User Profiles
- Customizable profile with avatar, name, bio, and neighborhood
- View user's posts
- Edit own profile

### Admin Panel
- View all posts
- Delete posts
- Moderate content (extensible for more features)

## Future Enhancements

The architecture is designed to be easily extensible for:
- Direct messaging between users
- Verified user badges
- Gamified rewards system
- Greek language localization (i18n ready)
- Push notifications
- Advanced search and filtering

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on the repository or contact the maintainer.

---

Built with ❤️ for the Cypriot community

