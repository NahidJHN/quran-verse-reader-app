import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { quranAPI, Ayah, Translation } from "@/services/quranAPI";
import { Button } from "@/components/ui/button";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";

export function DailyVerse() {
  const [dailyVerse, setDailyVerse] = useState<Ayah | null>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { play } = useAudioStore();
  const { translationLanguage } = useSettingsStore();

  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        setIsLoading(true);

        // Generate a "random" surah and ayah based on the date
        // This ensures the same verse appears on the same day for all users
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - startOfYear.getTime();
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

        // Use the day of year to pick a surah (1-114)
        const surahNumber = (dayOfYear % 114) + 1;

        // Fetch the surah to get its length
        const surah = await quranAPI.getSurah(surahNumber);

        if (!surah || !surah.ayahs || surah.ayahs.length === 0) {
          throw new Error("Failed to load surah data");
        }

        // Pick an ayah from the surah
        const ayahIndex = dayOfYear % surah.numberOfAyahs;
        const ayah = surah.ayahs[ayahIndex];

        if (!ayah) {
          throw new Error("Failed to load ayah data");
        }

        // Set the surah property explicitly if it's missing
        if (!ayah.surah) {
          ayah.surah = {
            number: surah.number,
            name: surah.name,
            englishName: surah.englishName,
            englishNameTranslation: surah.englishNameTranslation,
            revelationType: surah.revelationType,
          };
        }

        // Fetch the translation
        const translations = await quranAPI.getTranslation(surahNumber, translationLanguage);
        const translationText = translations && translations.length > ayahIndex ? translations[ayahIndex] : null;

        setDailyVerse(ayah);
        setTranslation(translationText);
      } catch (error) {
        console.error("Error fetching daily verse:", error);
        toast({
          title: "Error",
          description: "Failed to load daily verse. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyVerse();
  }, [toast]);

  const handleBookmarkToggle = () => {
    if (!dailyVerse || !dailyVerse.surah) return;

    const surahNumber = dailyVerse.surah.number;
    const ayahNumber = dailyVerse.numberInSurah;

    if (isBookmarked(surahNumber, ayahNumber)) {
      removeBookmark(surahNumber, ayahNumber);
      toast({
        title: "Bookmark removed",
        description: "Verse has been removed from your bookmarks",
      });
    } else {
      addBookmark(surahNumber, ayahNumber);
      toast({
        title: "Bookmark added",
        description: "Verse has been added to your bookmarks",
      });
    }
  };

  const handlePlay = () => {
    if (!dailyVerse || !dailyVerse.surah) return;

    console.log("Playing daily verse audio for surah:", dailyVerse.surah.number, "ayah:", dailyVerse.numberInSurah);
    play(dailyVerse.surah.number, dailyVerse.numberInSurah);
  };

  if (isLoading || !dailyVerse) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-8 w-1/3 bg-muted rounded"></CardTitle>
          <CardDescription className="h-4 w-1/2 bg-muted rounded"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded mb-4"></div>
          <div className="h-12 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Make sure dailyVerse.surah exists before trying to use it
  const isVerseBookmarked =
    dailyVerse && dailyVerse.surah ? isBookmarked(dailyVerse.surah.number, dailyVerse.numberInSurah) : false;

  return (
    <Card className="bg-card overflow-hidden border-gold/20">
      <CardHeader className="bg-card/80 border-b border-border pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Verse of the Day</span>
          {dailyVerse && dailyVerse.surah && (
            <Link
              to={`/surah/${dailyVerse.surah.number}`}
              className="text-sm font-normal text-gold hover:text-gold-light transition-colors"
            >
              Surah {dailyVerse.surah.englishName}
            </Link>
          )}
        </CardTitle>
        <CardDescription>
          {dailyVerse && dailyVerse.surah
            ? `${dailyVerse.surah.englishNameTranslation} - Verse ${dailyVerse.numberInSurah}`
            : "Loading..."}
        </CardDescription>
      </CardHeader>
      {dailyVerse && (
        <CardContent className="pt-4">
          <p className="arabic-text text-2xl mb-4 leading-loose">{dailyVerse.text}</p>
          {translation && <p className="text-sm text-muted-foreground mt-2 mb-4 italic">"{translation.text}"</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmarkToggle}
              className={isVerseBookmarked ? "text-gold border-gold" : ""}
            >
              {isVerseBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
              {isVerseBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button variant="default" size="sm" onClick={handlePlay} className="bg-gold hover:bg-gold-dark">
              <Play className="h-4 w-4 mr-2" />
              Listen
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
