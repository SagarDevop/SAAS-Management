const Business = require('../models/Business');
const User = require('../models/User');

async function seedInitialData() {
  try {
    const businessCount = await Business.countDocuments();
    let biz;
    if (businessCount === 0) {
      biz = await Business.create({
        name: 'Demo Enterprise',
        ownerName: 'Admin',
        ownerEmail: 'admin@kaamsetu.com',
        phone: '9876543210',
        address: 'KaamSetu Central'
      });
      console.log('✓ Seeded Default KaamSetu Demo Business');
    } else {
      biz = await Business.findOne();
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        businessId: biz._id,
        email: 'admin@kaamsetu.com',
        username: 'admin',
        password: 'password123',
        name: 'KaamSetu Admin',
        role: 'owner',
        isVerified: true
      });
      console.log('✓ Seeded Master Account: admin@kaamsetu.com / password123');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

module.exports = seedInitialData;
