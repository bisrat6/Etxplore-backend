/*
  One-time migration script
  Marks legacy users as verified when they do NOT have an emailVerificationToken

  Usage (from backend folder):
    node scripts/migrate-verify-legacy-users.js

  Ensure your config.env is present and DATABASE_LOCAL is set (same as server.js)
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/userModel');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

// Prefer hosted DATABASE, fall back to local
const DB = process.env.DATABASE || process.env.DATABASE_LOCAL;

if (!DB) {
  console.error('DATABASE or DATABASE_LOCAL not set in config.env');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('Connected to DB');

    // Find users that have no emailVerificationToken and are not verified
    const filter = {
      $and: [
        {
          $or: [
            { emailVerificationToken: { $exists: false } },
            { emailVerificationToken: null }
          ]
        },
        { $or: [{ isVerified: { $exists: false } }, { isVerified: false }] }
      ]
    };

    const usersToUpdate = await User.find(filter).select(
      '_id email isVerified'
    );
    console.log(
      `Found ${usersToUpdate.length} legacy users to mark as verified`
    );

    if (usersToUpdate.length === 0) {
      console.log('No users to update. Exiting.');
      process.exit(0);
    }

    const ids = usersToUpdate.map(u => u._id);

    const res = await User.updateMany(
      { _id: { $in: ids } },
      { $set: { isVerified: true } }
    );

    console.log('Update result:', res);
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
};

run();
