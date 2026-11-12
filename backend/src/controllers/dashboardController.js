const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @desc    Get live dashboard analytics
// @route   GET /api/dashboard/summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const businessId = req.businessId;
    const today = new Date().toISOString().split('T')[0];

    // 1. Worker Counts
    const totalWorkers = await Worker.countDocuments({ businessId });
    const activeWorkers = await Worker.countDocuments({ businessId, status: 'active' });

    // 2. Today's Attendance
    const todayAttendance = await Attendance.find({ businessId, date: today }).populate('workerId', 'name dailyWage workerId');

    let todayPresent = 0;
    let todayFull = 0;
    let todayHalf = 0;
    let todayUnits = 0;
    let todayLabourExpense = 0;

    const todayAttendanceTable = [];

    todayAttendance.forEach(att => {
      if (att.fullAttendance || att.halfAttendance) {
        todayPresent += 1;
      }
      if (att.fullAttendance) todayFull += 1;
      if (att.halfAttendance) todayHalf += 1;
      todayUnits += att.attendanceUnits;
      todayLabourExpense += att.earnedAmount;

      if (att.workerId) {
        todayAttendanceTable.push({
          id: att._id,
          workerName: att.workerId.name,
          workerCustomId: att.workerId.workerId,
          full: att.fullAttendance ? 1 : 0,
          half: att.halfAttendance ? 1 : 0,
          units: att.attendanceUnits,
          wage: `₹${att.earnedAmount}`
        });
      }
    });

    // 3. Total Outstanding Payable
    // Negative wallet balance = liability (business owes money to worker)
    const workers = await Worker.find({ businessId });
    let totalOutstandingPayable = 0;
    workers.forEach(w => {
      if (w.walletBalance < 0) {
        totalOutstandingPayable += Math.abs(w.walletBalance);
      }
    });

    // 4. Recent Activities from Notifications
    const recentActivities = await Notification.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      summary: {
        totalWorkers,
        activeWorkers,
        todayPresent,
        todayFull,
        todayHalf,
        todayUnits,
        todayLabourExpense,
        totalOutstandingPayable
      },
      todayAttendanceTable: todayAttendanceTable.slice(0, 10),
      recentActivities: recentActivities.map(act => ({
        id: act._id,
        title: act.title,
        desc: act.message,
        time: act.createdAt
      }))
    });
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard summary' });
  }
};

