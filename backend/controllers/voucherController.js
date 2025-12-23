const { Voucher } = require('../models');
const { Op } = require('sequelize');

// Kiểm tra mã giảm giá
exports.validateVoucher = async (req, res) => {
    try {
        const { code, orderValue } = req.body;

        const voucher = await Voucher.findOne({
            where: {
                code: code.toUpperCase(),
                isActive: true,
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gte]: new Date() },
            },
        });

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ' });
        }

        // Kiểm tra giới hạn sử dụng
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (orderValue < voucher.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} đ`,
            });
        }

        // Tính toán mức giảm giá
        let discount = 0;
        if (voucher.discountType === 'percentage') {
            discount = (orderValue * voucher.discountValue) / 100;
            if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                discount = voucher.maxDiscount;
            }
        } else {
            discount = voucher.discountValue;
        }

        res.status(200).json({
            success: true,
            data: {
                voucher,
                discount: Math.round(discount),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Áp dụng mã giảm giá (tăng số lượt sử dụng)
exports.applyVoucher = async (req, res) => {
    try {
        const { code } = req.body;

        const voucher = await Voucher.findOne({
            where: { code: code.toUpperCase() },
        });

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }

        await voucher.increment('usedCount');

        res.status(200).json({ success: true, message: 'Voucher applied' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy tất cả mã giảm giá đang hoạt động
exports.getActiveVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.findAll({
            where: {
                isActive: true,
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gte]: new Date() },
            },
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
