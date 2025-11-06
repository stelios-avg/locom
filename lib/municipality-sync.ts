/**
 * Municipality Sync Service
 * 
 * This service fetches posts from municipality feeds (RSS, JSON, HTML, etc.)
 * and creates posts automatically in the app.
 */

interface MunicipalityPost {
  title: string
  content: string
  imageUrl?: string
  publishedDate?: Date
  link?: string
}

/**
 * Parse HTML page from Nicosia Municipality website
 * Fetches announcements from: https://www.nicosia.org.cy/el-GR/news/announcements/2025/
 */
export async function parseNicosiaHTML(baseUrl: string = 'https://www.nicosia.org.cy/el-GR/news/announcements/2025/'): Promise<MunicipalityPost[]> {
  try {
    const response = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Locom/1.0)',
      },
    })
    const htmlText = await response.text()
    
    const posts: MunicipalityPost[] = []
    
    // Split by date pattern - each announcement starts with a date like "05 Νοε. 2025 (13:40)"
    const datePattern = /(\d{1,2}\s+\w+\.?\s+\d{4}\s+\(\d{2}:\d{2}\))/
    const sections = htmlText.split(datePattern)
    
    // Process each announcement section
    for (let i = 1; i < sections.length; i += 2) {
      if (i + 1 >= sections.length) break
      
      const dateStr = sections[i].trim()
      const contentBlock = sections[i + 1]
      
      // Extract title - look for h4, h5, h6 tags
      const titleMatch = contentBlock.match(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/i)
      let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      
      // If no h tag, try strong tag
      if (!title) {
        const strongMatch = contentBlock.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i)
        title = strongMatch ? strongMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      }
      
      // Extract content - everything before "Περισσότερα"
      const contentMatch = contentBlock.match(/([\s\S]*?)Περισσότερα/i)
      let contentText = contentMatch ? contentMatch[1] : contentBlock
      
      // Clean HTML tags from content
      contentText = contentText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      
      // Extract link - look for href in the "Περισσότερα" section or nearby
      const linkSection = contentBlock.match(/<a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?Περισσότερα/i)
      let link = linkSection ? linkSection[1] : undefined
      
      // If no link found, try to find any href in the content block
      if (!link) {
        const anyLinkMatch = contentBlock.match(/href=["']([^"']+)["']/i)
        link = anyLinkMatch ? anyLinkMatch[1] : undefined
      }
      
      // Make link absolute if relative
      if (link && !link.startsWith('http')) {
        link = link.startsWith('/') 
          ? `https://www.nicosia.org.cy${link}`
          : `https://www.nicosia.org.cy/${link}`
      }
      
      // Parse date
      const dateMatch = dateStr.match(/(\d{1,2})\s+(\w+\.?)\s+(\d{4})\s+\((\d{2}):(\d{2})\)/)
      let publishedDate: Date | undefined
      
      if (dateMatch) {
        const day = parseInt(dateMatch[1])
        const monthStr = dateMatch[2].toLowerCase().replace('.', '')
        const year = parseInt(dateMatch[3])
        const hour = parseInt(dateMatch[4])
        const minute = parseInt(dateMatch[5])
        
        // Map Greek month abbreviations to numbers
        const monthMap: { [key: string]: number } = {
          'ιαν': 0, 'φεβ': 1, 'μαρ': 2, 'απρ': 3, 'μαϊ': 4, 'μαι': 4,
          'ιουν': 5, 'ιουλ': 6, 'αυγ': 7, 'σεπ': 8, 'οκτ': 9, 'νοε': 10, 'δεκ': 11,
          'ιανου': 0, 'φεβρου': 1, 'μαρτιου': 2, 'απριλιου': 3, 'μαιου': 4, 'ιουνιου': 5,
          'ιουλιου': 6, 'αυγουστου': 7, 'σεπτεμβριου': 8, 'οκτωβριου': 9, 'νοεμβριου': 10, 'δεκεμβριου': 11,
        }
        
        const month = monthMap[monthStr] ?? (monthStr.length > 3 ? monthMap[monthStr.substring(0, 3)] : undefined) ?? 10
        
        publishedDate = new Date(year, month, day, hour, minute)
      }
      
      // Only add if we have title and content
      if (title && contentText) {
        posts.push({
          title,
          content: contentText.substring(0, 800), // Limit content length
          publishedDate,
          link,
        })
      }
    }
    
    return posts.slice(0, 20) // Limit to 20 most recent posts
  } catch (error) {
    console.error('Error parsing Nicosia HTML:', error)
    throw error
  }
}

