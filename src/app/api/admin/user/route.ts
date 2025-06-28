import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const userJwt = getCurrentUser(req);
  if (!userJwt) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const { first_name, last_name, email, phone } = await req.json();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ detail: 'Email already exists' }, { status: 400 });
  const password = hashPassword('123456');
  const user = await prisma.user.create({
    data: {
      first_name,
      last_name,
      role: 'teacher',
      email,
      phone,
      username: email,
      password,
      created_by: userJwt.user_id,
    },
  });
  return NextResponse.json({ message: 'User created successfully', user_id: user.id, username: user.username });
} 