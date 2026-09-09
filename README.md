# Vehicle Rental Management System

A full-stack academic project (5th semester) for a car/bike rental company, built with the MERN-style stack (MongoDB, Express, React, Node.js).

---

## 1. Project Title
**Vehicle Rental Management System**

## 2. Problem Statement
Vehicle rental companies operating across multiple branches need a way to manage their fleet, let customers search and book vehicles without double-booking, run pickup/return inspections, apply consistent pricing and cancellation rules, and give management visibility into fleet utilization and revenue. Doing this manually or with plain spreadsheets breaks down quickly once a company has more than a handful of vehicles and branches — the system needs to enforce rules like "a vehicle cannot be booked twice for overlapping dates" automatically, not by convention.

## 3. Project Objectives
- Provide a single system for customers, branch staff, and admins with distinct, enforced permissions.
- Prevent double-booking through server-side date-range overlap validation.
- Automate price calculation (base rate × days + add-ons) so totals are never client-supplied.
- Enforce a strict booking lifecycle (RESERVED → PICKED_UP → RETURNED, or → CANCELLED) so invalid transitions are rejected.
- Apply a transparent, time-based cancellation policy.
- Give admins visibility into fleet utilization and revenue by branch/vehicle.

## 4. Features
See [Mandatory 13 Functional Modules](#13-mandatory-functional-modules-implemented) below — registration/auth, branch management, vehicle/fleet management, availability search, booking workflow, pickup inspection, return inspection & damage charges, booking status management, pricing & add-ons, cancellation policy engine, customer rental history, fleet utilization reports, and role-based access control.

## 5. User Roles
| Role | Can do |
|---|---|
| **CUSTOMER** | Search vehicles, view details, book, view own bookings/history, cancel eligible bookings |
| **BRANCH_STAFF** | View local fleet, view branch bookings, perform pickup/return inspections, record odometer/fuel/damage |
| **ADMIN** | Manage branches, vehicles, add-ons, users; view all reports; full access |

## 6. Tech Stack
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Joi, Helmet, CORS, express-rate-limit, express-mongo-sanitize
**Frontend:** React 18, Vite, React Router, Axios, Bootstrap 5 (customized design system), Recharts (admin charts)
**Tooling:** Postman (API testing), nodemon (dev server)

### Frontend design system
The UI uses a dark teal/green navbar and footer (`--nav-bg`), a warm orange/gold accent for CTA buttons (`--accent`), and a light gray page background — all defined as CSS variables in `frontend/src/index.css`. Vehicle images are resolved by `frontend/src/utils/vehicleImages.js`, which prefers the vehicle's own `image` field from the database, falls back to a brand+model image map, then a vehicle-type fallback, then a generic placeholder — rendered through the `<VehicleImage />` component, which also swaps to a fallback on a broken image URL (`onError`).

## 7. System Architecture
```
┌────────────┐        HTTPS/JSON        ┌───────────────┐        Mongoose        ┌───────────┐
│   React    │  ───────────────────────▶│  Express API  │  ────────────────────▶│  MongoDB  │
│  (Vite +   │ ◀───────────────────────│  (MVC layers) │ ◀────────────────────│           │
│ Bootstrap) │      JWT in header        └───────────────┘                        └───────────┘
└────────────┘
```
The backend follows an MVC-plus-services layout: **routes** wire URLs to **controllers**, controllers call **services** for business logic (booking conflicts, pricing, cancellation policy, reports) and **models** for persistence, and cross-cutting concerns (auth, RBAC, validation, error formatting) live in **middleware**.

## 8. Folder Structure
```
vehicle-rental-management-system/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, branch, vehicle, booking, inspection, addon, report, user
│   ├── middleware/         # auth (JWT), authorize (RBAC), validate (Joi), errorHandler
│   ├── models/             # User, Branch, Vehicle, Booking, Inspection, AddOn
│   ├── routes/
│   ├── services/           # bookingService, pricingService, cancellationService, reportService
│   ├── validators/         # Joi schemas
│   ├── utils/               # generateToken, dateUtils
│   ├── seed/seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, ProtectedRoute, RoleRoute, Loading, ErrorMessage
│   │   ├── pages/           # 17 pages covering all roles
│   │   ├── services/        # api.js (axios), authService, vehicleService, bookingService, reportService
│   │   ├── context/AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── postman/Vehicle-Rental-API.postman_collection.json
└── README.md
```

## 9. MongoDB Schema
**users** — name, email (unique), passwordHash, role (CUSTOMER/BRANCH_STAFF/ADMIN), branchId (staff only), phone, isActive, timestamps
**branches** — name, city, address, phone, status
**vehicles** — registrationNumber (unique), type (CAR/BIKE), brand, model, year, perDayRate, branchId, status (AVAILABLE/BOOKED/MAINTENANCE/INACTIVE), image
**bookings** — customerId, vehicleId, branchId, startDate, endDate, numberOfDays, baseAmount, addOns[] (snapshot of name+price), addOnAmount, totalAmount, status, cancellationCharge, timestamps
**inspections** — bookingId, vehicleId, staffId, stage (PICKUP/RETURN), odometer, fuelLevel, conditionNotes, damageNotes, extraCharges
**addons** — name, description, price, isActive

## 10. Relationships Between Collections
```
Users (CUSTOMER)
  |
  | customerId
  v
Bookings ────────▶ Vehicles ────────▶ Branches
   |    vehicleId              branchId
   | bookingId
   v
Inspections ──▶ staffId (Users, role BRANCH_STAFF)

AddOns are embedded as a price/name *snapshot* inside each Booking's
addOns[] array (referenced by addOnId), so historical bookings keep
the price that applied at booking time even if the AddOn's price
changes later.
```

## 11. Why References Are Used
Mongoose `ObjectId` references (rather than embedding) are used for Booking→Vehicle, Booking→Branch, Booking→Customer, and Inspection→Booking/Vehicle/Staff because these entities are queried independently and updated on their own timelines (a vehicle's status changes many times across many bookings; a branch is looked up by many vehicles). Add-ons, by contrast, are **referenced but also snapshotted** (name + price copied into the booking at creation time) — this is intentional: it preserves historical accuracy (an old booking's total shouldn't retroactively change if an admin edits an add-on's price later), while still keeping the `addOnId` for traceability back to the current add-on record.

## 12. API Endpoint Table
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |
| GET/POST/PUT/DELETE | /api/branches(/:id) | Public read, Admin write |
| GET/POST/PUT/DELETE | /api/vehicles(/:id) | Public read, Admin write (staff can update own-branch vehicles) |
| GET | /api/vehicles/search?branchId&type&startDate&endDate | Public |
| GET/POST | /api/bookings(/:id) | Private (role-scoped) |
| POST | /api/bookings/:id/cancel | Customer |
| POST | /api/bookings/:id/pickup | Staff/Admin |
| POST | /api/bookings/:id/return | Staff/Admin |
| GET | /api/customers/:id/bookings | Self or Admin |
| GET | /api/inspections/:bookingId | Owner/branch staff/Admin |
| GET/POST/PUT/DELETE | /api/addons(/:id) | Public read, Admin write |
| GET | /api/admin/reports/utilization | Admin |
| GET | /api/admin/reports/revenue | Admin |
| GET | /api/admin/reports/dashboard | Admin |
| GET/POST/PUT/DELETE | /api/users(/:id) | Admin |

## 13. Mandatory Functional Modules Implemented
1. User Registration & Authentication (bcrypt + JWT)
2. Branch Management (Admin CRUD)
3. Vehicle Master & Fleet Management
4. Availability Search Engine (overlap-aware)
5. Booking Workflow (server-side price calc, transaction-wrapped)
6. Pickup Inspection Module
7. Return Inspection & Damage Charges
8. Booking Status Management (strict transition map)
9. Pricing & Add-On Management
10. Cancellation Policy Engine (time-tiered)
11. Customer Rental History
12. Branch Fleet Utilization Reports
13. Role-Based Access Control (`authenticate` + `authorize(...roles)`)

## 14. Authentication Flow
1. Customer registers (`POST /api/auth/register`) or logs in (`POST /api/auth/login`).
2. Server verifies credentials (bcrypt compare), issues a JWT containing `{ id, role }`, signed with `JWT_SECRET`, expiring per `JWT_EXPIRES_IN`.
3. Frontend stores the token in `localStorage` and an Axios interceptor attaches `Authorization: Bearer <token>` to every request.
4. `authenticate` middleware verifies the token on protected routes and re-fetches the user from MongoDB (so a deactivated user is rejected immediately, even mid-token-lifetime).

## 15. Authorization Flow
Every protected route chains `authenticate` then `authorize('ROLE1', 'ROLE2', ...)`. `authorize` checks `req.user.role` against the allowed list and returns `403 FORBIDDEN` on mismatch. Branch-level checks (a staff member may only act on bookings/vehicles for their own `branchId`) are additionally enforced inside the relevant controllers.

## 16. Booking Conflict Logic
A vehicle is unavailable for a requested `[startDate, endDate)` range if **any** existing booking with status `RESERVED` or `PICKED_UP` satisfies:
```
existing.startDate < requested.endDate  AND  existing.endDate > requested.startDate
```
`CANCELLED` and `RETURNED` bookings are excluded from this check. This logic lives in `backend/services/bookingService.js` (`isVehicleAvailable`) and is used by both the availability search endpoint and the booking-creation flow.

**Note on MongoDB transactions**: booking creation deliberately does **not** use `mongoose.startSession()`/multi-document transactions. Transactions require MongoDB to run as a replica set, which a default local `mongod` is not — using them caused `"Transaction numbers are only allowed on a replica set member or mongos"` in local development. Instead, `createBooking` performs the availability check, then re-verifies availability immediately before the insert, which keeps the race-condition window small without requiring replica-set infrastructure. All business rules (overlap validation, pricing, add-on validation, status checks) are unchanged.

## 17. Booking Status Workflow
```
RESERVED ──▶ PICKED_UP ──▶ RETURNED
   │
   └──▶ CANCELLED
```
Enforced via an explicit transition map (`ALLOWED_TRANSITIONS` in `bookingService.js`) — e.g. `RETURNED` and `CANCELLED` have no allowed next states, so `RETURNED → PICKED_UP` or `CANCELLED → PICKED_UP` are rejected with `400 INVALID_STATUS_TRANSITION`.

## 18. Cancellation Policy
Calculated in `backend/services/cancellationService.js`, based on hours between "now" and the booking's `startDate`:
| Time before pickup | Charge |
|---|---|
| > 48 hours | 0% (full refund) |
| 24–48 hours | 25% |
| < 24 hours | 50% |
| After pickup (`PICKED_UP`) | Cancellation not allowed |

## 19. Setup Instructions
### Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection string to a hosted instance)
- npm

### Clone / open the project
Open the `vehicle-rental-management-system` folder in VS Code.

## 20. Environment Variables
**backend/.env** (copy from `backend/.env.example`):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vehicle_rental
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
**frontend/.env** (copy from `frontend/.env.example`):
```
VITE_API_URL=http://localhost:5000/api
```

## 21. How to Run the Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # nodemon, auto-restarts on changes
# or: npm start
```
Server runs at `http://localhost:5000`. Health check: `GET /api/health`.

## 22. How to Run the Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App runs at `http://localhost:5173`.

## 23. How to Seed the Database
Make sure MongoDB is running and `backend/.env` is configured, then:
```bash
cd backend
npm run seed
```
This clears existing data and creates 3 branches, 10 vehicles, 3 add-ons, and the three demo accounts below.

## 24. Demo Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@rental.com | Admin@123 |
| Branch Staff | staff@rental.com | Staff@123 |
| Customer | customer@rental.com | Customer@123 |

## 25. Postman Instructions
1. Open Postman → Import → select `postman/Vehicle-Rental-API.postman_collection.json`.
2. The collection uses variables `{{baseUrl}}` (defaults to `http://localhost:5000/api`) and `{{token}}`.
3. Run **Auth → Login** for the role you want to test, copy the `data.token` from the response, and set it as the collection variable `token` (Collection → Variables tab, or use a Postman test script to auto-set it).
4. Other variables (`branchId`, `vehicleId`, `bookingId`, `addonId`, `customerId`, `userId`) can be filled in from earlier responses as you go.

## 26. Known Limitations
- No email/SMS notifications for booking confirmations or reminders (out of scope for this academic project).
- No payment gateway integration — `totalAmount`/`cancellationCharge` are calculated and tracked, but no real payment is processed.
- Image uploads aren't implemented; the `image` field on vehicles accepts a URL string only.
- Single-currency (₹) assumption throughout.
- `npm install` could not be run in the sandbox this project was generated in (no network access), so dependencies should be installed and verified in your local VS Code environment. Every backend `.js` file was syntax-checked with `node --check` and passed.

## 27. Future Enhancements
- Payment gateway integration (Razorpay/Stripe) tied to booking confirmation.
- Email/SMS notifications for booking, pickup, and return events.
- Vehicle image upload (multer + cloud storage) instead of URL-only images.
- Loyalty/discount program for repeat customers.
- Automatic vehicle-to-MAINTENANCE flagging when return inspection damage exceeds a threshold.
- Pagination and server-side filtering on list endpoints for large fleets.

---

## MongoDB Indexes (Rationale)
| Collection | Index | Why |
|---|---|---|
| users | `{ email: 1 }` unique | Fast login lookups; enforces one account per email |
| branches | `{ name: 1 }` | Fast branch lookup/sort by name |
| vehicles | `{ branchId: 1 }` | Fast "vehicles at this branch" queries (search, staff dashboard) |
| vehicles | `{ registrationNumber: 1 }` unique | Enforces no duplicate vehicle registrations |
| bookings | `{ customerId: 1 }` | Fast "my bookings" / rental history queries |
| bookings | `{ vehicleId: 1 }` | Fast overlap-check queries for a given vehicle |
| bookings | `{ branchId: 1 }` | Fast branch-scoped booking queries for staff |
| bookings | `{ startDate: 1, endDate: 1 }` | Speeds up the date-range overlap query used by the conflict/availability logic |
| inspections | `{ bookingId: 1 }` | Fast lookup of a booking's pickup/return inspection records |
