const express = require('express');
const router = express.Router();
const { getAttendanceByDate, saveBulkAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAttendanceByDate);
router.post('/bulk', saveBulkAttendance);

module.exports = router;

