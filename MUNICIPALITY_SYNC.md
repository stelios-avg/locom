# Municipality Auto-Sync Setup Guide

Αυτό το σύστημα επιτρέπει να ανεβάζονται αυτόματα οι δημοσιεύσεις του δήμου στο app από RSS feed ή JSON API.

## Βήματα Ρύθμισης

### 1. Δημιούργησε έναν "Municipality User" στο Supabase

1. Πήγαινε στο Supabase Dashboard → **Authentication → Users**
2. Κάνε κλικ στο **"Add user"** (ή "Invite user")
3. Δημιούργησε έναν user με:
   - **Email**: `municipality@locom.local` (ή ό,τι θέλεις)
   - **Password**: Δημιούργησε έναν ισχυρό password
4. **Σημαντικό**: Κάνε κλικ στον user και **"Confirm email"** (για να μην χρειάζεται confirmation)
5. **Αντιγράψε το User ID** (UUID) - το χρειάζεσαι για το `.env.local`

### 2. Δημιούργησε Profile για τον Municipality User

1. Πήγαινε στο **Table Editor → profiles**
2. Κάνε **"Insert row"**
3. Συμπλήρωσε:
   - `user_id`: Το UUID του municipality user που δημιούργησες
   - `name`: "Δήμος" (ή όνομα δήμου)
   - `neighborhood`: "Municipality" (ή όνομα περιοχής)
4. Αποθήκευσε

### 3. Ρύθμισε το `.env.local`

Άνοιξε το `.env.local` και πρόσθεσε:

```env
# Municipality Sync Configuration
# For Nicosia Municipality (HTML parsing):
MUNICIPALITY_FEED_URL=https://www.nicosia.org.cy/el-GR/news/announcements/2025/
MUNICIPALITY_SYNC_SECRET=your-very-secure-random-secret-key-here
MUNICIPALITY_USER_ID=uuid-of-municipality-user-from-step-1
MUNICIPALITY_LOCATION=35.1856,33.3823,Λευκωσία
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase
```

**Σημείωση για Δήμο Λευκωσίας:**
Το σύστημα υποστηρίζει αυτόματα HTML parsing για το site `nicosia.org.cy`. Απλά βάλε το URL της σελίδας με τις ανακοινώσεις.

**Που βρίσκεις τα credentials:**
- `MUNICIPALITY_FEED_URL`: Το RSS feed URL του δήμου (ή JSON API)
- `MUNICIPALITY_SYNC_SECRET`: Δημιούργησε έναν τυχαίο secret (για ασφάλεια)
- `MUNICIPALITY_USER_ID`: Το UUID από το βήμα 1
- `MUNICIPALITY_LOCATION`: Συντεταγμένες και όνομα δήμου (lat,lng,name)
- `SUPABASE_SERVICE_ROLE_KEY`: Στο Supabase Dashboard → **Project Settings → API → service_role key**

### 4. Δοκίμασε το Sync

Μπορείς να δοκιμάσεις το sync endpoint:

```bash
curl -X POST http://localhost:3000/api/sync-municipality \
  -H "Authorization: Bearer your-secret-key-from-env"
```

Ή πήγαινε στο browser:
```
http://localhost:3000/api/sync-municipality
```

### 5. Ρύθμισε Cron Job (για Production)

Για να τρέχει αυτόματα κάθε X ώρες, χρησιμοποίησε:

#### Option A: Vercel Cron (αν deploy στο Vercel)

Δημιούργησε `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync-municipality",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Και στο `.env` του Vercel πρόσθεσε:
- `MUNICIPALITY_FEED_URL`
- `MUNICIPALITY_SYNC_SECRET`
- `MUNICIPALITY_USER_ID`
- `MUNICIPALITY_LOCATION`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Option B: External Cron Service

Χρησιμοποίησε services όπως:
- **cron-job.org** (free)
- **EasyCron**
- **UptimeRobot**

Ρύθμισε να καλεί:
- **URL**: `https://yourdomain.com/api/sync-municipality`
- **Method**: POST
- **Headers**: `Authorization: Bearer your-secret-key`
- **Schedule**: Κάθε 6 ώρες (ή όσο θέλεις)

## Υποστηριζόμενα Feed Formats

### HTML Parsing (Δήμος Λευκωσίας)
Το endpoint υποστηρίζει HTML parsing για το site του Δήμου Λευκωσίας:
```
https://www.nicosia.org.cy/el-GR/news/announcements/2025/
```
Το σύστημα αναγνωρίζει αυτόματα URLs που περιέχουν `nicosia.org.cy` και χρησιμοποιεί HTML parser.

### RSS Feed
Το endpoint αναγνωρίζει αυτόματα RSS feeds. Παράδειγμα:
```
https://example.com/municipality/rss.xml
```

### JSON Feed
Το endpoint αναγνωρίζει JSON feeds. Παράδειγμα:
```
https://example.com/municipality/api/posts.json
```

**JSON Format Example:**
```json
{
  "items": [
    {
      "title": "Post Title",
      "content": "Post description...",
      "image": "https://example.com/image.jpg",
      "date": "2024-01-15T10:00:00Z",
      "url": "https://example.com/post/1"
    }
  ]
}
```

## Troubleshooting

### Τα posts δεν εμφανίζονται
- Έλεγξε ότι το `MUNICIPALITY_USER_ID` είναι σωστό
- Έλεγξε ότι υπάρχει profile για τον municipality user
- Έλεγξε τα logs στο Supabase Dashboard → **Logs**

### "Unauthorized" error
- Έλεγξε ότι το `MUNICIPALITY_SYNC_SECRET` είναι σωστό στο Authorization header

### "Failed to fetch municipality feed"
- Έλεγξε ότι το `MUNICIPALITY_FEED_URL` είναι σωστό
- Έλεγξε ότι το RSS feed είναι προσβάσιμο

### Duplicate posts
Το σύστημα ελέγχει για duplicates, αλλά αν βλέπεις duplicates:
- Έλεγξε ότι το feed δεν έχει αλλάξει format
- Μπορεί να χρειάζεται να προσθέσεις καλύτερο duplicate checking

## Customization

Μπορείς να προσαρμόσεις το parsing στο `lib/municipality-sync.ts` αν το feed του δήμου έχει διαφορετικό format.

