import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Image // Import Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { bannerAPI } from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminBanners'>;

const AdminBannerScreen: React.FC<Props> = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadPendingBanners = async () => {
        try {
            setLoading(true);
            const response = await bannerAPI.getPendingBanners();
            console.log('Pending banners response:', response);
            if (response.success) {
                console.log('Banners data:', response.data);
                setBanners(response.data);
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
        loadPendingBanners();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            const response = await bannerAPI.approveBanner(id);
            if (response.success) {
                // Duyệt thành công, reload danh sách
                loadPendingBanners();
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể duyệt banner');
        }
    };

    const handleReject = async (id: number) => {
        Alert.alert(
            'Từ chối',
            'Bạn có chắc muốn từ chối và xóa banner này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await bannerAPI.rejectBanner(id);
                            if (response.success) {
                                loadPendingBanners();
                            }
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa banner');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const hasValidImage = item.image && (item.image.startsWith('http') || item.image.startsWith('data:'));
        const isBase64 = item.image && item.image.startsWith('data:');
        const isLargeBase64 = isBase64 && item.image.length > 100000; // > 100KB

        return (
            <View style={styles.card}>
                <View style={[
                    styles.bannerPreview,
                    { padding: 12, height: 160, justifyContent: 'center' }
                ]}>
                    {hasValidImage && !isLargeBase64 ? (
                        <>
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: '100%', height: 160, position: 'absolute', top: 0, left: 0 }}
                                resizeMode="cover"
                                onError={(e) => {
                                    console.log('Image load error:', e.nativeEvent.error);
                                }}
                            />
                            <View style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                padding: 12,
                            }}>
                                <Text style={[styles.bannerTitle, { fontSize: 14 }]}>
                                    {item.title || 'Không có tiêu đề'}
                                </Text>
                                <Text style={[styles.bannerSubtitle, { fontSize: 11 }]}>
                                    {item.subtitle || 'Không có mô tả'}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: 12 }}>
                                <Icon name="image" size={48} color="white" />
                                {isLargeBase64 && (
                                    <Text style={{ color: '#e0e0e0', fontSize: 10, marginTop: 4 }}>
                                        Ảnh base64 ({Math.round(item.image.length / 1024)}KB)
                                    </Text>
                                )}
                            </View>
                            <View style={styles.bannerContent}>
                                <Text style={[styles.bannerTitle, { textAlign: 'center' }]}>
                                    {item.title || 'Không có tiêu đề'}
                                </Text>
                                <Text style={[styles.bannerSubtitle, { textAlign: 'center' }]}>
                                    {item.subtitle || 'Không có mô tả'}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoText}>Shop ID: {item.shopId || 'N/A'}</Text>
                    <Text style={styles.infoText}>Target: {item.targetType || 'none'} ({item.targetValue || 'N/A'})</Text>
                </View>

                <View style={{ paddingHorizontal: 4, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 11, color: '#666' }}>
                        📅 {new Date(item.startDate).toLocaleDateString('vi-VN')} - {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                        💰 Giá: {item.price ? `${Number(item.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                    </Text>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(item.id)}
                    >
                        <Icon name="x" size={20} color="#ef4444" />
                        <Text style={styles.rejectText}>Từ chối</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(item.id)}
                    >
                        <Icon name="check" size={20} color="white" />
                        <Text style={styles.approveText}>Duyệt</Text>
                    </TouchableOpacity>
                </View>
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
                <Text style={styles.headerTitle}>Duyệt Banner ({banners.length})</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={banners}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPendingBanners(); }} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không có banner nào cần duyệt</Text>
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
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerPreview: {
        backgroundColor: '#4a90e2',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        marginBottom: 2,
    },
    bannerSubtitle: {
        fontSize: 12,
        color: '#e0e0e0',
    },
    bannerImage: {
        fontSize: 32,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        gap: 8,
    },
    rejectButton: {
        backgroundColor: '#fee2e2',
    },
    rejectText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    approveButton: {
        backgroundColor: '#4a90e2',
    },
    approveText: {
        color: 'white',
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    }
});

export default AdminBannerScreen;
