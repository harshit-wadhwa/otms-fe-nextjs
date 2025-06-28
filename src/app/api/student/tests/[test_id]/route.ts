import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ test_id: string }> }
) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const { answers } = await req.json();
  const resolvedParams = await params;
  const test = await prisma.test.findFirst({ where: { id: Number(resolvedParams.test_id), is_active: true } });
  if (!test) return NextResponse.json({ detail: 'Test not found' }, { status: 404 });
  const questions = await prisma.testQuestion.findMany({ where: { test_id: test.id } });
  // Format answers
  const formattedAnswers = answers.map((a: { question_id: number; answer: string }) => ({ question_id: a.question_id, answer: a.answer }));
  // Check if StudentTest already exists
  let studentTest = await prisma.studentTest.findFirst({ where: { test_id: test.id, user_id: userJwt.user_id } });
  if (studentTest) {
    studentTest = await prisma.studentTest.update({
      where: { id: studentTest.id },
      data: { answers: formattedAnswers },
    });
    return NextResponse.json({ message: 'Answers updated successfully', test_id: studentTest.id });
  } else {
    // Calculate score
    let score = 0;
    for (const answer of formattedAnswers) {
      const question = questions.find((q: { id: number; answer: string; score: number }) => q.id === answer.question_id);
      if (question && question.answer === answer.answer) score += question.score;
    }
    const newStudentTest = await prisma.studentTest.create({
      data: {
        test_id: test.id,
        user_id: userJwt.user_id,
        score,
        status: 'submitted',
        answers: formattedAnswers,
      },
    });
    return NextResponse.json({ message: 'Test saved successfully', test_id: newStudentTest.id });
  }
} 