'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostWithUser } from '@/types'
import Navbar from './Navbar'
import CreatePostModal from './CreatePostModal'
import { Plus, Calendar, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { useTranslations } from '@/lib/i18n/hooks'

export default function Events() {
  const [events, setEvents] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    loadEvents()
  }, [filter])

  const loadEvents = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
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
        .eq('post_type', 'event')
        .order('event_date', { ascending: true })

      if (error) throw error

      let filteredEvents = data || []

      if (filter === 'upcoming') {
        filteredEvents = filteredEvents.filter(
          (event) => event.event_date && !isPast(new Date(event.event_date))
        )
      } else if (filter === 'past') {
        filteredEvents = filteredEvents.filter(
          (event) => event.event_date && isPast(new Date(event.event_date))
        )
      }

      const eventsWithComments = await Promise.all(
        filteredEvents.map(async (event) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', event.id)

          return {
            ...event,
            profiles: event.profiles,
            comments_count: count || 0,
          }
        })
      )

      setEvents(eventsWithComments as PostWithUser[])
    } catch (error) {
      console.error('Error loading events:', error)
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
              {t?.events.title || 'Events'}
            </h1>
            <p className="text-gray-600">{t?.events.subtitle || 'Discover local gatherings and activities'}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t?.events.createEvent || 'Create Event'}</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            {(['upcoming', 'past', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f === 'upcoming' ? (t?.events.upcoming || 'Upcoming') : 
                 f === 'past' ? (t?.events.past || 'Past') : 
                 (t?.events.all || 'All')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t?.events.loadingEvents || 'Loading events...'}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">{t?.events.noEvents || 'No events found'}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              {t?.events.createEvent || 'Create the first event!'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/post?id=${event.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {event.image_url && (
                  <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.content}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="mb-2">
                  {event.event_date && (
                    <div className="flex items-center gap-2 text-primary-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  {event.event_location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.event_location}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{event.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{event.profiles?.name || 'Anonymous'}</span>
                  <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreatePostModal
            onClose={() => {
              setShowCreateModal(false)
              loadEvents()
            }}
            postType="event"
          />
        )}
      </div>
    </div>
  )
}

