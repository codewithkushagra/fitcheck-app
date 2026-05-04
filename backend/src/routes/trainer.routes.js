import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()
router.use(authenticate, requireRole('trainer', 'gym_admin'))

router.get('/my-clients', async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { trainerId: req.user.id, role: 'end_user' },
      include: {
        clientProfile: true,
        subscription: { select: { planType: true, status: true } },
      }
    })
    res.json(clients)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/client/:id', async (req, res) => {
  try {
    const client = await prisma.user.findFirst({
      where: { id: req.params.id, trainerId: req.user.id },
      include: {
        clientProfile: true,
        subscription: true,
        bodyLogs: { orderBy: { date: 'asc' } },
        foodLogs: { orderBy: { loggedAt: 'desc' }, take: 30 },
        stepLogs: { orderBy: { date: 'desc' }, take: 30 },
        attendance: { orderBy: { date: 'desc' }, take: 30 },
      }
    })
    if (!client) return res.status(404).json({ error: 'Client not found' })
    res.json(client)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/check-in', async (req, res) => {
  try {
    const { clientUserId, callType, topic, outcome, durationMinutes } = req.body
    const log = await prisma.callLog.create({
      data: { trainerUserId: req.user.id, clientUserId, callType, topic, outcome, durationMinutes }
    })
    res.status(201).json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
