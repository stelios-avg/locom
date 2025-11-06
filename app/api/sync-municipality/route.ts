import { NextResponse } from 'next/server'
import { parseRSSFeed, parseJSONFeed, parseNicosiaHTML, createMunicipalityPost, postExists } from '@/lib/municipality-sync'

// This endpoint can be called periodically (via cron) to sync municipality posts
// Example: https://cron-job.org or Vercel Cron Jobs
// 
// Setup:
// 1. Set MUNICIPALITY_FEED_URL in .env.local (RSS or JSON feed URL)
// 2. Set MUNICIPALITY_SYNC_SECRET in .env.local (for security)
// 3. Set MUNICIPALITY_USER_ID in .env.local (UUID of the municipality user account)
// 4. Set SUPABASE_SERVICE_ROLE_KEY in .env.local
// 5. Schedule cron job to call: POST /api/sync-municipality with Authorization header

export async function POST(request: Request) {
  try {
    // Verify the request has a secret key (for security)
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.MUNICIPALITY_SYNC_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const municipalityUserId = process.env.MUNICIPALITY_USER_ID
    const municipalityFeedUrl = process.env.MUNICIPALITY_FEED_URL
    const municipalityLocation = process.env.MUNICIPALITY_LOCATION // Format: "lat,lng,name" e.g., "35.1856,33.3823,Nicosia"
    
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    if (!municipalityUserId) {
      return NextResponse.json({ error: 'Municipality user ID not configured' }, { status: 500 })
    }

    if (!municipalityFeedUrl) {
      return NextResponse.json({ error: 'Municipality feed URL not configured' }, { status: 500 })
    }

    // Create Supabase client with service role (bypasses RLS)
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // Parse location if provided
    let location: { lat: number; lng: number; name: string } | undefined
    if (municipalityLocation) {
      const [lat, lng, name] = municipalityLocation.split(',')
      location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: name || 'Municipality'
      }
    }

    // Determine feed type and parse
    let posts
    if (municipalityFeedUrl.includes('nicosia.org.cy')) {
      // Special handling for Nicosia Municipality HTML site
      posts = await parseNicosiaHTML(municipalityFeedUrl)
    } else if (municipalityFeedUrl.includes('.json') || municipalityFeedUrl.includes('api')) {
      posts = await parseJSONFeed(municipalityFeedUrl)
    } else if (municipalityFeedUrl.includes('.xml') || municipalityFeedUrl.includes('rss')) {
      posts = await parseRSSFeed(municipalityFeedUrl)
    } else {
      // Default to RSS
      posts = await parseRSSFeed(municipalityFeedUrl)
    }

    // Create posts in database
    let postsAdded = 0
    let postsSkipped = 0

    for (const post of posts) {
      // Check if post already exists (simple check by content)
      const exists = await postExists(supabaseAdmin, post.content, post.link)
      
      if (exists) {
        postsSkipped++
        continue
      }

      try {
        await createMunicipalityPost(
          supabaseAdmin,
          municipalityUserId,
          post,
          location
        )
        postsAdded++
      } catch (error) {
        console.error('Error creating post:', error)
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Municipality sync completed',
      postsAdded,
      postsSkipped,
      totalPosts: posts.length
    })

  } catch (error: any) {
    console.error('Municipality sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Also allow GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Municipality sync endpoint',
    usage: 'POST with Authorization: Bearer <secret>',
    config: {
      hasFeedUrl: !!process.env.MUNICIPALITY_FEED_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  })
}

