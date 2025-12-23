const express = require('express');
const router = express.Router();
const { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAddresses);
router.post('/', protect, createAddress);
router.put('/:addressId', protect, updateAddress);
router.delete('/:addressId', protect, deleteAddress);
router.put('/:addressId/default', protect, setDefaultAddress);

module.exports = router;
