# 📱 Google Play Store Submission Guide

Αυτός ο οδηγός θα σε βοηθήσει να ανεβάσεις το Locom app στο Google Play Store.

## 📋 Προαπαιτούμενα

1. **Google Play Developer Account** ($25 μιας φοράς)
   - Δημιούργησε account στο [Google Play Console](https://play.google.com/console)
   - Πλήρωσε το $25 registration fee

2. **Android Studio** (για build)
   - Download από [developer.android.com/studio](https://developer.android.com/studio)

3. **Java JDK** (για build)
   - Android Studio περιλαμβάνει JDK

## 🔧 Βήμα 1: Ρύθμιση Android Project

### 1.1 Ενημέρωση Version & Package Name

Επεξεργάσου το `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.locom.app"  // Μην το αλλάξεις αν ήδη έχεις account
    versionCode 1                  // Αύξανε αυτό για κάθε release
    versionName "1.0"              // User-visible version
    minSdkVersion 22               // Android 5.1+
    targetSdkVersion 34            // Latest Android
}
```

**Σημαντικό:**
- `versionCode`: Αύξανε για κάθε release (1, 2, 3, ...)
- `versionName`: User-visible version ("1.0", "1.1", "2.0", ...)
- `applicationId`: Μοναδικό package name (δεν μπορείς να το αλλάξεις μετά)

### 1.2 App Icons & Splash Screen

**App Icon:**
- Μέγεθος: 512x512px (Google Play)
- Formats: PNG (transparent background)
- Location: `android/app/src/main/res/mipmap-*/ic_launcher.png`

**Splash Screen:**
- Ρυθμισμένο στο `capacitor.config.ts`
- Background color: `#16a34a` (green)

**Για να αλλάξεις icons:**
1. Δημιούργησε icons σε όλα τα sizes:
   - `mipmap-mdpi`: 48x48px
   - `mipmap-hdpi`: 72x72px
   - `mipmap-xhdpi`: 96x96px
   - `mipmap-xxhdpi`: 144x144px
   - `mipmap-xxxhdpi`: 192x192px

2. Χρησιμοποίησε [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

### 1.3 App Name & Description

Επεξεργάσου `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">Locom</string>
    <string name="title_activity_main">Locom</string>
</resources>
```

## 🏗️ Βήμα 2: Build για Production

### 2.1 Build Next.js App

```bash
npm run build:mobile
```

Αυτό θα:
- Μετακινήσει API routes προσωρινά
- Build το Next.js app ως static export
- Sync με Capacitor

### 2.2 Build Android App Bundle (AAB)

**Μέσω Android Studio:**
1. Άνοιξε το `android` folder στο Android Studio
2. Build → Generate Signed Bundle / APK
3. Επίλεξε "Android App Bundle"
4. Create new keystore (για πρώτη φορά):
   - Keystore path: `android/app/locom-release-key.jks`
   - Password: (ασφαλές password)
   - Key alias: `locom`
   - Key password: (ίδιο με keystore password)
   - Validity: 25 years
   - Certificate info: Συμπλήρωσε τα στοιχεία σου
5. Build variant: `release`
6. Finish

**Μέσω Command Line:**
```bash
cd android
./gradlew bundleRelease
```

Το AAB file θα είναι στο: `android/app/build/outputs/bundle/release/app-release.aab`

### 2.3 Create Signing Key (First Time)

Αν δεν έχεις signing key:

```bash
cd android/app
keytool -genkey -v -keystore locom-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias locom
```

**ΣΗΜΑΝΤΙΚΟ:** Αποθήκευσε το keystore file και το password σε ασφαλές μέρος! Χωρίς αυτά δεν μπορείς να κάνεις updates.

## 📤 Βήμα 3: Google Play Console Setup

### 3.1 Create New App

1. Πήγαινε στο [Google Play Console](https://play.google.com/console)
2. Create app
3. Συμπλήρωσε:
   - **App name**: Locom
   - **Default language**: English (ή Greek)
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Συμφωνήστε με τους όρους

### 3.2 App Content

**Store Listing:**
- **App name**: Locom
- **Short description**: "Connect with your neighborhood in Cyprus"
- **Full description**: 
  ```
  Locom is a local community platform connecting people in Cyprus. 
  Share local news, post small ads, organize events, and find trusted neighbors.
  
  Features:
  - Neighborhood feed with location-based posts
  - Mini marketplace for buying and selling
  - Event board for local gatherings
  - User profiles and community features
  - Content moderation and safety features
  ```
- **App icon**: 512x512px PNG
- **Feature graphic**: 1024x500px (optional)
- **Screenshots**: 
  - Phone: 2-8 screenshots (min 320px, max 3840px height)
  - Tablet: (optional)
- **Categories**: Social
- **Contact details**: Email, website

**Privacy Policy:**
- Χρειάζεσαι Privacy Policy URL
- Μπορείς να χρησιμοποιήσεις [Privacy Policy Generator](https://www.privacypolicygenerator.info/)

### 3.3 App Access

**Content Rating:**
- Συμπλήρωσε το questionnaire
- Locom είναι πιθανότατα "Everyone" ή "Teen"

**Target Audience:**
- Age groups
- Content guidelines

**Data Safety:**
- Συμπλήρωσε τι data συλλέγεις:
  - Location data (για geolocation features)
  - Personal info (email, name)
  - Authentication data

### 3.4 Upload Release

1. **Production** → Create new release
2. Upload `app-release.aab` file
3. **Release name**: "1.0 (1)" (versionName (versionCode))
4. **Release notes**:
   ```
   Initial release of Locom
   - Neighborhood feed
   - Marketplace
   - Events
   - User profiles
   ```
5. Save → Review → Start rollout to Production

### 3.5 Review Process

- Google θα review το app (1-7 μέρες)
- Μπορεί να ζητήσουν clarifications
- Αν approve, το app θα είναι live στο Play Store

## 🔄 Βήμα 4: Updates (Future Releases)

### 4.1 Update Version

Στο `android/app/build.gradle`:
```gradle
versionCode 2        // Αύξανε
versionName "1.1"     // User version
```

### 4.2 Build & Upload

1. `npm run build:mobile`
2. Build new AAB
3. Upload στο Google Play Console
4. Release notes

## ✅ Pre-Launch Checklist

- [ ] Google Play Developer account ($25 paid)
- [ ] App icons (512x512px for Play Store)
- [ ] Screenshots (minimum 2)
- [ ] Privacy Policy URL
- [ ] App description (short & full)
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] Signed AAB built
- [ ] Tested on physical device
- [ ] All features working
- [ ] No crashes or critical bugs

## 🐛 Troubleshooting

### Build Errors

**"SDK location not found":**
- Android Studio → Preferences → Appearance & Behavior → System Settings → Android SDK
- Copy SDK path
- Create `android/local.properties`:
  ```
  sdk.dir=/path/to/android/sdk
  ```

**"Gradle sync failed":**
- File → Invalidate Caches / Restart
- Clean project: Build → Clean Project

### Upload Errors

**"AAB validation failed":**
- Βεβαιώσου ότι το AAB είναι signed
- Check version code (πρέπει να είναι > previous)

**"App not eligible":**
- Check content rating
- Complete all required forms
- Privacy policy must be accessible

## 📚 Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

## 🎯 Next Steps After Launch

1. Monitor crash reports
2. Respond to user reviews
3. Track analytics
4. Plan feature updates
5. Consider iOS App Store (αν θέλεις)

---

**Good luck with your launch! 🚀**




