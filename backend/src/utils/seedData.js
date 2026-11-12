const mongoose = require('mongoose');
const Business = require('../models/Business');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

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
    let owner;
    if (userCount === 0) {
      owner = await User.create({
        businessId: biz._id,
        username: 'admin',
        password: 'password123',
        name: 'ShreeDev Owner',
        role: 'owner'
      });
      console.log('✓ Seeded Owner Account: admin / password123');
    } else {
      owner = await User.findOne();
    }

    // Seed realistic sample workers if none exist
    const workerCount = await Worker.countDocuments({ businessId: biz._id });
    if (workerCount === 0) {
      const sampleWorkers = [
        {
          name: 'Ramesh Kumar',
          mobile: '9876543211',
          dailyWage: 600,
          workerType: 'Painter',
          address: 'Station Road',
          walletBalance: 0
        },
        {
          name: 'Suresh Verma',
          mobile: '9876543212',
          dailyWage: 650,
          workerType: 'Painter',
          address: 'North Colony',
          walletBalance: 0
        },
        {
          name: 'Dinesh Painter',
          mobile: '9876543213',
          dailyWage: 550,
          workerType: 'Helper',
          address: 'South Street',
          walletBalance: 0
        },
        {
          name: 'Mukesh Sharma',
          mobile: '9876543214',
          dailyWage: 700,
          workerType: 'Supervisor',
          address: 'Industrial Area',
          walletBalance: 0
        },
        {
          name: 'Anil Yadav',
          mobile: '9876543215',
          dailyWage: 600,
          workerType: 'Painter',
          address: 'Old Town',
          walletBalance: 0
        }
      ];

      const today = new Date().toISOString().split('T')[0];

      for (let i = 0; i < sampleWorkers.length; i++) {
        const sw = sampleWorkers[i];
        const workerId = `SD-${1001 + i}`;
        
        const worker = await Worker.create({
          businessId: biz._id,
          workerId,
          name: sw.name,
          mobile: sw.mobile,
          dailyWage: sw.dailyWage,
          workerType: sw.workerType,
          address: sw.address,
          status: 'active',
          walletBalance: 0
        });

        // 1. Mark Full attendance for today for the first 3 workers
        if (i < 3) {
          const units = i === 1 ? 1.5 : 1.0;
          const earned = Math.round(units * sw.dailyWage);
          
          await Attendance.create({
            businessId: biz._id,
            workerId: worker._id,
            date: today,
            fullAttendance: true,
            halfAttendance: i === 1,
            attendanceUnits: units,
            wageRate: sw.dailyWage,
            earnedAmount: earned,
            createdBy: owner._id
          });

          worker.walletBalance = worker.walletBalance - earned;

          await Transaction.create({
            businessId: biz._id,
            workerId: worker._id,
            type: 'Attendance Earnings',
            amount: earned,
            direction: 'debit',
            description: `Attendance earned for ${today}`,
            balanceAfter: worker.walletBalance,
            date: new Date(today),
            createdBy: owner._id
          });
        }

        // 2. Give an advance to Ramesh
        if (i === 0) {
          const advance = 200;
          worker.walletBalance = worker.walletBalance + advance;
          await Transaction.create({
            businessId: biz._id,
            workerId: worker._id,
            type: 'Advance Given',
            amount: advance,
            direction: 'credit',
            description: 'Site tea and travel advance',
            balanceAfter: worker.walletBalance,
            date: new Date(today),
            createdBy: owner._id
          });
        }

        await worker.save();
      }

      await Notification.create({
        businessId: biz._id,
        title: 'System Initialized',
        message: 'Initial paint workers and today attendance records loaded for immediate testing.',
        type: 'General',
        deliveryChannel: 'in_app'
      });

      console.log('✓ Seeded 5 initial workers with sample attendance and ledger entries');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

module.exports = seedInitialData;
