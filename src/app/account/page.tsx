'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Tài khoản</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <p className="font-semibold">Chưa đăng nhập</p>
                <a href="/auth" className="text-red-500 hover:text-red-600 text-sm mt-2 inline-block">
                  Đăng nhập ngay
                </a>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Quản lý tài khoản</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-semibold">user@example.com</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Tên</p>
                  <p className="font-semibold">Người dùng</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Điện thoại</p>
                  <p className="font-semibold">+84 999 999 999</p>
                </div>
                <button className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">
                  Chỉnh sửa thông tin
                </button>
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Lịch sử đơn hàng</h2>
              <p className="text-gray-600">Chưa có đơn hàng nào</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
