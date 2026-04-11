import 'dotenv/config'
import express   from 'express'
import helmet    from 'helmet'
import cors      from 'cors'
import morgan    from 'morgan'
import rateLimit from 'express-rate-limit'
import { createRequire } from 'module'
const swaggerUi = createRequire(import.meta.url)('swagger-ui-express')

import { swaggerSpec, swaggerUiOptions } from './src/config/swagger.js'

// Routes
import newsRoutes         from './src/modules/news/news.routes.js'
import jobsRoutes         from './src/modules/jobs/jobs.routes.js'
import resultsRoutes      from './src/modules/results/results.routes.js'
import sportsRoutes       from './src/modules/sports/sports.routes.js'
import foodsRoutes        from './src/modules/foods/foods.routes.js'
import historyRoutes      from './src/modules/history/history.routes.js'
import staysRoutes        from './src/modules/stays/stays.routes.js'
import eventsRoutes       from './src/modules/events/events.routes.js'
import moviesRoutes       from './src/modules/movies/movies.routes.js'
import theatresRoutes     from './src/modules/movies/theatres.routes.js'
import transportRoutes    from './src/modules/transport/transport.routes.js'
import offersRoutes       from './src/modules/offers/offers.routes.js'
import tourismRoutes      from './src/modules/tourism/tourism.routes.js'
import updatesRoutes      from './src/modules/updates/updates.routes.js'
import adsRoutes          from './src/modules/ads/ads.routes.js'
import sponsorshipsRoutes from './src/modules/sponsorships/sponsorships.routes.js'
import instagramRoutes    from './src/modules/instagram/instagram.routes.js'
import dashboardRoutes    from './src/modules/dashboard/dashboard.routes.js'
import searchRoutes       from './src/modules/search/search.routes.js'
import uploadRoutes       from './src/modules/upload/upload.routes.js'
import settingsRoutes     from './src/modules/settings/settings.routes.js'
import setupRoutes        from './src/modules/setup/setup.routes.js'
import usersRoutes        from './src/modules/users/users.routes.js'
import rolesRoutes        from './src/modules/roles/roles.routes.js'
import companyRoutes      from './src/modules/company/company.routes.js'
import leadsRoutes        from './src/modules/leads/leads.routes.js'

const app = express()

// ── Trust proxy ───────────────────────────────────────────────────────────
app.set('trust proxy', 1)

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })) // disabled so Swagger UI loads

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin:         process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Logger ────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Global rate limit ─────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            500,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { success: false, message: 'Too many requests, try again later.' },
}))

const strictLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      50,
  message:  { success: false, message: 'Rate limit exceeded.' },
})

// Very tight limit for one-time / auth-sensitive endpoints
const ultraStrictLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      10,
  message:  { success: false, message: 'Too many attempts. Try again in 1 hour.' },
})


// ── Swagger ───────────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))
app.get('/docs.json', (_req, res) => res.json(swaggerSpec))

// ── Root & Health ─────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({
  success: true,
  message: 'Nelloriens API is running',
  docs:    `http://localhost:${process.env.PORT || 5000}/docs`,
  health:  `http://localhost:${process.env.PORT || 5000}/health`,
}))
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/news',         newsRoutes)
app.use('/jobs',         jobsRoutes)
app.use('/results',      resultsRoutes)
app.use('/sports',       sportsRoutes)
app.use('/foods',        foodsRoutes)
app.use('/history',      historyRoutes)
app.use('/stays',        staysRoutes)
app.use('/events',       eventsRoutes)
app.use('/movies',       moviesRoutes)
app.use('/theatres',     theatresRoutes)
app.use('/transport',    transportRoutes)
app.use('/offers',       offersRoutes)
app.use('/tourism',      tourismRoutes)
app.use('/updates',      updatesRoutes)
app.use('/ads',          adsRoutes)
app.use('/sponsorships', sponsorshipsRoutes)
app.use('/instagram',    instagramRoutes)
app.use('/dashboard',    dashboardRoutes)
app.use('/search',       searchRoutes)
app.use('/upload',       strictLimit,      uploadRoutes)
app.use('/settings',     settingsRoutes)
app.use('/setup',        ultraStrictLimit, setupRoutes)   // brute-force guard on SETUP_SECRET
app.use('/users',        usersRoutes)
app.use('/roles',        rolesRoutes)
app.use('/company',      companyRoutes)
app.use('/leads',        leadsRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const status = err.status || 500
  if (status >= 500) console.error('[ERROR]', err)
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  })
})

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✓ Nelloriens API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
  console.log(`✓ Swagger UI: http://localhost:${PORT}/docs`)
})
