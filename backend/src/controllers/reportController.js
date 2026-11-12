const Attendance = require('../models/Attendance');
const Transaction = require('../models/Transaction');
const Worker = require('../models/Worker');

// @desc    Get monthly report data
// @route   GET /api/reports/monthly?year=YYYY&month=MM
exports.getMonthlyReport = async (req, res) => {
  try {
    const businessId = req.businessId;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);

    // Format month prefix e.g. "2026-11"
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const datePrefix = `${year}-${monthStr}`;

    // 1. Attendance aggregation for the month
    const monthlyAttendance = await Attendance.find({
      businessId,
      date: { $regex: `^${datePrefix}` }
    }).populate('workerId', 'name workerId dailyWage');

    let fullAttendanceUnits = 0;
    let halfAttendanceUnits = 0;
    let totalAttendanceUnits = 0;
    let totalLabourEarnings = 0;
    const workerAttendanceMap = {};

    monthlyAttendance.forEach(att => {
      if (att.fullAttendance) fullAttendanceUnits += 1.0;
      if (att.halfAttendance) halfAttendanceUnits += 0.5;
      totalAttendanceUnits += att.attendanceUnits;
      totalLabourEarnings += att.earnedAmount;

      const wId = att.workerId?._id?.toString() || 'unknown';
      if (!workerAttendanceMap[wId]) {
        workerAttendanceMap[wId] = {
          name: att.workerId?.name || 'Worker',
          workerCustomId: att.workerId?.workerId || '',
          full: 0,
          half: 0,
          units: 0,
          earned: 0
        };
      }
      if (att.fullAttendance) workerAttendanceMap[wId].full += 1;
      if (att.halfAttendance) workerAttendanceMap[wId].half += 1;
      workerAttendanceMap[wId].units += att.attendanceUnits;
      workerAttendanceMap[wId].earned += att.earnedAmount;
    });

    // 2. Transactions aggregation for the month
    const startDate = new Date(`${datePrefix}-01T00:00:00.000Z`);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const monthlyTransactions = await Transaction.find({
      businessId,
      date: { $gte: startDate, $lte: endDate }
    });

    let totalAdvances = 0;
    let totalBonuses = 0;
    let totalPayments = 0;

    monthlyTransactions.forEach(t => {
      if (t.type === 'Advance Given') totalAdvances += t.amount;
      if (t.type === 'Bonus Given') totalBonuses += t.amount;
      if (t.type === 'Salary/Payment Given') totalPayments += t.amount;
    });

    // 3. Current Total Outstanding Payable
    const allWorkers = await Worker.find({ businessId });
    let totalOutstandingPayable = 0;
    allWorkers.forEach(w => {
      if (w.walletBalance < 0) totalOutstandingPayable += Math.abs(w.walletBalance);
    });

    res.status(200).json({
      success: true,
      period: { year, month, datePrefix },
      summary: {
        totalWorkers: allWorkers.length,
        fullAttendanceUnits,
        halfAttendanceUnits,
        totalAttendanceUnits,
        totalLabourEarnings,
        totalAdvances,
        totalBonuses,
        totalPayments,
        totalOutstandingPayable
      },
      workerBreakdown: Object.values(workerAttendanceMap)
    });
  } catch (err) {
    console.error('getMonthlyReport error:', err);
    res.status(500).json({ success: false, message: 'Server error generating monthly report' });
  }
};

// @desc    Get yearly report data
// @route   GET /api/reports/yearly?year=YYYY
exports.getYearlyReport = async (req, res) => {
  try {
    const businessId = req.businessId;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyStats = [];
    let yearlyTotalLabour = 0;
    let yearlyTotalAdvances = 0;
    let yearlyTotalPayments = 0;

    for (let m = 1; m <= 12; m++) {
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const prefix = `${year}-${monthStr}`;

      const attendances = await Attendance.find({
        businessId,
        date: { $regex: `^${prefix}` }
      });

      let labourExpense = 0;
      let units = 0;
      attendances.forEach(a => {
        labourExpense += a.earnedAmount;
        units += a.attendanceUnits;
      });

      const startDate = new Date(`${prefix}-01T00:00:00.000Z`);
      const endDate = new Date(year, m, 0, 23, 59, 59, 999);

      const transactions = await Transaction.find({
        businessId,
        date: { $gte: startDate, $lte: endDate }
      });

      let advances = 0;
      let payments = 0;
      transactions.forEach(t => {
        if (t.type === 'Advance Given') advances += t.amount;
        if (t.type === 'Salary/Payment Given') payments += t.amount;
      });

      yearlyTotalLabour += labourExpense;
      yearlyTotalAdvances += advances;
      yearlyTotalPayments += payments;

      monthlyStats.push({
        month: new Date(year, m - 1).toLocaleString('default', { month: 'short' }),
        units,
        labourExpense,
        advances,
        payments
      });
    }

    const workers = await Worker.find({ businessId });
    let yearEndOutstanding = 0;
    workers.forEach(w => {
      if (w.walletBalance < 0) yearEndOutstanding += Math.abs(w.walletBalance);
    });

    res.status(200).json({
      success: true,
      year,
      summary: {
        yearlyTotalLabour,
        yearlyTotalAdvances,
        yearlyTotalPayments,
        yearEndOutstanding
      },
      monthlyStats
    });
  } catch (err) {
    console.error('getYearlyReport error:', err);
    res.status(500).json({ success: false, message: 'Server error generating yearly report' });
  }
};

