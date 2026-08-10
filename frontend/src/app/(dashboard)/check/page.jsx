'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerdictDisplay } from '@/components/Verdict';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Link2,
} from 'lucide-react';

export default function QuickCheckPage() {
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [result, setResult] = useState(null);

  const verifyMutation = useMutation({
    mutationFn: async ({ content, url }) => {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content || `Analyze: ${url}`,
          source_url: url,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Verification failed');
      }

      return res.json();
    },

    onSuccess: (data) => {
      setResult(data);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (vars) => {
      return { success: true };
    },

    onSuccess: (_, vars) => {
      toast.success(
        vars.isCorrect
          ? 'Thanks! Marked.'
          : "Thanks! We'll review this verdict."
      );
    },
  });

  const handleCheck = () => {
    if (activeTab === 'text' && textInput.trim()) {
      verifyMutation.mutate({ content: textInput });
    } else if (activeTab === 'url' && urlInput.trim()) {
      verifyMutation.mutate({ url: urlInput });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/[0.06] flex items-center justify-center">
          <Search className="w-5 h-5 text-emerald-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quick Check</h1>
          {/* <p className="text-xs text-muted-foreground">
            Paste a claim or URL for instant AI-powered fact verification
          </p> */}
        </div>
      </div>

      {/* Input Card */}
      <Card className="glass border-white/[0.06] overflow-hidden">
        <CardContent className="p-5 space-y-4">

          <Tabs value={activeTab} onValueChange={setActiveTab}>

            <TabsList className="glass border border-white/[0.06] bg-transparent h-9">

              <TabsTrigger value="text" className="text-xs gap-1.5">
                <Sparkles className="w-3 h-3" />
                Claim Text
              </TabsTrigger>

              <TabsTrigger value="url" className="text-xs gap-1.5">
                <Link2 className="w-3 h-3" />
                URL / Link
              </TabsTrigger>

            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type or paste a claim to verify..."
                rows={4}
                className="bg-white/[0.02] border-white/[0.06] text-sm resize-none"
              />
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article..."
                className="bg-white/[0.02] border-white/[0.06] text-sm h-12"
              />
            </TabsContent>

          </Tabs>

          <Button
            onClick={handleCheck}
            disabled={
              verifyMutation.isPending ||
              (activeTab === 'text'
                ? !textInput.trim()
                : !urlInput.trim())
            }
            className="w-full h-11 btn-gradient text-white gap-2"
          >
            {verifyMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Verify Now
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Loading */}
      <AnimatePresence>
        {verifyMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-5 border border-white/[0.06]"
          >
            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  Searching the web for evidence...
                </p>

                <p className="text-[11px] text-muted-foreground/50">
                  Querying multiple sources and analyzing credibility
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !verifyMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >

            <VerdictDisplay
              verdict={result.verdict}
              confidence={result.confidence}
              summary={result.summary}
            />

            {result.sources?.length > 0 && (
              <Card className="glass border-white/[0.06]">
                <CardContent className="p-4 space-y-3">

                  <span className="text-xs text-muted-foreground">
                    Evidence Sources ({result.sources.length})
                  </span>

                  <div className="space-y-2">
                    {result.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-cyan-400">
                          {src.title || src.url}
                        </span>
                      </a>
                    ))}
                  </div>

                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  feedbackMutation.mutate({ isCorrect: true })
                }
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Correct
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  feedbackMutation.mutate({ isCorrect: false })
                }
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                Wrong
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}