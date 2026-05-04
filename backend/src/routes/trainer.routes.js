import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const router = Router()

// All trainer routes require auth
router.use(authenticate)

// ─── Invite endpoints (any authenticated user) ──────────────────────────────

// Get pending trainer invites for the currently logged-in user's email
router.get('/invites', async (req, res) => {
  try {
    const invites = await prisma.trainerInvite.findMany({
      where: { email: req.user.email, status: 'pending' },
      include: {
        gym: { select: { id: true, name: true, city: true } },
        inviter: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(invites)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Accept a trainer invite → user becomes a trainer in that gym
router.post('/invites/:id/accept', async (req, res) => {
  try {
    const invite = await prisma.trainerInvite.findFirst({
      where: { id: req.params.id, email: req.user.email, status: 'pending' }
    })
    if (!invite) return res.status(404).json({ error: 'Invite not found or already handled' })

    await prisma.$transaction([
      prisma.trainerInvite.update({
        where: { id: invite.id },
        data: { status: 'accepted' }
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { role: 'trainer', gymId: invite.gymId }
      }),
      prisma.trainerProfile.upsert({
        where: { userId: req.user.id },
        update: {},
        create: { userId: req.user.id }
      })
    ])

    // Return the updated user so the frontend can refresh auth state
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, role: true, name: true, email: true,
        gymId: true, trainerId: true, profilePhotoUrl: true,
        subscription: { select: { planType: true, status: true, endDate: true } }
      }
    })
    res.json({ message: 'Invite accepted. Welcome aboard!', user: updatedUser })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Decline a trainer invite
router.post('/invites/:id/decline', async (req, res) => {
  try {
    const updated = await prisma.trainerInvite.updateMany({
      where: { id: req.params.id, email: req.user.email, status: 'pending' },
      data: { status: 'declined' }
    })
    if (updated.count === 0) return res.status(404).json({ error: 'Invite not found' })
    res.json({ message: 'Invite declined' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Trainer + Admin only ────────────────────────────────────────────────────

router.use(requireRole('trainer', 'gym_admin'))

// Get all clients assigned to this trainer
router.get('/my-clients', async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { trainerId: req.user.id, role: 'end_user' },
      include: {
        clientProfile: true,
        subscription: { select: { planType: true, status: true } }
      }
    })
    res.json(clients)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all clients in the trainer's gym (unassigned or assigned to anyone)
router.get('/gym-clients', async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { gymId: req.user.gymId, role: 'end_user' },
      include: {
        clientProfile: true,
        subscription: { select: { planType: true, status: true } },
        trainer: { select: { id: true, name: true } }
      },
      orderBy: { name: 'asc' }
    })
    res.json(clients)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Assign a gym client to this trainer
router.post('/assign-client', async (req, res) => {
  try {
    const { clientId } = req.body
    const client = await prisma.user.findFirst({
      where: { id: clientId, gymId: req.user.gymId, role: 'end_user' }
    })
    if (!client) return res.status(404).json({ error: 'Client not found in your gym' })
    await prisma.user.update({ where: { id: clientId }, data: { trainerId: req.user.id } })
    res.json({ message: 'Client assigned successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Unassign a client from this trainer
router.delete('/client/:id/assign', async (req, res) => {
  try {
    const updated = await prisma.user.updateMany({
      where: { id: req.params.id, trainerId: req.user.id },
      data: { trainerId: null }
    })
    if (updated.count === 0) return res.status(404).json({ error: 'Client not found under your roster' })
    res.json({ message: 'Client removed from your roster' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get full client profile (for trainer view)
router.get('/client/:id', async (req, res) => {
  try {
    const client = await prisma.user.findFirst({
      where: { id: req.params.id, gymId: req.user.gymId },
      include: {
        clientProfile: true,
        subscription: true,
        bodyLogs: { orderBy: { date: 'asc' } },
        foodLogs: { orderBy: { loggedAt: 'desc' }, take: 30 },
        stepLogs: { orderBy: { date: 'desc' }, take: 14 },
        attendance: {
          where: { trainerId: req.user.id },
          orderBy: { date: 'desc' },
          take: 30
        },
        assignedPlans: {
          include: { plan: { select: { id: true, name: true, description: true } } },
          orderBy: { assignedAt: 'desc' }
        }
      }
    })
    if (!client) return res.status(404).json({ error: 'Client not found' })
    const { passwordHash, ...safe } = client
    res.json(safe)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Log a check-in / call note
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
