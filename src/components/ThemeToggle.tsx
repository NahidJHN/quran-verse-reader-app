
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();
  
  useEffect(() => {
    // Apply the theme to the HTML element
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-gold" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
