'use client'

import Marketplace from '@/components/Marketplace'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <Marketplace />
    </ProtectedRoute>
  )
}

