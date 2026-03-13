'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser, CommentWithUser } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, MapPin, Trash2, Pencil, Check, X } from 'lucide-react'
import CommentSection from './CommentSection'
import ReportButton from './ReportButton'
import BlockButton from './BlockButton'
import { useTranslations } from '@/lib/i18n/hooks'

interface PostCardProps {
  post: PostWithUser
  onUpdate: () => void
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [saving, setSaving] = useState(false)
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

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('posts')
      .update({ content: editContent.trim() })
      .eq('id', post.id)
    setSaving(false)
    if (!error) {
      setEditing(false)
      onUpdate()
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    setDeleting(false)
    setShowDeleteConfirm(false)
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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {user?.name || 'Anonymous'}
                </h3>
                {user?.is_pro && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white">
                    PRO
                  </span>
                )}
              </div>
              {user?.neighborhood && (
                <p className="text-sm text-gray-500">{user.neighborhood}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ReportButton
                contentType="post"
                contentId={post.id}
                reportedUserId={post.user_id}
              />
              {!isOwner && (
                <BlockButton
                  userId={post.user_id}
                  onBlockChange={onUpdate}
                />
              )}
              {isOwner && !showDeleteConfirm && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {isOwner && (
                showDeleteConfirm ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    <span className="text-xs text-red-700 font-medium">
                      {t?.common.delete || 'Delete'}?
                    </span>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-xs text-red-600 font-semibold hover:text-red-800 disabled:opacity-50"
                    >
                      {deleting ? '...' : (t?.common.delete || 'Yes')}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {t?.common.cancel || 'No'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>

          {editing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input w-full min-h-[80px] resize-none mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditContent(post.content) }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>
          )}

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

