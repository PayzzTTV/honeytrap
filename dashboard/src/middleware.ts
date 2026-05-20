import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple SOC Access Key protection for the dashboard
  // In a real app, use NextAuth or similar. This is for the 'Portfolio SOC' feel.
  const authCookie = request.cookies.get('soc_access_key');
  const { pathname } = request.nextUrl;

  if (pathname === '/' && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
