import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import client, { API_BASE_URL } from '../../api/client';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { getRelativeTime, isUserOnline } from '../../utils/timeUtils';

const ConversationListScreen = ({ navigation }: any) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            loadConversations();
        }, [])
    );

    const loadConversations = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('userId');
            if (userId) setCurrentUserId(parseInt(userId));

            const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setConversations(response.data.conversations);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: any) => {
        // Xác định người tham gia KHÔNG PHẢI là người dùng hiện tại
        const otherUser = item.participants.find((p: any) => p.id !== currentUserId) || item.participants[0];
        const isUnread = false; // Logic cho tin nhắn chưa đọc có thể được thêm vào đây

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('Chat', {
                    conversationId: item.id,
                    otherUser: otherUser
                })}
            >
                <Image
                    source={{ uri: otherUser?.avatar || 'https://via.placeholder.com/60' }}
                    style={styles.avatar}
                />
                <View style={styles.contentContainer}>
                    <View style={styles.topRow}>
                        <Text style={styles.nameText}>{otherUser?.username || otherUser?.fullName || 'Người dùng'}</Text>
                        <Text style={styles.timeText}>
                            {new Date(item.updatedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={[styles.lastMessage, isUnread && styles.unreadText]} numberOfLines={1}>
                        {item.lastMessage || 'Chưa có tin nhắn'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: isUserOnline(otherUser?.lastSeen) ? '#4ade80' : '#9ca3af'
                        }} />
                        <Text style={{ fontSize: 11, color: '#999' }}>
                            {getRelativeTime(otherUser?.lastSeen)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tin nhắn</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Danh sách */}
            {loading ? (
                <ActivityIndicator size="large" color="#4a90e2" style={{ marginTop: 20 }} />
            ) : conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="message-square" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadConversations} />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        backgroundColor: '#eee',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    unreadText: {
        fontWeight: 'bold',
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -50,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
});

export default ConversationListScreen;
