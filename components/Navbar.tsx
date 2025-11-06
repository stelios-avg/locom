'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Home, ShoppingBag, Calendar, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { useTranslations } from '@/lib/i18n/hooks'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const { t } = useTranslations()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-primary-600">
              Locom
            </span>
          </Link>

          <div className="flex items-center space-x-1 overflow-x-auto">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">{t?.nav.feed || 'Feed'}</span>
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
              <ShoppingBag className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">{t?.nav.marketplace || 'Marketplace'}</span>
            </Link>
            <Link
              href="/events"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">{t?.nav.events || 'Events'}</span>
            </Link>
            <Link
              href={`/profile?id=${user?.id}`}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">{t?.nav.profile || 'Profile'}</span>
            </Link>
            {user && <NotificationBell />}
            <LanguageSwitcher />
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="hidden md:inline">{t?.auth.logout || 'Logout'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

