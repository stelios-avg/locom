'use client'

import { useParams } from 'next/navigation'
import PostDetail from '@/components/PostDetail'
import ProtectedRoute from '@/components/ProtectedRoute'

// For static export, we export an empty generateStaticParams
// The routing will be handled entirely client-side
export const dynamicParams = true

export default function PostPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  if (!id) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Post not found</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PostDetail postId={id} />
    </ProtectedRoute>
  )
}
