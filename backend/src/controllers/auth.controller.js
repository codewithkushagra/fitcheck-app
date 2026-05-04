import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

export const registerGym = async (req, res) => {
  try {
    const { gymName, city, address, phone, ownerName, email, password } = req.body

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email already in use' })

    const passwordHash = await bcrypt.hash(password, 12)
    const gymCode = uuidv4().slice(0, 8).toUpperCase()

    const result = await prisma.$transaction(async (tx) => {
      const gym = await tx.gym.create({
        data: { name: gymName, city, address, phone, ownerName, gymCode }
      })
      const user = await tx.user.create({
        data: { gymId: gym.id, role: 'gym_admin', name: ownerName, email, passwordHash }
      })
      await tx.subscription.create({
        data: {
          userId: user.id, planType: 'premium', status: 'active',
          startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
      return { gym, user }
    })

    const token = signToken(result.user.id)
    res.status(201).json({
      token,
      user: {
        id: result.user.id, name: result.user.name, email: result.user.email,
        role: result.user.role, gym: { id: result.gym.id, name: result.gym.name, code: result.gym.gymCode }
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        gym: { select: { id: true, name: true, city: true } },
        subscription: { select: { planType: true, status: true } },
        trainerProfile: true,
        clientProfile: true,
      }
    })

    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user.id)
    const { passwordHash, ...safeUser } = user
    res.json({ token, user: { ...safeUser, subscription: user.subscription?.planType || 'core' } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const registerClient = async (req, res) => {
  try {
    const { name, email, password, gymCode, age, gender, heightCm, weightKg, goal, medicalConditions } = req.body

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email already in use' })

    let gym = null
    if (gymCode) {
      gym = await prisma.gym.findUnique({ where: { gymCode } })
      if (!gym) return res.status(400).json({ error: 'Invalid gym code' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { gymId: gym?.id, role: 'end_user', name, email, passwordHash }
      })
      await tx.clientProfile.create({
        data: {
          userId: user.id, age: parseInt(age), gender,
          heightCm: parseFloat(heightCm), weightKg: parseFloat(weightKg),
          goal, medicalConditions: medicalConditions || [],
        }
      })
      await tx.subscription.create({
        data: {
          userId: user.id, planType: 'core', status: 'active',
          startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
      return user
    })

    const token = signToken(result.id)
    res.status(201).json({
      token,
      user: { id: result.id, name: result.name, email: result.email, role: result.role, gym }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const me = async (req, res) => {
  res.json({ user: req.user })
}
