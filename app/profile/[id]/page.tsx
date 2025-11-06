'use client'

import { useParams } from 'next/navigation'
import ProfilePage from '@/components/ProfilePage'
import ProtectedRoute from '@/components/ProtectedRoute'

// For static export, we need to export generateStaticParams even if empty
// The actual routing will be handled client-side
export function generateStaticParams() {
  return []
}

export default function Profile() {
  const params = useParams()
  const id = params?.id as string

  if (!id) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <ProfilePage userId={id} />
    </ProtectedRoute>
  )
}
