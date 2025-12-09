const { Review, User, Product } = require('../models');
const { Op } = require('sequelize');

// Create a review
exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            where: { productId, userId },
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá sản phẩm này rồi',
            });
        }

        // Create review
        const review = await Review.create({
            productId,
            userId,
            rating,
            comment,
        });

        // Update product average rating
        await updateProductRating(productId);

        // Get review with user info
        const reviewWithUser = await Review.findByPk(review.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatar'],
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: 'Đánh giá thành công',
            data: reviewWithUser,
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows: reviews } = await Review.findAndCountAll({
            where: { productId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatar'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Calculate average rating
        const avgRating = await Review.findOne({
            where: { productId },
            attributes: [
                [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating'],
            ],
            raw: true,
        });

        res.status(200).json({
            success: true,
            data: {
                reviews,
                totalReviews: count,
                averageRating: avgRating?.avgRating ? parseFloat(avgRating.avgRating).toFixed(1) : 0,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update own review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá',
            });
        }

        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền sửa đánh giá này',
            });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();

        // Update product average rating
        await updateProductRating(review.productId);

        const reviewWithUser = await Review.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatar'],
                },
            ],
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật đánh giá thành công',
            data: reviewWithUser,
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete own review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá',
            });
        }

        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa đánh giá này',
            });
        }

        const productId = review.productId;
        await review.destroy();

        // Update product average rating
        await updateProductRating(productId);

        res.status(200).json({
            success: true,
            message: 'Xóa đánh giá thành công',
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Helper function to update product rating
async function updateProductRating(productId) {
    try {
        const avgRating = await Review.findOne({
            where: { productId },
            attributes: [
                [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating'],
                [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'countReviews'],
            ],
            raw: true,
        });

        const product = await Product.findByPk(productId);
        if (product) {
            product.rating = avgRating?.avgRating ? parseFloat(avgRating.avgRating) : 0;
            product.reviews = avgRating?.countReviews ? parseInt(avgRating.countReviews) : 0;
            await product.save();
        }
    } catch (error) {
        console.error('Update product rating error:', error);
    }
}
