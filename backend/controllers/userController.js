const { User, Follow, ShopLike, sequelize } = require('../models');

exports.followUser = async (req, res) => {
    try {
        const { id: followingId } = req.params; // Cửa hàng/người dùng để theo dõi
        const followerId = req.user.id; // Tôi

        if (parseInt(followingId) === parseInt(followerId)) {
            return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
        }

        const follow = await Follow.findOne({ where: { followerId, followingId } });
        if (follow) {
            return res.status(400).json({ success: false, message: 'Already following' });
        }

        await Follow.create({ followerId, followingId });
        res.json({ success: true, message: 'Followed successfully' });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const { id: followingId } = req.params;
        const followerId = req.user.id;

        await Follow.destroy({ where: { followerId, followingId } });
        res.json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.likeShop = async (req, res) => {
    try {
        const { id: shopId } = req.params;
        const userId = req.user.id;

        // Không cho phép tự like
        if (parseInt(shopId) === parseInt(userId)) {
            return res.status(400).json({ success: false, message: 'Cannot like your own shop' });
        }

        const like = await ShopLike.findOne({ where: { userId, shopId } });
        if (like) {
            return res.status(400).json({ success: false, message: 'Already liked' });
        }

        await ShopLike.create({ userId, shopId });
        res.json({ success: true, message: 'Liked successfully' });
    } catch (error) {
        console.error('Like shop error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.unlikeShop = async (req, res) => {
    try {
        const { id: shopId } = req.params;
        const userId = req.user.id;

        await ShopLike.destroy({ where: { userId, shopId } });
        res.json({ success: true, message: 'Unliked successfully' });
    } catch (error) {
        console.error('Unlike shop error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getFeaturedShops = async (req, res) => {
    try {
        const shops = await User.findAll({
            where: { role: ['seller', 'admin'] },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Follows AS follow
                            WHERE follow.followingId = User.id
                        )`),
                        'followersCount'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM ShopLikes AS shopLike
                            WHERE shopLike.shopId = User.id
                        )`),
                        'likesCount'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(AVG(r.rating), 0)
                            FROM Reviews AS r
                            INNER JOIN Products AS p ON r.productId = p.id
                            WHERE p.sellerId = User.id
                        )`),
                        'avgRating'
                    ]
                ]
            },
            order: [
                // Sắp xếp theo: (người theo dõi + like) * 2 + điểm đánh giá trung bình * 10
                // Điều này gán trọng số cho cả tương tác và chất lượng
                [sequelize.literal('(followersCount + likesCount) * 2 + avgRating * 10'), 'DESC']
            ],
            limit: 5
        });

        res.json({ success: true, data: shops });
    } catch (error) {
        console.error('Get featured shops error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
