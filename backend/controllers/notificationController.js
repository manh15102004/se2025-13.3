const { Notification } = require('../models');

// Lấy thông báo của người dùng
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ success: true, data: notification });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Tạo thông báo (sử dụng nội bộ)
exports.createNotification = async (userId, type, title, message, orderId = null) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            orderId,
            isRead: false
        });
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

module.exports = exports;
