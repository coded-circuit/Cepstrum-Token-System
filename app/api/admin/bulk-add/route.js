import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await dbConnect();
  try {
    const guests = await req.json();
    
    const formattedGuests = guests.map(g => ({
      name: g.Name || g.name,
      branch: g.Branch || g.branch,
      year: g.Year || g.year || '4th',
      rollNumber: g.RollNumber || g.rollNumber || `TEMP-${Date.now()}-${Math.random()}`,
      email: g.Email || g.email || `temp-${Date.now()}@example.com`,
      dateOfBirth: g.DateOfBirth || g.dateOfBirth || new Date('2000-01-01'),
      secretKey: crypto.randomBytes(16).toString('hex'),
      isDined: false,
      foodPreference: null
    }));

    await Guest.insertMany(formattedGuests);
    return NextResponse.json({ success: true, count: formattedGuests.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}