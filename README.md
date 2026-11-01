# FindIt - Smart Campus Lost & Found Portal

A full-stack MERN web application where students report lost belongings, post found items, search listings and safely claim recovered items. Administrators verify claims and manage users and listings.

Built as a semester mini-project for **Full Stack Development II**.

---

## 1. Problem statement
On a busy campus, lost items are usually reported through scattered WhatsApp groups, notice boards or word of mouth. Items go unclaimed, and there is no safe way to prove ownership. FindIt gives the campus one searchable portal with photographs, status tracking and an admin-verified claim process.

## 2. Objectives
- Let students report lost and found items with photographs.
- Provide fast search and filtering (name, category, location, type, date, status).
- Protect against fraudulent claims by hiding private identifying details and requiring admin approval.
- Give administrators dashboards to manage users, listings and claims.
- Demonstrate React, Express, MongoDB, JWT, bcrypt, Multer and role-based access control.

## 3. Technology stack
| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router DOM, Axios, Hooks (useState, useEffect, useContext), CSS3 |
| Backend | Node.js, Express.js, REST APIs, JWT, bcrypt (bcryptjs), Multer |
| Database | MongoDB + Mongoose |
| Tools | VS Code, Postman, Git/GitHub |

> **Note on bcrypt:** the project uses `bcryptjs`, a pure-JavaScript implementation of the same bcrypt algorithm. It installs on every OS without a C++ compiler. To use the native package, run `npm i bcrypt` and change the single `require('bcryptjs')` line in `server/models/User.js`.

## 4. Main features
**Students:** register / log in, report lost and found items with photos, browse + search + filter, view details, submit claims, track claim status, edit/delete own listings (while still active), edit profile, change password.

**Administrators:** dashboard statistics (MongoDB aggregation), approve/reject claims (item status updates automatically), change item status, remove inappropriate/duplicate listings, view and delete students.

**Security:** bcrypt password hashing, JWT auth, role-based middleware, ownership checks, NoSQL-injection sanitising, input validation, image type + size + magic-byte checks, Helmet, CORS allow-list, login rate limiting, private fields hidden from the public.

## 5. Folder structure
```
findit/
├── client/                      React frontend (Vite)
│   ├── src/
│   │   ├── components/          Navbar, Footer, Sidebar, ItemCard, SearchBar, FilterPanel,
│   │   │                        ProtectedRoute, AdminRoute, ItemForm, ClaimCard, DashboardStats ...
│   │   ├── pages/               Landing, Login, Register, BrowseItems, ItemDetails, dashboards ...
│   │   ├── context/             AuthContext (login state), ToastContext (notifications)
│   │   ├── services/api.js      Axios instance + all API calls
│   │   ├── styles/global.css    Whole design system
│   │   ├── App.jsx              Routes
│   │   └── main.jsx             Entry point
│   ├── vercel.json              SPA rewrite for Vercel
│   └── .env.example
└── server/                      Express backend
    ├── config/db.js             MongoDB connection
    ├── models/                  User, Item, Claim, Image
    ├── controllers/             auth, item, claim, admin, image logic
    ├── routes/                  URL -> controller mapping
    ├── middleware/              auth (JWT + roles), upload (Multer), sanitize, errorHandler
    ├── utils/                   token, image saving, helpers, admin seed script
    ├── uploads/                 local image storage (development)
    ├── server.js                App entry point
    └── .env.example
```

## 6. Database schema
**User** - `name, email (unique), studentId (unique), password (bcrypt hash, hidden by default), role (student|admin), createdAt`

**Item** - `itemName, category, description, itemType (lost|found), location, date, image, additionalDetails (private), status (active|claimed|resolved|closed), reportedBy -> User, createdAt, updatedAt`. Indexes on type/status/date, reporter and category.

**Claim** - `item -> Item, claimant -> User, explanation, identifyingDetails, status (pending|approved|rejected), adminNote, reviewedBy -> User, createdAt, updatedAt`. A partial unique index allows only one *pending* claim per user per item.

**Image** - used only when `STORAGE_MODE=database` (see deployment).

Item lifecycle: `active -> claimed (claim approved) -> resolved (handed over)`; owners can also set `closed`.

## 7. API documentation
Base URL: `http://localhost:5000/api`. Protected routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /auth/register | Public | Create student account |
| POST | /auth/login | Public | Log in, returns JWT |
| GET | /auth/me | Logged in | Current user |
| PUT | /auth/profile | Logged in | Update name / student ID |
| PUT | /auth/password | Logged in | Change password |
| GET | /items | Public | List items. Query: `q, category, itemType, location, date (YYYY-MM-DD), status, page, limit` |
| POST | /items | Logged in | Create item (multipart/form-data, optional `image`) |
| GET | /items/my-listings | Logged in | My items |
| GET | /items/:id | Public | Item details (private details only for owner/admin) |
| PUT | /items/:id | Owner | Update item (only while active/closed) |
| DELETE | /items/:id | Owner | Delete item (only while active/closed) |
| POST | /claims | Logged in | Submit claim `{ item, explanation, identifyingDetails }` |
| GET | /claims/my-claims | Logged in | My claims |
| GET | /claims | Admin | All claims. Query: `status, q` |
| PUT | /claims/:id/status | Admin | `{ status: approved|rejected, adminNote, itemStatus? }` |
| GET | /admin/dashboard | Admin | Statistics + recent activity |
| GET | /admin/users | Admin | Users. Query: `q, role` |
| DELETE | /admin/users/:id | Admin | Delete a student and their data |
| GET | /admin/items | Admin | All items (incl. closed), same filters |
| PUT | /admin/items/:id/status | Admin | Change item status |
| DELETE | /admin/items/:id | Admin | Remove a listing |
| GET | /health | Public | Health check |

