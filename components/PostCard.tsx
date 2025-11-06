'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser, CommentWithUser } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, MapPin, Trash2 } from 'lucide-react'
import CommentSection from './CommentSection'
import { useTranslations } from '@/lib/i18n/hooks'

interface PostCardProps {
  post: PostWithUser
  onUpdate: () => void
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    checkOwnership()
    if (showComments) {
      loadComments()
    }
  }, [showComments, post])

  const checkOwnership = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsOwner(user?.id === post.user_id)
  }

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    if (data) {
      setComments(data as CommentWithUser[])
    }
  }

  const handleDelete = async () => {
    if (!confirm(t?.post.deletePost || 'Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (!error) {
      onUpdate()
    }
  }

  const user = post.profiles
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name || 'User'}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.name || 'Anonymous'}
              </h3>
              {user?.neighborhood && (
                <p className="text-sm text-gray-500">{user.neighborhood}</p>
              )}
            </div>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>

          {post.image_url && (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {post.location_name && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{post.location_name}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{timeAgo}</span>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count || comments.length || 0}</span>
            </button>
          </div>

          {showComments && (
            <CommentSection
              postId={post.id}
              comments={comments}
              onCommentAdded={() => {
                loadComments()
                onUpdate()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

