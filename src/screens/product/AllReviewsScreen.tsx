import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { reviewAPI } from '../../api/client';

const AllReviewsScreen = ({ navigation, route }: any) => {
    const { productId, productName, averageRating, totalReviews } = route.params || {};
    const [reviews, setReviews] = useState<any[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
    const [starCounts, setStarCounts] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    useEffect(() => {
        if (!productId) {
            // Xử lý lỗi hoặc quay lại
            navigation.goBack();
            return;
        }
        loadAllReviews();
    }, [productId]);

    const loadAllReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewAPI.getProductReviews(productId, 1, 100);
            if (response.success && response.data) {
                const allReviews = response.data.reviews || [];
                setReviews(allReviews);
                setFilteredReviews(allReviews);

                // Tính toán số lượng sao
                const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                allReviews.forEach((review: any) => {
                    counts[review.rating as keyof typeof counts]++;
                });
                setStarCounts(counts);
            }
        } catch (error) {
            console.log('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterByRating = (rating: number) => {
        if (selectedFilter === rating) {
            // Bỏ chọn bộ lọc
            setSelectedFilter(null);
            setFilteredReviews(reviews);
        } else {
            // Áp dụng bộ lọc
            setSelectedFilter(rating);
            setFilteredReviews(reviews.filter((r: any) => r.rating === rating));
        }
    };

    const renderStars = (rating: number, size: number = 16) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <IconAnt
                    key={i}
                    name={i <= rating ? 'star' : 'staro'}
                    size={size}
                    color="#fbbf24"
                />
            );
        }
        return <View style={{ flexDirection: 'row', gap: 4 }}>{stars}</View>;
    };

    const renderReview = ({ item }: { item: any }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                        {item.user?.avatar && (item.user.avatar.startsWith('http') || item.user.avatar.startsWith('data:')) ? (
                            <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
                        ) : item.user?.avatar ? (
                            <Text style={styles.reviewerAvatarEmoji}>{item.user.avatar}</Text>
                        ) : (
                            <IconAnt name="user" size={20} color="#666" />
                        )}
                    </View>
                    <View>
                        <Text style={styles.reviewerName}>{item.user?.fullName || 'Người dùng'}</Text>
                        <Text style={styles.reviewDate}>
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>
                </View>
                {renderStars(item.rating, 14)}
            </View>
            {item.comment && (
                <Text style={styles.reviewComment}>{item.comment}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Thông tin sản phẩm */}
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
                <View style={styles.ratingRow}>
                    {renderStars(Math.round(averageRating), 20)}
                    <Text style={styles.ratingText}>
                        {averageRating.toFixed(1)} ({totalReviews} đánh giá)
                    </Text>
                </View>
            </View>

            {/* Bộ lọc sao */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {[5, 4, 3, 2, 1].map((rating) => (
                    <TouchableOpacity
                        key={rating}
                        style={[
                            styles.filterButton,
                            selectedFilter === rating && styles.filterButtonActive
                        ]}
                        onPress={() => filterByRating(rating)}
                    >
                        <IconAnt
                            name="star"
                            size={14}
                            color={selectedFilter === rating ? '#fff' : '#fbbf24'}
                        />
                        <Text style={[
                            styles.filterButtonText,
                            selectedFilter === rating && styles.filterButtonTextActive
                        ]}>
                            {rating}
                        </Text>
                        <Text style={[
                            styles.filterCount,
                            selectedFilter === rating && styles.filterCountActive
                        ]}>
                            ({starCounts[rating as keyof typeof starCounts]})
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Danh sách đánh giá */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
                </View>
            ) : filteredReviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="message-square" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                        {selectedFilter
                            ? `Chưa có đánh giá ${selectedFilter} sao`
                            : 'Chưa có đánh giá nào'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredReviews}
                    renderItem={renderReview}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    productInfo: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    filtersContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 2,
        borderBottomColor: '#f0f0f0',
        maxHeight: 60,
    },
    filtersContent: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        paddingBottom: 7,
        gap: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fbbf24',
        backgroundColor: '#fff',
        minHeight: 28,
    },
    filterButtonActive: {
        backgroundColor: '#fbbf24',
        borderColor: '#fbbf24',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a2e',
        lineHeight: 14,
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    filterCount: {
        fontSize: 10,
        color: '#666',
        lineHeight: 12,
    },
    filterCountActive: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingTop: 4,
    },
    reviewItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewerAvatarEmoji: {
        fontSize: 24,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    reviewComment: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        textAlign: 'center',
    },
});

export default AllReviewsScreen;
