import { create } from "zustand";
import { quranAPI } from "../services/quranAPI"; // Assuming this service exists and works
import { useSettingsStore } from "./settingsStore"; // Assuming this store exists and provides 'reciter'

// --- Constants ---
const DEFAULT_VOLUME = 0.75; // Default volume level (75%)

// --- Types ---
interface AudioState {
  // Core audio properties
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  isLoading: boolean; // Indicates if audio is currently loading/buffering

  // Track identification
  currentSurah: number | null;
  currentAyah: number | null;

  // Volume control
  volume: number; // Volume level (0.0 to 1.0)

  // Actions
  play: (surahNumber: number, ayahNumber: number) => Promise<void>; // Make play async for better handling
  pause: () => void;
  stop: () => void; // Stops playback and clears state
  playNext: () => Promise<void>; // Make async
  playPrevious: () => Promise<void>; // Make async
  setVolume: (newVolume: number) => void; // Action to set the volume
}

// --- Helper Functions ---

/**
 * Safely cleans up an existing HTMLAudioElement instance.
 * Pauses playback, removes source, removes listeners, and triggers load to abort requests.
 * @param audio The HTMLAudioElement to clean up.
 */
const cleanupAudio = (audio: HTMLAudioElement | null) => {
  if (audio) {
    console.log("Cleaning up previous audio instance.");
    audio.pause();
    // Remove event listeners explicitly if added via addEventListener
    // If using direct assignment (e.g., audio.onended = ...), this might not be strictly necessary
    // but it's safer practice. You'd need to store listener references to remove them here.
    // For simplicity, assuming direct assignment or garbage collection handles listeners okay for now.
    audio.removeAttribute("src"); // Prevent further loading/resource holding
    audio.load(); // Abort pending network requests for the old source
  }
};

