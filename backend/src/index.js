import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'

import authRoutes from './routes/auth.routes.js'
import gymRoutes from './routes/gym.routes.js'
import trainerRoutes from './routes/trainer.routes.js'
import clientRoutes from './routes/client.routes.js'
import foodRoutes from './routes/food.routes.js'
import bodyRoutes from './routes/body.routes.js'
import stepsRoutes from './routes/steps.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import workoutRoutes from './routes/workout.routes.js'
import analysisRoutes from './routes/analysis.routes.js'
import chatRoutes from './routes/chat.routes.js'

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 4000

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('join_room', (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined room`)
  })

  socket.on('send_message', ({ recipientId, message }) => {
    io.to(recipientId).emit('receive_message', message)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Make io accessible in routes
app.set('io', io)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/gyms', gymRoutes)
app.use('/api/trainers', trainerRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/food', foodRoutes)
app.use('/api/body', bodyRoutes)
app.use('/api/steps', stepsRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

httpServer.listen(PORT, () => {
  console.log(`🚀 FitDeck API running on http://localhost:${PORT}`)
})
