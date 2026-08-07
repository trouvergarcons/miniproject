import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const verdictFilter = searchParams.get('verdict') || '';

    let history = await prisma.verificationCheck.findMany({
      where: {
        ...(verdictFilter ? { verdict: verdictFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Search filter
    if (search) {
      history = history.filter(
        (h) =>
          h.content.toLowerCase().includes(search.toLowerCase()) ||
          h.summary.toLowerCase().includes(search.toLowerCase())
      );
    }

    const parsedHistory = history.map((h) => ({
      ...h,
      sources: safeParse(h.sourcesJson),
      toolsUsed: safeParse(h.toolsUsed),
    }));

    parsedHistory.forEach((h) => {
      delete h.sourcesJson;
    });

    return NextResponse.json(parsedHistory);
  } catch (error) {
    console.error('Fetch history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req) {
  try {
    const { checkId, deleteAll } = await req.json();

    if (deleteAll) {
      await prisma.verificationCheck.deleteMany();
      return NextResponse.json({ message: 'All history cleared' });
    }

    if (!checkId) {
      return NextResponse.json(
        { error: 'checkId or deleteAll is required' },
        { status: 400 }
      );
    }

    const check = await prisma.verificationCheck.findUnique({
      where: { id: checkId },
    });

    if (!check) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      );
    }

    await prisma.verificationCheck.delete({
      where: { id: checkId },
    });

    return NextResponse.json({ message: 'Check deleted' });
  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.json(
      { error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}

// Safe JSON parser
function safeParse(data) {
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}