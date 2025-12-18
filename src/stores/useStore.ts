import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedDepartmentId: null,
      
      setSelectedDepartment: (id: number) => 
        set({ selectedDepartmentId: id }),
      
      clearSelectedDepartment: () => 
        set({ selectedDepartmentId: null }),
    }),
    {
      name: 'cafphy-storage', // localStorage key
    }
  )
);
