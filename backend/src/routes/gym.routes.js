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

// Invite trainer (creates a real in-app invite)
router.post('/invite-trainer', requireRole('gym_admin'), async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const gymId = req.user.gymId

    // Already a trainer in this gym?
    const existingTrainer = await prisma.user.findFirst({
      where: { email, gymId, role: 'trainer' }
    })
    if (existingTrainer) return res.status(400).json({ error: 'This person is already a trainer in your gym' })

    // Already a pending invite?
    const existingInvite = await prisma.trainerInvite.findFirst({
      where: { email, gymId, status: 'pending' }
    })
    if (existingInvite) return res.status(400).json({ error: 'A pending invite already exists for this email' })

    const invite = await prisma.trainerInvite.create({
      data: { gymId, invitedBy: req.user.id, email }
    })
    res.status(201).json({ message: `Invite sent to ${email}`, invite })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all trainer invites for this gym (admin view)
router.get('/trainer-invites', requireRole('gym_admin'), async (req, res) => {
  try {
    const invites = await prisma.trainerInvite.findMany({
      where: { gymId: req.user.gymId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(invites)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete / revoke a pending invite
router.delete('/trainer-invites/:id', requireRole('gym_admin'), async (req, res) => {
  try {
    await prisma.trainerInvite.deleteMany({
      where: { id: req.params.id, gymId: req.user.gymId, status: 'pending' }
    })
    res.json({ message: 'Invite revoked' })
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
