'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Home, ShoppingBag, Calendar, User, CreditCard, LogOut, FileText, Menu, X } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { useTranslations } from '@/lib/i18n/hooks'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const { t } = useTranslations()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMobileMenu}>
            <span className="text-2xl font-display font-bold text-primary-600">
              Locom
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm">{t?.nav.feed || 'Feed'}</span>
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm">{t?.nav.marketplace || 'Marketplace'}</span>
            </Link>
            <Link
              href="/events"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{t?.nav.events || 'Events'}</span>
            </Link>
            {user && (
              <Link
                href={`/profile?id=${user?.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{t?.nav.profile || 'Profile'}</span>
              </Link>
            )}
            <Link
              href="/rules"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="text-sm">{t?.nav.rules || 'Rules'}</span>
            </Link>
            {user && (
              <Link
                href="/billing"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">{t?.nav.billing || 'Billing'}</span>
              </Link>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {user && <NotificationBell />}
            <LanguageSwitcher />
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                title={t?.auth.logout || 'Logout'}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">{t?.auth.logout || 'Logout'}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>{t?.nav.feed || 'Feed'}</span>
              </Link>
              <Link
                href="/marketplace"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t?.nav.marketplace || 'Marketplace'}</span>
              </Link>
              <Link
                href="/events"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>{t?.nav.events || 'Events'}</span>
              </Link>
              {user && (
                <Link
                  href={`/profile?id=${user?.id}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{t?.nav.profile || 'Profile'}</span>
                </Link>
              )}
              <Link
                href="/rules"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>{t?.nav.rules || 'Rules'}</span>
              </Link>
              {user && (
                <Link
                  href="/billing"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{t?.nav.billing || 'Billing'}</span>
                </Link>
              )}
              <div className="border-t border-gray-200 my-2"></div>
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors text-left w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t?.auth.logout || 'Logout'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

