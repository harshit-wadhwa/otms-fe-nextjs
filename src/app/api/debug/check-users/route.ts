import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        first_name: true,
        last_name: true,
        created_by: true
      },
      orderBy: { id: 'desc' }
    });

    console.log('Found users:', users);

    const userCounts = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      students: users.filter(u => u.role === 'student').length
    };

    return NextResponse.json({
      message: 'Users found in database',
      userCounts,
      users
    });
  } catch (error) {
    console.error('Error checking users:', error);
    return NextResponse.json({ 
      detail: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 