// --- Zustand Store Definition ---
export const useAudioStore = create<AudioState>((set, get) => ({
  // --- Initial State ---
  audio: null,
  isPlaying: false,
  currentSurah: null,
  currentAyah: null,
  isLoading: false,
  volume: DEFAULT_VOLUME, // Initialize volume

  // --- Actions ---

  /**
   * Plays the audio for a specific Surah and Ayah.
   * Handles loading, playback, state updates, and cleanup.
   */
  play: async (surahNumber: number, ayahNumber: number) => {
    // Input validation
    if (!surahNumber || !ayahNumber || surahNumber <= 0 || ayahNumber <= 0) {
      console.error("Invalid Surah or Ayah number provided:", surahNumber, ayahNumber);
      set({ isLoading: false }); // Ensure loading state is reset
      return;
    }

    //scroll to current ayah
    const ayahElement = document.getElementById(`ayah-${surahNumber}-${ayahNumber}`) as HTMLElement;
    if (ayahElement) {
      ayahElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const { audio: currentAudio, volume } = get(); // Get current audio instance and volume
    console.log(`Attempting to play: Surah ${surahNumber}, Ayah ${ayahNumber}`);

    // Clean up any existing audio before starting new playback
    cleanupAudio(currentAudio);

    // Set loading state and ensure isPlaying is false initially
    set({ isLoading: true, isPlaying: false, audio: null, currentSurah: surahNumber, currentAyah: ayahNumber });

    try {
      // Get necessary settings and construct the audio URL
      const reciter = useSettingsStore.getState().reciter;
      const audioUrl = quranAPI.getAyahAudioUrl(surahNumber, ayahNumber, reciter);
      console.log("Audio URL:", audioUrl);
      console.log("Using Reciter:", reciter);

      // Create new audio element
      const newAudio = new Audio(audioUrl);
      newAudio.volume = volume; // *** Apply the current volume from state ***

      // --- Event Handlers (using direct assignment for simpler cleanup) ---
      newAudio.oncanplaythrough = () => {
        // This indicates enough data is buffered, but play() might still fail
        console.log("Audio can play through (buffered).");
        // Don't set isLoading: false here; wait for play() confirmation
      };

      newAudio.onended = () => {
        console.log(`Audio ended: S${get().currentSurah} A${get().currentAyah}`);
        set({ isPlaying: false }); // Update playing state
        // Play next automatically after a short delay
        setTimeout(() => get().playNext(), 300); // 300ms delay
      };

      newAudio.onerror = (e) => {
        console.error("Error loading or playing audio:", e);
        set({ isLoading: false, isPlaying: false, audio: null }); // Reset state on error
      };

      // Attempt to play the audio (returns a Promise)
      await newAudio.play();

      // *** If play() promise resolves successfully: ***
      console.log("Audio playback started successfully.");
      set({
        audio: newAudio, // Store the new audio element
        isPlaying: true, // Update playing state
        isLoading: false, // Set loading to false *after* successful play
        // currentSurah/Ayah already set above
      });
    } catch (error) {
      console.error("Error occurred during play setup or execution:", error);
      // Handle specific errors like NotAllowedError (autoplay policy)
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        console.warn("Autoplay was prevented by the browser. User interaction might be needed.");
        // Consider showing a message to the user.
      }
      // Ensure state is reset on any error during play
      set({ isLoading: false, isPlaying: false, audio: null });
      cleanupAudio(get().audio); // Attempt cleanup again just in case
    }
  },

  /**
   * Pauses the currently playing audio.
   */
  pause: () => {
    const { audio, isPlaying } = get();
    if (audio && isPlaying) {
      audio.pause();
      set({ isPlaying: false });
      console.log("Audio paused.");
    }
  },

  /**
   * Stops playback completely, cleans up the audio element, and resets track info.
   */
  stop: () => {
    const { audio } = get();
    cleanupAudio(audio); // Use the helper
    set({
      audio: null,
      isPlaying: false,
      currentSurah: null,
      currentAyah: null,
      isLoading: false, // Ensure loading is reset
    });
    console.log("Audio stopped and state reset.");
  },

  /**
   * Sets the audio volume.
   * @param newVolume The desired volume level (0.0 to 1.0).
   */
  setVolume: (newVolume: number) => {
    const { audio } = get();
    // Clamp the volume value to be between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));

    // Update the volume on the current audio element if it exists
    if (audio) {
      audio.volume = clampedVolume;
    }
    // Update the volume in the store state
    set({ volume: clampedVolume });
    console.log(`Volume set to: ${clampedVolume}`);
  },

  /**
   * Plays the next Ayah or moves to the next Surah.
   */
  playNext: async () => {
    const { currentSurah, currentAyah } = get();

    // Check if there's a track currently loaded
    if (currentSurah === null || currentAyah === null) {
      console.log("playNext called, but no current track. Stopping.");
      get().stop();
      return;
    }

    console.log(`playNext called from: S${currentSurah} A${currentAyah}`);
    // Set loading true temporarily while fetching next track info/URL
    // Note: 'play' action will also set isLoading, but setting it here provides
    // immediate feedback if fetching surahData takes time.
    set({ isLoading: true });

    try {
      // Fetch details of the current surah to know the number of ayahs
      const surahData = await quranAPI.getSurah(currentSurah);

      if (currentAyah < surahData.numberOfAyahs) {
        // Play next ayah in the same surah
        await get().play(currentSurah, currentAyah + 1);
      } else if (currentSurah < 114) {
        // End of current surah, move to the first ayah of the next surah
        console.log(`End of Surah ${currentSurah}, moving to Surah ${currentSurah + 1}`);
        await get().play(currentSurah + 1, 1);
      } else {
        // End of the Quran reached
        console.log("End of Quran reached.");
        get().stop();
      }
    } catch (error) {
      console.error("Error fetching surah data or playing next ayah:", error);
      set({ isLoading: false }); // Reset loading on error
      get().stop(); // Stop playback if fetching/playing next fails
    }
  },

  /**
   * Plays the previous Ayah or moves to the last Ayah of the previous Surah.
   * If the current track has played for more than 3 seconds, it restarts the current track instead.
   */
  playPrevious: async () => {
    const { currentSurah, currentAyah, audio } = get();

    // Check if there's a track currently loaded
    if (currentSurah === null || currentAyah === null) {
      console.log("playPrevious called, but no current track.");
      return;
    }

    console.log(`playPrevious called from: S${currentSurah} A${currentAyah}`);

    // Behavior: If played > 3s, restart current track. Otherwise, go to previous.
    if (audio && audio.currentTime > 3 && !audio.seeking) {
      console.log("Restarting current track (played > 3s).");
      audio.currentTime = 0;
      // Ensure it plays if it was paused (though unlikely in this specific flow)
      if (audio.paused) {
        await audio.play().catch((e) => console.error("Error restarting playback:", e));
        set({ isPlaying: true }); // Ensure state reflects playback
      }
      return; // Don't proceed to actual previous track
    }

    // If currentTime <= 3s or no audio, proceed to find the previous track
    set({ isLoading: true }); // Indicate loading for the previous track

    try {
      if (currentAyah > 1) {
        // Play previous ayah in the same surah
        await get().play(currentSurah, currentAyah - 1);
      } else if (currentSurah > 1) {
        // Beginning of current surah, move to the last ayah of the previous surah
        const prevSurahNum = currentSurah - 1;
        console.log(`Beginning of Surah ${currentSurah}, moving to end of Surah ${prevSurahNum}`);
        // Fetch details of the *previous* surah
        const previousSurahData = await quranAPI.getSurah(prevSurahNum);
        await get().play(prevSurahNum, previousSurahData.numberOfAyahs);
      } else {
        // Beginning of the Quran (Surah 1, Ayah 1)
        console.log("Beginning of Quran reached.");
        // Optional: Restart first ayah if already there
        if (currentSurah === 1 && currentAyah === 1 && audio) {
          audio.currentTime = 0;
          if (audio.paused) {
            await audio.play().catch((e) => console.error("Error restarting playback:", e));
            set({ isPlaying: true });
          }
        }
        set({ isLoading: false }); // Reset loading if staying at the beginning
      }
    } catch (error) {
      console.error("Error fetching surah data or playing previous ayah:", error);
      set({ isLoading: false }); // Reset loading on error
      get().stop(); // Stop playback if fetching/playing previous fails
    }
  },
}));
