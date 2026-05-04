import { Router } from 'express'
import { authenticate, requirePremium } from '../middleware/auth.middleware.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()
router.use(authenticate)

router.get('/messages/:userId', async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderUserId: req.user.id, recipientUserId: req.params.userId },
          { senderUserId: req.params.userId, recipientUserId: req.user.id },
        ]
      },
      orderBy: { sentAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, profilePhotoUrl: true } }
      }
    })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/messages', requirePremium, async (req, res) => {
  try {
    const { recipientUserId, content, mediaUrl } = req.body
    const message = await prisma.chatMessage.create({
      data: { senderUserId: req.user.id, recipientUserId, content, mediaUrl }
    })

    // Emit via socket.io
    const io = req.app.get('io')
    io.to(recipientUserId).emit('receive_message', message)

    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/messages/:id/read', async (req, res) => {
  try {
    await prisma.chatMessage.update({
      where: { id: req.params.id, recipientUserId: req.user.id },
      data: { readAt: new Date() }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
