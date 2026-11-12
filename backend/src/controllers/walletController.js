const Worker = require('../models/Worker');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { sendSMS } = require('../services/smsService');

// Balance convention:
// NEGATIVE: Business owes money to worker (Earned wages or bonuses subtract from balance)
// POSITIVE: Worker has received more money than currently earned (Advances or payments add to balance)
// ZERO: Settled

// @desc    Get all wallet ledger summaries across all workers
// @route   GET /api/wallet/summary
exports.getWalletOverview = async (req, res) => {
  try {
    const businessId = req.businessId;

    const workers = await Worker.find({ businessId }).sort({ name: 1 });

    let totalOutstandingPayable = 0; // sum of all negative balances
    let totalAdvancesOutstanding = 0; // sum of all positive balances
    let totalWalletCount = workers.length;

    const workerLedgers = workers.map(w => {
      if (w.walletBalance < 0) {
        totalOutstandingPayable += Math.abs(w.walletBalance);
      } else if (w.walletBalance > 0) {
        totalAdvancesOutstanding += w.walletBalance;
      }

      return {
        _id: w._id,
        workerId: w.workerId,
        name: w.name,
        mobile: w.mobile,
        dailyWage: w.dailyWage,
        status: w.status,
        walletBalance: w.walletBalance,
        profileImage: w.profileImage
      };
    });

    // Recent 20 transactions across the entire business
    const recentTransactions = await Transaction.find({ businessId })
      .populate('workerId', 'name workerId')
      .sort({ date: -1, createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      summary: {
        totalOutstandingPayable,
        totalAdvancesOutstanding,
        totalWalletCount
      },
      workerLedgers,
      recentTransactions
    });
  } catch (err) {
    console.error('getWalletOverview error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving wallet overview' });
  }
};

// @desc    Record a manual financial transaction (Advance, Bonus, Payment, Adjustment)
// @route   POST /api/wallet/transaction
exports.recordTransaction = async (req, res) => {
  try {
    const businessId = req.businessId;
    const userId = req.user._id;

    const {
      workerId,
      type, // 'Advance Given', 'Bonus Given', 'Salary/Payment Given', 'Other Adjustment'
      amount,
      adjustmentDirection, // 'credit' (adds to balance) or 'debit' (subtracts from balance) for Other Adjustment
      description,
      date = new Date()
    } = req.body;

    if (!workerId || !type || amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Worker, transaction type, and valid positive amount are required'
      });
    }

    if (type === 'Other Adjustment' && !description) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory description required for Other Adjustment'
      });
    }

    const worker = await Worker.findOne({ _id: workerId, businessId });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const parsedAmount = Math.round(Number(amount));
    let newBalance = worker.walletBalance;
    let direction = 'credit';
    let defaultDesc = description;

    // Calculation Rules:
    // Attendance Earnings: Subtract earned wages from balance (done in attendanceController)
    // Advance Given: Add advance amount to balance (credit)
    // Bonus Given: Subtract bonus amount from balance (debit, business owes worker bonus)
    // Salary/Payment Given: Add payment amount to balance (credit, reduces business liability)
    // Other Adjustment: debit or credit based on input
    switch (type) {
      case 'Advance Given':
        newBalance = worker.walletBalance + parsedAmount;
        direction = 'credit';
        if (!defaultDesc) defaultDesc = `Advance paid to worker`;
        break;

      case 'Bonus Given':
        newBalance = worker.walletBalance - parsedAmount;
        direction = 'debit';
        if (!defaultDesc) defaultDesc = `Bonus awarded to worker`;
        break;

      case 'Salary/Payment Given':
        newBalance = worker.walletBalance + parsedAmount;
        direction = 'credit';
        if (!defaultDesc) defaultDesc = `Salary/Payment disbursed`;
        break;

      case 'Other Adjustment':
        if (adjustmentDirection === 'debit') {
          newBalance = worker.walletBalance - parsedAmount;
          direction = 'debit';
        } else {
          newBalance = worker.walletBalance + parsedAmount;
          direction = 'credit';
        }
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid transaction type' });
    }

    // Update worker's live balance
    worker.walletBalance = newBalance;
    await worker.save();

    // Create immutable ledger transaction record
    const transaction = await Transaction.create({
      businessId,
      workerId: worker._id,
      type,
      amount: parsedAmount,
      direction,
      description: defaultDesc,
      date: new Date(date),
      balanceAfter: newBalance,
      createdBy: userId
    });

    // Create Activity Notification
    let notifType = 'General';
    if (type === 'Advance Given') notifType = 'Advance Added';
    if (type === 'Bonus Given') notifType = 'Bonus Added';
    if (type === 'Salary/Payment Given') notifType = 'Payment Added';
    if (type === 'Other Adjustment') notifType = 'Other Wallet Adjustment';

    await Notification.create({
      businessId,
      workerId: worker._id,
      title: type,
      message: `${type} of ₹${parsedAmount} recorded for ${worker.name}. Balance: ${newBalance < 0 ? `-₹${Math.abs(newBalance)}` : `₹${newBalance}`}`,
      type: notifType,
      deliveryChannel: 'in_app'
    });

    // Send SMS alert to worker for Advance / Payment / Bonus
    if (worker.mobile) {
      let smsText = '';
      if (type === 'Advance Given') {
        smsText = `ShreeDev Paint Service: Namaste ${worker.name}, aapko Rs.${parsedAmount} ka advance diya gaya hai.`;
      } else if (type === 'Salary/Payment Given') {
        smsText = `ShreeDev Paint Service: Namaste ${worker.name}, aapka payment Rs.${parsedAmount} jama kiya gaya hai.`;
      } else if (type === 'Bonus Given') {
        smsText = `ShreeDev Paint Service: Badhai ho ${worker.name}, aapko Rs.${parsedAmount} ka bonus diya gaya hai.`;
      }

      if (smsText) {
        sendSMS({
          toPhone: worker.mobile,
          message: smsText,
          metadata: {
            businessId,
            workerId: worker._id,
            title: `${type} SMS`,
            type: notifType
          }
        }).catch(err => console.error('Wallet SMS dispatch error:', err));
      }
    }

    res.status(201).json({
      success: true,
      transaction,
      workerBalance: newBalance,
      message: `${type} recorded successfully`
    });
  } catch (err) {
    console.error('recordTransaction error:', err);
    res.status(500).json({ success: false, message: 'Server error recording transaction' });
  }
};

