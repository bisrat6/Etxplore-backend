const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const url = process.env.DATABASE_LOCAL || 'mongodb://localhost:27017';
const dbName =
  (process.env.DATABASE_LOCAL && process.env.DATABASE_LOCAL.split('/').pop()) ||
  'etxplore';

(async function removePending() {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    const db = client.db(dbName);
    // Collection name is the pluralized, lowercased model name by default: 'pendingpayments'
    const collName = 'pendingpayments';
    const collection = db.collection(collName);
    const res = await collection.deleteMany({});
    console.log('Removed pending payments count:', res.deletedCount);
    // Optionally drop the collection if empty
    const remaining = await collection.countDocuments();
    if (remaining === 0) {
      try {
        await collection.drop();
        console.log('Dropped collection', collName);
      } catch (e) {
        /* ignore */
      }
    }
  } catch (err) {
    console.error('Failed to remove pending payments:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
  process.exit(0);
})();
