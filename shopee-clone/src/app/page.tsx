'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/stores/cartStore';

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);

  const featuredProducts = [
    {
      _id: '1',
      name: 'Điện thoại Samsung Galaxy A13',
      price: 4990000,
      originalPrice: 6990000,
      images: ['https://via.placeholder.com/300'],
      rating: 4.5,
      sold: 1250,
    },
    {
      _id: '2',
      name: 'Laptop Dell Inspiron 15',
      price: 12990000,
      originalPrice: 15990000,
      images: ['https://via.placeholder.com/300'],
      rating: 4.8,
      sold: 320,
    },
    {
      _id: '3',
      name: 'Tai nghe Bluetooth Sony WH-CH720',
      price: 1890000,
      originalPrice: 2490000,
      images: ['https://via.placeholder.com/300'],
      rating: 4.6,
      sold: 5630,
    },
    {
      _id: '4',
      name: 'Smartwatch Apple Watch Series 8',
      price: 8990000,
      originalPrice: 11990000,
      images: ['https://via.placeholder.com/300'],
      rating: 4.7,
      sold: 2150,
    },
  ];

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    });
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Shopee Clone</h1>
                <p className="text-lg mb-6">
                  Khám phá hàng triệu sản phẩm chính hãng với giá cạnh tranh nhất
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-white text-red-500 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Mua sắm ngay
                </Link>
              </div>
              <div className="text-6xl text-center">🛍️</div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Danh mục sản phẩm</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '📱', name: 'Điện tử' },
                { icon: '💻', name: 'Máy tính' },
                { icon: '⌚', name: 'Đồ đeo' },
                { icon: '🎧', name: 'Âm thanh' },
              ].map((category) => (
                <Link
                  key={category.name}
                  href="/products"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <p className="font-semibold text-gray-800">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
              <Link href="/products" className="text-red-500 hover:text-red-600 font-semibold">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.images[0]}
                  rating={product.rating}
                  sold={product.sold}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Tại sao chọn Shopee Clone?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🚚',
                  title: 'Giao hàng nhanh',
                  description: 'Vận chuyển toàn quốc, giao trong 24h',
                },
                {
                  icon: '💳',
                  title: 'Thanh toán an toàn',
                  description: 'Đa dạng hình thức thanh toán, bảo mật 100%',
                },
                {
                  icon: '🛡️',
                  title: 'Bảo vệ người mua',
                  description: 'Không hài lòng? Hoàn tiền 100%',
                },
              ].map((feature) => (
                <div key={feature.title} className="bg-white p-6 rounded-lg shadow text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-red-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng mua sắm?</h2>
            <p className="text-lg mb-6">Khám phá bộ sưu tập đầy đủ của chúng tôi ngay bây giờ!</p>
            <Link
              href="/products"
              className="inline-block bg-white text-red-500 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}
