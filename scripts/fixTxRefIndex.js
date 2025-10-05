const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const url = process.env.DATABASE_LOCAL || 'mongodb://localhost:27017';
const dbName =
  (process.env.DATABASE_LOCAL && process.env.DATABASE_LOCAL.split('/').pop()) ||
  'etxplore';

(async function fixIndex() {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection('bookings');
    const indexes = await coll.indexes();
    const txIndex = indexes.find(i => i.name === 'txRef_1');
    if (!txIndex) {
      console.log('No txRef_1 index found — nothing to do.');
      return process.exit(0);
    }

    console.log('Found index:', txIndex);

    // If it's unique, drop and recreate a partial (sparse) index on txRef to avoid duplicate nulls
    if (txIndex.unique) {
      console.log('Dropping unique txRef_1 index...');
      await coll.dropIndex('txRef_1');
      console.log(
        'Recreating partial index on txRef for documents where txRef exists...'
      );
      await coll.createIndex(
        { txRef: 1 },
        {
          name: 'txRef_1',
          unique: true,
          partialFilterExpression: { txRef: { $type: 'string' } }
        }
      );
      console.log('Recreated partial index txRef_1');
    } else {
      console.log('txRef_1 exists and is not unique — no change required.');
    }
  } catch (err) {
    console.error('Failed to fix txRef index:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
  process.exit(0);
})();
