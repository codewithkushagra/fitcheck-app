import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()
router.use(authenticate)

router.get('/logs', async (req, res) => {
  try {
    const { limit = 30 } = req.query
    const logs = await prisma.stepLog.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      take: parseInt(limit)
    })
    res.json(logs.reverse())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logs', async (req, res) => {
  try {
    const { date, stepCount } = req.body
    const log = await prisma.stepLog.upsert({
      where: { userId_date: { userId: req.user.id, date } },
      update: { stepCount: parseInt(stepCount) },
      create: { userId: req.user.id, date, stepCount: parseInt(stepCount) }
    })
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
