# CareNest — Digital Hospital Platform

CareNest is a single-institution digital hospital: a premium public website plus four role-based portals
(**Patient, Doctor, Receptionist, Administrator**) on one shared MongoDB database.
Care Today, Brighter Tomorrows.

The application is split into two independently deployable Next.js projects: `frontend/` for Vercel and
`backend/` for Render. The repository root retains shared test and maintenance scripts.

## Stack
Next.js 14 (App Router, JavaScript) · React 18 · Tailwind CSS · Framer Motion · three.js + @react-three/fiber/drei (3D) · MongoDB Atlas + Mongoose ·
NextAuth (Auth.js v4: credentials + Google) · Zod · bcryptjs · Nodemailer · Recharts · Lucide · next-themes · Vitest.

## 3D & motion design
* **WebGL hero** (`components/three/Scene.jsx`): a glossy emerald medical cross with gold halo rings inside a rotating emerald/gold DNA helix, drifting orbs and gold sparkles, with smooth pointer parallax. It also appears (compact) on the sign-in/register brand panel.
* **Graceful degradation** (`SceneLoader.jsx`): renders only if WebGL is available, the visitor has not requested reduced motion, and the element is on screen (rendering pauses off-screen to save GPU/battery). Otherwise an elegant static emblem is shown; an error boundary covers any WebGL failure.
* **3D tilt cards** (`ui/Tilt3D.jsx`): pointer-tracked perspective tilt with a moving gold glare on departments, doctors, services, facilities, steps and dashboard stat cards (mouse only; touch stays still).
* **Depth & flow:** scroll-progress bar, parallax background orbs, count-up statistics, staggered scroll reveals, animated nav underline, animated theme switch, mobile floating “Book” bar with back-to-top.
* All animation respects `prefers-reduced-motion`.
* 3D bundles are loaded only in the browser through `next/dynamic`, pause outside the viewport and fall back to static art for reduced-motion or low-end devices.
* Compact public-page scenes use a lower DPR and particle count; portal data views do not mount heavy 3D scenes.

## Features
**Public site** – home (hero, quick booking, departments, featured doctors, facilities, testimonials from real reviews), about, departments, doctors directory + profiles, services, facilities, FAQ, contact form (stored in DB), light/dark themes with animated persisted switcher.

**Patient** – register/verify e-mail/Google sign-in, dashboard (upcoming, allergies, latest prescription, unread), book / cancel / reschedule, upcoming & past visits, reviews, medical records (history, allergies, medications, report uploads), prescriptions, profile + photo, change password, download-my-data export, notifications.

**Doctor** – register with hospital e-mail → verify → submit credentials + documents → admin review; activity dashboard (today / upcoming / month / patients seen / rating, 14-day trend, outcomes, reviews), schedule (hours, breaks, days off, slot length), appointments (complete / no-show, open patient record), authorised patients, consultation notes, diagnoses, prescriptions, account & photo.

**Receptionist** – register walk-in patients, search, schedule / reschedule / cancel, today’s queue with live stats (expected / waiting / completed / doctors on duty / new patients), check-in, live doctor-availability board. **No clinical-record access.**

**Administrator** – analytics (trends, registrations, department performance, status split), doctor verification queue (approve / reject / request corrections), patients, users & staff (create receptionist/admin, suspend), departments, appointments, review moderation, contact-message inbox, CSV exports (appointments, patients; never clinical data), audit log.

## Doctor verification (two separate stages, enforced server-side)
`email_unverified → documents_pending → under_review → approved | rejected`, with `changes_requested` loops.
1. Registration is only accepted for e-mail domains in `HOSPITAL_EMAIL_DOMAINS`.
2. E-mail ownership: 6-digit OTP *or* link (hashed, 1-hour expiry, max 5 OTP attempts). This moves the doctor only to `documents_pending`.
3. Doctor submits qualifications, registration number/council and ≥1 document → `under_review`.
4. Only an administrator can approve (`POST /api/admin/doctors/:id/review`), and only from `under_review`.
5. **Only `approved` doctors** appear in public listings, show the verified badge, have bookable slots, or can access patient data. Every public query and `getBookableDoctor()` filters on `verification.status === "approved"`.

## Backend safeguards added in the logic audit
* Role vs state errors are distinct: a role that can *never* perform an action gets **403**; a valid role on the wrong state gets **409**.
* **Doctor revoked / suspended →** every upcoming booking is cancelled, slots freed, patients notified to rebook.
* **Doctor edits schedule →** existing bookings are never silently changed; conflicts are listed, admin/reception are notified, and the doctor can cancel-and-notify in one click.
* Queue numbers are issued by an **atomic counter** (no collisions under concurrent check-ins).
* Rescheduling into a time the patient already holds returns the correct “already has an appointment” error.
* Records/prescriptions may only be linked to an appointment that belongs to that patient (and that doctor).
* The **last active administrator cannot be suspended**; deleting a report clears dangling record links; duplicate reviews give a clear 409.
* Daily cron also closes out past never-attended bookings as **no-show**.

