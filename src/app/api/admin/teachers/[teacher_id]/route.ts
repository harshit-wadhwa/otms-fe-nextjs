import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teacher_id: string }> }
) {
  const userJwt = getCurrentUser(req);
  if (!userJwt || userJwt.role !== 'admin') {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const teacherId = Number(resolvedParams.teacher_id);

  try {
    // Check if teacher exists and is actually a teacher
    const teacher = await prisma.user.findFirst({
      where: { 
        id: teacherId, 
        role: 'teacher' 
      },
      include: {
        createdUsers: true,
        createdTests: true
      }
    });

    if (!teacher) {
      return NextResponse.json({ detail: 'Teacher not found' }, { status: 404 });
    }

    // Check if teacher has created students or tests
    if (teacher.createdUsers.length > 0 || teacher.createdTests.length > 0) {
      return NextResponse.json({ 
        detail: 'Cannot delete teacher. They have created students or tests. Please reassign or delete their data first.' 
      }, { status: 400 });
    }

    // Delete the teacher
    await prisma.user.delete({
      where: { id: teacherId }
    });

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
} 