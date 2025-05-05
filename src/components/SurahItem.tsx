
import { Surah } from "@/services/quranAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SurahItemProps {
  surah: Surah;
  className?: string;
}

export function SurahItem({ surah, className }: SurahItemProps) {
  return (
    <Link to={`/surah/${surah.number}`}>
      <Card className={cn(
        "transition-all hover:border-gold/30 hover:shadow-md",
        className
      )}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-accent/50 text-sm font-mono">
              {surah.number}
            </div>
            <div>
              <h3 className="font-medium">{surah.englishName}</h3>
              <p className="text-xs text-muted-foreground">{surah.englishNameTranslation}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="arabic-text text-lg font-arabic">{surah.name}</span>
            <span className="text-xs text-muted-foreground">{surah.numberOfAyahs} verses</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
