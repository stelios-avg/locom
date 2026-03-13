# 📱 Android Studio Setup για Google Play

## Εγκατάσταση Android Studio

### Βήμα 1: Download Android Studio

1. Πήγαινε στο [developer.android.com/studio](https://developer.android.com/studio)
2. Download για macOS
3. Install το `.dmg` file

### Βήμα 2: Setup Android Studio

1. Άνοιξε το Android Studio
2. **Welcome Screen** → "More Actions" → "SDK Manager"
3. Εγκατάστησε:
   - **Android SDK Platform** (latest, API 34)
   - **Android SDK Build-Tools**
   - **Android SDK Command-line Tools**
   - **Android Emulator** (optional, για testing)

### Βήμα 3: Configure Environment (Optional)

Αν θέλεις να χρησιμοποιήσεις `npx cap open android`:

```bash
# Βρες το path του Android Studio
# Συνήθως είναι: /Applications/Android Studio.app

# Set environment variable
export CAPACITOR_ANDROID_STUDIO_PATH="/Applications/Android Studio.app"
```

## Άνοιγμα Project Χειροκίνητα

Αν δεν θέλεις να εγκαταστήσεις Android Studio τώρα, μπορείς:

### Εναλλακτική: Build μέσω Command Line

```bash
cd android
./gradlew bundleRelease
```

**Αλλά:** Χρειάζεσαι Android SDK για να τρέξει το Gradle.

## Άνοιγμα Project στο Android Studio

### Μέθοδος 1: Από Android Studio

1. Άνοιξε Android Studio
2. "Open" → Επίλεξε το `android` folder
3. Περίμενε Gradle sync

### Μέθοδος 2: Από Terminal (μετά την εγκατάσταση)

```bash
npx cap open android
```

## Build για Google Play

### Μέσω Android Studio:

1. **File** → **Open** → Επίλεξε `android` folder
2. Περίμενε Gradle sync (μπορεί να πάρει λίγο)
3. **Build** → **Generate Signed Bundle / APK**
4. Επίλεξε **"Android App Bundle"**
5. **Create new keystore** (για πρώτη φορά):
   - Path: `android/app/locom-release-key.jks`
   - Password: (ασφαλές password - ΑΠΟΘΗΚΕΥΣΕ ΤΟ!)
   - Key alias: `locom`
   - Validity: 25 years
6. **Build variant**: `release`
7. **Finish**

Το AAB file θα είναι στο:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Μέσω Command Line:

```bash
cd android
./gradlew bundleRelease
```

**Σημείωση:** Χρειάζεσαι signing config στο `build.gradle` για command line build.

## Troubleshooting

### "SDK location not found"

Δημιούργησε `android/local.properties`:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### "Gradle sync failed"

1. **File** → **Invalidate Caches / Restart**
2. **Build** → **Clean Project**
3. **Build** → **Rebuild Project**

### "Command line tools not found"

Android Studio → SDK Manager → SDK Tools → Ενεργοποίησε "Android SDK Command-line Tools"

---

**Next Steps:**
- Εγκατάστησε Android Studio
- Άνοιξε το `android` folder
- Build signed AAB
- Upload στο Google Play Console




