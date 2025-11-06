/**
 * Content Moderation Utilities
 * Checks text and images for inappropriate content
 */

// Greek and English inappropriate keywords
const INAPPROPRIATE_KEYWORDS = [
  // Greek inappropriate words (common ones)
  'μαλακ', 'γαμ', 'σκατ', 'πουτ', 'αρχιδ', 'μαμ', 'μπασταρδ',
  // English inappropriate words
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap',
  // Spam patterns
  'buy now', 'click here', 'limited offer', 'act now', 'guaranteed',
  'αγόρασε τώρα', 'κάνε κλικ', 'περιορισμένη προσφορά',
  // URLs (can be spam)
  'http://', 'https://', 'www.',
]

/**
 * Check if text contains inappropriate content
 */
export function checkTextContent(text: string): {
  isAppropriate: boolean
  reason?: string
  flaggedWords?: string[]
} {
  const lowerText = text.toLowerCase()
  const flaggedWords: string[] = []

  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      flaggedWords.push(keyword)
    }
  }

  // Check for excessive caps (shouting/spam)
  const capsRatio = (text.match(/[A-ZΑ-Ω]/g) || []).length / text.length
  if (capsRatio > 0.5 && text.length > 10) {
    return {
      isAppropriate: false,
      reason: 'Excessive use of capital letters',
      flaggedWords: ['EXCESSIVE_CAPS'],
    }
  }

  // Check for excessive repetition (spam)
  const words = text.split(/\s+/)
  const wordCounts = new Map<string, number>()
  words.forEach((word) => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
  })
  for (const [word, count] of wordCounts.entries()) {
    if (count > 5 && word.length > 3) {
      return {
        isAppropriate: false,
        reason: 'Excessive word repetition (possible spam)',
        flaggedWords: [word],
      }
    }
  }

  if (flaggedWords.length > 0) {
    return {
      isAppropriate: false,
      reason: 'Contains inappropriate language',
      flaggedWords,
    }
  }

  return { isAppropriate: true }
}

/**
 * Check if image file is appropriate
 * Basic checks: file size, file type, file name
 */
export function checkImageContent(file: File): {
  isAppropriate: boolean
  reason?: string
} {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isAppropriate: false,
      reason: 'Image file is too large (max 10MB)',
    }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isAppropriate: false,
      reason: 'Invalid image file type',
    }
  }

  // Check file name for inappropriate words
  const fileNameCheck = checkTextContent(file.name)
  if (!fileNameCheck.isAppropriate) {
    return {
      isAppropriate: false,
      reason: 'Inappropriate file name',
    }
  }

  return { isAppropriate: true }
}

/**
 * Validate post content before submission
 */
export function validatePostContent(content: string, image?: File | null): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check text content
  const textCheck = checkTextContent(content)
  if (!textCheck.isAppropriate) {
    errors.push(textCheck.reason || 'Inappropriate content detected')
  }

  // Check image if present
  if (image) {
    const imageCheck = checkImageContent(image)
    if (!imageCheck.isAppropriate) {
      errors.push(imageCheck.reason || 'Invalid image')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

