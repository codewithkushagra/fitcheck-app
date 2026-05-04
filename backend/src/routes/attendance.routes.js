import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.use(authenticate)

// Get attendance for trainer's clients
router.get('/', async (req, res) => {
  try {
    const { date, clientId } = req.query
    const where = {}
    if (req.user.role === 'trainer') where.trainerId = req.user.id
    else if (req.user.role === 'end_user') where.clientUserId = req.user.id
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

// Mark attendance
router.post('/', requireRole('trainer', 'gym_admin'), async (req, res) => {
  try {
    const { clientUserId, date, status } = req.body
    const record = await prisma.attendanceRecord.upsert({
      where: { clientUserId_date: { clientUserId, date } },
      update: { status, editedAt: new Date() },
      create: {
        clientUserId, date, status,
        trainerId: req.user.id,
        gymId: req.user.gymId,
      }
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

export default router
