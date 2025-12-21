'use client';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  onAddToCart: () => void;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  sold,
  onAddToCart,
}: ProductCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* Product Image */}
      <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{discount}%
          </div>
        )}
        <button className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow">
          ❤️
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">{name}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-lg font-extrabold text-red-500">₫{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₫{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rating and Sold */}
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">⭐ <strong>{rating}</strong></span>
          <span className="text-gray-500">Đã bán {sold}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
