const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

const User = require('../models/userModel');

const DB = process.env.DATABASE || process.env.DATABASE_LOCAL;

async function autoVerifyAllUsers() {
  try {
    // Connect to database
    await mongoose.connect(DB);
    console.log('✅ Connected to database');

    // Find all unverified users
    const unverifiedUsers = await User.find({ isVerified: false });

    console.log(`Found ${unverifiedUsers.length} unverified users`);

    if (unverifiedUsers.length > 0) {
      // Update all users to verified
      const result = await User.updateMany(
        { isVerified: false },
        { 
          $set: { isVerified: true },
          $unset: { emailVerificationToken: '', emailVerificationExpires: '' }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} users to verified`);
    }

    console.log('✅ All users are now verified!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

autoVerifyAllUsers();

