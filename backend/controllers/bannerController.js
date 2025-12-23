const Banner = require('../models/Banner');
const { Op } = require('sequelize');

exports.getBanners = async (req, res) => {
    try {
        const currentDate = new Date();
        const banners = await Banner.findAll({
            where: {
                isActive: true,
                startDate: { [Op.lte]: currentDate },
                [Op.or]: [
                    { endDate: { [Op.gte]: currentDate } },
                    { endDate: null }
                ]
            },
            order: [['priority', 'DESC'], ['createdAt', 'DESC']],
            limit: 3
        });
        res.json({ success: true, data: banners });
    } catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Lấy tất cả banner (đang hoạt động + chờ duyệt)
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.findAll({
            order: [['isActive', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json({ success: true, data: banners });
    } catch (error) {
        console.error('Get all banners error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const {
            image, title, subtitle, startDate, endDate, priority, targetType, targetValue, price,
            titleFontFamily, titleFontSize, titleFontWeight, titleFontStyle, titleColor, titlePositionX, titlePositionY,
            subtitleFontFamily, subtitleFontSize, subtitleFontWeight, subtitleFontStyle, subtitleColor, subtitlePositionX, subtitlePositionY
        } = req.body;
        // Lấy shopId từ người dùng đã xác thực
        const shopId = req.user ? req.user.id : null;

        // Buộc isActive thành false cho banner mới (yêu cầu duyệt)
        const banner = await Banner.create({
            shopId,
            image,
            title,
            subtitle,
            startDate,
            endDate,
            priority,
            targetType,
            targetValue,
            price: price || 0,
            isActive: false,
            // Định dạng font chữ
            titleFontFamily,
            titleFontSize,
            titleFontWeight,
            titleFontStyle,
            titleColor,
            titlePositionX,
            titlePositionY,
            subtitleFontFamily,
            subtitleFontSize,
            subtitleFontWeight,
            subtitleFontStyle,
            subtitleColor,
            subtitlePositionX,
            subtitlePositionY
        });
        res.status(201).json({ success: true, data: banner, message: 'Created successfully. Pending approval.' });
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.approveBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        banner.isActive = true;
        await banner.save();

        res.json({ success: true, data: banner, message: 'Banner approved successfully' });
    } catch (error) {
        console.error('Approve banner error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getPendingBanners = async (req, res) => {
    try {
        const banners = await Banner.findAll({
            where: { isActive: false },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: banners });
    } catch (error) {
        console.error('Get pending banners error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.rejectBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        await banner.destroy(); // Xóa vĩnh viễn để từ chối
        res.json({ success: true, message: 'Banner rejected and deleted' });
    } catch (error) {
        console.error('Reject banner error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMyBanners = async (req, res) => {
    try {
        const shopId = req.user.id;
        const banners = await Banner.findAll({
            where: { shopId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: banners });
    } catch (error) {
        console.error('Get my banners error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Xóa bất kỳ banner nào (đang hoạt động hoặc chờ duyệt)
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem người dùng có phải admin không
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        await banner.destroy();
        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
