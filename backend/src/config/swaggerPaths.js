/**
 * OpenAPI 3.0 path definitions for the Nelloriens API.
 *
 * Every path references a named request body schema from swaggerExamples.js
 * and carries real query parameter descriptions so a frontend developer
 * can call any endpoint directly from Swagger UI without reading the source.
 *
 * Helper shorthand (local to this file):
 *   auth    — BearerAuth security requirement
 *   id      — standard {id} path parameter
 *   pagQ    — page + limit query params
 *   ok      — 200 success with optional $ref schema
 *   created — 201 created with optional $ref schema
 *   fail    — 400/401/403/404 error responses
 *   body    — JSON request body referencing a schema $ref
 */

const auth = [{ BearerAuth: [] }]
const id   = [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Sequential document ID, e.g. NEW00042, JOB00007.' }]
const pagQ = [
  { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 },  description: 'Page number (1-based).' },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page (max 100).' },
]

const ok      = (desc, ref) => ({ 200: { description: desc, content: ref ? { 'application/json': { schema: { $ref: ref } } } : undefined } })
const created = (desc, ref) => ({ 201: { description: desc, content: ref ? { 'application/json': { schema: { $ref: ref } } } : undefined } })
const fail    = {
  400: { description: 'Validation error — missing required field or invalid value.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
  401: { description: 'Missing or invalid Bearer token.',                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
  403: { description: 'Token is valid but the user lacks permission for this operation.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
  404: { description: 'Document not found.',                                          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
}

const body = (ref) => ({ required: true, content: { 'application/json': { schema: { $ref: ref } } } })

const multipartBody = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { type: 'string', format: 'binary', description: 'The file to upload.' },
        },
      },
    },
  },
}

const paginatedOk = {
  200: {
    description: 'Paginated list of documents.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedList' } } },
  },
}

/** Inline single-field JSON body helper */
const inlineBody = (required, properties) => ({
  required: true,
  content: {
    'application/json': {
      schema: { type: 'object', required, properties },
    },
  },
})

/** Inline reorder body: array of { id, order } */
const reorderBody = (idExample, description) => ({
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            description: description || 'Array of { id, order } pairs.',
            items: {
              type: 'object',
              properties: {
                id:    { type: 'string', example: idExample },
                order: { type: 'integer', example: 1 },
              },
            },
          },
        },
      },
    },
  },
})

