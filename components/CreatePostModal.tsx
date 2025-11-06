'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostType } from '@/types'
import { X, Image as ImageIcon, MapPin, AlertTriangle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { getCurrentLocation } from '@/utils/geolocation'
import { useTranslations } from '@/lib/i18n/hooks'
import { validatePostContent } from '@/lib/content-moderation'

interface CreatePostModalProps {
  onClose: () => void
  postType: PostType
}

export default function CreatePostModal({ onClose, postType }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const supabase = createClient()
  const { t } = useTranslations()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setImage(acceptedFiles[0])
      setImagePreview(URL.createObjectURL(acceptedFiles[0]))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
  })

  const getCurrentLocationHandler = async () => {
    setLocationLoading(true)
    try {
      const coords = await getCurrentLocation()
      setLocation({
        lat: coords.latitude,
        lng: coords.longitude,
        name: t?.location.currentLocation || 'Current location'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (t?.location.locationRequired || 'Could not get your location. Please enable location services.')
      alert(errorMessage)
      console.error('Location error:', error)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    // Validate content before submission
    const validation = validatePostContent(content, image)
    if (!validation.isValid) {
      alert(
        validation.errors.join('\n') + 
        '\n\n' + 
        (t?.post.contentModeration || 'Please review your content and try again.')
      )
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    let imageUrl = null

    // Upload image if present
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, image)

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    }

    // Create post (status will be 'pending' by default, or 'approved' if auto-approve is enabled)
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
        post_type: postType,
        category: category || null,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        location_name: location?.name || null,
        price: price ? parseFloat(price) : null,
        event_date: eventDate || null,
        event_location: eventLocation || null,
        status: 'approved', // Auto-approve for now (can be changed to 'pending' for manual review)
      })

    if (!error) {
      onClose()
    } else {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            {postType === 'feed' ? (t?.post.create || 'Create New Post') : 
             postType === 'marketplace' ? (t?.post.createListing || 'Create New Listing') : 
             (t?.post.createEvent || 'Create New Event')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t?.post.content || 'Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[120px] resize-none"
              placeholder={t?.post.whatsOnMind || 'What\'s on your mind?'}
              required
            />
          </div>

          {postType === 'marketplace' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t?.marketplace.category || 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input"
                  >
                    <option value="">{t?.marketplace.selectCategory || 'Select category'}</option>
                    <option value="furniture">{t?.marketplace.furniture || 'Furniture'}</option>
                    <option value="electronics">{t?.marketplace.electronics || 'Electronics'}</option>
                    <option value="clothing">{t?.marketplace.clothing || 'Clothing'}</option>
                    <option value="books">{t?.marketplace.books || 'Books'}</option>
                    <option value="services">{t?.marketplace.services || 'Services'}</option>
                    <option value="other">{t?.marketplace.other || 'Other'}</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {postType === 'event' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t?.events.eventDate || 'Event Date'}
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t?.events.eventLocation || 'Event Location'}
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="input"
                    placeholder="Venue name"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <button
              type="button"
              onClick={getCurrentLocationHandler}
              disabled={locationLoading}
              className="btn-secondary flex items-center gap-2 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className="w-4 h-4" />
              {locationLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>{t?.location.gettingLocation || 'Getting location...'}</span>
                </>
              ) : (
                <span>{t?.location.useCurrentLocation || 'Use Current Location'}</span>
              )}
            </button>
            {location && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{location.name}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image (optional)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImage(null)
                      setImagePreview(null)
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    {t?.profile.removeImage || 'Remove image'}
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the image here'
                      : 'Drag & drop an image, or click to select'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
              disabled={loading}
            >
              {t?.common.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (t?.post.posting || 'Posting...') : (t?.post.post || 'Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

