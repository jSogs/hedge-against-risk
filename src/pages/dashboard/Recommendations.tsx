import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Clock, CheckCircle, Loader2, ExternalLink, DollarSign, X, Undo2, TrendingDown, ShieldCheck } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { logAction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Recommendation {
  id: string;
  status: string;
  match_score: number;
  rationale: string;
  price_now: number | null;
  price_threshold: number | null;
  estimated_loss: number | null;
  estimated_recovery: number | null;
  created_at: string;
  event_id: string | null;
  market_id: string | null;
  outcome_id: string | null;
  rec_json: Json;
  markets?: { title: string; url: string | null; category: string | null } | null;
  kalshi_events?: { title: string; subtitle: string | null; series_ticker: string | null } | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function runRecommendations(userId: string) {
  const res = await fetch(`${API_URL}/v1/recommendations/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, limit: 5 }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Recommendations() {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedRecs, setDismissedRecs] = useState<Map<string, { rec: Recommendation; timeout: NodeJS.Timeout }>>(new Map());
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchRecommendations();
    }
  }, [user, authLoading, navigate]);

  const fetchRecommendations = async () => {
    if (!user) return;
  
    setLoading(true);
  
    const { data, error } = await supabase
      .from("recommendations")
      .select(`
        *,
        markets(title, url, category),
        kalshi_events(title, subtitle, series_ticker)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
  
    if (error) {
      setLoading(false);
      return;
    }
  
    if (!data || data.length === 0) {
      try {
        await runRecommendations(user.id);
  
        const { data: data2 } = await supabase
          .from("recommendations")
          .select(`
            *,
            markets(title, url, category),
            kalshi_events(title, subtitle, series_ticker)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
  
        if (data2) setRecommendations(data2 as Recommendation[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }
  
    setRecommendations(data as Recommendation[]);
    setLoading(false);
  };

  const handleDismiss = useCallback((rec: Recommendation) => {
    if (!user) return;
    
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
    
    const timeout = setTimeout(async () => {
      try {
        await logAction(user.id, rec.id, 'dismissed');
      } catch (e) {
        console.error('Failed to log dismiss action:', e);
      }
      setDismissedRecs(prev => {
        const next = new Map(prev);
        next.delete(rec.id);
        return next;
      });
    }, 5000);
    
    setDismissedRecs(prev => new Map(prev).set(rec.id, { rec, timeout }));
    
    toast({
      title: "Recommendation dismissed",
      description: "You won't see this recommendation again.",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUndo(rec.id)}
          className="gap-1"
        >
          <Undo2 className="h-3 w-3" />
          Undo
        </Button>
      ),
    });
  }, [user, toast]);

  const handleUndo = useCallback((recId: string) => {
    const dismissed = dismissedRecs.get(recId);
    if (!dismissed) return;
    
    clearTimeout(dismissed.timeout);
    
    setRecommendations(prev => [dismissed.rec, ...prev].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
    
    setDismissedRecs(prev => {
      const next = new Map(prev);
      next.delete(recId);
      return next;
    });
    
    toast({ title: "Recommendation restored" });
  }, [dismissedRecs, toast]);

  const handleKalshiClick = async (rec: Recommendation, url: string) => {
    if (!user) return;
    await logAction(user.id, rec.id, 'opened_link');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hedgeNow = recommendations.filter(r => r.status === 'hedge_now');
  const waiting = recommendations.filter(r => r.status === 'waiting');

  const MotionTabsContent = motion(TabsContent);

  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto px-6 py-8 max-w-6xl space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-semibold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            AI-powered hedging suggestions tailored to your risk profile
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Recommendations</CardDescription>
              <CardTitle className="text-3xl">{recommendations.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Hedge Now</CardDescription>
              <CardTitle className="text-3xl text-primary">{hedgeNow.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Watching</CardDescription>
              <CardTitle className="text-3xl">{waiting.length}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Sub-tabs for recommendations */}
        <Tabs
          value={searchParams.get("view") || "all"}
          onValueChange={(value) => {
            const next = new URLSearchParams(searchParams);
            next.set("view", value);
            setSearchParams(next, { replace: true });
          }}
          className="space-y-4"
        >
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hedge_now">Hedge Now</TabsTrigger>
            <TabsTrigger value="watching">Watching</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {(searchParams.get("view") || "all") === 'all' && (
              <MotionTabsContent key="all" value="all">
                <RecommendationsList 
                  recommendations={recommendations} 
                  onDismiss={handleDismiss}
                  onKalshiClick={handleKalshiClick}
                />
              </MotionTabsContent>
            )}

            {searchParams.get("view") === 'hedge_now' && (
              <MotionTabsContent key="hedge_now" value="hedge_now">
                <RecommendationsList 
                  recommendations={hedgeNow} 
                  onDismiss={handleDismiss}
                  onKalshiClick={handleKalshiClick}
                />
              </MotionTabsContent>
            )}

            {searchParams.get("view") === 'watching' && (
              <MotionTabsContent key="watching" value="watching">
                <RecommendationsList 
                  recommendations={waiting} 
                  onDismiss={handleDismiss}
                  onKalshiClick={handleKalshiClick}
                />
              </MotionTabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
  onDismiss: (rec: Recommendation) => void;
  onKalshiClick: (rec: Recommendation, url: string) => void;
}

function RecommendationsList({ recommendations, onDismiss, onKalshiClick }: RecommendationsListProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No recommendations available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {recommendations.map((rec) => {
        const recData = rec.rec_json as any;
        const title = rec.kalshi_events?.title || rec.markets?.title || recData?.event_title || 'Untitled';
        const subtitle = rec.kalshi_events?.subtitle;
        const category = rec.markets?.category || recData?.category;
        const seriesTicker = rec.kalshi_events?.series_ticker;
        const kalshiUrl = seriesTicker ? `https://kalshi.com/markets/${seriesTicker}` : null;
        const isHedgeNow = rec.status === 'hedge_now';

        return (
          <Card key={rec.id} className="bg-card/50 hover:bg-card transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isHedgeNow ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Hedge Now
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Watching
                      </Badge>
                    )}
                    {category && <Badge variant="outline" className="text-xs">{category}</Badge>}
                    <Badge variant="secondary" className="ml-auto">
                      {Math.round(rec.match_score * 100)}% match
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDismiss(rec)}
                  className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {rec.price_now !== null && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                      <div className="text-lg font-semibold">{(rec.price_now * 100).toFixed(0)}¢</div>
                    </div>
                  )}
                  {rec.estimated_loss !== null && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Est. Loss</div>
                      <div className="text-lg font-semibold text-destructive">
                        ${Math.abs(rec.estimated_loss).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {kalshiUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => onKalshiClick(rec, kalshiUrl)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Kalshi
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

