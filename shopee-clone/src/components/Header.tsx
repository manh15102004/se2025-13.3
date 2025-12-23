'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

export default function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">S</div>
            <div className="text-lg font-semibold text-red-500 hidden sm:block">AppSale</div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 mx-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="hidden sm:block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <Link href="/products" className="text-gray-700 hover:text-red-500 font-medium">
              Sản phẩm
            </Link>
            <Link href="/account" className="text-gray-700 hover:text-red-500 font-medium hidden md:block">
              Tài khoản
            </Link>
            <Link href="/cart" className="relative">
              <div className="text-gray-700 hover:text-red-500 font-medium text-2xl">
                🛒
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
