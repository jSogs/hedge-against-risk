import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileNotificationsDropdown } from "@/components/notifications/MobileNotificationsDropdown";
import { SecondarySidebar } from "@/components/layout/secondary/SecondarySidebar";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(true);

  return (
    <SidebarProvider className="h-screen w-full overflow-hidden flex bg-background">
      {/* 1. Main Rail (Fixed width handled by component) */}
      <AppSidebar />
      
      {/* 2. Secondary Sidebar (Fixed width, full height) - Opaque background */}
      <div className={cn(
        "hidden md:flex h-full flex-col border-y-2 border-r-2 border-border bg-sidebar shrink-0 transition-all duration-300",
        secondarySidebarOpen ? "w-[280px]" : "w-0 border-r-0"
      )}>
        {secondarySidebarOpen && (
          <SecondarySidebar onClose={() => setSecondarySidebarOpen(false)} />
        )}
      </div>

      {/* Toggle button when sidebar is closed */}
      {!secondarySidebarOpen && (
        <div className="hidden md:flex h-full items-start pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSecondarySidebarOpen(true)}
            className="h-8 w-8 rounded-r-lg rounded-l-none border border-l-0 border-border bg-sidebar hover:bg-sidebar-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 3. Main Content Area (Flexgrow, handles its own scrolling) */}
      <SidebarInset className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
             <MobileNotificationsDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background h-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
