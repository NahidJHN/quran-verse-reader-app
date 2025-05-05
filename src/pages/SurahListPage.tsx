
import { useState, useEffect } from "react";
import { quranAPI, Surah } from "@/services/quranAPI";
import { SurahItem } from "@/components/SurahItem";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SurahListPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await quranAPI.getAllSurahs();
        setSurahs(data);
        setFilteredSurahs(data);
      } catch (error) {
        console.error("Error fetching surahs:", error);
        toast({
          title: "Error",
          description: "Failed to load surah list. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSurahs();
    
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toast]);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSurahs(surahs);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = surahs.filter(
      surah =>
        surah.englishName.toLowerCase().includes(query) ||
        surah.englishNameTranslation.toLowerCase().includes(query) ||
        surah.number.toString().includes(query)
    );
    
    setFilteredSurahs(filtered);
  }, [searchQuery, surahs]);
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Surah List</h1>
      
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-sm py-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search surahs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-16 bg-muted animate-pulse rounded-md"
            ></div>
          ))
        ) : filteredSurahs.length > 0 ? (
          filteredSurahs.map((surah) => (
            <SurahItem key={surah.number} surah={surah} />
          ))
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No surahs found matching "{searchQuery}"
          </p>
        )}
      </div>
      
      {showScrollToTop && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg"
          onClick={handleScrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
