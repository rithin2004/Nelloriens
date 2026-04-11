/**
 * Swagger / OpenAPI 3.0 spec builder.
 *
 * Usage in server.js:
 *   import { swaggerSpec, swaggerUiOptions } from './src/config/swagger.js'
 *   app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))
 *   app.get('/docs.json', (_req, res) => res.json(swaggerSpec))
 */

import { createRequire } from 'module'
import { schemas, securitySchemes } from './swaggerExamples.js'
import { paths }                    from './swaggerPaths.js'

const swaggerJsdoc = createRequire(import.meta.url)('swagger-jsdoc')

const PORT = process.env.PORT || 5000

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Nelloriens Admin API',
      version:     '1.0.0',
      description: [
        'REST API for the Nelloriens admin panel.',
        'Public GET endpoints require no authentication.',
        'Write endpoints and admin reads require a Firebase Bearer token.',
        '',
        '**Auth flow:** sign in via Firebase Auth → get ID token → pass as `Authorization: Bearer <token>`',
      ].join('\n'),
      contact: {
        name:  'Nelloriens Dev',
        email: 'dev@nelloriens.com',
      },
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Local dev' },
    ],
    components: {
      securitySchemes,
      schemas,
    },
    tags: [
      { name: 'Setup',        description: 'One-time superadmin bootstrap' },
      { name: 'Users',        description: 'Admin user management' },
      { name: 'Roles',        description: 'Role & permission management' },
      { name: 'Company',      description: 'Company profile settings' },
      { name: 'Dashboard',    description: 'Stats, activity feed, featured content' },
      { name: 'News',         description: 'News articles, categories, breaking points' },
      { name: 'Jobs',         description: 'Job listings, categories, locations' },
      { name: 'Results',      description: 'Exam/election results & categories' },
      { name: 'Sports',       description: 'Sports news & categories' },
      { name: 'Foods',        description: 'Food listings, photos, varieties, sweets' },
      { name: 'History',      description: 'Historical entries' },
      { name: 'Stays',        description: 'Hotels & accommodation' },
      { name: 'Events',       description: 'Local events & categories' },
      { name: 'Movies',       description: 'Movies now showing / coming soon' },
      { name: 'Theatres',     description: 'Theatre/cinema management' },
      { name: 'Transport',    description: 'Transport listings & categories' },
      { name: 'Offers',       description: 'Deals & discount offers' },
      { name: 'Tourism',      description: 'Tourism places & categories' },
      { name: 'Updates',      description: 'General updates & categories' },
      { name: 'Ads',          description: 'Manual ads & Google AdSense settings' },
      { name: 'Sponsorships', description: 'Sponsorship banners' },
      { name: 'Instagram',    description: 'Instagram posts & API settings' },
      { name: 'Leads',        description: 'Contact form submissions' },
      { name: 'Search',       description: 'Global full-text search' },
      { name: 'Upload',       description: 'Firebase Storage file upload/delete' },
      { name: 'Settings',     description: 'Site configuration & audit logs' },
    ],
    paths,
  },
  apis: [], // all paths defined inline in swaggerPaths.js
})

export const swaggerUiOptions = {
  customSiteTitle: 'Nelloriens API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    defaultModelsExpandDepth: 2,
    docExpansion: 'none',
  },
}
