import { useState } from 'react'
import { AlertTriangle, MessageSquare, Phone, CheckCircle, Filter } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { mockFollowUps } from '../../api/mockData'
import { formatRelative } from '../../utils/format'
import toast from 'react-hot-toast'

export default function FollowUpCenter() {
  const [followUps, setFollowUps] = useState(mockFollowUps)
  const [filter, setFilter] = useState('open')

  const filtered = followUps.filter(f => filter === 'all' ? true : f.status === filter)

  const resolve = (id) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f))
    toast.success('Follow-up marked as resolved')
  }

  const openCount = followUps.filter(f => f.status === 'open').length

  return (
    <Layout title="Follow-up Centre">
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Follow-up Centre</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {openCount} client{openCount !== 1 ? 's' : ''} require attention
            </p>
          </div>
        </div>

        {/* System logic info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📅', title: 'Missed 3+ sessions', desc: 'Clients who missed 3 or more consecutive gym sessions', count: 1, color: 'red' },
            { icon: '🔔', title: 'Subscription expiring', desc: 'Subscriptions expiring within the next 7 days', count: 1, color: 'amber' },
            { icon: '📊', title: 'No data in 5 days', desc: 'Clients who haven\'t logged macros or body data', count: 1, color: 'blue' },
          ].map(rule => (
            <div key={rule.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <span className="text-2xl">{rule.icon}</span>
              <p className="text-sm font-semibold text-gray-900 mt-2">{rule.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{rule.desc}</p>
              <p className={`text-sm font-bold mt-2 text-${rule.color}-600`}>{rule.count} flagged</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {['open', 'resolved', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(fu => (
            <div
              key={fu.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                fu.status === 'resolved' ? 'border-gray-100 opacity-60' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    fu.severity === 'high' ? 'bg-red-50 text-red-500' :
                    fu.severity === 'medium' ? 'bg-amber-50 text-amber-500' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{fu.client}</p>
                      <Badge variant={fu.severity === 'high' ? 'red' : fu.severity === 'medium' ? 'yellow' : 'gray'}>
                        {fu.severity} priority
                      </Badge>
                      {fu.status === 'resolved' && <Badge variant="green">Resolved</Badge>}
                    </div>
                    <p className="text-sm text-gray-700">{fu.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Trainer: {fu.trainer} · Flagged {formatRelative(fu.flaggedAt)}
                    </p>
                  </div>
                </div>

                {fu.status === 'open' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => toast.success(`Opening chat with ${fu.client}`)}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toast.success(`Calling ${fu.client}`)}>
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </Button>
                    <Button size="sm" onClick={() => resolve(fu.id)}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-900">All clear!</p>
              <p className="text-sm text-gray-500">No follow-ups to show for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
