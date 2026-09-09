const User = require('../models/User');

const TPO_USERNAME = process.env.TPO_USERNAME || 'tpoadmin';
const TPO_PASSWORD = process.env.TPO_PASSWORD || 'tpoadmin123';
const TPO_EMAIL = process.env.TPO_EMAIL || 'tpoadmin@smartplacement.com';

const ensureTpoAccount = async () => {
  let tpo = await User.findOne({ username: TPO_USERNAME }).select('+password');

  if (!tpo) {
    tpo = await User.create({
      name: 'Training and Placement Officer',
      username: TPO_USERNAME,
      email: TPO_EMAIL,
      password: TPO_PASSWORD,
      role: 'tpo',
      verificationStatus: 'approved',
      isActive: true,
    });
    console.log(`TPO account created: ${TPO_USERNAME}`);
    return tpo;
  }

  if (tpo.role !== 'tpo' || !tpo.isActive || tpo.verificationStatus !== 'approved') {
    tpo.role = 'tpo';
    tpo.isActive = true;
    tpo.verificationStatus = 'approved';
    await tpo.save();
  }

  return tpo;
};

module.exports = { ensureTpoAccount, TPO_USERNAME };
