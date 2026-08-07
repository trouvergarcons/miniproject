import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { geminiModel } from '@/lib/gemini';
import { authenticateToken } from '@/lib/auth';

export async function POST(req) {
    // 1. Authenticate Request
    const auth = await authenticateToken(req);
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const body = await req.json();
        const { audio, mimeType } = body;

        if (!audio) {
            return NextResponse.json({ error: "Audio data is required" }, { status);
        }

        // 2. Call Gemini for transcription
        const result = await generateText({
            model,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Transcribe this audio precisely. Return exactly what is spoken and nothing else. No formatting, no extra explanation.' },
                        { type: 'file', mimeType: mimeType || 'audio/webm', data: audio }
                    ]
                }
            ]
        });

        return NextResponse.json({ text: result.text.trim() });
    } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json({ error: error.message || "Failed to transcribe audio" }, { status);
    }
}
