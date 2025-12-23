import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    FlatList,
    RefreshControl,
    Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { bannerAPI } from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageBanners'>;

const ManageBannersScreen: React.FC<Props> = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('active');
    const [userRole, setUserRole] = useState<string | null>(null);

    // Kiểm tra quyền admin khi mount
    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                setUserRole(role);

                if (role !== 'admin') {
                    Alert.alert(
                        'Không có quyền truy cập',
                        'Chỉ admin mới có thể quản lý banner',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                }
            } catch (error) {
                console.log('Check role error:', error);
                navigation.goBack();
            }
        };

        checkAdminRole();
    }, []);

    const loadBanners = async () => {
        // Chỉ tải nếu người dùng là admin
        if (userRole !== 'admin') return;

        try {
            setLoading(true);
            const response = await bannerAPI.getAllBanners();

            if (response.success) {
                let filtered = response.data;

                // Lọc dựa trên tab được chọn
                if (filter === 'active') {
                    filtered = filtered.filter((b: any) => b.isActive === true);
                } else if (filter === 'pending') {
                    filtered = filtered.filter((b: any) => b.isActive === false);
                }

                setBanners(filtered);
            } else {
                Alert.alert('Lỗi', response.message);
            }
        } catch (error: any) {
            console.log('Load banners error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách banner');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userRole === 'admin') {
            loadBanners();
        }
    }, [filter, userRole]);

    const handleDelete = async (id: number, title: string) => {
        Alert.alert(
            'Xóa Banner',
            `Bạn có chắc muốn xóa banner "${title}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await bannerAPI.deleteBanner(id);
                            if (response.success) {
                                // Xóa thành công, tải lại
                                loadBanners();
                            }
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa banner');
                        }
                    }
                }
            ]
        );
    };

    const handleApprove = async (id: number) => {
        try {
            const response = await bannerAPI.approveBanner(id);
            if (response.success) {
                // Duyệt banner thành công, tải lại
                loadBanners();
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể duyệt banner');
        }
    };

    const handleReject = async (id: number, title: string) => {
        Alert.alert(
            'Từ chối Banner',
            `Bạn có chắc muốn từ chối banner "${title}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Từ chối',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await bannerAPI.rejectBanner(id);
                            if (response.success) {
                                // Từ chối thành công, tải lại
                                loadBanners();
                            }
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể từ chối banner');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const hasValidImage = item.image && (item.image.startsWith('http') || item.image.startsWith('data:'));
        const isBase64 = item.image && item.image.startsWith('data:');
        const isLargeBase64 = isBase64 && item.image.length > 100000;
        const isActive = item.isActive;
        const isExpired = item.endDate && new Date(item.endDate) < new Date();

        return (
            <View style={styles.card}>
                {/* Nhãn trạng thái */}
                <View style={[
                    styles.statusBadge,
                    isActive ? (isExpired ? styles.expiredBadge : styles.activeBadge) : styles.pendingBadge
                ]}>
                    <Text style={styles.statusText}>
                        {isActive ? (isExpired ? '⏰ Hết hạn' : '✅ Đang chạy') : '⏳ Chờ duyệt'}
                    </Text>
                </View>

                <View style={[
                    styles.bannerPreview,
                    { padding: 12, height: 140, justifyContent: 'center' }
                ]}>
                    {hasValidImage && !isLargeBase64 ? (
                        <>
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: '100%', height: 140, position: 'absolute', top: 0, left: 0 }}
                                resizeMode="cover"
                            />
                            <View style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                padding: 8,
                            }}>
                                <Text style={[styles.bannerTitle, { fontSize: 13 }]} numberOfLines={1}>
                                    {item.title || 'Không có tiêu đề'}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: 8 }}>
                                <Icon name="image" size={40} color="white" />
                                {isLargeBase64 && (
                                    <Text style={{ color: '#e0e0e0', fontSize: 9, marginTop: 2 }}>
                                        {Math.round(item.image.length / 1024)}KB
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.bannerTitle, { textAlign: 'center', fontSize: 13 }]} numberOfLines={2}>
                                {item.title || 'Không có tiêu đề'}
                            </Text>
                        </>
                    )}
                </View>

                <View style={{ padding: 12 }}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Shop:</Text>
                        <Text style={styles.infoValue}>ID {item.shopId || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Thời gian:</Text>
                        <Text style={styles.infoValue}>
                            {new Date(item.startDate).toLocaleDateString('vi-VN')} - {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '∞'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Giá:</Text>
                        <Text style={styles.infoValue}>
                            {item.price ? `${Number(item.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </Text>
                    </View>
                </View>

                {/* Nút hành động */}
                {!isActive ? (
                    // Banner chờ duyệt: Hiển thị Duyệt/Từ chối
                    <View style={{ flexDirection: 'row', gap: 8, padding: 8 }}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#fee2e2', flex: 1 }]}
                            onPress={() => handleReject(item.id, item.title || 'Banner')}
                        >
                            <Icon name="x" size={16} color="#ef4444" />
                            <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 12 }}>Từ chối</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#d1fae5', flex: 1 }]}
                            onPress={() => handleApprove(item.id)}
                        >
                            <Icon name="check" size={16} color="#10b981" />
                            <Text style={{ color: '#10b981', fontWeight: '600', fontSize: 12 }}>Duyệt</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Banner đang hoạt động: Hiển thị Xóa
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id, item.title || 'Banner')}
                    >
                        <Icon name="trash-2" size={18} color="#ef4444" />
                        <Text style={styles.deleteText}>Xóa Banner</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Banner</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tab lọc */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
                    onPress={() => setFilter('active')}
                >
                    <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
                        Đang chạy
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                        Chờ duyệt
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        Tất cả
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={banners}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                numColumns={2}
                columnWrapperStyle={{ gap: 12 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBanners(); }} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="inbox" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Không có banner nào</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        gap: 8,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#4a90e2',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
    },
    list: {
        padding: 12,
    },
    card: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        margin: 8,
        borderRadius: 4,
    },
    activeBadge: {
        backgroundColor: '#10b981',
    },
    pendingBadge: {
        backgroundColor: '#f59e0b',
    },
    expiredBadge: {
        backgroundColor: '#6b7280',
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    bannerPreview: {
        backgroundColor: '#4a90e2',
        borderRadius: 8,
        margin: 8,
        marginTop: 0,
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: 'white',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 11,
        color: '#333',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        gap: 6,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#fee2e2',
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    deleteText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 13,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
        marginTop: 12,
    }
});

export default ManageBannersScreen;
