/**
 * OpenAPI 3.0 component schemas with real field-level examples.
 *
 * Every example value is based on actual Nellore, Andhra Pradesh data so
 * a client-side developer can copy-paste a working request body straight
 * from Swagger UI without guessing field names or formats.
 */

// ── Security ───────────────────────────────────────────────────────────────

export const securitySchemes = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description:
      'Firebase ID token.\n\n' +
      '**How to get one:**\n' +
      '1. POST `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<FIREBASE_WEB_API_KEY>`\n' +
      '   with `{ email, password, returnSecureToken: true }`\n' +
      '2. Copy `idToken` from the response.\n' +
      '3. Pass it here as `Bearer <idToken>`.\n\n' +
      'Tokens expire after 1 hour. Refresh using Firebase SDK `currentUser.getIdToken(true)`.',
  },
}

// ── Shared primitive schemas ───────────────────────────────────────────────

export const schemas = {

  // ── Generic response wrappers ──────────────────────────────────────────

  PaginatedList: {
    type: 'object',
    description: 'Standard paginated response returned by every `/list` endpoint.',
    properties: {
      success:    { type: 'boolean', example: true },
      items:      { type: 'array', items: { type: 'object' }, description: 'Array of documents for the current page.' },
      total:      { type: 'integer', example: 147, description: 'Total number of matching documents across all pages.' },
      page:       { type: 'integer', example: 1, description: 'Current page number (1-based).' },
      totalPages: { type: 'integer', example: 8, description: 'Total number of pages at the requested limit.' },
    },
  },

  SuccessMsg: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Operation completed successfully.' },
    },
  },

  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Document not found.' },
    },
  },

  // ── Setup ───────────────────────────────────────────────────────────────

  SetupStatusResponse: {
    type: 'object',
    description: 'Returned by GET /setup/status. If `initialized` is false the front-end must redirect to the setup page before anything else.',
    properties: {
      success:     { type: 'boolean', example: true },
      initialized: { type: 'boolean', example: false, description: 'true once ROL00001 and USR00001 exist in Firestore.' },
    },
  },

  CreateSuperadminRequest: {
    type: 'object',
    required: ['secret', 'name', 'email'],
    description: 'One-time bootstrap call. Wipes all existing users/roles/counters and creates the superadmin. Protected by the `SETUP_SECRET` env variable.',
    properties: {
      secret: { type: 'string', example: 'my-very-strong-setup-secret-2025', description: 'Must match the SETUP_SECRET environment variable on the server.' },
      name:   { type: 'string', example: 'Rithin Kumar', description: 'Display name of the superadmin.' },
      email:  { type: 'string', format: 'email', example: 'rithin@nelloriens.com' },
      phone:  { type: 'string', example: '+91 98765 43210' },
    },
  },

  CreateSuperadminResponse: {
    type: 'object',
    description: 'The Firebase password reset link is returned once and never stored. Copy it immediately.',
    properties: {
      success:   { type: 'boolean', example: true },
      user:      { $ref: '#/components/schemas/UserDocument' },
      resetLink: { type: 'string', example: 'https://nelloriens-admin.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=ABC123...', description: 'One-time password-set link. Send this to the admin. Expires in 1 hour.' },
    },
  },

  // ── Users ───────────────────────────────────────────────────────────────

  CreateUserRequest: {
    type: 'object',
    required: ['name', 'email', 'roleId'],
    description: 'No password is set on creation. A Firebase password-reset link is returned so the new user can choose their own password.',
    properties: {
      name:   { type: 'string', example: 'Sravani Devi' },
      email:  { type: 'string', format: 'email', example: 'sravani@nelloriens.com' },
      phone:  { type: 'string', example: '+91 90000 11223' },
      roleId: { type: 'string', example: 'ROL00002', description: 'ID of an existing role document, e.g. ROL00002 (Editor).' },
      active: { type: 'boolean', example: true, description: 'Defaults to true. Set false to immediately disable login.' },
    },
  },

  UpdateUserRequest: {
    type: 'object',
    description: 'All fields are optional. Email cannot be changed. USR00001 role and status are locked.',
    properties: {
      name:   { type: 'string', example: 'Sravani Reddy' },
      phone:  { type: 'string', example: '+91 90000 99988' },
      roleId: { type: 'string', example: 'ROL00003' },
      active: { type: 'boolean', example: false, description: 'Set false to block the user from logging in without deleting them.' },
    },
  },

  UpdateMeRequest: {
    type: 'object',
    description: 'Authenticated user updating their own name or phone only.',
    properties: {
      name:  { type: 'string', example: 'Sravani Reddy' },
      phone: { type: 'string', example: '+91 90000 99988' },
    },
  },

  UserDocument: {
    type: 'object',
    description: 'User document stored in the `users` Firestore collection.',
    properties: {
      _id:         { type: 'string', example: 'USR00002', description: 'Sequential ID. USR00001 is always the superadmin — role and status cannot be changed.' },
      firebaseUid: { type: 'string', example: 'abc123XYZfirebaseUid', description: 'Firebase Auth UID — used internally for token verification.' },
      name:        { type: 'string', example: 'Sravani Devi' },
      email:       { type: 'string', example: 'sravani@nelloriens.com' },
      phone:       { type: 'string', example: '+91 90000 11223' },
      roleId:      { type: 'string', example: 'ROL00002' },
      roleName:    { type: 'string', example: 'Editor', description: 'Denormalised role name copied from the role document.' },
      active:      { type: 'boolean', example: true },
      createdAt:   { type: 'string', format: 'date-time', example: '2025-04-11T08:30:00.000Z' },
      updatedAt:   { type: 'string', format: 'date-time', example: '2025-04-11T08:30:00.000Z' },
    },
  },

  ResetLinkResponse: {
    type: 'object',
    properties: {
      success:   { type: 'boolean', example: true },
      resetLink: { type: 'string', example: 'https://nelloriens-admin.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=XYZ...', description: 'Firebase password-reset link. Valid for 1 hour. Show or email to the user.' },
    },
  },

  // ── Roles ───────────────────────────────────────────────────────────────

  CreateRoleRequest: {
    type: 'object',
    required: ['name'],
    description: 'Permission levels: `none` = no access, `read` = GET only, `read_write` = GET + POST + PUT, `full` = all including DELETE.',
    properties: {
      name:        { type: 'string', example: 'Editor' },
      description: { type: 'string', example: 'Can manage content but cannot touch users or roles.' },
      permissions: {
        type: 'object',
        description: 'Keys are module names. Omitted modules default to `none`.',
        example: {
          news:         'full',
          jobs:         'full',
          results:      'full',
          sports:       'full',
          foods:        'read_write',
          history:      'read_write',
          stays:        'read_write',
          events:       'full',
          movies:       'full',
          theatres:     'read_write',
          transport:    'read_write',
          offers:       'read_write',
          tourism:      'read_write',
          updates:      'read_write',
          ads:          'read',
          sponsorships: 'read',
          instagram:    'read_write',
          leads:        'read',
          recyclebin:   'full',
          users:        'none',
          roles:        'none',
          company:      'read',
          dashboard:    'read',
          settings:     'none',
          search:       'read',
          upload:       'read_write',
        },
        additionalProperties: {
          type: 'string',
          enum: ['none', 'read', 'read_write', 'full'],
        },
      },
    },
  },

  RoleDocument: {
    type: 'object',
    properties: {
      _id:         { type: 'string', example: 'ROL00002', description: 'Sequential ID. ROL00001 is the superadmin role and cannot be modified or deleted.' },
      name:        { type: 'string', example: 'Editor' },
      description: { type: 'string', example: 'Can manage content but cannot touch users or roles.' },
      permissions: {
        type: 'object',
        example: { news: 'full', jobs: 'full', users: 'none' },
        additionalProperties: { type: 'string', enum: ['none', 'read', 'read_write', 'full'] },
      },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-11T09:00:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-11T09:00:00.000Z' },
    },
  },

  // ── Company ─────────────────────────────────────────────────────────────

  CompanyRequest: {
    type: 'object',
    required: ['name', 'email', 'phone'],
    description: 'Only one company document exists at `config/company`. POST /company/create fails if it already exists; use PUT /company/update afterwards.',
    properties: {
      name:           { type: 'string', example: 'Nelloriens Media Pvt Ltd' },
      email:          { type: 'string', format: 'email', example: 'hello@nelloriens.com' },
      phone:          { type: 'string', example: '+91 98765 00001' },
      tagline:        { type: 'string', example: 'Your Window to Nellore' },
      description:    { type: 'string', example: 'Nelloriens is Nellore\'s leading digital news and city guide platform.' },
      supportEmail:   { type: 'string', format: 'email', example: 'support@nelloriens.com' },
      whatsappNumber: { type: 'string', example: '+91 98765 00002' },
      address:        { type: 'string', example: 'Plot 12, Bhavani Nagar, Nellore, Andhra Pradesh 524001' },
      city:           { type: 'string', example: 'Nellore' },
      state:          { type: 'string', example: 'Andhra Pradesh' },
      pincode:        { type: 'string', example: '524001' },
      country:        { type: 'string', example: 'India' },
      website:        { type: 'string', example: 'https://nelloriens.com' },
      mapEmbedUrl:    { type: 'string', example: 'https://maps.google.com/maps?q=Nellore&output=embed' },
      logoUrl:        { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/company/logo.png' },
      gaId:           { type: 'string', example: 'G-XXXXXXXXXX', description: 'Google Analytics measurement ID.' },
      socialLinks: {
        type: 'object',
        description: 'Social platform URLs keyed by platform name.',
        example: {
          facebook:  'https://facebook.com/nelloriens',
          twitter:   'https://twitter.com/nelloriens',
          instagram: 'https://instagram.com/nelloriens',
          youtube:   'https://youtube.com/@nelloriens',
          linkedin:  'https://linkedin.com/company/nelloriens',
          whatsapp:  'https://wa.me/919876500002',
          telegram:  'https://t.me/nelloriens',
        },
      },
    },
  },

  // ── Leads ───────────────────────────────────────────────────────────────

  SubmitLeadRequest: {
    type: 'object',
    required: ['name', 'email', 'message'],
    description: 'Public endpoint — no auth required. Used by the contact form on the public website.',
    properties: {
      name:    { type: 'string', example: 'Suresh Babu' },
      email:   { type: 'string', format: 'email', example: 'suresh.babu@gmail.com' },
      phone:   { type: 'string', example: '+91 94405 12345' },
      subject: { type: 'string', example: 'Advertising inquiry' },
      message: { type: 'string', example: 'Hi, I would like to advertise my restaurant on Nelloriens. Please contact me.' },
    },
  },

  UpdateLeadRequest: {
    type: 'object',
    description: 'Admin-only. Used to mark a lead as read, replied, or closed.',
    properties: {
      status: { type: 'string', enum: ['new', 'read', 'replied', 'closed'], example: 'replied' },
    },
  },

  LeadDocument: {
    type: 'object',
    properties: {
      _id:       { type: 'string', example: 'LED00001' },
      name:      { type: 'string', example: 'Suresh Babu' },
      email:     { type: 'string', example: 'suresh.babu@gmail.com' },
      phone:     { type: 'string', example: '+91 94405 12345' },
      subject:   { type: 'string', example: 'Advertising inquiry' },
      message:   { type: 'string', example: 'Hi, I would like to advertise my restaurant on Nelloriens.' },
      status:    { type: 'string', enum: ['new', 'read', 'replied', 'closed'], example: 'new' },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-11T10:00:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-11T10:00:00.000Z' },
    },
  },

  // ── News ────────────────────────────────────────────────────────────────

  CreateNewsRequest: {
    type: 'object',
    required: ['title', 'category', 'thumbnail', 'shortDescription', 'publishedAt'],
    properties: {
      title:            { type: 'string', example: 'CM Jagan inaugurates new flyover on Trunk Road, Nellore' },
      category:         { type: 'string', example: 'NCT00003', description: 'ID of a news_category document.' },
      thumbnail:        { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/news/flyover-inauguration.jpg' },
      shortDescription: { type: 'string', maxLength: 300, example: 'Chief Minister Y.S. Jagan Mohan Reddy inaugurated the long-awaited Trunk Road flyover that will ease traffic congestion in the heart of Nellore city.' },
      body:             { type: 'string', description: 'Full article body as rich HTML. Leave empty and set redirectUrl instead for external news.', example: '<p>The flyover, which spans 1.2 km...</p>' },
      redirectUrl:      { type: 'string', example: 'https://thehindu.com/news/nellore-flyover', description: 'If set, users are redirected here instead of showing `body`.' },
      authorName:       { type: 'string', example: 'Ravi Shankar' },
      sourceName:       { type: 'string', example: 'The Hindu - Nellore' },
      sourceUrl:        { type: 'string', example: 'https://thehindu.com/news/nellore-flyover' },
      isImportant:      { type: 'boolean', example: false, description: 'Max 3 important articles per category are shown in the highlighted section.' },
      publishedAt:      { type: 'string', format: 'date-time', example: '2025-04-11T09:00:00.000Z' },
    },
  },

  NewsCategoryRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'Politics' },
    },
  },

  BreakingPointRequest: {
    type: 'object',
    required: ['text'],
    properties: {
      text:  { type: 'string', example: 'LIVE: Heavy rains lash Nellore — NDRF teams deployed in low-lying areas' },
      order: { type: 'integer', example: 1, description: 'Display order (lower = first). Auto-assigned if omitted; use /reorder to change.' },
    },
  },

  // ── Jobs ────────────────────────────────────────────────────────────────

  CreateJobRequest: {
    type: 'object',
    required: ['title', 'companyName', 'category', 'experienceType', 'location', 'shortDescription', 'publishedAt'],
    properties: {
      title:            { type: 'string', example: 'Junior Software Engineer — React & Node.js' },
      companyName:      { type: 'string', example: 'IndiGrid Technologies, Nellore' },
      companyLogo:      { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/jobs/indigrid-logo.png' },
      category:         { type: 'string', example: 'JCT00002', description: 'ID of a job_category document.' },
      experienceType:   { type: 'string', enum: ['fresher', 'experienced', 'both'], example: 'fresher' },
      location:         { type: 'string', example: 'JLC00001', description: 'ID of a job_location document.' },
      shortDescription: { type: 'string', maxLength: 300, example: 'IndiGrid Technologies is hiring fresh graduates for full-stack development roles at their Nellore office.' },
      fullDescription:  { type: 'string', example: '<p><strong>Responsibilities:</strong></p><ul><li>Build React UIs</li><li>Develop Node.js APIs</li></ul>' },
      redirectUrl:      { type: 'string', example: 'https://indigrid.in/careers/jse-2025' },
      vacancyCount:     { type: 'integer', example: 5 },
      salaryRange:      { type: 'string', example: '₹20,000 – ₹35,000 per month' },
      qualification:    { type: 'string', example: 'B.Tech / B.Sc Computer Science (2023 or 2024 passout)' },
      ageLimit:         { type: 'string', example: '20 – 28 years' },
      lastDate:         { type: 'string', format: 'date-time', example: '2025-05-31T23:59:59.000Z', description: 'Application deadline.' },
      thumbnail:        { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/jobs/jse-banner.jpg' },
      publishedAt:      { type: 'string', format: 'date-time', example: '2025-04-11T10:00:00.000Z' },
    },
  },

  // ── Results ─────────────────────────────────────────────────────────────

  CreateResultRequest: {
    type: 'object',
    required: ['examName', 'category', 'resultDate', 'shortDescription', 'publishedAt'],
    properties: {
      examName:         { type: 'string', example: 'AP SSC (Class 10) Board Examinations 2025' },
      category:         { type: 'string', example: 'RCT00001', description: 'ID of a result_category document.' },
      resultDate:       { type: 'string', format: 'date-time', example: '2025-05-15T08:00:00.000Z' },
      shortDescription: { type: 'string', example: 'Andhra Pradesh Board of Secondary Education (BSEAP) declared SSC Class 10 results for 2025 today.' },
      redirectUrl:      { type: 'string', example: 'https://bse.ap.gov.in/results' },
      fullDetails:      { type: 'string', example: '<p>Students can check their results on the official website...</p>' },
      thumbnail:        { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/results/ssc-2025.jpg' },
      conductingBody:   { type: 'string', example: 'BSEAP (Board of Secondary Education, Andhra Pradesh)' },
      year:             { type: 'integer', example: 2025 },
      publishedAt:      { type: 'string', format: 'date-time', example: '2025-05-15T09:00:00.000Z' },
    },
  },

  // ── Sports ──────────────────────────────────────────────────────────────

  CreateSportsRequest: {
    type: 'object',
    required: ['title', 'sportType', 'matchStatus', 'matchDateTime', 'publishedAt'],
    properties: {
      title:            { type: 'string', example: 'Nellore District Cricket League — Semi-Final: NRSP XI vs Kavali Tigers' },
      sportType:        { type: 'string', example: 'SCT00001', description: 'ID of a sport_category document (e.g. Cricket, Kabaddi).' },
      matchStatus:      { type: 'string', enum: ['upcoming', 'live', 'completed'], example: 'upcoming' },
      matchDateTime:    { type: 'string', format: 'date-time', example: '2025-04-20T09:00:00.000Z' },
      teamA:            { type: 'string', example: 'NRSP XI' },
      teamB:            { type: 'string', example: 'Kavali Tigers' },
      venue:            { type: 'string', example: 'YSR Stadium, Nellore' },
      liveStreamUrl:    { type: 'string', example: 'https://youtube.com/live/abc123', description: 'YouTube or other live stream URL.' },
      externalScoreUrl: { type: 'string', example: 'https://cricbuzz.com/...' },
      thumbnail:        { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/sports/cricket-semifinal.jpg' },
      shortDescription: { type: 'string', example: 'District cricket league semi-final between NRSP XI and Kavali Tigers at YSR Stadium.' },
      publishedAt:      { type: 'string', format: 'date-time', example: '2025-04-18T08:00:00.000Z' },
    },
  },

  // ── Foods ───────────────────────────────────────────────────────────────

  CreateFoodRequest: {
    type: 'object',
    required: ['foodName', 'restaurantName', 'description'],
    properties: {
      foodName:       { type: 'string', example: 'Gongura Mutton' },
      restaurantName: { type: 'string', example: 'Rayalaseema Ruchulu, Nellore' },
      description:    { type: 'string', example: '<p>A signature Andhra dish where tender mutton is slow-cooked with freshly made Gongura (sorrel leaves) chutney, delivering an intensely sour and spicy flavour unique to the region.</p>' },
      address:        { type: 'string', example: 'Near RTC Bus Stand, Nellore — 524001' },
      latitude:       { type: 'number', example: 14.4426 },
      longitude:      { type: 'number', example: 79.9865 },
      googleMapsUrl:  { type: 'string', example: 'https://maps.google.com/?q=Rayalaseema+Ruchulu+Nellore' },
      priceRange:     { type: 'string', enum: ['₹', '₹₹', '₹₹₹'], example: '₹₹', description: '₹ = budget, ₹₹ = mid-range, ₹₹₹ = premium.' },
      timing:         { type: 'string', example: '11:00 AM – 3:30 PM, 7:00 PM – 11:00 PM' },
      phone:          { type: 'string', example: '+91 94405 67890' },
      isFamous:       { type: 'boolean', example: true, description: 'Marks this as a "must try" dish.' },
      photos:         { type: 'array', items: { type: 'string' }, maxItems: 5, example: ['https://storage.googleapis.com/nelloriens.appspot.com/foods/gongura-mutton-1.jpg'] },
    },
  },

  FoodVarietyRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name:             { type: 'string', example: 'Gongura Pickle' },
      popular:          { type: 'boolean', example: true },
      totalRestaurants: { type: 'integer', example: 14 },
      restaurants: {
        type: 'array',
        maxItems: 2,
        description: 'Up to 2 recommended restaurants for this variety.',
        items: {
          type: 'object',
          properties: {
            name:      { type: 'string', example: 'Krishna Pickle Centre, Nellore' },
            swigyLink: { type: 'string', example: 'https://swiggy.com/city/nellore/krishna-pickle' },
            price:     { type: 'string', example: '₹120 per 250g' },
            rating:    { type: 'number', minimum: 0, maximum: 5, example: 4.3 },
          },
        },
      },
    },
  },

  FoodSweetRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'Bandar Laddu' },
      restaurants: {
        type: 'array',
        maxItems: 2,
        items: {
          type: 'object',
          properties: {
            name:      { type: 'string', example: 'Sri Rama Sweets, Nellore' },
            swigyLink: { type: 'string', example: 'https://swiggy.com/city/nellore/sri-rama-sweets' },
          },
        },
      },
    },
  },

  // ── History ─────────────────────────────────────────────────────────────

  CreateHistoryRequest: {
    type: 'object',
    required: ['title', 'eraPeriod', 'description'],
    properties: {
      title:       { type: 'string', example: 'Nellore Under the Vijayanagara Empire' },
      eraPeriod:   { type: 'string', example: 'Vijayanagara Empire (1336–1646 CE)' },
      description: { type: 'string', example: '<p>During the height of the Vijayanagara Empire, Nellore (then Vikramasimhapuri) served as a vital coastal trade hub...</p>' },
      thumbnail:   { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/history/vijayanagara-nellore.jpg' },
      yearLabel:   { type: 'string', example: '14th – 17th Century', description: 'Short label shown on the timeline card.' },
      references:  { type: 'array', items: { type: 'string' }, example: ['https://en.wikipedia.org/wiki/Nellore', 'https://aparchaeology.ap.gov.in/nellore'] },
      order:       { type: 'integer', example: 3, description: 'Chronological display order. Use PATCH /history/reorder to bulk-update positions.' },
    },
  },

  // ── Stays ───────────────────────────────────────────────────────────────

  CreateStayRequest: {
    type: 'object',
    required: ['hotelName', 'thumbnail', 'description', 'address', 'latitude', 'longitude'],
    properties: {
      hotelName:     { type: 'string', example: 'Hotel Minar, Nellore' },
      thumbnail:     { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/stays/hotel-minar.jpg' },
      description:   { type: 'string', example: 'A centrally located 3-star hotel near the Nellore Railway Station, popular with business travellers.' },
      address:       { type: 'string', example: '27-1-832, G.T. Road, Nellore — 524001' },
      latitude:      { type: 'number', example: 14.4384 },
      longitude:     { type: 'number', example: 79.9879 },
      googleMapsUrl: { type: 'string', example: 'https://maps.google.com/?q=Hotel+Minar+Nellore' },
      starRating:    { type: 'integer', minimum: 1, maximum: 5, example: 3 },
      pricePerNight: { type: 'string', example: '₹1,800 onwards' },
      phone:         { type: 'string', example: '+91 0861-234567' },
      websiteUrl:    { type: 'string', example: 'https://hotelminar.com' },
      bookingUrl:    { type: 'string', example: 'https://makemytrip.com/hotels/hotel-minar-nellore' },
      amenities:     { type: 'array', items: { type: 'string', enum: ['WiFi', 'AC', 'Parking', 'Pool', 'Restaurant', 'Gym'] }, example: ['WiFi', 'AC', 'Parking', 'Restaurant'] },
      city:          { type: 'string', example: 'Nellore' },
      type:          { type: 'string', example: 'Business Hotel' },
    },
  },

  // ── Events ──────────────────────────────────────────────────────────────

  CreateEventRequest: {
    type: 'object',
    required: ['eventName', 'category', 'startDate', 'endDate', 'venueName', 'thumbnail', 'description'],
    properties: {
      eventName:    { type: 'string', example: 'Nellore Mango Festival 2025' },
      category:     { type: 'string', example: 'ECT00002', description: 'ID of an event_category document.' },
      startDate:    { type: 'string', format: 'date-time', example: '2025-06-01T09:00:00.000Z' },
      endDate:      { type: 'string', format: 'date-time', example: '2025-06-03T21:00:00.000Z' },
      venueName:    { type: 'string', example: 'APMC Yard, NH16, Nellore' },
      thumbnail:    { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/events/mango-fest-2025.jpg' },
      description:  { type: 'string', example: '<p>The annual Nellore Mango Festival celebrates over 50 varieties of Banginapalli and Totapuri mangoes...</p>' },
      latitude:     { type: 'number', example: 14.4510 },
      longitude:    { type: 'number', example: 79.9752 },
      entryFee:     { type: 'string', example: 'Free entry. Mango purchases from ₹50/kg.' },
      organizer:    { type: 'string', example: 'Nellore District Horticulture Department' },
      contactPhone: { type: 'string', example: '+91 0861-232323' },
      ticketUrl:    { type: 'string', example: 'https://bookmyshow.com/nellore/mango-festival-2025' },
    },
  },

  // ── Movies ──────────────────────────────────────────────────────────────

  CreateMovieRequest: {
    type: 'object',
    required: ['movieName', 'theatre', 'language', 'status'],
    properties: {
      movieName:    { type: 'string', example: 'Pushpa 3: The Rampage' },
      theatre:      { type: 'string', example: 'THT00001', description: 'ID of a theatres document.' },
      language:     { type: 'string', enum: ['Telugu', 'Hindi', 'Tamil', 'English', 'Other'], example: 'Telugu' },
      showTimings:  { type: 'array', items: { type: 'string' }, example: ['10:30 AM', '1:45 PM', '5:00 PM', '9:15 PM'] },
      poster:       { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/movies/pushpa3-poster.jpg' },
      runningFrom:  { type: 'string', format: 'date-time', example: '2025-04-10T00:00:00.000Z' },
      runningUntil: { type: 'string', format: 'date-time', example: '2025-04-30T23:59:59.000Z' },
      genre:        { type: 'string', example: 'Action / Thriller' },
      rating:       { type: 'string', enum: ['U', 'UA', 'A'], example: 'UA' },
      bookingUrl:   { type: 'string', example: 'https://bookmyshow.com/nellore/pushpa3' },
      trailerUrl:   { type: 'string', example: 'https://youtube.com/watch?v=pushpa3trailer' },
      status:       { type: 'string', enum: ['now_showing', 'coming_soon', 'ended'], example: 'now_showing' },
    },
  },

  TheatreRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name:     { type: 'string', example: 'Srinivasa Theatre, Nellore' },
      address:  { type: 'string', example: 'Near Old Bus Stand, Trunk Road, Nellore — 524001' },
      phone:    { type: 'string', example: '+91 0861-231234' },
      capacity: { type: 'integer', example: 600 },
      screens:  { type: 'integer', example: 2 },
    },
  },

  // ── Transport ───────────────────────────────────────────────────────────

  CreateTransportRequest: {
    type: 'object',
    required: ['name', 'category'],
    description: 'Fields vary by transport type (train, bus, airport). Include only the relevant fields.',
    properties: {
      name:             { type: 'string', example: 'Nellore – Chennai Suvidha Special Express' },
      category:         { type: 'string', example: 'TCT00001', description: 'ID of a transport_category document (e.g. Trains, Buses, Airport).' },
      description:      { type: 'string', example: '<p>Direct express service from Nellore to Chennai Central with stops at Gudur...</p>' },
      thumbnail:        { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/transport/suvidha-express.jpg' },
      contactPhone:     { type: 'string', example: '139 (Railway Enquiry)' },
      address:          { type: 'string', example: 'Nellore Railway Station, Station Road, Nellore' },
      latitude:         { type: 'number', example: 14.4330 },
      longitude:        { type: 'number', example: 79.9862 },
      trainNumber:      { type: 'string', example: '22707' },
      trainName:        { type: 'string', example: 'Nellore – Chennai Suvidha Special' },
      departureStation: { type: 'string', example: 'Nellore (NLR)' },
      arrivalStation:   { type: 'string', example: 'Chennai Central (MAS)' },
      departureTime:    { type: 'string', example: '06:15 AM' },
      arrivalTime:      { type: 'string', example: '10:50 AM' },
      runningDays:      { type: 'string', example: 'Mon, Wed, Fri, Sun' },
      classes:          { type: 'string', example: '2A, 3A, SL, GN' },
      bookingUrl:       { type: 'string', example: 'https://irctc.co.in/train/22707' },
      routesInfo:       { type: 'string', example: '<p>Stops: Gudur, Naidupeta, Renigunta, Chennai...</p>' },
      fareInfo:         { type: 'string', example: 'SL: ₹235, 3A: ₹610, 2A: ₹885' },
      routeNumber:      { type: 'string', example: '99F' },
      operator:         { type: 'string', example: 'APSRTC' },
      fromLocation:     { type: 'string', example: 'Nellore (RTC Bus Stand)' },
      toLocation:       { type: 'string', example: 'Hyderabad (MGBS)' },
      firstBus:         { type: 'string', example: '05:00 AM' },
      lastBus:          { type: 'string', example: '11:30 PM' },
      frequency:        { type: 'string', example: 'Every 30–45 minutes' },
      fare:             { type: 'string', example: 'Ordinary: ₹370, Volvo AC: ₹640' },
      busType:          { type: 'string', enum: ['Ordinary', 'Express', 'Deluxe', 'AC Sleeper', 'Volvo', 'Mini Bus'], example: 'Volvo' },
      iataCode:         { type: 'string', example: 'SQL' },
      websiteUrl:       { type: 'string', example: 'https://aai.aero/en/airports/nellore' },
      appRedirectUrl:   { type: 'string', example: 'https://makemytrip.com/flights/nellore' },
    },
  },

  // ── Offers ──────────────────────────────────────────────────────────────

  CreateOfferRequest: {
    type: 'object',
    required: ['title', 'businessName', 'category', 'thumbnail', 'description', 'validFrom', 'validUntil'],
    properties: {
      title:           { type: 'string', example: '50% off on all Biryani orders above ₹500' },
      businessName:    { type: 'string', example: 'Bawarchi Biryani House, Nellore' },
      category:        { type: 'string', enum: ['Food', 'Shopping', 'Medical', 'Education', 'Other'], example: 'Food' },
      thumbnail:       { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/offers/bawarchi-biryani.jpg' },
      description:     { type: 'string', example: 'Get 50% off on all Biryani orders above ₹500. Valid only on dine-in. Offer cannot be combined with other discounts.' },
      validFrom:       { type: 'string', format: 'date-time', example: '2025-04-15T00:00:00.000Z' },
      validUntil:      { type: 'string', format: 'date-time', example: '2025-04-30T23:59:59.000Z' },
      discountPercent: { type: 'integer', minimum: 1, maximum: 100, example: 50 },
      couponCode:      { type: 'string', example: 'BIRYANI50', description: 'Optional coupon code to claim the offer.' },
      redirectUrl:     { type: 'string', example: 'https://bawarchi-nellore.in/offers' },
      contactPhone:    { type: 'string', example: '+91 94400 77788' },
      type:            { type: 'string', example: 'Dine-in' },
    },
  },

  // ── Tourism ─────────────────────────────────────────────────────────────

  CreateTourismRequest: {
    type: 'object',
    required: ['placeName', 'category', 'description', 'thumbnail', 'latitude', 'longitude'],
    properties: {
      placeName:     { type: 'string', example: 'Penchalakona Temple' },
      category:      { type: 'string', example: 'TMC00001', description: 'ID of a tourism_category document.' },
      description:   { type: 'string', example: '<p>Penchalakona is a serene temple town nestled in the Nallamala forest hills, 85 km from Nellore city. The presiding deity is Lord Lakshmi Narasimha Swamy...</p>' },
      thumbnail:     { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/tourism/penchalakona.jpg' },
      latitude:      { type: 'number', example: 14.6781 },
      longitude:     { type: 'number', example: 79.8023 },
      address:       { type: 'string', example: 'Penchalakona Village, Nellore District, AP — 524131' },
      entryFee:      { type: 'string', example: 'Free entry. Special darshan: ₹100.' },
      timings:       { type: 'string', example: '6:00 AM – 8:00 PM (daily)' },
      bestTime:      { type: 'string', example: 'October to March (avoid monsoon — road becomes treacherous)' },
      googleMapsUrl: { type: 'string', example: 'https://maps.google.com/?q=Penchalakona+Temple+Nellore' },
    },
  },

  // ── Updates ─────────────────────────────────────────────────────────────

  CreateUpdateRequest: {
    type: 'object',
    required: ['title', 'message', 'updateType'],
    properties: {
      title:       { type: 'string', example: 'Scheduled Maintenance — Sunday 2 AM to 5 AM' },
      message:     { type: 'string', example: 'The website will be under maintenance on Sunday, 13 April 2025 from 2:00 AM to 5:00 AM. Services will be unavailable during this window.' },
      category:    { type: 'string', example: 'UCT00002', description: 'ID of an update_category document. Optional.' },
      updateType:  { type: 'string', enum: ['banner', 'popup', 'ticker', 'push_notification'], example: 'banner' },
      redirectUrl: { type: 'string', example: 'https://nelloriens.com/maintenance-info' },
      thumbnail:   { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/updates/maintenance-banner.jpg' },
      validUntil:  { type: 'string', format: 'date-time', example: '2025-04-13T05:00:00.000Z', description: 'The update will stop displaying after this time.' },
    },
  },

  // ── Ads ─────────────────────────────────────────────────────────────────

  CreateAdRequest: {
    type: 'object',
    required: ['title', 'placement', 'adCode'],
    description: 'Manual ads are only shown when Google AdSense is NOT connected. If AdSense is connected, Google manages ad placement automatically.',
    properties: {
      title:      { type: 'string', example: 'Bawarchi Biryani — April Banner Ad' },
      placement:  { type: 'string', enum: ['news_top', 'news_sidebar', 'jobs_sidebar', 'home_banner', 'home_sidebar', 'results_top', 'sports_top', 'events_top'], example: 'home_banner' },
      adCode:     { type: 'string', example: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-..." data-ad-slot="..."></ins>', description: 'Raw ad HTML/script code from your advertiser.' },
      validFrom:  { type: 'string', format: 'date-time', example: '2025-04-15T00:00:00.000Z' },
      validUntil: { type: 'string', format: 'date-time', example: '2025-04-30T23:59:59.000Z' },
      priority:   { type: 'integer', example: 1, description: 'Lower number = higher priority when multiple ads target the same placement.' },
    },
  },

  AdsenseConnectRequest: {
    type: 'object',
    required: ['publisherId'],
    description: 'Connecting AdSense disables all manual ads. Google then manages ad placement via Auto Ads.',
    properties: {
      publisherId:    { type: 'string', example: 'ca-pub-1234567890123456', description: 'Your Google AdSense publisher ID.' },
      autoAdsEnabled: { type: 'boolean', example: true, description: 'Enable Auto Ads to let Google automatically choose placement and format.' },
    },
  },

  AdsenseSettingsResponse: {
    type: 'object',
    properties: {
      success:          { type: 'boolean', example: true },
      publisherId:      { type: 'string', example: 'ca-pub-1234567890123456' },
      autoAdsEnabled:   { type: 'boolean', example: true },
      manualAdsEnabled: { type: 'boolean', example: false, description: 'True when no publisherId is set, i.e., manual ads are active.' },
      connectedAt:      { type: 'string', format: 'date-time', example: '2025-04-11T10:00:00.000Z' },
    },
  },

  // ── Sponsorships ────────────────────────────────────────────────────────

  CreateSponsorshipRequest: {
    type: 'object',
    required: ['sponsorName', 'logo', 'sponsorType'],
    properties: {
      sponsorName:    { type: 'string', example: 'Srinivasa Auto Agencies, Nellore' },
      logo:           { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/sponsorships/srinivasa-auto.png' },
      sponsorType:    { type: 'string', enum: ['Gold', 'Silver', 'Bronze', 'Title', 'Event'], example: 'Gold' },
      websiteUrl:     { type: 'string', example: 'https://srinivasaauto.in' },
      description:    { type: 'string', example: 'Authorised dealer for Hero MotoCorp and TVS Motors in Nellore district.' },
      validFrom:      { type: 'string', format: 'date-time', example: '2025-04-01T00:00:00.000Z' },
      validUntil:     { type: 'string', format: 'date-time', example: '2025-09-30T23:59:59.000Z' },
      displayOrder:   { type: 'integer', example: 1, description: 'Lower number appears first in sponsor lists.' },
      placementPages: { type: 'array', items: { type: 'string', enum: ['home', 'news', 'jobs', 'results', 'sports', 'foods', 'events', 'movies', 'tourism'] }, example: ['home', 'news', 'jobs'] },
    },
  },

  // ── Instagram ───────────────────────────────────────────────────────────

  InstagramConnectRequest: {
    type: 'object',
    required: ['accessToken'],
    description: 'After connecting, posts are synced via POST /instagram/sync. Manual post creation and editing are blocked while connected.',
    properties: {
      accessToken: { type: 'string', example: 'IGQWRPbG50...long_access_token...', description: 'Long-lived Instagram Graph API access token (valid 60 days). Obtain via Facebook Developer App → Instagram Basic Display API.' },
      username:    { type: 'string', example: '@nelloriens' },
    },
  },

  CreateInstagramPostRequest: {
    type: 'object',
    description: 'Only available when Instagram API is NOT connected. Used to manually add post previews.',
    properties: {
      caption:   { type: 'string', example: 'The Banginapalli mangoes have arrived! Nellore\'s finest, available now at APMC Yard. Season lasts only 6 weeks — don\'t miss it! #Nellore #MangoSeason #Banginapalli' },
      mediaType: { type: 'string', example: 'IMAGE', description: 'Matches Instagram media_type (IMAGE, VIDEO, CAROUSEL_ALBUM).' },
      mediaUrl:  { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/instagram/mango-post.jpg' },
      permalink: { type: 'string', example: 'https://instagram.com/p/AbCdEfGh/' },
      timestamp: { type: 'string', format: 'date-time', example: '2025-04-10T16:30:00.000Z' },
    },
  },

  InstagramStatusResponse: {
    type: 'object',
    properties: {
      success:     { type: 'boolean', example: true },
      connected:   { type: 'boolean', example: true, description: 'True when an access token is stored.' },
      username:    { type: 'string', example: '@nelloriens' },
      lastSync:    { type: 'string', format: 'date-time', example: '2025-04-11T09:45:00.000Z' },
      tokenExpiry: { type: 'string', format: 'date-time', example: '2025-06-10T09:45:00.000Z', description: 'Approx 60 days from last refresh. Refresh before expiry using POST /instagram/refresh-token.' },
      manualMode:  { type: 'boolean', example: false, description: 'True when not connected — manual post creation and editing are allowed.' },
    },
  },

  // ── Upload ──────────────────────────────────────────────────────────────

  UploadResponse: {
    type: 'object',
    properties: {
      success:  { type: 'boolean', example: true },
      url:      { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/news/a1b2c3d4-article-photo.jpg', description: 'Public CDN URL of the uploaded file. Store this in your document.' },
      fileName: { type: 'string', example: 'a1b2c3d4-article-photo.jpg' },
      size:     { type: 'integer', example: 245312, description: 'File size in bytes.' },
      mimeType: { type: 'string', example: 'image/jpeg' },
    },
  },

  // ── Dashboard ───────────────────────────────────────────────────────────

  DashboardStatsResponse: {
    type: 'object',
    description: 'Document counts for every collection. Used to render the admin dashboard summary cards.',
    properties: {
      success:      { type: 'boolean', example: true },
      news:         { type: 'integer', example: 842 },
      jobs:         { type: 'integer', example: 134 },
      results:      { type: 'integer', example: 67 },
      sports:       { type: 'integer', example: 219 },
      foods:        { type: 'integer', example: 48 },
      history:      { type: 'integer', example: 12 },
      stays:        { type: 'integer', example: 35 },
      events:       { type: 'integer', example: 91 },
      movies:       { type: 'integer', example: 28 },
      transport:    { type: 'integer', example: 56 },
      offers:       { type: 'integer', example: 73 },
      tourism:      { type: 'integer', example: 41 },
      updates:      { type: 'integer', example: 17 },
      ads:          { type: 'integer', example: 9 },
      sponsorships: { type: 'integer', example: 6 },
      leads:        { type: 'integer', example: 203 },
    },
  },

  // ── Settings ────────────────────────────────────────────────────────────

  SiteConfigRequest: {
    type: 'object',
    description: 'Partial update — only provided fields are changed. Stores site-wide configuration. Note: Google Analytics ID is managed via PUT /company/update (gaId field), not here.',
    properties: {
      siteName:         { type: 'string', example: 'Nelloriens' },
      siteTagline:      { type: 'string', example: 'Your Window to Nellore' },
      facebookPixelId:  { type: 'string', example: '1234567890123456' },
      maintenanceMode:  { type: 'boolean', example: false, description: 'Enables a maintenance banner on the public site.' },
      defaultMetaImage: { type: 'string', example: 'https://storage.googleapis.com/nelloriens.appspot.com/company/og-default.jpg' },
    },
  },

  // ── Real Estate ─────────────────────────────────────────────────────────

  CreateRealEstateRequest: {
    type: 'object',
    required: ['title', 'type', 'scope', 'thumbnail'],
    properties: {
      title:         { type: 'string',  example: '3BHK Flat in Nellore City' },
      section:       { type: 'string',  enum: ['sale', 'rent'], example: 'sale', description: 'Whether this is a sale or rent listing.' },
      type:          { type: 'string',  example: 'Flat', description: 'Property type: Plot, Flat, House, Villa, or custom.' },
      location:      { type: 'string',  example: 'Nellore City' },
      sqft:          { type: 'number',  example: 1250 },
      bhk:           { type: 'integer', example: 3, description: 'Applicable for Flat, House, Villa. Not used for Plot.' },
      price:         { type: 'string',  example: '45,00,000', description: 'Required for sale listings.' },
      monthlyRent:   { type: 'string',  example: '12,000/month', description: 'Required for rent listings.' },
      description:   { type: 'string',  example: 'Spacious 3BHK flat with car parking and 24/7 security.' },
      phone:         { type: 'string',  example: '9876543210' },
      contactName:   { type: 'string',  example: 'Ravi Kumar' },
      thumbnail:     { type: 'string',  example: 'https://storage.googleapis.com/nelloriens.appspot.com/realestate/thumbnails/RES00001.jpg' },
      photos:        { type: 'array',   items: { type: 'string' }, example: ['https://storage.googleapis.com/nelloriens.appspot.com/realestate/photos/RES00001/1.jpg'], description: 'Max 6 photos.' },
      latitude:      { type: 'number',  example: 14.4426 },
      longitude:     { type: 'number',  example: 79.9865 },
      googleMapsUrl: { type: 'string',  example: 'https://maps.google.com/?q=14.4426,79.9865' },
      address:       { type: 'string',  example: '12-34, MG Road, Nellore' },
      scope:         { type: 'string',  enum: ['nellore', 'worldwide'], example: 'nellore' },
      city:          { type: 'string',  example: 'Nellore' },
      area:          { type: 'string',  example: 'Balaji Nagar' },
      region:        { type: 'string',  example: 'Andhra Pradesh' },
    },
  },

  // ── Upload ──────────────────────────────────────────────────────────────

  ReserveIdResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data:    {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'RES00042', description: 'Reserved sequential ID for the module.' },
        },
      },
    },
  },
}
