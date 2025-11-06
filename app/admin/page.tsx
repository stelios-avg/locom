'use client'

import AdminPanel from '@/components/AdminPanel'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminPage() {
  // Check if user is admin (you can add admin role checking logic here)
  // For now, we'll allow any logged-in user to access admin panel
  // In production, you should check user roles from profiles table

  return (
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  )
}

