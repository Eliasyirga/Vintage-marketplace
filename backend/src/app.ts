import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()

app.use(express.json())
app.use(helmet())
app.use(morgan('dev'))
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Vintage Marketplace API is running',
  })
})

export default app
