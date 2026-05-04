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

export default router
