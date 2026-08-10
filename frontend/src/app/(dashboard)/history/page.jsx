'use client'

import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VerdictBadge, ConfidenceRing } from "@/components/Verdict"

import { formatDistanceToNow } from "date-fns"

import { HistoryIcon, Clock } from "lucide-react"
import { motion } from "framer-motion"

export default function HistoryPage() {

  const { data: history, isLoading, error } = useQuery({

    queryKey: ["history"],

    queryFn: async () => {
      const res = await fetch("/api/history")

      if (!res.ok) throw new Error("Failed to fetch history")

      return res.json()
    },

  })


  return (

    <div className="flex flex-col h-full space-y-8 max-w-5xl mx-auto">

      {/* Header */}

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/[0.06] flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-violet-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Scan History
          </h1>

          {/* <p className="text-sm text-muted-foreground">
            Your previously verified claims from chat, dashboard, and extension
          </p> */}
        </div>

      </div>


      {isLoading ? (

        <div className="flex flex-col items-center justify-center py-24 gap-4">

          <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading your scan history...
          </p>

        </div>

      ) : error ? (

        <div className="p-5 rounded-xl glass border border-red-500/20 text-red-400 text-sm">
          Unable to load history. Please try again later.
        </div>

      ) : history?.length === 0 ? (

        <div className="p-6 rounded-xl glass border border-white/[0.06] text-center text-muted-foreground">

          <p className="font-medium mb-1">
            No scans yet
          </p>

          {/* <p className="text-xs">
            Try the AI Verifier chat or the Chrome Extension to create your first scan.
          </p> */}

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">

          {history?.map((item, index) => {

            const glowClass =
              item.verdict === "TRUE"
                ? "verdict-glow-true"
                : item.verdict === "FALSE"
                ? "verdict-glow-false"
                : "verdict-glow-inconclusive"


            return (

              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >

                <Card className={`glass hover:bg-white/[0.02] transition-all duration-300 h-full flex flex-col ${glowClass}`}>

                  <CardHeader className="pb-3">

                    <div className="flex items-start justify-between gap-3">

                      <div className="space-y-2 flex-1 min-w-0">

                        <VerdictBadge
                          verdict={item.verdict}
                          confidence={item.confidence}
                        />

                        {/* ✅ FIXED TITLE */}
                        <CardTitle className="text-sm leading-snug line-clamp-2 break-all overflow-hidden text-foreground/90">
                          {item.content}
                        </CardTitle>

                      </div>

                      <ConfidenceRing
                        confidence={item.confidence}
                        verdict={item.verdict}
                        size={48}
                      />

                    </div>

                  </CardHeader>


                  <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">

                    {/* ✅ FIXED SUMMARY */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 break-words overflow-hidden">
                      {item.summary}
                    </p>

                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-auto">

                      <Clock className="w-3 h-3" />

                      {formatDistanceToNow(
                        new Date(item.createdAt),
                        { addSuffix: true }
                      )}

                    </span>

                  </CardContent>

                </Card>

              </motion.div>

            )
          })}

        </div>

      )}

    </div>

  )
}