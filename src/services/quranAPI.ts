
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
    // The API expects the absolute ayah number in the Quran, not just the ayah number within a surah
    const absoluteAyahNumber = getAbsoluteAyahNumber(surahNumber, ayahNumber);
    console.log(`Getting audio URL for surah ${surahNumber}, ayah ${ayahNumber}, absolute number: ${absoluteAyahNumber}`);
    return `https://cdn.islamic.network/quran/audio/128/${reciter}/${absoluteAyahNumber}.mp3`;
  },

  // Get audio URL for a specific surah
  getSurahAudioUrl: (surahNumber: number, reciter: string = 'ar.alafasy'): string => {
    return `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNumber}.mp3`;
  },
};

// Helper function to convert surah and ayah numbers to absolute ayah number in Quran
// This is now used to correctly calculate the absolute ayah number for audio URLs
function getAbsoluteAyahNumber(surahNumber: number, ayahNumberInSurah: number): number {
  // Ayah counts per surah (1-indexed array, element 0 is unused)
  const ayahCounts = [
    0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 
    111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 
    54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 
    49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 
    44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 
    26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
  ];

  let absoluteAyahNumber = ayahNumberInSurah;
  
  // Add the counts of all previous surahs
  for (let i = 1; i < surahNumber; i++) {
    absoluteAyahNumber += ayahCounts[i] || 0;
  }
  
  return absoluteAyahNumber;
}

export default quranAPI;
