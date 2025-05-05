
import { useAudioStore } from "@/store/audioStore";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useEffect } from "react";

export function FooterPlayer() {
  const { isPlaying, currentSurah, currentAyah, play, pause, playNext, playPrevious, isLoading } = useAudioStore();
  const { setLastRead } = useBookmarkStore();
  
  // Automatically update last read position when playing a verse
  useEffect(() => {
    if (currentSurah && currentAyah) {
      setLastRead(currentSurah, currentAyah);
    }
  }, [currentSurah, currentAyah, setLastRead]);

  if (!currentSurah || !currentAyah) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-2 md:p-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link 
            to={`/surah/${currentSurah}`} 
            className="text-primary hover:text-gold transition-colors"
          >
            Surah {currentSurah}
          </Link>
          <span className="text-muted-foreground">•</span>
          <span>Ayah {currentAyah}</span>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            disabled={isLoading}
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
            className={isPlaying ? "border-gold text-gold" : "bg-gold hover:bg-gold-dark"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            disabled={isLoading}
            aria-label="Next ayah"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            aria-label="Volume settings"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
