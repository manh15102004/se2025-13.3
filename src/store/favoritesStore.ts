import { create } from 'zustand';
import { Product } from '../data/products';

interface FavoritesState {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  addToFavorites: (product) =>
    set((state) => {
      const exists = state.favorites.some((item) => item.id === product.id);
      if (!exists) {
        return {
          favorites: [...state.favorites, product],
        };
      }
      return state;
    }),
  removeFromFavorites: (productId) =>
    set((state) => ({
      favorites: state.favorites.filter((item) => item.id !== productId),
    })),
  isFavorite: (productId) => {
    return get().favorites.some((item) => item.id === productId);
  },
  clearFavorites: () => set({ favorites: [] }),
  getFavoritesCount: () => {
    return get().favorites.length;
  },
}));

export default useFavoritesStore;
