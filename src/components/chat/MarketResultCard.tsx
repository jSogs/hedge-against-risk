import { ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SearchResult } from '@/types/chat';

interface MarketResultCardProps {
  result: SearchResult;
}

export function MarketResultCard({ result }: MarketResultCardProps) {
  // Construct market URL - supports both Kalshi and Polymarket
  const firstMarket = result.markets[0];
  const platform = firstMarket?.platform || 'kalshi';
  
  let marketUrl = null;
  if (platform === 'polymarket') {
    // Polymarket URLs typically need an event slug + market slug:
    //   https://polymarket.com/event/<event-slug>/<market-slug>
    // Our API sometimes only returns the market slug, so fall back to search.
    if (result.series_ticker?.includes('/')) {
      marketUrl = `https://polymarket.com/event/${result.series_ticker}`;
    } else if (result.event_title) {
      marketUrl = `https://polymarket.com/search?q=${encodeURIComponent(result.event_title)}`;
    }
  } else if (result.series_ticker) {
    marketUrl = `https://kalshi.com/markets/${result.series_ticker}`;
  }
  
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium prose prose-sm max-w-none prose-p:inline prose-p:m-0 prose-strong:font-semibold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.event_title}</ReactMarkdown>
          </CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">
            {(result.similarity * 100).toFixed(0)}% match
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.markets.map((market) => (
          <div key={market.market_id} className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground prose prose-sm max-w-none prose-p:inline prose-p:m-0 prose-strong:font-semibold">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{market.market_title}</ReactMarkdown>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {market.outcomes.map((outcome) => (
                <div
                  key={outcome.outcome_id}
                  className="flex items-center justify-between bg-background rounded-md px-2 py-1.5 text-xs"
                >
                  <span>{outcome.label}</span>
                  {outcome.latest_price && (
                    <span className="font-mono font-medium">
                      {(outcome.latest_price.price * 100).toFixed(0)}¢
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {marketUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            asChild
          >
            <a href={marketUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1.5" />
              View on {platformLabel}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
