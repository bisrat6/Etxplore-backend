const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION:', err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: path.join(__dirname, 'config.env') });
const app = require('./app');

// Prefer a hosted DATABASE env var, fall back to local connection string
const DB = process.env.DATABASE || process.env.DATABASE_LOCAL;

if (!DB) {
  console.error('FATAL ERROR: DATABASE environment variable is not set!');
  console.error('Add DATABASE or DATABASE_LOCAL to your environment variables.');
  process.exit(1);
}

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful'))
  .catch(err => {
    console.error('DB connection error:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION:', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
