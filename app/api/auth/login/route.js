import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req) {
  await dbConnect();
  try {
    const { username, password } = await req.json();
    const admin = await Admin.findOne({ username });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT Token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const token = await new SignJWT({ username: admin.username, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h') // Valid for the duration of the event
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 12, // 12 hours
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}