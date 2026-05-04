import { useState } from 'react'
import { CreditCard, Download, Zap, TrendingUp } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { mockClients } from '../../api/mockData'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

const invoices = [
  { id: 'inv_1', date: '2026-05-01', amount: 87500, status: 'paid', description: 'May 2026 — Pro Plan + 18 Premium clients' },
  { id: 'inv_2', date: '2026-04-01', amount: 82000, status: 'paid', description: 'April 2026 — Pro Plan + 16 Premium clients' },
  { id: 'inv_3', date: '2026-03-01', amount: 79500, status: 'paid', description: 'March 2026 — Pro Plan + 15 Premium clients' },
]

export default function Billing() {
  const [upgrading, setUpgrading] = useState(null)

  const premium = mockClients.filter(c => c.subscription === 'premium')
  const core = mockClients.filter(c => c.subscription === 'core')

  const upgrade = async (id) => {
    setUpgrading(id)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Client upgraded to Premium!')
    setUpgrading(null)
  }

  return (
    <Layout title="Billing & Subscriptions">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-title">Billing & Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage gym plan and client subscriptions</p>
        </div>

        {/* Gym plan */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-200 text-sm font-medium">Current Plan</p>
              <h2 className="text-2xl font-bold mt-1">Pro Plan</h2>
              <p className="text-teal-200 mt-1">Unlimited trainers · Unlimited clients · All premium features</p>
              <div className="flex items-center gap-4 mt-4">
                <div><p className="text-xl font-bold">₹9,999</p><p className="text-teal-200 text-xs">per month</p></div>
                <div><p className="text-xl font-bold">May 31</p><p className="text-teal-200 text-xs">next billing</p></div>
                <div><p className="text-xl font-bold">89%</p><p className="text-teal-200 text-xs">renewal rate</p></div>
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors">
              Manage Plan
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors">
              Update Payment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client subscriptions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Client Subscriptions</h2>
              <div className="flex gap-2">
                <Badge variant="teal">⚡ {premium.length} Premium</Badge>
                <Badge variant="gray">{core.length} Core</Badge>
              </div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {mockClients.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.trainer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.subscription === 'premium' ? 'teal' : 'gray'}>
                      {c.subscription === 'premium' ? '⚡ Premium' : 'Core'}
                    </Badge>
                    {c.subscription === 'core' && (
                      <Button
                        size="xs"
                        loading={upgrading === c.id}
                        onClick={() => upgrade(c.id)}
                      >
                        <Zap className="w-3 h-3" />
                        Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Invoice History</h2>
              <Button variant="secondary" size="xs">
                <Download className="w-3.5 h-3.5" />
                Download all
              </Button>
            </div>
            <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{inv.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(inv.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="green">{inv.status}</Badge>
                    <Button variant="ghost" size="xs" onClick={() => toast.success('Invoice downloaded')}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
              <div className="flex items-center gap-2 text-teal-700">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm font-semibold">Revenue is up 12% vs last month</p>
              </div>
              <p className="text-xs text-teal-600 mt-1">
                ₹87,500 billed in May. Add 5 more premium clients to cross ₹1L/month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
