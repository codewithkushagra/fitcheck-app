import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.use(authenticate)

// Get gym dashboard stats
router.get('/stats', requireRole('gym_admin'), async (req, res) => {
  try {
    const gymId = req.user.gymId
    const [totalClients, trainers, todayAttendance] = await Promise.all([
      prisma.user.count({ where: { gymId, role: 'end_user' } }),
      prisma.user.count({ where: { gymId, role: 'trainer' } }),
      prisma.attendanceRecord.count({
        where: { client: { gymId }, date: new Date().toISOString().split('T')[0], status: 'present' }
      }),
    ])
    res.json({ totalClients, trainers, todayAttendance })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Invite trainer
router.post('/invite-trainer', requireRole('gym_admin'), async (req, res) => {
  try {
    const { email } = req.body
    // In production: send email with invite link
    res.json({ message: `Invite sent to ${email}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all clients for a gym
router.get('/clients', requireRole('gym_admin'), async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { gymId: req.user.gymId, role: 'end_user' },
      include: {
        clientProfile: true,
        subscription: true,
        trainer: { select: { id: true, name: true } }  // self-referential via "ClientTrainer" relation
      }
    })
    res.json(clients)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all trainers
router.get('/trainers', requireRole('gym_admin'), async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { gymId: req.user.gymId, role: 'trainer' },
      include: {
        trainerProfile: true,
        _count: { select: { clients: true } }
      }
    })
    res.json(trainers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
