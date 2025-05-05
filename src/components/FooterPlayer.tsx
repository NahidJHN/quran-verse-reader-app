import { useAudioStore } from "@/store/audioStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // Assuming you use shadcn/ui slider
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from "lucide-react"; // Import volume icons
import { Link } from "react-router-dom";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useEffect } from "react"; // Import useState for potential local UI state

export function FooterPlayer() {
  const {
    isPlaying,
    currentSurah,
    currentAyah,
    play,
    pause,
    playNext,
    playPrevious,
    isLoading,
    volume, // Get volume state
    setVolume, // Get setVolume action
  } = useAudioStore();
  const { setLastRead } = useBookmarkStore();

  useEffect(() => {
    if (currentSurah && currentAyah) {
      setLastRead(currentSurah, currentAyah);
    }
  }, [currentSurah, currentAyah, setLastRead]);

  if (!currentSurah || !currentAyah) {
    return null;
  }

  // Determine which volume icon to display
  const VolumeIcon = volume === 0 ? VolumeX : volume <= 0.5 ? Volume1 : Volume2;

  // Handle volume change from the slider
  const handleVolumeChange = (value: number[]) => {
    // Slider usually gives an array, take the first element
    setVolume(value[0]);
  };

  // Toggle mute functionality
  const toggleMute = () => {
    // A small enhancement: Store previous volume to unmute to it later
    // This would require adding 'previousVolume' state to your audioStore
    // Simple toggle:
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.75); // Unmute to default or previous volume
    }
  };
  console.log(currentAyah);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-2 md:p-4">
      <div className="container flex items-center justify-between gap-4">
        {" "}
        {/* Added gap-4 */}
        {/* Left Side: Track Info */}
        <div className="flex items-center gap-2 text-sm overflow-hidden flex-shrink mr-2">
          {" "}
          {/* Added overflow/shrink */}
          <Link
            to={`/surah/${currentSurah}`}
            className="text-primary hover:text-gold transition-colors font-medium truncate" // Added truncate
          >
            Surah {currentSurah}
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            to={`/surah/${currentSurah}?ayah=${currentAyah}`}
            className="text-primary hover:text-gold transition-colors font-medium truncate" // Added truncate
          >
            Ayah {currentAyah}
          </Link>
        </div>
        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1 md:gap-2 flex-grow justify-center">
          {" "}
          {/* Added flex-grow/justify-center */}
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            disabled={isLoading /* Add logic for beginning of playlist */}
            aria-label="Previous ayah"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant={isPlaying ? "outline" : "default"}
            size="icon"
            onClick={isPlaying ? pause : () => play(currentSurah, currentAyah)}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`w-10 h-10 rounded-full ${
              // Make circle button slightly larger
              isPlaying
                ? "border-gold text-gold hover:bg-gold/10" // Adjusted hover for outline
                : "bg-gold hover:bg-gold-dark text-background" // Ensure text is visible
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> // Simple spinner
            ) : isPlaying ? (
              <Pause className="h-5 w-5" /> // Slightly larger icons
            ) : (
              <Play className="h-5 w-5 ml-[2px]" /> // Offset play icon slightly for visual centering
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            disabled={isLoading /* Add logic for end of playlist */}
            aria-label="Next ayah"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        {/* Right Side: Volume Control */}
        <div className="hidden md:flex items-center gap-2 min-w-[120px] justify-end">
          {" "}
          {/* Added min-width and justify-end */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute} // Use toggleMute or just show slider on click
            // onMouseEnter={() => setShowVolumeSlider(true)} // Optional: show slider on hover
            // onMouseLeave={() => setShowVolumeSlider(false)} // Optional: hide slider on leave
            aria-label="Volume settings"
          >
            <VolumeIcon className="h-5 w-5" /> {/* Use dynamic icon */}
          </Button>
          {/* Conditionally render slider or always show it */}
          {/* {showVolumeSlider && ( */}
          <Slider
            value={[volume]} // Slider value expects an array
            max={1}
            step={0.01} // Finer control step
            className="w-[80px]" // Adjust width as needed
            onValueChange={handleVolumeChange} // Use the handler
            aria-label="Volume control"
          />
          {/* )} */}
        </div>
        {/* Simple Volume for Mobile (optional) - Just icon */}
        <div className="md:hidden flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute} // Simple mute toggle for mobile
            aria-label="Toggle mute"
          >
            <VolumeIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
