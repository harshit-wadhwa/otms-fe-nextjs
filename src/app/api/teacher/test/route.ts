import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const { name, description, questions, time } = await req.json();
  const score = questions.reduce((sum: number, q: { score: number }) => sum + q.score, 0);
  const test = await prisma.test.create({
    data: {
      name,
      description,
      time,
      score,
      teacher_id: userJwt.user_id,
      created_by: userJwt.user_id,
      is_active: true,
    },
  });
  for (const q of questions as { question: string; options: string[]; answer: string; score: number }[]) {
    await prisma.testQuestion.create({
      data: {
        test_id: test.id,
        question: q.question,
        options: q.options,
        answer: q.answer,
        score: q.score,
      },
    });
  }
  return NextResponse.json({ message: 'Test created successfully', test_id: test.id });
} 