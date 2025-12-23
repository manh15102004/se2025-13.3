export type Product = {
  id: number;
  name: string;
  price: number;
  stocks?: number; // For backward compatibility
  quantity?: number; // Match backend field
  rating: number;
  reviews: number;
  image: string;
  category: string;
};

export const featuredProducts: Product[] = [
  { id: 1, name: 'FORM Smart Swim Goggles 2', price: 35000, quantity: 15, rating: 4.5, reviews: 201, image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Goggles' },
  { id: 2, name: 'Speedo Vanquisher 2.0', price: 25000, quantity: 30, rating: 4.8, reviews: 512, image: 'https://images.pexels.com/photos/3584996/pexels-photo-3584996.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Goggles' },
  { id: 3, name: 'TYR Sport Swimsuit', price: 95000, quantity: 0, rating: 4.5, reviews: 201, image: 'https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Swimwear' },
  { id: 4, name: 'Arena Powerskin Kneeskin', price: 450000, quantity: 5, rating: 4.9, reviews: 150, image: 'https://images.pexels.com/photos/3584928/pexels-photo-3584928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Swimwear' },
  { id: 5, name: 'Phelps Matrix Titanium Mirror', price: 250000, quantity: 10, rating: 4.7, reviews: 98, image: 'https://images.pexels.com/photos/157888/fashion-glasses-goer-modern-157888.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Swimming' },
];
