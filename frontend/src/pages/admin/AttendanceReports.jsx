import { useState, useEffect, useCallback, useRef } from 'react'
import { QrCode, RefreshCw, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../../components/layout/Layout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import api from '../../api/axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

export default function AttendanceReports() {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(todayStr)
  const [records, setRecords] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  // QR state
  const [qrToken, setQrToken] = useState(null)
  const [qrLoading, setQrLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef(null)

  const loadAttendance = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get(`/attendance?date=${date}`),
      api.get('/gyms/clients'),
    ]).then(([a, c]) => {
      setRecords(a.data || [])
      setClients(c.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [date])

  useEffect(() => { loadAttendance() }, [loadAttendance])

  // Load today's QR on mount
  useEffect(() => {
    setQrLoading(true)
    api.get('/attendance/qr-today')
      .then(res => setQrToken(res.data))
      .catch(() => setQrToken(null))
      .finally(() => setQrLoading(false))
  }, [])

  const generateQR = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/attendance/qr-generate')
      setQrToken(res.data)
      setShowQR(true)
      toast.success('QR code generated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate QR')
    } finally {
      setGenerating(false)
    }
  }

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    const img = new Image()
    canvas.width = 400; canvas.height = 480
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 400, 480)
      ctx.drawImage(img, 40, 40, 320, 320)
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Scan to mark attendance', 200, 400)
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(format(new Date(), 'EEEE, MMMM d yyyy'), 200, 430)
      const link = document.createElement('a')
      link.download = `attendance-qr-${todayStr}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))
  }

  const scanUrl = qrToken ? `${APP_URL}/scan/${qrToken.token}` : ''
  const present = records.filter(r => r.status === 'present').length
  const absent = records.filter(r => r.status === 'absent').length
  const recordMap = {}
  records.forEach(r => { recordMap[r.clientUserId] = r })

  const qrExpired = qrToken && new Date() > new Date(qrToken.expiresAt)
  const isToday = date === todayStr

  return (
    <Layout title="Attendance">
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy')}
            </p>
          </div>
          <input
            type="date" max={todayStr} value={date}
            onChange={e => setDate(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* QR Code card — only show for today */}
        {isToday && (
          <div className={`rounded-2xl border shadow-sm p-4 ${qrToken && !qrExpired ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${qrToken && !qrExpired ? 'bg-teal-100' : 'bg-gray-100'}`}>
                  <QrCode className={`w-5 h-5 ${qrToken && !qrExpired ? 'text-teal-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">QR Attendance</p>
                  <p className="text-xs text-gray-500">
                    {qrLoading ? 'Loading…'
                      : qrToken && !qrExpired ? 'Active — valid until midnight'
                      : qrExpired ? 'Expired — regenerate for today'
                      : 'No QR for today yet'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {qrToken && !qrExpired && (
                  <Button size="sm" variant="secondary" onClick={() => setShowQR(true)}>
                    <QrCode className="w-4 h-4 mr-1" /> View
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={generateQR}
                  loading={generating}
                  variant={qrToken && !qrExpired ? 'secondary' : 'primary'}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {qrToken && !qrExpired ? 'Refresh' : 'Generate QR'}
                </Button>
              </div>
            </div>

            {/* Mini QR preview when active */}
            {qrToken && !qrExpired && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-white rounded-xl border border-teal-100">
                <div className="shrink-0">
                  <QRCodeSVG value={scanUrl} size={56} level="M" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">Share this QR with members</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">They scan it to mark themselves present — no trainer needed</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                    <p className="text-[10px] text-emerald-600 font-medium">Works for clients & trainers</p>
                  </div>
                </div>
                <button onClick={() => setShowQR(true)} className="text-teal-600 text-xs font-semibold shrink-0">
                  Full size →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Present', value: present, color: 'text-emerald-600' },
            { label: 'Absent', value: absent, color: 'text-red-500' },
            { label: 'Total', value: clients.length, color: 'text-gray-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">All Members</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No clients yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {clients.map(c => {
                const record = recordMap[c.id]
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={c.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      {c.trainer && (
                        <p className="text-xs text-gray-400 truncate">Trainer: {c.trainer.name}</p>
                      )}
                    </div>
                    <Badge variant={
                      record?.status === 'present' ? 'green' :
                      record?.status === 'absent' ? 'red' : 'gray'
                    }>
                      {record?.status === 'present' ? '✓ Present' :
                       record?.status === 'absent' ? '✗ Absent' : 'Not marked'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full-size QR modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="Today's Attendance QR">
        <div className="flex flex-col items-center gap-4">
          <div className="p-2 bg-gray-50 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-3">
              Display this on screen or print it. Members scan to mark attendance.
            </p>
            <div
              ref={qrRef}
              className="inline-flex items-center justify-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              {scanUrl && (
                <QRCodeSVG
                  value={scanUrl}
                  size={220}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: '/icon-192.png',
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-3">
              {format(new Date(), 'EEEE, MMMM d yyyy')}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs text-amber-600 font-medium">Expires at midnight</p>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Button className="w-full" onClick={downloadQR}>
              <Download className="w-4 h-4 mr-2" /> Download QR as PNG
            </Button>
            <Button className="w-full" variant="secondary" onClick={generateQR} loading={generating}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh (invalidates old QR)
            </Button>
          </div>

          <div className="w-full bg-blue-50 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Clients and trainers scan this with their phone camera. They must be logged into the app for it to work.
            </p>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
