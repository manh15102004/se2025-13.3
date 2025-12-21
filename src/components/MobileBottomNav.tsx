"use client";

import Link from "next/link";

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex flex-col items-center text-sm text-gray-700">
            <span className="text-2xl">🏠</span>
            <span>Trang chủ</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center text-sm text-gray-700">
            <span className="text-2xl">🛍️</span>
            <span>Sản phẩm</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center text-sm text-gray-700">
            <span className="text-2xl">🛒</span>
            <span>Giỏ</span>
          </Link>
          <Link href="/account" className="flex flex-col items-center text-sm text-gray-700">
            <span className="text-2xl">👤</span>
            <span>Tài khoản</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
