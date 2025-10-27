const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: path.join(__dirname, 'config.env') });
const app = require('./app');

// Prefer a hosted DATABASE env var, fall back to local connection string
const DB = process.env.DATABASE || process.env.DATABASE_LOCAL;

// Debug logging
console.log('\n🔍 Environment Check:');
console.log('DATABASE env var exists:', !!process.env.DATABASE);
console.log('DATABASE_LOCAL env var exists:', !!process.env.DATABASE_LOCAL);
console.log('All env vars:', Object.keys(process.env).join(', '));

if (!DB) {
  console.error('\n❌ FATAL ERROR: DATABASE environment variable is not set!');
  console.error('\n📝 SOLUTION: Add environment variables to your deployment platform:');
  console.error('\nRequired variables:');
  console.error('  DATABASE=<your_mongodb_connection_string>');
  console.error('  NODE_ENV=production');
  console.error('  JWT_SECRET=<your_jwt_secret>');
  console.error('  GMAIL_USER=<your_gmail>');
  console.error('  GMAIL_APP_PASSWORD=<your_app_password>');
  console.error('  ... and others');
  console.error('\nSee DEPLOYMENT.md for full list.\n');
  process.exit(1);
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('✅ DB connection successful!'))
  .catch(err => {
    console.error('❌ DB connection error:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
