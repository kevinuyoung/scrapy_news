import mongoose from 'mongoose';

const dbName = 'scrapynews';
mongoose.connect(`mongodb://localhost/${dbName}`, {
  useMongoClient: true
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('mongoose connected success...');
});

db.on('error', (err) => {
  console.error(`mongoose connection error: ${err}`);
});

export default db;
