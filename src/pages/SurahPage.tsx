
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { quranAPI, SurahDetail, Translation } from "@/services/quranAPI";
import { AyahView } from "@/components/AyahView";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SettingsForm } from "@/components/SettingsForm";
import { useToast } from "@/hooks/use-toast";

export default function SurahPage() {
  const { surahId } = useParams<{ surahId: string }>();
  const [searchParams] = useSearchParams();
  const ayahParam = searchParams.get("ayah");
  
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Reference to target ayah for scrolling
  const targetAyahRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchSurahData = async () => {
      if (!surahId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const surahNumber = parseInt(surahId);
        console.log("Fetching surah:", surahNumber);
        const surahData = await quranAPI.getSurah(surahNumber);
        console.log("Surah data received:", surahData);
        
        if (!surahData || !surahData.ayahs) {
          throw new Error("Invalid surah data received");
        }
        
        // Make sure each ayah has the surah property
        surahData.ayahs.forEach(ayah => {
          if (!ayah.surah) {
            ayah.surah = {
              number: surahData.number,
              name: surahData.name,
              englishName: surahData.englishName,
              englishNameTranslation: surahData.englishNameTranslation,
              revelationType: surahData.revelationType
            };
          }
        });
        
        const translationData = await quranAPI.getTranslation(surahNumber);
        console.log("Translation data received", translationData);
        
        setSurah(surahData);
        setTranslations(translationData || []);
      } catch (error) {
        console.error("Error fetching surah data:", error);
        setError("Failed to load surah. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load surah. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSurahData();
  }, [surahId, toast]);
  
  // Scroll to the specific ayah if specified in the URL
  useEffect(() => {
    if (ayahParam && !isLoading && targetAyahRef.current) {
      setTimeout(() => {
        targetAyahRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [ayahParam, isLoading]);
  
  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse mt-6 mb-8"></div>
        
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2 mb-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-20 bg-muted rounded w-full"></div>
            <div className="h-12 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error || !surah) {
    return (
      <div className="container py-6">
        <p className="text-center text-muted-foreground">
          {error || "Surah not found."}
        </p>
        <div className="flex justify-center mt-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{surah?.englishName}</span>
            <span className="text-xl text-gold font-arabic">{surah?.name}</span>
          </h1>
          <p className="text-muted-foreground">
            {surah?.englishNameTranslation} • {surah?.numberOfAyahs} verses • {surah?.revelationType}
          </p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <SettingsForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {surah && surah.ayahs && surah.ayahs.length > 0 ? (
          surah.ayahs.map((ayah) => {
            // Ensure ayah has all required properties before rendering
            if (!ayah || !ayah.surah) return null;
            
            const translation = translations.find(t => t.numberInSurah === ayah.numberInSurah);
            const isTargetAyah = ayahParam && parseInt(ayahParam) === ayah.numberInSurah;
            
            return (
              <div
                key={ayah.number}
                ref={isTargetAyah ? targetAyahRef : null}
                className={isTargetAyah ? "bg-accent/10" : ""}
              >
                <AyahView
                  ayah={ayah}
                  translation={translation}
                />
              </div>
            );
          })
        ) : (
          <p className="p-4 text-center text-muted-foreground">No verses found.</p>
        )}
      </div>
    </div>
  );
}
