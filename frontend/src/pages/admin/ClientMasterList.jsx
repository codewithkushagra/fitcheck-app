import { useState } from 'react'
import { Search, Filter, Download, ArrowUpDown } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { mockClients, mockTrainers } from '../../api/mockData'
import { formatDate, goalLabel, subscriptionLabel } from '../../utils/format'
import toast from 'react-hot-toast'

export default function ClientMasterList() {
  const [search, setSearch] = useState('')
  const [filterTrainer, setFilterTrainer] = useState('all')
  const [filterSub, setFilterSub] = useState('all')

  const filtered = mockClients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchTrainer = filterTrainer === 'all' || c.trainerId === filterTrainer
    const matchSub = filterSub === 'all' || c.subscription === filterSub
    return matchSearch && matchTrainer && matchSub
  })

  const handleExport = () => {
    const csv = [
      'Name,Email,Trainer,Last Visit,Streak,Subscription,Goal',
      ...filtered.map(c => `${c.name},${c.email},${c.trainer},${c.lastVisit},${c.attendanceStreak},${c.subscription},${c.goal}`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fitdeck-clients.csv'
    a.click()
    toast.success('CSV exported')
  }

  return (
    <Layout title="All Clients">
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">All Clients</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {mockClients.length} clients</p>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={Search}
            />
          </div>
          <div className="w-48">
            <Select
              value={filterTrainer}
              onChange={e => setFilterTrainer(e.target.value)}
              options={[
                { value: 'all', label: 'All trainers' },
                ...mockTrainers.map(t => ({ value: t.id, label: t.name }))
              ]}
            />
          </div>
          <div className="w-40">
            <Select
              value={filterSub}
              onChange={e => setFilterSub(e.target.value)}
              options={[
                { value: 'all', label: 'All plans' },
                { value: 'premium', label: 'Premium' },
                { value: 'core', label: 'Core' },
              ]}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 table-header">Client</th>
                  <th className="text-left px-5 py-4 table-header hidden md:table-cell">Trainer</th>
                  <th className="text-left px-5 py-4 table-header hidden lg:table-cell">Last Visit</th>
                  <th className="text-left px-5 py-4 table-header hidden lg:table-cell">Streak</th>
                  <th className="text-left px-5 py-4 table-header">Goal</th>
                  <th className="text-left px-5 py-4 table-header">Plan</th>
                  <th className="text-left px-5 py-4 table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-gray-700">{c.trainer}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-sm text-gray-700">{formatDate(c.lastVisit, 'MMM d')}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{c.attendanceStreak}</span>
                        {c.attendanceStreak >= 7 && <span className="text-xs">🔥</span>}
                        <span className="text-xs text-gray-500">days</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.goal === 'fat_loss' ? 'orange' : c.goal === 'muscle_gain' ? 'blue' : 'gray'}>
                        {goalLabel[c.goal]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.subscription === 'premium' ? 'teal' : 'gray'}>
                        {c.subscription === 'premium' ? '⚡ Premium' : 'Core'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="xs">Profile</Button>
                        <Button variant="ghost" size="xs">Reassign</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No clients match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
