import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  try {
    let scores;

    if (userJwt.role === 'teacher') {
      // Teachers can see scores for all students in their tests
      scores = await prisma.studentTest.findMany({
        where: {
          test: {
            created_by: userJwt.user_id
          }
        },
        include: {
          test: {
            select: {
              id: true,
              name: true,
              score: true,
              time: true,
              created_at: true
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
        },
        orderBy: [
          { test: { created_at: 'desc' } },
          { created_at: 'desc' }
        ]
      });
    } else if (userJwt.role === 'student') {
      // Students can only see their own scores
      scores = await prisma.studentTest.findMany({
        where: {
          user_id: userJwt.user_id
        },
        include: {
          test: {
            select: {
              id: true,
              name: true,
              score: true,
              time: true,
              created_at: true
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
        },
        orderBy: [
          { test: { created_at: 'desc' } },
          { created_at: 'desc' }
        ]
      });
    } else {
      return NextResponse.json({ detail: 'Access denied' }, { status: 403 });
    }

    // Format the response
    const formattedScores = scores.map(score => ({
      id: score.id,
      test_id: score.test_id,
      test_name: score.test.name,
      test_total_score: score.test.score,
      test_duration: score.test.time,
      test_created_at: score.test.created_at,
      student_id: score.user_id,
      student_name: `${score.user.first_name || ''} ${score.user.last_name || ''}`.trim() || score.user.username || score.user.email,
      student_email: score.user.email,
      score: score.score,
      status: score.status,
      percentage: score.test.score > 0 ? Math.round((score.score / score.test.score) * 100) : 0,
      submitted_at: score.created_at
    }));

    return NextResponse.json({ scores: formattedScores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
} 