Errors always look like `{ "success": false, "message": "..." }` with a proper status code (400, 401, 403, 404, 409, 500).

## 8. Installation (local)
**Requirements:** Node.js 18+, and MongoDB (local install or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env -> set MONGO_URI, a long random JWT_SECRET, and a unique ADMIN_PASSWORD
npm run seed                # creates the admin account
npm run seed:items          # adds sample lost-and-found listings (safe to rerun)
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev                 # App on http://localhost:5173
```

Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` in `server/.env` before creating the admin account. Never use a shared or publicly documented password.

### Environment variables
`server/.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/findit
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
STORAGE_MODE=local
ALLOWED_EMAIL_DOMAIN=
ADMIN_NAME=Campus Admin
ADMIN_EMAIL=admin@findit.com
ADMIN_STUDENT_ID=ADMIN001
ADMIN_PASSWORD=replace_with_a_unique_strong_password
```
`client/.env`
```
VITE_API_URL=http://localhost:5000/api
```

## 9. Testing
Use the app in the browser and Postman. Walk through this checklist:

| # | Scenario | Expected |
|---|---|---|
| 1 | Register a student | 201, logged in, redirected to dashboard |
| 2 | Log in with that student | 200 + token |
| 3 | Log in with wrong password | 401 "Invalid email or password." |
| 4-5 | Report a lost and a found item | Appear in Browse and My listings |
| 6 | Upload a JPG/PNG/WEBP | Image shows on card and detail page |
| 6b | Upload a .pdf or 10 MB file | 400 with a clear message |
| 7 | Search "bag", filter by category/date/status | Results update (query params go to the API) |
| 8 | Edit and delete your own active listing | Works |
| 9 | Edit another student's listing (PUT /items/:id) | 403 |
| 10 | Student B claims student A's found item | Claim appears in My claims as *pending* |
| 10b | Claim the same item twice | 409 |
| 11 | Admin approves the claim | Claim *approved*, item becomes *claimed*, other pending claims auto-rejected |
| 12 | Student calls GET /admin/dashboard | 403 |
| 12b | No token / expired token | 401 |
| 13 | Check item status after approval | `claimed` (or `resolved` if chosen) |
| 14 | Admin dashboard | Counts match the database |
| 15 | Bad IDs, missing fields | 400 / 404 with JSON message |

Postman tip: log in, copy the `token`, and add `Authorization: Bearer <token>` (Auth tab -> Bearer Token) to later requests. For `POST /items` use Body -> form-data and a `File` field named `image`.

## 10. Deployment
**Database - MongoDB Atlas:** create a free cluster, add a database user, allow network access (0.0.0.0/0 for a demo), copy the connection string into `MONGO_URI`.

**Backend - Render (Web Service):** root directory `server`, build `npm install`, start `npm start`. Add environment variables:
`NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL=https://your-app.vercel.app`, and **`STORAGE_MODE=database`**.
After the first deploy, open the Render shell and run `npm run seed` to create the admin (or temporarily run the seed locally with the Atlas `MONGO_URI`).

**Why `STORAGE_MODE=database`?** Free hosting disks are temporary - uploaded files vanish on every redeploy. In this mode images are stored inside MongoDB (no paid service needed) and served at `/api/images/:id`, so they persist. Keep `local` for development.

**Frontend - Vercel:** root directory `client`, framework Vite, set `VITE_API_URL=https://your-api.onrender.com/api`. `vercel.json` makes page refreshes work with React Router.

CORS: `CLIENT_URL` accepts several comma-separated origins (e.g. production + preview URLs).

## 11. Viva quick notes
- **JWT flow:** login -> server signs token with `JWT_SECRET` -> client stores it -> Axios interceptor sends it -> `protect` middleware verifies it and loads the user.
- **Authorization:** `adminOnly` checks `req.user.role`; item controllers compare `item.reportedBy` with `req.user._id`.
- **Why hide `additionalDetails`?** A fraudster could read it and copy it into a claim. Only the owner and admins receive it.
- **Aggregation:** `adminController.getDashboard` uses `$group` to count items by type, status and category.
- **State & hooks:** forms use controlled inputs with `useState`; pages fetch data with `useEffect`; `AuthContext` shares login state with `useContext`.
