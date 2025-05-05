import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { quranAPI, SurahDetail, Translation } from "@/services/quranAPI";
import { AyahView } from "@/components/AyahView";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SettingsForm } from "@/components/SettingsForm";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";

export default function SurahPage() {
  const { surahId } = useParams<{ surahId: string }>();
  const [searchParams] = useSearchParams();
  const ayahParam = searchParams.get("ayah");

  const { translationLanguage } = useSettingsStore();

  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const targetAyahRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchSurahData = async () => {
      if (!surahId) return;
      setIsLoading(true);
      setError(null);

      try {
        const surahNumber = parseInt(surahId);
        const surahData = await quranAPI.getSurah(surahNumber);
        if (!surahData || !surahData.ayahs) {
          throw new Error("Invalid surah data received");
        }

        surahData.ayahs.forEach((ayah) => {
          ayah.surah ??= {
            number: surahData.number,
            name: surahData.name,
            englishName: surahData.englishName,
            englishNameTranslation: surahData.englishNameTranslation,
            revelationType: surahData.revelationType,
          };
        });
        const translationData = await quranAPI.getTranslation(surahNumber, translationLanguage);
        setSurah(surahData);
        setTranslations(translationData || []);
      } catch (err) {
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
  }, [surahId, toast, translationLanguage]);

  useEffect(() => {
    if (ayahParam && !isLoading && targetAyahRef.current) {
      setTimeout(() => {
        targetAyahRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [ayahParam, isLoading]);

  if (isLoading) {
    return (
      <div className="container py-10 space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
        <div className="h-4 w-1/4 bg-muted rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="container py-12 text-center">
        <p className="text-lg text-muted-foreground">{error || "Surah not found."}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }
  return (
    <div className="container py-8 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
            <span>{surah.englishName}</span>
            <span className="text-2xl text-gold font-arabic">{surah.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {surah.englishNameTranslation} • {surah.numberOfAyahs} verses • {surah.revelationType}
          </p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="border border-input shadow-sm">
              <Settings className="h-5 w-5" />
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

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {surah.ayahs.map((ayah) => {
          if (!ayah || !ayah.surah) return null;
          const translation = translations.find((t) => t.numberInSurah === ayah.numberInSurah);
          const isTargetAyah = ayahParam && parseInt(ayahParam) === ayah.numberInSurah;

          return (
            <div
              key={ayah.number}
              id={`ayah-${surah.number}-${ayah.numberInSurah}`}
              ref={isTargetAyah ? targetAyahRef : null}
              className={`transition-colors ${isTargetAyah ? "bg-accent/10" : "hover:bg-muted/5"}`}
            >
              <AyahView ayah={ayah} translation={translation} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