## Appointment engine & double-booking prevention
Appointments store hospital-local `date` + `time` strings (no timezone drift). While a slot is occupied the document carries
`slotKey = doctor_date_time` and `patientSlotKey = patient_date_time`, each backed by a **unique partial index**
(`partialFilterExpression: {$type:"string"}`). Cancelling `$unset`s both keys, freeing the slot. Two simultaneous requests for one slot
→ exactly one insert succeeds; the other gets `409 SLOT_TAKEN`. Reschedule is an atomic `updateOne` guarded by the previous status and the same indexes.
`backend/tests/booking.integration.test.js` fires 12 concurrent bookings at one slot against an in-memory MongoDB to prove it.

## Medical-record access model
| Actor | Read clinical data | Write |
|---|---|---|
| Patient | own only | history, allergy, medication, own report uploads |
| Doctor | only if **approved** AND has a non-cancelled appointment with that patient (audited) | all types + prescriptions |
| Receptionist / Admin | **never** (403) | – |

Documents are stored in MongoDB behind authenticated routes (`/api/documents/:id`), validated by magic bytes, ≤ 5 MB, served `private, no-store` with a locked-down CSP.

## First run (do this before anything else)
Run these commands from the repository folder containing `frontend/` and `backend/`:

```bash
npm install --prefix frontend
npm install --prefix backend
# Create local env files only when they do not already exist.
[ -f frontend/.env.local ] || cp frontend/.env.example frontend/.env.local
[ -f backend/.env.local ] || cp backend/.env.example backend/.env.local
# Put the same NEXTAUTH_SECRET and public frontend URL in both env files.
npm run check-env --prefix backend
npm test --prefix frontend
npm test --prefix backend
npm run db:indexes --prefix backend
npm run seed --prefix backend      # development data only
```

In separate terminals, start both services:

```bash
npm run dev --prefix backend       # http://localhost:3002
npm run dev --prefix frontend      # http://localhost:3000
```
Seeded accounts (password `CareNest#2026!` unless `SEED_PASSWORD` is set — **dev only**):
`admin@carenest.health`, `reception@carenest.health`, `aarav@carenest.health` (approved doctor), `vikram@carenest.health` (awaiting review), `isha@example.com` / `rahul@example.com` (patients).

## Environment variables
| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | Atlas connection string |
| `NEXTAUTH_URL` | yes | Public frontend URL; use the same value on Vercel and Render |
| `NEXTAUTH_SECRET` | yes | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | yes | Used in e-mail links, sitemap |
| `NEXT_PUBLIC_HOSPITAL_ADDRESS` | no | Hospital address shown in the public footer |
| `NEXT_PUBLIC_EMERGENCY_PHONE` | no | Emergency number shown in the public footer |
| `NEXT_PUBLIC_RECEPTION_PHONE` | no | Reception phone shown on the contact page |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | no | Public support e-mail shown in the footer |
| `HOSPITAL_TZ` | yes | IANA zone for slot logic (default `Asia/Kolkata`) |
| `HOSPITAL_EMAIL_DOMAINS` | yes | Allowed doctor e-mail domains, comma separated. `*` = any (**development only**) |
| `CANCEL_WINDOW_HOURS` | no | Patient online-cancel cut-off (default 2) |
| `GOOGLE_CLIENT_ID/SECRET` | no | Enables “Continue with Google” (patients only) |
| `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM` | no | Without SMTP, e-mails are **logged to the server console** and the app keeps working |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | no | Profile photos on Cloudinary (face-cropped 400×400). Without them photos are stored in MongoDB and served by `/api/avatars/:id` |
| `CRON_SECRET` | prod | Authorises `/api/cron/reminders` |
| `SEED_PASSWORD` | dev | Seed account password |

## MongoDB Atlas
1. Create a free cluster → **Database Access**: add a user. **Network Access**: allow your IP (and `0.0.0.0/0` or Vercel integration for deployment).
2. **Connect → Drivers**: copy the URI, replace `<password>`, set the database name (e.g. `/carenest`) and put it in `MONGODB_URI`.
3. Run `npm run db:indexes --prefix backend` (builds all indexes and verifies the booking guard). For local demo data also run `npm run seed --prefix backend`.

## Google OAuth
Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). Authorised redirect URIs:
`http://localhost:3000/api/auth/callback/google` and `https://<your-domain>/api/auth/callback/google`.
Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Google sign-in creates **patient** accounts only; existing staff/doctor e-mails are refused for Google login.

## E-mail
Any SMTP provider (Brevo, Postmark, SES SMTP, Gmail app password…). Sent: verification, password reset, appointment confirmation / cancellation / reschedule, reminders (cron), doctor approval / rejection / corrections.

