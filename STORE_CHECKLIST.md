# Locom — Checklist Play Store + App Store

Χρησιμοποίησέ το ως ροή εργασίας (κοινά βήματα → Android → iOS).

---

## Φάση Α — Κοινά (και τα δύο stores)

### 1. Production deploy (web)
- [ ] Deploy το Next app (π.χ. Vercel) με **production** URL, π.χ. `https://locom.yourdomain.com`
- [ ] Όλα τα `NEXT_PUBLIC_*` (Supabase URL, anon key, κ.λπ.) σωστά στο hosting
- [ ] Δοκιμή login, feed, payments (αν ισχύει) στο production URL από browser

### 2. Supabase (production)
- [ ] **Site URL** = production URL
- [ ] **Redirect URLs**: production + `https://YOUR_DOMAIN/api/auth/callback` + paths για reset password
- [ ] RLS / migrations έχουν τρέξει στο **production** project (όχι μόνο local)
- [ ] Google OAuth: Authorized redirect URIs στο Google Cloud για Supabase callback

### 3. Stripe (αν έχεις συνδρομές)
- [ ] Live keys + webhook endpoint στο production
- [ ] Έλεγχος checkout / portal σε production

### 4. Mobile build (Capacitor)
- [ ] Στο production build: **χωρίς** `server.url` στο `capacitor.config.ts` (bundled `out/`)
- [ ] `npm run build:mobile` με env που δείχνουν στο **production** API/Supabase
- [ ] `npx cap sync`

### 5. Νομικά & store policy
- [ ] **Privacy Policy** URL (δημόσιο)
- [ ] **Terms of Service** (ή Rules) URL αν το ζητάει το store
- [ ] Αν χρησιμοποιείς τοποθεσία/κάμερα/ειδοποιήσεις: περιγραφή στη privacy (Data safety / App Privacy)

### 6. Branding
- [ ] Όνομα εφαρμογής, short description, full description (EN + EL αν θες)
- [ ] Εικονίδιο (όλες οι πυκνότητες) — δες `LOGO_GUIDE.md`
- [ ] Screenshots (phone + tablet αν απαιτείται)

---

## Φάση Β — Google Play (Android)

### 7. Λογαριασμός & έργο
- [ ] Google Play Console (one-time fee / developer account)
- [ ] Δημιουργία app, package name **ίδιο** με `appId` στο `capacitor.config.ts` (π.χ. `com.locom.app`)

### 8. Build & υπογραφή
- [ ] Android Studio: `npx cap open android`
- [ ] Release keystore (κράτα **ασφαλές** backup του keystore + passwords)
- [ ] **AAB** (Android App Bundle) για upload στο Play
- [ ] Target / compile **API level** σύμφωνα με απαιτήσεις Google (ενημερώνονται κάθε χρόνο)

### 9. Play Console forms
- [ ] **Data safety** (δεδομένα, κρυπτογράφηση, κ.λπ.)
- [ ] Content rating questionnaire
- [ ] Δοκιμές: internal / closed track πριν το production

---

## Φάση Γ — App Store (iOS)

### 10. Apple Developer & Xcode
- [ ] Apple Developer Program (**ετήσια** συνδρομή)
- [ ] `npx cap open ios` — Bundle ID **ίδιο** με App Store Connect (π.χ. `com.locom.app`)
- [ ] Signing: Development + **Distribution** certificates, provisioning profiles
- [ ] Archive στο Xcode → **App Store Connect** upload (ή Transporter)

### 11. App Store Connect
- [ ] Νέα εφαρμογή, metadata, screenshots, privacy nutrition labels
- [ ] **App Privacy** (τι δεδομένα συλλέγονται)
- [ ] Review notes (λογαριασμός δοκιμής αν ζητηθεί)
- [ ] TestFlight (προαιρετικά) πριν το release

---

## Σύντομη σειρά εκτέλεσης

1. Production web + Supabase + Stripe  
2. `build:mobile` + `cap sync`  
3. **Android**: keystore → AAB → Play (internal track)  
4. **iOS**: Xcode archive → TestFlight → App Store  

---

## Αρχεία στο repo

| Αρχείο | Περιεχόμενο |
|--------|-------------|
| `GOOGLE_PLAY_GUIDE.md` | Λεπτομέρειες Play |
| `ANDROID_STUDIO_SETUP.md` | Android Studio / Capacitor |
| `LOGO_GUIDE.md` | Εικονίδια / assets |
| `capacitor.config.ts` | `appId`, `webDir: 'out'` |

---

*Τελευταία ενημέρωση: checklist για κοινή βάση Next + Capacitor — τα ακριβή API levels και τα store forms αλλάζουν· έλεγξε πάντα τις επίσημες οδηγίες Google & Apple.*
