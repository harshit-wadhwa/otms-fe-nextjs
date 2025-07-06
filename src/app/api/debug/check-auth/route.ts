import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    console.log('Checking authentication...');
    
    const userJwt = getCurrentUser(req);
    console.log('User JWT:', userJwt);
    
    if (!userJwt) {
      return NextResponse.json({
        authenticated: false,
        message: 'No valid authentication token found'
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: userJwt,
      message: 'User is authenticated'
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ 
      detail: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 