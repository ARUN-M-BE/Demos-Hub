import { create } from 'zustand';
import { HistoryItem, Theme } from './types';

interface AppState {
  theme: Theme;
  sidebarOpen: boolean;
  history: HistoryItem[];
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>((set) => ({
  theme: 'light',
  sidebarOpen: false, // Mobile default closed
  history: [],
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addHistory: (item) => set((state) => ({
    history: [
      { ...item, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() },
      ...state.history.slice(0, 49) // Keep last 50
    ]
  })),
  clearHistory: () => set({ history: [] }),
}));