'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Eye, EyeOff, Trash2, AlertTriangle, Ban, X } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/hooks'

interface Report {
  id: string
  reporter_id: string
  reported_user_id: string | null
  content_type: 'post' | 'comment' | 'listing'
  content_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewed_by: string | null
  reviewed_at: string | null
  resolution: string | null
  created_at: string
  reporter?: { name: string; avatar_url: string | null }
  reported_user?: { name: string; avatar_url: string | null }
}

export default function ReportsPanel() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all')
  const supabase = createClient()
  const { t } = useTranslations()

  useEffect(() => {
    loadReports()
  }, [filter])

  const loadReports = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id (
            name,
            avatar_url
          ),
          reported_user:reported_user_id (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setReports((data || []) as Report[])
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReportStatus = async (reportId: string, status: string, resolution?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        resolution: resolution || null,
      })
      .eq('id', reportId)

    if (!error) {
      loadReports()
    }
  }

  const handleHideContent = async (report: Report) => {
    if (!confirm(t?.admin.hideContent || 'Hide this content?')) return

    const table = report.content_type === 'comment' ? 'comments' : 'posts'
    const { error } = await supabase
      .from(table)
      .update({ hidden: true })
      .eq('id', report.content_id)

    if (!error) {
      await handleUpdateReportStatus(report.id, 'resolved', 'Content hidden')
    }
  }

  const handleDeleteContent = async (report: Report) => {
    if (!confirm(t?.admin.deleteContent || 'Delete this content permanently?')) return

    const table = report.content_type === 'comment' ? 'comments' : 'posts'
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', report.content_id)

    if (!error) {
      await handleUpdateReportStatus(report.id, 'resolved', 'Content deleted')
    }
  }

  const handleWarnUser = async (report: Report) => {
    if (!report.reported_user_id) return
    const reason = prompt(t?.admin.warnUser || 'Warning reason:')
    if (!reason) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_warnings')
      .insert({
        user_id: report.reported_user_id,
        warned_by: user.id,
        warning_type: 'warning',
        reason,
      })

    if (!error) {
      await handleUpdateReportStatus(report.id, 'resolved', `User warned: ${reason}`)
    }
  }

  const handleBanUser = async (report: Report) => {
    if (!report.reported_user_id) return
    const reason = prompt(t?.admin.banUser || 'Ban reason:')
    if (!reason) return
    const days = prompt('Ban duration in days (leave empty for permanent):')
    const expiresAt = days ? new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString() : null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_warnings')
      .insert({
        user_id: report.reported_user_id,
        warned_by: user.id,
        warning_type: 'ban',
        reason,
        expires_at: expiresAt,
      })

    if (!error) {
      await handleUpdateReportStatus(report.id, 'resolved', `User banned: ${reason}`)
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: t?.report.spam || 'Spam',
      inappropriate: t?.report.inappropriate || 'Inappropriate',
      harassment: t?.report.harassment || 'Harassment',
      fake: t?.report.fake || 'Fake',
      scam: t?.report.scam || 'Scam',
      copyright: t?.report.copyright || 'Copyright',
      other: t?.report.other || 'Other',
    }
    return labels[reason] || reason
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t?.admin.pending || 'Pending' },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', label: t?.admin.reviewed || 'Reviewed' },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', label: t?.admin.resolved || 'Resolved' },
      dismissed: { bg: 'bg-gray-100', text: 'text-gray-700', label: t?.admin.dismissed || 'Dismissed' },
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : (t?.admin[f] || f)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{t?.admin.loadingReports || 'Loading reports...'}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t?.admin.noReports || 'No reports found'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(report.status)}
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {report.content_type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">{t?.admin.reportedBy || 'Reported by'}: </span>
                    {report.reporter?.name || 'Anonymous'}
                  </div>
                  {report.reported_user && (
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">{t?.admin.reportedUser || 'Reported User'}: </span>
                      {report.reported_user.name || 'Anonymous'}
                    </div>
                  )}
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">{t?.admin.reason || 'Reason'}: </span>
                    {getReasonLabel(report.reason)}
                  </div>
                  {report.description && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{t?.admin.description || 'Description'}: </span>
                      {report.description}
                    </div>
                  )}
                  {report.resolution && (
                    <div className="text-sm text-green-700 mb-2">
                      <span className="font-medium">Resolution: </span>
                      {report.resolution}
                    </div>
                  )}
                </div>
              </div>

              {report.status === 'pending' && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleHideContent(report)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    {t?.admin.hideContent || 'Hide Content'}
                  </button>
                  <button
                    onClick={() => handleDeleteContent(report)}
                    className="btn-secondary text-sm flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t?.admin.deleteContent || 'Delete Content'}
                  </button>
                  {report.reported_user_id && (
                    <>
                      <button
                        onClick={() => handleWarnUser(report)}
                        className="btn-secondary text-sm flex items-center gap-2 text-yellow-600"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {t?.admin.warnUser || 'Warn User'}
                      </button>
                      <button
                        onClick={() => handleBanUser(report)}
                        className="btn-secondary text-sm flex items-center gap-2 text-red-600"
                      >
                        <Ban className="w-4 h-4" />
                        {t?.admin.banUser || 'Ban User'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    {t?.admin.dismissReport || 'Dismiss Report'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



