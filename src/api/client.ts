import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.125.88.206:5000/api'; // Your server IP

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
}

// Helper function to make API requests
const apiRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: any
): Promise<ApiResponse> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request:', { method, url, body }); // Debug

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log('API Response status:', response.status); // Debug

    let data;
    try {
      data = await response.json();
      console.log('API Response data:', data); // Debug
    } catch (parseError) {
      console.error('JSON Parse error:', parseError);
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      console.error('API Error:', data); // Debug
      if (response.status === 401) {
        // Token expired or invalid
        await AsyncStorage.removeItem('authToken');
      }
      throw new Error(data.message || 'API request failed');
    }

    // Wrap response in success format if not already wrapped
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, data, message: 'Success' };
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: (email: string, password: string, fullName: string, phone?: string) =>
    apiRequest('POST', '/auth/register', {
      email,
      password,
      fullName,
      phone,
    }),

  login: (email: string, password: string) =>
    apiRequest('POST', '/auth/login', { email, password }),

  getCurrentUser: () =>
    apiRequest('GET', '/auth/me'),

  updateProfile: (data: any) =>
    apiRequest('PUT', '/auth/profile', data),
};

// Chat API calls
export const chatAPI = {
  getOrCreateConversation: (userId: string) =>
    apiRequest('POST', '/chat/conversation', { userId }),

  getConversations: () =>
    apiRequest('GET', '/chat/conversations'),

  getMessages: (conversationId: string) =>
    apiRequest('GET', `/chat/messages/${conversationId}`),

  sendMessage: (conversationId: string, content: string) =>
    apiRequest('POST', '/chat/message', { conversationId, content }),

  markAsRead: (conversationId: string) =>
    apiRequest('PUT', '/chat/mark-as-read', { conversationId }),
};

// Cart API calls
export const cartAPI = {
  getCart: () =>
    apiRequest('GET', '/cart'),

  addToCart: (productId: number, quantity: number, price: number) =>
    apiRequest('POST', '/cart/add', { productId, quantity, price }),

  updateCartItem: (cartItemId: number, quantity: number) =>
    apiRequest('PUT', `/cart/${cartItemId}`, { quantity }),

  removeFromCart: (cartItemId: number) =>
    apiRequest('DELETE', `/cart/${cartItemId}`),

  clearCart: () =>
    apiRequest('DELETE', '/cart'),
};

// Product API calls
export const productAPI = {
  getAllProducts: (category?: string, search?: string) => {
    let endpoint = '/products';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return apiRequest('GET', endpoint);
  },

  getFeaturedProducts: () =>
    apiRequest('GET', '/products/featured'),

  getMyProducts: () =>
    apiRequest('GET', '/products/my-products'),

  createProduct: (name: string, price: number, category: string, subCategory: string, description?: string, quantity?: number, image?: string) =>
    apiRequest('POST', '/products/create', { name, price, category, subCategory, description, quantity, image }),

  updateProduct: (productId: number, data: any) =>
    apiRequest('PUT', `/products/${productId}`, data),

  deleteProduct: (productId: number) =>
    apiRequest('DELETE', `/products/${productId}`),
};

// Order API calls
export const orderAPI = {
  createOrder: (items: any[], shippingAddress?: string) =>
    apiRequest('POST', '/orders/create', { items, shippingAddress }),

  getMyOrders: () =>
    apiRequest('GET', '/orders/my-purchases'),

  getMySalesOrders: () =>
    apiRequest('GET', '/orders/my-sales'),

  approveOrder: (orderId: number, deliveryDate?: string) =>
    apiRequest('PUT', `/orders/${orderId}/approve`, { deliveryDate }),

  cancelOrder: (orderId: number) =>
    apiRequest('PUT', `/orders/${orderId}/cancel`, {}),

  getNotifications: () =>
    apiRequest('GET', '/orders/notifications'),

  markNotificationAsRead: (notificationId: number) =>
    apiRequest('PUT', `/orders/notifications/${notificationId}/read`, {}),
};

// Review API calls
export const reviewAPI = {
  createReview: (productId: number, rating: number, comment: string) =>
    apiRequest('POST', '/reviews/create', { productId, rating, comment }),
  getProductReviews: (productId: number, page: number = 1, limit: number = 10) =>
    apiRequest('GET', `/reviews/product/${productId}?page=${page}&limit=${limit}`),
  updateReview: (reviewId: number, rating: number, comment: string) =>
    apiRequest('PUT', `/reviews/${reviewId}`, { rating, comment }),
  deleteReview: (reviewId: number) =>
    apiRequest('DELETE', `/reviews/${reviewId}`),
};

// Shipper API calls
export const shipperAPI = {
  getAvailableOrders: () =>
    apiRequest('GET', '/shipper/available-orders'),

  acceptOrder: (orderId: number) =>
    apiRequest('POST', `/shipper/accept-order/${orderId}`, {}),

  getMyDeliveries: () =>
    apiRequest('GET', '/shipper/my-deliveries'),

  updateDeliveryStatus: (orderId: number, status: string) =>
    apiRequest('PUT', `/shipper/update-status/${orderId}`, { status }),

  completeDelivery: (orderId: number, paymentConfirmed: boolean) =>
    apiRequest('POST', `/shipper/complete-delivery/${orderId}`, { paymentConfirmed }),

  cancelDelivery: (orderId: number, reason: string) =>
    apiRequest('POST', `/shipper/cancel-delivery/${orderId}`, { reason }),
};

// Payment API calls
export const paymentAPI = {
  createMoMoPayment: (orderId: number, amount: number) =>
    apiRequest('POST', '/payment/momo/create', { orderId, amount }),

  checkPaymentStatus: (orderId: number) =>
    apiRequest('GET', `/payment/status/${orderId}`),
};

export default apiRequest;
