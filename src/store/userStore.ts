import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface UserState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

export default useUserStore;
