import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'

function LoginFormWrapper() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary-600 mb-2">
            Locom
          </h1>
          <p className="text-gray-600">Connect with your neighborhood</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-primary-600 mb-2">
              Locom
            </h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginFormWrapper />
    </Suspense>
  )
}

