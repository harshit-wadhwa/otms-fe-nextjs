import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signJwt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !comparePassword(password, user.password)) {
    return NextResponse.json({ detail: 'Invalid username or password' }, { status: 401 });
  }
  const token = signJwt({ user_id: user.id, role: user.role });
  return NextResponse.json({ message: 'Login successful', token, user });
} 