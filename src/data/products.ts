export type Product = {
  id: number;
  name: string;
  price: string;
  stocks: string;
  rating: string;
  reviews: string;
  image: string;
  category: string;
};

export const featuredProducts: Product[] = [
    { id: 1, name: 'FORM Smart Swim Goggles 2', price: '  35.00', stocks: '15 Stocks Left', rating: '4.5', reviews: '201', image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Goggles' },
    { id: 2, name: 'Speedo Vanquisher 2.0', price: '$25.00', stocks: '30 Stocks Left', rating: '4.8', reviews: '512', image: 'https://images.pexels.com/photos/3584996/pexels-photo-3584996.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Goggles' },
    { id: 3, name: 'TYR Sport Swimsuit', price: '$95.00', stocks: '15 Stocks Left', rating: '4.5', reviews: '201', image: 'https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Swimwear' },
    { id: 4, name: 'Arena Powerskin Kneeskin', price: '$450.00', stocks: '5 Stocks Left', rating: '4.9', reviews: '150', image: 'https://images.pexels.com/photos/3584928/pexels-photo-3584928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Swimwear' },
    { id: 5, name: 'Phelps Matrix Titanium Mirror', price: '$250.00', stocks: '10 Stocks Left', rating: '4.7', reviews: '98', image: 'https://images.pexels.com/photos/157888/fashion-glasses-goer-modern-157888.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Swimming' },
  ];
