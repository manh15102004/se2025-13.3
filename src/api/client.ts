import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://10.106.5.206:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: any;
  data?: T;
  token?: string;
  user?: any;
  messages?: any[];
  conversations?: any[];
  conversation?: any;
}

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
    console.log('API Request:', { method, url, body });

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log('API Response status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('API Response data:', data);
    } catch (parseError) {
      console.log('JSON Parse error:', parseError);
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      console.log('API Error:', data);
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
    console.log('API Request Error:', error.message); // Changed to log to avoid LogBox
    throw error;
  }
};

// API Xác thực
export const authAPI = {
  register: (email: string, password: string, fullName: string, phone?: string, role?: string) =>
    apiRequest('POST', '/auth/register', {
      email,
      password,
      fullName,
      phone,
      role,
    }),

  login: (email: string, password: string) =>
    apiRequest('POST', '/auth/login', { email, password }),

  getCurrentUser: () =>
    apiRequest('GET', '/auth/me'),

  updateProfile: (data: any) =>
    apiRequest('PUT', '/auth/profile', data),
};

// API Chat
export const chatAPI = {
  getOrCreateConversation: (userId: string) =>
    apiRequest('POST', '/chat/conversation', { userId }),

  getConversations: () =>
    apiRequest('GET', '/chat/conversations'),

  getMessages: (conversationId: string) =>
    apiRequest('GET', `/chat/messages/${conversationId}`),

  sendMessage: (conversationId: string, content: string, type: 'text' | 'image' | 'sticker' = 'text') =>
    apiRequest('POST', '/chat/message', { conversationId, content, type }),

  markAsRead: (conversationId: string) =>
    apiRequest('PUT', '/chat/mark-as-read', { conversationId }),
};

// API Giỏ hàng
export const cartAPI = {
  getCart: () =>
    apiRequest('GET', '/cart'),

  addToCart: (productId: number, quantity: number, price: number, size?: string) =>
    apiRequest('POST', '/cart/add', { productId, quantity, price, size }),

  updateCartItem: (cartItemId: number, quantity: number) =>
    apiRequest('PUT', `/cart/${cartItemId}`, { quantity }),

  removeFromCart: (cartItemId: number) =>
    apiRequest('DELETE', `/cart/${cartItemId}`),

  clearCart: () =>
    apiRequest('DELETE', '/cart'),
};

// API Sản phẩm
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

  getShopProducts: (shopId: number) =>
    apiRequest('GET', `/products/shop/${shopId}`),

  getProductById: (id: number) =>
    apiRequest('GET', `/products/${id}`),

  createProduct: (name: string, price: number, category: string, subCategory: string, description?: string, quantity?: number, image?: string) =>
    apiRequest('POST', '/products/create', { name, price, category, subCategory, description, quantity, image }),

  updateProduct: (productId: number, data: any) =>
    apiRequest('PUT', `/products/${productId}`, data),

  deleteProduct: (productId: number) =>
    apiRequest('DELETE', `/products/${productId}`),
};

// API Đơn hàng
export const orderAPI = {
  createOrder: (items: any[], shippingAddress?: string) =>
    apiRequest('POST', '/orders/create', { items, shippingAddress }),

  getMyOrders: () =>
    apiRequest('GET', '/orders/my-purchases'),

  getMySalesOrders: () =>
    apiRequest('GET', '/orders/my-sales'),

  getOrderById: (orderId: number) =>
    apiRequest('GET', `/orders/${orderId}`),

  approveOrder: (orderId: number, deliveryDate?: string) =>
    apiRequest('PUT', `/orders/${orderId}/approve`, { deliveryDate }),

  cancelOrder: (orderId: number, reason?: string) =>
    apiRequest('PUT', `/orders/${orderId}/cancel`, { reason }),

  getNotifications: () =>
    apiRequest('GET', '/orders/notifications'),

  markNotificationAsRead: (notificationId: number) =>
    apiRequest('PUT', `/orders/notifications/${notificationId}/read`, {}),
};

// API Đánh giá
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

// API Người giao hàng (Shipper)
export const shipperAPI = {
  getStats: () =>
    apiRequest('GET', '/shipper/stats'),

  getEarnings: (period?: string) =>
    apiRequest('GET', `/shipper/earnings${period ? `?period=${period}` : ''}`),

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

// API Thanh toán
export const paymentAPI = {
  createMoMoPayment: (orderId: number, amount: number) =>
    apiRequest('POST', '/payment/momo/create', { orderId, amount }),

  checkPaymentStatus: (orderId: number) =>
    apiRequest('GET', `/payment/status/${orderId}`),
};

// API Danh sách yêu thích
export const wishlistAPI = {
  addToWishlist: (productId: number) =>
    apiRequest('POST', '/wishlist', { productId }),

  removeFromWishlist: (productId: number) =>
    apiRequest('DELETE', `/wishlist/${productId}`),

  getMyWishlist: () =>
    apiRequest('GET', '/wishlist'),

  checkWishlistStatus: (productId: number) =>
    apiRequest('GET', `/wishlist/check/${productId}`),
};

// Analytics API calls
// Analytics API calls
export const getSellerAnalytics = (period: 'day' | 'week' | 'month' = 'week') =>
  apiRequest('GET', `/analytics/seller?period=${period}`);

// API Người dùng/Mạng xã hội
export const userAPI = {
  followUser: (id: number) => apiRequest('POST', `/users/follow/${id}`),
  unfollowUser: (id: number) => apiRequest('POST', `/users/unfollow/${id}`),
  likeShop: (id: number) => apiRequest('POST', `/users/like-shop/${id}`),
  unlikeShop: (id: number) => apiRequest('POST', `/users/unlike-shop/${id}`),
  getFeaturedShops: () => apiRequest('GET', '/users/featured-shops'),
};

// API Banner (Quảng cáo)
export const bannerAPI = {
  getBanners: () => apiRequest('GET', '/banners'),
  getAllBanners: () => apiRequest('GET', '/banners/all'), // Get all banners for admin
  getMyBanners: () => apiRequest('GET', '/banners/my'),
  getPendingBanners: () => apiRequest('GET', '/banners/pending'),
  createBanner: (data: any) => apiRequest('POST', '/banners', data),
  approveBanner: (id: number) => apiRequest('PUT', `/banners/${id}/approve`, {}),
  rejectBanner: (id: number) => apiRequest('PUT', `/banners/${id}/reject`, {}),
  deleteBanner: (id: number) => apiRequest('DELETE', `/banners/${id}`),
};

export default apiRequest;
