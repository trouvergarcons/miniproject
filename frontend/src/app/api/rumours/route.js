import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch latest rumours
    const rumours = await prisma.rumour.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit > 50 ? 50 : limit // cap at 50
    });

    // Parse sourcesJson
    const parsedRumours = rumours.map(r => ({
      ...r,
      sources: JSON.parse(r.sourcesJson)
    }));

    // Remove the raw json string from response
    parsedRumours.forEach(r => { delete r.sourcesJson });

    return NextResponse.json(parsedRumours);

  } catch (error) {
    console.error("Fetch rumours error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rumours" },
      { status: 500 }
    );
  }
}