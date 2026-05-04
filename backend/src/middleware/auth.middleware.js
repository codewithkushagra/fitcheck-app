import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, role: true, name: true, email: true,
        gymId: true, trainerId: true, profilePhotoUrl: true,
        subscription: { select: { planType: true, status: true, endDate: true } },
      }
    })

    if (!user) return res.status(401).json({ error: 'User not found' })

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }
  next()
}

export const requirePremium = (req, res, next) => {
  const sub = req.user?.subscription
  if (!sub || sub.planType !== 'premium' || sub.status !== 'active') {
    return res.status(403).json({ error: 'Premium subscription required' })
  }
  next()
}
