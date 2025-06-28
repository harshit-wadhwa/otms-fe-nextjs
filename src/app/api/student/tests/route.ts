import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const studentTests = await prisma.studentTest.findMany({ where: { user_id: userJwt.user_id } });
  const testIds = studentTests.map((st: { test_id: number }) => st.test_id);
  if (!testIds.length) return NextResponse.json({ tests: [] });
  const tests = await prisma.test.findMany({ where: { id: { in: testIds }, is_active: true } });
  const testDetails = await Promise.all(tests.map(async (test: { id: number; name: string; description: string | null; time: number; score: number; created_at: Date }) => {
    const questions = await prisma.testQuestion.findMany({ where: { test_id: test.id } });
    return {
      id: test.id,
      name: test.name,
      description: test.description || '',
      time: test.time,
      total_score: test.score,
      questions: questions.map((q: { id: number; question: string; options: string[]; score: number }) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        score: q.score,
      })),
      created_at: test.created_at,
    };
  }));
  return NextResponse.json({ tests: testDetails });
} 