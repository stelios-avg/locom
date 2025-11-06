'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PostDetail from '@/components/PostDetail'
import ProtectedRoute from '@/components/ProtectedRoute'

function PostContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Post not found</p>
      </div>
    )
  }

  return <PostDetail postId={id} />
}

export default function PostPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <PostContent />
      </Suspense>
    </ProtectedRoute>
  )
}

