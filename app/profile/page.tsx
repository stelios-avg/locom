'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProfilePage from '@/components/ProfilePage'
import ProtectedRoute from '@/components/ProtectedRoute'

function ProfileContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    )
  }

  return <ProfilePage userId={id} />
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </ProtectedRoute>
  )
}

