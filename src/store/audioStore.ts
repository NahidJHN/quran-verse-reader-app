
import { create } from 'zustand';
import { quranAPI } from '../services/quranAPI';
import { useSettingsStore } from './settingsStore';

interface AudioState {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  currentSurah: number | null;
  currentAyah: number | null;
  isLoading: boolean;
  play: (surahNumber: number, ayahNumber: number) => void;
  pause: () => void;
  stop: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audio: null,
  isPlaying: false,
  currentSurah: null,
  currentAyah: null,
  isLoading: false,

  play: async (surahNumber: number, ayahNumber: number) => {
    try {
      const { audio: currentAudio } = get();
      if (currentAudio) {
        currentAudio.pause();
      }

      set({ isLoading: true });
      const reciter = useSettingsStore.getState().reciter;
      const audioUrl = quranAPI.getAyahAudioUrl(surahNumber, ayahNumber, reciter);
      console.log("Audio URL:", audioUrl);
      
      const newAudio = new Audio(audioUrl);
      
      // Add error handling for audio loading
      newAudio.addEventListener('error', (e) => {
        console.error("Error loading audio:", e);
        set({ isLoading: false });
      });
      
      newAudio.addEventListener('ended', () => {
        get().playNext();
      });

      // Use a promise to ensure audio is loaded
      const playPromise = newAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playing successfully");
            set({
              audio: newAudio,
              isPlaying: true,
              currentSurah: surahNumber,
              currentAyah: ayahNumber,
              isLoading: false,
            });
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            set({ isLoading: false });
          });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      set({ isLoading: false });
    }
  },

  pause: () => {
    const { audio } = get();
    if (audio) {
      audio.pause();
      set({ isPlaying: false });
    }
  },

  stop: () => {
    const { audio } = get();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      set({ isPlaying: false, audio: null, currentSurah: null, currentAyah: null });
    }
  },

  playNext: async () => {
    const { currentSurah, currentAyah } = get();
    if (currentSurah !== null && currentAyah !== null) {
      try {
        // Fetch current surah data to get number of ayahs
        const surahData = await quranAPI.getSurah(currentSurah);
        
        if (currentAyah < surahData.numberOfAyahs) {
          // Play next ayah in the same surah
          get().play(currentSurah, currentAyah + 1);
        } else if (currentSurah < 114) {
          // Move to next surah, first ayah
          get().play(currentSurah + 1, 1);
        } else {
          // End of Quran reached
          get().stop();
        }
      } catch (error) {
        console.error('Error playing next ayah:', error);
      }
    }
  },

  playPrevious: async () => {
    const { currentSurah, currentAyah, audio } = get();
    if (currentSurah !== null && currentAyah !== null) {
      // If current audio has played for more than 3 seconds, restart it
      if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      
      try {
        if (currentAyah > 1) {
          // Play previous ayah in the same surah
          get().play(currentSurah, currentAyah - 1);
        } else if (currentSurah > 1) {
          // Move to previous surah, last ayah
          const previousSurahData = await quranAPI.getSurah(currentSurah - 1);
          get().play(currentSurah - 1, previousSurahData.numberOfAyahs);
        }
      } catch (error) {
        console.error('Error playing previous ayah:', error);
      }
    }
  },
}));
