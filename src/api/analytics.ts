import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:5000/api';

// Get seller analytics
export const getSellerAnalytics = async (period: 'day' | 'week' | 'month' = 'week') => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.get(`${API_BASE_URL}/analytics/seller`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { period },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};
