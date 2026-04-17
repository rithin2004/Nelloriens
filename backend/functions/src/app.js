import 'dotenv/config'
import express   from 'express'
import helmet    from 'helmet'
import cors      from 'cors'
import morgan    from 'morgan'
import rateLimit from 'express-rate-limit'
import { createRequire } from 'module'
const swaggerUi = createRequire(import.meta.url)('swagger-ui-express')

import { swaggerSpec, swaggerUiOptions } from './config/swagger.js'

// Routes
import newsRoutes         from './modules/news/news.routes.js'
import jobsRoutes         from './modules/jobs/jobs.routes.js'
import resultsRoutes      from './modules/results/results.routes.js'
import sportsRoutes       from './modules/sports/sports.routes.js'
import foodsRoutes        from './modules/foods/foods.routes.js'
import historyRoutes      from './modules/history/history.routes.js'
import staysRoutes        from './modules/stays/stays.routes.js'
import eventsRoutes       from './modules/events/events.routes.js'
import moviesRoutes       from './modules/movies/movies.routes.js'
import theatresRoutes     from './modules/movies/theatres.routes.js'
import transportRoutes    from './modules/transport/transport.routes.js'
import offersRoutes       from './modules/offers/offers.routes.js'
import tourismRoutes      from './modules/tourism/tourism.routes.js'
import updatesRoutes      from './modules/updates/updates.routes.js'
import adsRoutes          from './modules/ads/ads.routes.js'
import sponsorshipsRoutes from './modules/sponsorships/sponsorships.routes.js'
import instagramRoutes    from './modules/instagram/instagram.routes.js'
import dashboardRoutes    from './modules/dashboard/dashboard.routes.js'
import searchRoutes       from './modules/search/search.routes.js'
import uploadRoutes       from './modules/upload/upload.routes.js'
import settingsRoutes     from './modules/settings/settings.routes.js'
import setupRoutes        from './modules/setup/setup.routes.js'
import usersRoutes        from './modules/users/users.routes.js'
import rolesRoutes        from './modules/roles/roles.routes.js'
import companyRoutes      from './modules/company/company.routes.js'
import leadsRoutes        from './modules/leads/leads.routes.js'
import recycleBinRoutes   from './modules/recyclebin/recyclebin.routes.js'
import realtimeRoutes     from './modules/realtime/realtime.routes.js'
import realEstateRoutes   from './modules/realestate/realestate.routes.js'


const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Security
app.use(helmet({ contentSecurityPolicy: false }))

// CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173',
     'http://127.0.0.1:5173', 'http://127.0.0.1:3000']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS: origin '${origin}' not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Logger
app.use(morgan(process.env.ALLOWED_ORIGINS ? 'combined' : 'dev'))

// Body
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limits
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    return req.ip || req.headers["x-forwarded-for"] || "global";
  },

  message: {
    success: false,
    message: "Too many requests, try again later."
  }
}))

const strictLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Rate limit exceeded.' },
})

const ultraStrictLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 1 hour.' },
})

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))
app.get('/docs.json', (_req, res) => res.json(swaggerSpec))

// Root & health
app.get('/', (_req, res) => res.json({
  success: true,
  message: 'Nelloriens API is running',
  docs: '/docs',
  health: '/health',
}))

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// Routes
app.use('/news', newsRoutes)
app.use('/jobs', jobsRoutes)
app.use('/results', resultsRoutes)
app.use('/sports', sportsRoutes)
app.use('/foods', foodsRoutes)
app.use('/history', historyRoutes)
app.use('/stays', staysRoutes)
app.use('/events', eventsRoutes)
app.use('/movies', moviesRoutes)
app.use('/theatres', theatresRoutes)
app.use('/transport', transportRoutes)
app.use('/offers', offersRoutes)
app.use('/tourism', tourismRoutes)
app.use('/updates', updatesRoutes)
app.use('/ads', adsRoutes)
app.use('/sponsorships', sponsorshipsRoutes)
app.use('/instagram', instagramRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/search', searchRoutes)
app.use('/upload', strictLimit, uploadRoutes)
app.use('/settings', settingsRoutes)
app.use('/setup', ultraStrictLimit, setupRoutes)
app.use('/users', usersRoutes)
app.use('/roles', rolesRoutes)
app.use('/company', companyRoutes)
app.use('/leads', leadsRoutes)
app.use('/recycle-bin', recycleBinRoutes)
app.use('/realtime', realtimeRoutes)
app.use('/realestate', realEstateRoutes)

// 404
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
)

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500
  if (status >= 500) console.error('[ERROR]', err)

  const body = { success: false, message: err.message || 'Internal server error' }
  if (err.code) body.code = err.code
  if (err.currentItems) body.currentItems = err.currentItems

  res.status(status).json(body)
})

// ❌ NO app.listen here

// ⚠️ Optional (advanced): safe execution
// startArchivalScheduler()
// startRealtimeListeners()

export default app