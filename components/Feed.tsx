'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser } from '@/types'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import Navbar from './Navbar'
import { Plus, MapPin, AlertCircle, Search } from 'lucide-react'
import { getCurrentLocation } from '@/utils/geolocation'
import { useTranslations } from '@/lib/i18n/hooks'

const PAGE_SIZE = 20

export default function Feed() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [allPosts, setAllPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(5)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (!userLocation) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      loadPosts()
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [radius, userLocation])

  // Filter posts client-side when search changes
  useEffect(() => {
    if (!search.trim()) {
      setPosts(allPosts.slice(0, page * PAGE_SIZE))
    } else {
      const q = search.toLowerCase()
      setPosts(allPosts.filter(p => p.content.toLowerCase().includes(q)))
    }
  }, [search, allPosts])

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation()
      setUserLocation({ lat: location.latitude, lng: location.longitude })
    } catch (error) {
      console.error('Error getting location:', error)
      // Default to Nicosia, Cyprus if geolocation fails
      setUserLocation({ lat: 35.1856, lng: 33.3823 })
    }
  }

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get user's current location from profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('user_id', user.id)
        .single()

      const userLat = profile?.latitude || userLocation?.lat || 35.1856
      const userLng = profile?.longitude || userLocation?.lng || 33.3823

      // Get blocked users
      const { data: blockedUsers } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id)

      const blockedIds = blockedUsers?.map(b => b.blocked_id) || []

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url, neighborhood, is_pro),
          comments(count)
        `)
        .eq('post_type', 'feed')
        .or('status.is.null,status.eq.approved,user_id.eq.' + user.id)
        .is('hidden', null)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error

      const filteredByBlocks = (data || []).filter(
        post => !blockedIds.includes(post.user_id) && !post.hidden
      )

      const filteredPosts = filteredByBlocks.filter((post) => {
        if (!post.latitude || !post.longitude) return true
        if (userLat && userLng) {
          return calculateDistance(userLat, userLng, post.latitude, post.longitude) <= radius
        }
        return true
      })

      const postsWithComments = filteredPosts.map((post) => ({
        ...post,
        profiles: post.profiles,
        comments_count: (post as any).comments?.[0]?.count || 0,
      }))

      setAllPosts(postsWithComments as PostWithUser[])
      setPosts((postsWithComments as PostWithUser[]).slice(0, PAGE_SIZE))
      setPage(1)
    } catch (error) {
      console.error('Error loading posts:', error)
      setError('Could not load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              {t?.feed.title || 'Neighborhood Feed'}
            </h1>
            <p className="text-gray-600">{t?.feed.subtitle || 'See what\'s happening in your area'}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t?.feed.newPost || 'New Post'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="input pl-10 w-full"
          />
        </div>

        {/* Radius filter */}
        <div className="mb-6 card">
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t?.feed.showPostsWithin || 'Show posts within'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 w-16">
                  {radius} {t?.feed.km || 'km'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t?.feed.loadingPosts || 'Loading posts...'}</p>
          </div>
        ) : error ? (
          <div className="card flex items-center gap-3 text-red-700 bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={loadPosts}
              className="text-sm text-red-600 hover:text-red-800 font-medium underline"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">{t?.feed.noPosts || 'No posts found in your area'}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              {t?.feed.createFirstPost || 'Create the first post!'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={loadPosts} />
            ))}
            {!search && allPosts.length > page * PAGE_SIZE && (
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    const nextPage = page + 1
                    setPage(nextPage)
                    setPosts(allPosts.slice(0, nextPage * PAGE_SIZE))
                  }}
                  disabled={loadingMore}
                  className="btn-outline"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}

        {showCreateModal && (
          <CreatePostModal
            onClose={() => {
              setShowCreateModal(false)
              loadPosts()
            }}
            postType="feed"
          />
        )}
      </div>
    </div>
  )
}

