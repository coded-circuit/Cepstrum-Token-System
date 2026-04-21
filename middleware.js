import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('admin_token')?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login');

  if (req.nextUrl.pathname.startsWith('/admin') && !isAuthPage) {
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      // Token is invalid or expired
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  if (isAuthPage && token) {
    // Already logged in
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};