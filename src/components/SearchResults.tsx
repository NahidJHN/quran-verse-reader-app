import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quranAPI, Ayah, Surah } from "@/services/quranAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";

export function SearchResults() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ ayah: Ayah; surah: Surah }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allSurahs, setAllSurahs] = useState<Surah[]>([]);
  const { toast } = useToast();

  const { translationLanguage } = useSettingsStore();

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const surahs = await quranAPI.getAllSurahs();
        setAllSurahs(surahs);
      } catch (error) {
        console.error("Error fetching surah data:", error);
        toast({
          title: "Error",
          description: "Failed to load Quran data",
          variant: "destructive",
        });
      }
    };

    fetchSurahs();
  }, [toast]);

  // Implement debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      return;
    }

    const debounceTimeout = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!allSurahs.length) return;

    setIsLoading(true);
    setResults([]);

    try {
      // In a real app, you would use the API's search endpoint
      // For this demo, we'll search through surah names and first few ayahs of popular surahs
      const searchResults: { ayah: Ayah; surah: Surah }[] = [];

      // Search in surah names
      const matchedSurahs = allSurahs.filter(
        (surah) =>
          surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // For demo purposes, get first ayah of matched surahs
      for (const surah of matchedSurahs.slice(0, 3)) {
        try {
          const surahDetail = await quranAPI.getSurah(surah.number);
          searchResults.push({
            ayah: surahDetail.ayahs[0],
            surah: surah,
          });
        } catch (error) {
          console.error(`Error fetching surah ${surah.number}:`, error);
        }
      }

      // Search in some popular surahs (for demo purposes - in a real app you'd use a proper search API)
      const popularSurahs = [1, 36, 55, 67, 112];
      for (const surahNumber of popularSurahs) {
        try {
          const surah = allSurahs.find((s) => s.number === surahNumber);
          if (!surah) continue;

          const surahDetail = await quranAPI.getSurah(surahNumber);
          const translations = await quranAPI.getTranslation(surahNumber, translationLanguage);

          // Find ayahs that match the search term in their translation
          const matchingAyahs = translations
            .filter((translation) => translation.text.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 2); // Limit to 2 results per surah

          for (const translation of matchingAyahs) {
            const ayah = surahDetail.ayahs.find((a) => a.numberInSurah === translation.numberInSurah);
            if (ayah) {
              searchResults.push({ ayah, surah });
            }
          }
        } catch (error) {
          console.error(`Error searching in surah ${surahNumber}:`, error);
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Error performing search:", error);
      toast({
        title: "Search error",
        description: "Failed to complete search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search the Quran..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {query.length > 0 && query.length < 3 && (
        <p className="text-center text-sm text-muted-foreground">Please type at least 3 characters to search</p>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && query.length >= 3 && results.length === 0 && (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">No results found for "{query}"</p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {results.length} results for "{query}"
          </p>

          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {result.surah.englishName} ({result.surah.name}) - Verse {result.ayah.numberInSurah}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="arabic-text text-base mb-2">{result.ayah.text}</p>
                <Link to={`/surah/${result.surah.number}?ayah=${result.ayah.numberInSurah}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    View in Surah
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
