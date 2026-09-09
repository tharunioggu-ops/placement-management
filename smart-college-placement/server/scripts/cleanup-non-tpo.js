require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

(async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI is missing in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const tpoUsers = await User.find({ role: 'tpo' }).select('_id');
    const tpoIds = tpoUsers.map((u) => u._id);

    const usersDelete = await User.deleteMany({ role: { $ne: 'tpo' } });
    console.log('Deleted non-TPO users:', usersDelete.deletedCount);

    const profilesDelete = await StudentProfile.deleteMany({ userId: { $nin: tpoIds } });
    console.log('Deleted stale student profiles:', profilesDelete.deletedCount);

    const remaining = await User.find({}).select('name email role');
    console.log('Remaining users:', remaining.map((u) => ({ name: u.name, email: u.email, role: u.role })));
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
