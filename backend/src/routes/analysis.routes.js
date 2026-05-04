import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'
import { format, subDays } from 'date-fns'

const prisma = new PrismaClient()
const router = Router()
router.use(authenticate)

router.get('/weekly', async (req, res) => {
  try {
    const userId = req.user.id
    const today = new Date()
    const weekStart = format(subDays(today, 7), 'yyyy-MM-dd')
    const weekEnd = format(today, 'yyyy-MM-dd')

    const [foodLogs, stepLogs, bodyLogs, attendanceLogs] = await Promise.all([
      prisma.foodLog.findMany({ where: { userId, date: { gte: weekStart } } }),
      prisma.stepLog.findMany({ where: { userId, date: { gte: weekStart } } }),
      prisma.bodyLog.findMany({ where: { userId, date: { gte: weekStart } } }),
      prisma.attendanceRecord.findMany({ where: { clientUserId: userId, date: { gte: weekStart } } }),
    ])

    // Generate insights
    const avgCalories = foodLogs.length
      ? Math.round(foodLogs.reduce((a, l) => a + l.calories, 0) / 7)
      : 0
    const avgSteps = stepLogs.length
      ? Math.round(stepLogs.reduce((a, l) => a + l.stepCount, 0) / stepLogs.length)
      : 0
    const presentDays = attendanceLogs.filter(a => a.status === 'present').length
    const weightChange = bodyLogs.length >= 2
      ? bodyLogs[bodyLogs.length - 1].weightKg - bodyLogs[0].weightKg
      : 0

    const insights = [
      {
        type: 'calories',
        title: avgCalories > 0 ? `Averaged ${avgCalories} kcal/day` : 'No food logged this week',
        detail: avgCalories > 0 ? 'Track daily to get better insights.' : 'Start logging your meals.',
        score: avgCalories > 0 ? 70 : 0,
        color: avgCalories > 0 ? 'green' : 'red',
      },
      {
        type: 'steps',
        title: `Averaged ${avgSteps.toLocaleString()} steps/day`,
        detail: avgSteps >= 10000 ? 'You hit your step goal every day!' : `You're ${10000 - avgSteps} steps short of your daily goal on average.`,
        score: Math.min(100, Math.round((avgSteps / 10000) * 100)),
        color: avgSteps >= 8000 ? 'green' : 'amber',
      },
      {
        type: 'attendance',
        title: `${presentDays}/7 gym days`,
        detail: presentDays >= 5 ? 'Excellent attendance this week.' : 'Try to attend at least 5 days next week.',
        score: Math.round((presentDays / 7) * 100),
        color: presentDays >= 5 ? 'green' : presentDays >= 3 ? 'amber' : 'red',
      },
      {
        type: 'body',
        title: weightChange !== 0 ? `Weight: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg this week` : 'No weigh-in logged',
        detail: weightChange < 0 ? 'Great progress! Keep up the deficit.' : 'Log your weight regularly to track progress.',
        score: weightChange < 0 ? 90 : 50,
        color: weightChange < 0 ? 'green' : 'amber',
      },
    ]

    const existing = await prisma.weeklyAnalysis.findFirst({
      where: { userId, weekStartDate: weekStart },
      orderBy: { generatedAt: 'desc' }
    })

    if (!existing) {
      await prisma.weeklyAnalysis.create({
        data: { userId, weekStartDate: weekStart, insights }
      })
    }

    res.json({ weekStart, weekEnd, insights: existing?.insights || insights })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
