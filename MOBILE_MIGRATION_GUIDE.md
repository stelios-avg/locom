# Migration Guide: Web App → Mobile App

Για να λειτουργήσει το app σε mobile (iOS/Android), χρειάζονται κάποιες αλλαγές:

## Σημαντικές Αλλαγές

### 1. Static Export
Το Next.js πρέπει να γίνει static export. Αυτό σημαίνει:
- ❌ **Δεν λειτουργούν**: Server Components, API Routes, Server Actions
- ✅ **Λειτουργούν**: Client Components, Static Pages, Client-side data fetching

### 2. Αλλαγές που Χρειάζονται

#### A. Μετατροπή Server Components → Client Components

**Πριν** (`app/page.tsx`):
```tsx
export default async function Home() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  // ...
}
```

**Μετά** (`app/page.tsx`):
```tsx
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import Feed from '@/components/Feed'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Feed />
    </main>
  )
}
```

#### B. Μετατροπή API Routes → Supabase Client

**Πριν** (API Route):
```tsx
// app/api/sync-municipality/route.ts
export async function POST(request: Request) {
  // Server-side logic
}
```

**Μετά** (Supabase Functions ή External API):
- Μεταφέρε τα API routes σε Supabase Edge Functions
- Ή χρησιμοποίησε external API server
- Ή κάνε client-side μόνο με Supabase RLS

#### C. Ενημέρωση όλων των Pages

Όλες οι pages που είναι server components πρέπει να γίνουν client components:
- `app/page.tsx` ✅ (already needs change)
- `app/admin/page.tsx` ✅ (needs change)
- `app/marketplace/page.tsx` ✅ (needs change)
- `app/events/page.tsx` ✅ (needs change)
- `app/profile/[id]/page.tsx` ✅ (needs change)
- `app/post/[id]/page.tsx` ✅ (needs change)

#### D. Middleware Changes

Το `middleware.ts` δεν λειτουργεί με static export. Χρησιμοποίησε client-side redirects:

```tsx
// components/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <>{children}</>
}
```

### 3. Build Process

**Για Web (Development):**
```bash
npm run dev
```

**Για Mobile:**
```bash
# 1. Switch to mobile config
cp next.config.mobile.js next.config.js

# 2. Build
npm run build:mobile

# 3. Open in Xcode/Android Studio
npm run cap:open:ios
# or
npm run cap:open:android
```

### 4. Environment Variables

Για mobile apps, χρειάζεται να ορίσεις environment variables διαφορετικά:
- Χρησιμοποίησε `capacitor.config.ts` για runtime config
- Ή hardcode τα public values (NEXT_PUBLIC_*)

### 5. Testing Checklist

- [ ] Όλα τα pages λειτουργούν χωρίς server components
- [ ] Authentication λειτουργεί (Supabase client-side)
- [ ] Images φορτώνουν (με `unoptimized: true`)
- [ ] Geolocation λειτουργεί (Capacitor plugin)
- [ ] Camera/Gallery access λειτουργεί
- [ ] Push notifications (αν χρειάζεται)

## Quick Start για Mobile

1. **Εγκατάσταση:**
   ```bash
   npm install
   ```

2. **Αλλαγές στο code:**
   - Μετατρέψε όλα τα server components σε client
   - Μεταφέρε API routes σε Supabase Functions
   - Update middleware → client-side redirects

3. **Build:**
   ```bash
   cp next.config.mobile.js next.config.js
   npm run build:mobile
   ```

4. **Open in IDE:**
   ```bash
   npm run cap:open:ios
   # or
   npm run cap:open:android
   ```

5. **Build & Deploy:**
   - iOS: Xcode → Archive → App Store Connect
   - Android: Android Studio → Build → Play Store

## Resources

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Supabase Client-side Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)


