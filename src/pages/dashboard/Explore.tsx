import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Compass, Loader2, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketResultCard } from '@/components/chat/MarketResultCard';
import type { SearchResult } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function searchMarketsApi(query: string, limit: number = 12) {
  const res = await fetch(`${API_URL}/v1/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit: limit.toString(), includeClosed: false, minVolume: 0 }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Explore() {
  const { user, loading: authLoading } = useAuth();
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [marketSearchResults, setMarketSearchResults] = useState<any[]>([]);
  const [marketSearchLoading, setMarketSearchLoading] = useState(false);
  const [marketSearchError, setMarketSearchError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, authLoading, navigate]);

  const handleMarketSearch = async () => {
    if (!marketSearchQuery.trim()) return;
    setMarketSearchLoading(true);
    setMarketSearchError(null);
    try {
      const response = await searchMarketsApi(marketSearchQuery, 12);
      setMarketSearchResults(response.results || []);
    } catch (error: any) {
      console.error("Error searching markets:", error);
      setMarketSearchError(error.message || "Failed to search markets.");
    } finally {
      setMarketSearchLoading(false);
    }
  };

  const handleClearMarketSearch = () => {
    setMarketSearchQuery('');
    setMarketSearchResults([]);
    setMarketSearchError(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold tracking-tight">Explore Markets</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Search and discover prediction markets for hedging opportunities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Search Prediction Markets
              </CardTitle>
              <CardDescription>
                Find relevant prediction markets across various platforms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 'Will the Fed cut rates in 2024?'"
                  value={marketSearchQuery}
                  onChange={(e) => setMarketSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMarketSearch()}
                  disabled={marketSearchLoading}
                />
                <Button onClick={handleMarketSearch} disabled={marketSearchLoading}>
                  {marketSearchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
              {marketSearchQuery && marketSearchResults.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Found {marketSearchResults.length} markets for "{marketSearchQuery}"</span>
                  <Button variant="ghost" size="sm" onClick={handleClearMarketSearch} className="gap-1">
                    <X className="h-3 w-3" /> Clear
                  </Button>
                </div>
              )}
              {marketSearchError && (
                <p className="text-sm text-destructive">{marketSearchError}</p>
              )}
            </CardContent>
          </Card>

          {marketSearchLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!marketSearchLoading && marketSearchResults.length === 0 && !marketSearchError && marketSearchQuery && (
            <div className="text-center py-10 text-muted-foreground">
              <p>No markets found. Try a different query!</p>
            </div>
          )}

          {!marketSearchLoading && marketSearchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketSearchResults.map((result) => (
                <MarketResultCard key={result.event_id} result={result} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </ScrollArea>
  );
}

