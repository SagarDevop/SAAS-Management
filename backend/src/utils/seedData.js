const Business = require('../models/Business');
const User = require('../models/User');

async function seedInitialData() {
  try {
    const businessCount = await Business.countDocuments();
    let biz;
    if (businessCount === 0) {
      biz = await Business.create({
        name: 'ShreeDev Paint Service',
        ownerName: 'ShreeDev Admin',
        phone: '9876543210',
        address: 'Main Market, City Center'
      });
      console.log('✓ Seeded Business: ShreeDev Paint Service');
    } else {
      biz = await Business.findOne();
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        businessId: biz._id,
        username: 'admin',
        password: 'password123',
        name: 'ShreeDev Owner',
        role: 'owner'
      });
      console.log('✓ Seeded Owner Account: admin / password123');
    }

    // Production ready: No dummy workers or test attendance records seeded.
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

module.exports = seedInitialData;
