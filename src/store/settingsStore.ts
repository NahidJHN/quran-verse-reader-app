
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  theme: 'dark' | 'light';
  arabicFontSize: 'small' | 'medium' | 'large';
  translationFontSize: 'small' | 'medium' | 'large';
  showTranslation: boolean;
  translationLanguage: string;
  reciter: string;
  toggleTheme: () => void;
  setArabicFontSize: (size: 'small' | 'medium' | 'large') => void;
  setTranslationFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleTranslation: () => void;
  setTranslationLanguage: (language: string) => void;
  setReciter: (reciter: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      arabicFontSize: 'medium',
      translationFontSize: 'medium',
      showTranslation: true,
      translationLanguage: 'en.asad',
      reciter: 'ar.alafasy',
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      setArabicFontSize: (size) => set({ arabicFontSize: size }),
      
      setTranslationFontSize: (size) => set({ translationFontSize: size }),
      
      toggleTranslation: () => set((state) => ({ 
        showTranslation: !state.showTranslation 
      })),
      
      setTranslationLanguage: (language) => set({ translationLanguage: language }),
      
      setReciter: (reciter) => set({ reciter: reciter }),
    }),
    {
      name: 'quran-settings',
    }
  )
);
