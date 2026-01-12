import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChatListSidebar } from "@/components/chat/ChatListSidebar";
import { TrashModal } from "@/components/chat/TrashModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Home,
  Info,
  LayoutDashboard,
  MessageSquare,
  X,
  Trash2,
  Target,
  FileText,
  Eye,
  Compass,
  User,
  DollarSign,
  Shield,
  TrendingUp,
} from "lucide-react";

function SidebarShell({
  title,
  children,
  onTrashClick,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onTrashClick?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b-2 border-border bg-muted/10 shrink-0">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
      {onTrashClick && <SecondarySidebarFooter onTrashClick={onTrashClick} />}
    </div>
  );
}

function SecondarySidebarFooter({ onTrashClick }: { onTrashClick: () => void }) {
  return (
    <div className="border-t-2 border-border bg-muted/10 p-3 shrink-0">
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onTrashClick}
      >
        <Trash2 className="h-4 w-4" />
        <span className="text-sm">Trash</span>
      </Button>
    </div>
  );
}

function SimpleNavPanel({
  items,
}: {
  items: Array<{
    title: string;
    subtitle?: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeText = "text-foreground";
  const activeBg = "bg-primary/20";

  return (
    <div className="p-3 space-y-1">
      {items.map((item) => {
        const active = location.pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-12 rounded-lg items-start py-2",
              active && cn(activeBg, "border border-primary/30")
            )}
            onClick={() => navigate(item.href)}
          >
            <Icon className={cn("h-4 w-4", active ? activeText : "text-muted-foreground")} />
            <div className="text-left leading-tight">
              <div className={cn("text-sm font-medium", active && activeText)}>{item.title}</div>
              {item.subtitle && (
                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
}

function DashboardPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeText = "text-foreground";
  const activeBg = "bg-primary/20";

  const items = [
    { key: "recommendations", title: "Recommendations", subtitle: "Hedge suggestions", icon: Target, path: "/dashboard" },
    { key: "exposure", title: "Exposure", subtitle: "Financial analysis", icon: FileText, path: "/dashboard/exposure" },
    { key: "watching", title: "Watching", subtitle: "Monitored markets", icon: Eye, path: "/dashboard/watching" },
    { key: "explore", title: "Explore Markets", subtitle: "Search & discover", icon: Compass, path: "/dashboard/explore" },
  ] as const;

  return (
    <div className="p-3 space-y-1">
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Button
            key={item.key}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-12 rounded-lg items-start py-2",
              active && cn(activeBg, "border border-primary/30")
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className={cn("h-4 w-4", active ? activeText : "text-muted-foreground")} />
            <div className="text-left leading-tight">
              <div className={cn("text-sm font-medium", active && activeText)}>{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.subtitle}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

function HomeInfoPanel() {
  const navigate = useNavigate();
  const activeText = "text-foreground";

  return (
    <div className="p-3">
      {/* Primary Home item */}
      <Button
        variant="ghost"
        className={cn("w-full justify-start h-12 rounded-lg border border-primary/30 bg-primary/20 gap-3")}
        onClick={() => navigate("/home")}
      >
        <Home className={cn("h-4 w-4", activeText)} />
        <span className={cn("text-sm font-medium", activeText)}>Welcome to Probable</span>
      </Button>

      {/* Subcategory: Info (opens modal) */}
      <DialogPrimitive.Root>
        <DialogPrimitive.Trigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "mt-1 w-full justify-start h-10 rounded-lg text-muted-foreground gap-3",
              "pl-9"
            )}
          >
            <Info className="h-4 w-4" />
            <span className="text-sm">Info</span>
          </Button>
        </DialogPrimitive.Trigger>

        <DialogPrimitive.Portal>
          {/* Blurred overlay style to match the auth overlay on Landing.tsx */}
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[min(92vw,44rem)] translate-x-[-50%] translate-y-[-50%] outline-none">
            <Card className="glass shadow-xl rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 pb-4 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
                    <div className="text-xl font-bold tracking-tight">Welcome to Probable</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Home is where you turn a real-world risk into a hedge.
            </div>
          </div>
                  <DialogPrimitive.Close asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogPrimitive.Close>
        </div>

                <ScrollArea className="max-h-[70vh]">
                  <div className="p-6 pt-5 space-y-5">
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      Probable helps you turn real-world uncertainty into actionable hedges.
                      Here’s the flow:
          </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold">1) Generate your risk profile &amp; exposure</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        We build a baseline understanding of what you care about and where you’re exposed.
        </div>
      </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold">2) Use Chat to talk about your risk</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        Tell us what you want covered/insured, or ask what risks you should hedge.
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold">3) Get hedge suggestions + a recommended hedge amount</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        You’ll get market-based hedge ideas and a suggested total hedge size (in dollars).
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold">4) Track everything in the Dashboard</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        Monitor recommendations over time and take action when it matters.
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold">5) Receive realtime hedge recommendations</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        As conditions change, Probable can generate new recommendations based on your risk profile.
                      </div>
                    </div>

                    <div className="pt-2 grid gap-2 sm:grid-cols-2">
                      <DialogPrimitive.Close asChild>
        <Button
          className="w-full justify-start shadow-sm"
          onClick={() => navigate("/chat")}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
                          Open chat
        </Button>
                      </DialogPrimitive.Close>
                      <DialogPrimitive.Close asChild>
        <Button
          variant="outline"
          className="w-full justify-start shadow-sm bg-background"
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Go to dashboard
        </Button>
                      </DialogPrimitive.Close>
                    </div>
      </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

function ProfilePanel() {
  const navigate = useNavigate();
  
  // Smooth scroll to a section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 rounded-lg items-start py-2 hover:bg-primary/10"
            onClick={() => scrollToSection('risk-identity')}
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-medium">Personal Profile</span>
              <span className="text-xs text-muted-foreground">Location & context</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 rounded-lg items-start py-2 hover:bg-primary/10"
            onClick={() => scrollToSection('exposure-matrix')}
          >
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-medium">Exposure Matrix</span>
              <span className="text-xs text-muted-foreground">Primary risks & debt</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 rounded-lg items-start py-2 hover:bg-primary/10"
            onClick={() => scrollToSection('hedging-preferences')}
          >
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-medium">Hedging Strategy</span>
              <span className="text-xs text-muted-foreground">Budget & risk appetite</span>
            </div>
          </Button>
        </div>

        <div className="px-3 py-4">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Why profile matters
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A complete risk profile helps Probable surface the most relevant hedging opportunities for your unique situation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 pb-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Quick Actions
          </div>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-sm"
            onClick={() => navigate('/dashboard/recommendations')}
          >
            <Target className="h-3.5 w-3.5" />
            View Recommendations
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-sm"
            onClick={() => navigate('/chat')}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Ask Hedge AI
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}

interface SecondarySidebarProps {
  onClose?: () => void;
}

export function SecondarySidebar({ onClose }: SecondarySidebarProps) {
  const location = useLocation();
  const [trashModalOpen, setTrashModalOpen] = useState(false);

  if (location.pathname.startsWith("/home")) {
    return (
      <SidebarShell title="Home" onClose={onClose}>
        <HomeInfoPanel />
      </SidebarShell>
    );
  }

  if (location.pathname.startsWith("/chat")) {
    return (
      <>
        <SidebarShell 
          title="Chat" 
          onTrashClick={() => setTrashModalOpen(true)}
          onClose={onClose}
        >
          <ChatListSidebar />
        </SidebarShell>
        <TrashModal open={trashModalOpen} onOpenChange={setTrashModalOpen} />
      </>
    );
  }

  if (location.pathname.startsWith("/dashboard")) {
    return (
      <SidebarShell title="Dashboard" onClose={onClose}>
        <DashboardPanel />
      </SidebarShell>
    );
  }

  if (location.pathname.startsWith("/profile")) {
    return (
      <SidebarShell title="Risk Profile" onClose={onClose}>
        <ProfilePanel />
      </SidebarShell>
    );
  }

  // Default: Home-ish panel
  return (
    <SidebarShell title="Workspace" onClose={onClose}>
      <SimpleNavPanel
        items={[
          { title: "Home", subtitle: "Search & workspace", href: "/home", icon: Home },
          { title: "Chat", subtitle: "Ask Hedge AI", href: "/chat", icon: MessageSquare },
          { title: "Dashboard", subtitle: "Recommendations", href: "/dashboard", icon: LayoutDashboard },
        ]}
      />
    </SidebarShell>
  );
}
