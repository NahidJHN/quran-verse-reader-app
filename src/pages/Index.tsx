
import { Header } from "@/components/Header";
import { NavigationMenu } from "@/components/NavigationMenu";
import { FooterPlayer } from "@/components/FooterPlayer";
import { Outlet } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <aside className="hidden md:block w-56 border-r border-border/40 bg-background p-4">
          <NavigationMenu />
        </aside>
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      
      <FooterPlayer />
    </div>
  );
};

export default Index;
