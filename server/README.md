# FixMate API

## Local setup

1. Copy `.env.example` to `.env` and set your MongoDB Atlas URI and a private JWT secret of at least 32 characters. Do not commit `.env`.
2. Install dependencies with `npm install`.
3. Start the API with `node server.js` (or `node --watch server.js` while developing).
4. In `client`, run `npm install` and `npm run dev`. The frontend sends API requests directly to `http://localhost:5000` by default (or to `VITE_API_URL` when set).

The API will not start if `MONGO_URI` or a sufficiently long `JWT_SECRET` is missing. In production, set Render's `CLIENT_URL` to the exact Vercel frontend origin (for example, `https://your-project.vercel.app`, without a path). Multiple allowed origins can be comma-separated. A trailing slash is accepted. Serve the frontend and API over HTTPS.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/me`
- `GET /api/services` (optional `category` and `location` query parameters), `GET /api/services/:id`; provider-only `POST /api/services`, `PATCH /api/services/:id`, `DELETE /api/services/:id`
- `GET /api/providers` (optional `category` and `location`); provider-only `GET /api/providers/me`, `PATCH /api/providers/me`
- Customer-only `POST /api/bookings`, `GET /api/bookings/mine`, `PATCH /api/bookings/:id/cancel`
- Provider-only `GET /api/bookings/provider`, `PATCH /api/bookings/:id/status`

Authentication is carried in an HttpOnly cookie. Production cookies use `SameSite=None; Secure` so browsers can send sessions from the cross-origin Vercel frontend to the Render API; this is enabled for Render deployments or when `NODE_ENV=production`. Local development keeps `SameSite=Lax`. Public registration supports customer (`user`) and provider roles; admin accounts must be provisioned outside public registration. Booking status updates follow the allowed pending → accepted/rejected → in progress → completed transitions, with customer cancellation allowed while pending or accepted.

## Tests

Run the backend tests with `node --test` from this directory. The API smoke tests and booking transition tests do not require a live database; registration, search, provider profile, and booking persistence should also be exercised against a dedicated test database before deployment.

## Sample services

Run `npm run seed:services` from this directory to add five Meerut sample listings (Electrician, Plumber, AC Repair, Cleaning, and Carpenter) only when the services collection is empty. The script creates a linked sample provider with a random, undisclosed password so service search can populate the required provider reference. A unique seed key and upserts prevent duplicate sample rows; existing non-sample services cause the script to skip without changes. This command writes to the database selected by `MONGO_URI`, so use the intended database before running it.
