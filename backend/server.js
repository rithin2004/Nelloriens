import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

// Routes
import newsRoutes          from './src/modules/news/news.routes.js'
import jobsRoutes          from './src/modules/jobs/jobs.routes.js'
import resultsRoutes       from './src/modules/results/results.routes.js'
import sportsRoutes        from './src/modules/sports/sports.routes.js'
import foodsRoutes         from './src/modules/foods/foods.routes.js'
import historyRoutes       from './src/modules/history/history.routes.js'
import staysRoutes         from './src/modules/stays/stays.routes.js'
import eventsRoutes        from './src/modules/events/events.routes.js'
import moviesRoutes        from './src/modules/movies/movies.routes.js'
import theatresRoutes      from './src/modules/movies/theatres.routes.js'
import transportRoutes     from './src/modules/transport/transport.routes.js'
import offersRoutes        from './src/modules/offers/offers.routes.js'
import tourismRoutes       from './src/modules/tourism/tourism.routes.js'
import contactRoutes       from './src/modules/contact/contact.routes.js'
import updatesRoutes       from './src/modules/updates/updates.routes.js'
import adsRoutes           from './src/modules/ads/ads.routes.js'
import sponsorshipsRoutes  from './src/modules/sponsorships/sponsorships.routes.js'
import instagramRoutes     from './src/modules/instagram/instagram.routes.js'
import dashboardRoutes     from './src/modules/dashboard/dashboard.routes.js'
import searchRoutes        from './src/modules/search/search.routes.js'
import uploadRoutes        from './src/modules/upload/upload.routes.js'
import settingsRoutes      from './src/modules/settings/settings.routes.js'

const app = express()

// ── Trust proxy (behind nginx / Render / Railway etc) ─────────────────────
app.set('trust proxy', 1)

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Logger ────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Global rate limit ─────────────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later.' },
}))

// ── Strict rate limit for auth-sensitive routes ───────────────────────────
const strictLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Rate limit exceeded.' },
})

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// ── API Routes ────────────────────────────────────────────────────────────
const BASE = '/api/v1'

app.use(`${BASE}/news`,         newsRoutes)
app.use(`${BASE}/jobs`,         jobsRoutes)
app.use(`${BASE}/results`,      resultsRoutes)
app.use(`${BASE}/sports`,       sportsRoutes)
app.use(`${BASE}/foods`,        foodsRoutes)
app.use(`${BASE}/history`,      historyRoutes)
app.use(`${BASE}/stays`,        staysRoutes)
app.use(`${BASE}/events`,       eventsRoutes)
app.use(`${BASE}/movies`,       moviesRoutes)
app.use(`${BASE}/theatres`,     theatresRoutes)
app.use(`${BASE}/transport`,    transportRoutes)
app.use(`${BASE}/offers`,       offersRoutes)
app.use(`${BASE}/tourism`,      tourismRoutes)
app.use(`${BASE}/contact`,      contactRoutes)
app.use(`${BASE}/updates`,      updatesRoutes)
app.use(`${BASE}/ads`,          adsRoutes)
app.use(`${BASE}/sponsorships`, sponsorshipsRoutes)
app.use(`${BASE}/instagram`,    instagramRoutes)
app.use(`${BASE}/dashboard`,    dashboardRoutes)
app.use(`${BASE}/search`,       searchRoutes)
app.use(`${BASE}/upload`,       strictLimit, uploadRoutes)
app.use(`${BASE}/settings`,     settingsRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
})

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✓ Nelloriens API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})
