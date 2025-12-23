'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate checkout
    setTimeout(() => {
      alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      clearCart();
      setIsCheckingOut(false);
    }, 2000);
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Giỏ hàng của bạn trống</p>
            <Link href="/products" className="text-red-500 hover:text-red-600 font-semibold">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 bg-white p-4 rounded-lg shadow">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                      <p className="text-red-500 font-bold mb-2">₫{item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="ml-4 text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₫{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow h-fit">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>₫{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>₫0</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Giảm giá:</span>
                  <span>₫0</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-red-500">₫{totalPrice.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {isCheckingOut ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
