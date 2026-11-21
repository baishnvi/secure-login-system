# azeSolution - Login Page & Secure Authentication System

Full-stack login system: **React (Vite) + Node.js/Express + MongoDB**, with JWT in an HttpOnly cookie.

## Features
- Responsive login page (desktop + mobile), Show/Hide password, Remember Me, Forgot Password placeholder flow, Register page
- Frontend validation + loading/disabled state + API error display
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (protected)
- bcrypt password hashing (12 rounds), unique email index, `password_hash` never returned
- Server-side validation (zod), centralized error handler, login rate limiting, CORS locked to one origin, CSRF protection, Helmet headers

## Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas connection string

## Setup & Run
```bash
# 1. Install everything
npm run install:all

# 2. Configure backend environment
cp server/.env.example server/.env       # Windows: copy server\.env.example server\.env
# open server/.env and set MONGODB_URI and JWT_SECRET
# generate a secret:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Start frontend + backend together
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

Run separately if you prefer: `cd server && npm run dev` and `cd client && npm run dev`.

## Environment variables (`server/.env`)
| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs (long random string) |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS, e.g. `http://localhost:5173` |
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development` or `production` (production turns on `Secure` cookies) |
| `COOKIE_SAMESITE` | `lax` (default), `strict`, or `none` (only for frontend/backend on different domains over HTTPS) |
| `TRUST_PROXY` | `1` when deployed behind a proxy (Render/Railway/Nginx) |

Frontend (`client/.env`, only for production): `VITE_API_URL=https://your-api-domain`

## API
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create user (`full_name`, `email`, `password`) -> 201 / 400 / 409 |
| POST | `/api/auth/login` | No | `email`, `password`, `remember` -> 200 + cookie / 400 / 401 / 429 |
| GET | `/api/auth/me` | Yes | Returns safe user info -> 200 / 401 |
| POST | `/api/auth/logout` | No | Clears the auth cookie -> 200 |

## Database schema (`users` collection)
| Field | Type | Notes |
|---|---|---|
| `_id` (exposed as `id`) | ObjectId | |
| `full_name` | String | 2-80 chars |
| `email` | String | unique index, lowercase |
| `password_hash` | String | bcrypt hash, `select: false`, never in responses |
| `created_at` | Date | default now |

## Authentication flow
1. User submits the login form. The frontend validates the input, then sends `POST /api/auth/login` (with `credentials: include`).
2. The server validates and normalises the body (trim, lowercase email), loads the user, and runs `bcrypt.compare` (also for unknown emails, using a dummy hash, so timing does not reveal which emails exist).
3. On success the server signs a JWT (`sub = user id`, 1 day, or 7 days with Remember Me) and sets it in an **HttpOnly** cookie. No token is exposed to JavaScript.
4. The browser automatically sends the cookie with every API call. `GET /api/auth/me` runs the `auth` middleware: verifies the JWT, loads the user, returns safe fields. Without a valid cookie it returns **401**.
5. Logout clears the cookie, after which protected access returns 401 again.

## Key security decisions
- **Password hashing:** bcrypt (12 rounds). Plain-text passwords are never stored or logged.
- **Token storage/transport:** JWT in an HttpOnly cookie (not localStorage), so XSS cannot steal it. `Secure` in production, `SameSite=Lax` by default.
- **CSRF:** SameSite cookie + a required custom header (`X-Requested-With`) on all POST requests. Cross-site pages cannot send it without a CORS preflight, which CORS rejects.
- **CORS:** only `CLIENT_ORIGIN`, with credentials; not `*`.
- **No user enumeration:** unknown email and wrong password both return `401 Invalid email or password`, with equalised timing.
- **Rate limiting:** 10 failed login attempts per 15 minutes per IP -> `429`.
- **Validation on both sides:** frontend for UX, zod on the server as the real gate.
- **Headers/secrets:** Helmet, 10kb body limit, secrets only in `.env` (git-ignored).
- **Error handling:** one central handler; internal errors are logged but never leaked to the client.

## Acceptance test checklist
| Test | How | Expected |
|---|---|---|
| Valid login | Register, then log in | Redirects to dashboard |
| Wrong password | Correct email + wrong password | 401 "Invalid email or password", no cookie |
| Unknown email | Any unregistered email | Same 401 message |
| Empty/invalid input | Blank fields or `abc` as email | Inline errors; API returns 400 |
| Protected without auth | `curl -i http://localhost:5000/api/auth/me` | 401 |
| Protected with auth | Dashboard -> "Call /api/auth/me" | 200 + safe user fields |
| Logout | Click Log out, then open `/dashboard` | Cookie cleared, redirected to login |
| Duplicate registration | Register same email twice | 409 |
| Rate limit | 11 wrong passwords in a row | 429 |

Quick curl demo:
```bash
curl -i -c jar.txt -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" \
  -d '{"email":"demo@example.com","password":"Passw0rd123"}' http://localhost:5000/api/auth/login
curl -i -b jar.txt http://localhost:5000/api/auth/me
```

## Project structure
```
auth-login-system/
├── client/                React + Vite frontend
│   └── src/ (pages, components, AuthContext.jsx, api.js, validation.js, styles.css)
└── server/                Express API
    └── src/ (config, models, controllers, routes, middleware, validators, utils)
```

## Deployment notes
- Same domain or proxy: keep `COOKIE_SAMESITE=lax`.
- Frontend and API on different domains (e.g. Vercel + Render): set `NODE_ENV=production`, `COOKIE_SAMESITE=none`, `TRUST_PROXY=1`, `CLIENT_ORIGIN=<frontend URL>`, and `VITE_API_URL=<API URL>` on the frontend.
