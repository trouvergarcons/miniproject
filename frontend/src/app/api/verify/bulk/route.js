import { NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { verifyClaim } from '@/lib/verify';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
    const auth = await authenticateToken(req);
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const { items } = await req.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'items array is required and must not be empty' },
                { status: 400 }
            );
        }

        if (items.length > 10) {
            return NextResponse.json(
                { error: 'Maximum 10 items per bulk request' },
                { status: 400 }
            );
        }

        const results = [];

        for (const item of items) {
            const content = item.content || item.url || '';
            if (!content) {
                results.push({ error: 'Missing content or url', item });
                continue;
            }

            try {
                const result = await verifyClaim(content, item.url);

                // Save each to history
                await prisma.verificationCheck.create({
                    data: {
                        content: content.substring(0, 500),
                        sourceUrl: item.url || null,
                        verdict: result.verdict,
                        confidence: result.confidence,
                        summary: result.summary,
                        sourcesJson: JSON.stringify(result.sources),
                        toolsUsed: JSON.stringify(['web_search']),
                        userId: auth.user!.id,
                    }
                });

                results.push({ ...result, originalContent: content.substring(0, 100) });
            } catch (err) {
                results.push({ error: err.message, originalContent: content.substring(0, 100) });
            }
        }

        return NextResponse.json({ results, total: results.length });

    } catch (error) {
        console.error('Bulk verify error:', error);
        return NextResponse.json({ error: 'Failed to process bulk request' }, { status);
    }
}
