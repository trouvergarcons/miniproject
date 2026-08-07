'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfidenceRing, VerdictBadge } from '@/components/Verdict';
import { StatsBar, StatItem } from '@/components/StatsBar';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
// import { GlowingContainer } from '@/components/ui/glowing-container';

import {
  ExternalLink,
  ShieldAlert,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  RefreshCw
} from 'lucide-react';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function RumoursFeed() {

  const [verdictFilter, setVerdictFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: rumours = [], isLoading, error, refetch } = useQuery({
    queryKey: ['rumours'],
    queryFn: async () => {
      const res = await fetch('/api/rumours');
      if (!res.ok) throw new Error('Failed to fetch rumours');
      return res.json();
    },
    refetchInterval: 60000
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading("Fetching fresh claims...");

    const rssEnabled = localStorage.getItem('verasity_rss_enabled') === 'true';
    const webEnabled = localStorage.getItem('verasity_web_enabled') !== 'false';

    let customRssUrls = [];

    try {
      const storedRss = localStorage.getItem('verasity_rss_urls');
      if (storedRss) {
        customRssUrls = JSON.parse(storedRss);
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/cron/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: [
            ...(rssEnabled ? ['rss'] : []),
            ...(webEnabled ? ['web'] : [])
          ],
          rssUrls: customRssUrls
        })
      });

      const data = await res.json();

      toast.dismiss(toastId);

      if (data.success) {
        toast.success(data.message);
        refetch();
      } else {
        toast.error(data.error || "Failed to ingest claims");
      }

    } catch (e) {
      toast.dismiss(toastId);
      toast.error("An error occurred during refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredRumours = useMemo(() => {
    let filtered = rumours;

    if (verdictFilter !== 'all') {
      filtered = filtered.filter(r => r.verdict === verdictFilter);
    }

    if (sortBy === 'confidence') {
      filtered = [...filtered].sort((a, b) => b.confidence - a.confidence);
    }

    return filtered;
  }, [rumours, verdictFilter, sortBy]);

  const stats = useMemo(() => {
    return {
      total: rumours.length,
      trueCount: rumours.filter(r => r.verdict === 'TRUE').length,
      falseCount: rumours.filter(r => r.verdict === 'FALSE').length,
      inconclusiveCount: rumours.filter(r => r.verdict === 'INCONCLUSIVE').length
    };
  }, [rumours]);

  return (
    <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/[0.06] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trending Claims</h1>
            {/* <p className="text-xs text-muted-foreground">
              Real-time claims from the web, verified by Veracity AI
            </p> */}
          </div>

        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="h-9 hidden sm:flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs font-medium">
            {isRefreshing ? 'Fetching...' : 'Refresh Feed'}
          </span>
        </Button>

      </div>

      {!isLoading && rumours.length > 0 && (
        <StatsBar>
          <StatItem label="Total" value={stats.total} icon={BarChart3} color="text-cyan-400" />
          <StatItem label="True" value={stats.trueCount} icon={ShieldCheck} color="text-emerald-400" />
          <StatItem label="False" value={stats.falseCount} icon={ShieldAlert} color="text-red-400" />
          <StatItem label="Inconclusive" value={stats.inconclusiveCount} icon={AlertTriangle} color="text-amber-400" />
        </StatsBar>
      )}

      <div className="space-y-3 pb-20">

        {filteredRumours.map((rumour, index) => {
          const borderColor =
            rumour.verdict === 'TRUE'
              ? 'border-l-emerald-500/50'
              : rumour.verdict === 'FALSE'
              ? 'border-l-red-500/50'
              : 'border-l-amber-500/50';

          return (
            <motion.div
              key={rumour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >

              {/* <GlowingContainer> */}

                <Card className={`border-l-[3px] ${borderColor}`}>

                  <CardHeader>

                    <CardTitle>{rumour.headline}</CardTitle>

                    <div className="flex items-center gap-3">

                      <VerdictBadge
                        verdict={rumour.verdict}
                        confidence={rumour.confidence}
                      />

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(
                          new Date(rumour.createdAt),
                          { addSuffix: true }
                        )}
                      </span>

                    </div>

                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {rumour.summary}
                    </p>
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2">
                    {rumour.sources?.slice(0, 3).map((source, i) => (
                      <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-400 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {source.title}
                      </a>
                    ))}
                  </CardFooter>

                </Card>

              {/* </GlowingContainer> */}

            </motion.div>
          );
        })}

      </div>

    </div>
  );
}