'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser } from '@/types'
import Navbar from './Navbar'
import CreatePostModal from './CreatePostModal'
import { Plus, ShoppingBag, Euro } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from '@/lib/i18n/hooks'

export default function Marketplace() {
  const [listings, setListings] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()
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
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            neighborhood
          )
        `)
        .eq('post_type', 'marketplace')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      const listingsWithComments = await Promise.all(
        (data || []).map(async (listing) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', listing.id)

          return {
            ...listing,
            profiles: listing.profiles,
            comments_count: count || 0,
          }
        })
      )

      setListings(listingsWithComments as PostWithUser[])
    } catch (error) {
      console.error('Error loading listings:', error)
    } finally {
      setLoading(false)
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
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/post?id=${listing.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
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
                    <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
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
            ))}
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

