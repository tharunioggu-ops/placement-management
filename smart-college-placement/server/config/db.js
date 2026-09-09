const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await conn.connection.collection('studentprofiles').dropIndex('studentId_1').catch(() => {});
      await conn.connection.collection('studentprofiles').createIndex({ studentId: 1 }, { unique: true, sparse: true });
      console.log('StudentProfile unique index normalized for sparse studentId values');
    } catch (indexError) {
      console.warn('StudentProfile index normalization warning:', indexError.message);
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