/**
 * Parse RSS feed and extract posts
 * Uses regex-based parsing (works in Node.js server environment)
 */
export async function parseRSSFeed(feedUrl: string): Promise<MunicipalityPost[]> {
  try {
    const response = await fetch(feedUrl)
    const xmlText = await response.text()
    
    const posts: MunicipalityPost[] = []
    
    // Simple regex-based RSS parser (works in Node.js)
    // Match <item>...</item> blocks
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
    const items = Array.from(xmlText.matchAll(itemRegex))
    
    for (const itemMatch of items) {
      const itemContent = itemMatch[1]
      
      // Extract title
      const titleMatch = itemContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      
      // Extract description/content
      const descMatch = itemContent.match(/<description[^>]*>([\s\S]*?)<\/description>/i)
      const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      
      // Extract link
      const linkMatch = itemContent.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
      const link = linkMatch ? linkMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      
      // Extract pubDate
      const pubDateMatch = itemContent.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1].trim()) : undefined
      
      // Extract image from enclosure
      const enclosureMatch = itemContent.match(/<enclosure[^>]*url=["']([^"']+)["']/i)
      const imageUrl = enclosureMatch ? enclosureMatch[1] : undefined
      
      // Also check for media:content or image tags
      if (!imageUrl) {
        const mediaMatch = itemContent.match(/<media:content[^>]*url=["']([^"']+)["']/i)
        if (mediaMatch) {
          const mediaUrl = mediaMatch[1]
          if (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
            posts.push({
              title,
              content: description,
              imageUrl: mediaUrl,
              publishedDate: pubDate,
              link,
            })
            continue
          }
        }
      }
      
      posts.push({
        title,
        content: description,
        imageUrl,
        publishedDate: pubDate,
        link,
      })
    }
    
    return posts
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
    throw error
  }
}

/**
 * Parse JSON feed
 */
export async function parseJSONFeed(feedUrl: string): Promise<MunicipalityPost[]> {
  try {
    const response = await fetch(feedUrl)
    const data = await response.json()
    
    // Adjust based on your JSON structure
    // Example structure: { items: [{ title, content, image, date, url }] }
    const items = data.items || data.posts || []
    
    return items.map((item: any) => ({
      title: item.title || '',
      content: item.content || item.description || '',
      imageUrl: item.image || item.imageUrl,
      publishedDate: item.date ? new Date(item.date) : undefined,
      link: item.url || item.link,
    }))
  } catch (error) {
    console.error('Error parsing JSON feed:', error)
    throw error
  }
}

/**
 * Create a municipality post in the database
 */
export async function createMunicipalityPost(
  supabase: any,
  municipalityUserId: string,
  post: MunicipalityPost,
  location?: { lat: number; lng: number; name: string }
) {
  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: municipalityUserId,
      content: `${post.title}\n\n${post.content}`,
      image_url: post.imageUrl || null,
      post_type: 'feed',
      category: 'municipality',
      latitude: location?.lat || null,
      longitude: location?.lng || null,
      location_name: location?.name || 'Municipality',
      created_at: post.publishedDate?.toISOString() || new Date().toISOString(),
    })

  if (error) {
    console.error('Error creating municipality post:', error)
    throw error
  }
}

/**
 * Check if a post already exists (by content hash or link)
 */
export async function postExists(
  supabase: any,
  content: string,
  link?: string
): Promise<boolean> {
  // Check by content similarity or link
  if (link) {
    // Try to find by matching content (simplified check)
    const contentPreview = content.substring(0, 100) // First 100 chars
    const { data } = await supabase
      .from('posts')
      .select('id')
      .ilike('content', `%${contentPreview}%`)
      .eq('category', 'municipality')
      .limit(1)
    
    return (data && data.length > 0) || false
  }
  
  // Also check by content preview
  const contentPreview = content.substring(0, 100)
  const { data } = await supabase
    .from('posts')
    .select('id')
    .ilike('content', `%${contentPreview}%`)
    .eq('category', 'municipality')
    .limit(1)
  
  return (data && data.length > 0) || false
}
