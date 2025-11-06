'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser, Profile } from '@/types'
import Navbar from './Navbar'
import { Trash2, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from '@/lib/i18n/hooks'
import { checkTextContent } from '@/lib/content-moderation'

export default function AdminPanel() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'posts' | 'users'>('posts')
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    if (selectedTab === 'posts') {
      loadPosts()
    } else {
      loadUsers()
    }
  }, [selectedTab])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

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
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    // This would load users - implement as needed
    setLoading(false)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm(t?.post.deletePost || 'Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (!error) {
      loadPosts()
    }
  }

  const handleModeratePost = async (postId: string, status: 'approved' | 'rejected', reason?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('posts')
      .update({
        status,
        moderation_notes: reason || null,
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (!error) {
      loadPosts()
    }
  }

  const checkPostContent = (post: PostWithUser) => {
    return checkTextContent(post.content)
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {t?.admin.title || 'Admin Panel'}
          </h1>
          <p className="text-gray-600">Manage posts and users</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('posts')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                selectedTab === 'posts'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t?.admin.allPosts || 'Posts'}
            </button>
            <button
              onClick={() => setSelectedTab('users')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                selectedTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {selectedTab === 'posts' && (
          <div className="card">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">{t?.admin.loadingPosts || 'Loading posts...'}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t?.admin.noPosts || 'No posts found'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-1 bg-primary-100 text-primary-700 rounded">
                          {post.post_type}
                        </span>
                        {(post as any).status && (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            (post as any).status === 'approved' ? 'bg-green-100 text-green-700' :
                            (post as any).status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {(post as any).status}
                          </span>
                        )}
                        {(() => {
                          const contentCheck = checkPostContent(post)
                          if (!contentCheck.isAppropriate) {
                            return (
                              <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Flagged
                              </span>
                            )
                          }
                          return null
                        })()}
                        <span className="text-sm text-gray-500">
                          {post.profiles?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-400">
                          • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-1 line-clamp-2">{post.content}</p>
                      {post.image_url && (
                        <div className="mb-2">
                          <img src={post.image_url} alt="Post" className="w-32 h-32 object-cover rounded-lg" />
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.comments_count || 0} comments</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {(post as any).status !== 'approved' && (
                        <button
                          onClick={() => handleModeratePost(post.id, 'approved')}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="Approve post"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {(post as any).status !== 'rejected' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason (optional):')
                            handleModeratePost(post.id, 'rejected', reason || undefined)
                          }}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Reject post"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'users' && (
          <div className="card">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">User management coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

