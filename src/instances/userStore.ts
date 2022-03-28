import create from 'zustand';

interface UserStore {
  email: string;
  uid: string;
  setEmail: (email: string) => void;
  setUid: (uid: string) => void;
}

const useUserStore = create<UserStore>((set) => ({
  email: '',
  uid: '',
  setEmail: (email: string) => set((state) => ({ email })),
  setUid: (uid: string) => set((state) => ({ uid })),
}));

export default useUserStore;
