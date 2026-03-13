'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Flag } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/hooks'

interface ReportButtonProps {
  contentType: 'post' | 'comment' | 'listing'
  contentId: string
  reportedUserId?: string
  className?: string
}

export default function ReportButton({ contentType, contentId, reportedUserId, className }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()
  const { t } = useTranslations()

  const reasons = [
    { value: 'spam', label: t?.report.spam || 'Spam' },
    { value: 'inappropriate', label: t?.report.inappropriate || 'Inappropriate Content' },
    { value: 'harassment', label: t?.report.harassment || 'Harassment' },
    { value: 'fake', label: t?.report.fake || 'Fake/False Information' },
    { value: 'scam', label: t?.report.scam || 'Scam/Fraud' },
    { value: 'copyright', label: t?.report.copyright || 'Copyright Violation' },
    { value: 'other', label: t?.report.other || 'Other' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    // Check if already reported
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (existing) {
      alert(t?.report.alreadyReported || 'You have already reported this content')
      setLoading(false)
      setShowModal(false)
      return
    }

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        content_type: contentType,
        content_id: contentId,
        reason,
        description: description.trim() || null,
      })

    if (!error) {
      setSubmitted(true)
      setTimeout(() => {
        setShowModal(false)
        setSubmitted(false)
        setReason('')
        setDescription('')
      }, 2000)
    }
    
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`text-gray-400 hover:text-red-600 transition-colors ${className || ''}`}
        title={t?.report.report || 'Report'}
      >
        <Flag className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {t?.report.reportContent || 'Report Content'}
            </h2>

            {submitted ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <p className="text-gray-700">
                  {t?.report.reportSubmitted || 'Report submitted successfully'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t?.report.selectReason || 'Select a reason'}
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">{t?.report.selectReason || 'Select a reason'}</option>
                    {reasons.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t?.report.additionalDetails || 'Additional details (optional)'}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="input w-full"
                    placeholder={t?.report.additionalDetails || 'Additional details (optional)'}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setReason('')
                      setDescription('')
                    }}
                    className="btn-secondary flex-1"
                  >
                    {t?.common.cancel || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !reason}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (t?.common.loading || 'Loading...') : (t?.report.submitReport || 'Submit Report')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}