export const paths = {

  // ─────────────────────────────────────────────────────────────────────────
  // SETUP
  // One-time bootstrap. Must be called before any other write operation.
  // ─────────────────────────────────────────────────────────────────────────

  '/setup/status': {
    get: {
      tags: ['Setup'],
      summary: 'Check whether the superadmin has been bootstrapped',
      description:
        'Called on every frontend app load. If `initialized` is `false`, the UI **must** redirect to `/setup` ' +
        'before rendering any other page.\n\n' +
        'Returns `{ initialized: false }` when neither ROL00001 nor USR00001 exist in Firestore.',
      responses: {
        ...ok('Setup status.', '#/components/schemas/SetupStatusResponse'),
      },
    },
  },

  '/setup/create-superadmin': {
    post: {
      tags: ['Setup'],
      summary: 'Bootstrap the superadmin user (one-time)',
      description:
        '**This endpoint wipes all existing users, roles, and counters** and creates:\n' +
        '- `ROL00001` — the immutable superadmin role (all permissions = `full`)\n' +
        '- `USR00001` — the superadmin user (role and status are permanently locked)\n\n' +
        'No password is set. A Firebase password-reset link is returned — copy it immediately, it expires in 1 hour.\n\n' +
        'Protected by the `SETUP_SECRET` environment variable (ultra-strict rate limit: 10 req/hour).\n\n' +
        'Calling this a second time when the system is already initialized returns `409 Conflict`.',
      requestBody: body('#/components/schemas/CreateSuperadminRequest'),
      responses: {
        ...created('Superadmin created. Copy the resetLink immediately.', '#/components/schemas/CreateSuperadminResponse'),
        409: { description: 'System already initialized. ROL00001 already exists.' },
        ...fail,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────────────────

  '/users/me': {
    get: {
      tags: ['Users'],
      summary: "Get the authenticated user's own profile and permissions",
      description:
        "Returns the calling user's Firestore document with `roleId`, `roleName`, and `permissions` attached. " +
        'Used by the frontend on every login to gate features without a separate roles fetch.',
      security: auth,
      responses: { ...ok("Current user's document with permissions.", '#/components/schemas/UserDocument'), ...fail },
    },
    patch: {
      tags: ['Users'],
      summary: "Update the authenticated user's own name or phone",
      description: 'Any user can update their own `name` and `phone`. Email and role cannot be changed here.',
      security: auth,
      requestBody: body('#/components/schemas/UpdateMeRequest'),
      responses: { ...ok('Updated user document.', '#/components/schemas/UserDocument'), ...fail },
    },
  },

  '/users/list': {
    get: {
      tags: ['Users'],
      summary: 'List all admin users',
      security: auth,
      parameters: [
        ...pagQ,
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Filter by name or email (case-insensitive prefix match).' },
        { name: 'active', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status.' },
      ],
      responses: { ...paginatedOk, ...fail },
    },
  },

  '/users/get/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get a single user by sequential ID',
      description: 'Pass the Firestore document ID (e.g. `USR00002`), **not** the Firebase Auth UID.',
      security: auth,
      parameters: id,
      responses: { ...ok('User document.', '#/components/schemas/UserDocument'), ...fail },
    },
  },

  '/users/create': {
    post: {
      tags: ['Users'],
      summary: 'Create a new admin user',
      description:
        'Creates a Firebase Auth account (no password) and a Firestore user document.\n\n' +
        'A one-time password-reset link is returned. Show it to the admin or send it via email — ' +
        'it is **not** stored on the server.',
      security: auth,
      requestBody: body('#/components/schemas/CreateUserRequest'),
      responses: {
        ...created('User created. resetLink is one-time — copy immediately.', '#/components/schemas/CreateSuperadminResponse'),
        ...fail,
      },
    },
  },

  '/users/update/{id}': {
    put: {
      tags: ['Users'],
      summary: "Update a user's name, phone, role, or active status",
      description:
        'Email cannot be changed through this endpoint.\n\n' +
        '`USR00001` (superadmin) role and active status are locked and cannot be changed — returns `403`.',
      security: auth,
      parameters: id,
      requestBody: body('#/components/schemas/UpdateUserRequest'),
      responses: { ...ok('Updated user document.', '#/components/schemas/UserDocument'), ...fail },
    },
  },

  '/users/delete/{id}': {
    delete: {
      tags: ['Users'],
      summary: 'Permanently delete a user',
      description:
        'Deletes both the Firebase Auth account and the Firestore document.\n\n' +
        '`USR00001` (superadmin) **cannot** be deleted — returns `403`.',
      security: auth,
      parameters: id,
      responses: { ...ok('User deleted.'), ...fail },
    },
  },

  '/users/reset-link/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Generate a new password-reset link for a user',
      description:
        'Generates a fresh Firebase password-reset link for the user. ' +
        'Useful when the original link expired or the user lost it.\n\n' +
        'The link is valid for **1 hour** and can only be used once.',
      security: auth,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User sequential ID, e.g. USR00003.' }],
      responses: { ...ok('Reset link generated.', '#/components/schemas/ResetLinkResponse'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────────────────────────────────────

  '/roles/list': {
    get: {
      tags: ['Roles'],
      summary: 'List all roles',
      security: auth,
      parameters: pagQ,
      responses: { ...paginatedOk, ...fail },
    },
  },

  '/roles/get/{id}': {
    get: {
      tags: ['Roles'],
      summary: 'Get a single role by ID',
      security: auth,
      parameters: id,
      responses: { ...ok('Role document.', '#/components/schemas/RoleDocument'), ...fail },
    },
  },

  '/roles/create': {
    post: {
      tags: ['Roles'],
      summary: 'Create a new role',
      description:
        'Define a role with per-module permission levels.\n\n' +
        '**Permission levels:**\n' +
        '| Level | Allowed operations |\n' +
        '|-------|-------------------|\n' +
        '| `none` | No access (module hidden in the UI) |\n' +
        '| `read` | GET list and get endpoints only |\n' +
        '| `read_write` | GET + POST + PUT |\n' +
        '| `full` | GET + POST + PUT + DELETE |\n\n' +
        'Modules not listed in `permissions` default to `none`.',
      security: auth,
      requestBody: body('#/components/schemas/CreateRoleRequest'),
      responses: { ...created('Role created.', '#/components/schemas/RoleDocument'), ...fail },
    },
  },

  '/roles/update/{id}': {
    put: {
      tags: ['Roles'],
      summary: "Update a role's name, description, or permissions",
      description: '`ROL00001` (superadmin) **cannot** be modified — returns `403`.',
      security: auth,
      parameters: id,
      requestBody: body('#/components/schemas/CreateRoleRequest'),
      responses: { ...ok('Updated role.', '#/components/schemas/RoleDocument'), ...fail },
    },
  },

  '/roles/delete/{id}': {
    delete: {
      tags: ['Roles'],
      summary: 'Delete a role',
      description: '`ROL00001` (superadmin) **cannot** be deleted — returns `403`.',
      security: auth,
      parameters: id,
      responses: { ...ok('Role deleted.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COMPANY
  // ─────────────────────────────────────────────────────────────────────────

  '/company/get': {
    get: {
      tags: ['Company'],
      summary: 'Get company profile (public)',
      description:
        'Returns the company profile stored at `config/company`. No auth required — ' +
        'used by the public website footer, about page, contact page, etc.',
      responses: { ...ok('Company document.') },
    },
  },

  '/company/create': {
    post: {
      tags: ['Company'],
      summary: 'Create company profile (first-time only)',
      description:
        'Creates the singleton company document at `config/company`.\n\n' +
        'Returns `400 Bad Request` if the document already exists. Use PUT `/company/update` after the first creation.',
      security: auth,
      requestBody: body('#/components/schemas/CompanyRequest'),
      responses: {
        ...created('Company profile created.'),
        400: { description: 'Company document already exists. Use PUT /company/update instead.' },
        ...fail,
      },
    },
  },

  '/company/update': {
    put: {
      tags: ['Company'],
      summary: 'Update company profile',
      description: 'All fields are optional. Only the provided fields are updated (merge). Company fields include: name, email, phone, tagline, description, supportEmail, whatsappNumber, address, city, state, pincode, country, website, mapEmbedUrl, logoUrl, gaId, and socialLinks (facebook, twitter, instagram, youtube, linkedin, whatsapp, telegram).',
      security: auth,
      requestBody: body('#/components/schemas/CompanyRequest'),
      responses: { ...ok('Company profile updated.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEADS (Contact messages)
  // ─────────────────────────────────────────────────────────────────────────

  '/leads/submit': {
    post: {
      tags: ['Leads'],
      summary: 'Submit a contact form message (public)',
      description:
        'No authentication required. Called from the public website contact form. ' +
        'A new lead document is created with status `new`.\n\n' +
        'Rate-limited to 10 submissions per IP per 15 minutes to prevent spam.',
      requestBody: body('#/components/schemas/SubmitLeadRequest'),
      responses: { ...created('Lead submitted.', '#/components/schemas/LeadDocument'), ...fail },
    },
  },

  '/leads/list': {
    get: {
      tags: ['Leads'],
      summary: 'List all leads (admin)',
      security: auth,
      parameters: [
        ...pagQ,
        { name: 'status',   in: 'query', schema: { type: 'string', enum: ['new', 'read', 'replied', 'closed'] }, description: 'Filter by status.' },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter leads submitted on or after this date (YYYY-MM-DD).' },
        { name: 'dateTo',   in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter leads submitted on or before this date (YYYY-MM-DD).' },
      ],
      responses: { ...paginatedOk, ...fail },
    },
  },

  '/leads/get/{id}': {
    get: {
      tags: ['Leads'],
      summary: 'Get a single lead by ID',
      security: auth,
      parameters: id,
      responses: { ...ok('Lead document.', '#/components/schemas/LeadDocument'), ...fail },
    },
  },

  '/leads/update/{id}': {
    put: {
      tags: ['Leads'],
      summary: 'Update lead status',
      description: 'Use this to mark a lead as `read`, `replied`, or `closed`.',
      security: auth,
      parameters: id,
      requestBody: body('#/components/schemas/UpdateLeadRequest'),
      responses: { ...ok('Updated lead.', '#/components/schemas/LeadDocument'), ...fail },
    },
  },

  '/leads/delete/{id}': {
    delete: {
      tags: ['Leads'],
      summary: 'Permanently delete a lead',
      security: auth,
      parameters: id,
      responses: { ...ok('Lead deleted.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NEWS
  // ─────────────────────────────────────────────────────────────────────────

  '/news/list': {
    get: {
      tags: ['News'],
      summary: 'List news articles (public)',
      parameters: [
        ...pagQ,
        { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Full-text search on title.' },
        { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category ID (e.g. NCT00003).' },
        { name: 'status',   in: 'query', schema: { type: 'string', enum: ['draft', 'published'] }, description: 'Filter by publish status.' },
        { name: 'featured', in: 'query', schema: { type: 'boolean' }, description: 'Set true to return only featured articles.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/news/get/{id}': {
    get: {
      tags: ['News'],
      summary: 'Get a single news article by ID (public)',
      parameters: id,
      responses: { ...ok('News article document.'), ...fail },
    },
  },

  '/news/create': {
    post: {
      tags: ['News'],
      summary: 'Create a news article',
      security: auth,
      requestBody: body('#/components/schemas/CreateNewsRequest'),
      responses: { ...created('Article created.'), ...fail },
    },
  },

  '/news/update/{id}': {
    put: {
      tags: ['News'],
      summary: 'Update a news article',
      security: auth,
      parameters: id,
      requestBody: body('#/components/schemas/CreateNewsRequest'),
      responses: { ...ok('Article updated.'), ...fail },
    },
  },

  '/news/delete/{id}': {
    delete: {
      tags: ['News'],
      summary: 'Delete a news article',
      security: auth,
      parameters: id,
      responses: { ...ok('Article deleted.'), ...fail },
    },
  },

  '/news/delete-batch': {
    post: {
      tags: ['News'],
      summary: 'Bulk delete news articles',
      description: 'Deletes multiple articles in one call. Pass an array of article IDs.',
      security: auth,
      requestBody: inlineBody(['ids'], {
        ids: { type: 'array', items: { type: 'string' }, example: ['NEW00010', 'NEW00011', 'NEW00012'] },
      }),
      responses: { ...ok('Batch deleted.'), ...fail },
    },
  },

  '/news/publish-batch': {
    post: {
      tags: ['News'],
      summary: 'Bulk publish draft articles',
      description: 'Sets `status = published` on each article in the provided IDs array.',
      security: auth,
      requestBody: inlineBody(['ids'], {
        ids: { type: 'array', items: { type: 'string' }, example: ['NEW00020', 'NEW00021'] },
      }),
      responses: { ...ok('Batch published.'), ...fail },
    },
  },

  '/news/categories/list': {
    get: {
      tags: ['News'],
      summary: 'List all news categories (public)',
      description: 'Returns every category. No pagination — categories are few and rarely change.',
      responses: { ...ok('Array of category documents.') },
    },
  },

  '/news/categories/create': {
    post: {
      tags: ['News'],
      summary: 'Create a news category',
      security: auth,
      requestBody: body('#/components/schemas/NewsCategoryRequest'),
      responses: { ...created('Category created.'), ...fail },
    },
  },

  '/news/categories/update/{id}': {
    put: {
      tags: ['News'],
      summary: 'Rename a news category',
      security: auth,
      parameters: id,
      requestBody: body('#/components/schemas/NewsCategoryRequest'),
      responses: { ...ok('Category updated.'), ...fail },
    },
  },

  '/news/categories/delete/{id}': {
    delete: {
      tags: ['News'],
      summary: 'Delete a news category',
      security: auth,
      parameters: id,
      responses: { ...ok('Category deleted.'), ...fail },
    },
  },

  '/news/breaking-points/list': {
    get: {
      tags: ['News'],
      summary: 'List breaking point ticker items (public)',
      description: 'Returns all items sorted by `order` ascending. Used by the public website ticker bar.',
      responses: { ...ok('Ordered array of breaking point documents.') },
    },
  },

  '/news/breaking-points/create': {
    post: {
      tags: ['News'],
      summary: 'Create a breaking point ticker item',
      security: auth,
      requestBody: body('#/components/schemas/BreakingPointRequest'),
      responses: { ...created('Breaking point created.'), ...fail },
    },
  },

  '/news/breaking-points/update/{id}': {
    put: {
      tags: ['News'],
      summary: 'Update a breaking point ticker item',
      security: auth,
      parameters: id,
      requestBody: body('#/components/schemas/BreakingPointRequest'),
      responses: { ...ok('Updated.'), ...fail },
    },
  },

  '/news/breaking-points/reorder': {
    patch: {
      tags: ['News'],
      summary: 'Bulk reorder breaking point items',
      description: 'Pass an array of `{ id, order }` pairs. The `order` values are written to each document.',
      security: auth,
      requestBody: reorderBody('BRK00001', 'Array of { id, order } pairs to set display order.'),
      responses: { ...ok('Reordered.'), ...fail },
    },
  },

  '/news/breaking-points/delete/{id}': {
    delete: {
      tags: ['News'],
      summary: 'Delete a breaking point ticker item',
      security: auth,
      parameters: id,
      responses: { ...ok('Deleted.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // JOBS
  // ─────────────────────────────────────────────────────────────────────────

  '/jobs/list': {
    get: {
      tags: ['Jobs'],
      summary: 'List job postings (public)',
      parameters: [
        ...pagQ,
        { name: 'search',         in: 'query', schema: { type: 'string' }, description: 'Search by job title or company name.' },
        { name: 'category',       in: 'query', schema: { type: 'string' }, description: 'Filter by category ID.' },
        { name: 'location',       in: 'query', schema: { type: 'string' }, description: 'Filter by location ID.' },
        { name: 'experienceType', in: 'query', schema: { type: 'string', enum: ['fresher', 'experienced', 'both'] }, description: 'Filter by experience requirement.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/jobs/get/{id}':    { get:    { tags: ['Jobs'], summary: 'Get a job posting by ID (public)', parameters: id, responses: { ...ok('Job document.'), ...fail } } },
  '/jobs/create':      { post:   { tags: ['Jobs'], summary: 'Create a job posting', security: auth, requestBody: body('#/components/schemas/CreateJobRequest'), responses: { ...created('Job created.'), ...fail } } },
  '/jobs/update/{id}': { put:    { tags: ['Jobs'], summary: 'Update a job posting', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateJobRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/jobs/delete/{id}': { delete: { tags: ['Jobs'], summary: 'Delete a job posting', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/jobs/categories/list':        { get:    { tags: ['Jobs'], summary: 'List job categories (public)', responses: { ...ok('Array of categories.') } } },
  '/jobs/categories/create':      { post:   { tags: ['Jobs'], summary: 'Create a job category', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Information Technology' } }), responses: { ...created('Created.'), ...fail } } },
  '/jobs/categories/update/{id}': { put:    { tags: ['Jobs'], summary: 'Update a job category', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'IT & Software' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/jobs/categories/delete/{id}': { delete: { tags: ['Jobs'], summary: 'Delete a job category', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/jobs/locations/list':         { get:    { tags: ['Jobs'], summary: 'List job locations (public)', responses: { ...ok('Array of locations.') } } },
  '/jobs/locations/create':       { post:   { tags: ['Jobs'], summary: 'Create a job location', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Nellore' } }), responses: { ...created('Created.'), ...fail } } },
  '/jobs/locations/update/{id}':  { put:    { tags: ['Jobs'], summary: 'Update a job location', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'Kavali' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/jobs/locations/delete/{id}':  { delete: { tags: ['Jobs'], summary: 'Delete a job location', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS
  // ─────────────────────────────────────────────────────────────────────────

  '/results/list': {
    get: {
      tags: ['Results'],
      summary: 'List exam/election results (public)',
      parameters: [
        ...pagQ,
        { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Search by exam name or conducting body.' },
        { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category ID.' },
        { name: 'year',     in: 'query', schema: { type: 'integer' }, description: 'Filter by year (e.g. 2025).' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/results/get/{id}':               { get:    { tags: ['Results'], summary: 'Get a result by ID (public)', parameters: id, responses: { ...ok('Result document.'), ...fail } } },
  '/results/create':                 { post:   { tags: ['Results'], summary: 'Create a result', security: auth, requestBody: body('#/components/schemas/CreateResultRequest'), responses: { ...created('Created.'), ...fail } } },
  '/results/update/{id}':            { put:    { tags: ['Results'], summary: 'Update a result', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateResultRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/results/delete/{id}':            { delete: { tags: ['Results'], summary: 'Delete a result', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/results/categories/list':        { get:    { tags: ['Results'], summary: 'List result categories (public)', responses: { ...ok('Array of categories.') } } },
  '/results/categories/create':      { post:   { tags: ['Results'], summary: 'Create a result category', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Board Exams' } }), responses: { ...created('Created.'), ...fail } } },
  '/results/categories/update/{id}': { put:    { tags: ['Results'], summary: 'Update a result category', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'Competitive Exams' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/results/categories/delete/{id}': { delete: { tags: ['Results'], summary: 'Delete a result category', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // SPORTS
  // ─────────────────────────────────────────────────────────────────────────

  '/sports/list': {
    get: {
      tags: ['Sports'],
      summary: 'List sports matches/news (public)',
      parameters: [
        ...pagQ,
        { name: 'search',      in: 'query', schema: { type: 'string' }, description: 'Search by match title.' },
        { name: 'category',    in: 'query', schema: { type: 'string' }, description: 'Filter by sport type category ID.' },
        { name: 'matchStatus', in: 'query', schema: { type: 'string', enum: ['upcoming', 'live', 'completed'] }, description: 'Filter by match status.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/sports/get/{id}':               { get:    { tags: ['Sports'], summary: 'Get a sports entry by ID (public)', parameters: id, responses: { ...ok('Sports document.'), ...fail } } },
  '/sports/create':                 { post:   { tags: ['Sports'], summary: 'Create a sports entry', security: auth, requestBody: body('#/components/schemas/CreateSportsRequest'), responses: { ...created('Created.'), ...fail } } },
  '/sports/update/{id}':            { put:    { tags: ['Sports'], summary: 'Update a sports entry', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateSportsRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/sports/delete/{id}':            { delete: { tags: ['Sports'], summary: 'Delete a sports entry', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/sports/categories/list':        { get:    { tags: ['Sports'], summary: 'List sport type categories (public)', responses: { ...ok('Array of categories.') } } },
  '/sports/categories/create':      { post:   { tags: ['Sports'], summary: 'Create a sport category', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Cricket' } }), responses: { ...created('Created.'), ...fail } } },
  '/sports/categories/update/{id}': { put:    { tags: ['Sports'], summary: 'Update a sport category', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'Kabaddi' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/sports/categories/delete/{id}': { delete: { tags: ['Sports'], summary: 'Delete a sport category', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // FOODS
  // ─────────────────────────────────────────────────────────────────────────

  '/foods/list': {
    get: {
      tags: ['Foods'],
      summary: 'List food entries (public)',
      parameters: [
        ...pagQ,
        { name: 'search',     in: 'query', schema: { type: 'string' }, description: 'Search by food name or restaurant name.' },
        { name: 'priceRange', in: 'query', schema: { type: 'string', enum: ['₹', '₹₹', '₹₹₹'] }, description: 'Filter by price tier.' },
        { name: 'isFamous',   in: 'query', schema: { type: 'boolean' }, description: 'Return only famous/must-try items.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/foods/get/{id}':    { get:    { tags: ['Foods'], summary: 'Get a food entry by ID (public)', parameters: id, responses: { ...ok('Food document.'), ...fail } } },
  '/foods/create':      { post:   { tags: ['Foods'], summary: 'Create a food entry', security: auth, requestBody: body('#/components/schemas/CreateFoodRequest'), responses: { ...created('Created.'), ...fail } } },
  '/foods/update/{id}': { put:    { tags: ['Foods'], summary: 'Update a food entry', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateFoodRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/foods/delete/{id}': { delete: { tags: ['Foods'], summary: 'Delete a food entry', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/foods/photos/list': {
    get: {
      tags: ['Foods'],
      summary: 'List photos for a food entry (public)',
      parameters: [{ name: 'foodId', in: 'query', required: true, schema: { type: 'string' }, description: 'Parent food document ID, e.g. FOD00003.' }],
      responses: { ...ok('Array of photo documents sorted by order.') },
    },
  },

  '/foods/photos/create': {
    post: {
      tags: ['Foods'],
      summary: 'Add a photo to a food entry (max 5)',
      security: auth,
      requestBody: inlineBody(['foodId', 'url'], {
        foodId: { type: 'string', example: 'FOD00003' },
        url:    { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/foods/gongura-mutton-2.jpg' },
        order:  { type: 'integer', example: 2 },
      }),
      responses: { ...created('Photo added.'), ...fail },
    },
  },

  '/foods/photos/reorder': {
    patch: {
      tags: ['Foods'],
      summary: 'Reorder photos for a food entry',
      security: auth,
      requestBody: reorderBody('FPH00002', 'Array of { id, order } pairs to set photo display order.'),
      responses: { ...ok('Reordered.'), ...fail },
    },
  },

  '/foods/photos/delete/{id}': { delete: { tags: ['Foods'], summary: 'Delete a food photo', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/foods/varieties/list': {
    get: {
      tags: ['Foods'],
      summary: 'List food variety records (public)',
      parameters: [{ name: 'foodId', in: 'query', schema: { type: 'string' }, description: 'Filter by parent food document ID.' }],
      responses: { ...ok('Array of variety documents.') },
    },
  },

  '/foods/varieties/create':      { post:   { tags: ['Foods'], summary: 'Create a food variety', security: auth, requestBody: body('#/components/schemas/FoodVarietyRequest'), responses: { ...created('Created.'), ...fail } } },
  '/foods/varieties/update/{id}': { put:    { tags: ['Foods'], summary: 'Update a food variety', security: auth, parameters: id, requestBody: body('#/components/schemas/FoodVarietyRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/foods/varieties/delete/{id}': { delete: { tags: ['Foods'], summary: 'Delete a food variety', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/foods/sweets/list': {
    get: {
      tags: ['Foods'],
      summary: 'List sweet records (public)',
      parameters: [{ name: 'foodId', in: 'query', schema: { type: 'string' }, description: 'Filter by parent food document ID.' }],
      responses: { ...ok('Array of sweet documents.') },
    },
  },

  '/foods/sweets/create':      { post:   { tags: ['Foods'], summary: 'Create a sweet record', security: auth, requestBody: body('#/components/schemas/FoodSweetRequest'), responses: { ...created('Created.'), ...fail } } },
  '/foods/sweets/update/{id}': { put:    { tags: ['Foods'], summary: 'Update a sweet record', security: auth, parameters: id, requestBody: body('#/components/schemas/FoodSweetRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/foods/sweets/delete/{id}': { delete: { tags: ['Foods'], summary: 'Delete a sweet record', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // HISTORY
  // ─────────────────────────────────────────────────────────────────────────

  '/history/list': {
    get: {
      tags: ['History'],
      summary: 'List history entries in chronological order (public)',
      parameters: pagQ,
      responses: { ...paginatedOk },
    },
  },

  '/history/get/{id}':    { get:    { tags: ['History'], summary: 'Get a history entry by ID (public)', parameters: id, responses: { ...ok('History document.'), ...fail } } },
  '/history/create':      { post:   { tags: ['History'], summary: 'Create a history entry', security: auth, requestBody: body('#/components/schemas/CreateHistoryRequest'), responses: { ...created('Created.'), ...fail } } },
  '/history/update/{id}': { put:    { tags: ['History'], summary: 'Update a history entry', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateHistoryRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/history/delete/{id}': { delete: { tags: ['History'], summary: 'Delete a history entry', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/history/reorder': {
    patch: {
      tags: ['History'],
      summary: 'Bulk reorder history timeline entries',
      description: 'Pass an array of `{ id, order }` pairs to set the chronological display order of all entries at once.',
      security: auth,
      requestBody: reorderBody('HIS00003', 'Array of { id, order } pairs to set timeline order.'),
      responses: { ...ok('Reordered.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STAYS
  // ─────────────────────────────────────────────────────────────────────────

  '/stays/list': {
    get: {
      tags: ['Stays'],
      summary: 'List hotels and accommodation (public)',
      parameters: [
        ...pagQ,
        { name: 'search',     in: 'query', schema: { type: 'string' }, description: 'Search by hotel name or address.' },
        { name: 'city',       in: 'query', schema: { type: 'string' }, description: 'Filter by city (e.g. Nellore, Kavali).' },
        { name: 'type',       in: 'query', schema: { type: 'string' }, description: 'Filter by hotel type (e.g. Business Hotel, Budget Stay).' },
        { name: 'starRating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 }, description: 'Filter by minimum star rating.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/stays/get/{id}':    { get:    { tags: ['Stays'], summary: 'Get a stay by ID (public)', parameters: id, responses: { ...ok('Stay document.'), ...fail } } },
  '/stays/create':      { post:   { tags: ['Stays'], summary: 'Create a stay', security: auth, requestBody: body('#/components/schemas/CreateStayRequest'), responses: { ...created('Created.'), ...fail } } },
  '/stays/update/{id}': { put:    { tags: ['Stays'], summary: 'Update a stay', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateStayRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/stays/delete/{id}': { delete: { tags: ['Stays'], summary: 'Delete a stay', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────────────────

  '/events/list': {
    get: {
      tags: ['Events'],
      summary: 'List local events (public)',
      parameters: [
        ...pagQ,
        { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Search by event name or venue.' },
        { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category ID.' },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Return events starting on or after this date (YYYY-MM-DD).' },
        { name: 'dateTo',   in: 'query', schema: { type: 'string', format: 'date' }, description: 'Return events starting on or before this date (YYYY-MM-DD).' },
        { name: 'featured', in: 'query', schema: { type: 'boolean' }, description: 'Return only featured events.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/events/get/{id}':               { get:    { tags: ['Events'], summary: 'Get an event by ID (public)', parameters: id, responses: { ...ok('Event document.'), ...fail } } },
  '/events/create':                 { post:   { tags: ['Events'], summary: 'Create an event', security: auth, requestBody: body('#/components/schemas/CreateEventRequest'), responses: { ...created('Created.'), ...fail } } },
  '/events/update/{id}':            { put:    { tags: ['Events'], summary: 'Update an event', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateEventRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/events/delete/{id}':            { delete: { tags: ['Events'], summary: 'Delete an event', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/events/categories/list':        { get:    { tags: ['Events'], summary: 'List event categories (public)', responses: { ...ok('Array of categories.') } } },
  '/events/categories/create':      { post:   { tags: ['Events'], summary: 'Create an event category', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Festival' } }), responses: { ...created('Created.'), ...fail } } },
  '/events/categories/update/{id}': { put:    { tags: ['Events'], summary: 'Update an event category', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'Cultural' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/events/categories/delete/{id}': { delete: { tags: ['Events'], summary: 'Delete an event category', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // MOVIES & THEATRES
  // ─────────────────────────────────────────────────────────────────────────

  '/movies/list': {
    get: {
      tags: ['Movies'],
      summary: 'List movies (public)',
      parameters: [
        ...pagQ,
        { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Search by movie name.' },
        { name: 'status',   in: 'query', schema: { type: 'string', enum: ['now_showing', 'coming_soon', 'ended'] }, description: 'Filter by screening status.' },
        { name: 'theatre',  in: 'query', schema: { type: 'string' }, description: 'Filter by theatre ID (e.g. THT00001).' },
        { name: 'language', in: 'query', schema: { type: 'string', enum: ['Telugu', 'Hindi', 'Tamil', 'English', 'Other'] }, description: 'Filter by language.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/movies/get/{id}':    { get:    { tags: ['Movies'], summary: 'Get a movie by ID (public)', parameters: id, responses: { ...ok('Movie document.'), ...fail } } },
  '/movies/create':      { post:   { tags: ['Movies'], summary: 'Create a movie', security: auth, requestBody: body('#/components/schemas/CreateMovieRequest'), responses: { ...created('Created.'), ...fail } } },
  '/movies/update/{id}': { put:    { tags: ['Movies'], summary: 'Update a movie', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateMovieRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/movies/delete/{id}': { delete: { tags: ['Movies'], summary: 'Delete a movie', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/theatres/list':        { get:    { tags: ['Theatres'], summary: 'List all theatres (public)', description: 'Full list, no pagination. Used to populate the theatre dropdown in the movies form.', responses: { ...ok('Array of theatre documents.') } } },
  '/theatres/create':      { post:   { tags: ['Theatres'], summary: 'Create a theatre', security: auth, requestBody: body('#/components/schemas/TheatreRequest'), responses: { ...created('Created.'), ...fail } } },
  '/theatres/update/{id}': { put:    { tags: ['Theatres'], summary: 'Update a theatre', security: auth, parameters: id, requestBody: body('#/components/schemas/TheatreRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/theatres/delete/{id}': { delete: { tags: ['Theatres'], summary: 'Delete a theatre', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSPORT
  // ─────────────────────────────────────────────────────────────────────────

  '/transport/list': {
    get: {
      tags: ['Transport'],
      summary: 'List transport entries — trains, buses, airport (public)',
      parameters: [
        ...pagQ,
        { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Search by name, train number, or route.' },
        { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by transport category ID.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/transport/get/{id}':               { get:    { tags: ['Transport'], summary: 'Get a transport entry by ID (public)', parameters: id, responses: { ...ok('Transport document.'), ...fail } } },
  '/transport/create':                 { post:   { tags: ['Transport'], summary: 'Create a transport entry', security: auth, requestBody: body('#/components/schemas/CreateTransportRequest'), responses: { ...created('Created.'), ...fail } } },
  '/transport/update/{id}':            { put:    { tags: ['Transport'], summary: 'Update a transport entry', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateTransportRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/transport/delete/{id}':            { delete: { tags: ['Transport'], summary: 'Delete a transport entry', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/transport/categories/list':        { get:    { tags: ['Transport'], summary: 'List transport categories (public)', responses: { ...ok('Array of categories.') } } },
  '/transport/categories/create':      { post:   { tags: ['Transport'], summary: 'Create a transport category', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Trains' } }), responses: { ...created('Created.'), ...fail } } },
  '/transport/categories/update/{id}': { put:    { tags: ['Transport'], summary: 'Update a transport category', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'Airport' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/transport/categories/delete/{id}': { delete: { tags: ['Transport'], summary: 'Delete a transport category', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // OFFERS
  // ─────────────────────────────────────────────────────────────────────────

  '/offers/list': {
    get: {
      tags: ['Offers'],
      summary: 'List deals and offers (public)',
      parameters: [
        ...pagQ,
        { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Search by offer title or business name.' },
        { name: 'category', in: 'query', schema: { type: 'string', enum: ['Food', 'Shopping', 'Medical', 'Education', 'Other'] }, description: 'Filter by category.' },
        { name: 'type',     in: 'query', schema: { type: 'string' }, description: 'Filter by custom type (e.g. Dine-in, Online).' },
        { name: 'active',   in: 'query', schema: { type: 'boolean' }, description: 'If true, return only currently valid offers (validFrom ≤ now ≤ validUntil).' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/offers/get/{id}':    { get:    { tags: ['Offers'], summary: 'Get an offer by ID (public)', parameters: id, responses: { ...ok('Offer document.'), ...fail } } },
  '/offers/create':      { post:   { tags: ['Offers'], summary: 'Create an offer', security: auth, requestBody: body('#/components/schemas/CreateOfferRequest'), responses: { ...created('Created.'), ...fail } } },
  '/offers/update/{id}': { put:    { tags: ['Offers'], summary: 'Update an offer', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateOfferRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/offers/delete/{id}': { delete: { tags: ['Offers'], summary: 'Delete an offer', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // TOURISM
  // ─────────────────────────────────────────────────────────────────────────

  '/tourism/list': {
    get: {
      tags: ['Tourism'],
      summary: 'List tourism places (public)',
      parameters: [
        ...pagQ,
        { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Search by place name.' },
        { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category ID.' },
        { name: 'featured', in: 'query', schema: { type: 'boolean' }, description: 'Return only featured places.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/tourism/get/{id}':               { get:    { tags: ['Tourism'], summary: 'Get a tourism place by ID (public)', parameters: id, responses: { ...ok('Tourism document.'), ...fail } } },
  '/tourism/create':                 { post:   { tags: ['Tourism'], summary: 'Create a tourism place', security: auth, requestBody: body('#/components/schemas/CreateTourismRequest'), responses: { ...created('Created.'), ...fail } } },
  '/tourism/update/{id}':            { put:    { tags: ['Tourism'], summary: 'Update a tourism place', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateTourismRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/tourism/delete/{id}':            { delete: { tags: ['Tourism'], summary: 'Delete a tourism place', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/tourism/categories/list':        { get:    { tags: ['Tourism'], summary: 'List tourism categories (public)', responses: { ...ok('Array of categories.') } } },
  '/tourism/categories/create':      { post:   { tags: ['Tourism'], summary: 'Create a tourism category', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Temples' } }), responses: { ...created('Created.'), ...fail } } },
  '/tourism/categories/update/{id}': { put:    { tags: ['Tourism'], summary: 'Update a tourism category', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'Nature & Parks' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/tourism/categories/delete/{id}': { delete: { tags: ['Tourism'], summary: 'Delete a tourism category', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATES (Banners / Popups / Tickers)
  // ─────────────────────────────────────────────────────────────────────────

  '/updates/list': {
    get: {
      tags: ['Updates'],
      summary: 'List site updates — banners, tickers, popups (public)',
      parameters: [
        ...pagQ,
        { name: 'updateType', in: 'query', schema: { type: 'string', enum: ['banner', 'popup', 'ticker', 'push_notification'] }, description: 'Filter by display type.' },
        { name: 'category',   in: 'query', schema: { type: 'string' }, description: 'Filter by category ID.' },
        { name: 'active',     in: 'query', schema: { type: 'boolean' }, description: 'If true, return only items where now < validUntil.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/updates/get/{id}':               { get:    { tags: ['Updates'], summary: 'Get an update by ID (public)', parameters: id, responses: { ...ok('Update document.'), ...fail } } },
  '/updates/create':                 { post:   { tags: ['Updates'], summary: 'Create an update', security: auth, requestBody: body('#/components/schemas/CreateUpdateRequest'), responses: { ...created('Created.'), ...fail } } },
  '/updates/update/{id}':            { put:    { tags: ['Updates'], summary: 'Update an update', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateUpdateRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/updates/delete/{id}':            { delete: { tags: ['Updates'], summary: 'Delete an update', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/updates/categories/list':        { get:    { tags: ['Updates'], summary: 'List update categories (public)', responses: { ...ok('Array of categories.') } } },
  '/updates/categories/create':      { post:   { tags: ['Updates'], summary: 'Create an update category', security: auth, requestBody: inlineBody(['name'], { name: { type: 'string', example: 'Maintenance' } }), responses: { ...created('Created.'), ...fail } } },
  '/updates/categories/update/{id}': { put:    { tags: ['Updates'], summary: 'Update an update category', security: auth, parameters: id, requestBody: inlineBody([], { name: { type: 'string', example: 'Important Announcement' } }), responses: { ...ok('Updated.'), ...fail } } },
  '/updates/categories/delete/{id}': { delete: { tags: ['Updates'], summary: 'Delete an update category', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // ADS
  // Manual ads + Google AdSense settings
  // ─────────────────────────────────────────────────────────────────────────

  '/ads/list': {
    get: {
      tags: ['Ads'],
      summary: 'List manual ad slots (public)',
      description:
        'Returns manual ads. These are only rendered on the public site when Google AdSense is **not** connected.\n\n' +
        'When AdSense is active (`publisherId` is set), Google manages all placements and manual ads are ignored.',
      parameters: [
        ...pagQ,
        { name: 'placement', in: 'query', schema: { type: 'string', enum: ['news_top', 'news_sidebar', 'jobs_sidebar', 'home_banner', 'home_sidebar', 'results_top', 'sports_top', 'events_top'] }, description: 'Filter by placement slot.' },
        { name: 'active',    in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status.' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/ads/get/{id}':    { get:    { tags: ['Ads'], summary: 'Get a manual ad by ID', parameters: id, responses: { ...ok('Ad document.'), ...fail } } },
  '/ads/create':      { post:   { tags: ['Ads'], summary: 'Create a manual ad', security: auth, requestBody: body('#/components/schemas/CreateAdRequest'), responses: { ...created('Created.'), ...fail } } },
  '/ads/update/{id}': { put:    { tags: ['Ads'], summary: 'Update a manual ad', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateAdRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/ads/delete/{id}': { delete: { tags: ['Ads'], summary: 'Delete a manual ad', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  '/ads/settings/get': {
    get: {
      tags: ['Ads'],
      summary: 'Get Google AdSense connection settings',
      description:
        'Returns the current AdSense configuration including `manualAdsEnabled` flag.\n\n' +
        'When `publisherId` is set, manual ads are ignored and Google manages all placements.',
      security: auth,
      responses: { ...ok('AdSense settings.', '#/components/schemas/AdsenseSettingsResponse'), ...fail },
    },
  },

  '/ads/settings/connect': {
    post: {
      tags: ['Ads'],
      summary: 'Connect Google AdSense',
      description:
        'Saves your AdSense publisher ID. After this, all manual ads are ignored and Google manages placement.\n\n' +
        'To revert to manual ads, call DELETE `/ads/settings/disconnect`.',
      security: auth,
      requestBody: body('#/components/schemas/AdsenseConnectRequest'),
      responses: { ...ok('Connected.', '#/components/schemas/AdsenseSettingsResponse'), ...fail },
    },
  },

  '/ads/settings/update': {
    put: {
      tags: ['Ads'],
      summary: 'Update AdSense settings (e.g. toggle Auto Ads)',
      security: auth,
      requestBody: body('#/components/schemas/AdsenseConnectRequest'),
      responses: { ...ok('Updated.', '#/components/schemas/AdsenseSettingsResponse'), ...fail },
    },
  },

  '/ads/settings/disconnect': {
    delete: {
      tags: ['Ads'],
      summary: 'Disconnect AdSense and re-enable manual ads',
      description: 'Removes the stored publisher ID. Manual ads become active again immediately.',
      security: auth,
      responses: { ...ok('Disconnected. Manual ads are now active.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SPONSORSHIPS
  // ─────────────────────────────────────────────────────────────────────────

  '/sponsorships/list': {
    get: {
      tags: ['Sponsorships'],
      summary: 'List sponsorship banners (public)',
      parameters: [
        ...pagQ,
        { name: 'sponsorType',   in: 'query', schema: { type: 'string', enum: ['Gold', 'Silver', 'Bronze', 'Title', 'Event'] }, description: 'Filter by sponsorship tier.' },
        { name: 'placementPage', in: 'query', schema: { type: 'string' }, description: 'Filter by page the sponsor should appear on (e.g. home, news).' },
      ],
      responses: { ...paginatedOk },
    },
  },

  '/sponsorships/get/{id}':    { get:    { tags: ['Sponsorships'], summary: 'Get a sponsorship by ID', parameters: id, responses: { ...ok('Sponsorship document.'), ...fail } } },
  '/sponsorships/create':      { post:   { tags: ['Sponsorships'], summary: 'Create a sponsorship', security: auth, requestBody: body('#/components/schemas/CreateSponsorshipRequest'), responses: { ...created('Created.'), ...fail } } },
  '/sponsorships/update/{id}': { put:    { tags: ['Sponsorships'], summary: 'Update a sponsorship', security: auth, parameters: id, requestBody: body('#/components/schemas/CreateSponsorshipRequest'), responses: { ...ok('Updated.'), ...fail } } },
  '/sponsorships/delete/{id}': { delete: { tags: ['Sponsorships'], summary: 'Delete a sponsorship', security: auth, parameters: id, responses: { ...ok('Deleted.'), ...fail } } },

  // ─────────────────────────────────────────────────────────────────────────
  // INSTAGRAM
  // Manual posts when not connected; sync from API when connected.
  // ─────────────────────────────────────────────────────────────────────────

  '/instagram/settings/get': {
    get: {
      tags: ['Instagram'],
      summary: 'Get Instagram API connection settings',
      description: 'Returns connection status, username, token expiry, and whether manual mode is active.',
      security: auth,
      responses: { ...ok('Instagram settings.', '#/components/schemas/InstagramStatusResponse'), ...fail },
    },
  },

  '/instagram/settings/connect': {
    post: {
      tags: ['Instagram'],
      summary: 'Connect Instagram account via long-lived access token',
      description:
        'Stores a long-lived Instagram Graph API access token. After connecting:\n' +
        '- Posts are synced via POST `/instagram/sync`.\n' +
        '- Manual post creation and editing are **blocked**.\n' +
        '- Refresh the token before 60 days via POST `/instagram/refresh-token`.',
      security: auth,
      requestBody: body('#/components/schemas/InstagramConnectRequest'),
      responses: { ...ok('Connected.', '#/components/schemas/InstagramStatusResponse'), ...fail },
    },
  },

  '/instagram/settings/disconnect': {
    delete: {
      tags: ['Instagram'],
      summary: 'Disconnect Instagram and switch to manual mode',
      description: 'Removes the stored access token. Manual post creation and editing are re-enabled.',
      security: auth,
      responses: { ...ok('Disconnected. Manual posts are now allowed.'), ...fail },
    },
  },

  '/instagram/status': {
    get: {
      tags: ['Instagram'],
      summary: 'Get Instagram connection status (lightweight)',
      description: 'Cheaper than `/instagram/settings/get` — returns only `connected` boolean and `lastSync` timestamp.',
      security: auth,
      responses: { ...ok('Connection status.', '#/components/schemas/InstagramStatusResponse'), ...fail },
    },
  },

  '/instagram/posts/list': {
    get: {
      tags: ['Instagram'],
      summary: 'List Instagram posts (public)',
      description: 'Returns all visible posts (`hidden = false`), sorted newest first. No auth required — used by the public website Instagram section.',
      parameters: pagQ,
      responses: { ...paginatedOk },
    },
  },

  '/instagram/posts/create': {
    post: {
      tags: ['Instagram'],
      summary: 'Create a manual Instagram post preview',
      description: '**Only available when Instagram API is not connected.** Used to manually curate post previews without API access.',
      security: auth,
      requestBody: body('#/components/schemas/CreateInstagramPostRequest'),
      responses: { ...created('Post created.'), ...fail },
    },
  },

  '/instagram/posts/update/{id}': {
    put: {
      tags: ['Instagram'],
      summary: 'Update a manual Instagram post',
      description: '**Only available in manual mode** (no API token connected).',
      security: auth,
      parameters: id,
      requestBody: body('#/components/schemas/CreateInstagramPostRequest'),
      responses: { ...ok('Updated.'), ...fail },
    },
  },

  '/instagram/sync': {
    post: {
      tags: ['Instagram'],
      summary: 'Sync latest posts from Instagram API',
      description: 'Fetches recent media from the Instagram Graph API and upserts them in Firestore. Requires an active access token set via `/instagram/settings/connect`.',
      security: auth,
      responses: { ...ok('Sync completed. Returns count of new/updated posts.'), ...fail },
    },
  },

  '/instagram/refresh-token': {
    post: {
      tags: ['Instagram'],
      summary: 'Refresh the Instagram long-lived access token',
      description:
        'Instagram long-lived tokens expire after 60 days. Call this endpoint **before expiry** to extend by another 60 days.\n\n' +
        'Check `tokenExpiry` from GET `/instagram/settings/get` to know when to refresh.',
      security: auth,
      responses: { ...ok('Token refreshed. New expiry is returned.'), ...fail },
    },
  },

  '/instagram/delete/{id}': {
    delete: {
      tags: ['Instagram'],
      summary: 'Hide a post from the public feed',
      description: 'Sets `hidden = true` on the post document. The post remains in Firestore but is excluded from GET `/instagram/posts/list`.',
      security: auth,
      parameters: id,
      responses: { ...ok('Post hidden.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  '/dashboard/stats': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get document counts for all collections',
      description: 'Returns a flat object with the total count of documents in each Firestore collection. Used to render the admin dashboard summary cards.',
      security: auth,
      responses: { ...ok('Stats object.', '#/components/schemas/DashboardStatsResponse'), ...fail },
    },
  },

  '/dashboard/activity': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get paginated audit log feed',
      description: 'Returns admin actions (create/update/delete) from the `audit_logs` collection, sorted newest first.',
      security: auth,
      parameters: pagQ,
      responses: { ...paginatedOk, ...fail },
    },
  },

  '/dashboard/recent-leads': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get the 5 most recent contact form submissions',
      security: auth,
      responses: { ...ok('Array of up to 5 lead documents, sorted newest first.'), ...fail },
    },
  },

  '/dashboard/recent-updates': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get the 5 most recently created update announcements',
      security: auth,
      responses: { ...ok('Array of up to 5 update documents, sorted newest first.'), ...fail },
    },
  },

  '/dashboard/featured': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get featured items across news, events, and movies',
      description: 'Returns up to 5 featured documents from each of `news`, `events`, and `movies`. Used for the featured carousel on the dashboard.',
      security: auth,
      responses: { ...ok('Object: { news: [...], events: [...], movies: [...] }'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────────────────

  '/search': {
    get: {
      tags: ['Search'],
      summary: 'Global search across all content collections',
      description:
        'Searches `news`, `jobs`, `results`, `events`, `tourism`, and other content collections for the query string.\n\n' +
        'Results are grouped by collection.',
      security: auth,
      parameters: [
        { name: 'q',     in: 'query', required: true,  schema: { type: 'string' }, description: 'Search query. Minimum 2 characters.', example: 'Nellore floods' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Max results per collection (default 10, max 50).' },
      ],
      responses: { ...ok('Object with collection names as keys and arrays of matching documents as values.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UPLOAD
  // ─────────────────────────────────────────────────────────────────────────

  '/upload/{module}': {
    post: {
      tags: ['Upload'],
      summary: 'Upload a file to Firebase Storage',
      description:
        'Uploads a single file for the specified module. The file is stored at `{module}/{uuid}.ext` and its public URL is returned.\n\n' +
        '**Allowed modules and size limits:**\n' +
        '| Module | Allowed types | Max size |\n' +
        '|--------|--------------|----------|\n' +
        '| news | image/jpeg, image/png, image/webp | 5 MB |\n' +
        '| jobs | image/jpeg, image/png | 3 MB |\n' +
        '| ads | image/jpeg, image/png, image/gif, image/webp | 2 MB |\n' +
        '| foods | image/jpeg, image/png, image/webp | 5 MB |\n' +
        '| company | image/jpeg, image/png, image/svg+xml | 2 MB |\n' +
        '| sponsorships | image/jpeg, image/png, image/webp, image/svg+xml | 3 MB |\n\n' +
        'Upload the file first, then pass the returned `url` in your create/update request body.',
      security: auth,
      parameters: [
        { name: 'module', in: 'path', required: true, schema: { type: 'string' }, description: 'Module name: news, jobs, ads, foods, stays, events, movies, transport, offers, tourism, updates, sponsorships, company, instagram, history.', example: 'news' },
      ],
      requestBody: multipartBody,
      responses: {
        ...ok('Upload result.', '#/components/schemas/UploadResponse'),
        413: { description: 'File exceeds the size limit for this module.' },
        415: { description: 'File type not allowed for this module.' },
        ...fail,
      },
    },
  },

  '/upload/delete': {
    delete: {
      tags: ['Upload'],
      summary: 'Delete a file from Firebase Storage by URL',
      description: 'Pass the full public URL returned by a previous upload. The file is permanently removed from Storage.',
      security: auth,
      requestBody: inlineBody(['url'], {
        url: { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/news/a1b2c3d4-article-photo.jpg' },
      }),
      responses: { ...ok('File deleted from Storage.'), ...fail },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SETTINGS
  // Site configuration only. Logo and company info live in /company, not here.
  // ─────────────────────────────────────────────────────────────────────────

  '/settings/site/get': {
    get: {
      tags: ['Settings'],
      summary: 'Get site-level configuration',
      description: 'Returns site-wide settings like SEO defaults and feature flags. Note: Google Analytics ID is stored on the company document — use GET /company/get to retrieve it.',
      security: auth,
      responses: { ...ok('Site config document.'), ...fail },
    },
  },

  '/settings/site/update': {
    put: {
      tags: ['Settings'],
      summary: 'Update site-level configuration',
      description: 'Partial update — only provided fields are changed. Logo and company info are managed via /company, not here.',
      security: auth,
      requestBody: body('#/components/schemas/SiteConfigRequest'),
      responses: { ...ok('Updated site config.'), ...fail },
    },
  },

  '/settings/audit-logs/list': {
    get: {
      tags: ['Settings'],
      summary: 'List audit log entries',
      description: 'Returns admin actions (who did what and when). Sorted newest first. Same data as GET /dashboard/activity but with additional filter options.',
      security: auth,
      parameters: [
        ...pagQ,
        { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Filter by user ID (e.g. USR00002).' },
        { name: 'action', in: 'query', schema: { type: 'string' }, description: 'Filter by action type (create, update, delete).' },
        { name: 'module', in: 'query', schema: { type: 'string' }, description: 'Filter by module name (e.g. news, jobs, users).' },
      ],
      responses: { ...paginatedOk, ...fail },
    },
  },

  // ───────────────────────────────────────────────────────────────────��─────
  // RECYCLE BIN
  // Soft-deleted content — list, restore, or permanently purge.
  // Items auto-archived after 90 days; permanently deleted after 15 days in bin.
  // ─────────────────────────────────────────────────────────────────────────

  '/recycle-bin/stats': {
    get: {
      tags: ['RecycleBin'],
      summary: 'Get item counts per module',
      description: 'Returns the number of soft-deleted items in each content module. Useful for showing a badge count on the Recycle Bin nav item.',
      security: auth,
      responses: { ...ok('Recycle bin stats by module.'), ...fail },
    },
  },

  '/recycle-bin/list': {
    get: {
      tags: ['RecycleBin'],
      summary: 'List all items in the Recycle Bin',
      description:
        'Returns soft-deleted items across all (or a filtered) content module.\n\n' +
        'Each item includes:\n' +
        '- `module` — which collection it came from\n' +
        '- `deleteReason` — `"manual"` (admin deleted) or `"expired"` (auto-archived after 90 days)\n' +
        '- `expiresAt` — ISO timestamp when it will be permanently deleted (15 days after `deletedAt`)\n\n' +
        'Requires `recyclebin` permission level `read` or above.',
      security: auth,
      parameters: [
        ...pagQ,
        { name: 'module', in: 'query', schema: { type: 'string', enum: ['news','jobs','results','sports','foods','history','stays','events','movies','theatres','transport','offers','tourism','updates','ads','sponsorships'] }, description: 'Filter by content module.' },
      ],
      responses: { ...paginatedOk, ...fail },
    },
  },

  '/recycle-bin/restore/{module}/{id}': {
    post: {
      tags: ['RecycleBin'],
      summary: 'Restore an item from the Recycle Bin',
      description: 'Clears `deletedAt` and makes the item live again. The item will reappear in its original module list.\n\nRequires `recyclebin` permission level `read_write` or above.',
      security: auth,
      parameters: [
        { name: 'module', in: 'path', required: true, schema: { type: 'string' }, description: 'Module name (e.g. news, jobs).' },
        { name: 'id',     in: 'path', required: true, schema: { type: 'string' }, description: 'Document ID (e.g. NEW00042).' },
      ],
      responses: { ...ok('Item restored.'), ...fail },
    },
  },

  '/recycle-bin/purge/{module}/{id}': {
    delete: {
      tags: ['RecycleBin'],
      summary: 'Permanently delete a single item',
      description: 'Permanently removes the document from Firestore. **This cannot be undone.** Requires `recyclebin` permission level `full`.',
      security: auth,
      parameters: [
        { name: 'module', in: 'path', required: true, schema: { type: 'string' }, description: 'Module name (e.g. news, jobs).' },
        { name: 'id',     in: 'path', required: true, schema: { type: 'string' }, description: 'Document ID.' },
      ],
      responses: { ...ok('Item permanently deleted.'), ...fail },
    },
  },

  '/recycle-bin/purge-all': {
    delete: {
      tags: ['RecycleBin'],
      summary: 'Empty the Recycle Bin (all or one module)',
      description: 'Permanently deletes all soft-deleted items. Pass `?module=news` to limit to one module. **This cannot be undone.** Requires `recyclebin` permission level `full`.',
      security: auth,
      parameters: [
        { name: 'module', in: 'query', schema: { type: 'string' }, description: 'Limit purge to a specific module. Omit to purge everything.' },
      ],
      responses: { ...ok('All items purged.'), ...fail },
    },
  },
}
