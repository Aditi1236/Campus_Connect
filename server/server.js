// FindIt API entry point.
// Loads settings, connects to MongoDB, registers middleware + routes, then starts listening.
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const sanitize = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { asyncHandler } = require('./utils/httpError');

const app = express();

// Needed on Render/Heroku so rate limiting sees the real client IP
app.set('trust proxy', 1);

// ---------- Security & utility middleware ----------
// crossOriginResourcePolicy "cross-origin" lets the React site (another domain) display our images
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim());
if (process.env.RENDER_EXTERNAL_URL) allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);

app.use(
  cors({
    origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitize);

// Limit login/registration attempts to slow down password guessing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ---------- Static files (local image storage) ----------
const uploadsDir = path.join(__dirname, 'uploads');
if (process.env.STORAGE_MODE !== 'database') {
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
}

// ---------- Routes ----------
let databaseConnection;
app.use('/api', asyncHandler(async (req, res, next) => {
  if (!databaseConnection) {
    databaseConnection = connectDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }
  await databaseConnection;
  next();
}));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'FindIt API is running' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/images', require('./routes/imageRoutes'));

const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api(?:\/|$)|assets(?:\/|$)|uploads(?:\/|$))/, (req, res, next) => {
    if (!req.accepts('html')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ---------- Errors (must be last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
    process.exit(1);
  }
  databaseConnection = connectDB();
  databaseConnection
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch((err) => {
      console.error('Could not start server:', err.message);
      process.exit(1);
    });
}

module.exports = app;
