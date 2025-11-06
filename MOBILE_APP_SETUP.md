# Mobile App Setup για App Store & Play Store

Αυτός ο οδηγός θα σε βοηθήσει να μετατρέψεις το Locom web app σε native mobile apps για iOS και Android.

## Προαπαιτούμενα

1. **Xcode** (για iOS) - macOS μόνο
2. **Android Studio** (για Android)
3. **Node.js** 18+
4. **Apple Developer Account** ($99/χρόνο για App Store)
5. **Google Play Developer Account** ($25 μιας φοράς για Play Store)

## Βήμα 1: Εγκατάσταση Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar
```

## Βήμα 2: Αρχικοποίηση Capacitor

```bash
npx cap init
```

Θα σε ρωτήσει:
- **App name**: Locom
- **App ID**: com.locom.app (ή ό,τι θέλεις)
- **Web dir**: out (για static export)

## Βήμα 3: Ρύθμιση Next.js για Static Export

Το Next.js app χρειάζεται να γίνει static export για να λειτουργήσει σε native app.

### Ενημέρωση `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
  // ... rest of config
}
```

**Σημαντικό**: Με static export, τα server-side features (API routes, server components) δεν θα λειτουργούν. Χρειάζεται να:
- Μετατρέψεις όλα τα server components σε client components
- Χρησιμοποιήσεις Supabase client-side μόνο
- Τα API routes να τα μεταφέρεις σε external backend ή Supabase Functions

## Βήμα 4: Build για Mobile

```bash
# Build static site
npm run build

# Sync με Capacitor
npx cap sync
```

## Βήμα 5: Προσθήκη Platforms

```bash
# iOS
npx cap add ios

# Android
npx cap add android
```

## Βήμα 6: Ρύθμιση iOS

```bash
# Άνοιξε στο Xcode
npx cap open ios
```

Στο Xcode:
1. Επίλεξε το project → **Signing & Capabilities**
2. Επίλεξε το **Team** σου (Apple Developer account)
3. Άλλαξε **Bundle Identifier** αν χρειάζεται
4. **Product → Scheme → Edit Scheme** → **Run** → **Build Configuration** → **Release**

### Ρύθμιση Info.plist

Πρόσθεσε στο `ios/App/App/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Locom needs your location to show nearby posts and events</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Locom needs your location to show nearby posts and events</string>
<key>NSCameraUsageDescription</key>
<string>Locom needs camera access to upload photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Locom needs photo library access to upload photos</string>
```

## Βήμα 7: Ρύθμιση Android

```bash
# Άνοιξε στο Android Studio
npx cap open android
```

Στο Android Studio:
1. **File → Project Structure** → **Modules** → **app**
2. **Signing Configs** → Δημιούργησε signing config για release
3. **Build Variants** → Επίλεξε **release**

### Ρύθμιση AndroidManifest.xml

Στο `android/app/src/main/AndroidManifest.xml`, πρόσθεσε permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Βήμα 8: Update Capacitor Config

Ενημέρωσε το `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.locom.app',
  appName: 'Locom',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#16a34a',
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#16a34a',
    },
  },
};

export default config;
```

## Βήμα 9: Build για Production

### iOS:
```bash
# Στο Xcode
Product → Archive → Distribute App → App Store Connect
```

### Android:
```bash
# Στο Android Studio
Build → Generate Signed Bundle / APK → Android App Bundle
```

## Βήμα 10: Upload στο App Store / Play Store

### App Store:
1. Πήγαινε στο [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps → +** → Δημιούργησε νέο app
3. Upload το archive από Xcode
4. Συμπλήρωσε metadata, screenshots, κλπ
5. Submit για review

### Play Store:
1. Πήγαινε στο [Google Play Console](https://play.google.com/console)
2. **Create app**
3. Upload το AAB file
4. Συμπλήρωσε store listing
5. Submit για review

## Προβλήματα & Λύσεις

### Server Components δεν λειτουργούν
**Λύση**: Μετατρέψτε όλα σε client components (`'use client'`)

### API Routes δεν λειτουργούν
**Λύση**: 
- Χρησιμοποίησε Supabase Functions
- Ή external API server
- Ή Supabase client-side μόνο

### Images δεν φορτώνουν
**Λύση**: Χρησιμοποίησε `unoptimized: true` στο next.config.js

### CORS Issues
**Λύση**: Ρύθμισε CORS στο Supabase dashboard

## Native Features που μπορείς να προσθέσεις

Με Capacitor plugins μπορείς να προσθέσεις:
- Push notifications
- Camera access
- Geolocation
- File system
- Share functionality
- And more...

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)


