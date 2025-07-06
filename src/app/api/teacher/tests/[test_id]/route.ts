import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ test_id: string }> }
) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const resolvedParams = await params;
  const test = await prisma.test.findFirst({ where: { id: Number(resolvedParams.test_id), is_active: true } });
  if (!test) return NextResponse.json({ detail: 'Test not found' }, { status: 404 });
  const questions = await prisma.testQuestion.findMany({ where: { test_id: test.id } });
  return NextResponse.json({
    id: test.id,
    name: test.name,
    description: test.description,
    time: test.time,
    total_score: test.score,
    questions: questions.map((q: { id: number; question: string; options: string[]; question_type: string; score: number }) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      question_type: q.question_type,
      score: q.score,
    })),
  });
} 