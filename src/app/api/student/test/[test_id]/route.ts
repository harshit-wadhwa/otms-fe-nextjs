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
  const studentTest = await prisma.studentTest.findFirst({ where: { test_id: Number(resolvedParams.test_id), user_id: userJwt.user_id } });
  if (!studentTest) return NextResponse.json({ detail: 'Test not found' }, { status: 404 });
  return NextResponse.json({ test: studentTest });
} 