// Run with:  npm run seed
// Creates the first administrator account using the ADMIN_* values in .env
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const email = (process.env.ADMIN_EMAIL || 'admin@findit.com').toLowerCase();
    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = 'admin';
      await admin.save();
      console.log(`Existing user ${email} promoted to admin.`);
    } else {
      if (!process.env.ADMIN_PASSWORD) {
        throw new Error('Set ADMIN_PASSWORD in server/.env before creating the admin account.');
      }

      admin = await User.create({
        name: process.env.ADMIN_NAME || 'Campus Admin',
        email,
        studentId: (process.env.ADMIN_STUDENT_ID || 'ADMIN001').toUpperCase(),
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`Admin created -> email: ${email}`);
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
