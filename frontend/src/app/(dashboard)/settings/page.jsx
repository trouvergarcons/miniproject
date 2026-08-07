'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { toast } from 'sonner';

import {
  Settings as SettingsIcon,
  Globe,
  Info
} from 'lucide-react';

import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const [rssEnabled, setRssEnabled] = useState(false);
  const [webEnabled, setWebEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [rssUrls, setRssUrls] = useState([
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', isDefault: true },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', isDefault: true },
    { url: 'http://rss.cnn.com/rss/edition_world.rss', isDefault: true }
  ]);

  const [newRssUrl, setNewRssUrl] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const savedRss = localStorage.getItem('verasity_rss_enabled');
    const savedWeb = localStorage.getItem('verasity_web_enabled');

    if (savedRss) setRssEnabled(savedRss === 'true');
    if (savedWeb) setWebEnabled(savedWeb === 'true');

    const savedUrls = localStorage.getItem('verasity_rss_urls');

    if (savedUrls) {
      try {
        const parsed = JSON.parse(savedUrls);
        const custom = parsed.map((u) => ({ url: u, isDefault: false }));

        setRssUrls([
          { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', isDefault: true },
          { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', isDefault: true },
          { url: 'http://rss.cnn.com/rss/edition_world.rss', isDefault: true },
          ...custom
        ]);
      } catch {}
    }
  }, []);

  const toggleChannel = (channel, current) => {
    const newVal = !current;

    if (channel === 'rss') {
      setRssEnabled(newVal);
      localStorage.setItem('verasity_rss_enabled', String(newVal));
      toast.success(`RSS Feeds ${newVal ? 'enabled' : 'disabled'}`);
    }

    if (channel === 'web') {
      setWebEnabled(newVal);
      localStorage.setItem('verasity_web_enabled', String(newVal));
      toast.success(`Web Search ${newVal ? 'enabled' : 'disabled'}`);
    }
  };

  const addRssUrl = () => {
    if (!newRssUrl.startsWith('http')) {
      toast.error('Enter a valid RSS URL');
      return;
    }

    const updated = [...rssUrls, { url: newRssUrl, isDefault: false }];
    setRssUrls(updated);

    localStorage.setItem(
      'verasity_rss_urls',
      JSON.stringify(updated.map((u) => u.url))
    );

    setNewRssUrl('');
    toast.success('RSS feed added');
  };

  const removeRssUrl = (url) => {
    const updated = rssUrls.filter((r) => r.url !== url);

    setRssUrls(updated);

    localStorage.setItem(
      'verasity_rss_urls',
      JSON.stringify(updated.map((u) => u.url))
    );

    toast.success('RSS feed removed');
  };

  const handleManualIngest = async () => {
    setIsRefreshing(true);

    const toastId = toast.loading('Fetching latest data...');

    try {
      const res = await fetch('/api/cron/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channels: [
            ...(rssEnabled ? ['rss'] : []),
            ...(webEnabled ? ['web'] : [])
          ],
          rssUrls: rssUrls.map((r) => r.url)
        })
      });

      const data = await res.json();

      toast.dismiss(toastId);

      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['rumours'] });
      } else {
        toast.error(data.error || 'Failed to ingest');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Ingestion failed');
    }

    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto pb-20">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-amber-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          {/* <p className="text-xs text-muted-foreground">
            Manage data sources
          </p> */}
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-3">

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Data Channels
          </h2>

          <Button
            onClick={handleManualIngest}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            {isRefreshing ? 'Fetching...' : 'Fetch Current Data'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Web Search</span>
          <Switch
            checked={webEnabled}
            onCheckedChange={() => toggleChannel('web', webEnabled)}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">RSS Feeds</span>
          <Switch
            checked={rssEnabled}
            onCheckedChange={() => toggleChannel('rss', rssEnabled)}
          />
        </div>

        {rssEnabled && (
          <div className="space-y-2">

            <div className="flex gap-2">
              <input
                value={newRssUrl}
                onChange={(e) => setNewRssUrl(e.target.value)}
                placeholder="https://site.com/rss"
                className="border rounded px-2 py-1 text-xs flex-1"
              />

              <Button size="sm" onClick={addRssUrl}>
                Add
              </Button>
            </div>

            {rssUrls.map((f) => (
              <div
                key={f.url}
                className="flex justify-between text-xs border rounded px-2 py-1"
              >
                <span className="truncate">{f.url}</span>

                {!f.isDefault && (
                  <button onClick={() => removeRssUrl(f.url)}>
                    Remove
                  </button>
                )}
              </div>
            ))}

          </div>
        )}
      </div>

      <Separator />

      {/* Privacy */}
      <Card className="glass">
        <CardContent className="p-4 flex gap-3">
          <Info className="w-4 h-4 text-cyan-400 mt-1" />
          <p className="text-xs text-muted-foreground">
            Veracity stores minimal metadata for claim verification history.
            Personal browsing data is never tracked.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}