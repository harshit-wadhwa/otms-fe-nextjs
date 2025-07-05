import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  try {
    // Get all tests assigned to this student (via StudentTest records)
    const assignedTests = await prisma.studentTest.findMany({ 
      where: { user_id: userJwt.user_id },
      include: {
        test: true
      }
    });

    // Filter out tests that have already been submitted and are active
    const availableTests = assignedTests.filter(st => 
      st.status === 'pending' && 
      st.test.is_active && 
      (!st.answers || !Array.isArray(st.answers) || st.answers.length === 0)
    );

    console.log('Available tests debug:', {
      totalAssigned: assignedTests.length,
      availableCount: availableTests.length,
      assignedTests: assignedTests.map(st => ({
        testId: st.test_id,
        status: st.status,
        testName: st.test.name,
        isActive: st.test.is_active
      }))
    });

    if (availableTests.length === 0) {
      return NextResponse.json({ tests: [] });
    }

    // Get the test details for available tests
    const testDetails = await Promise.all(
      availableTests.map(async (studentTest) => {
        const test = studentTest.test;
        const questions = await prisma.testQuestion.findMany({ 
          where: { test_id: test.id } 
        });
        
        return {
          id: test.id,
          name: test.name,
          description: test.description || '',
          time: test.time,
          total_score: test.score,
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            score: q.score,
          })),
          created_at: test.created_at,
        };
      })
    );

    return NextResponse.json({ tests: testDetails });
  } catch (error) {
    console.error('Error fetching available tests:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
} 