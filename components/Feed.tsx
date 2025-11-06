'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser } from '@/types'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import Navbar from './Navbar'
import { Plus, MapPin } from 'lucide-react'
import { getCurrentLocation } from '@/utils/geolocation'
import { useTranslations } from '@/lib/i18n/hooks'

export default function Feed() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(5) // Default 5km radius
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      loadPosts()
    }
  }, [radius, userLocation])

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

      // Fetch posts with user profiles (only approved posts, or pending/own posts)
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            neighborhood
          )
        `)
        .eq('post_type', 'feed')
        .or('status.is.null,status.eq.approved,user_id.eq.' + user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      const { data, error } = await query

      if (error) throw error

      // Filter posts by radius
      if (data) {
        // Filter posts: show posts without location OR posts within radius
        const filteredPosts = data.filter((post) => {
          // Always show posts without location
          if (!post.latitude || !post.longitude) return true
          
          // If user location is available, filter by radius
          if (userLat && userLng) {
          const distance = calculateDistance(
            userLat,
            userLng,
            post.latitude,
            post.longitude
          )
            return distance <= radius
          }
          
          // If no user location, show all posts with location
          return true
        })

        // Get comments count for each post
        const postsWithComments = await Promise.all(
          filteredPosts.map(async (post) => {
            const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)

            return {
              ...post,
              profiles: post.profiles,
              comments_count: count || 0,
            }
          })
        )

        setPosts(postsWithComments as PostWithUser[])
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
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

