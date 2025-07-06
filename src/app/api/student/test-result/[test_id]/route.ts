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
  const testId = Number(resolvedParams.test_id);

  try {
    // Get the student's test submission
    const studentTest = await prisma.studentTest.findFirst({
      where: { 
        test_id: testId, 
        user_id: userJwt.user_id,
        status: 'submitted'
      },
      include: {
        test: {
          include: {
            questions: true
          }
        },
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            username: true
          }
        }
      }
    });

    if (!studentTest) {
      return NextResponse.json({ detail: 'Test result not found' }, { status: 404 });
    }

    // Get student's answers
    const studentAnswers = studentTest.answers as Array<{ question_id: number; answer: string[] }> || [];

    // Create detailed result with question-by-question analysis
    const detailedResults = studentTest.test.questions.map(question => {
      const studentAnswer = studentAnswers.find(sa => sa.question_id === question.id);
      const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
      const studentAnswerArray = studentAnswer?.answer || [];
      
      // Check if arrays have the same elements (order doesn't matter)
      const isCorrect = correctAnswers.length === studentAnswerArray.length &&
        correctAnswers.every(ans => studentAnswerArray.includes(ans)) &&
        studentAnswerArray.every(ans => correctAnswers.includes(ans));
      
      const earnedScore = isCorrect ? question.score : 0;

      return {
        question_id: question.id,
        question: question.question,
        options: question.options,
        correct_answer: correctAnswers,
        student_answer: studentAnswerArray,
        is_correct: isCorrect,
        score: question.score,
        earned_score: earnedScore
      };
    });

    const result = {
      test_id: studentTest.test_id,
      test_name: studentTest.test.name,
      test_description: studentTest.test.description,
      test_total_score: studentTest.test.score,
      test_duration: studentTest.test.time,
      student_id: studentTest.user_id,
      student_name: `${studentTest.user.first_name || ''} ${studentTest.user.last_name || ''}`.trim() || studentTest.user.username || studentTest.user.email,
      student_email: studentTest.user.email,
      total_score: studentTest.score,
      percentage: studentTest.test.score > 0 ? Math.round((studentTest.score / studentTest.test.score) * 100) : 0,
      submitted_at: studentTest.created_at,
      questions: detailedResults
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching test result:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
} 