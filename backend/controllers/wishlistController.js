const { Wishlist } = require('../models');

// Thêm vào danh sách yêu thích
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
            });
        }

        // Kiểm tra đã có trong danh sách yêu thích chưa
        const existing = await Wishlist.findOne({
            where: { userId, productId },
        });

        if (existing) {
            return res.status(200).json({
                success: true,
                message: 'Product already in wishlist',
                data: existing,
            });
        }

        const wishlistItem = await Wishlist.create({
            userId,
            productId,
        });

        res.status(201).json({
            success: true,
            message: 'Added to wishlist',
            data: wishlistItem,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Xóa khỏi danh sách yêu thích
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const deleted = await Wishlist.destroy({
            where: { userId, productId },
        });

        if (deleted === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in wishlist',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Removed from wishlist',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy danh sách yêu thích của tôi
exports.getMyWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlist = await Wishlist.findAll({
            where: { userId },
            include: [
                {
                    association: 'product',
                    attributes: ['id', 'name', 'price', 'image', 'category', 'subCategory', 'quantity', 'rating', 'sellerId'],
                    include: [
                        {
                            association: 'seller',
                            attributes: ['id', 'fullName', 'avatar'],
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            data: wishlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Kiểm tra sản phẩm có trong danh sách yêu thích không
exports.checkWishlistStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const item = await Wishlist.findOne({
            where: { userId, productId },
        });

        res.status(200).json({
            success: true,
            data: {
                isInWishlist: !!item,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
