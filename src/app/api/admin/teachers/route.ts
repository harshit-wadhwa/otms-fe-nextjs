import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  console.log('Admin teachers API called');
  
  const userJwt = getCurrentUser(req);
  console.log('User JWT:', userJwt);
  
  if (!userJwt || userJwt.role !== 'admin') {
    console.log('Unauthorized access attempt');
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching teachers from database...');
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        username: true,
        created_by: true,
        createdUsers: {
          select: {
            id: true,
            role: true
          }
        },
        createdTests: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    console.log('Raw teachers data:', teachers);

    // Format the response with additional statistics
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      phone: teacher.phone,
      username: teacher.username,
      created_by: teacher.created_by,
      student_count: teacher.createdUsers.filter(user => user.role === 'student').length,
      test_count: teacher.createdTests.length,
      full_name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.username || teacher.email
    }));

    console.log('Formatted teachers:', formattedTeachers);

    return NextResponse.json({ teachers: formattedTeachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
} 