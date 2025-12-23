// Add to backend/controllers/notificationController.js

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.count({
            where: {
                userId,
                isRead: false
            }
        });

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.update(
            { isRead: true },
            { where: { userId, isRead: false } }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
