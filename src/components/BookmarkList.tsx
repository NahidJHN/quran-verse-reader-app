
import { useState, useEffect } from "react";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { quranAPI, Ayah, Surah } from "@/services/quranAPI";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function BookmarkList() {
  const { bookmarks, removeBookmark } = useBookmarkStore();
  const [surahData, setSurahData] = useState<Record<number, Surah>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSurahData = async () => {
      setIsLoading(true);
      try {
        const allSurahs = await quranAPI.getAllSurahs();
        const surahMap: Record<number, Surah> = {};
        
        allSurahs.forEach(surah => {
          surahMap[surah.number] = surah;
        });
        
        setSurahData(surahMap);
      } catch (error) {
        console.error("Error fetching surah data:", error);
        toast({
          title: "Error",
          description: "Failed to load surah information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSurahData();
  }, [toast]);
  
  const handleRemove = (surahNumber: number, ayahNumber: number) => {
    removeBookmark(surahNumber, ayahNumber);
    toast({
      title: "Bookmark removed",
      description: "Verse has been removed from your bookmarks",
    });
  };
  
  if (isLoading) {
    return (
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
    );
  }
  
  if (bookmarks.length === 0) {
    return (
      <Card className="text-center p-8">
        <p className="text-muted-foreground mb-4">You don't have any bookmarks yet.</p>
        <Link to="/surah">
          <Button variant="outline">Browse Surahs</Button>
        </Link>
      </Card>
    );
  }
  
  // Sort bookmarks by most recent first
  const sortedBookmarks = [...bookmarks].sort((a, b) => b.timestamp - a.timestamp);
  
  return (
    <div className="space-y-4">
      {sortedBookmarks.map((bookmark) => {
        const surah = surahData[bookmark.surahNumber];
        if (!surah) return null;
        
        return (
          <Card key={`${bookmark.surahNumber}-${bookmark.ayahNumber}-${bookmark.timestamp}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {surah.englishName} ({surah.name})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Verse {bookmark.ayahNumber}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(bookmark.surahNumber, bookmark.ayahNumber)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link to={`/surah/${bookmark.surahNumber}?ayah=${bookmark.ayahNumber}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
