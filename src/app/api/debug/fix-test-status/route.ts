import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  try {
    // Get all student tests for this user
    const studentTests = await prisma.studentTest.findMany({
      where: { user_id: userJwt.user_id },
      include: {
        test: true
      }
    });

    // Check which tests have answers but wrong status
    const testsToFix = studentTests.filter(st => 
      st.answers && Array.isArray(st.answers) && st.answers.length > 0 && st.status === 'pending'
    );

    // Fix the status for tests that have answers but are still pending
    const fixedTests = [];
    for (const test of testsToFix) {
      await prisma.studentTest.update({
        where: { id: test.id },
        data: { status: 'submitted' }
      });
      fixedTests.push({
        testId: test.test_id,
        testName: test.test.name,
        oldStatus: 'pending',
        newStatus: 'submitted'
      });
    }

    return NextResponse.json({
      message: 'Test status check completed',
      totalTests: studentTests.length,
      testsToFix: testsToFix.length,
      fixedTests,
      allTests: studentTests.map(st => ({
        testId: st.test_id,
        testName: st.test.name,
        status: st.status,
        hasAnswers: st.answers && Array.isArray(st.answers) && st.answers.length > 0
      }))
    });
  } catch (error) {
    console.error('Error fixing test statuses:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
} 