import { NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { verifyClaim } from '@/lib/verify';
import { prisma } from '@/lib/prisma';

// CORS headers for extension requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers);
}

export async function POST(req) {
    const auth = await authenticateToken(req);
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status, headers);
    }

    try {
        const { url, content } = await req.json();

        if (!url && !content) {
            return NextResponse.json(
                { error: 'url or content is required' },
                { status, headers: corsHeaders }
            );
        }

        // Use provided content or create context from URL
        const claimContent = content || `Analyze page at: ${url}`;
        const result = await verifyClaim(claimContent, url);

        // Save to check history
        await prisma.verificationCheck.create({
            data: {
                content: claimContent.substring(0, 500),
                sourceUrl,
                verdict: result.verdict,
                confidence: result.confidence,
                summary: result.summary,
                sourcesJson: JSON.stringify(result.sources),
                toolsUsed: JSON.stringify(['web_search', 'page_analysis']),
                userId: auth.user!.id,
            }
        });

        return NextResponse.json({
            ...result,
            pageUrl,
            checkedAt: new Date().toISOString(),
        }, { headers);

    } catch (error) {
        console.error('Extension page check error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze page' },
            { status, headers: corsHeaders }
        );
    }
}
