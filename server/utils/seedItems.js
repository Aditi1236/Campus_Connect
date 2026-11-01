// Run with: npm run seed:items
// Adds sample lost-and-found listings for the configured administrator.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');

const sampleItems = [
  {
    itemName: 'Blue wireless earbuds case',
    category: 'Electronics',
    description: 'A blue earbuds case was found near the library entrance.',
    itemType: 'found',
    location: 'Central Library entrance',
    date: new Date('2026-10-29'),
    additionalDetails: 'Small scratch on the back of the case.',
  },
  {
    itemName: 'Calculus textbook',
    category: 'Books & Stationery',
    description: 'A calculus textbook was left on a desk in the study hall.',
    itemType: 'found',
    location: 'Engineering block study hall',
    date: new Date('2026-10-28'),
    additionalDetails: 'Name written inside the front cover.',
  },
  {
    itemName: 'Black wallet',
    category: 'Wallets & Bags',
    description: 'A black wallet was lost somewhere between the cafeteria and lecture halls.',
    itemType: 'lost',
    location: 'Cafeteria / lecture hall walkway',
    date: new Date('2026-10-30'),
    additionalDetails: 'Contains a student ID and a few cards.',
  },
  {
    itemName: 'Silver keyring with three keys',
    category: 'Keys',
    description: 'A silver keyring with three keys was found beside the sports ground.',
    itemType: 'found',
    location: 'Sports ground bleachers',
    date: new Date('2026-10-27'),
    additionalDetails: 'One key has a small green plastic tag.',
  },
  {
    itemName: 'Green insulated water bottle',
    category: 'Water Bottles & Lunch Boxes',
    description: 'A green insulated water bottle was lost after an afternoon class.',
    itemType: 'lost',
    location: 'Science building, second floor',
    date: new Date('2026-10-31'),
    additionalDetails: 'Sticker of a mountain on the bottom.',
  },
  {
    itemName: 'Gray hoodie',
    category: 'Clothing & Accessories',
    description: 'A gray hoodie was found on a chair in the student center.',
    itemType: 'found',
    location: 'Student center lounge',
    date: new Date('2026-10-26'),
    additionalDetails: 'Small embroidered initials on the inside label.',
  },
];

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Copy .env.example to .env and set it.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@findit.com').toLowerCase();
    const admin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (!admin) {
      throw new Error(`Admin account ${adminEmail} was not found. Run "npm run seed" first.`);
    }

    let inserted = 0;
    for (const sample of sampleItems) {
      const exists = await Item.exists({
        itemName: sample.itemName,
        itemType: sample.itemType,
        location: sample.location,
      });
      if (!exists) {
        await Item.create({ ...sample, reportedBy: admin._id });
        inserted += 1;
      }
    }

    console.log(`Sample item seeding complete: ${inserted} added, ${sampleItems.length - inserted} already present.`);
  } catch (err) {
    console.error('Item seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
