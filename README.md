# Nelloriens — City Portal for Nellore, AP

A full-stack city information portal for Nellore, Andhra Pradesh. Built with React, Firebase, and Express — featuring a public-facing user site, a role-based admin portal, and a REST API backend.

---

## Architecture

```
nelloriens/
├── user-frontend/     React + Vite — public-facing site
├── admin-frontend/    React + Vite — admin portal (role-based access)
└── backend/           Express on Firebase Cloud Functions — REST API
```

**Data flow:**
```
User browser  ──►  Backend REST API  ──►  Firestore (via Admin SDK)
                         │
                    Firebase Storage
                         │
               SSE push to all connected clients
                         │
              Frontend re-fetches → Zustand/Redux → UI
```

Frontend never talks to Firestore directly — all reads and writes go through the backend API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| User frontend | React 18, Vite, Tailwind CSS, Redux Toolkit |
| Admin frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | Express, Firebase Cloud Functions (Node 20) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Auth | Firebase Authentication (Email + Password) |
| Real-time | Server-Sent Events (SSE) via backend `onSnapshot` |
| App Check | Firebase App Check + reCAPTCHA v3 |
| Analytics | Google Analytics + custom module-level analytics |
| Rich text | TipTap editor (admin forms) |

---

## Prerequisites

- Node.js 20+
- Firebase CLI — `npm install -g firebase-tools`
- Google Cloud CLI — for Application Default Credentials (ADC)
- A Firebase project with Firestore, Storage, Auth, and App Check enabled

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/nelloriens.git
cd nelloriens

# Install all three
cd user-frontend && npm install && cd ..
cd admin-frontend && npm install && cd ..
cd backend/functions && npm install && cd ../..
```

### 2. Configure Application Default Credentials (backend)

The backend uses Google Cloud ADC — no service account JSON files.

```bash
gcloud auth application-default login
gcloud config set project YOUR_FIREBASE_PROJECT_ID
```

### 3. Environment variables

Copy the example files and fill in your values:

```bash
cp backend/functions/.env.example backend/functions/.env
cp user-frontend/.env.example user-frontend/.env
cp admin-frontend/.env.example admin-frontend/.env
```

See each `.env.example` for all required variables and what they do. Key ones to set:

| Variable | Where | Description |
|---|---|---|
| `SETUP_SECRET` | backend | Secret to create the first superadmin — use a strong random string |
| `FIREBASE_STORAGE_BUCKET` | backend | Your Firebase Storage bucket name |
| `GOOGLE_CLOUD_PROJECT` | backend | Your Firebase project ID |
| `VITE_API_BASE_URL` | both frontends | Backend API URL (emulator URL for local dev) |
| `VITE_FB_*` | both frontends | Firebase client config (from Firebase Console → Project Settings) |
| `VITE_RECAPTCHA_SITE_KEY` | both frontends | reCAPTCHA v3 site key (from Google reCAPTCHA Console) |
| `VITE_WEATHER_API_KEY` | user-frontend | OpenWeatherMap API key |

### 4. Start local development

```bash
# Terminal 1 — Backend (Firebase emulator)
cd backend/functions
npm run serve

# Terminal 2 — User site
cd user-frontend
npm run dev     # http://localhost:5173

# Terminal 3 — Admin portal
cd admin-frontend
npm run dev     # http://localhost:3000
```

### 5. First-time setup

On first launch, navigate to `http://localhost:3000/setup` to create the superadmin account. You will need the `SETUP_SECRET` value from your backend `.env`.

---

## API Documentation

Swagger UI is available at `http://localhost:5001/your-project-id/us-central1/api/docs` when the backend emulator is running.

---

## Project Structure

### Modules

| Module | ID Prefix | Notes |
|---|---|---|
| News | `NEW` | Articles + Important sections |
| Events | `EVT` | Regular + Popular + Influencer |
| Updates | `UPD` | Today / Upcoming / Earlier |
| History | `HIS` | Vertical timeline, drag to order |
| Transport | `TRN` | Train, Bus, Airport, Local |
| Famous Foods | `FOD` | Varieties, Sweets, Health Tips |
| Stay | `STY` | Top toggle, max 3 per category |
| Tourism | `TUR` | Popular Destinations + Places |
| Offers | `OFR` | Deals with coupon codes |
| Movies | `MOV` | Running + Upcoming + Trailers |
| Theatres | `THT` | Managed inside Movies |
| Sports | `SPT` | Entries + Upcoming + Articles |
| Real Estate | `RES` | Sale + Rent listings |
| Results | `RSL` | Released / Scheduled status |
| Jobs | `JOB` | Category + location filters |
| Ads | `ADS` | Google Ads or Manual |
| Sponsorships | `SPN` | Manual banners |
| Instagram | `INS` | API or Manual, max 6 |
| Leads | `LED` | Contact form → status workflow |
| Company | `COM` | Single profile, feeds navbar/footer |
| Breaking News | `BRK` | Scrolling ticker, drag to order, max 25 |

### Key conventions

- All IDs follow `PREFIX00001` format (3-char uppercase prefix, never reused)
- Everything auto-published on creation — no draft state
- Deleted content moves to recycle bin (90-day auto, 15-day restore window)
- All forms are popup modals — no page-level forms
- Real-time updates via SSE — no polling

---

## Deployment

```bash
# Deploy backend
cd backend
firebase deploy --only functions

# Deploy user site
cd user-frontend
npm run deploy

# Deploy admin portal
cd admin-frontend
npm run deploy

# Deploy Firestore rules + indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

Set `NODE_ENV=production` and update `ALLOWED_ORIGINS` in backend environment before deploying.

---

## Roles & Permissions

Four permission levels assigned per module by the superadmin:

| Level | Access |
|---|---|
| `NONE` | Module hidden entirely |
| `READ` | View only |
| `READ_WRITE` | Create, update — no delete |
| `FULL` | Full access including delete + recycle bin |

Permission changes reflect immediately via SSE — no re-login required.
