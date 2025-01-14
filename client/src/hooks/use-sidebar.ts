import { create } from 'zustand';

type SidebarStore = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));
