import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
  // Check if the user is trying to access /user-auth
  if (req.nextUrl.pathname === '/user-auth' && token) {
    // If token exists, redirect to the home page
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Check if the token does not exist and the user is trying to access a protected route
  if (!token && req.nextUrl.pathname !== '/user-auth') {
    return NextResponse.redirect(new URL('/user-auth', req.url));
  }

  // If no redirection is needed, proceed to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/user-auth', '/api/user/:path*'],
};
