import { NextRequest, NextResponse } from 'next/server';

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://auth.nvix.io' 
    : 'http://localhost:3000');

export async function POST(request: NextRequest) {
  try {
    const { code, app } = await request.json();
    
    if (!code || !app) {
      return NextResponse.json(
        { error: 'Authorization code and app name are required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for JWT token with auth service
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        app,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Token exchange failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Set secure HTTP-only cookie for JWT token
    const res = NextResponse.json({ 
      token: data.token,
      user: data.user,
      success: true 
    });
    
    res.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
