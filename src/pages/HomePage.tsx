
import { DailyVerse } from "@/components/DailyVerse";
import { ResumeReading } from "@/components/ResumeReading";
import { Bookmark, BookOpen, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  {
    title: "Browse Surahs",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-blue-500/20 text-blue-500",
    path: "/surah"
  },
  {
    title: "Bookmarks",
    icon: <Bookmark className="h-5 w-5" />,
    color: "bg-purple-500/20 text-purple-500",
    path: "/bookmarks"
  },
  {
    title: "Search",
    icon: <Search className="h-5 w-5" />,
    color: "bg-orange-500/20 text-orange-500",
    path: "/search"
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    color: "bg-green-500/20 text-green-500",
    path: "/settings"
  }
];

export default function HomePage() {
  return (
    <div className="container py-6 space-y-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">
        <span className="text-gold">Quran</span> Reader App
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ResumeReading />
          
          <div className="grid grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.path}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className={`w-10 h-10 rounded-full ${link.color} flex items-center justify-center mb-2`}>
                      {link.icon}
                    </div>
                    <span className="text-sm font-medium">{link.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        
        <DailyVerse />
      </div>
    </div>
  );
}
