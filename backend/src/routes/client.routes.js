import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()
router.use(authenticate)

router.get('/profile', async (req, res) => {
  try {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: req.user.id }
    })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/profile', async (req, res) => {
  try {
    const { age, gender, heightCm, weightKg, goal, medicalConditions } = req.body
    const profile = await prisma.clientProfile.upsert({
      where: { userId: req.user.id },
      update: { age, gender, heightCm, weightKg, goal, medicalConditions },
      create: { userId: req.user.id, age, gender, heightCm, weightKg, goal, medicalConditions }
    })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get the trainer assigned to this client
router.get('/my-trainer', async (req, res) => {
  try {
    if (!req.user.trainerId) return res.json(null)
    const trainer = await prisma.user.findUnique({
      where: { id: req.user.trainerId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhotoUrl: true,
        trainerProfile: { select: { specialisation: true, bio: true } }
      }
    })
    res.json(trainer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
