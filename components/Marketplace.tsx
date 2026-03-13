'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser } from '@/types'
import Navbar from './Navbar'
import CreatePostModal from './CreatePostModal'
import { Plus, ShoppingBag, Euro, CheckCircle, AlertCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from '@/lib/i18n/hooks'
import ReportButton from './ReportButton'
import { useAuth } from '@/app/providers'

const PAGE_SIZE = 12

export default function Marketplace() {
  const [allListings, setAllListings] = useState<PostWithUser[]>([])
  const [listings, setListings] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [markingAsSold, setMarkingAsSold] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const supabase = createClient()
  const { user } = useAuth()
  const { t } = useTranslations()

  const categories = [
    { value: 'all', label: t?.marketplace.all || 'All' },
    { value: 'furniture', label: t?.marketplace.furniture || 'Furniture' },
    { value: 'electronics', label: t?.marketplace.electronics || 'Electronics' },
    { value: 'clothing', label: t?.marketplace.clothing || 'Clothing' },
    { value: 'books', label: t?.marketplace.books || 'Books' },
    { value: 'services', label: t?.marketplace.services || 'Services' },
    { value: 'other', label: t?.marketplace.other || 'Other' },
  ]

  useEffect(() => {
    loadListings()
  }, [selectedCategory])

  const loadListings = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url, neighborhood, is_pro),
          comments(count)
        `)
        .eq('post_type', 'marketplace')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      const listingsWithComments = (data || []).map((listing) => ({
        ...listing,
        profiles: listing.profiles,
        comments_count: (listing as any).comments?.[0]?.count || 0,
      }))

      setAllListings(listingsWithComments as PostWithUser[])
      setListings((listingsWithComments as PostWithUser[]).slice(0, PAGE_SIZE))
      setPage(1)
    } catch (err) {
      console.error('Error loading listings:', err)
      setError('Could not load listings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter listings client-side when search changes
  useEffect(() => {
    if (!search.trim()) {
      setListings(allListings.slice(0, page * PAGE_SIZE))
    } else {
      const q = search.toLowerCase()
      setListings(allListings.filter(l => l.content.toLowerCase().includes(q)))
    }
  }, [search, allListings])

  const handleMarkAsSold = async (listingId: string) => {
    setMarkingAsSold(listingId)
    const { error } = await supabase
      .from('posts')
      .update({ status: 'sold' })
      .eq('id', listingId)

    setMarkingAsSold(null)
    if (!error) {
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'sold' } : l))
      )
    }
  }

  const handleMarkAsAvailable = async (listingId: string) => {
    setMarkingAsSold(listingId)
    const { error } = await supabase
      .from('posts')
      .update({ status: null })
      .eq('id', listingId)

    setMarkingAsSold(null)
    if (!error) {
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: null } : l))
      )
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              {t?.marketplace.title || 'Marketplace'}
            </h1>
            <p className="text-gray-600">{t?.marketplace.subtitle || 'Buy and sell with your neighbors'}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t?.marketplace.newListing || 'New Listing'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="input pl-10 w-full"
          />
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="card flex items-center gap-3 text-red-700 bg-red-50 border border-red-200 mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 font-medium">{error}</p>
            <button onClick={loadListings} className="text-sm text-red-600 hover:text-red-800 font-medium underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t?.marketplace.loadingListings || 'Loading listings...'}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">{t?.marketplace.noListings || 'No listings found'}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              {t?.marketplace.newListing || 'Create the first listing!'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const isSold = listing.status === 'sold'
              const isOwner = user?.id === listing.user_id
              return (
              <div
                key={listing.id}
                className={`card hover:shadow-lg transition-shadow relative ${isSold ? 'opacity-75' : ''}`}
              >
                {isSold && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <span className="bg-gray-900 text-white text-lg font-bold px-6 py-2 rounded-xl rotate-[-10deg] opacity-90">
                      SOLD
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 z-20">
                  <ReportButton
                    contentType="listing"
                    contentId={listing.id}
                    reportedUserId={listing.user_id}
                  />
                </div>
                <Link href={`/post?id=${listing.id}`}>
                  {listing.image_url && (
                    <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={listing.image_url}
                        alt={listing.content}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="mb-2">
                    {listing.category && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-lg mb-2">
                        {listing.category}
                      </span>
                    )}
                    {listing.price !== null && (
                      <div className={`flex items-center gap-1 text-2xl font-bold ${isSold ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        <Euro className="w-5 h-5" />
                        <span>{listing.price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">{listing.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{listing.profiles?.name || 'Anonymous'}</span>
                    <span>{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
                  </div>
                </Link>

                {isOwner && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {isSold ? (
                      <button
                        onClick={() => handleMarkAsAvailable(listing.id)}
                        disabled={markingAsSold === listing.id}
                        className="w-full text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors disabled:opacity-50"
                      >
                        {markingAsSold === listing.id ? '...' : 'Mark as Available'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsSold(listing.id)}
                        disabled={markingAsSold === listing.id}
                        className="w-full flex items-center justify-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {markingAsSold === listing.id ? '...' : 'Mark as Sold'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )})}
            {!search && allListings.length > page * PAGE_SIZE && (
              <div className="col-span-full text-center pt-2">
                <button
                  onClick={() => {
                    const nextPage = page + 1
                    setPage(nextPage)
                    setListings(allListings.slice(0, nextPage * PAGE_SIZE))
                  }}
                  className="btn-outline"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}

        {showCreateModal && (
          <CreatePostModal
            onClose={() => {
              setShowCreateModal(false)
              loadListings()
            }}
            postType="marketplace"
          />
        )}
      </div>
    </div>
  )
}

