'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, PostWithUser } from '@/types'
import Navbar from './Navbar'
import PostCard from './PostCard'
import { Edit2, MapPin } from 'lucide-react'
import EditProfileModal from './EditProfileModal'
import { useTranslations } from '@/lib/i18n/hooks'

interface ProfilePageProps {
  userId: string
}

export default function ProfilePage({ userId }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    loadProfile()
    loadPosts()
  }, [userId])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsOwnProfile(user?.id === userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const postsWithComments = await Promise.all(
        (data || []).map(async (post) => {
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
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">{t?.profile.notFound || 'Profile not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name || 'User'}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-primary-200 flex items-center justify-center">
                  <span className="text-primary-700 text-4xl font-medium">
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  {profile.name || 'Anonymous User'}
                </h1>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    {t?.profile.editProfile || 'Edit Profile'}
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profile.neighborhood && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.neighborhood}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>{posts.length} {t?.profile.posts || 'posts'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
            {t?.profile.posts || 'Posts'}
          </h2>
          {posts.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">{t?.profile.noPosts || 'No posts yet'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={loadPosts} />
              ))}
            </div>
          )}
        </div>

        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onClose={() => {
              setShowEditModal(false)
              loadProfile()
            }}
          />
        )}
      </div>
    </div>
  )
}

