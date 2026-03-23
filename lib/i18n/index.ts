/**
 * Simple i18n system for Locom
 * Supports English and Greek
 */

export type Locale = 'en' | 'el'

export interface Translations {
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    delete: string
    edit: string
    close: string
    submit: string
    back: string
    next: string
    previous: string
  }
  auth: {
    login: string
    signup: string
    logout: string
    email: string
    password: string
    name: string
    signingIn: string
    creatingAccount: string
    dontHaveAccount: string
    alreadyHaveAccount: string
    signUp: string
    signIn: string
    orContinueWith: string
    checkEmail: string
    accountCreated: string
    emailConfirmed: string
    loginWithGoogle: string
    loginWithFacebook: string
  }
  nav: {
    feed: string
    marketplace: string
    events: string
    profile: string
    admin: string
    rules: string
    billing: string
  }
  feed: {
    title: string
    subtitle: string
    newPost: string
    noPosts: string
    createFirstPost: string
    loadingPosts: string
    showPostsWithin: string
    km: string
  }
  post: {
    create: string
    createListing: string
    createEvent: string
    content: string
    whatsOnMind: string
    posting: string
    post: string
    comments: string
    addComment: string
    postComment: string
    noComments: string
    deletePost: string
    notFound: string
    contentModeration: string
  }
  marketplace: {
    title: string
    subtitle: string
    newListing: string
    price: string
    category: string
    selectCategory: string
    all: string
    furniture: string
    electronics: string
    clothing: string
    books: string
    services: string
    other: string
    noListings: string
    loadingListings: string
  }
  events: {
    title: string
    subtitle: string
    createEvent: string
    eventDate: string
    eventLocation: string
    venueName: string
    all: string
    upcoming: string
    past: string
    noEvents: string
    loadingEvents: string
  }
  profile: {
    editProfile: string
    bio: string
    neighborhood: string
    avatar: string
    uploadImage: string
    removeImage: string
    saveChanges: string
    posts: string
    noPosts: string
    notFound: string
  }
  location: {
    useCurrentLocation: string
    currentLocation: string
    locationRequired: string
    gettingLocation: string
  }
  admin: {
    title: string
    allPosts: string
    noPosts: string
    loadingPosts: string
    reports: string
    noReports: string
    loadingReports: string
    reportedBy: string
    reportedUser: string
    contentType: string
    reason: string
    description: string
    status: string
    pending: string
    reviewed: string
    resolved: string
    dismissed: string
    actions: string
    hideContent: string
    deleteContent: string
    warnUser: string
    banUser: string
    dismissReport: string
    warnings: string
    noWarnings: string
  }
  report: {
    report: string
    reportContent: string
    selectReason: string
    spam: string
    inappropriate: string
    harassment: string
    fake: string
    scam: string
    copyright: string
    other: string
    additionalDetails: string
    submitReport: string
    reportSubmitted: string
    alreadyReported: string
  }
  rules: {
    title: string
    communityRules: string
    marketplaceRules: string
    termsOfService: string
    allowed: string
    notAllowed: string
    communityAllowed: string[]
    communityNotAllowed: string[]
    marketplaceAllowed: string[]
    marketplaceNotAllowed: string[]
  }
  block: {
    blockUser: string
    unblockUser: string
    muteUser: string
    hideFromUser: string
    userBlocked: string
    userUnblocked: string
    confirmBlock: string
    confirmUnblock: string
  }
  billing: {
    title: string
    loadError: string
    planPro: string
    planFree: string
    onPro: string
    statusLabel: string
    nextBilling: string
    manageInfo: string
    upgradeHeadline: string
    upgradeDescription: string
    upgradeButton: string
    checkoutError: string
    benefits: string[]
    successTitle: string
    successMessage: string
    backToBilling: string
    cancelTitle: string
    cancelMessage: string
    cancelButton: string
  }
}

let currentLocale: Locale = 'el' // Default to Greek
let translations: Translations | null = null

export function setLocale(locale: Locale) {
  currentLocale = locale
  translations = null // Clear cache to reload
  if (typeof window !== 'undefined') {
    localStorage.setItem('locom-locale', locale)
  }
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('locom-locale') as Locale
    if (saved && (saved === 'en' || saved === 'el')) {
      return saved
    }
  }
  return currentLocale
}

export async function loadTranslations(locale: Locale = getLocale()): Promise<Translations> {
  if (translations && currentLocale === locale) {
    return translations
  }

  try {
    const translationModule = await import(`@/locales/${locale}.json`)
    translations = translationModule.default as Translations
    currentLocale = locale
    return translations
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
    // Fallback to English
    if (locale !== 'en') {
      const fallbackModule = await import(`@/locales/en.json`)
      translations = fallbackModule.default as Translations
      currentLocale = 'en'
      return translations
    }
    throw error
  }
}

// Hook is exported from hooks.ts for client components

// Returns the currently loaded locale (defaults to 'el')
export function getCurrentLocale(): Locale {
  return currentLocale
}

// For server/client components that need translations
export async function getTranslations(locale: Locale = 'el'): Promise<Translations> {
  return loadTranslations(locale)
}

