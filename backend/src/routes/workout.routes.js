import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()
router.use(authenticate)

router.get('/plans', async (req, res) => {
  try {
    const where = req.user.role === 'trainer'
      ? { createdBy: req.user.id }
      : { gymId: req.user.gymId }
    const plans = await prisma.workoutPlan.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(plans)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/plans', requireRole('trainer', 'gym_admin'), async (req, res) => {
  try {
    const { name, description, days } = req.body
    const plan = await prisma.workoutPlan.create({
      data: { name, description, days: days || [], createdBy: req.user.id, gymId: req.user.gymId }
    })
    res.status(201).json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/assign', requireRole('trainer', 'gym_admin'), async (req, res) => {
  try {
    const { clientUserId, planId } = req.body
    const assignment = await prisma.clientPlanAssignment.create({
      data: { clientUserId, planId, assignedBy: req.user.id }
    })
    res.status(201).json(assignment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/my-plan', async (req, res) => {
  try {
    const assignment = await prisma.clientPlanAssignment.findFirst({
      where: { clientUserId: req.user.id },
      orderBy: { assignedAt: 'desc' },
      include: { plan: true }
    })
    res.json(assignment?.plan || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
