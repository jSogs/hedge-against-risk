import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Link2, CreditCard, Shield, LogOut, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface SettingsModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type SettingsTab = "account" | "notifications" | "integrations" | "billing";

import { User as SupabaseUser } from '@supabase/supabase-js';

// ...

function AccountTab({ user }: { user: SupabaseUser | null }) {
  const [userName, setUserName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('profile_json')
        .eq('user_id', user.id)
        .single();
      
      if (data && data.profile_json) {
        const pJson = data.profile_json as Record<string, unknown>;
        setUserName((pJson.name as string) || '');
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_json')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Use a known type or unknown instead of any
      const profileJson = (profile.profile_json as Record<string, unknown>) || {};
      
      // Update only the name field
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_json: {
            ...profileJson,
            name: userName || null
          }
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Name updated',
        description: 'Your display name has been saved successfully.',
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update name';
      toast({
        variant: 'destructive',
        title: 'Failed to update name',
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Profile Photo</h3>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-2xl border-2 border-muted">
              <AvatarFallback className="text-xl bg-muted/50">
                {userName ? userName.substring(0, 2).toUpperCase() : user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="bg-background shadow-sm">Upload new</Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Your Name</Label>
          <div className="flex gap-2">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              className="border-l-4 border-l-primary/50"
            />
            <Button onClick={handleSaveName} disabled={saving} size="sm" className="shrink-0">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">This is how we'll greet you throughout the app.</p>
        </div>

        <div className="grid gap-2">
          <Label>Email Address</Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted/10 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
            {user?.email}
          </div>
          <p className="text-[10px] text-muted-foreground">Contact support to change your email.</p>
        </div>
      </div>
    </div>
  );
}

function ComingSoonPanel({
  title,
  description,
  bullets,
}: {
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{title}</h3>
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                Coming soon
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {bullets.map((b) => (
            <div key={b} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Button variant="outline" disabled className="bg-background">
            Notify me
          </Button>
          <span className="text-xs text-muted-foreground">We’ll enable this in a future update.</span>
        </div>
      </div>
    </div>
  );
}

export function SettingsModal({ children, open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const { user, signOut } = useAuth();

  const menuItems: Array<{
    id: SettingsTab;
    label: string;
    icon: typeof User;
    comingSoon?: boolean;
  }> = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Link2, comingSoon: true },
    { id: "billing", label: "Billing", icon: CreditCard, comingSoon: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
            <Settings className="h-5 w-5" />
          </button>
        )}
      </DialogTrigger>
      {/* Updated DialogContent to be opaque clean white */}
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl duration-200 sm:rounded-2xl h-[600px] flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-muted/30 border-r border-border p-6 flex flex-col gap-6 shrink-0">
          <div>
            <h2 className="text-lg font-semibold tracking-tight mb-1">Settings</h2>
            <p className="text-xs text-muted-foreground">Manage your workspace</p>
          </div>
          
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    item.comingSoon && "opacity-80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.comingSoon && (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Soon</span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto">
             <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-background border border-border mb-4">
                <Avatar className="h-8 w-8 rounded-lg border">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{user?.email?.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">{user?.email}</span>
                  <span className="text-[10px] text-muted-foreground">Free Plan</span>
                </div>
             </div>
             <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
             </Button>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="h-16 border-b border-border/40 flex items-center px-8 shrink-0">
            <h2 className="text-lg font-medium capitalize">{activeTab}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8">
            
            {activeTab === "account" && <AccountTab user={user} />}

            {activeTab === "notifications" && (
              <div className="max-w-xl space-y-6">
                <div className="space-y-4">
                   <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Alerts</h3>
                   <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="space-y-0.5">
                        <Label className="text-base">Hedge Recommendations</Label>
                        <p className="text-xs text-muted-foreground">Receive alerts when new hedging opportunities match your profile.</p>
                      </div>
                      <Switch defaultChecked />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="space-y-0.5">
                        <Label className="text-base">Market Volatility</Label>
                        <p className="text-xs text-muted-foreground">Get notified about significant market moves affecting your positions.</p>
                      </div>
                      <Switch defaultChecked />
                   </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <ComingSoonPanel
                title="Integrations"
                description="Connect accounts to let Probable analyze your exposure and generate better market-centric hedges."
                bullets={[
                  "Prediction market platform connections (e.g. Kalshi/Polymarket)",
                  "Brokerage read-only imports (positions + cashflow context)",
                  "Automatic reconciliation for exposure tracking",
                ]}
              />
            )}

            {activeTab === "billing" && (
              <ComingSoonPanel
                title="Billing"
                description="Plans, upgrades, and usage limits will live here."
                bullets={[
                  "Team/workspace management",
                  "Usage-based limits for document analysis",
                  "Pro features for market monitoring + alerts",
                ]}
              />
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
