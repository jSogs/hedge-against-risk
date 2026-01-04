import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, TrendingUp } from 'lucide-react';

interface Market {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  close_time: string | null;
  url: string | null;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user, loading: authLoading } = useAuth();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (query && user) {
      searchMarkets();
    }
  }, [query, user, authLoading, navigate]);

  const searchMarkets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('id, title, description, category, close_time, url')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(20);

      if (!error && data) {
        setMarkets(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar large placeholder="Search for risks to hedge..." />
        </div>

        {query && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Results for "<span className="text-primary">{query}</span>"
            </h2>
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : `${markets.length} markets found`}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : markets.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center text-muted-foreground">
              {query ? (
                <p>No markets found for "{query}". Try a different search term.</p>
              ) : (
                <p>Enter a search term to find hedging opportunities.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {markets.map((market) => (
              <Card key={market.id} className="glass hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{market.title}</CardTitle>
                      {market.description && (
                        <CardDescription className="line-clamp-2">
                          {market.description}
                        </CardDescription>
                      )}
                    </div>
                    {market.category && (
                      <Badge variant="secondary">{market.category}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {market.close_time && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Closes {new Date(market.close_time).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>View Details</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
