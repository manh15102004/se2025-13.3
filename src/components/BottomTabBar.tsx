import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute } from '@react-navigation/native';

interface BottomTabBarProps {
    activeTab?: number;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab: propActiveTab }) => {
    const navigation = useNavigation<any>();
    const route = useRoute();

    // Determine active tab based on current route if not provided
    const getActiveTabFromRoute = () => {
        switch (route.name) {
            case 'Home': return 0;
            case 'Products': return 1;
            case 'ConversationList': return 2;
            case 'Transactions': return 3;
            case 'Profile': return 4;
            default: return 0;
        }
    };

    const [activeTab, setActiveTab] = useState(propActiveTab ?? getActiveTabFromRoute());

    const handleTabPress = (tabIndex: number, screenName: string) => {
        setActiveTab(tabIndex);
        if (route.name !== screenName) {
            navigation.navigate(screenName);
        }
    };

    return (
        <View style={styles.bottomNav}>
            {/* Animated Indicator */}
            <Animated.View
                style={[
                    styles.tabIndicator,
                    {
                        left: activeTab === 0 ? '5%' :
                            activeTab === 1 ? '25%' :
                                activeTab === 2 ? '45%' :
                                    activeTab === 3 ? '65%' : '85%',
                    }
                ]}
            />

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleTabPress(0, 'Home')}
            >
                <Icon name="home" size={24} color={activeTab === 0 ? "#4a90e2" : "#ccc"} />
                <Text style={[styles.navLabel, activeTab === 0 && styles.navLabelActive]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleTabPress(1, 'Products')}
            >
                <Icon name="shopping-bag" size={24} color={activeTab === 1 ? "#4a90e2" : "#ccc"} />
                <Text style={[styles.navLabel, activeTab === 1 && styles.navLabelActive]}>Sản phẩm</Text>
            </TouchableOpacity>

            {/* Chat Button - Center */}
            <TouchableOpacity
                style={styles.aiChatButton}
                onPress={() => handleTabPress(2, 'ConversationList')}
            >
                <Icon name="message-circle" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleTabPress(3, 'Transactions')}
            >
                <Icon name="package" size={24} color={activeTab === 3 ? "#4a90e2" : "#ccc"} />
                <Text style={[styles.navLabel, activeTab === 3 && styles.navLabelActive]}>Giao dịch</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleTabPress(4, 'Profile')}
            >
                <IconAnt name="user" size={24} color={activeTab === 4 ? "#4a90e2" : "#ccc"} />
                <Text style={[styles.navLabel, activeTab === 4 && styles.navLabelActive]}>Hồ sơ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '10%',
        height: 3,
        backgroundColor: '#4a90e2',
        borderRadius: 2,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navLabel: {
        fontSize: 10,
        color: '#ccc',
        marginTop: 4,
    },
    navLabelActive: {
        color: '#4a90e2',
        fontWeight: '600',
    },
    aiChatButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4a90e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});

export default BottomTabBar;
