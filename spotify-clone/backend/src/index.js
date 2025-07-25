import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectionDB from './lib/db.js'
import { clerkMiddleware } from '@clerk/express'
import fileUpload from 'express-fileupload'
import path from 'path'

// routes
import usersRoutes from './routes/user.route.js'
import songsRoutes from './routes/song.route.js'
import albumRoutes from './routes/album.route.js'
import adminRoutes from './routes/admin.route.js'
import authRoutes from './routes/auth.route.js'
import statusRoutes from './routes/status.route.js'
import { createServer } from 'http'
import { initializeSocket } from './lib/socket.js'

const app = express()
const __dirname = path.resolve()

const server = createServer(app)
initializeSocket(server)
dotenv.config()

app.use(express.json())

let ORIGIN = process.env.ORIGIN
app.use(cors({
    origin: ORIGIN,
    credentials: true
}))

app.use(clerkMiddleware())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp'),
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }
}))

// routes
app.use('/api/users', usersRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/songs', songsRoutes)
app.use('/api/albums', albumRoutes)
app.use('/api/admins', adminRoutes)
app.use("/api/status", statusRoutes)

// error handler middleware (should be after routes)
app.use((err, req, res, next) => {
    res.status(502).json({
        message: process.env.STATUS === 'DEVELOPMENT' ? err.message : 'Some error! please try later'
    })
})

const PORT = process.env.PORT

// Database connection
connectionDB()

server.listen(PORT, () => {
    console.log(PORT)
})
