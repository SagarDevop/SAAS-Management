const express = require('express');
const router = express.Router();
const { getWalletOverview, recordTransaction } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getWalletOverview);
router.post('/transaction', recordTransaction);

module.exports = router;