## Deploying to Vercel + Atlas
### Frontend — Vercel
1. Import the repository in Vercel and set the Root Directory to `frontend`.
2. Set `RENDER_API_URL` to the public Render backend URL.
3. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the Vercel frontend domain.
4. Vercel rewrites `/api/*` to the Render backend; NextAuth is served by the backend through this same-origin proxy.

### Backend — Render
1. Create a Render Web Service with `backend` as the root directory.
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Set `NEXTAUTH_URL` to the **public Vercel frontend URL** (not the Render URL), and set the same `NEXTAUTH_SECRET` as on Vercel. Set backend-only MongoDB/SMTP/Cloudinary/cron variables on Render.
5. Use `backend/render.yaml` for Blueprint deployment or configure the service manually.

For Google OAuth, register `https://<your-vercel-domain>/api/auth/callback/google` as the authorized redirect URI. The callback must use the frontend URL because the browser reaches the backend through Vercel's `/api/*` rewrite.
Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL` on both services to the public frontend values. Vercel also needs `RENDER_API_URL`; Google OAuth credentials and database, e-mail, upload, and cron secrets belong on Render.

The backend health endpoint is `GET /api/health`. `frontend/vercel.json` registers a daily cron hitting `/api/cron/reminders` at 03:00 UTC; Vercel sends `Authorization: Bearer $CRON_SECRET`. This once-daily schedule is compatible with Vercel Hobby.

### Creating the first real admin (production)
```bash
ADMIN_EMAIL="you@hospital.org" ADMIN_NAME="Full Name" ADMIN_PASSWORD='A-long-Strong-Pass-123' npm run create-admin --prefix backend
```
Run it against your production `MONGODB_URI` (from your machine). It refuses weak passwords and will not change the role of an existing non-admin account. Then sign in, create receptionists under **Users & staff**, and **never run `npm run seed --prefix backend` against production** (it refuses unless `--force`).

### Build the database indexes (required, once per environment)
```bash
npm run db:indexes --prefix backend
```
Prints `Double-booking guard verified` when the unique booking indexes exist. The no-double-booking guarantee depends on them.

## Project layout
```
frontend/app         Public pages and role-based portal pages
frontend/components  UI kit, layouts, portals, and 3D scenes
frontend/hooks       Client-side fetch and interactive hooks
backend/app/api      API Route Handlers and health endpoint
backend/lib          Auth, database, policy, validation, rate limiting, files and tokens
backend/models       Mongoose schemas and indexes
backend/services     Appointments, records, verification and business logic
backend/scripts      Local database, seed, environment and admin utilities
backend/tests        Vitest unit and MongoDB-memory integration coverage
```
Security layers per request: same-origin check on mutations → rate limit → DB-backed session/role → Zod validation → service-level policy → audit log.

## Security notes
bcrypt (cost 12) · JWT sessions (8 h) whose role/status is **re-read from the DB on every token refresh** · account lockout (5 fails / 15 min) · timing-equalised login · hashed, expiring, single-use tokens · generic responses to avoid account enumeration · never trusting client roles/status (schemas strip unknown fields) · magic-byte upload checks · security headers · audit log of record reads, verification decisions, account changes.
Privacy: designed with HIPAA/GDPR/India DPDP principles in mind (least privilege, audit, minimisation) but **not certified**. Before real patient data: encryption at rest (Atlas), backups, DPA/BAA with vendors, retention & deletion policy, breach process, legal review.

## Verification status
| Check | Result |
|---|---|
| Syntax of all 180+ JS/JSX files (TypeScript parser) | ✅ pass |
| All local imports & named exports resolve | ✅ pass |
| Unit tests: slot engine, timezone maths, authorisation policy (incl. role-vs-state), verification state machine, file-signature validation, token hashing, CSV injection protection (run via a minimal runner) | ✅ pass |
| Frontend/backend builds, lint, both Vitest suites incl. Zod validation and **concurrent double-booking integration test** | ✅ pass locally |
| Live MongoDB Atlas, Google OAuth, SMTP delivery | ⏳ configure credentials before live testing |
| Browser/visual check of both themes, responsive layouts, animations, **WebGL scene** | ⏳ not performed |
| Playwright/E2E of full workflows | ❌ not written |

## Known limitations / next steps
* **Hospital photography:** none bundled (can’t be sourced/licensed offline). Add the files listed in `public/images/README.md`; gradient artwork shows until then. Profile photos *do* work (Cloudinary or MongoDB fallback).
* **Sensitive documents** (credentials, patient reports) intentionally stay in MongoDB behind access-controlled routes, not on a public CDN. Cloudinary is used only for non-sensitive profile photos.
* **Rate limiting** is in-memory (per instance). On Vercel use Upstash Redis for global limits.
* Queue numbers use atomic counters; reminders and no-show sweeps run once daily via the Hobby-compatible cron.
* Admin cannot view clinical records by design; add a break-glass flow if your policy requires it.
* Add Playwright E2E, error monitoring (Sentry) and localised e-mail templates as follow-ups.
