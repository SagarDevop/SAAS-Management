const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { sendSMS } = require('../services/smsService');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const mongoose = require('mongoose');

// @desc    Get attendance for a specific date across all active workers
// @route   GET /api/attendance?date=YYYY-MM-DD
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date (YYYY-MM-DD) is required' });
    }

    // Get all active workers
    const workers = await Worker.find({
      businessId: req.businessId,
      status: 'active'
    }).sort({ name: 1 });

    // Get attendance records existing for that date
    const attendanceRecords = await Attendance.find({
      businessId: req.businessId,
      date
    });

    const recordMap = {};
    attendanceRecords.forEach(rec => {
      recordMap[rec.workerId.toString()] = rec;
    });

    // Merge worker list with attendance records
    const attendanceList = workers.map(w => {
      const existing = recordMap[w._id.toString()];
      return {
        workerId: w._id,
        workerCustomId: w.workerId,
        name: w.name,
        dailyWage: w.dailyWage,
        workerType: w.workerType,
        profileImage: w.profileImage,
        fullAttendance: existing ? existing.fullAttendance : false,
        halfAttendance: existing ? existing.halfAttendance : false,
        attendanceUnits: existing ? existing.attendanceUnits : 0,
        earnedAmount: existing ? existing.earnedAmount : 0,
        notes: existing ? existing.notes : '',
        siteName: existing ? existing.siteName : '',
        isSaved: !!existing
      };
    });

    // Calculate daily metrics
    let totalFull = 0;
    let totalHalf = 0;
    let totalUnits = 0;
    let totalLabourExpense = 0;

    attendanceRecords.forEach(r => {
      if (r.fullAttendance) totalFull += 1;
      if (r.halfAttendance) totalHalf += 1;
      totalUnits += r.attendanceUnits;
      totalLabourExpense += r.earnedAmount;
    });

    res.status(200).json({
      success: true,
      date,
      attendanceList,
      summary: {
        totalWorkers: workers.length,
        markedWorkers: attendanceRecords.length,
        totalFull,
        totalHalf,
        totalUnits,
        totalLabourExpense
      }
    });
  } catch (err) {
    console.error('getAttendanceByDate error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving attendance' });
  }
};

// @desc    Save Bulk Attendance for a specific date
// @route   POST /api/attendance/bulk
exports.saveBulkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Valid date and records array required' });
    }

    const businessId = req.businessId;
    const userId = req.user._id;

    let updatedCount = 0;
    let totalNewLabourExpense = 0;

    // Process each worker's attendance idempotently
    for (const record of records) {
      const { workerId, fullAttendance = false, halfAttendance = false, notes = '', siteName = '' } = record;

      const worker = await Worker.findOne({ _id: workerId, businessId });
      if (!worker) continue;

      // Calculate attendance units:
      // Full: 1.0 (9 AM to 6 PM)
      // Half: 0.5 (6 AM to 9 AM)
      // Both: 1.5
      // Absent: 0.0
      let units = 0;
      if (fullAttendance) units += 1.0;
      if (halfAttendance) units += 0.5;

      const earnedAmount = Math.round(units * worker.dailyWage);

      // Check existing record
      const existingAttendance = await Attendance.findOne({
        businessId,
        workerId,
        date
      });

      const previousEarned = existingAttendance ? existingAttendance.earnedAmount : 0;
      const wageDifference = earnedAmount - previousEarned; // Difference to adjust in worker wallet

      if (existingAttendance) {
        existingAttendance.fullAttendance = fullAttendance;
        existingAttendance.halfAttendance = halfAttendance;
        existingAttendance.attendanceUnits = units;
        existingAttendance.wageRate = worker.dailyWage;
        existingAttendance.earnedAmount = earnedAmount;
        existingAttendance.notes = notes;
        if (siteName) existingAttendance.siteName = siteName;
        existingAttendance.updatedBy = userId;
        await existingAttendance.save();
      } else {
        await Attendance.create({
          businessId,
          workerId,
          date,
          fullAttendance,
          halfAttendance,
          attendanceUnits: units,
          wageRate: worker.dailyWage,
          earnedAmount,
          notes,
          siteName,
          createdBy: userId
        });
      }

      // Sync worker wallet and ledger if wage difference exists
      // Accounting Rule: Earning wages increases liability to worker, so wallet balance reduces (becomes more negative)
      if (wageDifference !== 0) {
        const newBalance = worker.walletBalance - wageDifference;
        worker.walletBalance = newBalance;
        await worker.save();

        // Record transaction
        await Transaction.create({
          businessId,
          workerId,
          type: 'Attendance Earnings',
          amount: Math.abs(wageDifference),
          direction: wageDifference > 0 ? 'debit' : 'credit', // debit = owes worker more
          description: `Attendance adjustment for ${date}: ${units} units (Full: ${fullAttendance ? 'Yes' : 'No'}, Half: ${halfAttendance ? 'Yes' : 'No'})`,
          balanceAfter: newBalance,
          date: new Date(date),
          createdBy: userId
        });
      }

      // Send SMS and WhatsApp alert to worker if present
      if (units > 0 && worker.mobile) {
        const msgText = `*ShreeDev Paint Service*\nNamaste ${worker.name}, aapki date ${date} ki attendance (${units} unit) darj ho gayi hai.\nAaj ki kamai: Rs.${earnedAmount}.\nTotal Ledger Balance: Rs.${newBalance < 0 ? `-Rs.${Math.abs(newBalance)} (Baqi)` : `Rs.${newBalance}`}`;
        
        // 1. WhatsApp Real-time Notification
        sendWhatsAppMessage({
          toPhone: worker.mobile,
          textMessage: msgText,
          metadata: {
            businessId,
            workerId: worker._id,
            title: 'Attendance WhatsApp',
            type: fullAttendance ? 'Full Attendance Marked' : 'Half Attendance Marked'
          }
        }).catch(err => console.error('WhatsApp dispatch error:', err));

        // 2. Backup SMS
        sendSMS({
          toPhone: worker.mobile,
          message: `ShreeDev Paint: Namaste ${worker.name}, date ${date} ki hazri (${units} unit) darj. Kamai: Rs.${earnedAmount}.`,
          metadata: {
            businessId,
            workerId: worker._id,
            title: 'Attendance SMS',
            type: fullAttendance ? 'Full Attendance Marked' : 'Half Attendance Marked'
          }
        }).catch(err => console.error('SMS dispatch error:', err));
      }

      totalNewLabourExpense += earnedAmount;
      updatedCount++;
    }

    // Create Notification Log for attendance marking
    await Notification.create({
      businessId,
      title: 'Attendance Marked',
      message: `Bulk attendance saved for ${date} covering ${updatedCount} workers. Total daily labour: ₹${totalNewLabourExpense}`,
      type: 'Full Attendance Marked',
      deliveryChannel: 'in_app'
    });

    res.status(200).json({
      success: true,
      message: `Attendance for ${date} successfully saved for ${updatedCount} workers`,
      updatedCount
    });
  } catch (err) {
    console.error('saveBulkAttendance error:', err);
    res.status(500).json({ success: false, message: 'Server error saving bulk attendance' });
  }
};

