const Worker = require('../models/Worker');
const Transaction = require('../models/Transaction');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const { sendSMS } = require('../services/smsService');
const { sendWhatsAppMessage } = require('../services/whatsappService');

// Generate unique Worker ID, e.g., SD-1001, SD-1002
const generateWorkerId = async (businessId) => {
  const count = await Worker.countDocuments({ businessId });
  const nextNum = 1001 + count;
  let candidate = `SD-${nextNum}`;
  let exists = await Worker.findOne({ businessId, workerId: candidate });
  let offset = 1;
  while (exists) {
    candidate = `SD-${nextNum + offset}`;
    exists = await Worker.findOne({ businessId, workerId: candidate });
    offset++;
  }
  return candidate;
};

// @desc    Get all workers with search and filtering
// @route   GET /api/workers
exports.getWorkers = async (req, res) => {
  try {
    const { status, search, workerType } = req.query;
    const filter = { businessId: req.businessId };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (workerType && workerType !== 'all') {
      filter.workerType = workerType;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { workerId: { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await Worker.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (err) {
    console.error('getWorkers error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving workers' });
  }
};

// @desc    Get single worker profile by ID
// @route   GET /api/workers/:id
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      _id: req.params.id,
      businessId: req.businessId
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Fetch attendance summary
    const attendances = await Attendance.find({
      businessId: req.businessId,
      workerId: worker._id
    }).sort({ date: -1 });

    let totalFull = 0;
    let totalHalf = 0;
    let totalUnits = 0;
    let totalEarned = 0;

    attendances.forEach(att => {
      if (att.fullAttendance) totalFull += 1;
      if (att.halfAttendance) totalHalf += 1;
      totalUnits += att.attendanceUnits;
      totalEarned += att.earnedAmount;
    });

    // Fetch transactions
    const transactions = await Transaction.find({
      businessId: req.businessId,
      workerId: worker._id
    }).sort({ date: -1 });

    let totalAdvances = 0;
    let totalBonuses = 0;
    let totalPayments = 0;

    transactions.forEach(t => {
      if (t.type === 'Advance Given') totalAdvances += t.amount;
      if (t.type === 'Bonus Given') totalBonuses += t.amount;
      if (t.type === 'Salary/Payment Given') totalPayments += t.amount;
    });

    res.status(200).json({
      success: true,
      worker,
      summary: {
        totalFull,
        totalHalf,
        totalUnits,
        totalEarned,
        totalAdvances,
        totalBonuses,
        totalPayments,
        openingBalance: worker.openingBalance,
        currentBalance: worker.walletBalance
      },
      attendances: attendances.slice(0, 30), // recent 30
      transactions: transactions.slice(0, 30) // recent 30
    });
  } catch (err) {
    console.error('getWorkerById error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching worker profile' });
  }
};

// @desc    Register a new worker
// @route   POST /api/workers
exports.createWorker = async (req, res) => {
  try {
    const {
      name,
      mobile,
      dailyWage,
      openingBalance = 0,
      profileImage = '',
      aadhaarFront = '',
      aadhaarBack = '',
      bankDetails = {},
      address = '',
      joiningDate,
      workerType = 'Painter'
    } = req.body;

    if (!name || !mobile || dailyWage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile, and daily wage are mandatory fields'
      });
    }

    const workerId = await generateWorkerId(req.businessId);

    const initialOpening = Number(openingBalance) || 0;

    const worker = await Worker.create({
      businessId: req.businessId,
      workerId,
      name: name.trim(),
      mobile: mobile.trim(),
      dailyWage: Number(dailyWage),
      openingBalance: initialOpening,
      walletBalance: initialOpening, // Negative = owes worker, Positive = advance balance
      profileImage,
      aadhaarFront,
      aadhaarBack,
      bankDetails,
      address,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      workerType
    });

    // If opening balance is non-zero, record initial transaction
    if (initialOpening !== 0) {
      await Transaction.create({
        businessId: req.businessId,
        workerId: worker._id,
        type: 'Opening Balance',
        amount: Math.abs(initialOpening),
        direction: initialOpening > 0 ? 'credit' : 'debit',
        description: 'Initial opening balance',
        balanceAfter: initialOpening,
        createdBy: req.user?._id
      });
    }

    // Create Notification
    await Notification.create({
      businessId: req.businessId,
      workerId: worker._id,
      title: 'Worker Registration',
      message: `New worker ${worker.name} (ID: ${worker.workerId}) registered with daily wage ₹${worker.dailyWage}`,
      type: 'Worker Registration',
      deliveryChannel: 'in_app'
    });

    // Send Welcome WhatsApp & SMS to newly registered worker
    if (worker.mobile) {
      const welcomeMsg = `*ShreeDev Paint Service*\nNamaste ${worker.name}, aapka worker registration safalta-purvak ho gaya hai.\nWorker ID: ${worker.workerId}\nDaily Wage: Rs.${worker.dailyWage}`;
      
      // WhatsApp notification
      sendWhatsAppMessage({
        toPhone: worker.mobile,
        textMessage: welcomeMsg,
        metadata: {
          businessId: req.businessId,
          workerId: worker._id,
          title: 'Welcome WhatsApp',
          type: 'Worker Registration'
        }
      }).catch(err => console.error('Registration WhatsApp error:', err));

      // Backup SMS
      sendSMS({
        toPhone: worker.mobile,
        message: `ShreeDev Paint: Namaste ${worker.name}, registration complete. Worker ID: ${worker.workerId}, Wage: Rs.${worker.dailyWage}.`,
        metadata: {
          businessId: req.businessId,
          workerId: worker._id,
          title: 'Welcome SMS',
          type: 'Worker Registration'
        }
      }).catch(err => console.error('Registration SMS dispatch error:', err));
    }

    res.status(201).json({
      success: true,
      worker,
      message: 'Worker registered successfully'
    });
  } catch (err) {
    console.error('createWorker error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create worker' });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/:id
exports.updateWorker = async (req, res) => {
  try {
    const {
      name,
      mobile,
      dailyWage,
      status,
      profileImage,
      aadhaarFront,
      aadhaarBack,
      bankDetails,
      address,
      joiningDate,
      workerType
    } = req.body;

    const worker = await Worker.findOne({
      _id: req.params.id,
      businessId: req.businessId
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    if (name) worker.name = name.trim();
    if (mobile) worker.mobile = mobile.trim();
    if (dailyWage !== undefined) worker.dailyWage = Number(dailyWage);
    if (status) worker.status = status;
    if (profileImage !== undefined) worker.profileImage = profileImage;
    if (aadhaarFront !== undefined) worker.aadhaarFront = aadhaarFront;
    if (aadhaarBack !== undefined) worker.aadhaarBack = aadhaarBack;
    if (bankDetails) worker.bankDetails = bankDetails;
    if (address !== undefined) worker.address = address;
    if (joiningDate) worker.joiningDate = new Date(joiningDate);
    if (workerType) worker.workerType = workerType;

    await worker.save();

    res.status(200).json({
      success: true,
      worker,
      message: 'Worker updated successfully'
    });
  } catch (err) {
    console.error('updateWorker error:', err);
    res.status(500).json({ success: false, message: 'Failed to update worker' });
  }
};

// @desc    Toggle Worker Active/Inactive status
// @route   PATCH /api/workers/:id/status
exports.toggleWorkerStatus = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      _id: req.params.id,
      businessId: req.businessId
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    worker.status = worker.status === 'active' ? 'inactive' : 'active';
    await worker.save();

    res.status(200).json({
      success: true,
      status: worker.status,
      message: `Worker marked as ${worker.status}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

