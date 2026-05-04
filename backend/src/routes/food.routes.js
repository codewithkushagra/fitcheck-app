import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.use(authenticate)

// Get food logs for a date
router.get('/logs', async (req, res) => {
  try {
    const { date } = req.query
    const logs = await prisma.foodLog.findMany({
      where: { userId: req.user.id, date: date || new Date().toISOString().split('T')[0] },
      orderBy: { loggedAt: 'asc' }
    })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add food log
router.post('/logs', async (req, res) => {
  try {
    const { date, foodName, servingSize, calories, proteinG, carbsG, fatG, isJunk } = req.body
    const log = await prisma.foodLog.create({
      data: {
        userId: req.user.id, date, foodName,
        servingSize: parseFloat(servingSize),
        calories: parseFloat(calories),
        proteinG: parseFloat(proteinG),
        carbsG: parseFloat(carbsG),
        fatG: parseFloat(fatG),
        isJunk: Boolean(isJunk),
      }
    })
    res.status(201).json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete food log
router.delete('/logs/:id', async (req, res) => {
  try {
    await prisma.foodLog.delete({ where: { id: req.params.id, userId: req.user.id } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
