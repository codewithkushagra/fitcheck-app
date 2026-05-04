import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { format } from 'date-fns'

const prisma = new PrismaClient()
const router = Router()

router.use(authenticate)

// ─── Attendance records ───────────────────────────────────────────────────────

// Get attendance records (trainer sees their clients, client sees own, admin sees gym)
router.get('/', async (req, res) => {
  try {
    const { date, clientId } = req.query
    const where = {}
    if (req.user.role === 'trainer') where.trainerId = req.user.id
    else if (req.user.role === 'end_user') where.clientUserId = req.user.id
    else if (req.user.role === 'gym_admin') where.gymId = req.user.gymId
    if (date) where.date = date
    if (clientId) where.clientUserId = clientId

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { client: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' }
    })
    res.json(records)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Mark attendance (trainer / admin manual entry)
router.post('/', requireRole('trainer', 'gym_admin'), async (req, res) => {
  try {
    const { clientUserId, date, status } = req.body
    const record = await prisma.attendanceRecord.upsert({
      where: { clientUserId_date: { clientUserId, date } },
      update: { status, editedAt: new Date() },
      create: { clientUserId, date, status, trainerId: req.user.id, gymId: req.user.gymId }
    })
    res.json(record)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Bulk mark attendance
router.post('/bulk', requireRole('trainer', 'gym_admin'), async (req, res) => {
  try {
    const { records, date } = req.body
    const results = await Promise.all(
      records.map(r => prisma.attendanceRecord.upsert({
        where: { clientUserId_date: { clientUserId: r.clientUserId, date } },
        update: { status: r.status, editedAt: new Date() },
        create: { clientUserId: r.clientUserId, date, status: r.status, trainerId: req.user.id, gymId: req.user.gymId }
      }))
    )
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── QR Code attendance ───────────────────────────────────────────────────────

// Generate (or refresh) a QR token for today — admin only
router.post('/qr-generate', requireRole('gym_admin'), async (req, res) => {
  try {
    const gymId = req.user.gymId
    const today = format(new Date(), 'yyyy-MM-dd')

    // Expire at midnight tonight
    const expiresAt = new Date()
    expiresAt.setHours(23, 59, 59, 999)

    const token = randomBytes(24).toString('hex')

    // Delete any existing token for this gym today
    await prisma.attendanceQRToken.deleteMany({ where: { gymId, date: today } })

    const qr = await prisma.attendanceQRToken.create({
      data: { gymId, createdBy: req.user.id, token, date: today, expiresAt }
    })
    res.status(201).json(qr)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get today's active QR token for a gym — admin only
router.get('/qr-today', requireRole('gym_admin'), async (req, res) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd')
    const qr = await prisma.attendanceQRToken.findFirst({
      where: { gymId: req.user.gymId, date: today, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(qr || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Scan a QR token — any authenticated user (client or trainer)
router.post('/qr-scan/:token', async (req, res) => {
  try {
    const qr = await prisma.attendanceQRToken.findUnique({
      where: { token: req.params.token },
      include: { gym: { select: { id: true, name: true } } }
    })

    if (!qr) return res.status(404).json({ error: 'Invalid QR code' })
    if (new Date() > qr.expiresAt) return res.status(410).json({ error: 'This QR code has expired. Ask your admin to regenerate.' })

    // User must belong to the gym whose QR this is
    if (req.user.gymId !== qr.gymId) {
      return res.status(403).json({ error: 'This QR code is for a different gym' })
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    if (qr.date !== today) return res.status(410).json({ error: 'This QR code is for a different date' })

    // For clients: mark them as present
    // For trainers: mark all their assigned clients as present (or just record trainer check-in)
    if (req.user.role === 'end_user') {
      // Need a trainerId — use assigned trainer or gym admin as fallback
      let trainerId = req.user.trainerId
      if (!trainerId) {
        const admin = await prisma.user.findFirst({
          where: { gymId: qr.gymId, role: 'gym_admin' },
          select: { id: true }
        })
        trainerId = admin?.id || req.user.id
      }

      const record = await prisma.attendanceRecord.upsert({
        where: { clientUserId_date: { clientUserId: req.user.id, date: today } },
        update: { status: 'present', editedAt: new Date() },
        create: { clientUserId: req.user.id, date: today, status: 'present', trainerId, gymId: qr.gymId }
      })
      return res.json({ message: 'Attendance marked! See you at the gym 💪', record, gym: qr.gym })
    }

    if (req.user.role === 'trainer') {
      // Trainers check themselves in — record as a special note (reuse clientUserId = trainerId)
      // We mark every client of this trainer as present who hasn't been marked yet
      const myClients = await prisma.user.findMany({
        where: { trainerId: req.user.id, gymId: qr.gymId },
        select: { id: true }
      })
      const ops = myClients.map(c =>
        prisma.attendanceRecord.upsert({
          where: { clientUserId_date: { clientUserId: c.id, date: today } },
          update: {}, // don't overwrite if already explicitly marked
          create: { clientUserId: c.id, date: today, status: 'present', trainerId: req.user.id, gymId: qr.gymId }
        })
      )
      await Promise.all(ops)
      return res.json({ message: `Check-in confirmed! ${myClients.length} client(s) marked present.`, gym: qr.gym })
    }

    res.json({ message: 'Check-in recorded', gym: qr.gym })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
