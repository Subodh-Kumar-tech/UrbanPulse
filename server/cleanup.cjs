const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('complaints').deleteMany({ img: { $regex: '^/uploads/' } });
  console.log('Deleted', result.deletedCount, 'old complaints with broken uploads');
  process.exit(0);
});
