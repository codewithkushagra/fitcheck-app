import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()
router.use(authenticate)

router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.bodyLog.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'asc' }
    })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logs', async (req, res) => {
  try {
    const { date, weightKg, waistCm, chestCm, armsCm, photoUrl } = req.body
    const log = await prisma.bodyLog.create({
      data: {
        userId: req.user.id, date,
        weightKg: parseFloat(weightKg),
        waistCm: waistCm ? parseFloat(waistCm) : null,
        chestCm: chestCm ? parseFloat(chestCm) : null,
        armsCm: armsCm ? parseFloat(armsCm) : null,
        photoUrl: photoUrl || null,
      }
    })
    res.status(201).json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
