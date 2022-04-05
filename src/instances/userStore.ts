import create from 'zustand';

export type ThemeTypes = 'dark' | 'light' | 'auto';

export type NodeColors = typeof light;

interface NodeColorsThemes {
  light: NodeColors;
  dark: NodeColors;
}

interface UserStore {
  email: string;
  uid: string;
  theme: ThemeTypes;
  nodeColors: NodeColorsThemes;
  setEmail: (email: string) => void;
  setUid: (uid: string) => void;
  setTheme: (theme: ThemeTypes) => void;
  setLightColors: (theme: Partial<NodeColors>) => void;
  setDarkColors: (theme: Partial<NodeColors>) => void;
}

const light = {
  accent: '#0068f6',
  textNode: '#0068f6',
  answerNode: '#e9891b',
  conditionNode: '#424242',
};

const dark: NodeColors = {
  accent: '#4493ff',
  textNode: '#4493ff',
  answerNode: '#e9891b',
  conditionNode: '#505050',
};

const useUserStore = create<UserStore>((set) => ({
  email: '',
  uid: '',
  theme: 'auto',
  nodeColors: { light, dark },
  setEmail: (email) => set(() => ({ email })),
  setUid: (uid) => set(() => ({ uid })),
  setTheme: (theme) => set(() => ({ theme })),
  setLightColors: (colors) =>
    set((state) => ({
      nodeColors: { ...state.nodeColors, light: { ...state.nodeColors.light, ...colors } },
    })),
  setDarkColors: (colors) =>
    set((state) => ({
      nodeColors: { ...state.nodeColors, dark: { ...state.nodeColors.dark, ...colors } },
    })),
}));

export default useUserStore;
