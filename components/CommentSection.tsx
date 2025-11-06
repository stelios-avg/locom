'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommentWithUser } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Send } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/hooks'
import { checkTextContent } from '@/lib/content-moderation'

interface CommentSectionProps {
  postId: string
  comments: CommentWithUser[]
  onCommentAdded: () => void
}

export default function CommentSection({ postId, comments, onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { t } = useTranslations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // Validate comment content
    const textCheck = checkTextContent(newComment)
    if (!textCheck.isAppropriate) {
      alert(
        (textCheck.reason || 'Inappropriate content detected') + 
        '\n\n' + 
        (t?.post.contentModeration || 'Please review your content and try again.')
      )
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      })

    if (!error) {
      setNewComment('')
      onCommentAdded()
    }
    
    setLoading(false)
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {comment.profiles?.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.name || 'User'}
                width={32}
                height={32}
                className="rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 text-xs font-medium">
                  {comment.profiles?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-sm text-gray-900 mb-1">
                  {comment.profiles?.name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t?.post.addComment || 'Add a comment...'}
          className="input flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

