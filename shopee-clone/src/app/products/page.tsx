'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/stores/cartStore';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  sold: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Fetch sample products
    const sampleProducts: Product[] = [
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
      {
        _id: '5',
        name: 'Máy ảnh Canon EOS M50 Mark II',
        price: 15990000,
        originalPrice: 19990000,
        images: ['https://via.placeholder.com/300'],
        rating: 4.9,
        sold: 480,
      },
      {
        _id: '6',
        name: 'iPad Pro 12.9 inch 2023',
        price: 26990000,
        originalPrice: 31990000,
        images: ['https://via.placeholder.com/300'],
        rating: 4.8,
        sold: 890,
      },
      {
        _id: '7',
        name: 'Bàn phím cơ Logitech Pro X',
        price: 3490000,
        originalPrice: 4490000,
        images: ['https://via.placeholder.com/300'],
        rating: 4.5,
        sold: 3210,
      },
      {
        _id: '8',
        name: 'Chuột Razer DeathAdder V3',
        price: 1990000,
        originalPrice: 2490000,
        images: ['https://via.placeholder.com/300'],
        rating: 4.6,
        sold: 2540,
      },
    ];

    setProducts(sampleProducts);
    setLoading(false);
  }, []);

  const handleAddToCart = (product: Product) => {
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Sản phẩm</h1>

        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
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
        )}
      </main>
      <Footer />
      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}
