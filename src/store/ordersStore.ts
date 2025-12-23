import { create } from 'zustand';
import { CartItem } from './cartStore';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  shippingAddress?: string;
}

interface OrdersState {
  orders: Order[];
  createOrder: (items: CartItem[], total: number) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
  clearOrders: () => void;
}

const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  createOrder: (items, total) =>
    set((state) => {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        items,
        total,
        status: 'pending',
      };
      return {
        orders: [newOrder, ...state.orders],
      };
    }),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),
  getOrderById: (orderId) => {
    return get().orders.find((order) => order.id === orderId);
  },
  clearOrders: () => set({ orders: [] }),
}));

export default useOrdersStore;
