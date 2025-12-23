import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    ScrollView,
} from 'react-native';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL, chatAPI } from '../../api/client';
import { getRelativeTime, isUserOnline } from '../../utils/timeUtils';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😠', '🎉', '🔥', '🥰', '👋'];

// Khởi tạo Socket

let socket: any;

const ChatScreen = ({ route, navigation }: any) => {
    const { conversationId, otherUser, productId } = route.params || {};
    const [chatPartner, setChatPartner] = useState<any>(otherUser || null);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(conversationId || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Initialize user and socket
        const initChat = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('authToken');

            if (storedUserId) {
                const currentUserId = parseInt(storedUserId);
                setUserId(currentUserId);

                // Tính toán SOCKET_URL để đảm bảo an toàn
                const baseUrl = API_BASE_URL || 'http://10.0.2.2:5000/api';
                const socketUrl = baseUrl.replace(/\/api$/, '');

                // Kết nối socket
                socket = io(socketUrl, {
                    query: { userId: storedUserId }
                });

                socket.on('connect', () => {
                    console.log('Socket connected');
                    if (activeConversationId) {
                        socket.emit('join_room', activeConversationId);
                    }
                });

                socket.on('receive_message', (newMessage: any) => {
                    if (newMessage && newMessage.conversationId === activeConversationId) {
                        setMessages(prev => [...prev, newMessage]);
                        scrollToBottom();
                    }
                });

                let currentId = activeConversationId;

                // Nếu không có ID cuộc trò chuyện, thử tìm cuộc trò chuyện hiện có với người dùng khác
                if (!currentId && otherUser?.id) {
                    try {
                        const res = await chatAPI.getOrCreateConversation(otherUser.id);
                        if (res.success && res.conversation) {
                            currentId = res.conversation.id;
                            setActiveConversationId(currentId);
                            if (socket) socket.emit('join_room', currentId);

                            // Trích xuất thông tin đầy đủ của người dùng khác từ danh sách người tham gia
                            if (res.conversation.participants) {
                                const partner = res.conversation.participants.find((p: any) => p.id !== currentUserId);
                                if (partner) {
                                    setChatPartner(partner);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error getting conversation:', error);
                    }
                } else if (currentId) {
                    // Even if we have ID, we might need to fetch conversation details to get partner info if it's missing
                    // For now, assume conversation API returns participants if we fetch details or from messages
                    // But typically getMessages doesn't return participants. 
                    // Ideally we should fetch conversation details here if param otherUser is incomplete.
                    // But let's rely on the init logic above for the create case.
                }

                // Lấy tin nhắn nếu cuộc trò chuyện tồn tại
                if (currentId) {
                    await fetchMessages(currentId, token);
                } else {
                    setLoading(false);
                }
            }
        };

        initChat();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [conversationId, otherUser]);

    // ... (rest of methods)

    // Update render and return to use chatPartner
    // ...



    const fetchMessages = async (id: number, token: string | null) => {
        try {
            const response = await chatAPI.getMessages(id.toString());
            if (response.success) {
                setMessages(response.messages || []); // Truy cập 'messages', fallback về mảng rỗng
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật handleSend để chấp nhận các tham số type và content
    const handleSend = async (contentToSend?: string, type: 'text' | 'image' | 'sticker' = 'text') => {
        const text = contentToSend || inputText;
        if (!text.trim() || !userId) return;

        const tempMessage = {
            id: Date.now(),
            senderId: userId,
            content: text,
            type: type, // Thêm loại tin nhắn
            createdAt: new Date().toISOString(),
            isTemp: true,
        };

        // Cập nhật lạc quan (Optimistic update)
        setMessages(prev => [...prev, tempMessage]);
        if (type === 'text') setInputText('');
        setShowEmojiPicker(false); // Đóng emoji picker nếu đang mở
        scrollToBottom();

        try {
            let currentConversationId = activeConversationId;

            // Nếu chưa có cuộc trò chuyện, tạo mới
            if (!currentConversationId) {
                if (!otherUser?.id) {
                    console.error("Cannot create conversation: otherUser is missing");
                    // Xóa tin nhắn tạm
                    setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
                    return;
                }
                const res = await chatAPI.getOrCreateConversation(otherUser.id);

                if (res.success && res.conversation) {
                    currentConversationId = res.conversation.id;
                    setActiveConversationId(currentConversationId); // Update state
                    // Emit sự kiện join room cho cuộc trò chuyện mới
                    if (socket) socket.emit('join_room', currentConversationId);
                }
            }

            if (!currentConversationId) {
                throw new Error("Failed to get conversation ID");
            }

            // Gửi đến API với loại tin nhắn
            const response = await chatAPI.sendMessage(currentConversationId.toString(), tempMessage.content, type);

            if (response.success) {
                // Thay thế tin nhắn tạm bằng tin nhắn thật
                const realMessage = response.message;
                setMessages(prev => prev.map(m => m.id === tempMessage.id ? realMessage : m));

                // Emit sự kiện socket
                socket.emit('send_message', realMessage);
            }
        } catch (error) {
            console.error('Send error:', error);
            // Xóa tin nhắn tạm khi có lỗi
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.7,
                includeBase64: true,
                maxWidth: 800,
                maxHeight: 800,
            });

            if (result.assets?.[0]?.base64) {
                const base64Image = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;
                handleSend(base64Image, 'image');
            }
        } catch (error) {
            console.error('Image picker error:', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderMessage = ({ item }: any) => {
        const isMe = item.senderId === userId;
        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
                {!isMe && (
                    chatPartner?.avatar ? (
                        <Image
                            source={{ uri: chatPartner.avatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]}>
                            <Icon name="user" size={16} color="#757575" />
                        </View>
                    )
                )}
                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myMessageBubble : styles.theirMessageBubble,
                    item.type === 'image' && { padding: 4, backgroundColor: 'transparent' } // Điều chỉnh header cho hình ảnh
                ]}>
                    {item.type === 'image' ? (
                        <Image
                            source={{ uri: item.content }}
                            style={{ width: 200, height: 200, borderRadius: 12 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={[
                            styles.messageText,
                            isMe ? styles.myMessageText : styles.theirMessageText
                        ]}>
                            {item.content}
                        </Text>
                    )}
                    <Text style={[styles.timeText, isMe ? { color: '#e0e0e0' } : { color: '#999' }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.headerInfo}>
                        <TouchableOpacity
                            onPress={() => chatPartner?.id && navigation.navigate('ShopProfile', { shopId: chatPartner.id })}
                            disabled={!chatPartner?.id}
                        >
                            {chatPartner?.avatar ? (
                                <Image
                                    source={{ uri: chatPartner.avatar }}
                                    style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                />
                            ) : (
                                <View style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="user" size={20} color="#757575" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerName}>{chatPartner?.fullName || chatPartner?.username || 'Chat'}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <View style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: isUserOnline(chatPartner?.lastSeen) ? '#4ade80' : '#9ca3af'
                                }} />
                                <Text style={{ fontSize: 12, color: '#666' }}>
                                    {getRelativeTime(chatPartner?.lastSeen)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <TouchableOpacity>
                    <Icon name="more-vertical" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Tin nhắn */}
            {loading ? (
                <ActivityIndicator size="large" color="#4a90e2" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={scrollToBottom}
                />
            )}

            {/* Chọn biểu tượng cảm xúc */}
            {showEmojiPicker && (
                <View style={{ height: 60, backgroundColor: '#f0f0f0' }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 10 }}>
                        {EMOJIS.map((emoji, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleSend(emoji, 'text')}
                                style={{ padding: 10 }}
                            >
                                <Text style={{ fontSize: 24 }}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Nhập liệu */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)} style={{ marginRight: 10 }}>
                        <Icon name="smile" size={24} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handlePickImage} style={{ marginRight: 10 }}>
                        <Icon name="image" size={24} color="#666" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChangeText={setInputText}
                        onFocus={() => setShowEmojiPicker(false)}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={() => handleSend(inputText, 'text')}
                        disabled={!inputText.trim()}
                    >
                        <Icon name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 2,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    messagesList: {
        padding: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-end',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    theirMessageContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        elevation: 1,
    },
    myMessageBubble: {
        backgroundColor: '#4a90e2',
        borderBottomRightRadius: 4,
    },
    theirMessageBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: 'white',
    },
    theirMessageText: {
        color: '#333',
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4a90e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});

export default ChatScreen;
