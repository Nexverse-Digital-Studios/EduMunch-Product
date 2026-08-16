import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          // Desktop margin
          isCollapsed ? "lg:ml-16" : "lg:ml-64",
          // Mobile no margin (sidebar overlays)
          "ml-0"
        )}
      >
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
