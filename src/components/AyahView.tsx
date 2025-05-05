
import { Ayah, Translation } from "@/services/quranAPI";
import { Button } from "@/components/ui/button";
import { Play, Pause, Bookmark, BookmarkCheck } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useSettingsStore } from "@/store/settingsStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AyahViewProps {
  ayah: Ayah;
  translation?: Translation;
}

export function AyahView({ ayah, translation }: AyahViewProps) {
  const { play, pause, isPlaying, currentSurah, currentAyah } = useAudioStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const { showTranslation, arabicFontSize, translationFontSize } = useSettingsStore();
  const { toast } = useToast();
  
  // Safety check - if ayah or ayah.surah is undefined, return null
  if (!ayah || !ayah.surah) {
    console.warn("Missing ayah data in AyahView:", ayah);
    return null;
  }
  
  const isCurrentlyPlaying = 
    isPlaying && 
    currentSurah === ayah.surah.number && 
    currentAyah === ayah.numberInSurah;
  
  const isVerseBookmarked = isBookmarked(ayah.surah.number, ayah.numberInSurah);
  
  const handlePlayPause = () => {
    if (isCurrentlyPlaying) {
      pause();
    } else {
      console.log("Playing audio from AyahView:", ayah.surah.number, ayah.numberInSurah);
      play(ayah.surah.number, ayah.numberInSurah);
    }
  };
  
  const handleBookmarkToggle = () => {
    if (isVerseBookmarked) {
      removeBookmark(ayah.surah.number, ayah.numberInSurah);
      toast({
        title: "Bookmark removed",
        description: "Verse has been removed from your bookmarks",
      });
    } else {
      addBookmark(ayah.surah.number, ayah.numberInSurah);
      toast({
        title: "Bookmark added",
        description: "Verse has been added to your bookmarks",
      });
    }
  };

  const arabicSizeClasses = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-3xl",
  };

  const translationSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };
  
  return (
    <div className={cn(
      "p-4 border-b border-border/30 transition-colors",
      isCurrentlyPlaying && "bg-accent/20"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="verse-number">{ayah.numberInSurah}</div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            className={isVerseBookmarked ? "text-gold" : ""}
          >
            {isVerseBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={isCurrentlyPlaying ? "outline" : "ghost"}
            size="sm"
            onClick={handlePlayPause}
            className={isCurrentlyPlaying ? "border-gold text-gold" : ""}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <p className={cn(
        "arabic-text my-4 leading-loose",
        arabicSizeClasses[arabicFontSize]
      )}>
        {ayah.text}
      </p>
      
      {showTranslation && translation && (
        <p className={cn(
          "text-muted-foreground mt-2",
          translationSizeClasses[translationFontSize]
        )}>
          {translation.text}
        </p>
      )}
    </div>
  );
}
