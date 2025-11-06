'use client'

import Events from '@/components/Events'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <Events />
    </ProtectedRoute>
  )
}

