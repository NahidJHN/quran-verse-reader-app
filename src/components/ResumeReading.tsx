
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResumeReading() {
  const { lastRead } = useBookmarkStore();
  
  if (!lastRead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Start Reading
          </CardTitle>
          <CardDescription>Begin your Quran journey</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground">
            You haven't started reading yet. Click below to begin with Al-Fatihah.
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/surah/1" className="w-full">
            <Button variant="default" className="w-full bg-gold hover:bg-gold-dark">
              Start Reading
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Continue Reading
        </CardTitle>
        <CardDescription>Resume where you left off</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-muted-foreground">
          Surah {lastRead.surahNumber}, Verse {lastRead.ayahNumber}
        </p>
      </CardContent>
      <CardFooter>
        <Link to={`/surah/${lastRead.surahNumber}?ayah=${lastRead.ayahNumber}`} className="w-full">
          <Button variant="default" className="w-full bg-gold hover:bg-gold-dark">
            Resume Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
