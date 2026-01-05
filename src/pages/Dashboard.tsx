import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface Recommendation {
  id: string;
  status: string;
  match_score: number;
  rationale: string;
  price_now: number | null;
  created_at: string;
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


export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  
    // 1) Try DB first
    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
  
    if (error) {
      setLoading(false);
      return;
    }
  
    // 2) If none, run backend to generate + store, then refetch
    if (!data || data.length === 0) {
      try {
        await runRecommendations(user.id);
  
        const { data: data2 } = await supabase
          .from("recommendations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
  
        if (data2) setRecommendations(data2);
      } catch (e) {
        // optional: show toast
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }
  
    // 3) Otherwise use cached DB data
    setRecommendations(data);
    setLoading(false);
  };
  

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const hedgeNow = recommendations.filter(r => r.status === 'hedge_now');
  const waiting = recommendations.filter(r => r.status === 'wait');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your hedging recommendations and active positions.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription>Total Recommendations</CardDescription>
              <CardTitle className="text-3xl">{recommendations.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription>Hedge Now</CardDescription>
              <CardTitle className="text-3xl text-primary">{hedgeNow.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription>Watching</CardDescription>
              <CardTitle className="text-3xl">{waiting.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recommendations Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hedge_now">Hedge Now</TabsTrigger>
            <TabsTrigger value="watching">Watching</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <RecommendationsList recommendations={recommendations} />
          </TabsContent>

          <TabsContent value="hedge_now">
            <RecommendationsList recommendations={hedgeNow} />
          </TabsContent>

          <TabsContent value="watching">
            <RecommendationsList recommendations={waiting} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function RecommendationsList({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No recommendations yet. Search for risks to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <Card key={rec.id} className="glass">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {rec.status === 'hedge_now' ? (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  ) : rec.status === 'wait' ? (
                    <Clock className="h-5 w-5 text-warning" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium capitalize">
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-muted-foreground">{rec.rationale || 'No rationale provided'}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{Math.round(rec.match_score * 100)}%</p>
                <p className="text-sm text-muted-foreground">Match Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
