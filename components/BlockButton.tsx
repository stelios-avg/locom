'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ban, Unlock } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/hooks'

interface BlockButtonProps {
  userId: string
  className?: string
  onBlockChange?: () => void
}

export default function BlockButton({ userId, className, onBlockChange }: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
    checkBlockStatus()
  }, [userId])

  const checkBlockStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id === userId) return

    const { data } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId)
      .single()

    setIsBlocked(!!data)
  }

  const handleBlock = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id === userId) return

    if (isBlocked) {
      // Unblock
      if (!confirm(t?.block.confirmUnblock || 'Are you sure you want to unblock this user?')) return
      setLoading(true)
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)

      if (!error) {
        setIsBlocked(false)
        if (onBlockChange) onBlockChange()
      }
      setLoading(false)
    } else {
      // Block
      if (!confirm(t?.block.confirmBlock || 'Are you sure you want to block this user?')) return
      setLoading(true)
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
        })

      if (!error) {
        setIsBlocked(true)
        if (onBlockChange) onBlockChange()
      }
      setLoading(false)
    }
  }

  if (!currentUser || currentUser.id === userId) return null

  return (
    <button
      onClick={handleBlock}
      disabled={loading}
      className={`text-gray-400 hover:text-red-600 transition-colors ${className || ''}`}
      title={isBlocked ? (t?.block.unblockUser || 'Unblock User') : (t?.block.blockUser || 'Block User')}
    >
      {isBlocked ? (
        <Unlock className="w-4 h-4" />
      ) : (
        <Ban className="w-4 h-4" />
      )}
    </button>
  )
}

