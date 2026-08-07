import { NextResponse } from "next/server"
import { verifyClaim } from "@/lib/verify"
import { prisma } from "@/lib/prisma"

export async function POST(req) {

  try {

    // 1. Parse Request
    const body = await req.json()
    const { content, source_url, image } = body

    if (!content && !image) {
      return NextResponse.json(
        { error: "content or image field is required" },
        { status: 400 }
      )
    }

    // 2. AI Orchestration
    const result = await verifyClaim(
      content || "Analyze the provided image",
      source_url,
      image
    )

    // 3. Save to Database
    await prisma.verificationCheck.create({
      data: {
        content: content || "Image verification",
        sourceUrl: source_url || null,
        verdict: result.verdict,
        confidence: result.confidence,
        summary: result.summary,
        sourcesJson: JSON.stringify(result.sources || []),
      },
    })

    // 4. Return Result
    return NextResponse.json(result)

  } catch (error) {

    console.error("Verification error:", error)

    return NextResponse.json(
      { error: error.message || "Failed to verify claim" },
      { status: 500 }
    )

  }

}