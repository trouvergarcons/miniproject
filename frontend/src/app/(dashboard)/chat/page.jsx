'use client'

import { useState, useRef, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Send, Bot, User, ExternalLink, Globe, Paperclip, X } from "lucide-react"

import { VerdictBadge } from "@/components/Verdict"

import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"

const quickSuggestions = [
  "Is it true that NASA discovered a new planet this week?",
  "Check: 'AI will replace 80% of jobs by 2026'",
  "Verify this claim about climate change statistics",
]

export default function ChatCheckPage() {

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)

  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])


  const verifyMutation = useMutation({

    mutationFn: async (payload) => {

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Verification failed")
      }

      return res.json()
    },

    onSuccess: (data) => {

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.summary,
          result: data,
        },
      ])
    },

    onError: (error) => {

      toast.error(error.message)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `⚠ ${error.message}`,
        },
      ])
    },

  })


  const handleImageSelect = (e) => {

    const file = e.target.files[0]

    if (file) {

      const reader = new FileReader()

      reader.onload = (event) => {
        setSelectedImage(event.target.result)
      }

      reader.readAsDataURL(file)
    }
  }


  const removeImage = () => {

    setSelectedImage(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }


  const handleSend = (content) => {

    if ((!content.trim() && !selectedImage) || verifyMutation.isPending) return

    let imageData

    if (selectedImage) {

      const [header, base64] = selectedImage.split(",")

      const mimeType = header.split(":")[1].split(";")[0]

      imageData = { base64, mimeType }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: content || "Image",
        image: selectedImage,
      },
    ])

    verifyMutation.mutate({
      content,
      image: imageData,
    })

    setInput("")
    removeImage()
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend(input)
  }


  return (

    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">

      {/* 🔥 MAIN CONTAINER FIXED */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl 
      bg-gradient-to-b from-[oklch(0.16_0.02_260/0.9)] to-[oklch(0.12_0.02_260/0.9)] backdrop-blur-xl">

        {/* Header */}

        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">

          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-400" />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-sm">Veracity AI Verifier</h2>

            {/* <p className="text-[10px] text-muted-foreground/60">
              Web search · Evidence analysis 
            </p> */}
          </div>

          {/* <Badge variant="outline" className="text-[9px]">
            <Globe className="w-3 h-3" /> Live Sources
          </Badge> */}

        </div>


        {/* Messages */}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">

          {messages.length === 0 ? (

            <div className="text-center py-16">

              <Bot className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />

              <p className="text-sm text-muted-foreground mb-6">
                Paste a claim or rumor to verify
              </p>

              <div className="space-y-2">

                {quickSuggestions.map((s, i) => (

                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="block w-full text-left px-4 py-2 rounded-lg border border-white/[0.05] hover:bg-white/[0.05] text-xs"
                  >
                    {s}
                  </button>

                ))}

              </div>

            </div>

          ) : (

            <div className="space-y-5">

              <AnimatePresence>

                {messages.map((msg) => (

                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >

                    {msg.role === "assistant" && (
                      <Bot className="w-6 h-6 text-violet-400" />
                    )}

                    <div className="max-w-[80%] space-y-2">

                      {msg.image && (
                        <img
                          src={msg.image}
                          className="max-w-[200px] rounded-lg"
                        />
                      )}

                      <div className="px-4 py-2 rounded-xl text-sm border border-white/[0.06] bg-white/[0.03]">
                        {msg.content}
                      </div>

                      {msg.result && (

                        <Card className="bg-white/[0.03] border-white/[0.06]">

                          <CardContent className="p-4 space-y-3">

                            <VerdictBadge
                              verdict={msg.result.verdict}
                              confidence={msg.result.confidence}
                            />

                            <p className="text-sm text-muted-foreground">
                              {msg.result.summary}
                            </p>

                            {msg.result.sources?.map((src, i) => (

                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs text-cyan-400"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {src.title || src.url}
                              </a>

                            ))}

                          </CardContent>

                        </Card>

                      )}

                    </div>

                    {msg.role === "user" && (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}

                  </motion.div>

                ))}

              </AnimatePresence>

            </div>

          )}

        </div>


        {/* Input */}

        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">

          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img src={selectedImage} className="h-20 rounded-md" />

              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />

            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a claim..."
              className="flex-1 bg-white/[0.03] border-white/[0.06]"
            />

            <Button type="submit">
              <Send className="w-4 h-4" />
            </Button>

          </form>

        </div>

      </div>

    </div>
  )
}