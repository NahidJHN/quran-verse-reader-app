
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarkItem {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

interface BookmarkStore {
  bookmarks: BookmarkItem[];
  lastRead: {
    surahNumber: number;
    ayahNumber: number;
    timestamp: number;
  } | null;
  addBookmark: (surahNumber: number, ayahNumber: number) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  setLastRead: (surahNumber: number, ayahNumber: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      lastRead: null,
      
      addBookmark: (surahNumber: number, ayahNumber: number) => {
        const isAlreadyBookmarked = get().isBookmarked(surahNumber, ayahNumber);
        
        if (!isAlreadyBookmarked) {
          set((state) => ({
            bookmarks: [
              ...state.bookmarks,
              { surahNumber, ayahNumber, timestamp: Date.now() }
            ]
          }));
        }
      },
      
      removeBookmark: (surahNumber: number, ayahNumber: number) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (bookmark) => 
              bookmark.surahNumber !== surahNumber || 
              bookmark.ayahNumber !== ayahNumber
          )
        }));
      },
      
      isBookmarked: (surahNumber: number, ayahNumber: number) => {
        return get().bookmarks.some(
          (bookmark) => 
            bookmark.surahNumber === surahNumber && 
            bookmark.ayahNumber === ayahNumber
        );
      },
      
      setLastRead: (surahNumber: number, ayahNumber: number) => {
        set({
          lastRead: {
            surahNumber,
            ayahNumber,
            timestamp: Date.now()
          }
        });
      },
    }),
    {
      name: 'quran-bookmarks',
    }
  )
);
