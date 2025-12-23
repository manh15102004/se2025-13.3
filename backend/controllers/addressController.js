const { Address } = require('../models');

// Lấy tất cả địa chỉ
exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.findAll({
            where: { userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
        });

        res.status(200).json({ success: true, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo địa chỉ mới
exports.createAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, address, isDefault } = req.body;

        // Nếu đặt làm mặc định, bỏ mặc định các địa chỉ khác
        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { userId } });
        }

        const newAddress = await Address.create({
            userId,
            fullName,
            phone,
            address,
            isDefault: isDefault || false,
        });

        res.status(201).json({ success: true, data: newAddress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const { fullName, phone, address, isDefault } = req.body;

        const addressRecord = await Address.findOne({
            where: { id: addressId, userId },
        });

        if (!addressRecord) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Nếu đặt làm mặc định, bỏ mặc định các địa chỉ khác
        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { userId } });
        }

        await addressRecord.update({ fullName, phone, address, isDefault });

        res.status(200).json({ success: true, data: addressRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const address = await Address.findOne({
            where: { id: addressId, userId },
        });

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await address.destroy();

        res.status(200).json({ success: true, message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Đặt địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const address = await Address.findOne({
            where: { id: addressId, userId },
        });

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await Address.update({ isDefault: false }, { where: { userId } });
        await address.update({ isDefault: true });

        res.status(200).json({ success: true, data: address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
