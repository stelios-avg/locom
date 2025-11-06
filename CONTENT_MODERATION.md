# Content Moderation System

Το Locom έχει ενσωματωμένο σύστημα ελέγχου περιεχομένου για να προστατεύει την κοινότητα από ακατάλληλο περιεχόμενο.

## Features

### 1. Automatic Content Filtering

#### Text Moderation:
- **Keyword Filtering**: Ελέγχει για ακατάλληλες λέξεις (Ελληνικά & Αγγλικά)
- **Spam Detection**: 
  - Εντοπίζει υπερβολική χρήση κεφαλαίων (shouting)
  - Εντοπίζει επανάληψη λέξεων (spam patterns)
- **URL Detection**: Εντοπίζει links που μπορεί να είναι spam

#### Image Moderation:
- **File Size**: Μέγιστο 10MB
- **File Type**: Μόνο JPEG, PNG, GIF, WebP
- **Filename Check**: Ελέγχει το όνομα αρχείου για ακατάλληλες λέξεις

### 2. Admin Moderation Panel

Οι admins μπορούν:
- **View All Posts**: Βλέπουν όλα τα posts (pending, approved, rejected)
- **Approve Posts**: Εγκρίνουν posts
- **Reject Posts**: Απορρίπτουν posts με reason
- **Delete Posts**: Διαγράφουν posts
- **Flag Detection**: Βλέπουν αυτόματα flagged posts

### 3. Post Status System

- **pending**: Περιμένει έγκριση (αν manual review είναι enabled)
- **approved**: Εγκεκριμένο, εμφανίζεται στο feed
- **rejected**: Απορριφθέν, δεν εμφανίζεται

## Setup Instructions

### 1. Database Setup

Τρέξε το SQL script στο Supabase SQL Editor:

```sql
-- Run supabase/moderation-schema.sql
```

Αυτό θα προσθέσει:
- `status` column στο `posts` table
- `moderation_notes` column
- `moderated_by` column
- `moderated_at` timestamp
- `is_admin` column στο `profiles` table

### 2. Set Admin User

Στο Supabase Table Editor, βρες τον admin user στο `profiles` table και set:
```sql
UPDATE profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_ID';
```

### 3. Configure Auto-Approval

**Option A: Auto-Approve (Current)**
- Posts εγκρίνονται αυτόματα
- Validation γίνεται πριν το submit
- Admin μπορεί να reject/delete μετά

**Option B: Manual Review**
Στο `components/CreatePostModal.tsx`, άλλαξε:
```typescript
status: 'pending', // Instead of 'approved'
```

Και στο `components/Feed.tsx`, άλλαξε το query:
```typescript
.or('status.eq.approved') // Only show approved
```

## Customization

### Προσθήκη Keywords

Στο `lib/content-moderation.ts`, προσθέστε keywords στο array:
```typescript
const INAPPROPRIATE_KEYWORDS = [
  // Your custom keywords here
  'custom-word-1',
  'custom-word-2',
]
```

### Προσθήκη AI Moderation (Optional)

Μπορείς να προσθέσεις AI-based moderation με:
- **OpenAI Moderation API**
- **Google Cloud Vision API** (για images)
- **AWS Rekognition** (για images)

Example integration:
```typescript
async function checkWithAI(content: string) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: content }),
  })
  const data = await response.json()
  return !data.results[0].flagged
}
```

## Usage

### For Users:
1. Όταν κάνεις post, το σύστημα ελέγχει αυτόματα το περιεχόμενο
2. Αν βρεθεί ακατάλληλο περιεχόμενο, θα εμφανιστεί error message
3. Πρέπει να αφαιρέσεις το ακατάλληλο περιεχόμενο πριν submit

### For Admins:
1. Πήγαινε στο Admin Panel
2. Βλέπεις όλα τα posts με status badges
3. Posts με "Flagged" badge έχουν εντοπιστεί από το σύστημα
4. Μπορείς να:
   - ✅ Approve (green checkmark)
   - ❌ Reject (red X) - με optional reason
   - 🗑️ Delete (trash icon)

## Testing

Για να δοκιμάσεις το moderation:

1. **Test Inappropriate Text:**
   - Προσπάθησε να κάνεις post με ακατάλληλη λέξη
   - Θα εμφανιστεί error

2. **Test Spam:**
   - Γράψε το ίδιο word πολλές φορές
   - Θα εμφανιστεί error

3. **Test Admin Panel:**
   - Login ως admin
   - Πήγαινε στο Admin Panel
   - Βλέπεις flagged posts

## Future Enhancements

- [ ] AI-based image content detection
- [ ] User reporting system
- [ ] Automatic ban system (after X violations)
- [ ] Whitelist/blacklist users
- [ ] Custom moderation rules per category

