import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ test_id: string }> }
) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const { student_ids } = await req.json();
  const resolvedParams = await params;
  const test = await prisma.test.findFirst({ where: { id: Number(resolvedParams.test_id), is_active: true } });
  if (!test) return NextResponse.json({ detail: 'Test not found' }, { status: 404 });
  const studentTests = await Promise.all(
    student_ids.map((student_id: number) =>
      prisma.studentTest.create({
        data: {
          test_id: test.id,
          user_id: student_id,
          status: 'pending',
        },
      })
    )
  );
  return NextResponse.json({ message: 'Test assigned successfully', student_tests: studentTests });
} 