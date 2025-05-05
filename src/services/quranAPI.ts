
import axios from 'axios';

// Base API URL for Quran API
const API_BASE_URL = 'https://api.alquran.cloud/v1';

// Types for the API responses
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
  };
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface Translation {
  number: number;
  text: string;
  numberInSurah: number;
  surah: {
    number: number;
  };
}

// API service functions
export const quranAPI = {
  // Get list of all surahs
  getAllSurahs: async (): Promise<Surah[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/surah`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw error;
    }
  },

  // Get specific surah with all ayahs
  getSurah: async (surahNumber: number): Promise<SurahDetail> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/surah/${surahNumber}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching surah ${surahNumber}:`, error);
      throw error;
    }
  },

  // Get translation for a specific surah
  getTranslation: async (surahNumber: number, edition: string = 'en.asad'): Promise<Translation[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/surah/${surahNumber}/${edition}`);
      return response.data.data.ayahs;
    } catch (error) {
      console.error(`Error fetching translation for surah ${surahNumber}:`, error);
      throw error;
    }
  },

  // Get audio URL for a specific ayah
  getAyahAudioUrl: (surahNumber: number, ayahNumber: number, reciter: string = 'ar.alafasy'): string => {
    return `https://cdn.islamic.network/quran/audio/128/${reciter}/${getAyahNumberInQuran(surahNumber, ayahNumber)}.mp3`;
  },

  // Get audio URL for a specific surah
  getSurahAudioUrl: (surahNumber: number, reciter: string = 'ar.alafasy'): string => {
    return `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNumber}.mp3`;
  },
};

// Helper function to convert surah and ayah numbers to absolute ayah number in Quran
function getAyahNumberInQuran(surahNumber: number, ayahNumberInSurah: number): number {
  // This is a simplified calculation, might need adjustment based on API requirements
  // In a real application, you'd use a mapping or calculation based on the actual structure
  // For demo purposes, we'll use this simple approximation
  return (surahNumber * 1000) + ayahNumberInSurah;
}

export default quranAPI;
