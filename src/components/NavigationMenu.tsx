
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, Bookmark, Home, Search, Settings } from "lucide-react";

interface NavigationMenuProps {
  className?: string;
}

export function NavigationMenu({ className }: NavigationMenuProps) {
  const location = useLocation();
  
  const menuItems = [
    { 
      title: "Home",
      path: "/",
      icon: <Home className="h-5 w-5" />
    },
    { 
      title: "Surah List",
      path: "/surah",
      icon: <BookOpen className="h-5 w-5" />
    },
    { 
      title: "Bookmarks",
      path: "/bookmarks",
      icon: <Bookmark className="h-5 w-5" />
    },
    { 
      title: "Search",
      path: "/search",
      icon: <Search className="h-5 w-5" />
    },
    { 
      title: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];
  
  return (
    <nav className={cn("flex md:flex-col gap-4", className)}>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent",
            location.pathname === item.path 
              ? "bg-accent text-accent-foreground" 
              : "text-muted-foreground"
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
