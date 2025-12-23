const express = require('express');
const router = express.Router();
const { validateVoucher, applyVoucher, getActiveVouchers } = require('../controllers/voucherController');
const { protect } = require('../middleware/auth');

router.post('/validate', protect, validateVoucher);
router.post('/apply', protect, applyVoucher);
router.get('/active', protect, getActiveVouchers);

module.exports = router;
