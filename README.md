# FixMate — Local Service Booking Platform

FixMate connects customers with local service professionals. Customers can search listings, request appointments, update their profile, and track or cancel eligible bookings. Providers can maintain a public profile, publish listings, and process booking requests. A separately provisioned administrator can review platform data and hide or restore service listings.

## Live application

- **Frontend:** [fixmate-beta.vercel.app](https://fixmate-beta.vercel.app)
- **Backend health:** [FixMate API health](https://fixmate-backend-0cyg.onrender.com/api/health)
- **Service directory API:** [GET /api/services](https://fixmate-backend-0cyg.onrender.com/api/services)
- **Professional directory API:** [GET /api/providers](https://fixmate-backend-0cyg.onrender.com/api/providers)

## Screenshots

Add current screenshots to `docs/screenshots/` before submission:

| Screen | Screenshot |
|---|---|
| Home and service directory | `docs/screenshots/home.png` |
| Sign in / registration | `docs/screenshots/auth.png` |
| Customer booking history | `docs/screenshots/customer-bookings.png` |
| Provider workspace and requests | `docs/screenshots/provider-dashboard.png` |
| Administrator overview | `docs/screenshots/admin-dashboard.png` |

These are placeholders; no screenshots are included in the repository yet.

## Features

### Customers

- Register and sign in with a hashed-password account.
- Edit profile name, phone, and address.
- Search active service listings and provider profiles by category and location.
- Request a service for a future date and time.
- View booking history and cancel pending or accepted bookings.

### Providers

- Register a provider profile with specialties, location, experience, and bio.
- Update profile information and publish or remove listings.
- Review incoming requests and advance them through permitted statuses: pending → accepted/rejected → in progress → completed.

### Administrators

- Administrator registration is not public.
- View platform statistics, customers, provider profiles, service listings, and bookings.
- Hide or restore listings without deleting records.
- First administrator access is granted to an existing account through a server-side maintenance command (see [Administrator setup](#administrator-setup)).

## Technology

- **Frontend:** React 19, Vite 8, React Router, Lucide icons, CSS.
- **Backend:** Node.js, Express 5, JWT, bcryptjs, CORS.
- **Database:** MongoDB Atlas through Mongoose.
- **Hosting:** Vercel (client) and Render (API).

## Repository layout

```text
client/                 React + Vite application
  src/                  Pages, account flows, API helper, and styles
  vercel.json           SPA route fallback
server/                 Express API
  middleware/           Authentication and role checks
  models/               User, Provider, Service, and Booking schemas
  routes/               Auth, directory, booking, and admin APIs
  scripts/              Service seed and admin bootstrap utilities
  test/                 Node.js API and business-rule tests
docs/
  BCA-PROJECT-REPORT.md Final-year project report and diagrams
```

## Local development

Use a supported Node.js version (Node 20 or newer recommended).

1. Configure the backend:

   ```powershell
   cd server
   Copy-Item .env.example .env
   # Set MONGO_URI and a private JWT_SECRET (at least 32 characters) in server/.env.
   npm install
   npm test
   npm start
   ```

2. In a second terminal, start the frontend:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

The local Vite origin is `http://localhost:5173`; the API defaults to `http://localhost:5000`. The client can be pointed at another API using `VITE_API_URL`.

### Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `MONGO_URI` | Server | MongoDB connection string. Keep private. |
| `JWT_SECRET` | Server | At least 32 characters; signs session JWTs. Keep private. |
| `CLIENT_URL` | Server | Exact allowed frontend origin(s), comma-separated if needed. |
| `PORT` | Server | HTTP port; hosting providers set this automatically. |
| `RENDER` | Server runtime | Used to select secure cross-site production cookie settings. |
| `VITE_API_URL` | Vite build | Backend origin, e.g. `https://fixmate-backend-0cyg.onrender.com`. This is a public URL, not a secret. |

Do not commit `.env` files. Vite variables are embedded in public client assets; never put credentials or secrets in a `VITE_*` variable.

### Administrator setup

1. Register a regular account using the application, then sign out.
2. In a trusted shell with access to the intended MongoDB environment, set `ADMIN_EMAIL` to that account's email and run the command from `server`:

   ```powershell
   $env:ADMIN_EMAIL = "your-account@example.com"
   npm run admin:promote
   Remove-Item Env:ADMIN_EMAIL
   ```

   `server/.env` must contain the correct `MONGO_URI`. On macOS/Linux, use `ADMIN_EMAIL=your-account@example.com npm run admin:promote`.
3. The script promotes only an existing user and does not print, reset, or alter the password. Sign in again to load the administrator role.
4. Do not run this command against production unless you intentionally want to grant this account administrator access. It changes that account's role.

No public API or registration form can create an administrator. The administrator dashboard is available at `/admin`.

## Validation and tests

```powershell
cd client
npm run lint
npm run build

cd ..\server
npm test
```

The backend tests do not require a live database. For final acceptance, also exercise registration/login, booking creation/cancellation, provider status transitions, and administrator actions with role-specific test accounts in a dedicated non-production test database. Never use live production customer data for test mutations.

## Deployments

### Vercel

- Set the project root to `client`.
- Set `VITE_API_URL=https://fixmate-backend-0cyg.onrender.com` for every deployed environment.
- Deploy after changing the value because Vite embeds it at build time.
- `client/vercel.json` sends client-side routes to `index.html`, so refreshing a React route continues to load the SPA.

### Render

- Set the service root to `server`, use `npm install` as the build command, and `npm start` as the start command.
- Configure private `MONGO_URI` and `JWT_SECRET` values in Render's environment settings.
- Set `CLIENT_URL=https://fixmate-beta.vercel.app` (no path or trailing slash).
- Render's `RENDER=true` runtime marker enables `SameSite=None; Secure` HttpOnly session cookies for the cross-site Vercel-to-Render deployment. Local development uses `SameSite=Lax`.
- Check `/api/health` after deployment. A healthy API does not replace signed-in workflow testing.

## Project report

See [docs/BCA-PROJECT-REPORT.md](docs/BCA-PROJECT-REPORT.md) for the overview, requirements, architecture and data-flow diagrams, database design, API reference, test plan, setup, deployment, limitations, and future scope.

## Known scope and limitations

- Payments, provider verification, ratings/reviews, email delivery, and password recovery are not implemented.
- The contact form opens the visitor's default email application; it does not send or store a message through the backend.
- Administrator lists currently load all matching records without pagination; add pagination before scaling to a large dataset.
- Production API reads can be checked without credentials, but account-specific write flows should be tested using dedicated test accounts before a release.
