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
  
  // Format answers - handle both single and multiple answers
  const formattedAnswers = answers.map((a: { question_id: number; answer: string | string[] }) => ({ 
    question_id: a.question_id, 
    answer: Array.isArray(a.answer) ? a.answer : [a.answer] 
  }));
  
  // Check if StudentTest already exists
  let studentTest = await prisma.studentTest.findFirst({ where: { test_id: test.id, user_id: userJwt.user_id } });
  
  // Calculate score function
  const calculateScore = (answers: { question_id: number; answer: string[] }[]) => {
    let score = 0;
    for (const answer of answers) {
      const question = questions.find((q: { id: number; answer: string[]; score: number }) => q.id === answer.question_id);
      if (question) {
        // For multiple choice questions, check if all correct answers are selected and no incorrect ones
        const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
        const studentAnswers = answer.answer;
        
        // Check if arrays have the same elements (order doesn't matter)
        const isCorrect = correctAnswers.length === studentAnswers.length &&
          correctAnswers.every(ans => studentAnswers.includes(ans)) &&
          studentAnswers.every(ans => correctAnswers.includes(ans));
        
        if (isCorrect) score += question.score;
      }
    }
    return score;
  };
  
  if (studentTest) {
    const score = calculateScore(formattedAnswers);
    
    studentTest = await prisma.studentTest.update({
      where: { id: studentTest.id },
      data: { 
        answers: formattedAnswers,
        score,
        status: 'submitted'
      },
    });
    return NextResponse.json({ message: 'Test submitted successfully', test_id: studentTest.id });
  } else {
    const score = calculateScore(formattedAnswers);
    
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