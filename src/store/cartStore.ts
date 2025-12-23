import { create } from 'zustand';
import { Product } from '../data/products';

export interface CartItem extends Product {
  quantity: number;
  size?: string; // Kích thước cho sản phẩm thời trang
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (productId: number, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (product, quantity, size) =>
    set((state) => {
      // Đảm bảo giá là kiểu số
      let safePrice = product.price;
      if (typeof safePrice === 'string') {
        safePrice = parseFloat(safePrice);
      }
      // Nếu giá không hợp lệ/bằng 0, thử trích xuất từ đối tượng Product lồng nhau nếu có
      if (!safePrice && (product as any).Product?.price) {
        safePrice = parseFloat((product as any).Product.price);
      }

      const productWithSafePrice = { ...product, price: Number(safePrice) || 0 };

      // Kiểm tra xem có sản phẩm trùng id và kích thước này chưa
      const existingItem = state.items.find((item) =>
        item.id === product.id && item.size === size
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id && item.size === size
              ? { ...item, quantity: item.quantity + quantity, price: Number(safePrice) || item.price }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { ...productWithSafePrice, quantity, size }],
      };
    }),
  removeFromCart: (productId, size) =>
    set((state) => ({
      items: state.items.filter((item) =>
        !(item.id === productId && item.size === size)
      ),
    })),
  updateQuantity: (productId, quantity, size) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId && item.size === size ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));

export default useCartStore;
