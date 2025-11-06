'use client'

import Feed from '@/components/Feed'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Home() {
  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-gray-50">
      <Feed />
    </main>
    </ProtectedRoute>
  )
}

