'use client'

import BillingPage from '@/components/BillingPage'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Billing() {
  return (
    <ProtectedRoute>
      <BillingPage />
    </ProtectedRoute>
  )
}
