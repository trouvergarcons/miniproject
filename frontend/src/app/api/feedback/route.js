import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateToken } from '@/lib/auth';

export async function POST(req) {
    const auth = await authenticateToken(req);
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const { checkId, isCorrect, comment } = await req.json();

        if (!checkId || typeof isCorrect !== 'boolean') {
            return NextResponse.json(
                { error: 'checkId and isCorrect (boolean) are required' },
                { status: 400 }
            );
        }

        const check = await prisma.verificationCheck.findUnique({
            where: { id: checkId }
        });

        if (!check) {
            return NextResponse.json({ error: 'Check not found' }, { status);
        }

        const feedback = await prisma.feedback.create({
            data: {
                checkId,
                userId: auth.user!.id,
                isCorrect,
                comment,
            }
        });

        return NextResponse.json({
            message: 'Feedback recorded',
            feedbackId: feedback.id
        }, { status);

    } catch (error) {
        console.error('Feedback error:', error);
        return NextResponse.json({ error: 'Failed to record feedback' }, { status);
    }
}
