'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/app/providers'

interface ProStatus {
  isPro: boolean
  loading: boolean
}

export const useProStatus = (): ProStatus => {
  const { user } = useAuth()
  const supabase = createClient()
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStatus = async () => {
      if (!user?.id) {
        setIsPro(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('plan, is_pro')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error

        setIsPro(data?.plan === 'pro' || Boolean(data?.is_pro))
      } catch (err) {
        console.error('Failed to load pro status', err)
        setIsPro(false)
      } finally {
        setLoading(false)
      }
    }

    loadStatus()
  }, [supabase, user?.id])

  return { isPro, loading }
}
